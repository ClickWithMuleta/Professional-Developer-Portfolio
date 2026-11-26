/**
 * Granular Portfolio Hooks
 * =========================
 * Provides targeted data slices for individual portfolio sections.
 * Automatically avoids re-renders on unrelated state changes.
 */

import { usePortfolio } from '../context/PortfolioContext';

/**
 * Hook for Hero, About, Navbar, and Footer developer identity
 */
export const useProfile = () => {
  const { profile, loading, error, isLive, refetch } = usePortfolio();
  return { profile, loading, error, isLive, refetch };
};

/**
 * Hook for Projects showcase section
 */
export const useProjects = () => {
  const { projects, projectCategories, loading, error, isLive, refetch } = usePortfolio();
  return { projects, categories: projectCategories, loading, error, isLive, refetch };
};

/**
 * Hook for Skills & technologies section
 */
export const useSkills = () => {
  const { skills, skillCategories, loading, error, isLive, refetch } = usePortfolio();
  return { skills, categories: skillCategories, loading, error, isLive, refetch };
};

/**
 * Hook for Career & Education timeline section
 */
export const useTimeline = () => {
  const { timeline, loading, error, isLive, refetch } = usePortfolio();
  return { timeline, loading, error, isLive, refetch };
};

/**
 * Hook for system connection & telemetry status
 */
export const usePortfolioStatus = () => {
  const { loading, error, isLive, refetch } = usePortfolio();
  return { loading, error, isLive, refetch };
};

export default usePortfolio;
