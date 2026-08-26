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
      className="text-base md:text-lg font-medium py-1 overflow-x-auto"
      dangerouslySetInnerHTML={{ __html: renderedHtml }}
    />
  );
}

export function ConceptBlocks({ contentBlocks }: ConceptBlocksProps) {
  return (
    <Card data-testid="concept-blocks-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-accent" />
          <span>Core Concepts & Principles</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm text-ink-dim leading-relaxed">
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
                    ? 'bg-caution/5 border-caution/40 text-caution'
                    : 'bg-accent/5 border-accent/40 text-accent'
                }`}
              >
                {isCaution ? (
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                ) : (
                  <Info className="w-4 h-4 shrink-0 mt-0.5" />
                )}
                <div>
                  <span className="font-semibold block mb-0.5 font-display tracking-wide">
                    {isCaution ? 'Conceptual Pitfall' : 'Key Insight'}
                  </span>
                  <span className="text-ink-dim">{block.body}</span>
                </div>
              </div>
            );
          }

          if (block.type === 'FORMULA') {
            return (
              <div
                key={idx}
                data-testid={`concept-formula-${idx}`}
                className="p-4 rounded-xl bg-abyss border border-accent/30 text-center shadow-glow-soft"
              >
                <div className="flex items-center justify-center gap-2 mb-1 text-[11px] uppercase tracking-widest text-ink-faint font-mono">
                  <Sigma className="w-3.5 h-3.5 text-accent" />
                  <span>State Formula</span>
                </div>
                <FormulaBlock latex={block.latex ?? ''} />
                <div className="text-[11px] text-ink-faint mt-1">
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
