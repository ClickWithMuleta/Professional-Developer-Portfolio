"""
Contact API URL Configuration
==============================
Maps contact form endpoints under /api/v1/.

  POST /api/v1/contact/   →  Submit a new contact message
"""

from django.urls import path
from .views import ContactMessageView

urlpatterns = [
    path('contact/', ContactMessageView.as_view(), name='contact-submit'),
]
