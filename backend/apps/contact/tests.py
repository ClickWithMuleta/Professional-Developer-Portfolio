"""
Phase 5.4 - Contact API Test Suite
====================================
Tests for the secure contact form endpoint: POST /api/v1/contact/

Run:
    backend\\venv\\Scripts\\python.exe backend\\manage.py test apps.contact --settings=core_project.settings.development -v 2
"""

from unittest.mock import patch

from django.core.cache import cache
from django.test import TestCase, override_settings

from apps.contact.models import ContactMessage
from apps.contact.email_service import send_contact_notification

CONTACT_URL = '/api/v1/contact/'

VALID_PAYLOAD = {
    'name': 'Jane Smith',
    'email': 'jane@example.com',
    'subject': 'Portfolio inquiry',
    'message': (
        'Hello Muleta, I would love to discuss a backend engineering role. '
        'Your portfolio looks great and I think you would be a good fit.'
    ),
    'website_url_hp': '',
}


# ---------------------------------------------------------------------------
# Base: disables throttling and clears cache between tests
# ---------------------------------------------------------------------------

class ContactTestBase(TestCase):
    """
    Base class for all contact view tests.

    Patches throttle_classes to [] on ContactMessageView so the 5/hour limit
    does not leak across the many POST calls in the full test suite.
    ThrottleConfigTests verifies the throttle wiring without POST calls.
    """

    def setUp(self):
        super().setUp()
        cache.clear()
        patcher = patch('apps.contact.views.ContactMessageView.throttle_classes', [])
        patcher.start()
        self.addCleanup(patcher.stop)


def _post(client, payload=None, **kwargs):
    data = {**VALID_PAYLOAD, **(payload or {})}
    return client.post(
        CONTACT_URL,
        data=data,
        content_type='application/json',
        HTTP_HOST='testserver',
        **kwargs,
    )


# ---------------------------------------------------------------------------
# 1. Happy path
# ---------------------------------------------------------------------------

class ContactSubmissionTests(ContactTestBase):

    def test_valid_submission_returns_201(self):
        resp = _post(self.client)
        self.assertEqual(resp.status_code, 201, resp.json())

    def test_valid_submission_saves_to_db(self):
        _post(self.client)
        self.assertEqual(ContactMessage.objects.count(), 1)
        msg = ContactMessage.objects.first()
        self.assertEqual(msg.sender_name, 'Jane Smith')
        self.assertEqual(msg.sender_email, 'jane@example.com')
        self.assertEqual(msg.subject, 'Portfolio inquiry')

    def test_response_envelope_success_true(self):
        body = _post(self.client).json()
        self.assertTrue(body['success'])
        self.assertIsNone(body['error'])

    def test_response_meta_has_version(self):
        body = _post(self.client).json()
        self.assertEqual(body['meta']['version'], 'v1')

    def test_response_data_has_expected_fields(self):
        data = _post(self.client).json()['data']
        for field in ('id', 'sender_name', 'sender_email', 'subject', 'created_at'):
            self.assertIn(field, data)

    def test_response_data_excludes_ip_address(self):
        data = _post(self.client).json()['data']
        self.assertNotIn('ip_address', data)

    def test_frontend_field_names_accepted(self):
        resp = _post(self.client, {
            'name': 'Field Alias',
            'message': 'Testing that the frontend field names are accepted by the backend serializer.',
        })
        self.assertEqual(resp.status_code, 201)
        self.assertEqual(ContactMessage.objects.first().sender_name, 'Field Alias')


# ---------------------------------------------------------------------------
# 2. Email dispatch
# ---------------------------------------------------------------------------

