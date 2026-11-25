import logging
from datetime import datetime, timezone
from django.conf import settings
from django.db import connection
from django.db.utils import OperationalError
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status

logger = logging.getLogger(__name__)


@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    """
    Service Health & Readiness Probe.
    Validates database connectivity and service status.
    Returns HTTP 200 if fully operational, HTTP 503 if database is disconnected.
    """
    now_iso = datetime.now(timezone.utc).isoformat()
    db_status = 'connected'
    is_healthy = True

    try:
        connection.ensure_connection()
    except OperationalError as err:
        logger.error('Database connection probe failed: %s', err)
        db_status = 'unreachable'
        is_healthy = False
    except Exception as err:
        logger.error('Unexpected error during database probe: %s', err)
        db_status = 'error'
        is_healthy = False

    payload = {
        'success': is_healthy,
        'data': {
            'status': 'healthy' if is_healthy else 'degraded',
            'service': 'muleta-developer-portfolio-backend',
            'environment': 'development' if settings.DEBUG else 'production',
            'database': {
                'status': db_status,
                'vendor': connection.vendor,
            },
        },
        'error': None if is_healthy else {
            'code': 'SERVICE_DEGRADED',
            'message': 'Database connection is currently unreachable.',
            'details': None,
        },
        'meta': {
            'timestamp': now_iso,
            'version': 'v1',
        },
    }

    http_status = status.HTTP_200_OK if is_healthy else status.HTTP_503_SERVICE_UNAVAILABLE
    return Response(payload, status=http_status)
