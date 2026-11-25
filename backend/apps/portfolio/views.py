"""
Portfolio API Views
===================
Read-only ViewSets and APIViews for all public portfolio content.

All views:
- Are publicly accessible (AllowAny).
- Return data wrapped in the project-standard response envelope.
- Use select_related / prefetch_related to avoid N+1 queries.
- Filter unpublished/inactive records at the queryset level.
- Accept no write operations.

Response envelope structure:
{
    "success": true,
    "data": { ... } | [ ... ],
    "error": null,
    "meta": { "count": N, "version": "v1" }   ← count only on list responses
}
"""

import logging
from datetime import datetime, timezone

from rest_framework import status
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.viewsets import ReadOnlyModelViewSet
from rest_framework.views import APIView

from .models import Profile, SkillCategory, Skill, Project, Experience, Education
from .serializers import (
    ProfileSerializer,
    SkillSerializer,
    SkillCategorySerializer,
    ProjectListSerializer,
    ProjectDetailSerializer,
    ExperienceSerializer,
    EducationSerializer,
)

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Response envelope helpers
# ---------------------------------------------------------------------------

def _now_iso():
    return datetime.now(timezone.utc).isoformat()


def success_response(data, *, count=None, status_code=status.HTTP_200_OK):
    """
    Build the standard success response envelope.
    `count` is included only on list responses.
    """
    meta = {'version': 'v1', 'timestamp': _now_iso()}
    if count is not None:
        meta['count'] = count

    return Response(
        {'success': True, 'data': data, 'error': None, 'meta': meta},
        status=status_code,
    )


def not_found_response(resource='Resource'):
    return Response(
        {
            'success': False,
            'data': None,
            'error': {
                'code': 'NOT_FOUND',
                'message': f'{resource} not found.',
                'details': None,
            },
            'meta': {'version': 'v1', 'timestamp': _now_iso()},
        },
        status=status.HTTP_404_NOT_FOUND,
    )


# ---------------------------------------------------------------------------
# Profile
# ---------------------------------------------------------------------------

class ProfileView(APIView):
    """
    GET /api/v1/profile/

    Returns the single active developer profile.
    Only one profile record should ever be marked `is_active=True`.
    Returns 404 if no active profile is configured.
    """
    permission_classes = [AllowAny]

    def get(self, request):
        try:
            profile = Profile.objects.get(is_active=True)
        except Profile.DoesNotExist:
            logger.warning('No active profile found in portfolio database.')
            return not_found_response('Developer profile')
        except Profile.MultipleObjectsReturned:
            # Fallback: take the most recently updated active profile
            logger.warning('Multiple active profiles found — using most recently updated.')
            profile = Profile.objects.filter(is_active=True).order_by('-updated_at').first()

        serializer = ProfileSerializer(profile, context={'request': request})
        return success_response(serializer.data)


# ---------------------------------------------------------------------------
# Projects
# ---------------------------------------------------------------------------

