/**
 * Portfolio API Service Layer
 * =============================
 * Handles all public, read-only communications with the Django REST API.
 * Includes in-memory request caching (5-minute TTL) and data normalization
 * to decouple React components from backend response schema nuances.
 */

import apiClient from './apiClient.js';

// ---------------------------------------------------------------------------
// In-Memory Request Cache (prevents duplicate requests & re-render spikes)
// ---------------------------------------------------------------------------
const cache = new Map();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export const clearPortfolioCache = () => {
  cache.clear();
};

const withCache = async (cacheKey, fetcherFn) => {
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  const data = await fetcherFn();
  cache.set(cacheKey, { data, timestamp: Date.now() });
  return data;
};

// ---------------------------------------------------------------------------
// Category Derivation Helper for Projects
// ---------------------------------------------------------------------------
const deriveFilterCategories = (project) => {
  const categories = ['all'];
  if (project.is_featured) {
    categories.push('featured');
  }
  const catLower = (project.category || '').toLowerCase();
  if (catLower.includes('ai') || catLower.includes('machine learning') || catLower.includes('financial')) {
    categories.push('ml');
  }
  if (
    catLower.includes('full-stack') ||
    catLower.includes('web') ||
    catLower.includes('healthcare') ||
    catLower.includes('enterprise')
  ) {
    categories.push('fullstack');
  }
  return categories;
};

// ---------------------------------------------------------------------------
// Data Normalizers (Backend snake_case -> Frontend camelCase with safe defaults)
// ---------------------------------------------------------------------------

export const normalizeProfile = (data) => {
  if (!data) return null;
  return {
    id: data.id || 1,
    fullName: data.full_name || 'Muleta Sisay',
    title: data.title || 'Software Developer',
    headline:
      data.headline ||
      'Building scalable software that turns complex ideas into real-world solutions.',
    bio: data.bio || '',
    avatarUrl: data.avatar_url || null,
    email: data.email || 'clickwithmuleta@gmail.com',
    githubUrl: data.github_url || 'https://github.com/ClickWithMuleta',
    linkedinUrl: data.linkedin_url || 'https://linkedin.com/in/muleta-sisay',
    location: data.location || 'Addis Ababa, Ethiopia',
    resumeUrl: data.resume_url || '/resume.pdf',
    availabilityStatus: data.availability_status || 'Available for opportunities',
  };
};

export const normalizeProject = (data) => {
  if (!data) return null;
  return {
    id: data.slug || String(data.id),
    slug: data.slug,
    title: data.title,
    subtitle: data.subtitle || '',
    category: data.category || 'Full-Stack Web',
    filterCategories: deriveFilterCategories(data),
    isFeatured: Boolean(data.is_featured),
    shortDescription: data.short_description || '',
    detailedDescription: data.detailed_description || '',
    featuredImageUrl: data.featured_image_url || null,
    githubUrl: data.github_url || null,
    liveDemoUrl: data.live_demo_url || null,
    technologies: (data.technologies || []).map((t) =>
      typeof t === 'string' ? t : t.name
    ),
    metrics: (data.metrics || []).map((m) => ({
      label: m.label,
      value: m.value,
    })),
    highlights: Array.isArray(data.highlights) && data.highlights.length > 0
      ? data.highlights
      : (Array.isArray(data.highlights_list) && data.highlights_list.length > 0
          ? data.highlights_list
          : []),
    order: data.order ?? 0,
    createdAt: data.created_at || null,
  };
};

export const normalizeSkill = (data) => {
  if (!data) return null;
  return {
    id: data.slug || String(data.id),
    name: data.name,
    category: data.category_slug || 'other',
    categoryName: data.category_name || '',
    contextBadge: data.context_badge || '',
    description: data.description || '',
    iconKey: data.icon_key || 'code',
    isFlagship: Boolean(data.is_flagship),
    order: data.order ?? 0,
  };
};

export const normalizeSkillCategory = (data) => {
  if (!data) return null;
  return {
    id: data.slug || String(data.id),
    label: data.name,
    order: data.order ?? 0,
    skillCount: data.skill_count || (data.skills ? data.skills.length : 0),
    skills: (data.skills || []).map(normalizeSkill),
  };
};

