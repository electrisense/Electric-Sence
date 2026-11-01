/**
 * Pre-seeded LMS Courses, Lessons, Quizzes, and RAG Knowledge Base for Electric Sence
 */

export interface SeedLesson {
  id: string;
  order_index: number;
  title: string;
  duration_mins: number;
  content: string;
  key_takeaways: string[];
  practice_problem: string;
}

export interface SeedQuizQuestion {
  question: string;
  options: string[];
  correct_index: number;
  explanation: string;
}

export interface SeedCourse {
  id: string;
  code: string;
  title: string;
  category: string;
  description: string;
  level: 'Introductory' | 'Intermediate' | 'Advanced';
  duration_weeks: number;
  instructor: string;
  lessons: SeedLesson[];
  quiz: {
    id: string;
    title: string;
    questions: SeedQuizQuestion[];
  };
}

export interface SeedRagDocument {
  id: string;
  title: string;
  subject: string;
  source_type: 'textbook' | 'syllabus' | 'lab_manual' | 'reference_notes';
  author: string;
  chunks: Array<{
    id: string;
    title: string;
    content: string;
    keywords: string[];
  }>;
}

// ─────────────────────────────────────────────────────────────────────────────
// LMS SEED COURSES
// ─────────────────────────────────────────────────────────────────────────────
export const SEED_COURSES: SeedCourse[] = [
  {
    id: 'course_circuits_101',
    code: 'EEE 101',
    title: 'Circuit Analysis & Network Theorems',
    category: 'Core Theory',
    description: 'Master the fundamental theorems governing direct current and alternating current networks, nodal/mesh analysis, Thévenin and Norton equivalents, and maximum power transfer.',
    level: 'Introductory',
    duration_weeks: 4,
    instructor: 'Dr. R. Ramanathan, Dept. of EEE',
    lessons: [
      {
        id: 'les_circ_01',
        order_index: 1,
        title: "Kirchhoff's Laws & Systematic Nodal/Mesh Analysis",
        duration_mins: 20,
        content: `### Fundamental Laws of Circuit Analysis

Electrical circuit analysis is grounded in two conservation laws formulated by Gustav Kirchhoff:

1. **Kirchhoff's Current Law (KCL):**
The algebraic sum of all currents entering any electrical node is identically zero.
$$\\sum I_{\\text{entering}} = \\sum I_{\\text{leaving}}$$
This represents the conservation of electrical charge.

2. **Kirchhoff's Voltage Law (KVL):**
The algebraic sum of all branch voltages around any closed loop or mesh is zero.
$$\\sum V_{\\text{drops}} = \\sum V_{\\text{rises}}$$
This represents the conservation of energy.

#### Nodal Analysis Method
* Identify all $N$ essential nodes; pick one as the reference (ground, $V_0 = 0\\,\\text{V}$).
* Formulate $(N - 1)$ independent KCL equations using branch admittances: $\\frac{V_a - V_b}{R}$.
* Solve the linear system $[G][V] = [I]$ using Cramer's rule or matrix inversion.

#### Mesh Analysis Method
* Identify all $M$ independent planar meshes.
* Assign clockwise mesh currents $I_1, I_2, \\dots, I_M$.
* Formulate KVL for each mesh in terms of shared resistive branches.`,
        key_takeaways: [
          'KCL is charge conservation; applied at essential nodes.',
          'KVL is energy conservation; applied around closed mesh loops.',
          'Nodal analysis uses $(N-1)$ equations; ideal for circuits with parallel branches and current sources.',
          'Mesh analysis requires planar circuits and utilizes mesh current variables.'
        ],
        practice_problem: 'In a 2-mesh circuit, a 12V DC source is in series with a 4Ω resistor. The branch is in parallel with a 6Ω resistor and an 8Ω load. Calculate the voltage across the 8Ω load using Nodal Analysis.'
      },
      {
        id: 'les_circ_02',
        order_index: 2,
        title: 'Thévenin and Norton Equivalent Circuit Theorems',
        duration_mins: 25,
        content: `### Thévenin’s Theorem
Any linear, bilateral two-terminal resistive network containing voltage sources, current sources, and resistors can be replaced by an equivalent circuit consisting of:
* An independent voltage source $V_{\\text{th}}$ (the open-circuit voltage across terminals A-B).
* A series resistance $R_{\\text{th}}$ (the equivalent input resistance viewed from terminals A-B with all independent sources deactivated).

#### Finding $V_{\\text{th}}$:
1. Disconnect the load resistor $R_L$ between terminals A and B.
2. Calculate the open-circuit voltage $V_{AB} = V_{\\text{th}}$.

#### Finding $R_{\\text{th}}$:
1. Turn off all independent sources (replace independent voltage sources with short circuits; independent current sources with open circuits).
2. Compute the equivalent resistance across terminals A and B.

### Norton’s Theorem
Similarly, the same network can be replaced by:
* An independent Norton current source $I_N$ in parallel with $R_N$.
* $I_N$ is the short-circuit current between terminals A and B ($I_{sc}$).
* $R_N = R_{\\text{th}}$.
* **Source Transformation:** $V_{\\text{th}} = I_N \\cdot R_{\\text{th}}$.`,
        key_takeaways: [
          'Thévenin circuit: series combination of $V_{\\text{th}}$ and $R_{\\text{th}}$.',
          'Norton circuit: parallel combination of $I_N$ and $R_{\\text{th}}$.',
          '$V_{\\text{th}} = I_{\\text{sc}} \\cdot R_{\\text{th}}$ connects both theorems via source transformation.',
          'Crucial tool for analyzing how varying load resistances affect output voltage and current.'
        ],
        practice_problem: 'A circuit has a 24V source in series with 10Ω, in parallel with 40Ω. Determine the Thévenin voltage $V_{th}$ and Thévenin resistance $R_{th}$ seen by a load connected across the 40Ω resistor.'
      },
      {
        id: 'les_circ_03',
        order_index: 3,
        title: 'Maximum Power Transfer Theorem & Superposition',
        duration_mins: 20,
        content: `### Maximum Power Transfer Theorem
In a DC network, a resistive load $R_L$ connected to a linear network will absorb maximum power when its resistance is equal to the Thévenin resistance of the network:
$$R_L = R_{\\text{th}}$$

For AC networks with complex source impedance $Z_{\\text{th}} = R_{\\text{th}} + jX_{\\text{th}}$, maximum power transfer occurs when the load impedance is the complex conjugate:
$$Z_L = Z_{\\text{th}}^* = R_{\\text{th}} - jX_{\\text{th}}$$

The maximum power delivered to the load is:
$$P_{\\text{max}} = \\frac{V_{\\text{th}}^2}{4 R_{\\text{th}}}$$

*Note:* Under maximum power transfer conditions, the theoretical efficiency is exactly **50%**.

### Superposition Principle
In any linear bilateral network having multiple independent sources, the voltage across or current through any element is equal to the algebraic sum of the voltages or currents produced by each independent source acting alone, while all other independent sources are deactivated.`,
        key_takeaways: [
          'For DC circuits, $R_L = R_{\\text{th}}$ maximizes power transfer with 50% efficiency.',
          'For AC circuits, $Z_L = Z_{\\text{th}}^*$ cancels reactive components, leaving pure resistance.',
          'Maximum power formula: $P_{\\text{max}} = V_{\\text{th}}^2 / (4 R_{\\text{th}})$.',
          'Superposition applies strictly to linear responses (voltage and current), NOT directly to power ($P \\propto I^2$).'
        ],
        practice_problem: 'A power amplifier has an output Thévenin equivalent of 16V RMS with $R_{\\text{th}} = 8\\,\\Omega$. What load resistance extracts maximum power, and what is the maximum power absorbed?'
      }
    ],
    quiz: {
      id: 'quiz_circuits_101',
      title: 'Circuit Analysis & Network Theorems Quiz',
      questions: [
        {
          question: 'Under what condition does a DC circuit deliver maximum power to a variable load resistor $R_L$?',
          options: [
            'When $R_L = 0\\,\\Omega$ (short circuit)',
            'When $R_L = R_{\\text{th}}$ (Thévenin resistance)',
            'When $R_L = 2 R_{\\text{th}}$',
            'When $R_L \\rightarrow \\infty$ (open circuit)'
          ],
          correct_index: 1,
          explanation: 'By the Maximum Power Transfer Theorem, the load resistance $R_L$ must equal the Thévenin source resistance $R_{th}$ to receive maximum power ($P_{max} = V_{th}^2 / 4R_{th}$).'
        },
        {
          question: 'When deactivating independent sources to determine Thévenin resistance $R_{\\text{th}}$:',
          options: [
            'Voltage sources are opened; current sources are shorted',
            'Voltage sources are shorted; current sources are opened',
            'All sources are replaced with 1Ω resistors',
            'Dependent sources are turned off'
          ],
          correct_index: 1,
          explanation: 'Independent ideal voltage sources have 0Ω internal impedance (short circuit), whereas ideal current sources have infinite internal impedance (open circuit).'
        },
        {
          question: 'What is the efficiency of a system operating at maximum power transfer condition?',
          options: ['100%', '75%', '50%', '33.3%'],
          correct_index: 2,
          explanation: 'Since $R_L = R_{th}$, half the voltage drops across the source resistance and half across the load, resulting in 50% power lost internally and 50% delivered to the load.'
        },
        {
          question: 'Which of the following is Kirchhoff’s Current Law fundamentally based on?',
          options: [
            'Conservation of Energy',
            'Conservation of Electrical Charge',
            'Conservation of Momentum',
            'Faraday’s Law of Induction'
          ],
          correct_index: 1,
          explanation: 'KCL states that charge cannot accumulate at an idealized infinitesimal node; therefore current entering must equal current leaving, conserving electric charge.'
        }
      ]
    }
  },
  {
    id: 'course_machines_201',
    code: 'EEE 201',
    title: 'Electrical Machines & Transformers',
    category: 'Power Engineering',
    description: 'Comprehensive study of electromechanical energy conversion, single-phase and 3-phase transformers, DC machines, 3-phase induction motors, and synchronous alternators.',
    level: 'Intermediate',
    duration_weeks: 6,
    instructor: 'Prof. M. K. Swaminathan, Machine Drives Lab',
    lessons: [
      {
        id: 'les_mach_01',
        order_index: 1,
        title: 'Single-Phase Transformer Equivalent Circuit & Testing',
        duration_mins: 30,
        content: `### Principle of Operation
A transformer operates on the principle of **Faraday’s Law of Electromagnetic Induction** and mutual induction between two magnetically coupled coils wound on a common laminated ferromagnetic core.

#### EMF Equation:
$$E = 4.44 \\cdot f \\cdot N \\cdot \\Phi_{\\text{max}}$$
Where:
* $f$ = frequency in Hertz
* $N$ = number of turns
* $\\Phi_{\\text{max}}$ = peak magnetic core flux ($B_{\\text{max}} \\cdot A$)

### Practical Equivalent Circuit
A practical transformer accounts for core and copper non-idealities:
* $R_1, R_2'$: Primary and referred secondary winding resistance (copper losses $I^2R$).
* $X_1, X_2'$: Primary and referred secondary leakage reactance (flux that does not link both windings).
* $R_c$: Core-loss resistance representing hysteresis and eddy current losses.
* $X_m$: Magnetizing reactance representing the MMF required to set up core flux.

### Transformer Standard Testing
1. **Open-Circuit (OC) Test:**
   * Conducted at rated voltage on the Low Voltage (LV) side with High Voltage (HV) open.
   * Negligible copper loss; wattmeter reads core losses ($P_{\\text{core}} = P_{oc}$).
   * Determines shunt branch parameters ($R_c, X_m$).
2. **Short-Circuit (SC) Test:**
   * Conducted with LV side short-circuited and reduced voltage applied to HV side to circulate rated current.
   * Negligible core loss; wattmeter reads full-load copper losses ($P_{\\text{cu}} = P_{sc}$).
   * Determines series equivalent parameters ($R_{eq}, X_{eq}$).`,
        key_takeaways: [
          'EMF equation: $E = 4.44 f N \\Phi_m$.',
          'Open-circuit test gives core/iron losses ($P_{hysteresis} + P_{eddy}$) and shunt branch parameters ($R_c, X_m$).',
          'Short-circuit test gives full-load copper loss ($I^2R$) and series leakage impedance ($R_{eq}, X_{eq}$).',
          'Voltage regulation is zero at a leading power factor condition: $\\tan\\phi = -R_{eq}/X_{eq}$.'
        ],
        practice_problem: 'A 50 kVA, 2400/240 V, 50 Hz transformer yielded $P_{oc} = 350\\,\\text{W}$ at 240V, and $P_{sc} = 650\\,\\text{W}$ at rated current. Calculate the transformer efficiency at full load, 0.8 power factor lagging.'
      },
      {
        id: 'les_mach_02',
        order_index: 2,
        title: 'Three-Phase Induction Motor: Rotating Field & Slip-Torque',
        duration_mins: 35,
        content: `### Rotating Magnetic Field (RMF)
When balanced 3-phase currents flow through balanced 3-phase stator windings displaced $120^\\circ$ in space, they generate a rotating magnetic field with:
1. Constant magnitude equal to $1.5 \\Phi_m$ (where $\\Phi_m$ is single-phase peak flux).
2. Constant synchronous speed:
$$N_s = \\frac{120 \\cdot f}{P}\\,\\text{RPM}$$

### Rotor Action & Slip
The rotating field cuts rotor conductors, inducing an EMF and current. By Lenz’s law, the rotor accelerates in the direction of the RMF to reduce relative speed, but can never reach $N_s$.
$$\\text{Slip } s = \\frac{N_s - N_r}{N_s}$$
* At standstill ($N_r = 0$): $s = 1$.
* At synchronous speed ($N_r = N_s$): $s = 0$.
* Normal running slip: $0.02 \\le s \\le 0.05$.

### Electromagnetic Torque Equation
$$T = \\frac{3}{\\omega_s} \\cdot \\frac{V^2 \\cdot (R_2' / s)}{(R_1 + R_2'/s)^2 + (X_1 + X_2')^2}$$

#### Maximum (Breakdown) Torque:
Occurs at slip:
$$s_{\\text{max}} = \\frac{R_2'}{\\sqrt{R_1^2 + (X_1 + X_2')^2}} \\approx \\frac{R_2'}{X_{\\text{eq}}}$$
* Notice that **maximum torque magnitude is independent of rotor resistance $R_2'$**, but the slip at which it occurs is directly proportional to $R_2'$.`,
        key_takeaways: [
          'RMF has constant magnitude $1.5\\Phi_m$ and rotates at $N_s = 120f/P$.',
          'Rotor frequency is slip frequency: $f_r = s \\cdot f$.',
          'Peak torque is independent of rotor resistance, but starting torque increases when rotor resistance is inserted.',
          'Operating zone: Stable region is between $s = 0$ and $s = s_{max}$.'
        ],
        practice_problem: 'A 4-pole, 50 Hz, 3-phase induction motor has a full-load speed of 1440 RPM. Calculate: (1) Synchronous speed, (2) Full load slip, and (3) Frequency of rotor currents at full load.'
      },
      {
        id: 'les_mach_03',
        order_index: 3,
        title: 'Synchronous Machines: Alternators, V-Curves & Power-Angle',
        duration_mins: 30,
        content: `### Working Principle of Synchronous Alternators
Synchronous generators convert mechanical input into AC electrical power at an exact synchronous speed:
$$N_s = \\frac{120 f}{P}$$
The rotor carries a DC field winding, and the stator carries a balanced 3-phase armature winding.

### Power-Angle ($P-\\delta$) Equation
Neglecting armature resistance ($R_a \\ll X_s$), the real electrical power delivered to an infinite bus is:
$$P = \\frac{E_f \\cdot V}{X_s} \\sin(\\delta)$$
Where:
* $E_f$ = Excitation voltage (proportional to DC field current $I_f$)
* $V$ = Bus terminal voltage
* $X_s$ = Synchronous reactance ($X_l + X_{ar}$)
* $\\delta$ = Power angle (rotor angle)

The maximum static stability limit occurs at $\\delta = 90^\\circ$:
$$P_{\\text{max}} = \\frac{E_f \\cdot V}{X_s}$$

### V-Curves of Synchronous Motors
Plotting armature current $I_a$ versus DC field current $I_f$ at constant real mechanical load produces characteristic **V-curves**:
* **Under-excited ($I_f < I_{f,\\text{normal}}$):** Operates at lagging power factor (absorbs reactive power $Q$).
* **Normal excitation:** Operates at unity power factor ($I_a$ is minimum).
* **Over-excited ($I_f > I_{f,\\text{normal}}$):** Operates at leading power factor (supplies reactive power $Q$, acts as synchronous condenser).`,
        key_takeaways: [
          'Synchronous speed is constant: $N_s = 120f/P$.',
          'Power-angle equation: $P = (E_f V / X_s) \\sin\\delta$. Pullout limit is $\\delta = 90^\\circ$.',
          'Over-excited synchronous motors supply VARs to the power grid, functioning as power-factor correctors.',
          'V-curves illustrate $I_a$ vs. $I_f$; inverted V-curves plot power factor vs. $I_f$.'
        ],
        practice_problem: 'A 3-phase alternator has $X_s = 1.2\\,\\Omega$ per phase and negligible resistance. It is connected to a 11 kV grid. If $E_f = 13\\,\\text{kV}$ line-to-line and real power output is 40 MW, compute the power angle $\\delta$.'
      }
    ],
    quiz: {
      id: 'quiz_machines_201',
      title: 'Electrical Machines Mastery Quiz',
      questions: [
        {
          question: 'What do the readings of the Open-Circuit test on a single-phase transformer primarily represent?',
          options: [
            'Full load copper losses in the windings',
            'Core / Iron losses in the magnetic core',
            'Mechanical friction and windage losses',
            'Dielectric breakdown of winding insulation'
          ],
          correct_index: 1,
          explanation: 'In the open-circuit test, current is low (only magnetizing/no-load current), making copper losses negligible. The input power measured is purely hysteresis and eddy current losses in the core.'
        },
        {
          question: 'In a 3-phase induction motor, increasing the rotor resistance $R_2$ causes:',
          options: [
            'Maximum breakdown torque to increase proportionally',
            'Maximum breakdown torque to decrease',
            'Maximum torque to remain unchanged, but occur at a higher slip',
            'Synchronous speed to decrease'
          ],
          correct_index: 2,
          explanation: 'Maximum breakdown torque $T_{max} \\approx \\frac{3}{2\\omega_s} \\frac{V^2}{X_{eq}}$ is completely independent of rotor resistance. However, the slip at maximum torque $s_{max} \\approx R_2/X_{eq}$ increases proportionally with $R_2$.'
        },
        {
          question: 'What is the nature of the power factor of an over-excited synchronous motor?',
          options: ['Lagging', 'Leading', 'Unity', 'Zero lagging'],
          correct_index: 1,
          explanation: 'Over-excitation causes the internal excitation EMF $E_f$ to exceed $V$, pushing reactive power back into the AC bus, making the motor draw leading current like a capacitor bank.'
        },
        {
          question: 'A 6-pole, 50 Hz induction motor runs at 950 RPM. What is its operating slip?',
          options: ['1.0', '0.05 (5%)', '0.10 (10%)', '0.02 (2%)'],
          correct_index: 1,
          explanation: 'Synchronous speed $N_s = 120 \\times 50 / 6 = 1000\\,\\text{RPM}$. Slip $s = (1000 - 950) / 1000 = 50 / 1000 = 0.05$ or 5%.'
        }
      ]
    }
  },
  {
    id: 'course_power_301',
    code: 'EEE 301',
    title: 'Power Systems & Fault Analysis',
    category: 'Power Engineering',
    description: 'Transmission line parameters, ABCD generalized constants, per-unit representation, symmetrical and unsymmetrical fault calculations, and grid stability.',
    level: 'Advanced',
    duration_weeks: 6,
    instructor: 'Dr. V. K. Mehta, Power Grid Systems Group',
    lessons: [
      {
        id: 'les_pwr_01',
        order_index: 1,
        title: 'Transmission Line Modeling & Generalized ABCD Constants',
        duration_mins: 25,
        content: `### Classification of Overhead Transmission Lines
Overhead transmission lines are classified by physical length and operating voltage:
1. **Short Lines (< 80 km, < 20 kV):** Shunt capacitance $C$ is neglected. Represented purely as series resistance $R$ and inductive reactance $X$.
2. **Medium Lines (80 km to 250 km, 20 kV to 100 kV):** Shunt admittance $Y = j\\omega C$ is lumped at discrete points (Nominal-$\\pi$ or Nominal-$T$ models).
3. **Long Lines (> 250 km, > 100 kV):** Rigorous distributed parameter model using hyperbolic functions.

### Generalized ABCD Transmission Matrix
The sending-end voltage $V_S$ and current $I_S$ relate to receiving-end $V_R$ and $I_R$ via:
$$\\begin{bmatrix} V_S \\\\ I_S \\end{bmatrix} = \\begin{bmatrix} A & B \\\\ C & D \\end{bmatrix} \\begin{bmatrix} V_R \\\\ I_R \\end{bmatrix}$$

#### Key Properties for Passive, Bilateral Lines:
* **Reciprocity:** $A D - B C = 1$
* **Symmetry:** $A = D$ (for identical line terminals)

#### Nominal-$\\pi$ Model Parameters:
* $A = D = 1 + \\frac{Z Y}{2}$
* $B = Z$
* $C = Y \\left(1 + \\frac{Z Y}{4}\\right)$

### The Ferranti Effect
On light loads or open-circuit conditions ($I_R = 0$) in medium and long lines, the receiving-end voltage exceeds sending-end voltage:
$$V_R = \\frac{V_S}{A} > V_S \\quad (\\text{since } |A| < 1)$$
This is caused by the voltage drop produced by charging currents flowing through line inductance.`,
        key_takeaways: [
          'ABCD matrix relates sending end to receiving end: $V_S = A V_R + B I_R$, $I_S = C V_R + D I_R$.',
          'Bilateral and symmetric condition: $AD - BC = 1$ and $A = D$.',
          'Ferranti effect: $V_R > V_S$ on unloaded or lightly loaded lines due to shunt charging capacitance.',
          'Shunt reactors are switched on at substations to mitigate overvoltage caused by the Ferranti effect.'
        ],
        practice_problem: 'A 3-phase, 50 Hz, 150 km transmission line has $Z = 30 + j75\\,\\Omega$ and $Y = j0.001\\,\\text{S}$. Compute the ABCD parameter $A$ using the Nominal-$\\pi$ method.'
      },
      {
        id: 'les_pwr_02',
        order_index: 2,
        title: 'Per-Unit System & Symmetrical Three-Phase Faults',
        duration_mins: 30,
        content: `### The Per-Unit (pu) Representation
Per-unit normalization simplifies multi-voltage level calculations across transformers:
$$\\text{Value (pu)} = \\frac{\\text{Actual Quantity}}{\\text{Base Quantity}}$$

#### Base Formulas:
* Base Impedance: $Z_{\\text{base}} = \\frac{(V_{\\text{base, L-L}})^2}{S_{\\text{base, 3\\phi}}}$
* Base Current: $I_{\\text{base}} = \\frac{S_{\\text{base, 3\\phi}}}{\\sqrt{3} \\cdot V_{\\text{base, L-L}}}$

#### Changing Per-Unit Base:
$$Z_{\\text{pu, new}} = Z_{\\text{pu, old}} \\times \\left(\\frac{V_{\\text{base, old}}}{V_{\\text{base, new}}}\\right)^2 \\times \\left(\\frac{S_{\\text{base, new}}}{S_{\\text{base, old}}}\\right)$$

### Symmetrical Three-Phase Fault Analysis
A 3-phase short circuit is the most severe electrical fault, though it accounts for only ~5% of all power system faults. Because it is balanced, it can be analyzed using single-phase equivalent networks.

#### Symmetrical Fault Current:
$$I_f'' = \\frac{V_f}{Z_{\\text{th}}}$$
Where:
* $V_f$ = Pre-fault bus voltage (typically $1.0\\,\\text{pu}$).
* $Z_{\\text{th}}$ = Thévenin impedance viewed from the fault point ($X_d''$ subtransient for circuit breaker interrupting duty).

#### Short-Circuit MVA Capacity:
$$\\text{SC MVA} = \\sqrt{3} \\cdot V_{\\text{rated}} \\cdot I_f = \\frac{S_{\\text{base}}}{Z_{\\text{th (pu)}}}$$`,
        key_takeaways: [
          'Per-unit impedance is invariant across ideal transformer boundaries when bases are selected consistently.',
          'Changing bases: $Z_{new} = Z_{old} \\times (V_{old}/V_{new})^2 \\times (S_{new}/S_{old})$.',
          'Symmetrical 3-phase fault yields balanced fault currents; analyzed on single-phase basis.',
          'Fault MVA capacity: $\\text{SC MVA} = S_{\\text{base}} / Z_{\\text{th, pu}}$.'
        ],
        practice_problem: 'A generator rated 100 MVA, 11 kV has a subtransient reactance of 0.15 pu. It supplies a bus through a 100 MVA transformer of reactance 0.10 pu. Calculate the symmetrical fault MVA for a solid 3-phase fault on the HV bus.'
      }
    ],
    quiz: {
      id: 'quiz_power_301',
      title: 'Power Systems & Fault Analysis Quiz',
      questions: [
        {
          question: 'What is the Ferranti effect in electrical power transmission lines?',
          options: [
            'Severe voltage drop at the receiving end during heavy inductive load',
            'Receiving-end voltage exceeding sending-end voltage under no-load or light-load conditions',
            'Power factor becoming negative due to harmonic resonance',
            'Corona discharge on conductors under rainy conditions'
          ],
          correct_index: 1,
          explanation: 'The Ferranti effect occurs in medium and long transmission lines when the capacitive charging current flowing through the series line inductance creates a voltage rise toward the receiving end.'
        },
        {
          question: 'For any bilateral, passive two-port electrical network represented by transmission parameters [A, B; C, D], which condition must always hold?',
          options: ['A = D', 'AD - BC = 1', 'AB - CD = 0', 'A + D = B + C'],
          correct_index: 1,
          explanation: 'Reciprocity of a linear bilateral passive two-port network dictates that the determinant of the transmission matrix equals unity ($AD - BC = 1$).'
        },
        {
          question: 'If a power system bus has a pre-fault voltage of 1.0 pu and a Thévenin reactance of 0.20 pu, what is the short circuit MVA on a 100 MVA base?',
          options: ['20 MVA', '100 MVA', '500 MVA', '2000 MVA'],
          correct_index: 2,
          explanation: 'Fault MVA = $S_{base} / X_{th,pu} = 100\\,\\text{MVA} / 0.20 = 500\\,\\text{MVA}$.'
        }
      ]
    }
  }
];

