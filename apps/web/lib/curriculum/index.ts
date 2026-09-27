import {
  UNITS_1_TO_3_STAGES,
  UNITS_1_TO_3_META,
  units1To3Stages,
} from "./units-1-to-3";
import {
  UNITS_4_TO_5_STAGES,
  UNITS_4_TO_5_META,
  units4To5Stages,
  GATE_MATRICES,
} from "./units-4-to-5";
import { CurriculumStage, CurriculumUnitInfo } from "./types";

export * from "./types";
export {
  UNITS_1_TO_3_STAGES,
  units1To3Stages,
  UNITS_1_TO_3_META,
} from "./units-1-to-3";
export {
  UNITS_4_TO_5_STAGES,
  units4To5Stages,
  UNITS_4_TO_5_META,
  GATE_MATRICES,
} from "./units-4-to-5";

export const ALL_CURRICULUM_STAGES: CurriculumStage[] = [
  ...UNITS_1_TO_3_STAGES,
  ...UNITS_4_TO_5_STAGES,
];

export const ALL_CURRICULUM_UNITS_META: CurriculumUnitInfo[] = [
  ...UNITS_1_TO_3_META,
  ...UNITS_4_TO_5_META,
];

/**
 * Retrieve any stage across all curriculum units by its unique ID or lessonId slug
 */
export function getStageById(
  stageOrLessonId: string
): CurriculumStage | undefined {
  return ALL_CURRICULUM_STAGES.find(
    (s) => s.id === stageOrLessonId || s.lessonId === stageOrLessonId
  );
}

/**
 * Retrieve all stages belonging to a specific unit (e.g. 'unit_1_1' ... 'unit_1_5')
 */
export function getStagesByUnit(unitId: string): CurriculumStage[] {
  return ALL_CURRICULUM_STAGES.filter((s) => s.unitId === unitId);
}
