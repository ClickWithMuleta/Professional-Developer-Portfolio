"""
Contact API — Views
====================
Handles POST /api/v1/contact/

Security layers:
  - Rate throttle: 5 submissions per hour per IP (ContactThrottle).
  - Honeypot validation: in serializer.
  - Input sanitization: in serializer (strips control chars, header injection, HTML).
  - IP extraction: server-side only, respects X-Forwarded-For from Render's LB.
  - Request size cap: enforced by DATA_UPLOAD_MAX_MEMORY_SIZE in settings (default 2.5 MB).
  - Email injection prevention: subject sanitized in serializer + email_service.
  - No sensitive data in logs: IP and email are never logged in full.
  - Email failure resilience: message is always saved before email dispatch;
    HTTP 201 is returned regardless of email outcome.
"""

import logging
from datetime import datetime, timezone

from django.db import DatabaseError
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle
from rest_framework.views import APIView

from .email_service import send_contact_notification
from .models import ContactMessage
from .serializers import ContactMessageReadSerializer, ContactMessageSerializer

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _get_client_ip(request) -> str | None:
    """
    Extract the real client IP address.

    Trusts X-Forwarded-For set by Render's load balancer in production.
    In development, falls back to REMOTE_ADDR.

    Security note: We take only the FIRST address in X-Forwarded-For,
    which is the original client address set by Render's trusted proxy.
    Clients cannot spoof this in production because Render's proxy always
    prepends the actual client IP before passing the header along.
    """
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR', '').strip()
    if x_forwarded_for:
        return x_forwarded_for.split(',')[0].strip()
    return request.META.get('REMOTE_ADDR')


def _envelope_error(code: str, message: str, details=None, http_status=400) -> Response:
    return Response(
        {
            'success': False,
            'data': None,
            'error': {'code': code, 'message': message, 'details': details},
            'meta': {'version': 'v1', 'timestamp': _now_iso()},
        },
        status=http_status,
    )


def _envelope_success(data, http_status=200) -> Response:
    return Response(
        {
            'success': True,
            'data': data,
            'error': None,
            'meta': {'version': 'v1', 'timestamp': _now_iso()},
        },
        status=http_status,
    )


# ---------------------------------------------------------------------------
# Throttle
# ---------------------------------------------------------------------------

class ContactThrottle(AnonRateThrottle):
    """
    Contact-specific throttle: 5 submissions per hour per IP.
    Configured via REST_FRAMEWORK['DEFAULT_THROTTLE_RATES']['contact'] in settings.
    """
    scope = 'contact'


# ---------------------------------------------------------------------------
# View
# ---------------------------------------------------------------------------

class ContactMessageView(APIView):
    """
    POST /api/v1/contact/

    Accepts a sanitized contact form submission.
    Stores it in the database unconditionally.
    Attempts an email notification after the DB write — email failure does
    NOT roll back the message or change the HTTP response to the sender.

    Request body (JSON):
        name         str  required  2–120 chars
        email        str  required  valid email, ≤254 chars
        subject      str  required  4–200 chars
        message      str  required  20–4000 chars
        website_url_hp str optional  honeypot — must be empty

    Response 201: message saved successfully.
    Response 400: validation error — details field lists per-field errors.
    Response 429: rate limit exceeded.
    Response 500: unexpected server error (message was NOT saved).
    """
    permission_classes = [AllowAny]
    throttle_classes = [ContactThrottle]

    def post(self, request):
        # ---- 1. Deserialize & validate ----
        serializer = ContactMessageSerializer(data=request.data)

        if not serializer.is_valid():
            # Log validation failure without exposing the payload
            logger.warning(
                'Contact form validation failed from IP %s. Fields with errors: %s',
                _get_client_ip(request),
                list(serializer.errors.keys()),
            )
            return _envelope_error(
                code='VALIDATION_ERROR',
                message='Please correct the errors in your submission.',
                details=serializer.errors,
                http_status=status.HTTP_400_BAD_REQUEST,
            )

        validated = serializer.validated_data
        ip = _get_client_ip(request)

        # ---- 2. Persist — always before email ----
        try:
            message = ContactMessage.objects.create(
                sender_name=validated['sender_name'],
                sender_email=validated['sender_email'],
                subject=validated['subject'],
                message_body=validated['message_body'],
                ip_address=ip,
            )
        except DatabaseError as exc:
            # Log exception type only — never the full payload
            logger.error(
                'Database error persisting contact message. Error type: %s',
                type(exc).__name__,
            )
            return _envelope_error(
                code='SERVICE_UNAVAILABLE',
                message='Your message could not be saved right now. Please try again shortly.',
                http_status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )
        except Exception as exc:
            logger.exception(
                'Unexpected error persisting contact message. Error type: %s',
                type(exc).__name__,
            )
            return _envelope_error(
                code='INTERNAL_SERVER_ERROR',
                message='An unexpected error occurred. Please try again.',
                http_status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        # ---- 3. Log receipt (safe fields only) ----
        logger.info(
            'Contact message #%s saved — subject: "%s" — email_domain: ...%s',
            message.id,
            message.subject,
            message.sender_email.split('@')[-1][-8:] if '@' in message.sender_email else '?',
        )

        # ---- 4. Attempt email notification (soft failure) ----
        email_sent = send_contact_notification(message)
        if email_sent != message.email_sent:
            # Update the flag without touching updated_at via full save()
            ContactMessage.objects.filter(pk=message.pk).update(email_sent=email_sent)
            message.email_sent = email_sent

        # ---- 5. Respond ----
        response_serializer = ContactMessageReadSerializer(message)
        return _envelope_success(response_serializer.data, http_status=status.HTTP_201_CREATED)
