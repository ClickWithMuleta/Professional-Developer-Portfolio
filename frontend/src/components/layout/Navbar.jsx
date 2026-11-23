import React, { useState, useEffect, useCallback } from 'react';
import { Menu, X, Github, FileDown, Sun, Moon, ArrowUpRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { useScrollSpy } from '../../hooks/useScrollSpy';
import IconButton from '../common/IconButton';
import Button from '../common/Button';

const NAV_ITEMS = [
  { id: 'home', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'skills', label: 'Skills' },
  { id: 'projects', label: 'Projects' },
  { id: 'experience', label: 'Experience' },
  { id: 'contact', label: 'Contact' },
];

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  // Scroll spy tracking active section ID
  const activeSection = useScrollSpy(
    NAV_ITEMS.map((item) => item.id),
    120
  );

  // Monitor scroll for header background blur and elevation
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle Escape key to close mobile menu
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  // Prevent background scrolling when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  // Smooth scroll handler
  const handleNavClick = useCallback((e, sectionId) => {
    e.preventDefault();
    setMobileMenuOpen(false);

    if (sectionId === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      window.history.pushState(null, '', '#home');
      return;
    }

    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      window.history.pushState(null, '', `#${sectionId}`);
    }
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
        isScrolled
          ? 'bg-canvas/85 backdrop-blur-md border-b border-stroke-muted/80 py-3 shadow-ambient'
          : 'bg-transparent py-4 sm:py-5'
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo / Wordmark */}
          <a
            href="#home"
            onClick={(e) => handleNavClick(e, 'home')}
            className="group flex items-center gap-2.5 text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-lg p-1.5 transition-opacity hover:opacity-90"
            aria-label="Muleta Sisay - Home"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-electric opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-electric" />
            </span>
            <div className="font-mono text-sm sm:text-base font-bold tracking-tight">
              <span>MS</span>
              <span className="text-accent-electric mx-1">/</span>
              <span className="text-text-secondary group-hover:text-text-primary transition-colors">DEV.</span>
            </div>
          </a>

          {/* Desktop Navigation Links with Animated Active Indicator */}
          <nav
            aria-label="Primary Navigation"
            className="hidden md:flex items-center gap-1 bg-surface-1/80 border border-stroke-muted px-2 py-1.5 rounded-full backdrop-blur-sm shadow-sm"
          >
            {NAV_ITEMS.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={(e) => handleNavClick(e, item.id)}
                  className={`relative px-3.5 py-1.5 text-xs font-medium rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                    isActive
                      ? 'text-text-primary'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {isActive && (
                    <motion.span
                      layoutId="activeNavTab"
                      className="absolute inset-0 bg-surface-3 rounded-full border border-stroke-muted/80 -z-10"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                  {item.label}
                </a>
              );
            })}
          </nav>

          {/* Desktop Right Controls (Theme, Resume, GitHub) */}
          <div className="hidden md:flex items-center gap-2.5">
            {/* Theme Toggle Button */}
            <IconButton
              ariaLabel={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
              variant="outline"
              size="sm"
              onClick={toggleTheme}
              icon={
                theme === 'dark' ? (
                  <Sun className="w-4 h-4 text-text-secondary hover:text-amber-400 transition-colors" />
                ) : (
                  <Moon className="w-4 h-4 text-text-secondary hover:text-indigo-600 transition-colors" />
                )
              }
            />

            {/* GitHub Profile Link */}
            <IconButton
              href="https://github.com/ClickWithMuleta"
              target="_blank"
              ariaLabel="Muleta Sisay GitHub profile"
              icon={<Github className="w-4 h-4" />}
              variant="outline"
              size="sm"
            />

            {/* Resume Download Button */}
            <a
              href="/resume.pdf"
              download="Muleta_Sisay_Resume.pdf"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stroke-muted bg-surface-2 hover:bg-surface-3 text-xs font-medium text-text-primary hover:border-stroke-active transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              aria-label="Download Muleta Sisay CV Resume"
            >
              <FileDown className="w-3.5 h-3.5 text-accent-electric" />
              <span>Resume</span>
            </a>

            {/* Contact CTA */}
            <Button
              variant="primary"
              size="sm"
              onClick={(e) => handleNavClick(e, 'contact')}
              rightIcon={<ArrowUpRight className="w-3.5 h-3.5" />}
            >
              Contact
            </Button>
          </div>

          {/* Mobile Actions & Hamburger Trigger */}
          <div className="flex md:hidden items-center gap-2">
            {/* Mobile Theme Toggle */}
            <IconButton
              ariaLabel={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
              variant="surface"
              size="sm"
              onClick={toggleTheme}
              icon={theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            />

            {/* Mobile Menu Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-lg border border-stroke-muted bg-surface-2 text-text-secondary hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 top-[60px] bg-canvas/80 backdrop-blur-sm -z-10 md:hidden"
              aria-hidden="true"
            />

            {/* Animated Menu Drawer */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="md:hidden bg-surface-1 border-b border-stroke-muted shadow-float mt-2 px-4 py-6"
            >
              <nav aria-label="Mobile Navigation" className="flex flex-col gap-1.5">
                {NAV_ITEMS.map((item) => {
                  const isActive = activeSection === item.id;
                  return (
                    <a
                      key={item.id}
                      href={`#${item.id}`}
                      onClick={(e) => handleNavClick(e, item.id)}
                      className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-surface-3 text-text-primary font-semibold border-l-2 border-accent-electric'
                          : 'text-text-secondary hover:text-text-primary hover:bg-surface-2'
                      }`}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      <span>{item.label}</span>
                      {isActive && (
                        <span className="w-1.5 h-1.5 rounded-full bg-accent-electric" />
                      )}
                    </a>
                  );
                })}

                {/* Mobile Drawer Actions */}
                <div className="pt-4 mt-3 border-t border-stroke-muted flex flex-col gap-3">
                  <div className="grid grid-cols-2 gap-2">
                    <a
                      href="/resume.pdf"
                      download="Muleta_Sisay_Resume.pdf"
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-stroke-muted bg-surface-2 hover:bg-surface-3 text-xs font-medium text-text-primary text-center"
                    >
                      <FileDown className="w-4 h-4 text-accent-electric" />
                      <span>Resume</span>
                    </a>
                    <a
                      href="https://github.com/ClickWithMuleta"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-stroke-muted bg-surface-2 hover:bg-surface-3 text-xs font-medium text-text-primary text-center"
                    >
                      <Github className="w-4 h-4" />
                      <span>GitHub</span>
                    </a>
                  </div>

                  <Button
                    variant="primary"
                    size="md"
                    className="w-full"
                    onClick={(e) => handleNavClick(e, 'contact')}
                    rightIcon={<ArrowUpRight className="w-4 h-4" />}
                  >
                    Get in Touch
                  </Button>
                </div>
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
