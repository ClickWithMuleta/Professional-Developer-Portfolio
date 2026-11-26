/**
 * Portfolio Context & Data Provider
 * ===================================
 * Central state container for all public portfolio content.
 * Hydrates data from the Django REST API with graceful degradation to
 * verified baseline data if the backend is cold-starting or unavailable.
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import portfolioService, { clearPortfolioCache } from '../services/portfolioService';
import { PROJECTS_DATA, PROJECT_CATEGORIES } from '../features/projects/projectsData';
import { SKILLS_DATA, SKILL_CATEGORIES } from '../features/skills/skillsData';
import { TIMELINE_DATA } from '../features/experience/experienceData';

// ---------------------------------------------------------------------------
// Baseline Verified Profile (Strictly accurate - zero fabricated data)
// ---------------------------------------------------------------------------
const BASELINE_PROFILE = {
  id: 1,
  fullName: 'Muleta Sisay',
  title: 'Software Developer',
  headline: 'Building scalable software that turns complex ideas into real-world solutions.',
  bio: 'Software developer with a Computer Science background from Haramaya University who enjoys building practical applications, solving engineering problems, and working across backend, frontend, databases, APIs, and machine learning.',
  avatarUrl: null,
  email: 'clickwithmuleta@gmail.com',
  githubUrl: 'https://github.com/ClickWithMuleta',
  linkedinUrl: 'https://linkedin.com/in/muleta-sisay',
  location: 'Addis Ababa, Ethiopia',
  resumeUrl: '/resume.pdf',
  availabilityStatus: 'Available for opportunities',
};

// ---------------------------------------------------------------------------
// Context Definition
// ---------------------------------------------------------------------------
const PortfolioContext = createContext(null);

export const PortfolioProvider = ({ children }) => {
  const [profile, setProfile] = useState(BASELINE_PROFILE);
  const [projects, setProjects] = useState(PROJECTS_DATA);
  const [projectCategories, setProjectCategories] = useState(PROJECT_CATEGORIES);
  const [skills, setSkills] = useState(SKILLS_DATA);
  const [skillCategories, setSkillCategories] = useState(SKILL_CATEGORIES);
  const [timeline, setTimeline] = useState(TIMELINE_DATA);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLive, setIsLive] = useState(false);

  // Hydrate data from Django API
  const hydratePortfolio = useCallback(async (forceRefresh = false) => {
    if (forceRefresh) {
      clearPortfolioCache();
    }
    setLoading(true);
    setError(null);

    try {
      const bundle = await portfolioService.getPortfolioBundle();
      let hasLiveContent = false;

      // 1. Profile
      if (bundle.profile) {
        setProfile((prev) => ({ ...prev, ...bundle.profile }));
        hasLiveContent = true;
      }

      // 2. Projects (only replace if backend returned items)
      if (bundle.projects && bundle.projects.length > 0) {
        setProjects(bundle.projects);
        hasLiveContent = true;
      }

      // 3. Skills & Categories
      if (bundle.categories && bundle.categories.length > 0) {
        // Flatten nested skills for the grid
        const allSkills = bundle.categories.flatMap((cat) => cat.skills || []);
        if (allSkills.length > 0) {
          setSkills(allSkills);
          // Build category filters dynamically from API response
          const dynamicTabs = [
            { id: 'all', label: 'All Stack' },
            ...bundle.categories.map((c) => ({ id: c.id, label: c.label })),
          ];
          setSkillCategories(dynamicTabs);
          hasLiveContent = true;
        }
      }

      // 4. Timeline (Experience + Education)
      const liveExperiences = bundle.experience || [];
      const liveEducations = bundle.education || [];
      if (liveExperiences.length > 0 || liveEducations.length > 0) {
        const mergedTimeline = [...liveExperiences, ...liveEducations].sort(
          (a, b) => (a.order ?? 0) - (b.order ?? 0)
        );
        setTimeline(mergedTimeline);
        hasLiveContent = true;
      }

      // Backend is considered live if ANY endpoint succeeded (even if some DB tables are empty)
      const liveStatus = bundle.isAnyFulfilled || hasLiveContent;
      setIsLive(liveStatus);
      if (liveStatus) {
        console.info('[PortfolioContext] Django API connection active.');
      } else {
        console.warn('[PortfolioContext] Django API unreachable or all endpoints failed. Serving fallback archive.');
      }
    } catch (err) {
      console.warn('Portfolio API unreachable — maintaining verified fallback content.', err);
      setError(err);
      setIsLive(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    hydratePortfolio();
  }, [hydratePortfolio]);

  const value = useMemo(
    () => ({
      profile,
      projects,
      projectCategories,
      skills,
      skillCategories,
      timeline,
      loading,
      error,
      isLive,
      refetch: () => hydratePortfolio(true),
    }),
    [
      profile,
      projects,
      projectCategories,
      skills,
      skillCategories,
      timeline,
      loading,
      error,
      isLive,
      hydratePortfolio,
    ]
  );

  return (
    <PortfolioContext.Provider value={value}>
      {children}
    </PortfolioContext.Provider>
  );
};

// ---------------------------------------------------------------------------
// Custom Hook to consume Portfolio Context
// ---------------------------------------------------------------------------
export const usePortfolio = () => {
  const context = useContext(PortfolioContext);
  if (!context) {
    throw new Error('usePortfolio must be used within a PortfolioProvider');
  }
  return context;
};

export default PortfolioContext;
