import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { 
  Briefcase, 
  GraduationCap, 
  Calendar, 
  MapPin, 
  CheckCircle2, 
  Sparkles, 
  Terminal, 
  ArrowUpRight,
  Building2,
  ExternalLink
} from 'lucide-react';
import Container from '../../components/common/Container';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import { useTimeline } from '../../hooks/usePortfolio';
import { TIMELINE_FILTERS, TIMELINE_DATA } from './experienceData';

export const ExperienceTimeline = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  const shouldReduceMotion = useReducedMotion();
  const { timeline, loading } = useTimeline();

  // Filter items based on active tab
  const filteredData = useMemo(() => {
    if (activeFilter === 'all') return timeline;
    return timeline.filter((item) => item.type === activeFilter);
  }, [activeFilter, timeline]);

  return (
    <section
      id="experience"
      className="py-16 sm:py-24 lg:py-28 bg-canvas border-b border-stroke-muted scroll-mt-24 relative overflow-hidden"
    >
      <Container>
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 sm:mb-14">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-accent-electric text-xs font-mono font-medium mb-3">
              <Briefcase className="w-3.5 h-3.5" />
              <span>04 // CAREER & EDUCATION</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-text-primary mb-3">
              Professional milestones & academic foundation.
            </h2>
            <p className="text-text-secondary text-sm sm:text-base leading-relaxed">
              A transparent chronicle of my software engineering track record, corporate internship project, and Computer Science degree.
            </p>
          </div>

          {/* Experience Summary Badge */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-1 border border-stroke-muted text-xs font-mono text-text-secondary self-start md:self-end">
            <span className="w-2 h-2 rounded-full bg-accent-electric inline-block" />
            <span>~2 Years Total Software Development</span>
          </div>
        </div>

        {/* Interactive Filter Tabs */}
        <div className="mb-12 overflow-x-auto pb-2 scrollbar-none">
          <div className="flex items-center gap-1.5 min-w-max bg-surface-1/90 border border-stroke-muted p-1.5 rounded-xl shadow-ambient">
            {TIMELINE_FILTERS.map((tab) => {
              const isActive = activeFilter === tab.id;
              const count = tab.id === 'all'
                ? timeline.length
                : timeline.filter((item) => item.type === tab.id).length;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveFilter(tab.id)}
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
                      layoutId="activeTimelineTab"
                      className="absolute inset-0 bg-surface-3 rounded-lg border border-stroke-active -z-10 shadow-sm"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span>{tab.label}</span>
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

        {/* Editorial Vertical Timeline */}
        {filteredData.length === 0 ? (
          <EmptyState
            title="No timeline records found"
            description="There are currently no milestones matching your active filter. Try selecting 'All Milestones'."
            onAction={() => setActiveFilter('all')}
            actionLabel="View All Milestones"
          />
        ) : (
          <div className="relative border-l border-stroke-muted/80 ml-3 sm:ml-6 pl-6 sm:pl-10 space-y-10 sm:space-y-12">
            <AnimatePresence mode="popLayout">
              {filteredData.map((item) => {
              const isEducation = item.type === 'education';

              return (
                <motion.div
                  key={item.id}
                  layout={!shouldReduceMotion}
                  initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.95 }}
                  transition={{ duration: shouldReduceMotion ? 0.05 : 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="relative group"
                >
                  {/* Timeline Node Marker on the vertical border */}
                  <div className="absolute -left-[31px] sm:-left-[47px] top-6 flex items-center justify-center">
                    {item.isCurrent ? (
                      <span className="relative flex h-5 w-5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-electric opacity-75" />
                        <span className="relative inline-flex rounded-full h-5 w-5 bg-canvas border-2 border-accent-electric items-center justify-center">
                          <span className="w-2 h-2 rounded-full bg-accent-electric" />
                        </span>
                      </span>
                    ) : (
                      <span className="w-5 h-5 rounded-full bg-canvas border-2 border-stroke-muted group-hover:border-accent transition-colors flex items-center justify-center">
                        <span className="w-1.5 h-1.5 rounded-full bg-text-muted group-hover:bg-accent-electric transition-colors" />
                      </span>
                    )}
                  </div>

                  {/* Main Milestone Card */}
                  <article className="p-6 sm:p-7 rounded-2xl bg-surface-1 border border-stroke-muted hover:border-stroke-active transition-all duration-200 shadow-ambient hover:shadow-float">
                    {/* Header Row: Title, Organization & Meta */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
                      <div>
                        {/* Milestone Category Pill */}
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md font-mono text-[10px] font-semibold border ${
                            isEducation
                              ? 'bg-sky-500/10 text-sky-400 border-sky-500/20'
                              : 'bg-accent/10 text-accent-electric border-accent/20'
                          }`}>
                            {isEducation ? <GraduationCap className="w-3 h-3" /> : <Briefcase className="w-3 h-3" />}
                            <span>{item.periodBadge}</span>
                          </span>

                          <span className="text-text-muted text-xs">•</span>
                          <span className="text-xs font-mono text-text-muted flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>{item.period}</span>
                          </span>
                        </div>

                        {/* Role / Degree Title */}
                        <h3 className="text-xl font-bold text-text-primary tracking-tight group-hover:text-accent transition-colors">
                          {item.title}
                        </h3>

                        {/* Organization / University & Location */}
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-text-secondary mt-1">
                          <span className="flex items-center gap-1 font-medium text-text-primary">
                            <Building2 className="w-3.5 h-3.5 text-accent" />
                            <span>{item.organization}</span>
                          </span>
                          <span className="text-stroke-muted">•</span>
                          <span className="flex items-center gap-1 text-text-muted">
                            <MapPin className="w-3 h-3" />
                            <span>{item.location}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Summary Narrative */}
                    <p className="text-sm text-text-secondary leading-relaxed mb-4">
                      {item.summary}
                    </p>

                    {/* Project Spotlight Callout (Internship or Capstone) */}
                    {item.projectFocus && (
                      <div className="mb-4 p-3 rounded-lg bg-surface-2/70 border border-stroke-muted flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <Terminal className="w-3.5 h-3.5 text-accent-electric" />
                          <span className="font-mono text-text-muted">Flagship Project Focus:</span>
                          <span className="font-semibold text-text-primary">{item.projectFocus}</span>
                        </div>
                      </div>
                    )}

                    {/* Responsibilities / Coursework Checklist */}
                    <div className="space-y-2 mb-5">
                      <span className="text-[10px] font-mono text-text-muted uppercase tracking-wider block">
                        {isEducation ? 'Curriculum & Major Capstone:' : 'Key Engineering Responsibilities:'}
                      </span>
                      {item.responsibilities.map((resp, idx) => (
                        <div key={idx} className="flex items-start gap-2.5 text-xs text-text-secondary leading-relaxed">
                          <CheckCircle2 className="w-3.5 h-3.5 text-accent-electric shrink-0 mt-0.5" />
                          <span>{resp}</span>
                        </div>
                      ))}
                    </div>

                    {/* Associated Technologies / Disciplines */}
                    <div className="pt-3 border-t border-stroke-muted/60 flex flex-wrap gap-1.5">
                      {item.technologies.map((tech) => (
                        <Badge key={tech} variant="tech" size="sm">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  </article>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
        )}

        {/* Education & Experience Bottom Callout */}
        <div className="mt-14 p-5 sm:p-6 rounded-xl bg-surface-1/60 border border-stroke-muted flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center shrink-0 text-sky-400">
              <GraduationCap className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-text-primary">
                Haramaya University Alumni — BSc in Computer Science
              </p>
              <p className="text-xs text-text-muted">
                Rigorous training in algorithmic design, data structures, and production software methodologies.
              </p>
            </div>
          </div>

          <a
            href="/resume.pdf"
            download="Muleta_Sisay_Resume.pdf"
            className="inline-flex items-center gap-1.5 text-xs font-mono text-accent-electric hover:text-accent font-medium transition-colors shrink-0"
          >
            <span>Download verified resume PDF</span>
            <span>↓</span>
          </a>
        </div>
      </Container>
    </section>
  );
};

export default ExperienceTimeline;
