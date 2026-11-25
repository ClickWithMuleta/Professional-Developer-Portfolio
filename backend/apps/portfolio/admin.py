from django.contrib import admin
from django.db import models
from django.utils.html import format_html
from django.urls import reverse
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
# Inlines
# ---------------------------------------------------------------------------

class ProjectMetricInline(admin.TabularInline):
    """
    Inline editor for quantifiable metrics attached to a project.
    e.g. 'ML Models': 'LightGBM + Random Forest', 'Latency': '<45ms'.
    """
    model = ProjectMetric
    extra = 1
    fields = ('label', 'value', 'order')
    ordering = ('order',)


# ---------------------------------------------------------------------------
# Profile Admin
# ---------------------------------------------------------------------------

@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    """
    Admin panel for Developer Profile & Personal Identity.
    Guarantees single active profile rule and provides image/file previews.
    """
    list_display = (
        'full_name',
        'title',
        'availability_display',
        'is_active',
        'avatar_thumbnail',
        'resume_link',
        'updated_at',
    )
    list_editable = ('is_active',)
    list_filter = ('is_active',)
    search_fields = ('full_name', 'title', 'headline', 'bio', 'email', 'location')
    readonly_fields = ('avatar_preview', 'resume_preview', 'created_at', 'updated_at')

    fieldsets = (
        ('Identity', {
            'fields': (
                'full_name',
                'title',
                'headline',
                'bio',
                'avatar',
                'avatar_preview',
            )
        }),
        ('Contact & Social', {
            'fields': (
                'email',
                'github_url',
                'linkedin_url',
                'location',
            )
        }),
        ('Availability & Status', {
            'fields': (
                'availability_status',
                'is_active',
            ),
            'description': 'Setting this profile as active will automatically deactivate any other profiles.'
        }),
        ('Resume File', {
            'fields': (
                'resume',
                'resume_preview',
            )
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',),
        }),
    )

    actions = ('activate_profile',)

    @admin.display(description="Availability")
    def availability_display(self, obj):
        if not obj.availability_status:
            return "-"
        return format_html(
            '<span style="background:#064e3b;color:#34d399;padding:3px 8px;'
            'border-radius:12px;font-size:11px;font-weight:600;">{}</span>',
            obj.availability_status
        )

    @admin.display(description="Avatar")
    def avatar_thumbnail(self, obj):
        if obj.avatar:
            return format_html(
                '<img src="{}" style="width:36px;height:36px;border-radius:50%;'
                'object-fit:cover;border:1px solid #10b981;" />',
                obj.avatar.url
            )
        return format_html(
            '<div style="width:36px;height:36px;border-radius:50%;background:#27272a;'
            'color:#a1a1aa;display:flex;align-items:center;justify-content:center;'
            'font-weight:bold;font-size:13px;">MS</div>'
        )

    @admin.display(description="Avatar Preview")
    def avatar_preview(self, obj):
        if obj.avatar:
            return format_html(
                '<div style="margin-top:6px;"><img src="{}" style="max-width:140px;max-height:140px;'
                'border-radius:8px;border:2px solid #10b981;box-shadow:0 4px 12px rgba(0,0,0,0.15);" />'
                '<p style="margin:4px 0 0;font-size:12px;color:#71717a;"><a href="{}" target="_blank">Open Full Image ↗</a></p></div>',
                obj.avatar.url, obj.avatar.url
            )
        return "No avatar uploaded yet."

    @admin.display(description="Resume")
    def resume_link(self, obj):
        if obj.resume:
            return format_html(
                '<a href="{}" target="_blank" style="color:#10b981;font-weight:600;'
                'text-decoration:none;">Download PDF ↗</a>',
                obj.resume.url
            )
        return format_html('<span style="color:#71717a;">None</span>')

    @admin.display(description="Resume Preview")
    def resume_preview(self, obj):
        if obj.resume:
            return format_html(
                '<a href="{}" target="_blank" class="button" style="background:#10b981;'
                'color:#fff;padding:6px 14px;border-radius:4px;font-weight:600;text-decoration:none;">'
                'Download Current Resume ({}) ↗</a>',
                obj.resume.url, obj.resume.name.split('/')[-1]
            )
        return "No resume file uploaded yet. Upload a PDF."

    @admin.action(description="Set selected profile as the single active profile")
    def activate_profile(self, request, queryset):
        if queryset.count() > 1:
            self.message_user(request, "Please select only one profile to activate.", level='error')
            return
        profile = queryset.first()
        profile.is_active = True
        profile.save()
        self.message_user(request, f"'{profile.full_name}' is now the active portfolio profile.")


