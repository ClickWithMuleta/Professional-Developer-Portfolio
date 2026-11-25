"""
Portfolio API Serializers
=========================
Read-only serializers for all public-facing portfolio content.

Design decisions:
- All serializers are read-only (no write operations on public data).
- Nested serializers are intentionally flat where possible to reduce over-fetching.
- ImageField serializers use `request.build_absolute_uri` to return fully-qualified URLs.
- Unpublished projects are filtered at the ViewSet level, not here.
- `SerializerMethodField` is used sparingly — only where model methods add real value.
"""

from rest_framework import serializers
from .models import (
    Profile,
    SkillCategory,
    Skill,
    Project,
    ProjectMetric,
    Experience,
    Education,
)


# ---------------------------------------------------------------------------
# Profile Serializers
# ---------------------------------------------------------------------------

class ProfileSerializer(serializers.ModelSerializer):
    """
    Full developer profile for the portfolio landing page.
    Exposes all public identity fields; excludes internal fields (is_active, timestamps).
    """
    avatar_url = serializers.SerializerMethodField()
    resume_url = serializers.SerializerMethodField()

    class Meta:
        model = Profile
        fields = [
            'id',
            'full_name',
            'title',
            'headline',
            'bio',
            'avatar_url',
            'email',
            'github_url',
            'linkedin_url',
            'location',
            'resume_url',
            'availability_status',
        ]
        read_only_fields = fields

    def get_avatar_url(self, obj):
        """Return absolute URL for the avatar image, or None if unset."""
        if not obj.avatar:
            return None
        request = self.context.get('request')
        if request:
            return request.build_absolute_uri(obj.avatar.url)
        return obj.avatar.url

    def get_resume_url(self, obj):
        """Return absolute URL for the resume file, or None if unset."""
        if not obj.resume:
            return None
        request = self.context.get('request')
        if request:
            return request.build_absolute_uri(obj.resume.url)
        return obj.resume.url


# ---------------------------------------------------------------------------
# Skill Serializers
# ---------------------------------------------------------------------------

class SkillSerializer(serializers.ModelSerializer):
    """
    Flat skill representation — includes category name as a string.
    Used both standalone and nested inside SkillCategorySerializer.
    """
    category_name = serializers.CharField(source='category.name', read_only=True)
    category_slug = serializers.CharField(source='category.slug', read_only=True)

    class Meta:
        model = Skill
        fields = [
            'id',
            'name',
            'slug',
            'icon_key',
            'context_badge',
            'description',
            'is_flagship',
            'order',
            'category_name',
            'category_slug',
        ]
        read_only_fields = fields


class SkillCategorySerializer(serializers.ModelSerializer):
    """
    Skill category with all nested skills.
    Used by GET /api/v1/skills/categories/ to deliver grouped data in one request.
    """
    skills = SkillSerializer(many=True, read_only=True)
    skill_count = serializers.IntegerField(source='skills.count', read_only=True)

    class Meta:
        model = SkillCategory
        fields = [
            'id',
            'name',
            'slug',
            'order',
            'skill_count',
            'skills',
        ]
        read_only_fields = fields


# ---------------------------------------------------------------------------
# Project Serializers
# ---------------------------------------------------------------------------

class ProjectMetricSerializer(serializers.ModelSerializer):
    """Inline metric attached to a project — label/value pairs only."""

    class Meta:
        model = ProjectMetric
        fields = ['id', 'label', 'value', 'order']
        read_only_fields = fields


class ProjectTechnologySerializer(serializers.ModelSerializer):
    """Minimal skill representation for project technology tags."""

    class Meta:
        model = Skill
        fields = ['id', 'name', 'slug', 'icon_key', 'context_badge']
        read_only_fields = fields


class ProjectListSerializer(serializers.ModelSerializer):
    """
    Compact project representation for the project listing endpoint.
    Excludes `detailed_description` to keep list responses lightweight.
    Uses `featured_image_url` instead of the raw ImageField path.
    """
    featured_image_url = serializers.SerializerMethodField()
    technologies = ProjectTechnologySerializer(many=True, read_only=True)
    metrics = ProjectMetricSerializer(many=True, read_only=True)

    class Meta:
        model = Project
        fields = [
            'id',
            'title',
            'slug',
            'subtitle',
            'category',
            'short_description',
            'featured_image_url',
            'github_url',
            'live_demo_url',
            'technologies',
            'metrics',
            'is_featured',
            'order',
            'created_at',
        ]
        read_only_fields = fields

    def get_featured_image_url(self, obj):
        if not obj.featured_image:
            return None
        request = self.context.get('request')
        if request:
            return request.build_absolute_uri(obj.featured_image.url)
        return obj.featured_image.url


class ProjectDetailSerializer(ProjectListSerializer):
    """
    Full project representation for the single-project detail endpoint.
    Extends `ProjectListSerializer` with the full case-study description.
    """
    class Meta(ProjectListSerializer.Meta):
        fields = ProjectListSerializer.Meta.fields + ['detailed_description', 'updated_at']


# ---------------------------------------------------------------------------
# Experience Serializers
# ---------------------------------------------------------------------------

class ExperienceSerializer(serializers.ModelSerializer):
    """
    Career milestone with responsibilities rendered as a clean list.
    Technologies are returned as minimal skill tags.
    """
    technologies = ProjectTechnologySerializer(many=True, read_only=True)
    responsibilities_list = serializers.SerializerMethodField()

    class Meta:
        model = Experience
        fields = [
            'id',
            'position',
            'organization',
            'location',
            'period_display',
            'period_badge',
            'start_date',
            'end_date',
            'is_current',
            'project_focus',
            'summary',
            'responsibilities_list',
            'technologies',
            'order',
        ]
        read_only_fields = fields

    def get_responsibilities_list(self, obj):
        """Return parsed list of responsibilities from newline-delimited text."""
        return obj.get_responsibilities_list()


# ---------------------------------------------------------------------------
# Education Serializers
# ---------------------------------------------------------------------------

class EducationSerializer(serializers.ModelSerializer):
    """
    Academic background with curriculum highlights rendered as a clean list.
    Technologies are returned as minimal skill tags (languages learned, etc.).
    """
    technologies = ProjectTechnologySerializer(many=True, read_only=True)
    curriculum_list = serializers.SerializerMethodField()

    class Meta:
        model = Education
        fields = [
            'id',
            'institution',
            'degree',
            'field_of_study',
            'location',
            'period_display',
            'period_badge',
            'summary',
            'curriculum_list',
            'capstone_project',
            'technologies',
            'order',
        ]
        read_only_fields = fields

    def get_curriculum_list(self, obj):
        """Return parsed list of curriculum highlights from newline-delimited text."""
        return obj.get_curriculum_list()
