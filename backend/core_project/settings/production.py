from .base import *
import dj_database_url

DEBUG = False

# Strict host whitelisting
ALLOWED_HOSTS = env.list('ALLOWED_HOSTS')

# Strict CORS whitelisting (e.g. Cloudflare Pages frontend)
CORS_ALLOWED_ORIGINS = env.list('CORS_ALLOWED_ORIGINS')
CORS_ALLOW_CREDENTIALS = True

# Production Database (Neon Serverless PostgreSQL or Render Managed Postgres)
DATABASES = {
    'default': dj_database_url.config(
        env='DATABASE_URL',
        conn_max_age=600,
        conn_health_checks=True,
        ssl_require=True,
    )
}

# WhiteNoise Optimized Asset Storage
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# HTTPS & Security Hardening
SECURE_SSL_REDIRECT = env.bool('SECURE_SSL_REDIRECT', default=True)
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'

# HTTP Strict Transport Security (HSTS)
SECURE_HSTS_SECONDS = 31536000  # 1 year
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True

# Production REST Framework: JSON Only (No Browsable API)
REST_FRAMEWORK['DEFAULT_RENDERER_CLASSES'] = [
    'rest_framework.renderers.JSONRenderer',
]

# ---------------------------------------------------------------------------
# Email — Production SMTP
# ---------------------------------------------------------------------------
# Uses Django's built-in SMTP backend.
# Credentials are read from environment variables (set in Render dashboard).
# EMAIL_HOST, EMAIL_PORT, EMAIL_HOST_USER, EMAIL_HOST_PASSWORD, etc.
# are all defined in base.py via env(); they just need the env vars set on Render.
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
