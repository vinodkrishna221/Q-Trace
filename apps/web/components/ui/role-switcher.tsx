'use client';

import * as React from 'react';
import { useRoleStore } from '@/lib/role-store';
import { SYNTHETIC_ROLES, SyntheticRole } from '@/lib/fixtures';
import { User, GraduationCap, ScanEye } from 'lucide-react';

export function RoleSwitcher() {
  const { activeRoleId, activeRole, setRole } = useRoleStore();

  return (
    <div className="flex flex-col gap-1.5 px-3 py-2 rounded-lg bg-panel border border-line text-xs">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 text-ink-faint font-mono text-[10px] uppercase tracking-widest">
          <ScanEye className="w-3.5 h-3.5 text-caution" />
          <span>Demo Role</span>
        </div>
        <div className="flex items-center gap-1">
          {SYNTHETIC_ROLES.map((role: SyntheticRole) => {
            const isSelected = activeRoleId === role.id;
            return (
              <button
                key={role.id}
                data-testid={`role-btn-${role.name.toLowerCase().replace(/[^a-z]/g, '')}`}
                onClick={() => setRole(role.id)}
                className={`px-2.5 py-1 rounded-md transition-all font-medium flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? 'bg-accent/15 text-accent border border-accent/50 shadow-glow'
                    : 'bg-transparent text-ink-dim border border-transparent hover:text-ink hover:bg-raised'
                }`}
                title={role.description}
              >
                {role.roleType === 'LEARNER' ? (
                  <User className="w-3 h-3" />
                ) : (
                  <GraduationCap className="w-3 h-3" />
                )}
                <span>{role.name}</span>
                <span className="text-[10px] opacity-70 font-mono">
                  ({role.roleTag === 'BEGINNER_CSE' ? 'CSE' : role.roleTag === 'PHYSICS_TO_CODE' ? 'Phys' : 'Instr'})
                </span>
              </button>
            );
          })}
        </div>
      </div>
      <div className="flex items-center justify-between text-[11px] text-ink-faint border-t border-line pt-1.5">
        <span className="truncate max-w-[420px]">
          <strong className="text-ink-dim">{activeRole.name}:</strong> {activeRole.description}
        </span>
      </div>
    </div>
  );
}
