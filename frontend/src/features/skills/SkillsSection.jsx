import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { 
  Cpu, 
  Database, 
  Server, 
  Layout, 
  GitBranch, 
  Terminal, 
  Layers, 
  Code2, 
  Palette, 
  Sparkles, 
  Boxes, 
  Send, 
  CheckCircle2, 
  Workflow, 
  LineChart,
  Globe,
  Share2
} from 'lucide-react';
import Container from '../../components/common/Container';
import Badge from '../../components/common/Badge';
import { SKILL_CATEGORIES, SKILLS_DATA } from './skillsData';

// Map icon keys to crisp Lucide icons
const ICON_MAP = {
  python: <Terminal className="w-5 h-5 text-accent-electric" />,
  csharp: <Code2 className="w-5 h-5 text-sky-400" />,
  javascript: <Code2 className="w-5 h-5 text-amber-300" />,
  sql: <Database className="w-5 h-5 text-emerald-400" />,
  django: <Server className="w-5 h-5 text-accent-electric" />,
  api: <Workflow className="w-5 h-5 text-accent" />,
  server: <Server className="w-5 h-5 text-indigo-400" />,
  network: <Share2 className="w-5 h-5 text-teal-400" />,
  react: <Layout className="w-5 h-5 text-cyan-400" />,
  palette: <Palette className="w-5 h-5 text-accent-electric" />,
  layout: <Globe className="w-5 h-5 text-emerald-400" />,
  code: <Code2 className="w-5 h-5 text-text-secondary" />,
  database: <Database className="w-5 h-5 text-accent-electric" />,
  cpu: <Cpu className="w-5 h-5 text-emerald-400" />,
  sparkles: <Sparkles className="w-5 h-5 text-accent-electric" />,
  chart: <LineChart className="w-5 h-5 text-amber-300" />,
  workflow: <Workflow className="w-5 h-5 text-accent" />,
  git: <GitBranch className="w-5 h-5 text-rose-400" />,
  github: <Terminal className="w-5 h-5 text-text-primary" />,
  container: <Boxes className="w-5 h-5 text-sky-400" />,
  send: <Send className="w-5 h-5 text-accent-electric" />,
};

export const SkillsSection = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const shouldReduceMotion = useReducedMotion();

  // Filter skills based on selected category
  const filteredSkills = useMemo(() => {
    if (activeCategory === 'all') return SKILLS_DATA;
    return SKILLS_DATA.filter((skill) => skill.category === activeCategory);
  }, [activeCategory]);

  // Compute count for each category
  const categoryCounts = useMemo(() => {
    const counts = { all: SKILLS_DATA.length };
    SKILLS_DATA.forEach((skill) => {
      counts[skill.category] = (counts[skill.category] || 0) + 1;
    });
    return counts;
  }, []);

  return (
    <section
      id="skills"
      className="py-16 sm:py-24 lg:py-28 bg-canvas border-b border-stroke-muted scroll-mt-24 relative overflow-hidden"
    >
      <Container>
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 sm:mb-14">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-accent-electric text-xs font-mono font-medium mb-3">
              <Cpu className="w-3.5 h-3.5" />
              <span>02 // TECHNICAL MATRIX</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-text-primary mb-3">
              Technologies, architectures & specialized toolsets.
            </h2>
            <p className="text-text-secondary text-sm sm:text-base leading-relaxed">
              Organized by engineering discipline with real-world application context—free of arbitrary skill percentage bars.
            </p>
          </div>

          {/* Quick Counter Badge */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-1 border border-stroke-muted text-xs font-mono text-text-secondary self-start md:self-end">
            <span className="w-2 h-2 rounded-full bg-accent-electric inline-block" />
            <span>{SKILLS_DATA.length} Production Technologies</span>
          </div>
        </div>

        {/* Interactive Filter Tabs */}
        <div className="mb-10 overflow-x-auto pb-2 scrollbar-none">
          <div className="flex items-center gap-1.5 min-w-max bg-surface-1/90 border border-stroke-muted p-1.5 rounded-xl shadow-ambient">
            {SKILL_CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat.id;
              const count = categoryCounts[cat.id] || 0;

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
                      layoutId="activeSkillTab"
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

        {/* Dynamic Animated Skills Grid */}
        <motion.div
          layout={!shouldReduceMotion}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5"
        >
          <AnimatePresence mode="popLayout">
            {filteredSkills.map((skill) => (
              <motion.div
                key={skill.id}
                layout={!shouldReduceMotion}
                initial={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.94 }}
                transition={{ duration: shouldReduceMotion ? 0.05 : 0.25, ease: [0.16, 1, 0.3, 1] }}
                className="group relative p-5 rounded-xl bg-surface-1 border border-stroke-muted hover:border-stroke-active transition-all duration-200 shadow-ambient hover:shadow-float flex flex-col justify-between"
              >
                <div>
                  {/* Top Row: Icon + Context Tag */}
                  <div className="flex items-start justify-between gap-3 mb-3.5">
                    <div className="w-10 h-10 rounded-lg bg-surface-2 border border-stroke-muted group-hover:border-accent/40 flex items-center justify-center shrink-0 transition-colors">
                      {ICON_MAP[skill.iconKey] || <Code2 className="w-5 h-5 text-accent" />}
                    </div>

                    <div className="flex flex-col items-end">
                      <span className="font-mono text-[10px] uppercase tracking-wider text-accent-electric font-semibold px-2 py-0.5 rounded bg-accent/10 border border-accent/20">
                        {skill.contextBadge}
                      </span>
                      {skill.isFlagship && (
                        <span className="text-[9px] font-mono text-text-muted mt-1">
                          Core Project Stack
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Skill Name */}
                  <h3 className="text-base font-semibold text-text-primary mb-1.5 group-hover:text-accent-electric transition-colors">
                    {skill.name}
                  </h3>

                  {/* Real Practical Engineering Context (No fake % bars) */}
                  <p className="text-xs text-text-secondary leading-relaxed">
                    {skill.description}
                  </p>
                </div>

                {/* Card Footer Micro-Indicator */}
                <div className="mt-4 pt-3 border-t border-stroke-muted/60 flex items-center justify-between text-[11px] font-mono text-text-muted">
                  <span className="capitalize">{skill.category}</span>
                  <span className="text-accent group-hover:translate-x-0.5 transition-transform">
                    Applied in production →
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Bottom Architectural Callout */}
        <div className="mt-12 p-5 sm:p-6 rounded-xl bg-surface-1/60 border border-stroke-muted flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0 text-accent-electric">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-text-primary">
                Integrated Full-Stack & Machine Learning Architecture
              </p>
              <p className="text-xs text-text-muted">
                Python, Django REST, and PostgreSQL power the core backend, paired with React frontends and LightGBM models.
              </p>
            </div>
          </div>

          <a
            href="#projects"
            onClick={(e) => {
              e.preventDefault();
              const el = document.getElementById('projects');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="inline-flex items-center gap-1.5 text-xs font-mono text-accent-electric hover:text-accent font-medium transition-colors shrink-0"
          >
            <span>See how these are applied in projects</span>
            <span>↓</span>
          </a>
        </div>
      </Container>
    </section>
  );
};

export default SkillsSection;
