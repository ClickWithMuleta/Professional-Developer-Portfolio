"""
Phase 6.2 - Portfolio REST API Integration Tests
================================================
Comprehensive verification of all public portfolio endpoints against
the integration review requirements:
  - Profile (load, missing, error handling)
  - Projects (published, featured, filtering, detail by slug, unpublished protection, missing 404)
  - Skills (flat list, nested categories, filtering by flagship/category)
  - Experience and Education (data loads, ordering, empty data handling)
"""

from rest_framework import status
from rest_framework.test import APITestCase
from apps.portfolio.models import (
    Profile,
    SkillCategory,
    Skill,
    Project,
    ProjectMetric,
    Experience,
    Education,
)


class ProfileApiTests(APITestCase):
    """Profile scenario tests: load, missing profile, schema validity."""

    def setUp(self):
        self.url = '/api/v1/profile/'

    def test_profile_loads_successfully(self):
        """Profile loads with 200 and matches standard envelope."""
        Profile.objects.create(
            full_name="Muleta Sisay",
            title="Software Developer",
            headline="Building scalable software",
            bio="CS graduate and developer",
            email="clickwithmuleta@gmail.com",
            is_active=True,
        )

        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertTrue(data['success'])
        self.assertIsNone(data['error'])
        self.assertEqual(data['data']['full_name'], "Muleta Sisay")
        self.assertEqual(data['data']['email'], "clickwithmuleta@gmail.com")
        self.assertIn('meta', data)
        self.assertEqual(data['meta']['version'], 'v1')

    def test_missing_profile_handled_gracefully(self):
        """When no active profile exists, returns 404 with structured envelope."""
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        data = response.json()
        self.assertFalse(data['success'])
        self.assertIsNone(data['data'])
        self.assertEqual(data['error']['code'], 'NOT_FOUND')
        self.assertIn('Developer profile not found', data['error']['message'])

    def test_inactive_profile_is_not_served(self):
        """Profiles with is_active=False must not be exposed."""
        Profile.objects.create(
            full_name="Draft Profile",
            email="draft@example.com",
            is_active=False,
        )
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)


