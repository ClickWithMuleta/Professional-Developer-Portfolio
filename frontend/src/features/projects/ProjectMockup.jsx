import React from 'react';
import { 
  TrendingUp, 
  AlertTriangle, 
  Activity, 
  Stethoscope, 
  Package, 
  Boxes, 
  Database, 
  ShieldCheck, 
  CheckCircle2,
  Terminal,
  Cpu
} from 'lucide-react';

export const ProjectMockup = ({ projectId = '', isFeatured = false }) => {
  const normalizedId = String(projectId).toLowerCase();

  if (
    normalizedId === 'smart-cashflow-tracker' ||
    normalizedId === 'moibirr' ||
    normalizedId.includes('cashflow') ||
    normalizedId.includes('birr')
  ) {
    return (
      <div className="w-full h-full bg-[#0d0d10] p-4 sm:p-5 flex flex-col justify-between select-none font-sans overflow-hidden">
        {/* Mockup Titlebar */}
        <div className="flex items-center justify-between pb-3 border-b border-stroke-muted/60 text-[11px] font-mono text-text-muted">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/70 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/70 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/70 inline-block" />
            <span className="ml-2 text-text-secondary">moibirr // financial-analytics.py</span>
          </div>
          <span className="text-accent-electric flex items-center gap-1">
            <Activity className="w-3 h-3" />
            <span>Telemetry: Live</span>
          </span>
        </div>

        {/* Dashboard Graphic Layout */}
        <div className="grid grid-cols-12 gap-3 my-auto py-2">
          {/* Main Chart Card */}
          <div className="col-span-12 sm:col-span-8 bg-surface-1/90 border border-stroke-muted rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-mono text-text-muted">FORECAST & SPENDING TREND</span>
              <span className="text-[10px] font-mono text-accent-electric px-1.5 py-0.5 rounded bg-accent/10">LightGBM Model</span>
            </div>
            
            {/* Synthetic Vector Trend Sparkline */}
            <svg viewBox="0 0 280 70" className="w-full h-16 stroke-current text-accent-electric fill-none">
              <path
                d="M 0 50 Q 40 20, 80 40 T 160 25 T 220 35 T 280 15"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <path
                d="M 0 50 Q 40 20, 80 40 T 160 25 T 220 35 T 280 15 L 280 70 L 0 70 Z"
                className="fill-accent/10"
              />
              {/* Anomaly Detection Point */}
              <circle cx="160" cy="25" r="4.5" className="fill-status-warning stroke-canvas stroke-2 animate-pulse" />
            </svg>
            <div className="flex justify-between text-[9px] font-mono text-text-muted mt-1">
              <span>WK 1</span>
              <span>WK 2</span>
              <span className="text-status-warning">Anomaly Flag</span>
              <span>WK 4</span>
            </div>
          </div>

          {/* Anomaly Alert & Clustering Widget */}
          <div className="col-span-12 sm:col-span-4 flex flex-col gap-2">
            <div className="bg-surface-1/90 border border-status-warning/30 rounded-lg p-2.5">
              <div className="flex items-center gap-1.5 text-status-warning text-[10px] font-mono font-medium mb-1">
                <AlertTriangle className="w-3 h-3" />
                <span>ANOMALY ALERT</span>
              </div>
              <p className="text-[11px] font-semibold text-text-primary">+142% Deviation</p>
              <p className="text-[9px] text-text-muted mt-0.5">High deviation flagged by model</p>
            </div>

            <div className="bg-surface-1/90 border border-stroke-muted rounded-lg p-2.5">
              <div className="flex items-center gap-1.5 text-accent text-[10px] font-mono font-medium mb-1">
                <Cpu className="w-3 h-3" />
                <span>K-MEANS CLUSTERING</span>
              </div>
              <p className="text-[11px] font-semibold text-text-primary">Optimized Budget</p>
              <p className="text-[9px] text-text-muted mt-0.5">Automated savings goal</p>
            </div>
          </div>
        </div>

        {/* Mockup Status Pill */}
        <div className="pt-2 border-t border-stroke-muted/60 flex items-center justify-between text-[10px] font-mono text-text-muted">
          <span>Backend: Django REST + PostgreSQL</span>
          <span className="text-text-secondary">Host: Render (moibirr.onrender.com)</span>
        </div>
      </div>
    );
  }

  if (
    normalizedId === 'ehospital-harar' ||
    normalizedId.includes('hospital') ||
    normalizedId.includes('ehs')
  ) {
    return (
      <div className="w-full h-full bg-[#0d0d10] p-4 sm:p-5 flex flex-col justify-between select-none font-sans overflow-hidden">
        {/* Titlebar */}
        <div className="flex items-center justify-between pb-3 border-b border-stroke-muted/60 text-[11px] font-mono text-text-muted">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/70 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/70 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/70 inline-block" />
            <span className="ml-2 text-text-secondary">ehospital-harar // telemedicine-portal</span>
          </div>
          <span className="text-accent flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" />
            <span>Secure Medical EHR</span>
          </span>
        </div>

        {/* Healthcare Dashboard Preview */}
        <div className="space-y-2.5 my-auto py-2">
          {/* Doctor Recommendation Widget */}
          <div className="bg-surface-1/90 border border-stroke-muted rounded-lg p-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center text-accent-electric">
                <Stethoscope className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-text-primary">Doctor Recommendation System</p>
                <p className="text-[10px] font-mono text-text-muted">TF-IDF & Logistic Regression Matcher</p>
              </div>
            </div>
            <span className="text-[10px] font-mono text-accent-electric bg-accent/10 px-2 py-0.5 rounded border border-accent/20">
              98% Match
            </span>
          </div>

          {/* Telemedicine & Records Row */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="bg-surface-1/90 border border-stroke-muted rounded-lg p-2.5">
              <p className="text-[10px] font-mono text-text-muted mb-0.5">TELEMEDICINE SESSION</p>
              <div className="flex items-center gap-1.5 text-text-primary text-xs font-medium">
                <span className="w-2 h-2 rounded-full bg-accent-electric animate-ping inline-block" />
                <span>Virtual Consultation</span>
              </div>
            </div>

            <div className="bg-surface-1/90 border border-stroke-muted rounded-lg p-2.5">
              <p className="text-[10px] font-mono text-text-muted mb-0.5">PAYMENT PIPELINE</p>
              <div className="flex items-center gap-1.5 text-accent-electric text-xs font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Integrated Billing</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-stroke-muted/60 flex items-center justify-between text-[10px] font-mono text-text-muted">
          <span>Final-Year Capstone: Harar City</span>
          <span className="text-text-secondary">Django • PostgreSQL • Python</span>
        </div>
      </div>
    );
  }

  // Accessories Management System
  return (
    <div className="w-full h-full bg-[#0d0d10] p-4 sm:p-5 flex flex-col justify-between select-none font-sans overflow-hidden">
      {/* Titlebar */}
      <div className="flex items-center justify-between pb-3 border-b border-stroke-muted/60 text-[11px] font-mono text-text-muted">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500/70 inline-block" />
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500/70 inline-block" />
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/70 inline-block" />
          <span className="ml-2 text-text-secondary">amn_corp // accessories-erp</span>
        </div>
        <span className="text-accent-electric flex items-center gap-1">
          <Database className="w-3 h-3" />
          <span>MySQL Relational</span>
        </span>
      </div>

      {/* Inventory Matrix Preview */}
      <div className="space-y-2.5 my-auto py-2">
        <div className="bg-surface-1/90 border border-stroke-muted rounded-lg p-3">
          <div className="flex items-center justify-between text-[11px] font-mono text-text-muted mb-2">
            <span>INVENTORY ALLOCATION MATRIX</span>
            <span className="text-text-secondary">Addis Media Network</span>
          </div>

          {/* Table Rows Preview */}
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between items-center py-1 border-b border-stroke-muted/40 font-mono text-[11px]">
              <span className="text-text-primary flex items-center gap-1.5">
                <Package className="w-3 h-3 text-accent" />
                <span>Media Hardware SKU-402</span>
              </span>
              <span className="text-accent-electric font-semibold">142 In Stock</span>
            </div>
            <div className="flex justify-between items-center py-1 font-mono text-[11px]">
              <span className="text-text-secondary flex items-center gap-1.5">
                <Boxes className="w-3 h-3 text-text-muted" />
                <span>Studio Accessories</span>
              </span>
              <span className="text-amber-400 font-semibold">Reorder Threshold</span>
            </div>
          </div>
        </div>

        <div className="p-2.5 rounded-lg bg-surface-1/90 border border-stroke-muted flex items-center justify-between text-xs">
          <span className="text-text-muted font-mono text-[10px]">REQUISITION LOGS:</span>
          <span className="text-text-primary font-medium text-[11px]">Automated Department Approvals</span>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-2 border-t border-stroke-muted/60 flex items-center justify-between text-[10px] font-mono text-text-muted">
        <span>Internship: Addis Media Network</span>
        <span className="text-text-secondary">PHP • MySQL Integration</span>
      </div>
    </div>
  );
};

export default ProjectMockup;