# ---------------------------------------------------------------------------
# Skill Category Admin
# ---------------------------------------------------------------------------

@admin.register(SkillCategory)
class SkillCategoryAdmin(admin.ModelAdmin):
    """
    Skill category groups (Backend, Frontend, Databases, etc.).
    Provides inline reordering and aggregated skill counts.
    """
    list_display = ('name', 'slug', 'order', 'skill_count_badge')
    list_editable = ('order',)
    search_fields = ('name', 'slug')
    prepopulated_fields = {'slug': ('name',)}
    ordering = ('order', 'name')

    def get_queryset(self, request):
        return super().get_queryset(request).annotate(skill_count=models.Count('skills'))

    @admin.display(description="Total Skills", ordering='skill_count')
    def skill_count_badge(self, obj):
        url = reverse('admin:portfolio_skill_changelist') + f'?category__id__exact={obj.id}'
        return format_html(
            '<a href="{}" style="background:#27272a;color:#f4f4f5;padding:3px 9px;'
            'border-radius:12px;font-size:11px;font-weight:600;text-decoration:none;">'
            '{} skills &rarr;</a>',
            url, obj.skill_count
        )


# ---------------------------------------------------------------------------
# Skill Admin
# ---------------------------------------------------------------------------

@admin.register(Skill)
class SkillAdmin(admin.ModelAdmin):
    """
    Individual technical competence.
    Supports 1-click flagship toggling, re-ordering, and project usage counts.
    """
    list_display = (
        'name',
        'category',
        'icon_display',
        'context_badge',
        'is_flagship',
        'order',
        'project_usage_badge',
    )
    list_editable = ('is_flagship', 'order', 'context_badge')
    list_filter = ('category', 'is_flagship')
    search_fields = ('name', 'slug', 'context_badge', 'description', 'category__name')
    prepopulated_fields = {'slug': ('name',)}
    ordering = ('category__order', 'order', 'name')
    actions = ('mark_flagship', 'unmark_flagship')

    fieldsets = (
        ('Identity', {
            'fields': ('name', 'slug', 'category', 'icon_key')
        }),
        ('Display & Portfolio Highlighting', {
            'fields': ('context_badge', 'description', 'is_flagship', 'order')
        }),
    )

    def get_queryset(self, request):
        return (
            super().get_queryset(request)
            .select_related('category')
            .annotate(projects_count=models.Count('projects'))
        )

    @admin.display(description="Icon Key")
    def icon_display(self, obj):
        return format_html(
            '<code style="background:#18181b;padding:2px 6px;border-radius:4px;'
            'color:#10b981;font-size:11px;">{}</code>',
            obj.icon_key
        )

    @admin.display(description="Project Usage", ordering='projects_count')
    def project_usage_badge(self, obj):
        count = obj.projects_count
        if count == 0:
            return format_html('<span style="color:#71717a;font-size:11px;">0 projects</span>')
        url = reverse('admin:portfolio_project_changelist') + f'?technologies__id__exact={obj.id}'
        return format_html(
            '<a href="{}" style="color:#38bdf8;font-weight:600;font-size:11px;'
            'text-decoration:none;">{} linked &rarr;</a>',
            url, count
        )

    @admin.action(description="Mark selected skills as Flagship (Core Stack)")
    def mark_flagship(self, request, queryset):
        updated = queryset.update(is_flagship=True)
        self.message_user(request, f"{updated} skill(s) marked as flagship.")

    @admin.action(description="Remove selected skills from Flagship")
    def unmark_flagship(self, request, queryset):
        updated = queryset.update(is_flagship=False)
        self.message_user(request, f"{updated} skill(s) removed from flagship.")


# ---------------------------------------------------------------------------
# Project Admin
# ---------------------------------------------------------------------------