@override_settings(
    EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend',
    CONTACT_NOTIFICATION_EMAIL='admin@test.com',
    DEFAULT_FROM_EMAIL='portfolio@test.com',
)
class ContactEmailDispatchTests(ContactTestBase):

    def test_email_sent_on_valid_submission(self):
        from django.core import mail
        _post(self.client)
        self.assertEqual(len(mail.outbox), 1)

    def test_email_subject_contains_sender_name(self):
        from django.core import mail
        _post(self.client)
        self.assertIn('Jane Smith', mail.outbox[0].subject)

    def test_email_recipient_is_admin(self):
        from django.core import mail
        _post(self.client)
        self.assertIn('admin@test.com', mail.outbox[0].to)

    def test_reply_to_is_sender_email(self):
        from django.core import mail
        _post(self.client)
        self.assertIn('jane@example.com', mail.outbox[0].reply_to)

    def test_email_sent_flag_true_on_success(self):
        _post(self.client)
        msg = ContactMessage.objects.first()
        msg.refresh_from_db()
        self.assertTrue(msg.email_sent)

    def test_response_still_201_when_email_configured(self):
        self.assertEqual(_post(self.client).status_code, 201)


# ---------------------------------------------------------------------------
# 3. Email failure resilience
# ---------------------------------------------------------------------------

@override_settings(
    CONTACT_NOTIFICATION_EMAIL='admin@test.com',
    DEFAULT_FROM_EMAIL='portfolio@test.com',
)
class ContactEmailFailureTests(ContactTestBase):

    @patch('apps.contact.email_service.EmailMultiAlternatives')
    def test_still_201_when_smtp_fails(self, mock_email_cls):
        mock_email_cls.return_value.send.side_effect = ConnectionRefusedError('SMTP down')
        self.assertEqual(_post(self.client).status_code, 201)

    @patch('apps.contact.email_service.EmailMultiAlternatives')
    def test_message_saved_even_when_smtp_fails(self, mock_email_cls):
        mock_email_cls.return_value.send.side_effect = ConnectionRefusedError('SMTP down')
        _post(self.client)
        self.assertEqual(ContactMessage.objects.count(), 1)

    @patch('apps.contact.email_service.EmailMultiAlternatives')
    def test_email_sent_flag_false_when_smtp_fails(self, mock_email_cls):
        mock_email_cls.return_value.send.side_effect = ConnectionRefusedError('SMTP down')
        _post(self.client)
        msg = ContactMessage.objects.first()
        msg.refresh_from_db()
        self.assertFalse(msg.email_sent)

    @patch('apps.contact.email_service.EmailMultiAlternatives')
    def test_error_log_does_not_contain_message_body(self, mock_email_cls):
        mock_email_cls.return_value.send.side_effect = Exception('Some SMTP error')
        with self.assertLogs('apps.contact.email_service', level='ERROR') as cm:
            _post(self.client)
        log_output = '\n'.join(cm.output)
        self.assertNotIn('Hello Muleta', log_output)
        self.assertIn('Exception', log_output)


# ---------------------------------------------------------------------------
# 4. No email config
# ---------------------------------------------------------------------------

@override_settings(CONTACT_NOTIFICATION_EMAIL='')
class ContactNoEmailConfigTests(ContactTestBase):

    def test_still_201_without_email_config(self):
        self.assertEqual(_post(self.client).status_code, 201)

    def test_email_sent_flag_false_without_config(self):
        _post(self.client)
        msg = ContactMessage.objects.first()
        msg.refresh_from_db()
        self.assertFalse(msg.email_sent)


# ---------------------------------------------------------------------------
# 5. Honeypot rejection
# ---------------------------------------------------------------------------

class HoneypotTests(ContactTestBase):

    def test_honeypot_populated_returns_400(self):
        self.assertEqual(
            _post(self.client, {'website_url_hp': 'http://spam.example.com'}).status_code,
            400,
        )

    def test_honeypot_populated_does_not_save_to_db(self):
        _post(self.client, {'website_url_hp': 'http://spam.example.com'})
        self.assertEqual(ContactMessage.objects.count(), 0)

    def test_honeypot_response_code_is_validation_error(self):
        body = _post(self.client, {'website_url_hp': 'anything'}).json()
        self.assertFalse(body['success'])
        self.assertEqual(body['error']['code'], 'VALIDATION_ERROR')

    def test_honeypot_empty_string_passes(self):
        self.assertEqual(_post(self.client, {'website_url_hp': ''}).status_code, 201)


