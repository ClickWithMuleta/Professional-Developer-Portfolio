import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import MainLayout from './components/layout/MainLayout';
import Section from './components/common/Section';
import Container from './components/common/Container';
import Button from './components/common/Button';
import Badge from './components/common/Badge';
import { ArrowRight, Code2, Layers, Sparkles, Terminal, Briefcase, User, Mail, Cpu } from 'lucide-react';

const PortfolioTestView = () => {
  return (
    <>
      {/* 1. Home Section */}
      <Section id="home" variant="grid" className="scroll-mt-24 border-b border-stroke-muted min-h-[70vh] flex items-center">
        <div className="max-w-3xl">
          <Badge variant="accent" size="md" withDot className="mb-4">
            Phase 4.1: Navigation System Active
          </Badge>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-text-primary mb-4">
            Muleta Sisay
            <span className="block text-text-secondary text-xl sm:text-2xl font-normal mt-2">
              Software Developer • Backend Architecture • React • Machine Learning
            </span>
          </h1>
          <p className="text-text-secondary text-base leading-relaxed mb-8">
            Welcome to my developer portfolio. Explore the sticky navbar above with active scroll-spy highlighting, dark/light theme switching, CV download, and smooth keyboard navigation.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="primary"
              rightIcon={<ArrowRight className="w-4 h-4" />}
              onClick={() => {
                const el = document.getElementById('projects');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              View Projects
            </Button>
            <Button
              variant="secondary"
              leftIcon={<Terminal className="w-4 h-4" />}
              onClick={() => {
                const el = document.getElementById('about');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              About Me
            </Button>
          </div>
        </div>
      </Section>

      {/* 2. About Section */}
      <Section id="about" variant="subtle" className="scroll-mt-24 min-h-[60vh]">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 text-accent-electric text-xs font-mono font-medium mb-2">
            <User className="w-4 h-4" />
            <span>01 // ABOUT ME</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-text-primary mb-4">
            Engineering with Purpose & Technical Rigor
          </h2>
          <p className="text-text-secondary text-sm sm:text-base leading-relaxed mb-6">
            I am a Software Developer with approximately 2 years of experience building production-grade web systems, data architectures, and machine learning models. I hold a BSc in Computer Science and specialize in Python, Django REST Framework, React, PostgreSQL, and C# / ASP.NET Core.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-surface-1 border border-stroke-muted p-4 rounded-xl">
              <h4 className="text-xs font-mono text-accent-electric mb-1">EDUCATION</h4>
              <p className="text-sm font-semibold text-text-primary">BSc in Computer Science</p>
              <p className="text-xs text-text-muted">Core Foundation in Algorithms, Systems & Databases</p>
            </div>
            <div className="bg-surface-1 border border-stroke-muted p-4 rounded-xl">
              <h4 className="text-xs font-mono text-accent-electric mb-1">EXPERIENCE</h4>
              <p className="text-sm font-semibold text-text-primary">~2 Years Full-Stack Development</p>
              <p className="text-xs text-text-muted">Production Systems, Healthcare & Financial Tech</p>
            </div>
          </div>
        </div>
      </Section>

      {/* 3. Skills Section */}
      <Section id="skills" variant="default" className="scroll-mt-24 min-h-[60vh]">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 text-accent-electric text-xs font-mono font-medium mb-2">
            <Cpu className="w-4 h-4" />
            <span>02 // TECHNICAL MATRIX</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-text-primary mb-4">
            Categorized Technical Skills
          </h2>
          <p className="text-text-secondary text-sm mb-6">
            Concrete technical stack without arbitrary percentage bars.
          </p>
          <div className="flex flex-wrap gap-2">
            {['Python', 'Django', 'Django REST Framework', 'React', 'JavaScript', 'C#', 'ASP.NET Core', 'PostgreSQL', 'MySQL', 'MongoDB', 'LightGBM', 'Scikit-learn', 'Tailwind CSS'].map((skill) => (
              <Badge key={skill} variant="tech" size="md">
                {skill}
              </Badge>
            ))}
          </div>
        </div>
      </Section>

      {/* 4. Projects Section */}
      <Section id="projects" variant="subtle" className="scroll-mt-24 min-h-[60vh]">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 text-accent-electric text-xs font-mono font-medium mb-2">
            <Layers className="w-4 h-4" />
            <span>03 // FEATURED WORK</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-text-primary mb-4">
            Flagship Engineering Projects
          </h2>
          <p className="text-text-secondary text-sm mb-6">
            Real systems addressing financial intelligence, healthcare management, and inventory tracking.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-surface-1 border border-stroke-muted p-5 rounded-xl">
              <Badge variant="accent" size="sm" className="mb-2">Finance + Machine Learning</Badge>
              <h3 className="text-base font-semibold text-text-primary mb-1">Smart Cashflow Tracker</h3>
              <p className="text-xs text-text-secondary">Django-based financial tracker with anomaly detection and budget forecasting.</p>
            </div>
            <div className="bg-surface-1 border border-stroke-muted p-5 rounded-xl">
              <Badge variant="accent" size="sm" className="mb-2">Healthcare + Telemedicine</Badge>
              <h3 className="text-base font-semibold text-text-primary mb-1">eHospital Management System</h3>
              <p className="text-xs text-text-secondary">Doctor recommendation, patient records, telemedicine, and payments.</p>
            </div>
          </div>
        </div>
      </Section>

      {/* 5. Experience Section */}
      <Section id="experience" variant="default" className="scroll-mt-24 min-h-[60vh]">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 text-accent-electric text-xs font-mono font-medium mb-2">
            <Briefcase className="w-4 h-4" />
            <span>04 // CAREER TIMELINE</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-text-primary mb-4">
            Professional Experience & Milestones
          </h2>
          <div className="border-l border-stroke-muted pl-4 space-y-6">
            <div>
              <p className="text-xs font-mono text-accent-electric">2024 — PRESENT</p>
              <h3 className="text-base font-semibold text-text-primary">Software Developer</h3>
              <p className="text-xs text-text-secondary">Building scalable full-stack web architectures, APIs, and machine learning workflows.</p>
            </div>
            <div>
              <p className="text-xs font-mono text-text-muted">PREVIOUS</p>
              <h3 className="text-base font-semibold text-text-primary">Software Engineering Intern</h3>
              <p className="text-xs text-text-secondary">Engineered the Accessories Management System for inventory tracking and materials management.</p>
            </div>
          </div>
        </div>
      </Section>

      {/* 6. Contact Section */}
      <Section id="contact" variant="subtle" className="scroll-mt-24 min-h-[60vh]">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 text-accent-electric text-xs font-mono font-medium mb-2">
            <Mail className="w-4 h-4" />
            <span>05 // INBOUND PORTAL</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-text-primary mb-4">
            Let's Build Something Together
          </h2>
          <p className="text-text-secondary text-sm mb-6">
            Whether you have an engineering opportunity, a project proposal, or a technical question, my inbox is open.
          </p>
          <div className="bg-surface-1 border border-stroke-muted p-6 rounded-xl max-w-md">
            <p className="text-xs font-mono text-text-muted mb-2">DIRECT COMMUNICATION</p>
            <p className="text-sm font-semibold text-text-primary mb-4">ClickWithMuleta on GitHub</p>
            <Button
              variant="primary"
              size="md"
              className="w-full"
              onClick={() => window.open('https://github.com/ClickWithMuleta', '_blank')}
            >
              Open GitHub Profile
            </Button>
          </div>
        </div>
      </Section>
    </>
  );
};

export const App = () => {
  return (
    <ThemeProvider>
      <Router>
        <MainLayout>
          <Routes>
            <Route path="/" element={<PortfolioTestView />} />
          </Routes>
        </MainLayout>
      </Router>
    </ThemeProvider>
  );
};

export default App;
