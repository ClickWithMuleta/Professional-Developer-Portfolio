import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Layers, Github, ExternalLink, Sparkles, Code2, ArrowUpRight } from 'lucide-react';
import Container from '../../components/common/Container';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';
import ProjectCard from './ProjectCard';
import { useProjects } from '../../hooks/usePortfolio';
import { PROJECT_CATEGORIES, PROJECTS_DATA } from './projectsData';

export const ProjectsSection = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const shouldReduceMotion = useReducedMotion();
  const { projects, categories, loading } = useProjects();

  // Filter projects based on selected category
  const filteredProjects = useMemo(() => {
    if (activeCategory === 'all') return projects;
    return projects.filter((p) => p.filterCategories && p.filterCategories.includes(activeCategory));
  }, [activeCategory, projects]);

  return (
    <section
      id="projects"
      className="py-16 sm:py-24 lg:py-28 bg-canvas-subtle border-y border-stroke-muted scroll-mt-24 relative overflow-hidden"
    >
      <Container>
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 sm:mb-14">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-accent-electric text-xs font-mono font-medium mb-3">
              <Layers className="w-3.5 h-3.5" />
              <span>03 // SELECTED WORK</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-text-primary mb-3">
              Flagship engineering & production software.
            </h2>
            <p className="text-text-secondary text-sm sm:text-base leading-relaxed">
              Real-world systems engineered across financial analytics, healthcare telemedicine, and material inventory management.
            </p>
          </div>

          {/* GitHub Outbound Pill */}
          <a
            href="https://github.com/ClickWithMuleta"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-surface-1 border border-stroke-muted hover:border-stroke-active text-xs font-medium text-text-secondary hover:text-text-primary transition-colors self-start md:self-end"
          >
            <Github className="w-4 h-4 text-accent-electric" />
            <span>ClickWithMuleta on GitHub</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-text-muted" />
          </a>
        </div>

        {/* Interactive Category Filter Tabs */}
        <div className="mb-10 overflow-x-auto pb-2 scrollbar-none">
          <div className="flex items-center gap-1.5 min-w-max bg-surface-1/90 border border-stroke-muted p-1.5 rounded-xl shadow-ambient">
            {categories.map((cat) => {
              const isActive = activeCategory === cat.id;
              const count = cat.id === 'all' 
                ? projects.length 
                : projects.filter((p) => p.filterCategories && p.filterCategories.includes(cat.id)).length;

              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`relative flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg transition-all duration-150 select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                    isActive
                      ? 'text-text-primary'
                      : 'text-text-secondary hover:text-text-primary hover:bg-surface-2'
                  }`}
                  aria-pressed={isActive}
                >
                  {/* Sliding animated indicator pill */}
                  {isActive && (
                    <motion.span
                      layoutId="activeProjectTab"
                      className="absolute inset-0 bg-surface-3 rounded-lg border border-stroke-active -z-10 shadow-sm"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span>{cat.label}</span>
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                      isActive
                        ? 'bg-accent/15 text-accent-electric font-semibold'
                        : 'bg-surface-2 text-text-muted'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Responsive Projects Grid */}
        {filteredProjects.length === 0 ? (
          <EmptyState
            title="No projects match this category"
            description="There are currently no projects matching your active category filter. Try viewing all projects."
            onAction={() => setActiveCategory('all')}
            actionLabel="View All Projects"
          />
        ) : (
          <motion.div
            layout={!shouldReduceMotion}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          >
            <AnimatePresence mode="popLayout">
              {filteredProjects.map((project) => (
                <motion.div
                  key={project.id}
                  layout={!shouldReduceMotion}
                  initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.95 }}
                  transition={{ duration: shouldReduceMotion ? 0.05 : 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className={project.isFeatured ? 'lg:col-span-2' : 'lg:col-span-1'}
                >
                  <ProjectCard project={project} isFeatured={project.isFeatured} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Footer Technical Note */}
        <div className="mt-12 p-5 rounded-xl bg-surface-1/70 border border-stroke-muted flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 text-xs text-text-secondary">
            <span className="w-2 h-2 rounded-full bg-accent-electric inline-block" />
            <span>All repositories and commit histories are publicly auditable on GitHub.</span>
          </div>

          <a
            href="https://github.com/ClickWithMuleta"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-mono text-accent-electric hover:text-accent font-medium transition-colors shrink-0"
          >
            <span>Explore full GitHub profile</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </Container>
    </section>
  );
};

export default ProjectsSection;
