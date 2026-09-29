import { CurriculumStage } from './types';

export interface UnitDefinition {
  unitNumber: number;
  unitTitle: string;
  shortTitle: string;
  subtitle: string;
  completedCount: number;
  totalCount: number;
  accentRailColor?: string;
  firstStageId: string;
}

export const UNIT_DEFINITIONS: UnitDefinition[] = [
  {
    unitNumber: 1,
    unitTitle: 'THE QUANTUM COMPASS',
    shortTitle: 'The Quantum Compass',
    subtitle: 'Single-Qubit Rotations & Superposition',
    completedCount: 3,
    totalCount: 6,
    accentRailColor: undefined,
    firstStageId: 'stage_1_1_compass',
  },
  {
    unitNumber: 2,
    unitTitle: 'ENTANGLEMENT & BELL STATES',
    shortTitle: 'Entanglement & Bell States',
    subtitle: 'Two-Qubit Systems, CNOT & Non-Local Correlation',
    completedCount: 1,
    totalCount: 4,
    accentRailColor: 'linear-gradient(to right, #4a02b1, #2a2882)',
    firstStageId: 'mod1_multi_qubit_register',
  },
  {
    unitNumber: 3,
    unitTitle: "GROVER'S SEARCH ALGORITHM",
    shortTitle: "Grover's Algorithm",
    subtitle: 'Quantum Oracle Marking & Amplitude Amplification',
    completedCount: 0,
    totalCount: 9,
    accentRailColor: 'linear-gradient(to right, #00D4FF, #1E40AF)',
    firstStageId: 'mod2_grover_oracle_concept',
  },
];

export function getUnitForStage(stage?: CurriculumStage | null): number {
  if (!stage) return 1;
  if (
    stage.unitId === 'unit_2_1' ||
    stage.id.startsWith('mod2_') ||
    stage.id.startsWith('pc_grover')
  ) {
    return 3;
  }
  if (
    stage.unitId === 'unit_1_6' ||
    stage.unitId === 'unit_1_7' ||
    stage.id === 'bell-state' ||
    stage.id.startsWith('mod1_')
  ) {
    return 2;
  }
  return 1;
}
