import React, { useState } from 'react';
import { Calculator, Cpu, Zap, Activity, RefreshCw } from 'lucide-react';

export const ToolsView: React.FC = () => {
  const [activeTool, setActiveTool] = useState<'ohms' | 'resistor' | 'resonance' | 'transformer'>('ohms');

  // Ohm's Law State
  const [voltage, setVoltage] = useState<string>('12');
  const [current, setCurrent] = useState<string>('2');
  const [resistance, setResistance] = useState<string>('6');
  const [power, setPower] = useState<string>('24');
  const [ohmsMode, setOhmsMode] = useState<'calc-v' | 'calc-i' | 'calc-r' | 'calc-p'>('calc-v');

  // Resistor Color State (4-band: band1, band2, multiplier, tolerance)
  const [band1, setBand1] = useState<number>(1); // Brown (1)
  const [band2, setBand2] = useState<number>(0); // Black (0)
  const [band3, setBand3] = useState<number>(2); // Red (10^2 = 100)
  const [band4, setBand4] = useState<number>(5); // Gold (+/- 5%)

  // RLC Resonance State
  const [inductance, setInductance] = useState<string>('10'); // mH
  const [capacitance, setCapacitance] = useState<string>('100'); // nF
  const [seriesR, setSeriesR] = useState<string>('50'); // Ohms

  // Transformer State
  const [vPrimary, setVPrimary] = useState<string>('230');
  const [turnsPrimary, setTurnsPrimary] = useState<string>('1000');
  const [turnsSecondary, setTurnsSecondary] = useState<string>('100');

  // Color bands definitions
  const colorBands = [
    { name: 'Black', value: 0, mult: 1, bg: 'bg-black text-white' },
    { name: 'Brown', value: 1, mult: 10, bg: 'bg-amber-900 text-white' },
    { name: 'Red', value: 2, mult: 100, bg: 'bg-red-600 text-white' },
    { name: 'Orange', value: 3, mult: 1000, bg: 'bg-orange-500 text-white' },
    { name: 'Yellow', value: 4, mult: 10000, bg: 'bg-yellow-400 text-slate-900' },
    { name: 'Green', value: 5, mult: 100000, bg: 'bg-emerald-600 text-white' },
    { name: 'Blue', value: 6, mult: 1000000, bg: 'bg-blue-600 text-white' },
    { name: 'Violet', value: 7, mult: 10000000, bg: 'bg-purple-600 text-white' },
    { name: 'Gray', value: 8, mult: 100000000, bg: 'bg-gray-500 text-white' },
    { name: 'White', value: 9, mult: 1000000000, bg: 'bg-white text-slate-900 border border-slate-300' },
  ];

  const toleranceBands = [
    { name: 'Gold (±5%)', value: 5 },
    { name: 'Silver (±10%)', value: 10 },
    { name: 'None (±20%)', value: 20 },
  ];

  const calculateOhms = () => {
    const v = parseFloat(voltage);
    const i = parseFloat(current);
    const r = parseFloat(resistance);

    if (ohmsMode === 'calc-v' && !isNaN(i) && !isNaN(r)) {
      const calcV = i * r;
      setVoltage(calcV.toFixed(2));
      setPower((calcV * i).toFixed(2));
    } else if (ohmsMode === 'calc-i' && !isNaN(v) && !isNaN(r) && r !== 0) {
      const calcI = v / r;
      setCurrent(calcI.toFixed(2));
      setPower((v * calcI).toFixed(2));
    } else if (ohmsMode === 'calc-r' && !isNaN(v) && !isNaN(i) && i !== 0) {
      const calcR = v / i;
      setResistance(calcR.toFixed(2));
      setPower((v * i).toFixed(2));
    } else if (ohmsMode === 'calc-p' && !isNaN(v) && !isNaN(i)) {
      setPower((v * i).toFixed(2));
    }
  };

  // Resistor Calculations
  const resistorValue = (band1 * 10 + band2) * Math.pow(10, band3);
  const formatResistorValue = (ohms: number) => {
    if (ohms >= 1000000) return `${(ohms / 1000000).toFixed(2)} MΩ`;
    if (ohms >= 1000) return `${(ohms / 1000).toFixed(2)} kΩ`;
    return `${ohms.toLocaleString()} Ω`;
  };

  // Resonance Calculations
  const L_val = (parseFloat(inductance) || 0) * 1e-3; // H
  const C_val = (parseFloat(capacitance) || 0) * 1e-9; // F
  const R_val = parseFloat(seriesR) || 1;
  const resonantFreq = (L_val > 0 && C_val > 0)
    ? 1 / (2 * Math.PI * Math.sqrt(L_val * C_val))
    : 0;
  const qualityFactor = (L_val > 0 && C_val > 0 && R_val > 0)
    ? (1 / R_val) * Math.sqrt(L_val / C_val)
    : 0;

  // Transformer Calculations
  const vp = parseFloat(vPrimary) || 0;
  const np = parseFloat(turnsPrimary) || 1;
  const ns = parseFloat(turnsSecondary) || 0;
  const vs = np > 0 ? (vp * ns) / np : 0;
  const turnsRatio = np > 0 ? (np / ns).toFixed(2) : '0';

  return (
    <div className="flex-1 overflow-y-auto bg-white p-4 md:p-6">
      <div className="max-w-5xl mx-auto space-y-5">
        {/* Header */}
        <div className="bg-slate-50/50 border border-slate-200 rounded-lg p-5">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200 mb-2">
            <Calculator className="w-3.5 h-3.5" />
            <span>Interactive Calculators</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
            Engineering Tools & Calculators
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Perform precision DC, AC, and component parameter calculations commonly used in laboratory and coursework problems.
          </p>

          {/* Tool Switcher Tabs */}
          <div className="flex flex-wrap gap-2 mt-5 pt-4 border-t border-slate-100">
            <button
              onClick={() => setActiveTool('ohms')}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                activeTool === 'ohms'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Ohm's Law & DC Power</span>
            </button>

            <button
              onClick={() => setActiveTool('resistor')}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                activeTool === 'resistor'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Resistor Color Code</span>
            </button>

            <button
              onClick={() => setActiveTool('resonance')}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                activeTool === 'resonance'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>RLC Resonance & Q-Factor</span>
            </button>

            <button
              onClick={() => setActiveTool('transformer')}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                activeTool === 'transformer'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Transformer Turns Ratio</span>
            </button>
          </div>
        </div>

        {/* Tool #1: Ohm's Law */}
        {activeTool === 'ohms' && (
          <div className="bg-white border border-slate-200 rounded-lg p-5">
            <h3 className="text-base font-bold text-slate-900 mb-1">Ohm's Law & Power Calculator</h3>
            <p className="text-xs text-slate-500 mb-5">
              Compute Voltage (V), Current (I), Resistance (R), and Power (P) using fundamental linear DC relationships.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Voltage (V in Volts)
                </label>
                <input
                  type="number"
                  value={voltage}
                  onChange={(e) => setVoltage(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Current (I in Amperes)
                </label>
                <input
                  type="number"
                  value={current}
                  onChange={(e) => setCurrent(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Resistance (R in Ohms Ω)
                </label>
                <input
                  type="number"
                  value={resistance}
                  onChange={(e) => setResistance(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Power (P in Watts)
                </label>
                <input
                  type="number"
                  value={power}
                  readOnly
                  className="w-full px-3 py-2 text-sm bg-slate-100 text-slate-800 border border-slate-200 rounded-lg font-mono font-semibold"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs font-medium text-slate-500">Calculate target:</span>
              <select
                value={ohmsMode}
                onChange={(e) => setOhmsMode(e.target.value as any)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-md text-xs font-medium"
              >
                <option value="calc-v">Calculate Voltage (V = I · R)</option>
                <option value="calc-i">Calculate Current (I = V / R)</option>
                <option value="calc-r">Calculate Resistance (R = V / I)</option>
                <option value="calc-p">Calculate Power (P = V · I)</option>
              </select>

              <button
                onClick={calculateOhms}
                className="px-4 py-1.5 rounded-md bg-blue-600 text-white hover:bg-blue-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Evaluate</span>
              </button>
            </div>
          </div>
        )}

        {/* Tool #2: Resistor Color Code */}
        {activeTool === 'resistor' && (
          <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-5">
            <div>
              <h3 className="text-base font-bold text-slate-900 mb-1">4-Band Resistor Color Code Decoder</h3>
              <p className="text-xs text-slate-500">
                Identify standard axial lead resistor values based on standard EIA band markings.
              </p>
            </div>

            {/* Visual Resistor Display */}
            <div className="p-6 bg-slate-100 rounded-xl border border-slate-200 flex flex-col items-center justify-center">
              <div className="text-2xl font-mono font-bold text-slate-900 mb-2">
                {formatResistorValue(resistorValue)} ±{band4}%
              </div>
              <div className="text-xs font-mono text-slate-500">
                Base Value: {resistorValue.toLocaleString()} Ohms
              </div>
            </div>

            {/* Band Selectors */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  1st Significant Digit
                </label>
                <select
                  value={band1}
                  onChange={(e) => setBand1(parseInt(e.target.value))}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg"
                >
                  {colorBands.slice(1).map((b) => (
                    <option key={b.value} value={b.value}>
                      {b.value} - {b.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  2nd Significant Digit
                </label>
                <select
                  value={band2}
                  onChange={(e) => setBand2(parseInt(e.target.value))}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg"
                >
                  {colorBands.map((b) => (
                    <option key={b.value} value={b.value}>
                      {b.value} - {b.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Multiplier Band (10ⁿ)
                </label>
                <select
                  value={band3}
                  onChange={(e) => setBand3(parseInt(e.target.value))}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg"
                >
                  {colorBands.slice(0, 8).map((b) => (
                    <option key={b.value} value={b.value}>
                      ×10^{b.value} ({b.name})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Tolerance Band
                </label>
                <select
                  value={band4}
                  onChange={(e) => setBand4(parseInt(e.target.value))}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg"
                >
                  {toleranceBands.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Tool #3: RLC Resonance */}
        {activeTool === 'resonance' && (
          <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-5">
            <div>
              <h3 className="text-base font-bold text-slate-900 mb-1">Series RLC Resonance & Quality Factor</h3>
              <p className="text-xs text-slate-500">
                Formula: f₀ = 1 / (2π√(LC)) &nbsp;|&nbsp; Q = (1/R) · √(L/C)
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Inductance L (mH)
                </label>
                <input
                  type="number"
                  value={inductance}
                  onChange={(e) => setInductance(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Capacitance C (nF)
                </label>
                <input
                  type="number"
                  value={capacitance}
                  onChange={(e) => setCapacitance(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Series Resistance R (Ω)
                </label>
                <input
                  type="number"
                  value={seriesR}
                  onChange={(e) => setSeriesR(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>
            </div>

            {/* Results Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <span className="text-xs text-blue-700 font-semibold uppercase tracking-wider block mb-1">
                  Resonant Frequency (f₀)
                </span>
                <span className="text-2xl font-mono font-bold text-blue-950">
                  {resonantFreq > 1000 ? `${(resonantFreq / 1000).toFixed(3)} kHz` : `${resonantFreq.toFixed(2)} Hz`}
                </span>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-xs text-slate-600 font-semibold uppercase tracking-wider block mb-1">
                  Quality Factor (Q)
                </span>
                <span className="text-2xl font-mono font-bold text-slate-900">
                  {qualityFactor.toFixed(3)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Tool #4: Transformer */}
        {activeTool === 'transformer' && (
          <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-5">
            <div>
              <h3 className="text-base font-bold text-slate-900 mb-1">Ideal Transformer Turns & Voltage Ratio</h3>
              <p className="text-xs text-slate-500">
                Formula: V_p / V_s = N_p / N_s = Turns Ratio (k)
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Primary Voltage V_p (V)
                </label>
                <input
                  type="number"
                  value={vPrimary}
                  onChange={(e) => setVPrimary(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Primary Turns N_p
                </label>
                <input
                  type="number"
                  value={turnsPrimary}
                  onChange={(e) => setTurnsPrimary(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Secondary Turns N_s
                </label>
                <input
                  type="number"
                  value={turnsSecondary}
                  onChange={(e) => setTurnsSecondary(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <span className="text-xs text-blue-700 font-semibold uppercase tracking-wider block mb-1">
                  Calculated Secondary Voltage (V_s)
                </span>
                <span className="text-2xl font-mono font-bold text-blue-950">
                  {vs.toFixed(2)} V
                </span>
                <span className="text-[11px] text-blue-600 block mt-1 font-medium">
                  {vs > vp ? 'Step-up Transformer' : vs < vp ? 'Step-down Transformer' : 'Isolation 1:1'}
                </span>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-xs text-slate-600 font-semibold uppercase tracking-wider block mb-1">
                  Transformation Ratio (N_p / N_s)
                </span>
                <span className="text-2xl font-mono font-bold text-slate-900">
                  {turnsRatio} : 1
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
