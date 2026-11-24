import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import MainLayout from './components/layout/MainLayout';
import HeroSection from './features/hero/HeroSection';
import AboutSection from './features/about/AboutSection';
import SkillsSection from './features/skills/SkillsSection';
import ProjectsSection from './features/projects/ProjectsSection';
import ExperienceTimeline from './features/experience/ExperienceTimeline';
import ContactSection from './features/contact/ContactSection';

const PortfolioMainView = () => {
  return (
    <>
      {/* 1. Production Hero Section */}
      <HeroSection />

      {/* 2. Production About Me Section */}
      <AboutSection />

      {/* 3. Production Skills & Technologies Section */}
      <SkillsSection />

      {/* 4. Production Featured Projects Section */}
      <ProjectsSection />

      {/* 5. Production Career Experience & Education Timeline */}
      <ExperienceTimeline />

      {/* 6. Production Inbound Contact Section */}
      <ContactSection />
    </>
  );
};

export const App = () => {
  return (
    <ThemeProvider>
      <Router>
        <MainLayout>
          <Routes>
            <Route path="/" element={<PortfolioMainView />} />
          </Routes>
        </MainLayout>
      </Router>
    </ThemeProvider>
  );
};

export default App;
