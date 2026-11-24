import React from 'react';
import { ExternalLink, Github, Sparkles, CheckCircle2 } from 'lucide-react';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import IconButton from '../../components/common/IconButton';
import ProjectMockup from './ProjectMockup';

export const ProjectCard = ({ project, isFeatured = false }) => {
  return (
    <article
      className={`group relative rounded-2xl bg-surface-1 border transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-ambient hover:shadow-float ${
        isFeatured
          ? 'border-accent/40 hover:border-accent shadow-glow/10'
          : 'border-stroke-muted hover:border-stroke-active'
      }`}
    >
      <div>
        {/* Project Visual Mockup Window */}
        <div className="relative w-full aspect-video sm:aspect-[16/10] overflow-hidden border-b border-stroke-muted bg-[#0d0d10]">
          <div className="w-full h-full transition-transform duration-500 ease-out group-hover:scale-[1.02]">
            <ProjectMockup projectId={project.id} isFeatured={isFeatured} />
          </div>

          {/* Featured Pill Overlay */}
          {isFeatured && (
            <div className="absolute top-3 left-3 z-10">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-1/90 backdrop-blur-md border border-accent/40 text-[11px] font-mono font-semibold text-accent-electric shadow-ambient">
                <Sparkles className="w-3 h-3 text-accent-electric" />
                <span>Featured Flagship Project</span>
              </span>
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6">
          {/* Category & Status Row */}
          <div className="flex items-center justify-between gap-2 mb-2.5">
            <span className="font-mono text-xs uppercase tracking-wider text-accent-electric font-medium">
              {project.category}
            </span>
            {project.subtitle && (
              <span className="text-[11px] font-mono text-text-muted truncate">
                {project.subtitle}
              </span>
            )}
          </div>

          {/* Project Title */}
          <h3 className="text-xl sm:text-2xl font-bold text-text-primary tracking-tight mb-2 group-hover:text-accent transition-colors">
            {project.title}
          </h3>

          {/* Short Narrative Description */}
          <p className="text-sm text-text-secondary leading-relaxed mb-4">
            {project.shortDescription}
          </p>

          {/* Key Feature Highlights */}
          {project.highlights && project.highlights.length > 0 && (
            <div className="mb-4 space-y-1.5 bg-surface-2/40 border border-stroke-muted/40 p-3 rounded-lg">
              <span className="text-[10px] font-mono text-text-muted uppercase tracking-wider block mb-1">
                Core Engineering Capabilities:
              </span>
              {project.highlights.map((highlight, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs text-text-secondary">
                  <CheckCircle2 className="w-3.5 h-3.5 text-accent-electric shrink-0" />
                  <span>{highlight}</span>
                </div>
              ))}
            </div>
          )}

          {/* Metrics Pill Grid */}
          {project.metrics && project.metrics.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-5">
              {project.metrics.map((metric, idx) => (
                <div key={idx} className="p-2 rounded-md bg-surface-2 border border-stroke-muted">
                  <p className="text-[10px] font-mono text-text-muted uppercase">{metric.label}</p>
                  <p className="text-xs font-semibold text-text-primary truncate">{metric.value}</p>
                </div>
              ))}
            </div>
          )}

          {/* Technology Badges */}
          <div className="flex flex-wrap gap-1.5 pt-2 border-t border-stroke-muted/60">
            {project.technologies.map((tech) => (
              <Badge key={tech} variant="tech" size="sm">
                {tech}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Card Action Footer */}
      <div className="px-5 py-4 sm:px-6 bg-surface-2/60 border-t border-stroke-muted flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {/* GitHub Repository Link */}
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-stroke-muted bg-surface-1 hover:bg-surface-3 text-xs font-medium text-text-primary hover:border-stroke-active transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              aria-label={`View ${project.title} GitHub Repository`}
            >
              <Github className="w-4 h-4" />
              <span>Source Code</span>
            </a>
          )}
        </div>

        {/* Live Demo Action - Strictly rendered only when liveDemoUrl is valid */}
        {project.liveDemoUrl ? (
          <a
            href={project.liveDemoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent hover:bg-accent-electric text-canvas font-semibold text-xs transition-all shadow-ambient hover:shadow-glow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            aria-label={`Open Live Demo for ${project.title}`}
          >
            <span>Live Demo</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        ) : (
          <span className="text-[11px] font-mono text-text-muted">
            Internal / Academic Archive
          </span>
        )}
      </div>
    </article>
  );
};

export default ProjectCard;