@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    """
    Project showcase management.
    Features:
      - 1-click publishing & featuring via list_editable
      - Thumbnail previews in changelist and detail form
      - Direct links to Live Demo and GitHub Repo
      - Inline metric management
      - Fast bulk publish/unpublish actions
      - Optimized prefetch_related for zero N+1 queries
    """
    list_display = (
        'image_thumbnail',
        'title',
        'category',
        'is_published',
        'is_featured',
        'order',
        'metrics_count',
        'tech_count',
        'live_demo_link',
        'github_link',
        'created_at',
    )
    list_editable = ('is_published', 'is_featured', 'order')
    list_filter = (
        'is_published',
        'is_featured',
        'category',
        ('created_at', admin.DateFieldListFilter),
    )
    search_fields = (
        'title',
        'subtitle',
        'short_description',
        'detailed_description',
        'technologies__name',
    )
    date_hierarchy = 'created_at'
    prepopulated_fields = {'slug': ('title',)}
    filter_horizontal = ('technologies',)
    inlines = (ProjectMetricInline,)
    readonly_fields = ('image_preview_large', 'created_at', 'updated_at')
    ordering = ('order', '-created_at')

    fieldsets = (
        ('Identity & Category', {
            'fields': ('title', 'slug', 'subtitle', 'category')
        }),
        ('Project Content', {
            'fields': (
                'short_description',
                'detailed_description',
                'featured_image',
                'image_preview_large',
            )
        }),
        ('External Links', {
            'fields': ('github_url', 'live_demo_url'),
            'description': 'Leave Live Demo empty if unhosted; the frontend will intelligently hide the demo button.'
        }),
        ('Technologies & Stack', {
            'fields': ('technologies',)
        }),
        ('Visibility & Display Order', {
            'fields': ('is_published', 'is_featured', 'order'),
            'description': 'Published controls public display. Featured marks this as a prominent flagship case-study.'
        }),
        ('Audit Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',),
        }),
    )

    actions = (
        'publish_selected',
        'unpublish_selected',
        'feature_selected',
        'unfeature_selected',
    )

    def get_queryset(self, request):
        return (
            super().get_queryset(request)
            .prefetch_related('technologies', 'metrics')
        )

    @admin.display(description="Preview")
    def image_thumbnail(self, obj):
        if obj.featured_image:
            return format_html(
                '<img src="{}" style="width:52px;height:34px;object-fit:cover;'
                'border-radius:4px;border:1px solid #3f3f46;" />',
                obj.featured_image.url
            )
        return format_html(
            '<div style="width:52px;height:34px;background:#18181b;border:1px dashed #3f3f46;'
            'border-radius:4px;display:flex;align-items:center;justify-content:center;'
            'font-size:10px;color:#71717a;">None</div>'
        )

    @admin.display(description="Current Image")
    def image_preview_large(self, obj):
        if obj.featured_image:
            return format_html(
                '<div style="margin-top:6px;">'
                '<img src="{}" style="max-width:320px;max-height:180px;border-radius:6px;'
                'border:1px solid #3f3f46;box-shadow:0 4px 12px rgba(0,0,0,0.2);" />'
                '<p style="margin:4px 0 0;font-size:12px;color:#71717a;">'
                '<a href="{}" target="_blank">Open Full Image in New Tab ↗</a></p></div>',
                obj.featured_image.url, obj.featured_image.url
            )
        return "No image uploaded yet. Upload a project screenshot or mockup."

    @admin.display(description="Metrics")
    def metrics_count(self, obj):
        count = obj.metrics.count()
        return format_html(
            '<span style="background:#18181b;color:#f4f4f5;padding:2px 7px;'
            'border-radius:10px;font-size:11px;font-weight:600;">{}</span>',
            count
        )

    @admin.display(description="Techs")
    def tech_count(self, obj):
        count = obj.technologies.count()
        return format_html(
            '<span style="background:#18181b;color:#38bdf8;padding:2px 7px;'
            'border-radius:10px;font-size:11px;font-weight:600;">{}</span>',
            count
        )

    @admin.display(description="Live Demo")
    def live_demo_link(self, obj):
        if obj.live_demo_url:
            return format_html(
                '<a href="{}" target="_blank" style="background:#064e3b;color:#34d399;'
                'padding:3px 7px;border-radius:4px;font-size:11px;font-weight:600;'
                'text-decoration:none;">Live ↗</a>',
                obj.live_demo_url
            )
        return format_html('<span style="color:#52525b;font-size:11px;">-</span>')

    @admin.display(description="GitHub")
    def github_link(self, obj):
        if obj.github_url:
            return format_html(
                '<a href="{}" target="_blank" style="color:#a1a1aa;font-size:12px;'
                'text-decoration:none;font-family:monospace;">Repo ↗</a>',
                obj.github_url
            )
        return format_html('<span style="color:#52525b;font-size:11px;">-</span>')

    # ---- Bulk Actions ----

    @admin.action(description="Publish selected projects")
    def publish_selected(self, request, queryset):
        updated = queryset.update(is_published=True)
        self.message_user(request, f"{updated} project(s) published successfully.")

    @admin.action(description="Unpublish selected projects (Set as draft)")
    def unpublish_selected(self, request, queryset):
        # Also remove featured status if unpublishing
        updated = queryset.update(is_published=False, is_featured=False)
        self.message_user(request, f"{updated} project(s) set to draft (unpublished).")

    @admin.action(description="Mark selected projects as Featured")
    def feature_selected(self, request, queryset):
        # Automatically publish featured projects
        updated = queryset.update(is_featured=True, is_published=True)
        self.message_user(request, f"{updated} project(s) marked as featured (and published).")

    @admin.action(description="Remove featured status from selected projects")
    def unfeature_selected(self, request, queryset):
        updated = queryset.update(is_featured=False)
        self.message_user(request, f"{updated} project(s) unfeatured.")


