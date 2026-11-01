import type { ElectricalSubject } from '../types';

export const ELECTRICAL_SUBJECTS: ElectricalSubject[] = [
  {
    id: 'circuits',
    code: 'EEE 101',
    title: 'Electrical Circuits & Network Analysis',
    description: 'Fundamental principles of linear lumped-parameter electrical networks, loop/nodal techniques, Thevenin/Norton equivalents, and AC steady-state resonance.',
    courseId: 'course_circuits_101',
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
    code: 'EEE 201',
    title: 'Electrical Machines & Electromechanics',
    description: 'Electromechanical energy conversion, operational dynamics of single & three-phase transformers, DC machinery, induction motors, and synchronous alternators.',
    courseId: 'course_machines_201',
    topics: [
      'Single-phase & Three-phase Transformers: Open/Short Circuit Tests',
      'DC Motors & Generators: Back EMF, Torque Equations & Speed Control',
      'Three-Phase Induction Motors: Equivalent Circuit & Torque-Slip Curves',
      'Synchronous Alternators: Voltage Regulation & Parallel Operation',
      'Special Machines: Permanent Magnet Synchronous Motors & Stepper Drives'
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
    code: 'EEE 301',
    title: 'Power Systems Analysis & Grid Stability',
    description: 'Power generation, transmission line ABCD modeling, per-unit systems, symmetrical/unsymmetrical fault analysis, and swing equation stability.',
    courseId: 'course_power_301',
    topics: [
      'Transmission Line ABCD Modeling (Short, Medium-Nominal-π, Long)',
      'Per-Unit System (p.u.) Calculations & Single-Line Diagrams',
      'Symmetrical Components (Positive, Negative, Zero Sequences)',
      'Fault Analysis: 3-Phase Symmetrical, LG, LL, LLG Faults',
      'Transient Stability: Swing Equation & Equal Area Criterion',
      'Power Flow Formulation: Gauss-Seidel & Newton-Raphson'
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
    id: 'power-electronics',
    code: 'EEE 401',
    title: 'Power Electronics & Switch-Mode Converters',
    description: 'Solid-state switching power converters, phase-controlled rectifiers, DC-DC choppers (Buck, Boost, Buck-Boost), and Sinusoidal PWM inverters.',
    courseId: 'course_pe_401',
    topics: [
      'Power Semiconductor Devices: Power MOSFET, IGBT, SCR, SiC/GaN',
      'Single & Three-Phase Controlled Thyristor Rectifiers',
      'DC-DC Switched-Mode Converters: Buck, Boost, and Buck-Boost Topologies',
      'Voltage Source Inverters (VSI): 180°/120° Modes & Sinusoidal PWM',
      'Harmonic Analysis & Active Power Factor Correction (PFC)',
      'Variable Frequency Drives (VFD) for AC Induction Motor Speed Control'
    ],
    coreConcepts: ['Duty Cycle (D = T_on / T)', 'Switching Losses vs Conduction Losses', 'Total Harmonic Distortion (THD)'],
    recommendedFormulas: [
      'V_out(Buck) = D · V_in',
      'V_out(Boost) = V_in / (1 - D)',
      'V_dc(1-ph Rectifier) = (2V_m / π) · cos(α)'
    ]
  },
  {
    id: 'control-systems',
    code: 'EEE 501',
    title: 'Control Systems Engineering',
    description: 'Mathematical modeling of dynamic linear time-invariant systems, block reduction, time-domain transient response, root locus, and frequency-domain stability.',
    courseId: 'course_cs_501',
    topics: [
      'Block Diagram Algebra & Mason’s Gain Formula',
      'Time-Domain Performance: Rise Time, Peak Overshoot (%OS), Settling Time',
      'Routh-Hurwitz Stability Criterion & Root Locus Construction',
      'Frequency Response: Bode Plots, Polar Plots & Nyquist Stability Criterion',
      'PID Controller Tuning & Lead/Lag Compensator Design',
      'State-Space Representation, Controllability and Observability'
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
    id: 'electrical-measurements',
    code: 'EEE 601',
    title: 'Electrical Measurements & Transducers',
    description: 'Analog and digital electrical instrumentation, PMMC and Moving Iron movements, AC bridge networks, and instrument transformers.',
    courseId: 'course_em_601',
    topics: [
      'Permanent Magnet Moving Coil (PMMC) & Moving Iron (MI) Instruments',
      'AC Bridges: Maxwell, Hay, Schering, and Wien Networks',
      'Instrument Transformers: Current Transformers (CT) & Potential Transformers (PT)',
      'Digital Multimeters (DMM), ADC Architectures & Digital Storage Oscilloscopes (DSO)',
      'Measurement Transducers: LVDT, Strain Gauges, RTD, Thermocouples',
      'Error Analysis & Instrument Calibration Standards'
    ],
    coreConcepts: ['Bridge Balance Condition (Z1·Z4 = Z2·Z3)', 'Deflecting Torque Equation', 'Burden on Instrument Transformers'],
    recommendedFormulas: [
      'T_d = B · I · N · A',
      'Z_1 · Z_4 = Z_2 · Z_3',
      'Ratio Error (%) = [(K_n · I_s - I_p) / I_p] · 100%'
    ]
  },
  {
    id: 'renewable-energy',
    code: 'EEE 701',
    title: 'Renewable Energy Systems & Grid Integration',
    description: 'Solar photovoltaic cell modeling, Maximum Power Point Tracking (MPPT), wind energy conversion with DFIG, and grid interconnection standards.',
    courseId: 'course_re_701',
    topics: [
      'Solar Photovoltaic I-V and P-V Characteristics',
      'Maximum Power Point Tracking (MPPT): Perturb & Observe (P&O), Incremental Conductance',
      'Wind Energy Aerodynamics, Betz Limit, and DFIG Architectures',
      'Battery Energy Storage Systems (BESS) & State of Charge (SoC) Estimation',
      'Grid Interconnection Inverters & IEEE 1547 / IEEE 519 Anti-Islanding Standards',
      'Microgrids, Hybrid Solar-Wind Topologies & Demand Response'
    ],
    coreConcepts: ['Maximum Power Point (MPP)', 'Betz Limit (Cp,max ≈ 59.3%)', 'Total Harmonic Distortion at Grid Point'],
    recommendedFormulas: [
      'I = I_ph - I_0 · [exp(q(V + I·R_s)/(n·k·T)) - 1]',
      'P_wind = 0.5 · ρ · A · v³ · C_p',
      'SoC(t) = SoC(0) - (1 / Q_n) · ∫ I(t) dt'
    ]
  },
  {
    id: 'high-voltage',
    code: 'EEE 801',
    title: 'High Voltage Engineering & Insulation',
    description: 'Breakdown phenomena in gaseous, liquid, and solid dielectrics, Marx impulse voltage generator circuits, and high-voltage testing standards.',
    courseId: 'course_hve_801',
    topics: [
      'Townsend & Streamer Breakdown Mechanisms in Gases (Paschen’s Law)',
      'Dielectric Breakdown in Liquid Insulants & Solid Dielectric Aging',
      'Generation of High AC, DC, and Multi-Stage Marx Impulse Voltages',
      'High-Voltage Measurement: Sphere Gaps, Capacitive Dividers, Peak Voltmeters',
      'Non-Destructive Testing: Loss Angle (tan δ) & Partial Discharge (PD) Detection',
      'Insulation Coordination & Surge Arrester (MOV) Application'
    ],
    coreConcepts: ['Paschen Minimum', 'Standard Lightning Impulse Wave (1.2/50 µs)', 'Loss Factor tan(δ)'],
    recommendedFormulas: [
      'V_b = f(p · d)',
      'V_impulse_peak = n · V_dc · η',
      'tan(δ) = 1 / (ω · R_p · C_p)',
      'E = V / [r · ln(R / r)]'
    ]
  },
  {
    id: 'electrical-protection',
    code: 'EEE 901',
    title: 'Electrical Protection & Switchgear',
    description: 'Principles of protective relaying, Inverse Definite Minimum Time (IDMT) overcurrent protection, percentage differential relaying, and distance protection.',
    courseId: 'course_prot_901',
    topics: [
      'Protection Philosophy: Selectivity, Sensitivity, Speed, and Reliability',
      'Instrument Transformers (CT & PT) Saturation & Knee-Point Voltage',
      'Overcurrent & Earth Fault Protection: IDMT Relays & Plug Setting Multiplier (PSM)',
      'Percentage Differential Protection for Transformers and Alternators',
      'Distance Protection for Transmission Lines (Impedance, Reactance, Mho Relays)',
      'Circuit Breaker Arc Extinction & Re-striking Voltage Transients'
    ],
    coreConcepts: ['Plug Setting Multiplier (PSM)', 'Time Multiplier Setting (TMS)', 'Dual-Slope Biased Differential Relay'],
    recommendedFormulas: [
      'PSM = I_fault / (CT_primary · Plug_Setting)',
      't_op = TMS · [0.14 / (PSM^0.02 - 1)]',
      'I_diff = |I_1 - I_2| > k · |I_1 + I_2| / 2'
    ]
  },
  {
    id: 'electric-vehicles',
    code: 'EEE 1001',
    title: 'Electric Vehicles & Powertrain Electrification',
    description: 'Vehicle tractive dynamics, electric motor selection (PMSM and Induction), bidirectional DC-DC battery converters, regenerative braking, and BMS architectures.',
    courseId: 'course_ev_1001',
    topics: [
      'Vehicle Dynamics: Rolling Resistance, Aerodynamic Drag, and Grading Resistance',
      'Traction Motors: PMSM vs Induction Motors vs Switched Reluctance Motors',
      'Bidirectional DC-DC Converters for Battery Interface & Regenerative Braking',
      'Battery Chemistry (Li-ion NMC, LFP, Solid-State) & Battery Management Systems (BMS)',
      'EV Charging Topologies: AC Level 1/2, DC Fast Charging, and CCS/CHAdeMO Protocols',
      'Thermal Management and High-Voltage Safety Systems in EVs'
    ],
    coreConcepts: ['Total Tractive Effort (F_tr = F_rr + F_ad + F_hc + F_la)', 'State of Charge (SoC) & State of Health (SoH)', 'Regenerative Braking Efficiency'],
    recommendedFormulas: [
      'F_tr = μ_rr · M · g + 0.5 · ρ · C_d · A_f · v² + M · g · sin(α) + M · a',
      'P_wheel = F_tr · v',
      'E_regen = 0.5 · M · (v_initial² - v_final²) · η_regen'
    ]
  }
];
