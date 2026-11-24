import React from 'react';
import { Github, Linkedin, Mail, ArrowUp, Terminal, Sparkles } from 'lucide-react';
import Container from '../common/Container';
import Badge from '../common/Badge';

const NAV_ITEMS = [
  { id: 'home', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'skills', label: 'Skills' },
  { id: 'projects', label: 'Projects' },
  { id: 'experience', label: 'Experience' },
  { id: 'contact', label: 'Contact' },
];

const CONTACT_EMAIL = import.meta.env.VITE_CONTACT_EMAIL || 'clickwithmuleta@gmail.com';
const GITHUB_URL = 'https://github.com/ClickWithMuleta';
const LINKEDIN_URL = 'https://linkedin.com/in/muleta-sisay';

export const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavClick = (e, sectionId) => {
    e.preventDefault();
    if (sectionId === 'home') {
      scrollToTop();
      return;
    }
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      window.history.pushState(null, '', `#${sectionId}`);
    }
  };

  return (
    <footer className="bg-canvas border-t border-stroke-muted py-14 text-sm text-text-secondary select-none">
      <Container>
        {/* Top Tier: Identity, Navigation Links & Social Channels */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-10 border-b border-stroke-muted/80 items-start">
          {/* Identity & Status (5 cols on MD) */}
          <div className="md:col-span-5 space-y-3">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-electric opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-electric" />
              </span>
              <a
                href="#home"
                onClick={(e) => handleNavClick(e, 'home')}
                className="font-mono text-base font-bold text-text-primary tracking-tight hover:opacity-90 transition-opacity"
              >
                MS <span className="text-accent-electric">/</span> DEV.
              </a>
              <Badge variant="accent" size="sm" className="ml-2">
                Available for hire
              </Badge>
            </div>

            <p className="text-text-muted text-xs leading-relaxed max-w-sm">
              Software Developer with a BSc in Computer Science, specializing in decoupled Django backends, reactive user interfaces, and applied machine learning models.
            </p>
          </div>

          {/* Navigation Directory (4 cols on MD) */}
          <div className="md:col-span-4">
            <p className="text-xs font-mono uppercase tracking-wider text-text-muted mb-3">
              Navigation
            </p>
            <nav aria-label="Footer Navigation" className="grid grid-cols-2 gap-2 text-xs">
              {NAV_ITEMS.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={(e) => handleNavClick(e, item.id)}
                  className="text-text-secondary hover:text-accent-electric transition-colors py-0.5"
                >
                  {item.label}
                </a>
              ))}
            </nav>
          </div>

          {/* Direct Social Channels & Back to Top (3 cols on MD) */}
          <div className="md:col-span-3 flex flex-col items-start md:items-end justify-between h-full gap-4">
            <div className="flex items-center gap-2.5">
              <a
                href={GITHUB_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Muleta Sisay GitHub"
                className="w-8 h-8 rounded-lg bg-surface-1 hover:bg-surface-2 border border-stroke-muted hover:border-stroke-active flex items-center justify-center text-text-secondary hover:text-text-primary transition-all"
              >
                <Github className="w-4 h-4" />
              </a>

              <a
                href={LINKEDIN_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Muleta Sisay LinkedIn"
                className="w-8 h-8 rounded-lg bg-surface-1 hover:bg-surface-2 border border-stroke-muted hover:border-stroke-active flex items-center justify-center text-text-secondary hover:text-sky-400 transition-all"
              >
                <Linkedin className="w-4 h-4" />
              </a>

              <a
                href={`mailto:${CONTACT_EMAIL}`}
                aria-label="Direct Email"
                className="w-8 h-8 rounded-lg bg-surface-1 hover:bg-surface-2 border border-stroke-muted hover:border-stroke-active flex items-center justify-center text-text-secondary hover:text-accent-electric transition-all"
              >
                <Mail className="w-4 h-4" />
              </a>
            </div>

            <button
              onClick={scrollToTop}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stroke-muted bg-surface-1 hover:bg-surface-2 text-xs font-mono text-text-secondary hover:text-text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              aria-label="Scroll back to top of page"
            >
              <span>Back to top</span>
              <ArrowUp className="w-3.5 h-3.5 text-accent-electric" />
            </button>
          </div>
        </div>

        {/* Bottom Tier: Architectural Note & Dynamic Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-text-muted">
          <div className="flex items-center gap-2 font-mono text-[11px]">
            <Terminal className="w-3.5 h-3.5 text-accent-electric" />
            <span>Built with React, Vite, Tailwind CSS & Django REST Framework</span>
          </div>

          <p className="font-mono text-[11px]">
            © {new Date().getFullYear()} Muleta Sisay. All rights reserved.
          </p>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;
