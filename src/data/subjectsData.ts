import type { ElectricalSubject } from '../types';

export const ELECTRICAL_SUBJECTS: ElectricalSubject[] = [
  {
    id: 'circuits',
    code: 'EE-101',
    title: 'Circuit Analysis & Network Theory',
    description: 'Fundamental principles of linear lumped-parameter electrical networks, loop/nodal techniques, and AC steady-state response.',
    topics: [
      'Ohm’s Law & Kirchhoff’s Laws (KVL/KCL)',
      'Thevenin’s & Norton’s Equivalent Theorems',
      'Maximum Power Transfer & Superposition',
      'Transient Analysis in First & Second-Order RLC Circuits',
      'Sinusoidal Steady-State Phasors & Resonance',
      'Two-Port Networks & Parameter Conversions (Z, Y, ABCD, h)'
    ],
    coreConcepts: ['Mesh & Nodal Equations', 'Complex Impedance (Z = R + jX)', 'Damping Factor & Natural Frequency'],
    recommendedFormulas: [
      'V = I · R',
      'Z = √(R² + (X_L - X_C)²)',
      'ω₀ = 1 / √(L · C)',
      'Q = (ω₀ · L) / R'
    ]
  },
  {
    id: 'machines',
    code: 'EE-202',
    title: 'Electrical Machines',
    description: 'Electromechanical energy conversion, operational dynamics of transformers, DC machinery, induction motors, and synchronous alternators.',
    topics: [
      'Single-phase & Three-phase Transformers, Open/Short Circuit Tests',
      'DC Generators & Motors: Back EMF, Torque Equations & Speed Control',
      'Three-Phase Induction Motors: Equivalent Circuit, Torque-Slip Characteristics',
      'Synchronous Alternators: Voltage Regulation & Parallel Operation',
      'Special Electrical Machines (BLDC, Stepper Motors, Switched Reluctance)'
    ],
    coreConcepts: ['Faraday’s Law of Induction', 'Lorentz Force Law', 'Slip (s = (Ns - Nr)/Ns)'],
    recommendedFormulas: [
      'E_rms = 4.44 · f · N · Φ_m',
      'N_s = (120 · f) / P',
      'T_e = (P_mech) / ω_m',
      'V = E_b + I_a · R_a'
    ]
  },
  {
    id: 'power-systems',
    code: 'EE-301',
    title: 'Power Systems Engineering',
    description: 'Generation, transmission line modeling, power flow algorithms, symmetrical/unsymmetrical fault analysis, and stability.',
    topics: [
      'Transmission Line Parameters (Resistance, Inductance, Capacitance)',
      'Short, Medium (Nominal-T, Nominal-π), and Long Line Models',
      'Per-Unit System (p.u.) Calculations & Single-Line Diagrams',
      'Symmetrical Components (Positive, Negative, Zero Sequences)',
      'Fault Analysis: 3-Phase Symmetrical, LG, LL, LLG Faults',
      'Power System Protection & Switchgear Basics'
    ],
    coreConcepts: ['Ferranti Effect', 'Surge Impedance Loading (SIL)', 'Swing Equation & Transient Stability'],
    recommendedFormulas: [
      'Z_pu = Z_actual · (S_base / V_base²)',
      'Z_c = √(L / C)',
      'P = (V_s · V_r / X) · sin(δ)',
      'M · (d²δ / dt²) = P_m - P_e'
    ]
  },
  {
    id: 'control-systems',
    code: 'EE-303',
    title: 'Control Systems',
    description: 'Mathematical modeling of dynamic physical systems, transfer functions, time-domain transient analysis, and frequency-response methods.',
    topics: [
      'Block Diagram Reduction & Mason’s Gain Formula',
      'Time-Domain Performance: Rise Time, Peak Overshoot, Settling Time',
      'Routh-Hurwitz Stability Criterion',
      'Root Locus Construction & Design of Lead/Lag Compensators',
      'Frequency Domain: Bode Plots, Polar Plots, & Nyquist Stability Criterion',
      'State-Space Representation and Controllability/Observability'
    ],
    coreConcepts: ['Closed Loop Transfer Function', 'Gain Margin & Phase Margin', 'Damping Ratio (ζ)'],
    recommendedFormulas: [
      'T(s) = G(s) / (1 + G(s)H(s))',
      'ω_d = ω_n · √(1 - ζ²)',
      '%OS = exp(-πζ / √(1 - ζ²)) · 100%',
      'ẋ = Ax + Bu, y = Cx + Du'
    ]
  },
  {
    id: 'power-electronics',
    code: 'EE-401',
    title: 'Power Electronics & Drives',
    description: 'Solid-state switching power converters, phase-controlled rectifiers, DC-DC choppers, PWM inverters, and motor drive controllers.',
    topics: [
      'Power Semiconductor Devices: Power Diodes, SCR, MOSFET, IGBT',
      'Phase Controlled Rectifiers (Single & Three Phase Controlled Converters)',
      'DC-DC Switched-Mode Converters: Buck, Boost, and Buck-Boost',
      'Voltage Source Inverters (VSI): 120° & 180° Conduction Modes, Sinusoidal PWM',
      'AC Voltage Controllers & Cycloconverters',
      'Variable Frequency Drives (VFD) for AC Induction Motors'
    ],
    coreConcepts: ['Duty Cycle (D = T_on / T)', 'Switching Losses vs Conduction Losses', 'Total Harmonic Distortion (THD)'],
    recommendedFormulas: [
      'V_out(Buck) = D · V_in',
      'V_out(Boost) = V_in / (1 - D)',
      'V_dc(1-ph Rectifier) = (2V_m / π) · cos(α)'
    ]
  },
  {
    id: 'electromagnetics',
    code: 'EE-205',
    title: 'Electromagnetic Field Theory',
    description: 'Electrostatics, magnetostatics, Maxwell’s equations in differential and integral forms, and uniform plane wave propagation.',
    topics: [
      'Coulomb’s Law, Gauss’s Law & Electrostatic Potential',
      'Biot-Savart Law, Ampere’s Circuital Law & Magnetic Vector Potential',
      'Maxwell’s Equations for Time-Varying Fields',
      'Poynting Theorem & Electromagnetic Energy Flow',
      'Uniform Plane Waves, Skin Depth & Attenuation Constants'
    ],
    coreConcepts: ['Displacement Current Density', 'Skin Depth (δ)', 'Intrinsic Impedance (η ≈ 377 Ω in vacuum)'],
    recommendedFormulas: [
      '∇ · D = ρ_v',
      '∇ · B = 0',
      '∇ × E = -∂B/∂t',
      '∇ × H = J + ∂D/∂t',
      'δ = √(2 / (ω · μ · σ))'
    ]
  }
];
