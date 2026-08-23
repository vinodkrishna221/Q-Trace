import { create } from 'zustand';
import {
  SYNTHETIC_ROLES,
  DEMO_LEARNER_PROFILES,
  DEMO_INSTRUCTOR_PROFILE,
  DEMO_LEARNING_PATHS,
  SyntheticRole,
} from './fixtures';
import { LearnerProfile, InstructorProfile, LearningPath } from './contracts';

interface RoleState {
  activeRoleId: string;
  activeRole: SyntheticRole;
  activeLearnerProfile: LearnerProfile | null;
  activeInstructorProfile: InstructorProfile | null;
  activeLearningPath: LearningPath | null;
  setRole: (roleId: string) => void;
  getAuthHeaders: () => Record<string, string>;
}

export const useRoleStore = create<RoleState>((set, get) => {
  const defaultRole = SYNTHETIC_ROLES[0]; // Aarav
  const defaultLearner = DEMO_LEARNER_PROFILES[defaultRole.profileId] || null;
  const defaultPath = defaultLearner ? DEMO_LEARNING_PATHS[defaultLearner.activeLearningPathId] || null : null;

  return {
    activeRoleId: defaultRole.id,
    activeRole: defaultRole,
    activeLearnerProfile: defaultLearner,
    activeInstructorProfile: null,
    activeLearningPath: defaultPath,
    setRole: (roleId: string) => {
      const role = SYNTHETIC_ROLES.find((r) => r.id === roleId) || SYNTHETIC_ROLES[0];
      if (role.roleType === 'LEARNER') {
        const learner = DEMO_LEARNER_PROFILES[role.profileId] || null;
        const path = learner ? DEMO_LEARNING_PATHS[learner.activeLearningPathId] || null : null;
        set({
          activeRoleId: role.id,
          activeRole: role,
          activeLearnerProfile: learner,
          activeInstructorProfile: null,
          activeLearningPath: path,
        });
      } else {
        set({
          activeRoleId: role.id,
          activeRole: role,
          activeLearnerProfile: null,
          activeInstructorProfile: DEMO_INSTRUCTOR_PROFILE,
          activeLearningPath: null,
        });
      }
    },
    getAuthHeaders: () => {
      const { activeRole } = get();
      return {
        'X-Demo-Profile-Id': activeRole.profileId,
      };
    },
  };
});
