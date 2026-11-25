import logging
from datetime import datetime, timezone
from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status

logger = logging.getLogger(__name__)


def custom_exception_handler(exc, context):
    """
    Unified DRF Custom Exception Handler.
    Standardizes all API error responses into the approved project response envelope.
    Ensures internal stack traces are never leaked to external API consumers.
    """
    # Call REST framework's default exception handler first to get the standard error response
    response = exception_handler(exc, context)

    # Now add the HTTP status code to the response
    now_iso = datetime.now(timezone.utc).isoformat()

    if response is not None:
        error_code = 'API_ERROR'
        error_message = 'An error occurred while processing your request.'

        # Extract code and message based on DRF exception type
        if response.status_code == status.HTTP_400_BAD_REQUEST:
            error_code = 'VALIDATION_ERROR'
            error_message = 'Invalid request payload or query parameters.'
        elif response.status_code == status.HTTP_401_UNAUTHORIZED:
            error_code = 'UNAUTHORIZED'
            error_message = 'Authentication credentials were not provided or are invalid.'
        elif response.status_code == status.HTTP_403_FORBIDDEN:
            error_code = 'PERMISSION_DENIED'
            error_message = 'You do not have permission to perform this action.'
        elif response.status_code == status.HTTP_404_NOT_FOUND:
            error_code = 'NOT_FOUND'
            error_message = 'The requested resource was not found.'
        elif response.status_code == status.HTTP_429_TOO_MANY_REQUESTS:
            error_code = 'THROTTLED'
            error_message = 'Request limit exceeded. Please try again later.'

        custom_data = {
            'success': False,
            'data': None,
            'error': {
                'code': error_code,
                'message': error_message,
                'details': response.data,
            },
            'meta': {
                'timestamp': now_iso,
                'version': 'v1',
            },
        }
        response.data = custom_data
        return response

    # Unhandled exceptions (500 Internal Server Errors)
    logger.exception('Unhandled exception encountered in API request: %s', exc)

    return Response(
        {
            'success': False,
            'data': None,
            'error': {
                'code': 'INTERNAL_SERVER_ERROR',
                'message': 'A critical server error occurred. Our engineering team has been notified.',
                'details': None,
            },
            'meta': {
                'timestamp': now_iso,
                'version': 'v1',
            },
        },
        status=status.HTTP_500_INTERNAL_SERVER_ERROR,
    )
