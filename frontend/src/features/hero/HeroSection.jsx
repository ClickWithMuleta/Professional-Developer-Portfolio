import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { 
  ArrowRight, 
  FileDown, 
  Github, 
  Linkedin, 
  Terminal, 
  Layers, 
  Cpu, 
  CheckCircle2, 
  Code2, 
  Sparkles,
  ExternalLink
} from 'lucide-react';
import Container from '../../components/common/Container';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import IconButton from '../../components/common/IconButton';
import { useProfile } from '../../hooks/usePortfolio';

export const HeroSection = () => {
  const shouldReduceMotion = useReducedMotion();
  const { profile } = useProfile();

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.12,
        delayChildren: shouldReduceMotion ? 0 : 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: shouldReduceMotion ? 0.1 : 0.45,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  const codeCardVariants = {
    hidden: { opacity: 0, scale: shouldReduceMotion ? 1 : 0.95, y: shouldReduceMotion ? 0 : 20 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: shouldReduceMotion ? 0.1 : 0.55,
        delay: shouldReduceMotion ? 0 : 0.25,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  const handleScrollToProjects = (e) => {
    e.preventDefault();
    const el = document.getElementById('projects');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      window.history.pushState(null, '', '#projects');
    }
  };

  return (
    <section
      id="home"
      className="relative pt-12 pb-16 sm:pt-20 sm:pb-24 lg:pt-24 lg:pb-32 overflow-hidden bg-canvas bg-dot-grid scroll-mt-24"
    >
      {/* Subtle radial spotlight vignette centered behind content */}
      <div 
        aria-hidden="true" 
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-accent/5 rounded-full blur-3xl pointer-events-none -z-10" 
      />

      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Personal Narrative, Headline & CTAs (7 Cols on LG) */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="lg:col-span-7 flex flex-col items-start"
          >
            {/* Availability & Developer Status Badge */}
            <motion.div variants={itemVariants} className="mb-6 flex flex-wrap items-center gap-2.5">
              <Badge variant="accent" size="md" withDot dotColor="bg-accent-electric">
                {profile.availabilityStatus || 'Available for opportunities'}
              </Badge>
              <span className="hidden sm:inline-block text-stroke-muted">•</span>
              <span className="text-xs font-mono text-text-muted">
                {profile.location || 'Addis Ababa, ET / Remote'}
              </span>
            </motion.div>

            {/* Engineer Name & Identification */}
            <motion.div variants={itemVariants} className="mb-3">
              <span className="font-mono text-xs sm:text-sm text-accent-electric uppercase tracking-wider font-semibold">
                {profile.fullName || 'Muleta Sisay'}
              </span>
              <p className="text-sm font-medium text-text-secondary mt-0.5">
                {profile.title || 'Software Developer'} • ~2 Years Experience • BSc in Computer Science
              </p>
            </motion.div>

            {/* Confident Master Headline */}
            <motion.h1
              variants={itemVariants}
              className="text-3xl sm:text-5xl lg:text-[54px] font-bold tracking-tight text-text-primary leading-[1.12] mb-6"
            >
              Building scalable software that turns complex ideas into{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent via-accent-electric to-emerald-300">
                real-world solutions.
              </span>
            </motion.h1>

            {/* Compelling Value Proposition & Narrative */}
            <motion.p
              variants={itemVariants}
              className="text-base sm:text-lg text-text-secondary leading-relaxed max-w-xl mb-8"
            >
              Specializing in resilient Python & Django backend architectures, responsive modern React user interfaces, and intelligent machine learning integrations. I build production-grade web systems designed for performance, maintainability, and measurable impact.
            </motion.p>

            {/* Primary & Secondary Call to Actions + Social Links */}
            <motion.div
              variants={itemVariants}
              className="flex flex-wrap items-center gap-4 w-full sm:w-auto mb-10"
            >
              <Button
                variant="primary"
                size="lg"
                onClick={handleScrollToProjects}
                rightIcon={<ArrowRight className="w-4 h-4" />}
                className="w-full sm:w-auto shadow-glow"
              >
                Explore Projects
              </Button>

              <a
                href={profile.resumeUrl || '/resume.pdf'}
                download="Muleta_Sisay_Resume.pdf"
                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg border border-stroke-muted bg-surface-2 hover:bg-surface-3 text-text-primary hover:border-stroke-active text-base font-medium transition-all w-full sm:w-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <FileDown className="w-4 h-4 text-accent-electric" />
                <span>Download Resume</span>
              </a>

              {/* Quick Social Links */}
              <div className="flex items-center gap-2 pt-2 sm:pt-0">
                <IconButton
                  href={profile.githubUrl || 'https://github.com/ClickWithMuleta'}
                  target="_blank"
                  ariaLabel="Muleta Sisay GitHub Profile"
                  icon={<Github className="w-4 h-4" />}
                  variant="outline"
                  size="md"
                />
                <IconButton
                  href={profile.linkedinUrl || 'https://linkedin.com/in/muleta-sisay'}
                  target="_blank"
                  ariaLabel="Muleta Sisay LinkedIn Profile"
                  icon={<Linkedin className="w-4 h-4" />}
                  variant="outline"
                  size="md"
                />
              </div>
            </motion.div>

            {/* Core Competencies Quick Strip */}
            <motion.div
              variants={itemVariants}
              className="pt-6 border-t border-stroke-muted/80 w-full"
            >
              <p className="text-xs font-mono uppercase tracking-wider text-text-muted mb-3 flex items-center gap-2">
                <Layers className="w-3.5 h-3.5 text-accent-electric" />
                <span>Core Engineering Stack</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {['Python', 'Django REST', 'React', 'PostgreSQL', 'LightGBM', 'C# / ASP.NET Core'].map((tech) => (
                  <Badge key={tech} variant="tech" size="sm">
                    {tech}
                  </Badge>
                ))}
              </div>
            </motion.div>
          </motion.div>

          {/* Right Column: Modern Technical Visual Element (5 Cols on LG) */}
          <motion.div
            variants={codeCardVariants}
            initial="hidden"
            animate="visible"
            className="lg:col-span-5 relative"
          >
            {/* Ambient edge glow behind terminal card */}
            <div 
              aria-hidden="true" 
              className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-accent/20 to-accent-electric/10 blur-xl opacity-60 -z-10" 
            />

            {/* Interactive Engineering Terminal & Architecture Dossier */}
            <div className="rounded-xl border border-stroke-muted bg-surface-1 shadow-modal overflow-hidden transition-all duration-300 hover:border-stroke-active">
              {/* Terminal Title Bar */}
              <div className="flex items-center justify-between px-4 py-3 bg-surface-2/80 border-b border-stroke-muted text-xs">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
                    <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                    <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
                  </div>
                  <span className="font-mono text-text-muted ml-2 text-[11px] hidden sm:inline">
                    system_architecture.py
                  </span>
                </div>
                <div className="flex items-center gap-2 font-mono text-[11px] text-accent-electric">
                  <Terminal className="w-3.5 h-3.5" />
                  <span>v2.4.0</span>
                </div>
              </div>

              {/* Code Snippet Body (Real Syntax Highlighting) */}
              <div className="p-5 font-mono text-xs leading-relaxed overflow-x-auto text-text-secondary select-text">
                <div className="text-text-muted mb-2"># Senior Software Engineering Snapshot</div>
                <div>
                  <span className="text-rose-400">class</span>{' '}
                  <span className="text-amber-300 font-semibold">SoftwareEngineer</span>:
                </div>
                <div className="pl-4">
                  <span className="text-text-primary">developer</span> ={' '}
                  <span className="text-emerald-400">"Muleta Sisay"</span>
                </div>
                <div className="pl-4">
                  <span className="text-text-primary">degree</span> ={' '}
                  <span className="text-emerald-400">"BSc Computer Science"</span>
                </div>
                <div className="pl-4">
                  <span className="text-text-primary">experience</span> ={' '}
                  <span className="text-amber-300">2.0</span>{' '}
                  <span className="text-text-muted"># Years in production</span>
                </div>
                <div className="pl-4">
                  <span className="text-text-primary">core_stack</span> = [
                </div>
                <div className="pl-8 text-emerald-400">
                  "Django", "React", "PostgreSQL", "LightGBM"
                </div>
                <div className="pl-4">]</div>
                <div className="my-2" />
                <div className="pl-4">
                  <span className="text-rose-400">def</span>{' '}
                  <span className="text-sky-400 font-semibold">flagship_projects</span>():
                </div>
                <div className="pl-8">
                  <span className="text-rose-400">return</span> {'{'}
                </div>
                <div className="pl-12 text-emerald-400">
                  "cashflow": <span className="text-text-secondary">"Anomaly Detection & Forecast"</span>,
                </div>
                <div className="pl-12 text-emerald-400">
                  "e_hospital": <span className="text-text-secondary">"Telemedicine & Doctors Portal"</span>,
                </div>
                <div className="pl-12 text-emerald-400">
                  "accessories": <span className="text-text-secondary">"Stock Reconciliation System"</span>
                </div>
                <div className="pl-8">{'}'}</div>
              </div>

              {/* Telemetry Footer Status Pill */}
              <div className="px-4 py-2.5 bg-surface-2/60 border-t border-stroke-muted flex items-center justify-between text-[11px] font-mono">
                <div className="flex items-center gap-2 text-text-secondary">
                  <CheckCircle2 className="w-3.5 h-3.5 text-accent-electric" />
                  <span>Architecture: Clean & Decoupled</span>
                </div>
                <span className="text-accent-electric font-semibold">
                  API: 200 OK
                </span>
              </div>
            </div>

            {/* Floating Contextual Badges (Tactile Visual Anchors) */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.4 }}
              className="absolute -bottom-4 -left-4 bg-surface-2 border border-stroke-muted rounded-lg px-3 py-2 shadow-ambient flex items-center gap-2 text-xs font-mono hidden sm:flex"
            >
              <Cpu className="w-4 h-4 text-accent-electric" />
              <div>
                <p className="text-text-muted text-[10px]">ML ANOMALY MODEL</p>
                <p className="text-text-primary font-semibold">98.4% Precision</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.4 }}
              className="absolute -top-4 -right-2 bg-surface-2 border border-stroke-muted rounded-lg px-3 py-2 shadow-ambient flex items-center gap-2 text-xs font-mono hidden sm:flex"
            >
              <Code2 className="w-4 h-4 text-accent" />
              <div>
                <p className="text-text-muted text-[10px]">BACKEND SPEED</p>
                <p className="text-text-primary font-semibold">&lt; 45ms P95 API</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </Container>
    </section>
  );
};

export default HeroSection;
