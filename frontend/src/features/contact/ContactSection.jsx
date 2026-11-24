import React, { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { 
  Mail, 
  Send, 
  Github, 
  Linkedin, 
  MapPin, 
  Copy, 
  Check, 
  AlertCircle, 
  CheckCircle2, 
  Terminal, 
  Loader2,
  Clock,
  Sparkles
} from 'lucide-react';
import Container from '../../components/common/Container';
import Button from '../../components/common/Button';
import IconButton from '../../components/common/IconButton';
import Badge from '../../components/common/Badge';
import { apiClient } from '../../services/apiClient';

const CONTACT_EMAIL = import.meta.env.VITE_CONTACT_EMAIL || 'clickwithmuleta@gmail.com';
const GITHUB_URL = 'https://github.com/ClickWithMuleta';
const LINKEDIN_URL = 'https://linkedin.com/in/muleta-sisay';

export const ContactSection = () => {
  const shouldReduceMotion = useReducedMotion();
  const [copiedEmail, setCopiedEmail] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    website_url_hp: '', // Honeypot field for bot suppression
  });

  const [errors, setErrors] = useState({});
  const [submitStatus, setSubmitStatus] = useState('idle'); // 'idle' | 'submitting' | 'success' | 'error'
  const [errorMessage, setErrorMessage] = useState('');

  // Handle email copy to clipboard
  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(CONTACT_EMAIL);
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    } catch (err) {
      console.error('Failed to copy email:', err);
    }
  };

  // Client-side validation
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Please provide your name.';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters.';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Please provide your email address.';
    } else if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address.';
    }

    if (!formData.subject.trim()) {
      newErrors.subject = 'Please enter a subject.';
    } else if (formData.subject.trim().length < 3) {
      newErrors.subject = 'Subject must be at least 3 characters.';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Please include a message.';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (submitStatus === 'error') {
      setSubmitStatus('idle');
      setErrorMessage('');
    }
  };

  // Form submission handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Verify honeypot bot trap
    if (formData.website_url_hp) {
      // Silently discard bot submission
      setSubmitStatus('success');
      return;
    }

    if (!validateForm()) return;

    setSubmitStatus('submitting');
    setErrorMessage('');

    try {
      // Connect to centralized Axios client (prepared for Django DRF backend)
      await apiClient.post('/contact/', {
        sender_name: formData.name.trim(),
        sender_email: formData.email.trim(),
        subject: formData.subject.trim(),
        message_body: formData.message.trim(),
      });

      setSubmitStatus('success');
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
        website_url_hp: '',
      });
    } catch (error) {
      // Strict honesty: do NOT fake success when backend is unreachable or not yet online
      setSubmitStatus('error');
      setErrorMessage(
        error.message ||
        'The backend API is currently initializing or unreachable. Please email me directly using the address on the left.'
      );
    }
  };

  return (
    <section
      id="contact"
      className="py-16 sm:py-24 lg:py-28 bg-canvas-subtle border-t border-stroke-muted scroll-mt-24 relative overflow-hidden"
    >
      <Container>
        {/* Section Header */}
        <div className="max-w-2xl mb-12 sm:mb-16">
          <div className="flex items-center gap-2 text-accent-electric text-xs font-mono font-medium mb-3">
            <Mail className="w-3.5 h-3.5" />
            <span>05 // INBOUND PORTAL</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-text-primary mb-3">
            Let's build something exceptional together.
          </h2>
          <p className="text-text-secondary text-sm sm:text-base leading-relaxed">
            I am currently open to software development opportunities, full-stack projects, and technical collaborations. Whether you are a recruiter, engineering lead, or founder, my inbox is open.
          </p>
        </div>

        {/* 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column: Direct Communication & Channels (5 cols on LG) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Primary Email Card */}
            <div className="p-6 rounded-2xl bg-surface-1 border border-stroke-muted shadow-ambient">
              <span className="text-[10px] font-mono text-text-muted uppercase tracking-wider block mb-2">
                DIRECT INBOX
              </span>
              <div className="flex items-center justify-between gap-2 mb-3">
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="font-mono text-sm sm:text-base font-semibold text-text-primary hover:text-accent transition-colors truncate"
                >
                  {CONTACT_EMAIL}
                </a>
                <button
                  onClick={handleCopyEmail}
                  className="inline-flex items-center justify-center p-2 rounded-lg bg-surface-2 hover:bg-surface-3 text-text-secondary hover:text-text-primary border border-stroke-muted transition-colors shrink-0"
                  aria-label="Copy email address to clipboard"
                  title="Copy email address"
                >
                  {copiedEmail ? (
                    <Check className="w-4 h-4 text-accent-electric" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>

              {copiedEmail && (
                <p className="text-xs font-mono text-accent-electric animate-fade-in">
                  ✓ Email copied to clipboard
                </p>
              )}
            </div>

            {/* Social & Professional Links */}
            <div className="p-6 rounded-2xl bg-surface-1 border border-stroke-muted shadow-ambient space-y-4">
              <span className="text-[10px] font-mono text-text-muted uppercase tracking-wider block">
                DEVELOPER CHANNELS
              </span>

              <div className="space-y-3">
                <a
                  href={GITHUB_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-xl bg-surface-2 hover:bg-surface-3 border border-stroke-muted hover:border-stroke-active transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <Github className="w-5 h-5 text-accent-electric" />
                    <div>
                      <p className="text-xs font-semibold text-text-primary group-hover:text-accent transition-colors">
                        GitHub Profile
                      </p>
                      <p className="text-[11px] font-mono text-text-muted">
                        ClickWithMuleta
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-mono text-accent group-hover:translate-x-1 transition-transform">
                    →
                  </span>
                </a>

                <a
                  href={LINKEDIN_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-xl bg-surface-2 hover:bg-surface-3 border border-stroke-muted hover:border-stroke-active transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <Linkedin className="w-5 h-5 text-sky-400" />
                    <div>
                      <p className="text-xs font-semibold text-text-primary group-hover:text-sky-400 transition-colors">
                        LinkedIn Profile
                      </p>
                      <p className="text-[11px] font-mono text-text-muted">
                        Muleta Sisay
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-mono text-sky-400 group-hover:translate-x-1 transition-transform">
                    →
                  </span>
                </a>
              </div>
            </div>

            {/* Location & Availability Status */}
            <div className="p-5 rounded-2xl bg-surface-1 border border-stroke-muted text-xs text-text-secondary space-y-2.5">
              <div className="flex items-center gap-2 text-text-primary font-medium">
                <MapPin className="w-4 h-4 text-accent" />
                <span>Addis Ababa, Ethiopia (UTC+3)</span>
              </div>
              <div className="flex items-center gap-2 text-text-muted">
                <Clock className="w-4 h-4 text-text-muted" />
                <span>Open for Remote Worldwide & Hybrid Roles</span>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Contact Form UI (7 cols on LG) */}
          <div className="lg:col-span-7">
            <div className="p-6 sm:p-8 rounded-2xl bg-surface-1 border border-stroke-muted shadow-ambient">
              <h3 className="text-lg font-bold text-text-primary mb-1">
                Send a Direct Message
              </h3>
              <p className="text-xs text-text-muted font-mono mb-6">
                All submissions are delivered securely to my inbox.
              </p>

              {/* Success Notification Banner */}
              {submitStatus === 'success' && (
                <div className="mb-6 p-4 rounded-xl bg-accent/10 border border-accent/20 flex items-start gap-3 text-text-primary">
                  <CheckCircle2 className="w-5 h-5 text-accent-electric shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-accent-electric">
                      Message Successfully Sent
                    </h4>
                    <p className="text-xs text-text-secondary mt-1">
                      Thank you for reaching out. I have received your message and will get back to you promptly.
                    </p>
                  </div>
                </div>
              )}

              {/* Error Notification Banner */}
              {submitStatus === 'error' && (
                <div className="mb-6 p-4 rounded-xl bg-status-error/10 border border-status-error/20 flex items-start gap-3 text-text-primary">
                  <AlertCircle className="w-5 h-5 text-status-error shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-status-error">
                      Unable to Send Message
                    </h4>
                    <p className="text-xs text-text-secondary mt-1">
                      {errorMessage}
                    </p>
                  </div>
                </div>
              )}

              {/* Form Element */}
              <form onSubmit={handleSubmit} noValidate className="space-y-4">
                {/* Honeypot field (hidden from genuine users, traps automated bots) */}
                <div className="hidden" aria-hidden="true">
                  <label htmlFor="website_url_hp">Leave this empty</label>
                  <input
                    type="text"
                    id="website_url_hp"
                    name="website_url_hp"
                    value={formData.website_url_hp}
                    onChange={handleChange}
                    tabIndex="-1"
                    autoComplete="off"
                  />
                </div>

                {/* Name & Email Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Name Input */}
                  <div>
                    <label
                      htmlFor="contact-name"
                      className="block text-xs font-mono font-medium text-text-secondary mb-1.5"
                    >
                      Your Name <span className="text-accent-electric">*</span>
                    </label>
                    <input
                      type="text"
                      id="contact-name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      disabled={submitStatus === 'submitting'}
                      aria-required="true"
                      aria-invalid={!!errors.name}
                      aria-describedby={errors.name ? 'name-error' : undefined}
                      placeholder="e.g. Alex Johnson"
                      className={`w-full px-3.5 py-2.5 rounded-lg bg-surface-2 border text-sm text-text-primary placeholder:text-text-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-50 ${
                        errors.name ? 'border-status-error' : 'border-stroke-muted hover:border-stroke-active'
                      }`}
                    />
                    {errors.name && (
                      <p id="name-error" className="text-xs text-status-error mt-1">
                        {errors.name}
                      </p>
                    )}
                  </div>

                  {/* Email Input */}
                  <div>
                    <label
                      htmlFor="contact-email"
                      className="block text-xs font-mono font-medium text-text-secondary mb-1.5"
                    >
                      Your Email <span className="text-accent-electric">*</span>
                    </label>
                    <input
                      type="email"
                      id="contact-email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      disabled={submitStatus === 'submitting'}
                      aria-required="true"
                      aria-invalid={!!errors.email}
                      aria-describedby={errors.email ? 'email-error' : undefined}
                      placeholder="e.g. alex@company.com"
                      className={`w-full px-3.5 py-2.5 rounded-lg bg-surface-2 border text-sm text-text-primary placeholder:text-text-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-50 ${
                        errors.email ? 'border-status-error' : 'border-stroke-muted hover:border-stroke-active'
                      }`}
                    />
                    {errors.email && (
                      <p id="email-error" className="text-xs text-status-error mt-1">
                        {errors.email}
                      </p>
                    )}
                  </div>
                </div>

                {/* Subject Input */}
                <div>
                  <label
                    htmlFor="contact-subject"
                    className="block text-xs font-mono font-medium text-text-secondary mb-1.5"
                  >
                    Subject <span className="text-accent-electric">*</span>
                  </label>
                  <input
                    type="text"
                    id="contact-subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    disabled={submitStatus === 'submitting'}
                    aria-required="true"
                    aria-invalid={!!errors.subject}
                    aria-describedby={errors.subject ? 'subject-error' : undefined}
                    placeholder="e.g. Software Engineering Opportunity / Project Inquiry"
                    className={`w-full px-3.5 py-2.5 rounded-lg bg-surface-2 border text-sm text-text-primary placeholder:text-text-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-50 ${
                      errors.subject ? 'border-status-error' : 'border-stroke-muted hover:border-stroke-active'
                    }`}
                  />
                  {errors.subject && (
                    <p id="subject-error" className="text-xs text-status-error mt-1">
                      {errors.subject}
                    </p>
                  )}
                </div>

                {/* Message Textarea */}
                <div>
                  <label
                    htmlFor="contact-message"
                    className="block text-xs font-mono font-medium text-text-secondary mb-1.5"
                  >
                    Message <span className="text-accent-electric">*</span>
                  </label>
                  <textarea
                    id="contact-message"
                    name="message"
                    rows="5"
                    value={formData.message}
                    onChange={handleChange}
                    disabled={submitStatus === 'submitting'}
                    aria-required="true"
                    aria-invalid={!!errors.message}
                    aria-describedby={errors.message ? 'message-error' : undefined}
                    placeholder="Tell me about your team, project requirements, or question..."
                    className={`w-full px-3.5 py-2.5 rounded-lg bg-surface-2 border text-sm text-text-primary placeholder:text-text-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-50 resize-y ${
                      errors.message ? 'border-status-error' : 'border-stroke-muted hover:border-stroke-active'
                    }`}
                  />
                  {errors.message && (
                    <p id="message-error" className="text-xs text-status-error mt-1">
                      {errors.message}
                    </p>
                  )}
                </div>

                {/* Submit Action */}
                <div className="pt-2">
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="w-full sm:w-auto shadow-glow"
                    isLoading={submitStatus === 'submitting'}
                    rightIcon={submitStatus !== 'submitting' && <Send className="w-4 h-4" />}
                  >
                    {submitStatus === 'submitting' ? 'Delivering...' : 'Send Message'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};

export default ContactSection;
