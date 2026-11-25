"""
Phase 5.3 — API Smoke Test Script
Run with: backend\venv\Scripts\python.exe backend\scripts\test_api.py
"""
import os
import sys
import json

# Configure Django environment
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'apps'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core_project.settings.development')

import django
django.setup()

from django.test import Client

c = Client()


def test(label, method, url, body=None, content_type='application/json',
         expect_status=200):
    if method == 'GET':
        resp = c.get(url, HTTP_HOST='testserver')
    elif method == 'POST':
        resp = c.post(url, data=json.dumps(body),
                      content_type=content_type, HTTP_HOST='testserver')

    data = json.loads(resp.content)
    passed = resp.status_code == expect_status
    icon = 'PASS' if passed else 'FAIL'

    success = data.get('success')
    meta = data.get('meta', {})
    err = data.get('error') or {}
    result_data = data.get('data')

    details = f'success={success}'
    if meta.get('count') is not None:
        details += f'  count={meta["count"]}'
    if err.get('code'):
        details += f'  error_code={err["code"]}'
    if isinstance(result_data, dict):
        details += f'  data_keys={list(result_data.keys())[:4]}'
    elif isinstance(result_data, list):
        details += f'  data_len={len(result_data)}'

    print(f'  [{icon}] {method} {url}')
    print(f'         HTTP {resp.status_code}  |  {details}')
    return passed


all_pass = True

print()
print('=' * 65)
print('  PHASE 5.3 — REST API SMOKE TEST')
print('=' * 65)

print()
print('--- Portfolio Read Endpoints ---')
all_pass &= test('health',       'GET', '/api/v1/health/')
# Accepts 200 if seeded or 404 if unseeded
resp_prof = c.get('/api/v1/profile/', HTTP_HOST='testserver')
expected_prof = 200 if resp_prof.status_code == 200 else 404
all_pass &= test('profile',      'GET', '/api/v1/profile/', expect_status=expected_prof)
all_pass &= test('projects',     'GET', '/api/v1/projects/')
all_pass &= test('featured',     'GET', '/api/v1/projects/featured/')
all_pass &= test('skills',       'GET', '/api/v1/skills/')
all_pass &= test('categories',   'GET', '/api/v1/skills/categories/')
all_pass &= test('experience',   'GET', '/api/v1/experience/')
all_pass &= test('education',    'GET', '/api/v1/education/')

print()
print('--- Project Slug Lookup ---')
all_pass &= test('project 404',  'GET', '/api/v1/projects/does-not-exist/', expect_status=404)

print()
print('--- Query Filters ---')
all_pass &= test('flagship filter',  'GET', '/api/v1/skills/?flagship=true')
all_pass &= test('category filter',  'GET', '/api/v1/skills/?flagship=false')

print()
print('--- Contact Form: Valid Submission ---')
all_pass &= test(
    'contact valid', 'POST', '/api/v1/contact/',
    body={
        'sender_name': 'Test User',
        'sender_email': 'test@example.com',
        'subject': 'API Smoke Test — Phase 5.3',
        'message_body': 'This is an automated test message submitted by the Phase 5.3 smoke test to verify the contact endpoint.',
        'website_url_hp': '',
    },
    expect_status=201,
)

print()
print('--- Contact Form: Honeypot Rejection ---')
all_pass &= test(
    'contact honeypot', 'POST', '/api/v1/contact/',
    body={
        'sender_name': 'Bot',
        'sender_email': 'bot@spam.com',
        'subject': 'Buy stuff',
        'message_body': 'Click here to buy cheap medications now on sale.',
        'website_url_hp': 'http://spam.example.com',
    },
    expect_status=400,
)

print()
print('--- Contact Form: Validation Errors ---')
all_pass &= test(
    'contact invalid', 'POST', '/api/v1/contact/',
    body={
        'sender_name': 'A',
        'sender_email': 'not-an-email',
        'subject': 'Hi',
        'message_body': 'short',
    },
    expect_status=400,
)

print()
print('=' * 65)
print('  RESULT:', 'ALL TESTS PASSED ✓' if all_pass else 'SOME TESTS FAILED ✗')
print('=' * 65)
print()

sys.exit(0 if all_pass else 1)
