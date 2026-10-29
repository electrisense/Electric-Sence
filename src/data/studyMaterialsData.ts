import type { StudyMaterial } from '../types';

export const STUDY_MATERIALS: StudyMaterial[] = [
  {
    id: 'mat-1',
    title: 'Comprehensive Circuit Theorems & Transient Master Sheet',
    subject: 'Circuit Analysis',
    type: 'Formula Sheet',
    topicsCovered: ['Thevenin/Norton', 'First-order RC/RL differential steps', 'Phasor relationships', 'S-domain impedances'],
    downloadsCount: 1420
  },
  {
    id: 'mat-2',
    title: 'Transformer & Induction Machine Equivalents Reference',
    subject: 'Electrical Machines',
    type: 'Lecture Notes',
    topicsCovered: ['Exact equivalent circuits', 'No-load & blocked rotor tests', 'Torque-slip characteristics', 'Kopp formula'],
    downloadsCount: 980
  },
  {
    id: 'mat-3',
    title: 'Power System Fault Analysis & Symmetrical Components Guide',
    subject: 'Power Systems',
    type: 'Exam Guide',
    topicsCovered: ['Sequence networks', 'Phase-to-ground fault matrices', 'Bus impedance matrix construction', 'Per-unit conversions'],
    downloadsCount: 1150
  },
  {
    id: 'mat-4',
    title: 'Control Systems Frequency Response & Root Locus Handbook',
    subject: 'Control Systems',
    type: 'Exam Guide',
    topicsCovered: ['Root locus sketching rules', 'Bode asymptotes & phase crossover', 'Nyquist mapping & encirclement criteria'],
    downloadsCount: 840
  },
  {
    id: 'mat-5',
    title: 'SMPS Topologies & PWM Switching Waveform Reference',
    subject: 'Power Electronics',
    type: 'Formula Sheet',
    topicsCovered: ['Buck, Boost, Buck-Boost inductor sizing equations', 'Continuous vs discontinuous conduction mode (CCM/DCM)'],
    downloadsCount: 790
  },
  {
    id: 'mat-6',
    title: 'Electrical Machines Laboratory: DC & AC Testing Manual',
    subject: 'Laboratory Practicum',
    type: 'Lab Manual',
    topicsCovered: ['Swinburne’s test', 'Hopkinson’s test', 'Vector grouping of 3-phase transformers', 'Circle diagram of induction motor'],
    downloadsCount: 620
  }
];