# ---------------------------------------------------------------------------
# Experience Admin
# ---------------------------------------------------------------------------

@admin.register(Experience)
class ExperienceAdmin(admin.ModelAdmin):
    """
    Career milestones and internship history.
    Provides inline active-role status and ordering.
    """
    list_display = (
        'position',
        'organization',
        'period_display',
        'period_badge_display',
        'is_current',
        'responsibilities_count_display',
        'technologies_count_display',
        'order',
    )
    list_editable = ('is_current', 'order')
    list_filter = ('is_current', 'period_badge')
    search_fields = ('position', 'organization', 'summary', 'responsibilities', 'project_focus')
    filter_horizontal = ('technologies',)
    ordering = ('order', 'id')

    fieldsets = (
        ('Role & Organization', {
            'fields': ('position', 'organization', 'location', 'project_focus')
        }),
        ('Duration & Status', {
            'fields': ('period_display', 'period_badge', 'start_date', 'end_date', 'is_current'),
            'description': 'Period display is the human-readable text (e.g. "~2 Years Experience" or "Internship Milestone").'
        }),
        ('Narrative & Responsibilities', {
            'fields': ('summary', 'responsibilities'),
            'description': 'Enter responsibilities as bullet points separated by new lines.'
        }),
        ('Technologies Used', {
            'fields': ('technologies',)
        }),
        ('Ordering', {
            'fields': ('order',)
        }),
    )

    def get_queryset(self, request):
        return super().get_queryset(request).prefetch_related('technologies')

    @admin.display(description="Badge")
    def period_badge_display(self, obj):
        return format_html(
            '<span style="background:#1e293b;color:#38bdf8;padding:2px 7px;'
            'border-radius:10px;font-size:11px;font-weight:600;">{}</span>',
            obj.period_badge
        )

    @admin.display(description="Bullets")
    def responsibilities_count_display(self, obj):
        count = len(obj.get_responsibilities_list())
        return format_html(
            '<span style="background:#27272a;color:#f4f4f5;padding:2px 7px;'
            'border-radius:10px;font-size:11px;font-weight:600;">{} points</span>',
            count
        )

    @admin.display(description="Techs")
    def technologies_count_display(self, obj):
        count = obj.technologies.count()
        return format_html(
            '<span style="background:#27272a;color:#34d399;padding:2px 7px;'
            'border-radius:10px;font-size:11px;font-weight:600;">{} techs</span>',
            count
        )


# ---------------------------------------------------------------------------
# Education Admin
# ---------------------------------------------------------------------------

@admin.register(Education)
class EducationAdmin(admin.ModelAdmin):
    """
    Academic degree and university training.
    """
    list_display = (
        'degree',
        'institution',
        'period_display',
        'period_badge_display',
        'capstone_project',
        'curriculum_count_display',
        'order',
    )
    list_editable = ('order',)
    list_filter = ('period_badge',)
    search_fields = ('institution', 'degree', 'field_of_study', 'capstone_project')
    filter_horizontal = ('technologies',)
    ordering = ('order', 'id')

    fieldsets = (
        ('Institution & Degree', {
            'fields': ('institution', 'degree', 'field_of_study', 'location')
        }),
        ('Period', {
            'fields': ('period_display', 'period_badge')
        }),
        ('Academic Content', {
            'fields': ('summary', 'curriculum_highlights', 'capstone_project'),
            'description': 'Enter curriculum highlights separated by new lines.'
        }),
        ('Technologies', {
            'fields': ('technologies',)
        }),
        ('Ordering', {
            'fields': ('order',)
        }),
    )

    def get_queryset(self, request):
        return super().get_queryset(request).prefetch_related('technologies')

    @admin.display(description="Badge")
    def period_badge_display(self, obj):
        return format_html(
            '<span style="background:#1e293b;color:#38bdf8;padding:2px 7px;'
            'border-radius:10px;font-size:11px;font-weight:600;">{}</span>',
            obj.period_badge
        )

    @admin.display(description="Curriculum")
    def curriculum_count_display(self, obj):
        count = len(obj.get_curriculum_list())
        return format_html(
            '<span style="background:#27272a;color:#f4f4f5;padding:2px 7px;'
            'border-radius:10px;font-size:11px;font-weight:600;">{} items</span>',
            count
        )
