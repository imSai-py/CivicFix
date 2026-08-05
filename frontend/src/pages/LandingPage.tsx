import React, { useState } from 'react';
import {
  MapPin,
  Camera,
  Zap,
  CheckCircle2,
  Lock,
  BarChart3,
  ArrowRight,
  Sparkles,
  Users,
  FilePlus,
  ChevronRight,
  Globe
} from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
  onExploreMap: () => void;
  onSignIn: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onGetStarted,
  onExploreMap,
  onSignIn,
}) => {
  const [activeStep, setActiveStep] = useState<number>(0);

  const steps = [
    {
      number: '01',
      title: 'Snap & Auto-Geolocate',
      subtitle: 'Instant Citizen Reporting',
      description: 'Capture a photo of any pothole, broken streetlight, or water leak. CivicFix automatically tags precise GPS coordinates and categorizes the hazard.',
      icon: <Camera className="w-8 h-8 text-primary neon-text-primary" />,
      badge: '30 Second Flow',
      color: 'border-primary/50 bg-primary/10 text-primary'
    },
    {
      number: '02',
      title: 'Municipal Triage & Dispatch',
      subtitle: 'Real-Time Work Orders',
      description: 'City officials receive structured GeoJSON reports immediately. Reports are prioritized by severity and dispatched to specialized field repair crews.',
      icon: <Zap className="w-8 h-8 text-tertiary neon-text-tertiary" />,
      badge: '< 2 Hours Triage',
      color: 'border-tertiary/50 bg-tertiary/10 text-tertiary'
    },
    {
      number: '03',
      title: 'Verified Fix & Audit Trail',
      subtitle: 'Transparent Community Results',
      description: 'Crews upload photo proof upon completion. Citizens receive push updates, and audit logs are recorded permanently in the city resolution ledger.',
      icon: <CheckCircle2 className="w-8 h-8 text-secondary neon-text-secondary" />,
      badge: '100% Transparent',
      color: 'border-secondary/50 bg-secondary/10 text-secondary'
    }
  ];

  const coreFeatures = [
    {
      icon: <Globe className="w-6 h-6 text-secondary" />,
      title: 'GeoJSON Spatial Mapping',
      description: 'Interactive high-density city map featuring live issue clusters, category heatmaps, and precise vector coordinates.'
    },
    {
      icon: <Lock className="w-6 h-6 text-primary" />,
      title: 'Role-Based Municipal Access',
      description: 'Strict security boundaries isolating citizen reporting, official triage consoles, and field worker dispatch.'
    },
    {
      icon: <BarChart3 className="w-6 h-6 text-tertiary" />,
      title: 'Resolution Intelligence',
      description: 'Automated analytics on response times, neighborhood resolution velocity, and recurring infrastructure bottlenecks.'
    },
    {
      icon: <Users className="w-6 h-6 text-secondary" />,
      title: 'Community Upvote Priority',
      description: 'Citizens upvote critical hazards in their area, elevating high-impact issues to municipal emergency priority.'
    }
  ];

  return (
    <div className="space-y-24 py-6">
      {/* 1. Hero Section matching $2,000 Design */}
      <section className="relative text-center space-y-8 max-w-5xl mx-auto pt-8">
        {/* Cyberpunk Glow Orbs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/15 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute top-20 left-1/4 w-72 h-72 bg-secondary/15 rounded-full blur-[100px] pointer-events-none"></div>

        {/* Eyebrow Pill */}
        <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-surface-container border border-primary/40 shadow-[0_0_15px_rgba(255,45,120,0.2)]">
          <Sparkles className="w-4 h-4 text-primary animate-pulse" />
          <span className="font-label text-xs uppercase tracking-widest font-bold text-on-surface">
            Next-Gen Municipal Operations Platform
          </span>
        </div>

        {/* Giant Hero Title */}
        <h1 className="font-headline font-black text-4xl sm:text-6xl lg:text-7xl text-on-surface tracking-tight leading-[1.1]">
          Transform Your City <br className="hidden sm:block" />
          In <span className="text-secondary neon-text-secondary font-black inline-block">Real-Time.</span>
        </h1>

        {/* Subtitle */}
        <p className="font-body text-base sm:text-xl text-on-surface-variant max-w-2xl mx-auto leading-relaxed">
          Report civic hazards in under 30 seconds. Track municipal work orders live with verified before/after audit logs and instant community updates.
        </p>

        {/* Call-To-Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <button
            onClick={onGetStarted}
            className="w-full sm:w-auto font-headline font-black text-base uppercase tracking-wider px-8 py-4 rounded-2xl bg-gradient-to-r from-primary via-[#e0005a] to-primary text-white shadow-[0_0_30px_rgba(255,45,120,0.6)] hover:shadow-[0_0_45px_rgba(255,45,120,0.9)] hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center space-x-3 group"
          >
            <FilePlus className="w-5 h-5 text-white" />
            <span>Report an Issue</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={onExploreMap}
            className="w-full sm:w-auto font-label font-bold text-xs uppercase tracking-widest px-8 py-4 rounded-2xl bg-surface-container border-2 border-secondary/50 text-secondary hover:bg-secondary/10 hover:border-secondary shadow-[0_0_20px_rgba(0,255,204,0.2)] transition-all flex items-center justify-center space-x-2"
          >
            <MapPin className="w-4 h-4 text-secondary" />
            <span>Explore Live Map</span>
          </button>
        </div>

        {/* Live Metrics Counter Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-12 border-t border-outline-variant/30 max-w-4xl mx-auto">
          <div className="bg-surface-container/60 p-4 rounded-2xl border border-white/5">
            <div className="font-headline font-black text-2xl sm:text-3xl text-secondary neon-text-secondary">1,480+</div>
            <div className="font-label text-[10px] uppercase tracking-wider text-on-surface-variant font-semibold">Issues Resolved</div>
          </div>
          <div className="bg-surface-container/60 p-4 rounded-2xl border border-white/5">
            <div className="font-headline font-black text-2xl sm:text-3xl text-tertiary neon-text-tertiary">&lt; 24h</div>
            <div className="font-label text-[10px] uppercase tracking-wider text-on-surface-variant font-semibold">Avg Triage Speed</div>
          </div>
          <div className="bg-surface-container/60 p-4 rounded-2xl border border-white/5">
            <div className="font-headline font-black text-2xl sm:text-3xl text-primary neon-text-primary">100%</div>
            <div className="font-label text-[10px] uppercase tracking-wider text-on-surface-variant font-semibold">Audit Transparency</div>
          </div>
          <div className="bg-surface-container/60 p-4 rounded-2xl border border-white/5">
            <div className="font-headline font-black text-2xl sm:text-3xl text-white">4.9 ★</div>
            <div className="font-label text-[10px] uppercase tracking-wider text-on-surface-variant font-semibold">Citizen Satisfaction</div>
          </div>
        </div>
      </section>

      {/* 2. Interactive "How CivicFix Works" 3-Step Section */}
      <section className="space-y-12 max-w-5xl mx-auto">
        <div className="text-center space-y-3">
          <div className="font-label text-xs uppercase tracking-widest font-bold text-secondary">
            Simple 3-Step Resolution Engine
          </div>
          <h2 className="font-headline font-bold text-3xl sm:text-4xl text-on-surface">
            How CivicFix Empower Citizens
          </h2>
          <p className="font-body text-sm text-on-surface-variant max-w-lg mx-auto">
            From reporting a hazard on your phone to verified municipal repair, every step is tracked transparently.
          </p>
        </div>

        {/* Step Selector Tabs & Detailed Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((step, idx) => (
            <div
              key={idx}
              onClick={() => setActiveStep(idx)}
              className={`neon-card rounded-3xl p-6 border transition-all duration-300 cursor-pointer flex flex-col justify-between space-y-6 ${
                activeStep === idx
                  ? 'border-secondary shadow-[0_0_25px_rgba(0,255,204,0.3)] scale-[1.02]'
                  : 'border-white/10 opacity-70 hover:opacity-100 hover:border-white/30'
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="font-headline font-black text-3xl text-on-surface-variant/40">
                    {step.number}
                  </div>
                  <span className={`font-label text-[10px] uppercase font-bold px-3 py-1 rounded-full border ${step.color}`}>
                    {step.badge}
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-surface-container-high/80 w-fit">
                  {step.icon}
                </div>

                <div>
                  <h3 className="font-headline font-bold text-xl text-on-surface mb-1">
                    {step.title}
                  </h3>
                  <p className="font-label text-xs uppercase tracking-wider text-secondary mb-3 font-semibold">
                    {step.subtitle}
                  </p>
                  <p className="font-body text-xs text-on-surface-variant leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center text-xs font-bold text-secondary group pt-2 border-t border-white/5">
                <span>Explore Step {step.number}</span>
                <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Platform Capabilities Bento Grid */}
      <section className="space-y-10 max-w-5xl mx-auto">
        <div className="text-center space-y-3">
          <div className="font-label text-xs uppercase tracking-widest font-bold text-primary">
            Enterprise Municipal Tech
          </div>
          <h2 className="font-headline font-bold text-3xl sm:text-4xl text-on-surface">
            Built for Modern Smart Cities
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {coreFeatures.map((feat, idx) => (
            <div
              key={idx}
              className="neon-card rounded-3xl p-6 border border-white/10 hover:border-primary/50 transition-all duration-300 space-y-3 group"
            >
              <div className="p-3 rounded-2xl bg-surface-container-high/80 w-fit group-hover:scale-110 transition-transform">
                {feat.icon}
              </div>
              <h3 className="font-headline font-bold text-lg text-on-surface group-hover:text-primary transition-colors">
                {feat.title}
              </h3>
              <p className="font-body text-xs text-on-surface-variant leading-relaxed">
                {feat.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Call-To-Action Banner */}
      <section className="neon-card-primary rounded-3xl p-8 sm:p-12 text-center space-y-6 max-w-4xl mx-auto relative overflow-hidden">
        <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-primary/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="space-y-2 relative z-10">
          <h2 className="font-headline font-black text-3xl sm:text-4xl text-on-surface">
            Ready to Upgrade Your Neighborhood?
          </h2>
          <p className="font-body text-sm text-on-surface-variant max-w-md mx-auto">
            Join thousands of active citizens reporting issues and transforming city infrastructure today.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10 pt-2">
          <button
            onClick={onGetStarted}
            className="w-full sm:w-auto font-headline font-bold text-sm uppercase tracking-wider px-8 py-4 rounded-2xl bg-primary text-white shadow-[0_0_25px_rgba(255,45,120,0.6)] hover:shadow-[0_0_35px_rgba(255,45,120,0.9)] hover:scale-105 active:scale-95 transition-all"
          >
            Create Free Account
          </button>
          <button
            onClick={onSignIn}
            className="w-full sm:w-auto font-label font-bold text-xs uppercase tracking-widest px-8 py-4 rounded-2xl bg-surface-container border border-outline/40 text-on-surface hover:border-secondary transition-all"
          >
            Sign In To Existing Account
          </button>
        </div>
      </section>
    </div>
  );
};