// ─────────────────────────────────────────────────────────────────────────────
// RAG KNOWLEDGE BASE SEED DOCUMENTS
// ─────────────────────────────────────────────────────────────────────────────
export const SEED_RAG_DOCUMENTS: SeedRagDocument[] = [
  {
    id: 'rag_doc_ieee_handbook',
    title: 'IEEE Standard EEE Reference Compendium: Machines & Transformers',
    subject: 'Electrical Machines',
    source_type: 'textbook',
    author: 'IEEE Power & Energy Society & Academic Board',
    chunks: [
      {
        id: 'chunk_transformer_model',
        title: 'Single-Phase Transformer Equivalent Circuit Equations & Phasors',
        keywords: ['transformer', 'equivalent circuit', 'leakage reactance', 'copper loss', 'core loss', 'efficiency'],
        content: `A real two-terminal transformer differs from an ideal transformer due to finite winding resistance, magnetic flux leakage, finite core permeability, and core hysteresis and eddy current losses.

The exact equivalent circuit refers all secondary parameters to the primary side using turns ratio a = N1/N2:
- Primary resistance: R1; Referred secondary resistance: R2' = a^2 * R2.
- Primary leakage reactance: X1; Referred secondary leakage reactance: X2' = a^2 * X2.
- Shunt core branch: Rc = V1^2 / P_core represents hysteresis and eddy current dissipation.
- Magnetizing reactance: Xm = V1 / I_magnetizing represents the finite permeability requiring magnetizing MMF.

Total series equivalent impedance referred to primary:
Z_eq1 = R_eq1 + j X_eq1 = (R1 + a^2 R2) + j(X1 + a^2 X2).

Voltage Regulation (VR):
VR = (|V1| - a|V2_load|) / (a|V2_load|) * 100%
Approximation: VR ≈ [I2 * (R_eq2 * cos(phi) ± X_eq2 * sin(phi)) / V2] * 100%
Use + for lagging power factor loads (inductive) and - for leading power factor loads (capacitive). Zero voltage regulation is achieved when tan(phi) = -R_eq2 / X_eq2.`
      },
      {
        id: 'chunk_dc_motor_principles',
        title: 'DC Motor Governing Laws: Lorentz Force, Back-EMF, and Torque',
        keywords: ['dc motor', 'back-emf', 'lorentz force', 'torque equation', 'speed regulation'],
        content: `DC machine electromechanical energy conversion is dictated by two core relations:

1. Lorentz Force Equation:
When current-carrying armature conductors of active length L carrying current I are placed in a magnetic flux density B:
F = I * (L x B) = B * I * L * sin(theta) Newtons.
Total developed electromagnetic torque in the armature:
T_e = (P * Phi * Z * I_a) / (2 * pi * A) = K_t * Phi * I_a
Where P = number of poles, Phi = flux per pole in Webers, Z = total armature conductors, A = number of parallel paths, and I_a = armature current.

2. Generated Back-EMF (Counter-EMF):
When conductors rotate across flux at speed N (RPM):
E_b = (P * Phi * N * Z) / (60 * A) = K_e * Phi * omega_m
Where omega_m = 2*pi*N / 60 rad/sec.

Armature Circuit KVL:
V_terminal = E_b + I_a * R_a
I_a = (V_terminal - E_b) / R_a
At starting (N = 0, E_b = 0), starting current is I_start = V / R_a, which is 5 to 7 times full-load current. Starters (3-point or 4-point) add external series resistance during starting to limit armature surge.`
      },
      {
        id: 'chunk_induction_motor_torque',
        title: 'Three-Phase Induction Motor RMF, Slip, and Torque-Speed Curve',
        keywords: ['induction motor', 'rotating magnetic field', 'slip', 'breakdown torque', 'rmf'],
        content: `In a 3-phase induction motor, three balanced sinusoidal currents separated by 120° time phase flowing in 3-phase distributed stator coils displaced 120° space angle produce a net rotating magnetic field (RMF).

Key Characteristics of the RMF:
1. Magnitude is constant at 1.5 * Phi_max at all times.
2. Rotates at synchronous speed: N_s = 120 * f / P (RPM).

Rotor Dynamics & Slip:
Rotor slip is s = (N_s - N_r) / N_s.
Rotor induced frequency is f_r = s * f.
Rotor induced EMF is E_2s = s * E_2.
Rotor leakage reactance is X_2s = s * X_2.

Electromagnetic Torque:
T = (3 / omega_s) * [V_th^2 * (R2'/s)] / [(R_th + R2'/s)^2 + (X_th + X2')^2]

Maximum Breakdown Torque (T_max):
Occurs at slip s_max = R2' / sqrt(R_th^2 + (X_th + X2')^2) ≈ R2' / X_eq.
T_max = (3 / (2 * omega_s)) * [V_th^2 / (R_th + sqrt(R_th^2 + X_eq^2))].
Critical Principle: T_max is completely independent of rotor resistance R2', but s_max shifts directly proportional to R2'. Adding external rotor resistance in slip-ring motors raises starting torque up to T_max without changing the peak torque capacity.`
      }
    ]
  },
  {
    id: 'rag_doc_power_grid_standard',
    title: 'High-Voltage Power Systems Engineering & Fault Analysis Manual',
    subject: 'Power Systems',
    source_type: 'reference_notes',
    author: 'Central Transmission Utility & Power Engineering Consortium',
    chunks: [
      {
        id: 'chunk_transmission_line_models',
        title: 'Transmission Line ABCD Parameters and Ferranti Effect',
        keywords: ['transmission line', 'abcd parameters', 'ferranti effect', 'characteristic impedance', 'pi model'],
        content: `Overhead power transmission networks are categorized into three analytical models:

1. Short Lines (< 80 km, < 20 kV):
Capacitance is neglected. Series impedance Z = R + jX.
A = 1, B = Z, C = 0, D = 1.

2. Medium Lines (80 km - 250 km, 20 kV - 100 kV) - Nominal-Pi Model:
Total series impedance Z = R + jX; Total shunt admittance Y = j*omega*C split into Y/2 at sending and receiving buses.
A = D = 1 + (Z * Y) / 2
B = Z
C = Y * (1 + (Z * Y) / 4)

3. Reciprocity and Symmetry:
AD - BC = 1 (Network is passive and reciprocal).
A = D (Network is geometrically symmetrical).

4. Ferranti Effect:
On long or medium lines under open-circuit or very light load conditions, the receiving-end voltage V_R exceeds sending-end voltage V_S:
V_R = V_S / A.
Since |A| = |1 + Z*Y/2| < 1 due to negative real part of Z*Y (as j*j = -1), |V_R| > |V_S|.
Mitigation: Shunt reactors are connected at the receiving-end substations to absorb excess capacitive VARs.`
      },
      {
        id: 'chunk_symmetrical_faults',
        title: 'Per-Unit System Base Conversion and Symmetrical Short-Circuit Calculations',
        keywords: ['per-unit', 'fault analysis', 'short circuit mva', 'thevenin impedance', 'subtransient reactance'],
        content: `Per-Unit (pu) calculations simplify networks spanning multiple voltage ratings:

Base Formulas:
S_base (3-phase) in MVA or kVA
V_base (Line-to-Line) in kV
Z_base = (V_base_LL)^2 / S_base_3phase
I_base = S_base_3phase / (sqrt(3) * V_base_LL)

Changing Per-Unit Base:
Z_pu_new = Z_pu_old * (V_base_old / V_base_new)^2 * (S_base_new / S_base_old)

Symmetrical 3-Phase Fault Calculation:
For a solid short-circuit fault at bus k:
I_fault_pu = V_prefault_pu / Z_thevenin_pu
Actual fault current:
I_fault_actual = I_fault_pu * I_base_k

Short-Circuit MVA (Fault Level):
SC_MVA = S_base_3phase / Z_thevenin_pu
Breaker Interrupting Sizing:
Circuit breakers must be sized based on subtransient reactance X_d'' for momentary peak capability and transient reactance X_d' for opening duty.`
      }
    ]
  },
  {
    id: 'rag_doc_power_electronics',
    title: 'Modern Power Electronics Converters & PWM Drives Primer',
    subject: 'Power Electronics',
    source_type: 'lab_manual',
    author: 'Power Electronics Applications Society',
    chunks: [
      {
        id: 'chunk_buck_boost_converters',
        title: 'DC-DC Switch-Mode Converters: Buck and Boost Topologies',
        keywords: ['buck converter', 'boost converter', 'dc-dc', 'duty cycle', 'switching frequency', 'inductor ripple'],
        content: `Switch-mode DC-DC converters regulate DC voltage with high theoretical efficiency (>90%).

1. Buck Converter (Step-Down):
Voltage Ratio: V_o = D * V_in (where 0 <= D <= 1 is the switch duty ratio T_on / T_s).
Inductor Current Ripple:
Delta_I_L = (V_in - V_o) * D / (f_s * L)
Critical Inductance for Continuous Conduction Mode (CCM):
L_crit = (1 - D) * R_load / (2 * f_s)
Output Voltage Ripple:
Delta_V_o = Delta_I_L / (8 * f_s * C)

2. Boost Converter (Step-Up):
Voltage Ratio: V_o = V_in / (1 - D)
As D approaches 1, output voltage theoretically approaches infinity (practically limited to 4-5x by parasitic inductor resistance).
Inductor Current Ripple:
Delta_I_L = V_in * D / (f_s * L)
Output Voltage Ripple:
Delta_V_o = I_o * D / (f_s * C)
Applications: Solar PV Maximum Power Point Tracking (MPPT), Battery boost stages in Electric Vehicles (EVs).`
      }
    ]
  }
];

