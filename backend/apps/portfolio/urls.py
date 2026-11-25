"""
Portfolio API URL Configuration
================================
Maps all public portfolio endpoints under /api/v1/.

ViewSet-based routes are registered via DRF's DefaultRouter.
Singleton/list-only views are wired manually.

Final URL map:
  GET  /api/v1/profile/
  GET  /api/v1/projects/
  GET  /api/v1/projects/featured/
  GET  /api/v1/projects/{slug}/
  GET  /api/v1/skills/
  GET  /api/v1/skills/categories/
  GET  /api/v1/skills/{slug}/
  GET  /api/v1/experience/
  GET  /api/v1/education/
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProjectViewSet, SkillViewSet, ProfileView, ExperienceView, EducationView

# ---------------------------------------------------------------------------
# Router — handles ViewSet list/retrieve/custom-actions automatically
# ---------------------------------------------------------------------------
router = DefaultRouter(trailing_slash=True)
router.register(r'projects', ProjectViewSet, basename='project')
router.register(r'skills', SkillViewSet, basename='skill')

# ---------------------------------------------------------------------------
# URL patterns
# ---------------------------------------------------------------------------
urlpatterns = [
    # Singleton profile endpoint (not a ViewSet — only one active record)
    path('profile/', ProfileView.as_view(), name='portfolio-profile'),

    # Experience and Education (simple list endpoints, no slug lookup needed)
    path('experience/', ExperienceView.as_view(), name='portfolio-experience'),
    path('education/', EducationView.as_view(), name='portfolio-education'),

    # Router-managed endpoints (projects, skills, featured, categories)
    path('', include(router.urls)),
]
