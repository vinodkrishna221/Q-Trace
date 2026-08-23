'use client';

import * as React from 'react';
import { useRoleStore } from '@/lib/role-store';
import { SYNTHETIC_ROLES, SyntheticRole } from '@/lib/fixtures';
import { Badge } from '@/components/ui/badge';
import { User, GraduationCap, ShieldAlert } from 'lucide-react';

export function RoleSwitcher() {
  const { activeRoleId, activeRole, setRole } = useRoleStore();

  return (
    <div className="flex flex-col gap-2 p-2 rounded-lg bg-zinc-950/80 border border-zinc-800 text-xs">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-zinc-400 font-medium">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
          <span>Demo Role:</span>
        </div>
        <div className="flex items-center gap-1">
          {SYNTHETIC_ROLES.map((role: SyntheticRole) => {
            const isSelected = activeRoleId === role.id;
            return (
              <button
                key={role.id}
                data-testid={`role-btn-${role.name.toLowerCase().replace(/[^a-z]/g, '')}`}
                onClick={() => setRole(role.id)}
                className={`px-2.5 py-1 rounded transition-all font-medium flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-cyan-600 text-white shadow-sm ring-1 ring-cyan-400'
                    : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                }`}
                title={role.description}
              >
                {role.roleType === 'LEARNER' ? (
                  <User className="w-3 h-3" />
                ) : (
                  <GraduationCap className="w-3 h-3" />
                )}
                <span>{role.name}</span>
                <span className="text-[10px] opacity-75 font-mono">
                  ({role.roleTag === 'BEGINNER_CSE' ? 'CSE' : role.roleTag === 'PHYSICS_TO_CODE' ? 'Phys' : 'Instr'})
                </span>
              </button>
            );
          })}
        </div>
      </div>
      <div className="flex items-center justify-between text-[11px] text-zinc-400 px-1 border-t border-zinc-800/80 pt-1.5">
        <span className="truncate max-w-[400px]">
          <strong className="text-zinc-300">{activeRole.name}:</strong> {activeRole.description}
        </span>
        <Badge variant="outline" className="text-[10px] py-0 px-1.5 text-zinc-400 border-zinc-800">
          X-Demo-Profile-Id: {activeRole.profileId}
        </Badge>
      </div>
    </div>
  );
}
