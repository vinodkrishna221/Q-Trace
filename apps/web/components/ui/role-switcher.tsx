'use client';

import * as React from 'react';
import { useRoleStore } from '@/lib/role-store';
import { SYNTHETIC_ROLES, SyntheticRole } from '@/lib/fixtures';
import { User, GraduationCap } from 'lucide-react';

export function RoleSwitcher() {
  const { activeRoleId, setRole } = useRoleStore();

  return (
    <div
      className="flex items-center rounded-full border border-border-subtle bg-surface-raised/60 p-0.5"
      role="group"
      aria-label="Demo role selector"
    >
      {SYNTHETIC_ROLES.map((role: SyntheticRole) => {
        const isSelected = activeRoleId === role.id;
        return (
          <button
            key={role.id}
            type="button"
            data-testid={`role-btn-${role.name.toLowerCase().replace(/[^a-z]/g, '')}`}
            aria-pressed={isSelected}
            aria-label={`Switch demo role to ${role.name} (${role.roleTag})`}
            onClick={() => setRole(role.id)}
            className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
              isSelected
                ? 'bg-surface text-text-primary shadow-xs font-semibold'
                : 'text-text-secondary hover:text-text-primary'
            }`}
            title={`${role.name} (${role.roleTag}): ${role.description}`}
          >
            {role.roleType === 'LEARNER' ? (
              <User className="w-3 h-3 text-accent" />
            ) : (
              <GraduationCap className="w-3 h-3 text-accent" />
            )}
            <span>{role.name}</span>
          </button>
        );
      })}
    </div>
  );
}