class ProjectViewSet(ReadOnlyModelViewSet):
    """
    ViewSet for portfolio project showcase.

    GET /api/v1/projects/              → Published projects, ordered by `order`
    GET /api/v1/projects/featured/     → Featured projects only
    GET /api/v1/projects/{slug}/       → Single project detail by slug

    Only published projects (`is_published=True`) are exposed publicly.
    Ordering: `order` ASC, then `created_at` DESC as a tiebreaker.
    """
    permission_classes = [AllowAny]
    lookup_field = 'slug'

    def get_queryset(self):
        return (
            Project.objects
            .filter(is_published=True)
            .prefetch_related('technologies', 'metrics')
            .order_by('order', '-created_at')
        )

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ProjectDetailSerializer
        return ProjectListSerializer

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx['request'] = self.request
        return ctx

    # ---- list override — wrap in envelope ----

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()

        # Optional category filter: ?category=AI+%26+Financial+Tech
        category = request.query_params.get('category')
        if category:
            queryset = queryset.filter(category=category)

        serializer = self.get_serializer(queryset, many=True)
        return success_response(serializer.data, count=queryset.count())

    # ---- retrieve override — 404 envelope ----

    def retrieve(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
        except Exception:
            return not_found_response('Project')
        serializer = self.get_serializer(instance)
        return success_response(serializer.data)

    # ---- custom action: /featured/ ----

    @action(detail=False, methods=['get'], url_path='featured')
    def featured(self, request):
        """
        GET /api/v1/projects/featured/
        Returns all published projects with `is_featured=True`.
        """
        queryset = self.get_queryset().filter(is_featured=True)
        serializer = ProjectListSerializer(queryset, many=True, context={'request': request})
        return success_response(serializer.data, count=queryset.count())


# ---------------------------------------------------------------------------
# Skills
# ---------------------------------------------------------------------------

class SkillViewSet(ReadOnlyModelViewSet):
    """
    ViewSet for technology skills.

    GET /api/v1/skills/              → Flat list of all skills
    GET /api/v1/skills/categories/   → Skills nested and grouped by category
    GET /api/v1/skills/{slug}/       → Single skill detail

    Optional query filters:
      ?flagship=true       → Flagship/core technologies only
      ?category=<slug>     → Filter by category slug
    """
    permission_classes = [AllowAny]
    lookup_field = 'slug'
    serializer_class = SkillSerializer

    def get_queryset(self):
        return (
            Skill.objects
            .select_related('category')
            .order_by('category__order', 'order', 'name')
        )

    # ---- list override — filtering + envelope ----

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()

        # ?flagship=true  →  core technologies only
        flagship = request.query_params.get('flagship', '').lower()
        if flagship == 'true':
            queryset = queryset.filter(is_flagship=True)

        # ?category=backend-apis  →  filter by category slug
        category_slug = request.query_params.get('category', '').strip()
        if category_slug:
            queryset = queryset.filter(category__slug=category_slug)

        serializer = self.get_serializer(queryset, many=True)
        return success_response(serializer.data, count=queryset.count())

    # ---- retrieve override ----

    def retrieve(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
        except Exception:
            return not_found_response('Skill')
        serializer = self.get_serializer(instance)
        return success_response(serializer.data)

    # ---- custom action: /categories/ ----

    @action(detail=False, methods=['get'], url_path='categories')
    def categories(self, request):
        """
        GET /api/v1/skills/categories/
        Returns all skill categories with nested skills.
        Delivers everything in one round-trip — ideal for the frontend skills section.
        """
        categories = (
            SkillCategory.objects
            .prefetch_related('skills')
            .order_by('order', 'name')
        )
        serializer = SkillCategorySerializer(categories, many=True)
        return success_response(serializer.data, count=categories.count())


# ---------------------------------------------------------------------------
# Experience
# ---------------------------------------------------------------------------

class ExperienceView(APIView):
    """
    GET /api/v1/experience/

    Returns all experience milestones ordered by `order` field.
    Uses `prefetch_related` to avoid N+1 on the technologies M2M.
    """
    permission_classes = [AllowAny]

    def get(self, request):
        queryset = (
            Experience.objects
            .prefetch_related('technologies')
            .order_by('order', 'id')
        )
        serializer = ExperienceSerializer(queryset, many=True)
        return success_response(serializer.data, count=queryset.count())


# ---------------------------------------------------------------------------
# Education
# ---------------------------------------------------------------------------

class EducationView(APIView):
    """
    GET /api/v1/education/

    Returns all education milestones ordered by `order` field.
    """
    permission_classes = [AllowAny]

    def get(self, request):
        queryset = (
            Education.objects
            .prefetch_related('technologies')
            .order_by('order', 'id')
        )
        serializer = EducationSerializer(queryset, many=True)
        return success_response(serializer.data, count=queryset.count())
