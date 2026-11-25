"""
Custom template tags for Django Admin Dashboard summary.
Delivers real-time portfolio metrics to templates/admin/index.html.
"""

from django import template
from apps.portfolio.models import Project, Skill, SkillCategory, Profile
from apps.contact.models import ContactMessage

register = template.Library()


@register.simple_tag
def get_admin_dashboard_metrics():
    """
    Computes summary metrics for the admin dashboard header.
    Runs fast count queries to ensure zero latency overhead.
    """
    total_projects = Project.objects.count()
    published_projects = Project.objects.filter(is_published=True).count()
    featured_projects = Project.objects.filter(is_featured=True, is_published=True).count()

    total_skills = Skill.objects.count()
    flagship_skills = Skill.objects.filter(is_flagship=True).count()
    categories_count = SkillCategory.objects.count()

    unread_messages = ContactMessage.objects.filter(is_read=False).count()
    total_messages = ContactMessage.objects.count()

    active_profile = Profile.objects.filter(is_active=True).first()

    return {
        'total_projects': total_projects,
        'published_projects': published_projects,
        'draft_projects': total_projects - published_projects,
        'featured_projects': featured_projects,
        'total_skills': total_skills,
        'flagship_skills': flagship_skills,
        'categories_count': categories_count,
        'unread_messages': unread_messages,
        'total_messages': total_messages,
        'active_profile': active_profile,
    }
