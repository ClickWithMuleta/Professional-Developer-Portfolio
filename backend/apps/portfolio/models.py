from django.db import models
from django.core.exceptions import ValidationError
from django.utils.text import slugify
from apps.core.models import TimeStampedModel


class Profile(TimeStampedModel):
    """
    Developer profile and personal identity.
    Represents Muleta Sisay's professional bio, contacts, and availability.
    """
    full_name = models.CharField(max_length=120, default="Muleta Sisay")
    title = models.CharField(max_length=160, default="Software Developer")
    headline = models.CharField(
        max_length=255, 
        default="Building scalable software that turns complex ideas into real-world solutions."
    )
    bio = models.TextField(
        help_text="Detailed engineering narrative and background summary."
    )
    avatar = models.ImageField(
        upload_to='profile/', 
        blank=True, 
        null=True,
        help_text="Professional headshot or profile photograph."
    )
    email = models.EmailField(default="clickwithmuleta@gmail.com")
    github_url = models.URLField(default="https://github.com/ClickWithMuleta")
    linkedin_url = models.URLField(default="https://linkedin.com/in/muleta-sisay", blank=True)
    location = models.CharField(max_length=120, default="Addis Ababa, Ethiopia")
    resume = models.FileField(
        upload_to='resumes/', 
        blank=True, 
        null=True,
        help_text="Downloadable CV or Resume PDF."
    )
    availability_status = models.CharField(
        max_length=80, 
        default="Available for opportunities"
    )
    is_active = models.BooleanField(
        default=True,
        help_text="Designates whether this profile should be published as the active site profile."
    )

    class Meta:
        verbose_name = "Developer Profile"
        verbose_name_plural = "Developer Profiles"

    def clean(self):
        super().clean()
        if self.email:
            self.email = self.email.strip().lower()

    def save(self, *args, **kwargs):
        # Guarantee single active profile rule
        if self.is_active:
            Profile.objects.exclude(pk=self.pk).filter(is_active=True).update(is_active=False)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.full_name} ({self.title})"


class SkillCategory(models.Model):
    """
    Categorization of engineering tools and skills.
    e.g., Backend & APIs, Frontend & UI, Languages, Databases, AI & ML, Tools.
    """
    name = models.CharField(max_length=80, unique=True)
    slug = models.SlugField(max_length=80, unique=True)
    order = models.PositiveIntegerField(default=0, db_index=True)

    class Meta:
        verbose_name = "Skill Category"
        verbose_name_plural = "Skill Categories"
        ordering = ['order', 'name']

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class Skill(models.Model):
    """
    Individual technical competence, framework, or programming language.
    Does not use fake percentages; uses context badges and practical descriptions.
    """
    category = models.ForeignKey(
        SkillCategory, 
        related_name='skills', 
        on_delete=models.CASCADE
    )
    name = models.CharField(max_length=80, unique=True)
    slug = models.SlugField(max_length=80, unique=True)
    icon_key = models.CharField(
        max_length=50, 
        default="code", 
        help_text="Identifier for the frontend icon mapping (e.g. django, python, react, database, cpu)."
    )
    context_badge = models.CharField(
        max_length=60, 
        blank=True,
        help_text="Architectural context badge, e.g. 'Flagship Backend', 'Relational Schema', 'Gradient Boosting'."
    )
    description = models.TextField(
        blank=True,
        help_text="Concise description of real production usage."
    )
    order = models.PositiveIntegerField(default=0, db_index=True)
    is_flagship = models.BooleanField(
        default=False,
        help_text="Highlights core technologies featured in flagship systems."
    )

    class Meta:
        verbose_name = "Skill & Technology"
        verbose_name_plural = "Skills & Technologies"
        ordering = ['category__order', 'order', 'name']

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name} ({self.category.name})"


class Project(TimeStampedModel):
    """
    Software engineering project showcase.
    Supports flagship highlighting, GitHub/live links, and nested technology tags.
    """
    CATEGORY_CHOICES = [
        ('AI & Financial Tech', 'AI & Financial Tech'),
        ('Healthcare & Telemedicine', 'Healthcare & Telemedicine'),
        ('Enterprise & Inventory', 'Enterprise & Inventory'),
        ('Full-Stack Web', 'Full-Stack Web'),
        ('Machine Learning', 'Machine Learning'),
    ]

    title = models.CharField(max_length=160, unique=True)
    slug = models.SlugField(max_length=160, unique=True, db_index=True)
    subtitle = models.CharField(max_length=200, blank=True)
    category = models.CharField(max_length=80, choices=CATEGORY_CHOICES, default='Full-Stack Web')
    short_description = models.TextField(
        help_text="Brief compelling overview displayed on the project card."
    )
    detailed_description = models.TextField(
        blank=True,
        help_text="In-depth case study, problem statement, architecture, and engineering tradeoffs."
    )
    featured_image = models.ImageField(
        upload_to='projects/', 
        blank=True, 
        null=True,
        help_text="Cover graphic or project mockup screenshot."
    )
    github_url = models.URLField(
        blank=True,
        help_text="Public GitHub repository URL."
    )
    live_demo_url = models.URLField(
        blank=True, 
        null=True,
        help_text="Live production or demo URL. Leave empty if unhosted."
    )
    technologies = models.ManyToManyField(
        Skill, 
        related_name='projects', 
        blank=True,
        help_text="Technologies and frameworks utilized in this project."
    )
    is_featured = models.BooleanField(
        default=False, 
        db_index=True,
        help_text="Highlights this project prominently as a flagship system."
    )
    is_published = models.BooleanField(
        default=True, 
        db_index=True,
        help_text="Controls public visibility in the portfolio."
    )
    order = models.PositiveIntegerField(
        default=0, 
        db_index=True,
        help_text="Display order in the project showcase (lower numbers appear first)."
    )

    class Meta:
        verbose_name = "Project"
        verbose_name_plural = "Projects"
        ordering = ['order', '-created_at']

    def clean(self):
        super().clean()
        if self.is_featured and not self.is_published:
            raise ValidationError({
                'is_featured': 'A project cannot be marked as featured while it is unpublished.'
            })

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title


