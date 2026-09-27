'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { BarChart3, Zap, RotateCcw, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

type QuantumState = '0' | '1' | '+';

export function MeasurementSimulation() {
  const [preparedState, setPreparedState] = useState<QuantumState>('+');
  const [shots, setShots] = useState<{ '0': number; '1': number }>({ '0': 0, '1': 0 });
  const [isMeasuring, setIsMeasuring] = useState(false);

  const totalShots = shots['0'] + shots['1'];
  
  const prob0 = preparedState === '0' ? 1 : preparedState === '1' ? 0 : 0.5;
  const prob1 = preparedState === '1' ? 1 : preparedState === '0' ? 0 : 0.5;

  const measure = (numShots: number) => {
    setIsMeasuring(true);
    
    // Simulate quantum shots
    setTimeout(() => {
      let new0 = 0;
      let new1 = 0;
      
      for (let i = 0; i < numShots; i++) {
        if (Math.random() < prob0) {
          new0++;
        } else {
          new1++;
        }
      }
      
      setShots(prev => ({
        '0': prev['0'] + new0,
        '1': prev['1'] + new1
      }));
      setIsMeasuring(false);
    }, 150); // slight delay for visual effect
  };

  const reset = () => {
    setShots({ '0': 0, '1': 0 });
  };

  const p0Percent = totalShots === 0 ? 0 : (shots['0'] / totalShots) * 100;
  const p1Percent = totalShots === 0 ? 0 : (shots['1'] / totalShots) * 100;

  return (
    <div className="w-full bg-panel rounded-xl border border-line overflow-hidden flex flex-col">
      <div className="p-4 border-b border-line bg-background/50 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-evidence" />
          <span className="text-sm font-semibold text-ink-main uppercase tracking-widest">Prepare State</span>
        </div>
        <div className="flex bg-abyss rounded-lg p-1 border border-line">
          <button
            onClick={() => { setPreparedState('0'); reset(); }}
            className={`px-3 py-1 text-xs font-mono rounded-md transition-colors ${preparedState === '0' ? 'bg-evidence text-background font-bold' : 'text-ink-dim hover:text-ink-main'}`}
          >
            |0⟩
          </button>
          <button
            onClick={() => { setPreparedState('1'); reset(); }}
            className={`px-3 py-1 text-xs font-mono rounded-md transition-colors ${preparedState === '1' ? 'bg-evidence text-background font-bold' : 'text-ink-dim hover:text-ink-main'}`}
          >
            |1⟩
          </button>
          <button
            onClick={() => { setPreparedState('+'); reset(); }}
            className={`px-3 py-1 text-xs font-mono rounded-md transition-colors ${preparedState === '+' ? 'bg-evidence text-background font-bold' : 'text-ink-dim hover:text-ink-main'}`}
          >
            |+⟩ (Superposition)
          </button>
        </div>
      </div>

      <div className="p-6 flex flex-col md:flex-row gap-8">
        {/* Histogram */}
        <div className="flex-1 flex flex-col justify-end min-h-[240px] relative">
          
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-8 z-0">
            {[100, 75, 50, 25, 0].map(tick => (
              <div key={tick} className="flex items-center gap-2 w-full">
                <span className="text-[10px] text-ink-faint font-mono w-6 text-right">{tick}%</span>
                <div className="flex-1 h-px bg-line/50 border-t border-dashed border-line/50" />
              </div>
            ))}
          </div>

          <div className="flex justify-around items-end h-[200px] z-10 pl-8">
            <div className="flex flex-col items-center gap-2 w-1/3">
              <span className="text-xs font-mono text-ink-dim">{totalShots > 0 ? p0Percent.toFixed(1) : 0}%</span>
              <div className="w-full h-[200px] bg-background border border-line rounded-t-md overflow-hidden relative flex flex-col justify-end">
                <motion.div 
                  initial={{ height: 0 }}
                  animate={{ height: `${p0Percent}%` }}
                  transition={{ type: "spring", stiffness: 120, damping: 15 }}
                  className="w-full bg-accent"
                />
              </div>
              <span className="font-mono font-bold">|0⟩</span>
              <span className="text-[10px] text-ink-faint">{shots['0']} shots</span>
            </div>

            <div className="flex flex-col items-center gap-2 w-1/3">
              <span className="text-xs font-mono text-ink-dim">{totalShots > 0 ? p1Percent.toFixed(1) : 0}%</span>
              <div className="w-full h-[200px] bg-background border border-line rounded-t-md overflow-hidden relative flex flex-col justify-end">
                <motion.div 
                  initial={{ height: 0 }}
                  animate={{ height: `${p1Percent}%` }}
                  transition={{ type: "spring", stiffness: 120, damping: 15 }}
                  className="w-full bg-evidence"
                />
              </div>
              <span className="font-mono font-bold">|1⟩</span>
              <span className="text-[10px] text-ink-faint">{shots['1']} shots</span>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="w-full md:w-[240px] space-y-4 flex flex-col justify-center">
          <div className="bg-abyss p-4 rounded-xl border border-line">
            <div className="text-xs text-ink-faint uppercase tracking-widest mb-1 font-mono">Total Shots</div>
            <div className="text-3xl font-mono text-ink-main mb-4">{totalShots}</div>
            
            <div className="space-y-2">
              <Button 
                onClick={() => measure(1)} 
                disabled={isMeasuring}
                className="w-full gap-2 text-xs h-8"
              >
                <Zap className="w-3.5 h-3.5" />
                Fire 1 Shot
              </Button>
              <Button 
                onClick={() => measure(100)} 
                disabled={isMeasuring}
                variant="secondary"
                className="w-full gap-2 text-xs h-8"
              >
                <BarChart3 className="w-3.5 h-3.5" />
                Fire 100 Shots
              </Button>
              <Button 
                onClick={() => measure(1024)} 
                disabled={isMeasuring}
                variant="secondary"
                className="w-full gap-2 text-xs h-8"
              >
                <BarChart3 className="w-3.5 h-3.5" />
                Fire 1024 Shots
              </Button>
            </div>
            
            <Button 
              onClick={reset} 
              variant="ghost"
              className="w-full gap-2 text-xs h-8 mt-4 text-ink-dim"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Stats
            </Button>
          </div>
        </div>
      </div>
      <div className="bg-background/30 p-3 text-[11px] text-ink-dim border-t border-line text-center">
        {preparedState === '+' 
          ? "Notice how low shot counts variance is high, but firing 1024 shots converges closely to the 50/50 Born rule prediction."
          : `Since the state is definitively |${preparedState}⟩, all measurements will yield ${preparedState}. No collapse uncertainty.`}
      </div>
    </div>
  );
}
