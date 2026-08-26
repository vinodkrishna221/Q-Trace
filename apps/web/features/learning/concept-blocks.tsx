'use client';

import * as React from 'react';
import { ContentBlock } from '@/lib/contracts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { BookOpen, AlertCircle, Info, Sigma } from 'lucide-react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

interface ConceptBlocksProps {
  contentBlocks: ContentBlock[];
}

function FormulaBlock({ latex }: { latex: string }) {
  const renderedHtml = React.useMemo(() => {
    try {
      return katex.renderToString(latex, {
        throwOnError: false,
        displayMode: true,
      });
    } catch {
      return latex;
    }
  }, [latex]);

  return (
    <div
      className="text-base md:text-lg font-medium py-1 overflow-x-auto text-cyan-200"
      dangerouslySetInnerHTML={{ __html: renderedHtml }}
    />
  );
}

export function ConceptBlocks({ contentBlocks }: ConceptBlocksProps) {
  return (
    <Card className="border-zinc-800" data-testid="concept-blocks-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-cyan-400" />
          <span>Core Concepts & Principles</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm text-zinc-300 leading-relaxed">
        {contentBlocks.map((block, idx) => {
          if (block.type === 'TEXT') {
            return (
              <p key={idx} className="leading-relaxed" data-testid={`concept-text-${idx}`}>
                {block.body}
              </p>
            );
          }

          if (block.type === 'CALLOUT') {
            const isCaution = block.tone === 'CAUTION';
            return (
              <div
                key={idx}
                data-testid={`concept-callout-${idx}`}
                className={`p-3.5 rounded-lg border text-xs flex gap-2.5 items-start ${
                  isCaution
                    ? 'bg-amber-950/30 border-amber-800/40 text-amber-200'
                    : 'bg-cyan-950/30 border-cyan-800/40 text-cyan-200'
                }`}
              >
                {isCaution ? (
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                ) : (
                  <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <span className="font-semibold block mb-0.5">
                    {isCaution ? 'Conceptual Pitfall' : 'Key Insight'}
                  </span>
                  <span>{block.body}</span>
                </div>
              </div>
            );
          }

          if (block.type === 'FORMULA') {
            return (
              <div
                key={idx}
                data-testid={`concept-formula-${idx}`}
                className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 font-mono text-center text-cyan-300 text-sm tracking-wider shadow-inner"
              >
                <div className="flex items-center justify-center gap-2 mb-1 text-[11px] uppercase tracking-widest text-zinc-500 font-sans">
                  <Sigma className="w-3.5 h-3.5 text-cyan-400" />
                  <span>State Formula</span>
                </div>
                <FormulaBlock latex={block.latex} />
                <div className="text-[11px] text-zinc-500 font-sans mt-1">
                  Mathematical representation (not physical trajectory)
                </div>
              </div>
            );
          }

          return null;
        })}
      </CardContent>
    </Card>
  );
}
