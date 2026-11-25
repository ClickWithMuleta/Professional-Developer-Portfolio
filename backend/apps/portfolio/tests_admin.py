"""
Phase 5.5 - Django Admin Tests
==============================
Tests for admin dashboard customizations, model validations, custom actions,
and admin changelist performance.

Run:
    backend\\venv\\Scripts\\python.exe backend\\manage.py test apps.portfolio.tests_admin --settings=core_project.settings.development -v 2
"""

from datetime import date
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.test import TestCase
from django.urls import reverse

from apps.portfolio.models import (
    Profile,
    SkillCategory,
    Skill,
    Project,
    Experience,
    Education,
)
from apps.contact.models import ContactMessage
from apps.core.templatetags.portfolio_admin_tags import get_admin_dashboard_metrics


User = get_user_model()


class AdminModelValidationTests(TestCase):
    """Test model clean() validations introduced in Phase 5.5."""

    def test_project_cannot_be_featured_while_unpublished(self):
        project = Project(
            title="Unpublished Flagship",
            is_published=False,
            is_featured=True,
            short_description="Short desc",
        )
        with self.assertRaises(ValidationError) as ctx:
            project.clean()
        self.assertIn('is_featured', ctx.exception.message_dict)

    def test_project_can_be_featured_when_published(self):
        project = Project(
            title="Published Flagship",
            is_published=True,
            is_featured=True,
            short_description="Short desc",
        )
        try:
            project.clean()
        except ValidationError:
            self.fail("project.clean() raised ValidationError unexpectedly")

    def test_profile_single_active_guarantee_on_save(self):
        p1 = Profile.objects.create(full_name="Profile 1", is_active=True)
        self.assertTrue(p1.is_active)

        # Creating or activating p2 must deactivate p1
        p2 = Profile.objects.create(full_name="Profile 2", is_active=True)
        p1.refresh_from_db()

        self.assertFalse(p1.is_active)
        self.assertTrue(p2.is_active)

    def test_experience_end_date_cannot_be_prior_to_start_date(self):
        exp = Experience(
            position="Dev",
            organization="Org",
            start_date=date(2024, 1, 1),
            end_date=date(2023, 1, 1),
            summary="Summary",
            responsibilities="Resp",
        )
        with self.assertRaises(ValidationError) as ctx:
            exp.clean()
        self.assertIn('end_date', ctx.exception.message_dict)

    def test_experience_current_role_cannot_have_end_date(self):
        exp = Experience(
            position="Dev",
            organization="Org",
            start_date=date(2024, 1, 1),
            end_date=date(2024, 12, 1),
            is_current=True,
            summary="Summary",
            responsibilities="Resp",
        )
        with self.assertRaises(ValidationError) as ctx:
            exp.clean()
        self.assertIn('end_date', ctx.exception.message_dict)


class AdminDashboardTagTests(TestCase):
    """Test the get_admin_dashboard_metrics template tag."""

    def test_metrics_calculation(self):
        cat = SkillCategory.objects.create(name="Backend", slug="backend", order=0)
        Skill.objects.create(name="Django", slug="django", category=cat, is_flagship=True)
        Skill.objects.create(name="Python", slug="python", category=cat, is_flagship=False)

        Project.objects.create(
            title="Proj 1",
            slug="proj-1",
            is_published=True,
            is_featured=True,
            short_description="Desc",
        )
        Project.objects.create(
            title="Proj 2",
            slug="proj-2",
            is_published=False,
            is_featured=False,
            short_description="Desc",
        )

        ContactMessage.objects.create(
            sender_name="Alice",
            sender_email="alice@example.com",
            subject="Inquiry",
            message_body="Hello there!",
            is_read=False,
        )

        Profile.objects.create(full_name="Muleta Sisay", title="Software Developer", is_active=True)

        metrics = get_admin_dashboard_metrics()
        self.assertEqual(metrics['total_projects'], 2)
        self.assertEqual(metrics['published_projects'], 1)
        self.assertEqual(metrics['featured_projects'], 1)
        self.assertEqual(metrics['total_skills'], 2)
        self.assertEqual(metrics['flagship_skills'], 1)
        self.assertEqual(metrics['categories_count'], 1)
        self.assertEqual(metrics['unread_messages'], 1)
        self.assertEqual(metrics['total_messages'], 1)
        self.assertIsNotNone(metrics['active_profile'])
        self.assertEqual(metrics['active_profile'].full_name, "Muleta Sisay")


class AdminViewsChangelistTests(TestCase):
    """Test authenticated superuser access to admin changelists."""

    def setUp(self):
        self.admin_user = User.objects.create_superuser(
            username='testadmin',
            email='admin@example.com',
            password='testpassword123',
        )
        self.client.login(username='testadmin', password='testpassword123')

    def test_admin_index_dashboard_accessible(self):
        resp = self.client.get('/admin/')
        self.assertEqual(resp.status_code, 200)
        self.assertContains(resp, "Portfolio Control Center")

    def test_project_changelist_accessible(self):
        resp = self.client.get(reverse('admin:portfolio_project_changelist'))
        self.assertEqual(resp.status_code, 200)

    def test_skill_changelist_accessible(self):
        resp = self.client.get(reverse('admin:portfolio_skill_changelist'))
        self.assertEqual(resp.status_code, 200)

    def test_skillcategory_changelist_accessible(self):
        resp = self.client.get(reverse('admin:portfolio_skillcategory_changelist'))
        self.assertEqual(resp.status_code, 200)

    def test_profile_changelist_accessible(self):
        resp = self.client.get(reverse('admin:portfolio_profile_changelist'))
        self.assertEqual(resp.status_code, 200)

    def test_experience_changelist_accessible(self):
        resp = self.client.get(reverse('admin:portfolio_experience_changelist'))
        self.assertEqual(resp.status_code, 200)

    def test_education_changelist_accessible(self):
        resp = self.client.get(reverse('admin:portfolio_education_changelist'))
        self.assertEqual(resp.status_code, 200)

    def test_contactmessage_changelist_accessible(self):
        ContactMessage.objects.create(
            sender_name="Bob",
            sender_email="bob@example.com",
            subject="Hello",
            message_body="Test message body for admin changelist test",
        )
        resp = self.client.get(reverse('admin:contact_contactmessage_changelist'))
        self.assertEqual(resp.status_code, 200)
        self.assertContains(resp, "Mark selected messages as Read")