# ---------------------------------------------------------------------------
# 6. Validation errors
# ---------------------------------------------------------------------------

class ContactValidationTests(ContactTestBase):

    def _assert_400(self, overrides):
        self.assertEqual(_post(self.client, overrides).status_code, 400)

    def test_blank_name_returns_400(self):
        self._assert_400({'name': ''})

    def test_name_too_short_returns_400(self):
        self._assert_400({'name': 'A'})

    def test_name_too_long_returns_400(self):
        self._assert_400({'name': 'X' * 121})

    def test_invalid_email_returns_400(self):
        self._assert_400({'email': 'not-an-email'})

    def test_blank_email_returns_400(self):
        self._assert_400({'email': ''})

    def test_subject_too_short_returns_400(self):
        self._assert_400({'subject': 'Hi'})

    def test_subject_too_long_returns_400(self):
        self._assert_400({'subject': 'S' * 201})

    def test_message_too_short_returns_400(self):
        self._assert_400({'message': 'Too short.'})

    def test_message_too_long_returns_400(self):
        self._assert_400({'message': 'M' * 4001})

    def test_validation_error_has_field_details(self):
        body = _post(self.client, {'email': 'bad'}).json()
        self.assertIn('details', body['error'])
        self.assertIsNotNone(body['error']['details'])

    def test_validation_error_success_false(self):
        self.assertFalse(_post(self.client, {'name': ''}).json()['success'])


# ---------------------------------------------------------------------------
# 7 & 8. Input sanitization / header injection prevention
# ---------------------------------------------------------------------------

class SanitizationTests(ContactTestBase):

    def test_newline_stripped_from_subject(self):
        resp = _post(self.client, {'subject': 'Legit\r\nBcc: attacker@evil.com'})
        self.assertEqual(resp.status_code, 201)
        msg = ContactMessage.objects.first()
        self.assertNotIn('\r', msg.subject)
        self.assertNotIn('\n', msg.subject)

    def test_carriage_return_stripped_from_name(self):
        resp = _post(self.client, {'name': 'Valid\rName'})
        self.assertEqual(resp.status_code, 201)
        self.assertNotIn('\r', ContactMessage.objects.first().sender_name)

    def test_control_chars_stripped_from_message(self):
        # Use BEL (\x07) and US (\x1f) — control chars that our sanitizer removes.
        # NUL (\x00) is excluded because DRF CharField rejects it at the field level
        # before our sanitizer runs (correct behaviour — NUL is not a valid text char).
        resp = _post(self.client, {
            'message': 'Normal text\x07with\x1Fcontrol chars embedded throughout the message body here.'
        })
        self.assertEqual(resp.status_code, 201)
        body = ContactMessage.objects.first().message_body
        self.assertNotIn('\x07', body)
        self.assertNotIn('\x1f', body)

    def test_intentional_newlines_preserved_in_message(self):
        multi = 'First line.\nSecond line.\nThird line of the message body here.'
        resp = _post(self.client, {'message': multi})
        self.assertEqual(resp.status_code, 201)
        self.assertIn('\n', ContactMessage.objects.first().message_body)


# ---------------------------------------------------------------------------
# 9 & 10. Normalization
# ---------------------------------------------------------------------------

class NormalizationTests(ContactTestBase):

    def test_email_lowercased(self):
        _post(self.client, {'email': 'Jane@EXAMPLE.COM'})
        self.assertEqual(ContactMessage.objects.first().sender_email, 'jane@example.com')

    def test_email_whitespace_stripped(self):
        _post(self.client, {'email': '  jane@example.com  '})
        self.assertEqual(ContactMessage.objects.first().sender_email, 'jane@example.com')

    def test_name_whitespace_collapsed(self):
        _post(self.client, {'name': '  Jane   Smith  '})
        self.assertEqual(ContactMessage.objects.first().sender_name, 'Jane Smith')

    def test_email_local_part_too_long_rejected(self):
        long_local = 'a' * 65
        self.assertEqual(
            _post(self.client, {'email': f'{long_local}@example.com'}).status_code,
            400,
        )


