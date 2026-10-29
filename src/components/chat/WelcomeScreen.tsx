import React from 'react';
import { Cpu, Zap, Activity, Wrench } from 'lucide-react';

interface WelcomeScreenProps {
  onSelectPrompt: (prompt: string) => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onSelectPrompt }) => {
  const suggestions = [
    {
      text: 'Explain electrical machines.',
      category: 'Core Machines',
      icon: Cpu
    },
    {
      text: 'Solve a power system numerical.',
      category: 'Transmission & Faults',
      icon: Zap
    },
    {
      text: 'Understand electrical circuit analysis.',
      category: 'Network Theorems',
      icon: Activity
    },
    {
      text: 'Help me with an EEE project.',
      category: 'Hardware & Capstone',
      icon: Wrench
    }
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 md:py-16 text-center">
      {/* Icon Badge */}
      <div className="w-12 h-12 rounded-lg bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center mx-auto mb-5 shadow-2xs">
        <Zap className="w-6 h-6" />
      </div>

      {/* Heading */}
      <h2 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight mb-3">
        What are you working on today?
      </h2>

      {/* Description */}
      <p className="text-slate-600 text-sm md:text-base leading-relaxed max-w-lg mx-auto mb-10">
        Explore electrical concepts, solve engineering problems, and work on your next project.
      </p>

      {/* Suggested Questions Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
        {suggestions.map((item, idx) => {
          const Icon = item.icon;
          return (
            <button
              key={idx}
              onClick={() => onSelectPrompt(item.text)}
              className="group p-4 rounded-lg bg-white border border-slate-200 hover:border-blue-400 hover:shadow-xs transition-all text-left flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 group-hover:text-blue-600 transition-colors">
                  {item.category}
                </span>
                <Icon className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
              </div>
              <p className="text-sm font-medium text-slate-800 group-hover:text-blue-900 leading-snug">
                {item.text}
              </p>
            </button>
          );
        })}
      </div>

      {/* Honest AI Status Note */}
      <div className="mt-8 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-slate-500 text-xs font-mono">
        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
        <span>Development Mode: AI reasoning engine integration is offline.</span>
      </div>
    </div>
  );
};