export const normalizeTimelineItem = (item, type = 'experience') => {
  if (!item) return null;

  if (type === 'experience') {
    return {
      id: `exp-${item.id}`,
      type: 'experience',
      title: item.position,
      organization: item.organization,
      location: item.location || 'Addis Ababa, ET',
      period: item.period_display || '',
      periodBadge: item.period_badge || 'Active Focus',
      isCurrent: Boolean(item.is_current),
      projectFocus: item.project_focus || '',
      summary: item.summary || '',
      responsibilities: item.responsibilities_list || [],
      technologies: (item.technologies || []).map((t) =>
        typeof t === 'string' ? t : t.name
      ),
      order: item.order ?? 0,
    };
  }

  return {
    id: `edu-${item.id}`,
    type: 'education',
    title: item.degree,
    organization: item.institution,
    location: item.location || 'Haramaya, ET',
    period: item.period_display || 'Graduated',
    periodBadge: item.period_badge || 'Academic Degree',
    isCurrent: false,
    projectFocus: item.capstone_project || '',
    summary: item.summary || '',
    responsibilities: item.curriculum_list || [],
    technologies: (item.technologies || []).map((t) =>
      typeof t === 'string' ? t : t.name
    ),
    order: item.order ?? 0,
  };
};

// ---------------------------------------------------------------------------
// Public API Methods
// ---------------------------------------------------------------------------

export const portfolioService = {
  /**
   * Fetch active developer profile
   */
  async getProfile() {
    return withCache('portfolio:profile', async () => {
      const raw = await apiClient.get('/profile/');
      return normalizeProfile(raw);
    });
  },

  /**
   * Fetch all published projects
   */
  async getProjects(params = {}) {
    const cacheKey = `portfolio:projects:${JSON.stringify(params)}`;
    return withCache(cacheKey, async () => {
      const raw = await apiClient.get('/projects/', { params });
      return Array.isArray(raw) ? raw.map(normalizeProject) : [];
    });
  },

  /**
   * Fetch featured flagship projects
   */
  async getFeaturedProjects() {
    return withCache('portfolio:projects:featured', async () => {
      const raw = await apiClient.get('/projects/featured/');
      return Array.isArray(raw) ? raw.map(normalizeProject) : [];
    });
  },

  /**
   * Fetch project details by slug
   */
  async getProjectBySlug(slug) {
    return withCache(`portfolio:project:${slug}`, async () => {
      const raw = await apiClient.get(`/projects/${slug}/`);
      return normalizeProject(raw);
    });
  },

  /**
   * Fetch flat skills list
   */
  async getSkills(params = {}) {
    const cacheKey = `portfolio:skills:${JSON.stringify(params)}`;
    return withCache(cacheKey, async () => {
      const raw = await apiClient.get('/skills/', { params });
      return Array.isArray(raw) ? raw.map(normalizeSkill) : [];
    });
  },

  /**
   * Fetch skills grouped by category (optimal for UI tabs)
   */
  async getSkillCategories() {
    return withCache('portfolio:skills:categories', async () => {
      const raw = await apiClient.get('/skills/categories/');
      return Array.isArray(raw) ? raw.map(normalizeSkillCategory) : [];
    });
  },

  /**
   * Fetch career experience milestones
   */
  async getExperience() {
    return withCache('portfolio:experience', async () => {
      const raw = await apiClient.get('/experience/');
      return Array.isArray(raw)
        ? raw.map((item) => normalizeTimelineItem(item, 'experience'))
        : [];
    });
  },

  /**
   * Fetch academic education milestones
   */
  async getEducation() {
    return withCache('portfolio:education', async () => {
      const raw = await apiClient.get('/education/');
      return Array.isArray(raw)
        ? raw.map((item) => normalizeTimelineItem(item, 'education'))
        : [];
    });
  },

  /**
   * Health check endpoint
   */
  async checkHealth() {
    try {
      const res = await apiClient.get('/health/');
      return res?.status === 'healthy';
    } catch {
      return false;
    }
  },

  /**
   * Load entire portfolio data bundle concurrently
   * Allows single-roundtrip hydration on initial page load
   */
  async getPortfolioBundle() {
    const [profile, projects, categories, experience, education] =
      await Promise.allSettled([
        this.getProfile(),
        this.getProjects(),
        this.getSkillCategories(),
        this.getExperience(),
        this.getEducation(),
      ]);

    const resourceNames = ['profile', 'projects', 'categories', 'experience', 'education'];
    const results = [profile, projects, categories, experience, education];
    let rejectedCount = 0;

    results.forEach((res, index) => {
      if (res.status === 'rejected') {
        rejectedCount += 1;
        console.warn(
          `[Portfolio API] ${resourceNames[index]} fetch failed:`,
          res.reason?.message || res.reason
        );
      }
    });

    return {
      profile: profile.status === 'fulfilled' ? profile.value : null,
      projects: projects.status === 'fulfilled' ? projects.value : null,
      categories: categories.status === 'fulfilled' ? categories.value : null,
      experience: experience.status === 'fulfilled' ? experience.value : null,
      education: education.status === 'fulfilled' ? education.value : null,
      isAnyFulfilled: rejectedCount < results.length,
      allFulfilled: rejectedCount === 0,
    };
  },
};

export default portfolioService;
