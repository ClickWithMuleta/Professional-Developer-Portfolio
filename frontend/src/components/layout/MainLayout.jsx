import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

export const MainLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-canvas text-text-primary selection:bg-accent-electric/20 selection:text-accent-electric relative">
      {/* Skip to Content for Keyboard Accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 z-50 px-4 py-2 bg-accent text-canvas font-semibold rounded-md shadow-float focus:outline-none focus:ring-2 focus:ring-accent-electric"
      >
        Skip to main content
      </a>

      {/* Global Navigation */}
      <Navbar />

      {/* Main Content Area */}
      <main id="main-content" className="flex-1 pt-20">
        {children}
      </main>

      {/* Global Footer */}
      <Footer />
    </div>
  );
};

export default MainLayout;