# ---------------------------------------------------------------------------
# 11. Rate throttle configuration (no POST calls)
# ---------------------------------------------------------------------------

class ThrottleConfigTests(TestCase):

    def test_throttle_class_is_applied(self):
        from apps.contact.views import ContactMessageView, ContactThrottle
        self.assertIn(ContactThrottle, ContactMessageView.throttle_classes)

    def test_throttle_uses_contact_scope(self):
        from apps.contact.views import ContactThrottle
        self.assertEqual(ContactThrottle.scope, 'contact')


# ---------------------------------------------------------------------------
# 15. DB save failure
# ---------------------------------------------------------------------------

class DBFailureTests(ContactTestBase):

    @patch('apps.contact.views.ContactMessage.objects.create')
    def test_db_error_returns_503(self, mock_create):
        from django.db import DatabaseError
        mock_create.side_effect = DatabaseError('disk full')
        self.assertEqual(_post(self.client).status_code, 503)

    @patch('apps.contact.views.ContactMessage.objects.create')
    def test_db_error_response_code_is_service_unavailable(self, mock_create):
        from django.db import DatabaseError
        mock_create.side_effect = DatabaseError('disk full')
        body = _post(self.client).json()
        self.assertFalse(body['success'])
        self.assertEqual(body['error']['code'], 'SERVICE_UNAVAILABLE')


# ---------------------------------------------------------------------------
# 19 & 20. email_service unit tests
# ---------------------------------------------------------------------------

class EmailServiceUnitTests(TestCase):

    def _make_message(self, **kwargs):
        defaults = {
            'sender_name': 'Test Sender',
            'sender_email': 'test@example.com',
            'subject': 'Test Subject',
            'message_body': 'Test message body for email service unit tests.',
        }
        defaults.update(kwargs)
        return ContactMessage.objects.create(**defaults)

    @override_settings(CONTACT_NOTIFICATION_EMAIL='')
    def test_returns_false_when_no_admin_email(self):
        self.assertFalse(send_contact_notification(self._make_message()))

    @override_settings(
        CONTACT_NOTIFICATION_EMAIL='admin@test.com',
        DEFAULT_FROM_EMAIL='portfolio@test.com',
        EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend',
    )
    def test_returns_true_on_success(self):
        self.assertTrue(send_contact_notification(self._make_message()))

    @override_settings(
        CONTACT_NOTIFICATION_EMAIL='admin@test.com',
        DEFAULT_FROM_EMAIL='portfolio@test.com',
    )
    @patch('apps.contact.email_service.EmailMultiAlternatives')
    def test_returns_false_on_smtp_error(self, mock_cls):
        mock_cls.return_value.send.side_effect = OSError('Connection refused')
        self.assertFalse(send_contact_notification(self._make_message()))

    @override_settings(
        CONTACT_NOTIFICATION_EMAIL='admin@test.com',
        DEFAULT_FROM_EMAIL='portfolio@test.com',
    )
    @patch('apps.contact.email_service.EmailMultiAlternatives')
    def test_does_not_raise_on_smtp_error(self, mock_cls):
        mock_cls.return_value.send.side_effect = Exception('Unexpected')
        try:
            send_contact_notification(self._make_message())
        except Exception as exc:
            self.fail(f'send_contact_notification raised unexpectedly: {exc}')

    @override_settings(
        CONTACT_NOTIFICATION_EMAIL='admin@test.com',
        DEFAULT_FROM_EMAIL='portfolio@test.com',
        EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend',
    )
    def test_newline_stripped_from_notification_subject(self):
        from django.core import mail
        msg = self._make_message(
            sender_name='Attacker\r\nBcc: evil@attacker.com',
            subject='Normal Subject',
        )
        send_contact_notification(msg)
        if mail.outbox:
            self.assertNotIn('\r', mail.outbox[0].subject)
            self.assertNotIn('\n', mail.outbox[0].subject)
