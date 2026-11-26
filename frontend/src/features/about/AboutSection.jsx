import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { 
  GraduationCap, 
  Clock, 
  Code2, 
  Layers, 
  Cpu, 
  CheckCircle2, 
  Sparkles, 
  Terminal, 
  ArrowUpRight,
  ShieldCheck,
  BookOpen,
  Wrench
} from 'lucide-react';
import Container from '../../components/common/Container';
import Badge from '../../components/common/Badge';
import { useProfile } from '../../hooks/usePortfolio';

export const AboutSection = () => {
  const shouldReduceMotion = useReducedMotion();
  const { profile } = useProfile();

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.1,
        delayChildren: shouldReduceMotion ? 0 : 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: shouldReduceMotion ? 0.1 : 0.45,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  const principles = [
    {
      icon: <Layers className="w-4 h-4 text-accent-electric" />,
      title: "Maintainable Architecture",
      description: "Designing modular, decoupled codebases with clean APIs that remain easy to test, extend, and maintain over time."
    },
    {
      icon: <Wrench className="w-4 h-4 text-accent" />,
      title: "Practical Problem-Solving",
      description: "Prioritizing pragmatic, real-world utility over vanity complexity—building software that genuinely works for users."
    },
    {
      icon: <Cpu className="w-4 h-4 text-accent-electric" />,
      title: "Machine Learning Integration",
      description: "Bridging web backends with applied data science, incorporating predictive algorithms and anomaly detection where they add measurable value."
    },
    {
      icon: <BookOpen className="w-4 h-4 text-accent" />,
      title: "Continuous Learning",
      description: "Relentlessly expanding technical depth across languages, distributed architectures, database engines, and software paradigms."
    }
  ];

  const focusAreas = [
    "Full-Stack Web Systems (Django & React)",
    "Robust RESTful API Design & Serialization",
    "Relational Database Modeling (PostgreSQL, SQL)",
    "Applied Machine Learning (Scikit-learn, LightGBM)",
    "Performance Optimization & Clean Code Standards"
  ];

  return (
    <section
      id="about"
      className="py-16 sm:py-24 lg:py-28 bg-canvas-subtle border-y border-stroke-muted relative scroll-mt-24 overflow-hidden"
    >
      <Container>
        {/* Section Header */}
        <div className="max-w-2xl mb-12 sm:mb-16">
          <div className="flex items-center gap-2 text-accent-electric text-xs font-mono font-medium mb-3">
            <Terminal className="w-3.5 h-3.5" />
            <span>01 // ABOUT ME</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-text-primary mb-4">
            Engineering software with analytical rigor and practical focus.
          </h2>
          <p className="text-text-secondary text-sm sm:text-base leading-relaxed">
            A software developer with a Computer Science foundation who bridges scalable backend systems, responsive user interfaces, and applied machine learning.
          </p>
        </div>

        {/* Bento Grid Layout */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
        >
          {/* Left Column: Narrative & Engineering Principles (7 Cols) */}
          <div className="lg:col-span-7 space-y-8">
            {/* Personal Engineering Narrative */}
            <motion.div variants={itemVariants} className="space-y-4 text-text-secondary text-sm sm:text-base leading-relaxed">
              {profile?.bio ? (
                <p className="whitespace-pre-line">{profile.bio}</p>
              ) : (
                <>
                  <p>
                    My journey in software engineering is grounded in a deep curiosity for how complex systems operate behind the scenes. With a <strong className="text-text-primary font-medium">BSc in Computer Science</strong> and approximately <strong className="text-text-primary font-medium">two years of software development experience</strong>, I focus on building dependable applications that translate business requirements into clean, scalable software.
                  </p>
                  <p>
                    Rather than treating backend, frontend, and data as isolated silos, I take an end-to-end full-stack approach. I engineer robust REST APIs in <strong className="text-text-primary font-medium">Python & Django</strong>, design intuitive interfaces in <strong className="text-text-primary font-medium">React</strong>, optimize schemas in <strong className="text-text-primary font-medium">PostgreSQL</strong>, and incorporate predictive intelligence using <strong className="text-text-primary font-medium">LightGBM and Scikit-learn</strong>.
                  </p>
                </>
              )}
            </motion.div>

            {/* Core Engineering Principles Grid */}
            <motion.div variants={itemVariants} className="pt-2">
              <h3 className="text-xs font-mono text-text-muted uppercase tracking-wider mb-4 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-accent-electric" />
                <span>Core Engineering Values</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {principles.map((principle, index) => (
                  <div
                    key={index}
                    className="p-5 rounded-xl bg-surface-1 border border-stroke-muted hover:border-stroke-active transition-all duration-200 shadow-ambient flex flex-col justify-between"
                  >
                    <div>
                      <div className="w-8 h-8 rounded-lg bg-surface-2 border border-stroke-muted flex items-center justify-center mb-3">
                        {principle.icon}
                      </div>
                      <h4 className="text-sm font-semibold text-text-primary mb-1.5">
                        {principle.title}
                      </h4>
                      <p className="text-xs text-text-secondary leading-relaxed">
                        {principle.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right Column: Credentials & Focus Card (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Credentials Card (Education & Experience) */}
            <motion.div
              variants={itemVariants}
              className="p-6 rounded-xl bg-surface-1 border border-stroke-muted shadow-ambient"
            >
              <h3 className="text-xs font-mono text-text-muted uppercase tracking-wider mb-5 flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-accent-electric" />
                <span>Credentials & Background</span>
              </h3>

              <div className="space-y-6">
                {/* Academic Degree */}
                <div className="flex items-start gap-4 pb-5 border-b border-stroke-muted">
                  <div className="w-10 h-10 rounded-lg bg-surface-2 border border-stroke-muted flex items-center justify-center shrink-0 text-accent-electric">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] font-mono text-accent uppercase tracking-wide">
                      Academic Degree
                    </span>
                    <h4 className="text-sm font-semibold text-text-primary mt-0.5">
                      BSc in Computer Science
                    </h4>
                    <p className="text-xs text-text-muted mt-1 leading-relaxed">
                      Comprehensive foundations in data structures, algorithms, relational databases, systems programming, and software engineering.
                    </p>
                  </div>
                </div>

                {/* Practical Experience */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-surface-2 border border-stroke-muted flex items-center justify-center shrink-0 text-accent">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] font-mono text-accent uppercase tracking-wide">
                      Practical Track Record
                    </span>
                    <h4 className="text-sm font-semibold text-text-primary mt-0.5">
                      ~2 Years Development Experience
                    </h4>
                    <p className="text-xs text-text-muted mt-1 leading-relaxed">
                      Hands-on engineering across production web applications, database schema design, and machine learning integrations.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* What I Enjoy Building Card */}
            <motion.div
              variants={itemVariants}
              className="p-6 rounded-xl bg-surface-1 border border-stroke-muted shadow-ambient"
            >
              <h3 className="text-xs font-mono text-text-muted uppercase tracking-wider mb-4 flex items-center gap-2">
                <Code2 className="w-3.5 h-3.5 text-accent-electric" />
                <span>What I Enjoy Building</span>
              </h3>

              <ul className="space-y-2.5">
                {focusAreas.map((area, idx) => (
                  <li key={idx} className="flex items-center gap-2.5 text-xs text-text-secondary">
                    <CheckCircle2 className="w-4 h-4 text-accent-electric shrink-0" />
                    <span>{area}</span>
                  </li>
                ))}
              </ul>

              {/* Developer Mindset Snippet */}
              <div className="mt-6 p-3.5 rounded-lg bg-surface-2/80 border border-stroke-muted font-mono text-[11px] text-text-secondary">
                <span className="text-accent-electric font-semibold">// Philosophy:</span> "Build practical systems that solve real problems through clean architecture and continuous learning."
              </div>
            </motion.div>
          </div>
        </motion.div>
      </Container>
    </section>
  );
};

export default AboutSection;
