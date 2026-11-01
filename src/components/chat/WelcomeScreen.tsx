import React from 'react';
import { Cpu, Zap, Activity, Wrench, ArrowUpRight } from 'lucide-react';

interface WelcomeScreenProps {
  onSelectPrompt: (prompt: string, subject?: string, courseId?: string) => void;
  aiStatus?: 'checking' | 'online' | 'offline' | 'unconfigured';
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onSelectPrompt, aiStatus }) => {
  const suggestionCards = [
    {
      title: 'Electrical Machines',
      subtitle: 'Transformers, induction motors, alternators & DC machines',
      prompt: 'Explain the working principles, equivalent circuits, and characteristics of electrical machines.',
      subject: 'Electrical Machines',
      courseId: 'course_machines_201',
      icon: Cpu,
    },
    {
      title: 'Power Systems',
      subtitle: 'Transmission line modeling, per-unit analysis & symmetrical faults',
      prompt: 'Solve a power system numerical, calculate transmission line parameters, or analyze faults.',
      subject: 'Power Systems',
      courseId: 'course_power_301',
      icon: Zap,
    },
    {
      title: 'Circuit Analysis',
      subtitle: 'Network theorems, AC steady-state phasors & RLC transients',
      prompt: 'Explain circuit analysis methods, network theorems, and AC transient response.',
      subject: 'Electrical Circuits',
      courseId: 'course_circuits_101',
      icon: Activity,
    },
    {
      title: 'Electrical Projects',
      subtitle: 'Hardware blueprints, schematic guidance & component sizing',
      prompt: 'Help me design an EEE project with component selection, schematics, and simulation.',
      icon: Wrench,
    },
  ];

  const renderStatusBadge = () => {
    switch (aiStatus) {
      case 'online':
        return (
          <div className="mt-8 inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Gemini AI is online — Ask anything about Electrical Engineering!</span>
          </div>
        );
      case 'unconfigured':
        return (
          <div className="mt-8 inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-amber-50 border border-amber-200 text-amber-700 text-xs font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <span>Add your <code className="font-mono bg-amber-100 px-1 rounded">GEMINI_API_KEY</code> to <code className="font-mono bg-amber-100 px-1 rounded">.env</code> and restart the server to enable AI.</span>
          </div>
        );
      case 'offline':
        return (
          <div className="mt-8 inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            <span>Backend offline — Start the server with <code className="font-mono bg-rose-100 px-1 rounded">npm run server</code></span>
          </div>
        );
      default:
        return (
          <div className="mt-8 inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-slate-100 border border-slate-200 text-slate-500 text-xs font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-pulse" />
            <span>Connecting to AI backend…</span>
          </div>
        );
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 md:py-14 text-center">
      {/* Brand Icon Badge */}
      <div className="w-11 h-11 rounded-lg bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center mx-auto mb-4">
        <Zap className="w-5 h-5" strokeWidth={2} />
      </div>

      {/* Main Heading */}
      <h2 className="text-2xl md:text-3xl font-semibold text-slate-900 tracking-tight mb-2">
        What are you working on today?
      </h2>

      {/* Description */}
      <p className="text-slate-600 text-sm md:text-base leading-relaxed max-w-xl mx-auto mb-8">
        Explore electrical concepts, solve engineering problems, and work on your next project with AI assistance.
      </p>

      {/* Four Clean Suggestion Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
        {suggestionCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <button
              key={idx}
              onClick={() => onSelectPrompt(card.prompt, card.subject, card.courseId)}
              className="group p-4 rounded-lg bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50/70 transition-colors text-left flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-2.5">
                <div className="w-7 h-7 rounded-md bg-slate-100 group-hover:bg-blue-50 text-slate-600 group-hover:text-blue-600 flex items-center justify-center transition-colors">
                  <Icon className="w-4 h-4" strokeWidth={1.8} />
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
              </div>

              <div>
                <h3 className="text-sm font-semibold text-slate-900 group-hover:text-blue-700 transition-colors">
                  {card.title}
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-normal line-clamp-2">
                  {card.subtitle}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Live AI Status Badge */}
      {renderStatusBadge()}
    </div>
  );
};
