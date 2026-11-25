import os
from django.core.wsgi import get_wsgi_application

# Default to development, overridden in production via environment or gunicorn arg
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core_project.settings.development')

application = get_wsgi_application()
