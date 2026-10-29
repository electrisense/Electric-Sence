import type { EEEProject } from '../types';

export const EEE_PROJECTS: EEEProject[] = [
  {
    id: 'proj-1',
    title: 'IoT-Enabled Smart Energy Meter with Remote Power Factor Monitoring',
    level: 'Undergraduate',
    domain: 'Embedded Systems / IoT',
    description: 'Hardware prototype monitoring RMS voltage, active/reactive energy consumption, and load power factor, relaying telemetry via MQTT/Wi-Fi to an engineering dashboard.',
    keyComponents: ['ESP32 Microcontroller', 'PZEM-004T AC Energy Sensor Module', 'Current Transformer (100A/50mA)', 'Relay Switch', 'OLED Display'],
    simulationTools: ['Proteus VSM', 'Arduino IDE', 'Thingspeak / MQTT Broker']
  },
  {
    id: 'proj-2',
    title: 'Maximum Power Point Tracking (MPPT) Solar Charge Controller',
    level: 'Intermediate',
    domain: 'Renewable Energy',
    description: 'Design and implementation of a synchronous buck converter running the Perturb and Observe (P&O) algorithm to extract optimal power from PV panels under fluctuating irradiance.',
    keyComponents: ['Microchip PIC / STM32F103', 'IR2104 Half-Bridge Gate Driver', 'Power MOSFETs (IRFP460)', 'Inductor Toroid Core', 'Current Sensor (ACS712)'],
    simulationTools: ['MATLAB / Simulink Simscape Electrical', 'LTspice']
  },
  {
    id: 'proj-3',
    title: 'Field-Oriented Control (FOC) Driver for Brushless DC (BLDC) Motor',
    level: 'Advanced Capstone',
    domain: 'Electric Vehicles',
    description: 'Three-phase inverter bridge with space vector pulse width modulation (SVPWM) to achieve decoupled torque and flux regulation for traction motors in electric mobility.',
    keyComponents: ['ARM Cortex-M4 (STM32G4)', '3-Phase Inverter Power Stage (DRV8302)', 'Hall Effect Sensors / Magnetic Encoder', 'Shunt Resistor Current Amplifiers'],
    simulationTools: ['MATLAB / Simulink Motor Control Blockset', 'PSIM']
  },
  {
    id: 'proj-4',
    title: 'Microgrid Automatic Transfer Switch with Fault Isolation',
    level: 'Intermediate',
    domain: 'Power Electronics',
    description: 'Solid-state static transfer switch (STS) that seamlessly transfers critical loads between primary grid and battery/solar microgrid during under-voltage or phase imbalance faults.',
    keyComponents: ['Zero Crossing Detector (ZCD)', 'Anti-parallel SCR Modules / Triacs', 'Optocoupler MOC3041', 'Voltage Sensing Transformer'],
    simulationTools: ['MATLAB / Simulink', 'Multisim']
  },
  {
    id: 'proj-5',
    title: 'Battery Management System (BMS) with Active Cell Balancing for EV Lithium Packs',
    level: 'Advanced Capstone',
    domain: 'Electric Vehicles',
    description: 'Multi-cell series battery supervision measuring individual cell voltages, pack temperature profiles, State-of-Charge (SoC) estimation via Coulomb counting, and inductive active balancing.',
    keyComponents: ['bq76952 AFE IC / STM32', 'NTC Thermistors', 'Solid-State Relays', 'Isolated CAN-bus Transceiver'],
    simulationTools: ['Simulink Simscape Battery', 'Altium Designer / KiCad']
  }
];
