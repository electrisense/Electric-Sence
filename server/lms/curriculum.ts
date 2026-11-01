export interface SeedQuestion {
  question: string;
  options: string[];
  correct_answer: number;
  explanation: string;
}

export interface SeedLessonItem {
  id: string;
  title: string;
  description: string;
  content: string;
  lesson_order: number;
  duration_mins: number;
  key_takeaways: string[];
  practice_problem: string;
}

export interface SeedCourseItem {
  id: string;
  code: string;
  title: string;
  subject: string;
  description: string;
  level: 'Introductory' | 'Intermediate' | 'Advanced';
  duration_weeks: number;
  instructor: string;
  thumbnail_icon: string;
  lessons: SeedLessonItem[];
  quiz: {
    id: string;
    title: string;
    passing_score: number;
    questions: SeedQuestion[];
  };
}

export const ALL_10_COURSES: SeedCourseItem[] = [
  // 1. Electrical Circuits
  {
    id: 'course_circuits_101',
    code: 'EEE 101',
    title: 'Electric Circuit Analysis & Network Theorems',
    subject: 'Electrical Circuits',
    description: 'Fundamental circuit laws, nodal/mesh formulation, Thévenin and Norton equivalents, maximum power transfer, and AC resonant networks.',
    level: 'Introductory',
    duration_weeks: 4,
    instructor: 'Dr. R. Ramanathan, Circuit Theory Group',
    thumbnail_icon: 'Zap',
    lessons: [
      {
        id: 'les_circ_01',
        title: 'Kirchhoff’s Laws and Systematic Nodal & Mesh Formulations',
        description: 'Conservation principles in lumped parameter networks and matrix node-voltage solutions.',
        lesson_order: 1,
        duration_mins: 25,
        content: `### Kirchhoff's Circuit Laws
In lumped parameter circuit theory, network analysis is governed by two fundamental conservation laws:

1. **Kirchhoff's Current Law (KCL):**
The algebraic sum of currents entering any electrical node is zero:
$$\\sum I_{\\text{entering}} = \\sum I_{\\text{leaving}}$$
This represents the conservation of electric charge ($dq/dt = 0$).

2. **Kirchhoff's Voltage Law (KVL):**
The directed sum of electrical potential differences (voltages) around any closed loop is zero:
$$\\sum V_{\\text{drops}} = \\sum V_{\\text{rises}}$$
This represents the conservation of energy in electrostatic fields.

#### Matrix Nodal Formulation
For an $N$-node network with reference ground, we define $(N-1)$ independent nodal voltages $[V]$:
$$[G][V] = [I_s]$$
Where $[G]$ is the node admittance matrix:
* Diagonal terms $G_{kk} = \\sum$ conductances connected directly to node $k$.
* Off-diagonal terms $G_{jk} = -\\sum$ conductances connected between node $j$ and node $k$.
* $[I_s]$ is the vector of net independent current source injections into each node.`,
        key_takeaways: [
          'KCL expresses charge conservation at nodes; KVL expresses energy conservation around loops.',
          'Node admittance matrix $[G]$ is symmetric for reciprocal networks.',
          'Supernode technique is used when an ideal voltage source is connected between two ungrounded nodes.'
        ],
        practice_problem: 'In a circuit with three essential nodes, Node 1 has a 4A source injected, connected to Node 2 via a 2Ω resistor, and to ground via a 4Ω resistor. Node 2 connects to ground via an 8Ω resistor. Compute the voltage at Node 1 and Node 2 using matrix nodal analysis.'
      },
      {
        id: 'les_circ_02',
        title: 'Thévenin, Norton & Maximum Power Transfer Theorems',
        description: 'Two-terminal linear equivalent models and impedance matching for maximum active power delivery.',
        lesson_order: 2,
        duration_mins: 30,
        content: `### Thévenin's Equivalent Circuit
Any linear, two-terminal bilateral resistive and source network can be replaced at terminals A-B by:
* An open-circuit voltage source $V_{\\text{th}} = V_{oc}$.
* An equivalent internal resistance $R_{\\text{th}}$ seen looking into terminals A-B with all independent sources turned off (voltage sources shorted, current sources opened).

### Norton's Theorem
The dual Norton circuit consists of:
* A short-circuit current source $I_N = I_{sc}$.
* A parallel resistance $R_N = R_{\\text{th}}$.
* Source conversion relationship: $V_{\\text{th}} = I_N \\cdot R_{\\text{th}}$.

### Maximum Power Transfer Theorem
In DC networks, maximum power is delivered to a load resistor $R_L$ when:
$$R_L = R_{\\text{th}}$$
The maximum power absorbed by the load is:
$$P_{\\text{max}} = \\frac{V_{\\text{th}}^2}{4 R_{\\text{th}}}$$
Under maximum power transfer condition, efficiency is exactly 50%. In AC networks with source impedance $Z_{\\text{th}} = R_{\\text{th}} + jX_{\\text{th}}$, the load impedance must be the complex conjugate:
$$Z_L = Z_{\\text{th}}^* = R_{\\text{th}} - jX_{\\text{th}}$$`,
        key_takeaways: [
          'Thévenin: series $V_{th}$ and $R_{th}$; Norton: parallel $I_N$ and $R_N$.',
          'Maximum power transfer requires $R_L = R_{th}$ (DC) or $Z_L = Z_{th}^*$ (AC).',
          'Theoretical efficiency at maximum power transfer is exactly 50%.'
        ],
        practice_problem: 'An audio amplifier has $V_{\\text{th}} = 20\\,\\text{V RMS}$ with output impedance $Z_{\\text{th}} = 4 + j3\\,\\Omega$. What complex load impedance $Z_L$ extracts maximum average power, and how many Watts are delivered?'
      }
    ],
    quiz: {
      id: 'quiz_circuits_101',
      title: 'Circuit Analysis Mastery Exam',
      passing_score: 75,
      questions: [
        {
          question: 'What is the condition for maximum power transfer from an AC source with impedance Z_th = 5 + j8 Ω to a complex load Z_L?',
          options: ['Z_L = 5 + j8 Ω', 'Z_L = 5 - j8 Ω', 'Z_L = 8 + j5 Ω', 'Z_L = 5 Ω'],
          correct_answer: 1,
          explanation: 'In AC circuits, maximum power transfer occurs when the load impedance is the complex conjugate of the source Thévenin impedance: Z_L = Z_th* = 5 - j8 Ω.'
        },
        {
          question: 'When determining Thévenin resistance R_th with dependent sources present, what procedure must be followed?',
          options: [
            'Short all dependent sources and open independent sources',
            'Leave independent sources on and short the load terminals',
            'Turn off all independent sources and apply a 1V test source at load terminals',
            'Replace dependent sources with open circuits'
          ],
          correct_answer: 2,
          explanation: 'Dependent sources cannot be deactivated; one deactivates independent sources, connects a 1V or 1A test source at terminals, and finds R_th = V_test / I_test.'
        }
      ]
    }
  },

  // 2. Electrical Machines
  {
    id: 'course_machines_201',
    code: 'EEE 201',
    title: 'Electrical Machines & Electromechanical Energy Conversion',
    subject: 'Electrical Machines',
    description: 'Operating principles, equivalent circuit models, phasor diagrams, and characteristics of transformers, induction motors, synchronous generators, and DC machines.',
    level: 'Intermediate',
    duration_weeks: 6,
    instructor: 'Prof. M. K. Swaminathan, Machine Drives Lab',
    thumbnail_icon: 'Layers',
    lessons: [
      {
        id: 'les_mach_01',
        title: 'Transformers: Equivalent Circuits, OC/SC Tests, and Voltage Regulation',
        description: 'Magnetic coupling, copper and core loss separation, and loading regulation.',
        lesson_order: 1,
        duration_mins: 30,
        content: `### Principle of Operation
A transformer operates on the principle of **Faraday’s Law of Electromagnetic Induction** and mutual induction:
$$E = 4.44 \\cdot f \\cdot N \\cdot \\Phi_{\\text{max}}$$

### Complete Equivalent Circuit
Referred to primary ($a = N_1/N_2$):
* $R_{\\text{eq1}} = R_1 + a^2 R_2$: Total series winding resistance.
* $X_{\\text{eq1}} = X_1 + a^2 X_2$: Total series leakage reactance.
* $R_c = V_1^2 / P_{\\text{core}}$: Shunt core-loss resistance (hysteresis + eddy current).
* $X_m = V_1 / I_m$: Magnetizing reactance required to establish core flux.

### Transformer Testing
1. **Open-Circuit (OC) Test:** Rated voltage on LV side, HV open. Measures core loss ($P_{\\text{core}}$) and yields shunt branch parameters ($R_c, X_m$).
2. **Short-Circuit (SC) Test:** Rated current on HV side, LV shorted. Measures full-load copper loss ($P_{\\text{cu}}$) and yields series parameters ($R_{\\text{eq}}, X_{\\text{eq}}$).

### Voltage Regulation
$$\\%\\text{VR} = \\frac{I_2 (R_{\\text{eq2}} \\cos\\phi_2 \\pm X_{\\text{eq2}} \\sin\\phi_2)}{V_{2,\\text{rated}}} \\times 100\\%$$
Use $+$ for lagging (inductive) loads and $-$ for leading (capacitive) loads.`,
        key_takeaways: [
          'OC test measures no-load iron losses; SC test measures full-load copper losses.',
          'Zero voltage regulation occurs at leading power factor: $\\tan\\phi = -R_{\\text{eq}}/X_{\\text{eq}}$.',
          'Maximum transformer efficiency occurs when variable copper loss equals constant iron loss ($P_{\\text{cu}} = P_{\\text{iron}}$).'
        ],
        practice_problem: 'A 25 kVA, 2200/220 V, 50 Hz transformer has $R_1 = 1.5\\,\\Omega$, $X_1 = 3.5\\,\\Omega$, $R_2 = 0.015\\,\\Omega$, and $X_2 = 0.035\\,\\Omega$. Determine total series impedance referred to primary and voltage regulation at full load, 0.8 lagging power factor.'
      },
      {
        id: 'les_mach_02',
        title: '3-Phase Induction Motor: Slip-Torque Characteristics & Breakdown Torque',
        description: 'Rotating magnetic field, rotor slip dynamics, and maximum torque derivation.',
        lesson_order: 2,
        duration_mins: 35,
        content: `### Rotating Magnetic Field (RMF)
Balanced 3-phase currents in 3-phase space-displaced stator windings produce a rotating field of constant amplitude $1.5 \\Phi_{\\text{max}}$ at synchronous speed:
$$N_s = \\frac{120 \\cdot f}{P}\\,\\text{RPM}$$

### Rotor Slip & Frequency
$$s = \\frac{N_s - N_r}{N_s}$$
The frequency of induced currents in the rotor is the slip frequency:
$$f_r = s \\cdot f$$

### Electromagnetic Torque Equation
$$T_e = \\frac{3}{\\omega_s} \\cdot \\frac{V_{\\text{th}}^2 \\cdot (R_2'/s)}{(R_{\\text{th}} + R_2'/s)^2 + (X_{\\text{th}} + X_2')^2}$$

#### Breakdown (Maximum) Torque:
$$s_{\\text{max}} = \\frac{R_2'}{\\sqrt{R_{\\text{th}}^2 + (X_{\\text{th}} + X_2')^2}} \\approx \\frac{R_2'}{X_{\\text{eq}}}$$
$$T_{\\text{max}} \\approx \\frac{3}{2\\omega_s} \\cdot \\frac{V_{\\text{th}}^2}{R_{\\text{th}} + \\sqrt{R_{\\text{th}}^2 + X_{\\text{eq}}^2}}$$
**Fundamental Rule:** Breakdown torque magnitude is independent of rotor resistance $R_2'$, but the slip at which peak torque occurs is directly proportional to $R_2'$.`,
        key_takeaways: [
          'RMF rotates at $N_s = 120f/P$; rotor chases the RMF at speed $N_r = (1-s)N_s$.',
          'Breakdown torque is independent of rotor resistance.',
          'Inserting external rotor resistance in wound rotor motors increases starting torque up to breakdown torque.'
        ],
        practice_problem: 'A 6-pole, 50 Hz, 3-phase induction motor has a standstill rotor impedance of $0.04 + j0.2\\,\\Omega$ per phase. Calculate: (1) Slip at maximum torque, (2) Speed at maximum torque, and (3) Additional rotor resistance required to achieve maximum torque at startup ($s=1$).'
      }
    ],
    quiz: {
      id: 'quiz_machines_201',
      title: 'Electrical Machines Diagnostic Assessment',
      passing_score: 75,
      questions: [
        {
          question: 'What is the effect of inserting external resistance into the rotor circuit of a wound-rotor 3-phase induction motor?',
          options: [
            'Maximum torque increases proportionally',
            'Maximum torque decreases',
            'Maximum torque remains unchanged, but occurs at higher slip',
            'Synchronous speed increases'
          ],
          correct_answer: 2,
          explanation: 'Maximum breakdown torque is independent of rotor resistance, but the slip at which maximum torque occurs is directly proportional to rotor resistance (s_max ≈ R2 / Xeq).'
        },
        {
          question: 'At what condition does a power transformer operate at its highest possible efficiency?',
          options: [
            'When load power factor is zero',
            'When variable copper losses equal constant iron/core losses',
            'At 100% full load regardless of losses',
            'When secondary leakage reactance is zero'
          ],
          correct_answer: 1,
          explanation: 'Differentiating the efficiency formula with respect to load current shows maximum efficiency occurs when variable I^2*R copper losses equal constant core losses (P_cu = P_iron).'
        }
      ]
    }
  },

  // 3. Power Systems
  {
    id: 'course_power_301',
    code: 'EEE 301',
    title: 'Power Systems Analysis & Grid Stability',
    subject: 'Power Systems',
    description: 'Transmission line modeling, generalized ABCD parameters, per-unit conversion, symmetrical fault calculations, and swing equation stability.',
    level: 'Advanced',
    duration_weeks: 6,
    instructor: 'Dr. V. K. Mehta, Grid Systems Group',
    thumbnail_icon: 'Activity',
    lessons: [
      {
        id: 'les_pwr_01',
        title: 'Transmission Line ABCD Parameters & The Ferranti Effect',
        description: 'Two-port representation of medium and long lines and reactive charging phenomena.',
        lesson_order: 1,
        duration_mins: 30,
        content: `### Two-Port Transmission Formulation
$$\\begin{bmatrix} V_S \\\\ I_S \\end{bmatrix} = \\begin{bmatrix} A & B \\\\ C & D \\end{bmatrix} \\begin{bmatrix} V_R \\\\ I_R \\end{bmatrix}$$
Where $AD - BC = 1$ for reciprocal networks, and $A = D$ for symmetrical lines.

#### Nominal-$\\pi$ Network Parameters:
* $A = D = 1 + \\frac{ZY}{2}$
* $B = Z$
* $C = Y\\left(1 + \\frac{ZY}{4}\\right)$

### The Ferranti Effect
On long transmission lines under no-load or light-load conditions ($I_R \\approx 0$):
$$V_R = \\frac{V_S}{A}$$
Since $|A| < 1$ due to charging capacitance $Y$, the receiving-end voltage exceeds the sending-end voltage ($V_R > V_S$). Shunt reactors are installed at substations to absorb reactive power and clamp overvoltages.`,
        key_takeaways: [
          'Transmission matrix satisfies reciprocity $AD - BC = 1$ and symmetry $A = D$.',
          'Ferranti effect causes receiving end voltage rise on lightly loaded long lines.',
          'Shunt reactors mitigate Ferranti overvoltages.'
        ],
        practice_problem: 'A 3-phase, 220 kV, 50 Hz, 200 km transmission line has $Z = 20 + j80\\,\\Omega$ and $Y = j0.0012\\,\\text{S}$. Determine parameter $A$ and calculate receiving-end open-circuit voltage when $V_S = 220\\,\\text{kV}$ line-to-line.'
      }
    ],
    quiz: {
      id: 'quiz_power_301',
      title: 'Power Systems Assessment',
      passing_score: 75,
      questions: [
        {
          question: 'What is the primary physical cause of the Ferranti effect on high-voltage transmission lines?',
          options: [
            'Corona discharge on line conductors',
            'Line charging capacitive current flowing through series line inductance',
            'Harmonic resonance from non-linear loads',
            'Skin effect in stranded conductors'
          ],
          correct_answer: 1,
          explanation: 'The Ferranti effect is caused by capacitive charging current passing through series inductive reactance, producing a voltage rise toward the receiving end.'
        }
      ]
    }
  },

  // 4. Power Electronics
  {
    id: 'course_pe_401',
    code: 'EEE 401',
    title: 'Power Electronics & Switch-Mode Converters',
    subject: 'Power Electronics',
    description: 'Semiconductor switches, DC-DC buck, boost, and buck-boost converters, and sinusoidal PWM voltage source inverters.',
    level: 'Intermediate',
    duration_weeks: 5,
    instructor: 'Dr. S. K. Bhattacharya, Power Electronics Lab',
    thumbnail_icon: 'Cpu',
    lessons: [
      {
        id: 'les_pe_01',
        title: 'DC-DC Switch-Mode Converters: Buck and Boost Topologies',
        description: 'Inductor volt-second balance, capacitor charge balance, and continuous conduction ripple.',
        lesson_order: 1,
        duration_mins: 30,
        content: `### Inductor Volt-Second Balance
In periodic steady state, the average voltage across an ideal inductor over one switching period $T_s$ is zero:
$$\\int_0^{T_s} v_L(t)\\,dt = 0$$

### Buck Converter (Step-Down)
* Output Voltage: $V_o = D \\cdot V_{\\text{in}}$ (Duty cycle $0 \\le D \\le 1$)
* Inductor Ripple Current: $\\Delta I_L = \\frac{(V_{\\text{in}} - V_o) D}{f_s L}$
* Critical Inductance for CCM: $L_{\\text{crit}} = \\frac{(1 - D) R}{2 f_s}$

### Boost Converter (Step-Up)
* Output Voltage: $V_o = \\frac{V_{\\text{in}}}{1 - D}$
* Inductor Ripple Current: $\\Delta I_L = \\frac{V_{\\text{in}} D}{f_s L}$
* Output Capacitor Voltage Ripple: $\\Delta V_o = \\frac{I_o D}{f_s C}$`,
        key_takeaways: [
          'Buck converter steps down voltage: $V_o = D V_{in}$.',
          'Boost converter steps up voltage: $V_o = V_{in} / (1-D)$.',
          'CCM requires inductor current to remain strictly positive throughout the switching cycle.'
        ],
        practice_problem: 'Design a Buck converter operating at $f_s = 50\\,\\text{kHz}$ with $V_{\\text{in}} = 24\\,\\text{V}$ and $V_o = 12\\,\\text{V}$ delivering 2A to a resistive load. Determine the duty cycle $D$ and minimum inductance $L$ for maximum 10% inductor current ripple.'
      }
    ],
    quiz: {
      id: 'quiz_pe_401',
      title: 'Power Electronics Evaluation',
      passing_score: 75,
      questions: [
        {
          question: 'In an ideal Boost DC-DC converter with duty cycle D = 0.6 and input voltage 20V, what is the theoretical output voltage?',
          options: ['12 V', '33.3 V', '50 V', '60 V'],
          correct_answer: 2,
          explanation: 'V_o = V_in / (1 - D) = 20 / (1 - 0.6) = 20 / 0.4 = 50 V.'
        }
      ]
    }
  },

  // 5. Control Systems
  {
    id: 'course_cs_501',
    code: 'EEE 501',
    title: 'Control Systems Engineering & State-Space Design',
    subject: 'Control Systems',
    description: 'Transfer functions, block diagram algebra, Routh-Hurwitz stability criterion, Bode plots, and PID controller tuning.',
    level: 'Intermediate',
    duration_weeks: 5,
    instructor: 'Prof. K. Ogata, Control Systems Division',
    thumbnail_icon: 'Compass',
    lessons: [
      {
        id: 'les_cs_01',
        title: 'Feedback Stability, Routh-Hurwitz & Root Locus Techniques',
        description: 'Characteristic equation roots, stability margins, and root locus trajectories.',
        lesson_order: 1,
        duration_mins: 30,
        content: `### Closed-Loop Transfer Function
For a negative feedback system with forward path $G(s)$ and feedback path $H(s)$:
$$T(s) = \\frac{Y(s)}{R(s)} = \\frac{G(s)}{1 + G(s)H(s)}$$
The roots of the characteristic equation $1 + G(s)H(s) = 0$ dictate system stability.

### Routh-Hurwitz Stability Criterion
A system is strictly BIBO stable if and only if all poles have negative real parts (located in open left half $s$-plane). The Routh array checks for sign changes in the first column, where the number of sign changes equals the number of right-half plane poles.

### Frequency Response Margins
* **Gain Margin (GM):** Margin by which loop gain can be increased before instability ($|G(j\\omega_{pc})| = 1$).
* **Phase Margin (PM):** $PM = 180^\\circ + \\angle G(j\\omega_{gc})$ (where $\\omega_{gc}$ is gain crossover frequency). Stable systems have $PM > 0$.`,
        key_takeaways: [
          'Stability requires all closed-loop poles to reside strictly in the Left Half s-Plane.',
          'Sign changes in Routh first column indicate unstable right-half plane roots.',
          'Phase margin should typically be $45^\\circ$ to $60^\\circ$ for well-damped transient response.'
        ],
        practice_problem: 'Given open-loop transfer function $G(s)H(s) = \\frac{K}{s(s+2)(s+4)}$, use Routh-Hurwitz criterion to determine the range of gain $K > 0$ for which the closed-loop system is stable.'
      }
    ],
    quiz: {
      id: 'quiz_cs_501',
      title: 'Control Systems Examination',
      passing_score: 75,
      questions: [
        {
          question: 'What does a sign change in the first column of the Routh array indicate?',
          options: [
            'A root located at the origin',
            'A root located in the right half of the s-plane (unstable pole)',
            'A repeated real root',
            'A pair of complex conjugate poles on the imaginary axis'
          ],
          correct_answer: 1,
          explanation: 'By Routh-Hurwitz theorem, the number of sign changes in the first column equals the number of roots lying in the right-half s-plane.'
        }
      ]
    }
  },

  // 6. Electrical Measurements
  {
    id: 'course_em_601',
    code: 'EEE 601',
    title: 'Electrical Measurements & Transducers',
    subject: 'Electrical Measurements',
    description: 'PMMC and MI instruments, AC bridge networks (Maxwell, Schering, Wien), instrument transformers (CT/PT), and digital measurement systems.',
    level: 'Introductory',
    duration_weeks: 4,
    instructor: 'Dr. A. K. Sawhney, Instrumentation Lab',
    thumbnail_icon: 'Sliders',
    lessons: [
      {
        id: 'les_em_01',
        title: 'Analog Meter Principles & AC Bridges (Maxwell & Schering)',
        description: 'D’Arsonval PMMC galvanometer extensions and AC impedance bridge null balances.',
        lesson_order: 1,
        duration_mins: 25,
        content: `### Moving Iron (MI) vs. PMMC Instruments
* **PMMC (Permanent Magnet Moving Coil):** Deflection torque $T_d = B \\cdot I \\cdot N \\cdot A$. Linear scale, measures DC average value only.
* **Moving Iron (MI):** Deflection torque $T_d = \\frac{1}{2} I^2 \\frac{dL}{d\\theta}$. Non-linear square-law scale, measures true RMS value on both AC and DC.

### AC Bridge Null Balance Equation
At bridge balance, the detector current is zero:
$$Z_1 Z_4 = Z_2 Z_3$$
Equating magnitudes and phase angles (or real and imaginary components) yields two independent balance equations.
* **Maxwell’s Inductance-Capacitance Bridge:** Measures medium-$Q$ coils ($1 < Q < 10$).
* **Schering Bridge:** Measures dielectric capacitance and dissipation factor ($\tan\\delta$) of high-voltage insulators.`,
        key_takeaways: [
          'PMMC responds to average DC; Moving Iron responds to true RMS on AC and DC.',
          'AC bridge balance condition: $Z_1 Z_4 = Z_2 Z_3$ yields two simultaneous equations for resistance and reactance.',
          'Schering bridge is standard for measuring dielectric loss angle $\\tan\\delta$.'
        ],
        practice_problem: 'A Maxwell bridge has $R_2 = 1000\\,\\Omega$, $R_3 = 500\\,\\Omega$, $C_4 = 0.5\\,\\mu\\text{F}$, and $R_4 = 2000\\,\\Omega$. Calculate the unknown inductance $L_1$ and internal coil resistance $R_1$.'
      }
    ],
    quiz: {
      id: 'quiz_em_601',
      title: 'Measurements & Instrumentation Quiz',
      passing_score: 75,
      questions: [
        {
          question: 'Why can a Moving Iron (MI) instrument measure both alternating and direct current?',
          options: [
            'Because it has a permanent magnet',
            'Because the deflecting torque is proportional to the square of current (T_d ∝ I^2)',
            'Because it uses eddy current damping',
            'Because it incorporates a diode bridge'
          ],
          correct_answer: 1,
          explanation: 'The deflecting torque in MI instruments depends on current squared (I^2), so the torque direction is unidirectional regardless of instantaneous current polarity, measuring true RMS.'
        }
      ]
    }
  },

  // 7. Renewable Energy
  {
    id: 'course_re_701',
    code: 'EEE 701',
    title: 'Renewable Energy Systems & Grid Integration',
    subject: 'Renewable Energy',
    description: 'Solar photovoltaic I-V modeling, Maximum Power Point Tracking (MPPT) algorithms, wind turbine aerodynamics with DFIG, and battery energy storage systems.',
    level: 'Intermediate',
    duration_weeks: 5,
    instructor: 'Dr. G. D. Rai, Renewable Power Institute',
    thumbnail_icon: 'Sun',
    lessons: [
      {
        id: 'les_re_01',
        title: 'Solar PV Characteristics & MPPT Algorithms (P&O and InCond)',
        description: 'Single-diode PV cell equations, irradiance effects, and maximum power extraction.',
        lesson_order: 1,
        duration_mins: 30,
        content: `### Photovoltaic Cell Electrical Model
The single-diode model expresses cell terminal current $I$:
$$I = I_{ph} - I_0 \\left[ \\exp\\left(\\frac{q(V + I R_s)}{A k T}\\right) - 1 \\right] - \\frac{V + I R_s}{R_{sh}}$$
Where $I_{ph}$ is light-generated photocurrent proportional to solar irradiance ($G$), $I_0$ is diode reverse saturation current, and $R_s, R_{sh}$ are series and shunt parasitic resistances.

### Maximum Power Point Tracking (MPPT)
Because PV arrays exhibit a non-linear $P-V$ characteristic with a single maximum power point ($dP/dV = 0$):
1. **Perturb & Observe (P&O):** Perturbs operating voltage $V$; if $dP > 0$, perturb in same direction; if $dP < 0$, reverse perturbation direction.
2. **Incremental Conductance (InCond):** Uses $dP/dV = I + V(dI/dV) = 0$:
   * $\\frac{dI}{dV} = -\\frac{I}{V}$ at MPP.
   * $\\frac{dI}{dV} > -\\frac{I}{V}$ to the left of MPP.
   * $\\frac{dI}{dV} < -\\frac{I}{V}$ to the right of MPP.`,
        key_takeaways: [
          'PV cells produce nonlinear I-V curves governed by irradiance ($G$) and temperature ($T$).',
          'Incremental Conductance tracks MPP by satisfying $dI/dV = -I/V$.',
          'MPPT controllers dynamically adjust the duty cycle $D$ of an interfacing DC-DC converter.'
        ],
        practice_problem: 'A solar module has open-circuit voltage $V_{oc} = 37\\,\\text{V}$, short-circuit current $I_{sc} = 8.5\\,\\text{A}$, and maximum power point values $V_{mpp} = 30\\,\\text{V}$ and $I_{mpp} = 8.0\\,\\text{A}$. Compute the fill factor (FF) of the module.'
      }
    ],
    quiz: {
      id: 'quiz_re_701',
      title: 'Renewable Energy Systems Assessment',
      passing_score: 75,
      questions: [
        {
          question: 'What mathematical condition identifies the Maximum Power Point (MPP) in the Incremental Conductance algorithm?',
          options: ['dI/dV = 0', 'dI/dV = -I/V', 'dI/dV = +I/V', 'dI/dV = -V/I'],
          correct_answer: 1,
          explanation: 'At MPP, dP/dV = d(V*I)/dV = I + V*(dI/dV) = 0. Rearranging gives dI/dV = -I/V.'
        }
      ]
    }
  },

  // 8. High Voltage Engineering
  {
    id: 'course_hve_801',
    code: 'EEE 801',
    title: 'High Voltage Engineering & Insulation Diagnostics',
    subject: 'High Voltage Engineering',
    description: 'Townsend and streamer breakdown mechanisms, impulse voltage generator circuits (Marx generator), and partial discharge diagnostics.',
    level: 'Advanced',
    duration_weeks: 5,
    instructor: 'Prof. M. S. Naidu, High Voltage Lab',
    thumbnail_icon: 'ZapOff',
    lessons: [
      {
        id: 'les_hve_01',
        title: 'Gaseous Breakdown Mechanisms & Lightning Impulse Testing',
        description: 'Townsend ionization coefficients, Paschen’s Law, and Marx impulse multipliers.',
        lesson_order: 1,
        duration_mins: 30,
        content: `### Townsend’s Breakdown Criterion
In uniform electrostatic field gap $d$, the primary ionization coefficient $\\alpha$ (electrons produced per unit distance) and secondary coefficient $\\gamma$ govern breakdown:
$$I = I_0 \\frac{e^{\\alpha d}}{1 - \\gamma (e^{\\alpha d} - 1)}$$
Townsend breakdown criterion:
$$\\gamma (e^{\\alpha d} - 1) = 1 \\implies \\gamma e^{\\alpha d} \\approx 1$$

### Paschen’s Law
Breakdown voltage $V_b$ of a uniform gas gap is a function of the product of gas pressure $p$ and gap distance $d$:
$$V_b = f(p \\cdot d)$$
Every gas exhibits a characteristic minimum breakdown voltage (Paschen minimum) below which no spark can form regardless of distance.

### Marx Impulse Voltage Generator
Generates high-voltage lightning impulses ($1.2/50\\,\\mu\\text{s}$ wave shape) by charging $n$ capacitors in parallel at voltage $V_0$ and discharging them in series via spark gaps to yield peak voltage $V_{\\text{peak}} \\approx n \\cdot V_0$.`,
        key_takeaways: [
          'Townsend mechanism dominates at low $p \\cdot d$; Streamer mechanism dominates at high $p \\cdot d$ with space charge.',
          'Paschen’s law: $V_b = f(p \\cdot d)$ has a distinct minimum breakdown voltage.',
          'Standard lightning impulse wave: front time $T_1 = 1.2\\,\\mu\\text{s} \\pm 30\\%$, tail time $T_2 = 50\\,\\mu\\text{s} \\pm 20\\%$.'
        ],
        practice_problem: 'An 8-stage Marx generator has stage capacitance $C = 0.12\\,\\mu\\text{F}$ charged to $100\\,\\text{kV}$ per stage. Calculate: (1) Total nominal impulse output voltage, and (2) Total stored energy in Joules.'
      }
    ],
    quiz: {
      id: 'quiz_hve_801',
      title: 'High Voltage Engineering Quiz',
      passing_score: 75,
      questions: [
        {
          question: 'According to international standards (IEC 60060), what are the front and tail times of a standard lightning impulse voltage wave?',
          options: ['1.2 / 50 μs', '250 / 2500 μs', '8 / 20 μs', '10 / 350 μs'],
          correct_answer: 0,
          explanation: 'A standard lightning impulse wave has a front time of 1.2 μs and a time to half-value on tail of 50 μs (1.2/50 μs).'
        }
      ]
    }
  },

  // 9. Electrical Protection
  {
    id: 'course_prot_901',
    code: 'EEE 901',
    title: 'Electrical Protection & Switchgear Systems',
    subject: 'Electrical Protection',
    description: 'Protection philosophy, instrument transformers, IDMT overcurrent relays, differential protection for transformers, and distance relays.',
    level: 'Advanced',
    duration_weeks: 5,
    instructor: 'Dr. Y. G. Paithankar, Protective Relaying Group',
    thumbnail_icon: 'Shield',
    lessons: [
      {
        id: 'les_prot_01',
        title: 'Differential Protection & Percentage Biased Relaying',
        description: 'Kirchhoff zone protection, magnetizing inrush blocking, and CT saturation restraint.',
        lesson_order: 1,
        duration_mins: 30,
        content: `### Principle of Merz-Price Differential Protection
Differential protection establishes a protected zone bounded by Current Transformers (CTs). Under healthy conditions or external through-faults, current entering equals current leaving ($I_1 - I_2 = 0$). For an internal fault within the zone, the spill current operates the relay:
$$I_{\\text{operating}} = |I_1 - I_2| > I_{\\text{pickup}}$$

### Percentage Biased (Restrained) Differential Relay
To prevent false tripping caused by CT ratio mismatch, tap changing, or CT saturation during heavy external faults, restraining coils carry through current:
$$I_{\\text{restraint}} = \\frac{|I_1| + |I_2|}{2}$$
Tripping condition requires operating current to exceed a percentage slope of restraining current:
$$|I_1 - I_2| > K \\cdot \\left(\\frac{|I_1| + |I_2|}{2}\\right) + I_0$$

### Magnetizing Inrush Restraint
When a transformer is energized, asymmetric core saturation draws magnetizing inrush currents with high 2nd harmonic content (>20%). Modern numerical relays use 2nd harmonic restraint filters to block tripping during transformer energization.`,
        key_takeaways: [
          'Differential protection provides fast, unit protection strictly within its CT boundaries.',
          'Percentage bias slope prevents false trips due to external through-fault CT saturation.',
          'Second harmonic current filtering blocks false tripping on transformer magnetizing inrush.'
        ],
        practice_problem: 'A 3-phase, 33/11 kV, 20 MVA transformer is protected by biased differential relays. The 33 kV side is star-connected, and the 11 kV side is delta-connected. Specify the CT connections on both sides and determine CT ratios to match 5A secondary rated current.'
      }
    ],
    quiz: {
      id: 'quiz_prot_901',
      title: 'Power System Protection Quiz',
      passing_score: 75,
      questions: [
        {
          question: 'Why do numerical differential relays incorporate second-harmonic restraint when protecting power transformers?',
          options: [
            'To detect line-to-ground faults',
            'To distinguish magnetizing inrush current from internal short-circuit faults',
            'To measure CT saturation angle',
            'To calculate negative sequence components'
          ],
          correct_answer: 1,
          explanation: 'Transformer magnetizing inrush current contains high second-harmonic components (often 20% or more), which second-harmonic restraint relays use to block false tripping during energization.'
        }
      ]
    }
  },

  // 10. Electric Vehicles
  {
    id: 'course_ev_1001',
    code: 'EEE 1001',
    title: 'Electric Vehicles & Powertrain Electrification',
    subject: 'Electric Vehicles',
    description: 'Vehicle dynamics, traction motor selection (PMSM and Induction), bidirectional DC-DC battery converters, regenerative braking, and BMS architectures.',
    level: 'Intermediate',
    duration_weeks: 5,
    instructor: 'Dr. M. Ehsani, EV Powertrain Lab',
    thumbnail_icon: 'BatteryCharging',
    lessons: [
      {
        id: 'les_ev_01',
        title: 'EV Traction Dynamics, Motor Drives & Regenerative Braking',
        description: 'Tractive effort balance, PMSM field-oriented control, and kinetic energy recovery.',
        lesson_order: 1,
        duration_mins: 30,
        content: `### Vehicle Tractive Effort Equation
Total tractive force $F_{te}$ required at vehicle wheels to accelerate and sustain motion:
$$F_{te} = F_{rr} + F_{ad} + F_{hc} + F_{acc}$$
Where:
* **Rolling Resistance:** $F_{rr} = C_{rr} \\cdot M \\cdot g \\cdot \\cos\\alpha$
* **Aerodynamic Drag:** $F_{ad} = \\frac{1}{2} \\rho \\cdot C_d \\cdot A_f \\cdot v^2$
* **Hill Climbing Force:** $F_{hc} = M \\cdot g \\cdot \\sin\\alpha$
* **Linear Acceleration Force:** $F_{acc} = M \\cdot a \\cdot \\delta$ (where $\\delta$ is rotational inertia factor)

### Electric Traction Motors
Permanent Magnet Synchronous Motors (PMSM) and Induction Motors are standard in automotive traction due to:
1. High power density (kW/kg) and peak efficiency (>95%).
2. Extended Constant Power Speed Ratio (CPSR) achieved via field-weakening control at highway cruising speeds.

### Regenerative Braking
During braking, the traction inverter operates as a boost rectifier, transitioning the motor into generator mode. Kinetic energy ($E_k = \\frac{1}{2} M v^2$) is returned to the high-voltage traction battery pack via bidirectional DC-DC converters, extending driving range by 15-20%.`,
        key_takeaways: [
          'Tractive effort balances rolling resistance, aerodynamic drag ($v^2$), grade, and acceleration.',
          'PMSM drives offer peak efficiency and torque density for passenger EVs.',
          'Regenerative braking converts vehicle kinetic energy back into battery electrical energy during deceleration.'
        ],
        practice_problem: 'An electric vehicle of mass $M = 1500\\,\\text{kg}$ has frontal area $A_f = 2.2\\,\\text{m}^2$, drag coefficient $C_d = 0.28$, and rolling coefficient $C_{rr} = 0.012$. Compute the tractive power required in kW to cruise at $108\\,\\text{km/h}$ ($30\\,\\text{m/s}$) on a flat highway (air density $\\rho = 1.225\\,\\text{kg/m}^3$).'
      }
    ],
    quiz: {
      id: 'quiz_ev_1001',
      title: 'Electric Vehicle Powertrain Assessment',
      passing_score: 75,
      questions: [
        {
          question: 'How does aerodynamic drag force scale with vehicle velocity v?',
          options: ['Linearly with velocity (v)', 'With the square of velocity (v^2)', 'With the cube of velocity (v^3)', 'Inversely with velocity (1/v)'],
          correct_answer: 1,
          explanation: 'Aerodynamic drag force is given by F_ad = 0.5 * rho * C_d * A_f * v^2, which scales quadratically with velocity (v^2).'
        }
      ]
    }
  }
];

