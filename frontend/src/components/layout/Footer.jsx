import React from 'react';
import { Github, ArrowUp, Terminal, Heart } from 'lucide-react';
import Container from '../common/Container';
import IconButton from '../common/IconButton';
import Badge from '../common/Badge';

export const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-canvas-subtle border-t border-stroke-muted py-12 text-sm text-text-secondary">
      <Container>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-stroke-muted">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="font-mono text-base font-semibold text-text-primary tracking-tight">
                Muleta Sisay
              </span>
              <Badge variant="accent" size="sm" withDot>
                Available for hire
              </Badge>
            </div>
            <p className="text-text-muted text-xs max-w-sm">
              Software Developer specializing in resilient backend architectures, modern React interfaces, and intelligent machine learning systems.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <IconButton
              href="https://github.com/ClickWithMuleta"
              target="_blank"
              ariaLabel="GitHub"
              icon={<Github className="w-4 h-4" />}
              variant="surface"
              size="sm"
            />
            <button
              onClick={scrollToTop}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stroke-muted bg-surface-1 hover:bg-surface-2 text-xs text-text-secondary hover:text-text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              aria-label="Scroll back to top"
            >
              <span>Back to top</span>
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-text-muted">
          <div className="flex items-center gap-2 font-mono">
            <Terminal className="w-3.5 h-3.5 text-accent-electric" />
            <span>Built with React, Vite, Tailwind CSS & Django REST Framework</span>
          </div>

          <p>© {new Date().getFullYear()} Muleta Sisay. All rights reserved.</p>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;
