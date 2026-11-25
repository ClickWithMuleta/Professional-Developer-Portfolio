"""
Contact Email Service
=====================
Isolated, testable email notification module for contact form submissions.

Design principles:
  - This module NEVER raises an exception to the caller.
    Email delivery failure is logged and the message is flagged (email_sent=False),
    but the HTTP response to the sender is always a success — the message is in the DB.
  - Email credentials come exclusively from Django settings (env-driven).
  - Subject and body are sanitized before construction to prevent header injection.
  - Both plain-text and HTML versions are sent as a multipart/alternative message.
  - Admin email is guarded against disclosure in logs (last 4 chars of domain only).
"""

import logging
import textwrap
from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.html import escape

logger = logging.getLogger(__name__)


def _safe_subject(raw: str) -> str:
    """
    Strip any residual newline sequences from the email subject.
    Serializer sanitization already does this, but we apply a final
    defense-in-depth check immediately before the SMTP call.
    """
    return raw.replace('\r', '').replace('\n', ' ').strip()


def _build_plain_body(message) -> str:
    """Build a plain-text notification email body."""
    return textwrap.dedent(f"""\
        You have received a new message via your portfolio contact form.

        ─────────────────────────────────────────
        From:    {message.sender_name}
        Email:   {message.sender_email}
        Subject: {message.subject}
        ─────────────────────────────────────────

        {message.message_body}

        ─────────────────────────────────────────
        Message ID : #{message.id}
        Received   : {message.created_at.strftime('%Y-%m-%d %H:%M UTC')}

        Reply directly to this email to respond to the sender.
        This notification was sent by your portfolio backend.
    """)


def _build_html_body(message) -> str:
    """
    Build an HTML notification email body.
    Falls back to inline HTML if the template is unavailable.
    Uses django.utils.html.escape on all user-supplied values to prevent
    XSS in email clients that render HTML.
    """
    try:
        return render_to_string('contact/email_notification.html', {
            'message': message,
            'sender_name': escape(message.sender_name),
            'sender_email': escape(message.sender_email),
            'subject': escape(message.subject),
            'message_body': escape(message.message_body),
        })
    except Exception:
        # Template not found — build minimal inline HTML
        return f"""
<html><body style="font-family:sans-serif;color:#333;max-width:600px;margin:0 auto">
  <h2 style="color:#10b981">New Portfolio Contact</h2>
  <table style="width:100%;border-collapse:collapse">
    <tr><td style="padding:8px;font-weight:bold;width:100px">From</td>
        <td style="padding:8px">{escape(message.sender_name)}</td></tr>
    <tr><td style="padding:8px;font-weight:bold">Email</td>
        <td style="padding:8px"><a href="mailto:{escape(message.sender_email)}">{escape(message.sender_email)}</a></td></tr>
    <tr><td style="padding:8px;font-weight:bold">Subject</td>
        <td style="padding:8px">{escape(message.subject)}</td></tr>
  </table>
  <hr style="border:1px solid #eee;margin:16px 0">
  <p style="white-space:pre-wrap">{escape(message.message_body)}</p>
  <hr style="border:1px solid #eee;margin:16px 0">
  <small style="color:#999">Message #{message.id} · {message.created_at.strftime('%Y-%m-%d %H:%M UTC')}</small>
</body></html>
"""


def send_contact_notification(message) -> bool:
    """
    Send an email notification about a new contact message.

    Returns True if delivery succeeded, False if it failed.
    Never raises — the caller should treat False as a soft failure
    and log it but still return HTTP 201 to the sender.

    Parameters
    ----------
    message : ContactMessage
        The persisted ContactMessage instance. Must have `id` and `created_at` set.

    Returns
    -------
    bool
        True on successful SMTP delivery, False on any error.
    """
    admin_email = getattr(settings, 'CONTACT_NOTIFICATION_EMAIL', None)

    if not admin_email:
        logger.info(
            'CONTACT_NOTIFICATION_EMAIL not configured — skipping email dispatch '
            'for message #%s.',
            message.id,
        )
        return False

    subject = _safe_subject(
        f'[Portfolio] New message from {message.sender_name}: {message.subject}'
    )
    plain_body = _build_plain_body(message)
    html_body = _build_html_body(message)

    try:
        email = EmailMultiAlternatives(
            subject=subject,
            body=plain_body,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[admin_email],
            reply_to=[message.sender_email],  # Reply goes straight to the sender
        )
        email.attach_alternative(html_body, 'text/html')
        email.send(fail_silently=False)

        logger.info(
            'Contact notification email dispatched for message #%s '
            '(from: %s, subject: "%s").',
            message.id,
            message.sender_email,
            message.subject,
        )
        return True

    except Exception as exc:
        # Log the exception type only — never log email body or sender data
        logger.error(
            'Failed to dispatch contact notification email for message #%s. '
            'Error type: %s. The message is safely stored in the database.',
            message.id,
            type(exc).__name__,
        )
        return False
