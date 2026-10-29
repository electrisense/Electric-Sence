import React, { useState } from 'react';
import { EEE_PROJECTS } from '../../data/projectsData';
import { FolderGit2, MessageSquare, Plus } from 'lucide-react';

interface ProjectsViewProps {
  onAskInChat: (prompt: string) => void;
}

export const ProjectsView: React.FC<ProjectsViewProps> = ({ onAskInChat }) => {
  const [selectedDomain, setSelectedDomain] = useState<string>('All');
  const [userCustomProjects, setUserCustomProjects] = useState<Array<{ title: string; domain: string; desc: string }>>([
    {
      title: 'Solar Inverter Pure Sine Wave Design',
      domain: 'Renewable Energy',
      desc: 'SPWM microcontroller inverter with LC output filter and low harmonic distortion for off-grid battery systems.'
    }
  ]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDomain, setNewDomain] = useState('Power Electronics');
  const [newDesc, setNewDesc] = useState('');

  const domains = ['All', 'Power Electronics', 'Renewable Energy', 'Embedded Systems / IoT', 'Electric Vehicles'];

  const filteredProjects = selectedDomain === 'All'
    ? EEE_PROJECTS
    : EEE_PROJECTS.filter(p => p.domain === selectedDomain);

  const handleAddProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setUserCustomProjects([
      ...userCustomProjects,
      {
        title: newTitle.trim(),
        domain: newDomain,
        desc: newDesc.trim() || 'Electrical Engineering project documentation in progress.'
      }
    ]);
    setNewTitle('');
    setNewDesc('');
    setShowAddModal(false);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Banner */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200 mb-2">
                <FolderGit2 className="w-3.5 h-3.5" />
                <span>Capstone & Hardware Blueprints</span>
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
                EEE Project Assistance
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                Explore real-world engineering project architectures, component bills-of-materials, and simulation stacks.
              </p>
            </div>

            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-xs font-semibold transition-colors shadow-2xs self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Track New Project</span>
            </button>
          </div>

          {/* Domain Filter */}
          <div className="flex flex-wrap gap-2 mt-5 pt-4 border-t border-slate-100">
            {domains.map((dom) => (
              <button
                key={dom}
                onClick={() => setSelectedDomain(dom)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  selectedDomain === dom
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {dom}
              </button>
            ))}
          </div>
        </div>

        {/* User's Tracked Projects Section */}
        {userCustomProjects.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-slate-500 mb-3">
              My Active Project Workspaces ({userCustomProjects.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {userCustomProjects.map((proj, idx) => (
                <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-lg flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 font-semibold">
                        {proj.domain}
                      </span>
                      <span className="text-[10px] text-slate-400">In Development</span>
                    </div>
                    <h4 className="font-semibold text-slate-900 text-sm mb-1">{proj.title}</h4>
                    <p className="text-xs text-slate-600">{proj.desc}</p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-200 flex justify-end">
                    <button
                      onClick={() => onAskInChat(`I am working on my EEE project: "${proj.title}" in domain "${proj.domain}". How should I design the circuit schematic and component sizing?`)}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Ask Electric Sence</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Blueprints Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs flex flex-col justify-between hover:border-slate-300 transition-all"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    {project.domain}
                  </span>
                  <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    {project.level}
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-base mb-2 leading-snug">
                  {project.title}
                </h3>

                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  {project.description}
                </p>

                {/* Key Components */}
                <div className="mb-4">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1.5">
                    Hardware / Bill of Materials:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {project.keyComponents.map((comp, idx) => (
                      <span
                        key={idx}
                        className="text-xs bg-slate-50 text-slate-700 px-2.5 py-1 rounded-md border border-slate-200 font-mono text-[11px]"
                      >
                        {comp}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Simulation Platforms */}
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1.5">
                    Recommended Simulators:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {project.simulationTools.map((tool, idx) => (
                      <span
                        key={idx}
                        className="text-xs bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded font-mono text-[11px] border border-emerald-200"
                      >
                        {tool}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-5 mt-5 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">Verified EEE Blueprint</span>
                <button
                  onClick={() => onAskInChat(`Give me a step-by-step implementation guide and schematic calculation for "${project.title}"`)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 text-xs font-semibold transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Consult in Chat</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add Project Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
            <div className="bg-white rounded-xl border border-slate-200 p-6 max-w-md w-full shadow-xl">
              <h3 className="text-base font-bold text-slate-900 mb-1">Track New EEE Project</h3>
              <p className="text-xs text-slate-500 mb-4">
                Record your active course or capstone project details for future reference and AI consultation.
              </p>

              <form onSubmit={handleAddProject} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Project Title
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Microgrid Automatic Transfer Switch"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Domain / Field
                  </label>
                  <select
                    value={newDomain}
                    onChange={(e) => setNewDomain(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                  >
                    <option value="Power Electronics">Power Electronics</option>
                    <option value="Renewable Energy">Renewable Energy</option>
                    <option value="Embedded Systems / IoT">Embedded Systems / IoT</option>
                    <option value="Electric Vehicles">Electric Vehicles</option>
                    <option value="Power Systems & Grid">Power Systems & Grid</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Scope / Objective
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Brief description of the circuit, microcontroller, or problem solved..."
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700"
                  >
                    Save Project
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