class ProjectMetric(models.Model):
    """
    Quantifiable metric or technical highlights for a project.
    e.g., 'ML Models': 'LightGBM + Random Forest', 'Database': 'PostgreSQL'.
    """
    project = models.ForeignKey(
        Project, 
        related_name='metrics', 
        on_delete=models.CASCADE
    )
    label = models.CharField(max_length=80)
    value = models.CharField(max_length=120)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        verbose_name = "Project Metric"
        verbose_name_plural = "Project Metrics"
        ordering = ['order', 'id']

    def __str__(self):
        return f"{self.project.title} — {self.label}: {self.value}"


class Experience(models.Model):
    """
    Career milestones, full-stack software development, and internship history.
    """
    position = models.CharField(max_length=120)
    organization = models.CharField(max_length=160)
    location = models.CharField(max_length=120, default="Addis Ababa, ET")
    period_display = models.CharField(
        max_length=80, 
        help_text="Human-readable duration, e.g. '~2 Years Experience' or 'Internship'."
    )
    period_badge = models.CharField(
        max_length=60, 
        default="Active Focus",
        help_text="Status badge, e.g. 'Active Focus' or 'Internship Milestone'."
    )
    start_date = models.DateField(blank=True, null=True)
    end_date = models.DateField(blank=True, null=True)
    is_current = models.BooleanField(default=False)
    project_focus = models.CharField(
        max_length=160, 
        blank=True,
        help_text="Flagship project engineered during this role, e.g. 'Accessories Management System'."
    )
    summary = models.TextField(
        help_text="Overview of development scope and architectural responsibility."
    )
    responsibilities = models.TextField(
        help_text="Key engineering responsibilities, separated by newlines."
    )
    technologies = models.ManyToManyField(
        Skill, 
        related_name='experiences', 
        blank=True
    )
    order = models.PositiveIntegerField(default=0, db_index=True)

    class Meta:
        verbose_name = "Experience Milestone"
        verbose_name_plural = "Experience Milestones"
        ordering = ['order', 'id']

    def clean(self):
        super().clean()
        if self.start_date and self.end_date and self.end_date < self.start_date:
            raise ValidationError({
                'end_date': 'End date cannot be earlier than start date.'
            })
        if self.is_current and self.end_date:
            raise ValidationError({
                'end_date': 'An active/current role should not have an end date.'
            })

    def get_responsibilities_list(self):
        """Splits newline-separated responsibilities into a clean list."""
        if not self.responsibilities:
            return []
        return [r.strip() for r in self.responsibilities.split('\n') if r.strip()]

    def __str__(self):
        return f"{self.position} at {self.organization}"


class Education(models.Model):
    """
    Academic degree and university training.
    """
    institution = models.CharField(max_length=160, default="Haramaya University")
    degree = models.CharField(max_length=120, default="BSc in Computer Science")
    field_of_study = models.CharField(max_length=120, default="Computer Science")
    location = models.CharField(max_length=120, default="Haramaya, ET")
    period_display = models.CharField(max_length=80, default="Graduated")
    period_badge = models.CharField(max_length=60, default="Academic Degree")
    summary = models.TextField(
        help_text="Overview of academic training and foundational coursework."
    )
    curriculum_highlights = models.TextField(
        help_text="Key academic modules and disciplines, separated by newlines."
    )
    capstone_project = models.CharField(
        max_length=160, 
        default="eHospital For Harar City", 
        blank=True,
        help_text="Final-year capstone project."
    )
    technologies = models.ManyToManyField(
        Skill, 
        related_name='educations', 
        blank=True
    )
    order = models.PositiveIntegerField(default=0, db_index=True)

    class Meta:
        verbose_name = "Education Milestone"
        verbose_name_plural = "Education Milestones"
        ordering = ['order', 'id']

    def get_curriculum_list(self):
        """Splits newline-separated curriculum highlights into a clean list."""
        if not self.curriculum_highlights:
            return []
        return [c.strip() for c in self.curriculum_highlights.split('\n') if c.strip()]

    def __str__(self):
        return f"{self.degree} — {self.institution}"