class ProjectApiTests(APITestCase):
    """Project scenario tests: published, featured, filtering, slug lookup, access control."""

    def setUp(self):
        self.list_url = '/api/v1/projects/'
        self.featured_url = '/api/v1/projects/featured/'

        # Setup Category & Skills
        self.cat = SkillCategory.objects.create(name="Full-Stack", slug="full-stack", order=1)
        self.python_skill = Skill.objects.create(name="Python", slug="python", category=self.cat, order=1)
        self.django_skill = Skill.objects.create(name="Django", slug="django", category=self.cat, order=2)

        # Published standard project
        self.proj_published = Project.objects.create(
            title="Smart Cashflow Tracker",
            slug="smart-cashflow-tracker",
            category="AI & Financial Tech",
            short_description="Financial management tool",
            detailed_description="Comprehensive architecture and engineering tradeoffs.",
            highlights="Forecasting\nAnomaly detection",
            is_featured=False,
            is_published=True,
            order=2,
        )
        self.proj_published.technologies.add(self.python_skill, self.django_skill)
        ProjectMetric.objects.create(project=self.proj_published, label="Database", value="PostgreSQL", order=1)

        # Published featured flagship project
        self.proj_featured = Project.objects.create(
            title="Flagship Platform",
            slug="flagship-platform",
            category="Full-Stack Web",
            short_description="Flagship enterprise platform",
            is_featured=True,
            is_published=True,
            order=1,
        )

        # Unpublished draft project
        self.proj_unpublished = Project.objects.create(
            title="Secret Internal Tool",
            slug="secret-internal-tool",
            category="Enterprise & Inventory",
            short_description="Unpublished internal tool",
            is_featured=False,
            is_published=False,
            order=0,
        )

    def test_all_published_projects_load_and_ordered(self):
        """Published projects load ordered by 'order' ASC; unpublished excluded."""
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertTrue(data['success'])
        self.assertEqual(len(data['data']), 2)
        # Order check: order 1 (Flagship) then order 2 (Cashflow)
        self.assertEqual(data['data'][0]['slug'], "flagship-platform")
        self.assertEqual(data['data'][1]['slug'], "smart-cashflow-tracker")
        self.assertEqual(data['meta']['count'], 2)

    def test_featured_projects_load(self):
        """GET /projects/featured/ returns only featured published projects."""
        response = self.client.get(self.featured_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertEqual(len(data['data']), 1)
        self.assertEqual(data['data'][0]['slug'], "flagship-platform")
        self.assertTrue(data['data'][0]['is_featured'])

    def test_project_filtering_works(self):
        """Query param ?category= filters projects correctly."""
        response = self.client.get(f"{self.list_url}?category=AI+%26+Financial+Tech")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertEqual(len(data['data']), 1)
        self.assertEqual(data['data'][0]['slug'], "smart-cashflow-tracker")

    def test_project_details_load_by_slug(self):
        """Project details include detailed_description, metrics, and highlights."""
        response = self.client.get(f"/api/v1/projects/{self.proj_published.slug}/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertTrue(data['success'])
        proj = data['data']
        self.assertEqual(proj['title'], "Smart Cashflow Tracker")
        self.assertEqual(proj['detailed_description'], "Comprehensive architecture and engineering tradeoffs.")
        self.assertEqual(proj['highlights'], ["Forecasting", "Anomaly detection"])
        self.assertEqual(len(proj['metrics']), 1)
        self.assertEqual(proj['metrics'][0]['label'], "Database")
        self.assertEqual(len(proj['technologies']), 2)

    def test_unpublished_projects_cannot_be_accessed_publicly(self):
        """Unpublished projects return 404 when accessed directly by slug."""
        response = self.client.get(f"/api/v1/projects/{self.proj_unpublished.slug}/")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        data = response.json()
        self.assertFalse(data['success'])
        self.assertEqual(data['error']['code'], 'NOT_FOUND')

    def test_missing_project_handled_correctly(self):
        """Non-existent project slug returns 404 with structured error."""
        response = self.client.get("/api/v1/projects/non-existent-slug/")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        data = response.json()
        self.assertFalse(data['success'])
        self.assertEqual(data['error']['code'], 'NOT_FOUND')


class SkillApiTests(APITestCase):
    """Skill scenario tests: flat list, categories grouping, filtering."""

    def setUp(self):
        self.cat1 = SkillCategory.objects.create(name="Backend", slug="backend", order=1)
        self.cat2 = SkillCategory.objects.create(name="Frontend", slug="frontend", order=2)

        self.s1 = Skill.objects.create(
            name="Django", slug="django", category=self.cat1, is_flagship=True, order=1
        )
        self.s2 = Skill.objects.create(
            name="Celery", slug="celery", category=self.cat1, is_flagship=False, order=2
        )
        self.s3 = Skill.objects.create(
            name="React", slug="react", category=self.cat2, is_flagship=True, order=1
        )

    def test_skills_flat_list_loads(self):
        """GET /api/v1/skills/ returns all skills."""
        response = self.client.get('/api/v1/skills/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertEqual(len(data['data']), 3)

    def test_skills_categories_nested_work(self):
        """GET /api/v1/skills/categories/ returns categories with nested skills."""
        response = self.client.get('/api/v1/skills/categories/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertEqual(len(data['data']), 2)
        # Check first category has 2 skills
        backend_cat = next(c for c in data['data'] if c['slug'] == 'backend')
        self.assertEqual(len(backend_cat['skills']), 2)
        self.assertEqual(backend_cat['skill_count'], 2)

    def test_skills_filtering_flagship(self):
        """Filter ?flagship=true returns only flagship skills."""
        response = self.client.get('/api/v1/skills/?flagship=true')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertEqual(len(data['data']), 2)
        slugs = [s['slug'] for s in data['data']]
        self.assertIn('django', slugs)
        self.assertIn('react', slugs)
        self.assertNotIn('celery', slugs)

    def test_skills_filtering_by_category_slug(self):
        """Filter ?category=frontend returns only frontend skills."""
        response = self.client.get('/api/v1/skills/?category=frontend')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertEqual(len(data['data']), 1)
        self.assertEqual(data['data'][0]['slug'], 'react')


class ExperienceEducationApiTests(APITestCase):
    """Experience and Education scenario tests: loads, ordering, empty states."""

    def test_empty_experience_and_education_handled(self):
        """Empty tables return 200 with empty list and zero count."""
        resp_exp = self.client.get('/api/v1/experience/')
        self.assertEqual(resp_exp.status_code, status.HTTP_200_OK)
        data_exp = resp_exp.json()
        self.assertTrue(data_exp['success'])
        self.assertEqual(data_exp['data'], [])
        self.assertEqual(data_exp['meta']['count'], 0)

        resp_edu = self.client.get('/api/v1/education/')
        self.assertEqual(resp_edu.status_code, status.HTTP_200_OK)
        data_edu = resp_edu.json()
        self.assertTrue(data_edu['success'])
        self.assertEqual(data_edu['data'], [])

    def test_experience_loads_and_ordering_correct(self):
        """Experience records return in order ASC with parsed responsibilities."""
        Experience.objects.create(
            position="Junior Developer",
            organization="Org B",
            responsibilities="Task 1\nTask 2",
            order=2,
        )
        Experience.objects.create(
            position="Senior Developer",
            organization="Org A",
            responsibilities="Architecting systems\nCode reviews",
            order=1,
        )

        response = self.client.get('/api/v1/experience/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertEqual(len(data['data']), 2)
        # Order verification
        self.assertEqual(data['data'][0]['position'], "Senior Developer")
        self.assertEqual(data['data'][1]['position'], "Junior Developer")
        self.assertEqual(
            data['data'][0]['responsibilities_list'],
            ["Architecting systems", "Code reviews"],
        )

    def test_education_loads_and_ordering_correct(self):
        """Education records return in order ASC with parsed curriculum."""
        Education.objects.create(
            degree="BSc in Computer Science",
            institution="Haramaya University",
            curriculum_highlights="Data Structures\nOperating Systems",
            order=1,
        )

        response = self.client.get('/api/v1/education/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertEqual(len(data['data']), 1)
        self.assertEqual(data['data'][0]['degree'], "BSc in Computer Science")
        self.assertEqual(
            data['data'][0]['curriculum_list'],
            ["Data Structures", "Operating Systems"],
        )
