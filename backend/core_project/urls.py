from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

# Customize Django Admin Header and Title
admin.site.site_header = 'Muleta Sisay — Portfolio Admin Portal'
admin.site.site_title = 'Muleta Developer Portfolio'
admin.site.index_title = 'System Administration & Content Management'

urlpatterns = [
    # Django Administration
    path('admin/', admin.site.urls),

    # Core System & Health Endpoints
    path('api/v1/', include('apps.core.urls')),

    # Portfolio Content API (read-only public endpoints)
    path('api/v1/', include('apps.portfolio.urls')),

    # Contact Form Submission API
    path('api/v1/', include('apps.contact.urls')),
]

# Serve media files in local development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
