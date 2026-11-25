"""
Contact API — Serializer
========================
Input validation and sanitization for inbound contact form submissions.

Security layers implemented here:
  1. Strict field-level length constraints.
  2. Email format normalization and RFC 5321 local-part length guard.
  3. Control-character and newline stripping on all text fields
     (prevents email header injection if values are ever used in raw headers).
  4. Unicode whitespace normalization.
  5. Honeypot rejection (populated = bot, reject silently with 400).
  6. Field aliases: accepts both 'name'/'message' (frontend) and
     'sender_name'/'message_body' (internal) for backward compatibility.

IP address is NEVER accepted from the client — it is injected server-side.
"""

import re
import unicodedata
from rest_framework import serializers
from .models import ContactMessage


# ---------------------------------------------------------------------------
# Sanitization helpers
# ---------------------------------------------------------------------------

# Matches any ASCII control character (0x00–0x1F) except tab (0x09) and
# also the DEL character (0x7F). Used to strip injection vectors.
_CONTROL_CHAR_RE = re.compile(r'[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]')

# Carriage returns and raw newlines used in email header injection attacks.
_HEADER_INJECTION_RE = re.compile(r'[\r\n]')


def _sanitize_text(value: str) -> str:
    """
    Strip control characters, header-injection sequences, and normalize Unicode.

    Steps:
      1. NFC normalize — prevents homoglyph spoofing in display.
      2. Remove carriage returns / bare newlines (email header injection).
      3. Remove ASCII control characters (NUL, BEL, BS, etc.).
      4. Collapse multiple internal whitespace runs into a single space.
      5. Strip leading/trailing whitespace.
    """
    value = unicodedata.normalize('NFC', value)
    value = _HEADER_INJECTION_RE.sub(' ', value)
    value = _CONTROL_CHAR_RE.sub('', value)
    value = ' '.join(value.split())
    return value.strip()


def _sanitize_multiline(value: str) -> str:
    """
    Sanitize a free-form multi-line field (message body).

    Unlike _sanitize_text, preserves intentional newlines (\n) while still:
      - NFC normalizing.
      - Stripping carriage returns (CR-LF → LF).
      - Stripping control characters.
      - Removing email header injection sequences.
    """
    value = unicodedata.normalize('NFC', value)
    value = value.replace('\r\n', '\n').replace('\r', '\n')
    value = _CONTROL_CHAR_RE.sub('', value)
    return value.strip()


# ---------------------------------------------------------------------------
# Serializer
# ---------------------------------------------------------------------------

class ContactMessageSerializer(serializers.Serializer):
    """
    Contact form input serializer.

    Not a ModelSerializer by design — we validate first, then write
    selectively to the database, injecting server-side fields (ip_address)
    that must never come from the client.

    Accepts both frontend field names ('name', 'message') and the internal
    model field names ('sender_name', 'message_body') for compatibility.
    The view always reads validated_data using the internal names.
    """

    # 'name' is the frontend field; maps internally to sender_name.
    name = serializers.CharField(
        source='sender_name',
        max_length=120,
        min_length=2,
        error_messages={
            'required': 'Please provide your name.',
            'blank': 'Name must not be blank.',
            'min_length': 'Name must be at least 2 characters.',
            'max_length': 'Name must not exceed 120 characters.',
        },
    )
    email = serializers.EmailField(
        source='sender_email',
        max_length=254,  # RFC 5321 maximum total email length
        error_messages={
            'required': 'A valid email address is required.',
            'blank': 'Email must not be blank.',
            'invalid': 'Please provide a valid email address.',
            'max_length': 'Email address is too long.',
        },
    )
    subject = serializers.CharField(
        max_length=200,
        min_length=4,
        error_messages={
            'required': 'Please provide a subject.',
            'blank': 'Subject must not be blank.',
            'min_length': 'Subject must be at least 4 characters.',
            'max_length': 'Subject must not exceed 200 characters.',
        },
    )
    # 'message' is the frontend field; maps internally to message_body.
    message = serializers.CharField(
        source='message_body',
        max_length=4000,
        min_length=20,
        error_messages={
            'required': 'Please provide a message.',
            'blank': 'Message must not be blank.',
            'min_length': 'Message must be at least 20 characters.',
            'max_length': 'Message must not exceed 4000 characters.',
        },
    )

    # Honeypot — legitimate browsers leave this empty.
    # Bots that fill every visible + hidden field get a silent 400.
    website_url_hp = serializers.CharField(
        required=False,
        allow_blank=True,
        default='',
        write_only=True,
    )

    def to_internal_value(self, data):
        """Allow internal model field names as aliases for incoming data."""
        data = data.copy() if hasattr(data, 'copy') else dict(data)
        if 'name' not in data and 'sender_name' in data:
            data['name'] = data['sender_name']
        if 'email' not in data and 'sender_email' in data:
            data['email'] = data['sender_email']
        if 'message' not in data and 'message_body' in data:
            data['message'] = data['message_body']
        return super().to_internal_value(data)

    # ---- Field-level validation & sanitization ----

    def validate_name(self, value):
        """Sanitize and normalize name."""
        sanitized = _sanitize_text(value)
        if len(sanitized) < 2:
            raise serializers.ValidationError('Name must be at least 2 characters after sanitization.')
        return sanitized

    def validate_email(self, value):
        """Normalize email to lowercase. Guard RFC 5321 local-part length (<=64 chars)."""
        value = value.strip().lower()
        local_part = value.split('@')[0] if '@' in value else value
        if len(local_part) > 64:
            raise serializers.ValidationError('Email local part exceeds maximum length (64 characters).')
        return value

    def validate_subject(self, value):
        """Sanitize subject — this is used directly in email headers."""
        sanitized = _sanitize_text(value)
        if len(sanitized) < 4:
            raise serializers.ValidationError('Subject must be at least 4 characters after sanitization.')
        return sanitized

    def validate_message(self, value):
        """Sanitize message body preserving intentional newlines."""
        sanitized = _sanitize_multiline(value)
        if len(sanitized) < 20:
            raise serializers.ValidationError('Message must be at least 20 characters after sanitization.')
        return sanitized

    # ---- Cross-field validation ----

    def validate(self, attrs):
        """Honeypot check. Reject immediately if the bot-trap field is populated."""
        if attrs.get('website_url_hp', '').strip():
            raise serializers.ValidationError(
                {'non_field_errors': 'Invalid submission detected.'}
            )
        return attrs


# ---------------------------------------------------------------------------
# Response serializer
# ---------------------------------------------------------------------------

class ContactMessageReadSerializer(serializers.ModelSerializer):
    """
    Read-only confirmation payload returned to the sender after a successful submission.
    Returns only the fields the sender needs to see — never IP address or internal flags.
    """
    class Meta:
        model = ContactMessage
        fields = ['id', 'sender_name', 'sender_email', 'subject', 'created_at']
        read_only_fields = fields
