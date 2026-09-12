import * as React from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

/**
 * Heals unclosed LaTeX delimiters ($ or $$) and unbalanced braces at the end of truncated strings.
 */
export function healUnclosedLatex(text: string): string {
  if (!text) return '';
  let healed = text;

  // Check for unclosed $$ (display math)
  const doubleDollarMatches = healed.match(/\$\$/g);
  if (doubleDollarMatches && doubleDollarMatches.length % 2 === 1) {
    const lastDoubleDollarIdx = healed.lastIndexOf('$$');
    const mathContent = healed.slice(lastDoubleDollarIdx + 2);
    const openBraces = (mathContent.match(/(?<!\\)\{/g) || []).length;
    const closeBraces = (mathContent.match(/(?<!\\)\}/g) || []).length;
    if (openBraces > closeBraces) {
      healed += '}'.repeat(openBraces - closeBraces);
    }
    healed += '$$';
    return healed;
  }

  // Remove balanced $$ blocks before checking single $
  const withoutDisplayMath = healed.replace(/\$\$[\s\S]*?\$\$/g, '');
  // Match single $ not preceded by a backslash
  const singleDollarMatches = withoutDisplayMath.match(/(?<!\\)\$/g);
  if (singleDollarMatches && singleDollarMatches.length % 2 === 1) {
    // Find the last single, unescaped '$' that is not part of '$$'
    let lastSingleDollarIdx = -1;
    for (let i = healed.length - 1; i >= 0; i--) {
      if (healed[i] === '$') {
        const isEscaped = i > 0 && healed[i - 1] === '\\';
        const isDoublePrev = i > 0 && healed[i - 1] === '$';
        const isDoubleNext = i < healed.length - 1 && healed[i + 1] === '$';
        if (!isEscaped && !isDoublePrev && !isDoubleNext) {
          lastSingleDollarIdx = i;
          break;
        }
      }
    }

    if (lastSingleDollarIdx !== -1) {
      const mathContent = healed.slice(lastSingleDollarIdx + 1);
      const openBraces = (mathContent.match(/(?<!\\)\{/g) || []).length;
      const closeBraces = (mathContent.match(/(?<!\\)\}/g) || []).length;
      if (openBraces > closeBraces) {
        healed += '}'.repeat(openBraces - closeBraces);
      }
      healed += '$';
      return healed;
    }
  }

  return healed;
}

/**
 * Replaces unicode Dirac brackets and Bell state notation with LaTeX equivalents.
 * In plain text (wrapInMath=true), wrap in $...$ so KaTeX parses them.
 * Inside math mode (wrapInMath=false), omit $ delimiters.
 */
function replaceDiracSymbols(text: string, wrapInMath: boolean): string {
  const wrap = (tex: string) => (wrapInMath ? `$${tex}$` : tex);

  return text
    // Bell states and Greek kets
    .replace(/\|[Φφ](\+|⁺)⟩/g, wrap('|\\Phi^+\\rangle'))
    .replace(/\|[Φφ](-|⁻)⟩/g, wrap('|\\Phi^-\\rangle'))
    .replace(/\|[Ψψ](\+|⁺)⟩/g, wrap('|\\Psi^+\\rangle'))
    .replace(/\|[Ψψ](-|⁻)⟩/g, wrap('|\\Psi^-\\rangle'))
    .replace(/\|[Φφ]⟩/g, wrap('|\\Phi\\rangle'))
    .replace(/\|[Ψψ]⟩/g, wrap('|\\Psi\\rangle'))
    // Plus / Minus states
    .replace(/\|\+⟩/g, wrap('|+\\rangle'))
    .replace(/\|-⟩/g, wrap('|-\\rangle'))
    // Computational basis kets (e.g. |0⟩, |1⟩, |00⟩, |11⟩, |01⟩, |10⟩)
    .replace(/\|([01]+)⟩/g, (_, bits) => wrap(`|${bits}\\rangle`))
    // Bras (e.g. ⟨0|, ⟨1|, ⟨00|, ⟨11|)
    .replace(/⟨([01]+)\|/g, (_, bits) => wrap(`\\langle ${bits}|`))
    .replace(/⟨\+\|/g, wrap('\\langle +|'))
    .replace(/⟨-\|/g, wrap('\\langle -|'))
    .replace(/⟨[Φφ](\+|⁺)\|/g, wrap('\\langle\\Phi^+|'))
    .replace(/⟨[Ψψ](\+|⁺)\|/g, wrap('\\langle\\Psi^+|'));
}

/**
 * Normalizes LaTeX delimiters (\(...\) and \[...\]) and unicode Dirac brackets to standard KaTeX format.
 * Also heals unclosed delimiters resulting from token truncation.
 */
export function normalizeLatexDelimiters(raw: string): string {
  if (!raw) return '';
  let normalized = raw
    .replace(/\\\[([\s\S]*?)\\\]/g, '$$$$$1$$$$')
    .replace(/\\\(([\s\S]*?)\\\)/g, '$$$1$$');

  // Split into math segments ($$...$$ or $...$) and plain text segments
  const segments = normalized.split(/(\$\$[\s\S]+?\$\$|\$[^\$\n]+?\$)/g);
  const processed = segments.map((segment) => {
    const isDisplayMath = segment.startsWith('$$') && segment.endsWith('$$') && segment.length >= 4;
    const isInlineMath = segment.startsWith('$') && segment.endsWith('$') && segment.length >= 2;
    if (isDisplayMath) {
      const inner = segment.slice(2, -2);
      return `$$${replaceDiracSymbols(inner, false)}$$`;
    }
    if (isInlineMath) {
      const inner = segment.slice(1, -1);
      return `$${replaceDiracSymbols(inner, false)}$`;
    }
    return replaceDiracSymbols(segment, true);
  });

  return healUnclosedLatex(processed.join(''));
}

/**
 * Robust helper to render text with KaTeX math notation ($...$ and $$...$$), bold markdown, and code blocks.
 */
export function renderMathText(text: string): React.ReactNode {
  if (!text) return null;
  const normalized = normalizeLatexDelimiters(text);
  const parts = normalized.split(/(\$\$[\s\S]+?\$\$|\$[^\$\n]+?\$)/g);

  return parts.map((part, index) => {
    if (part.startsWith('$$') && part.endsWith('$$') && part.length >= 4) {
      const latex = part.slice(2, -2).trim();
      try {
        const html = katex.renderToString(latex, { displayMode: true, throwOnError: false });
        return (
          <span
            key={index}
            className="block my-2 overflow-x-auto text-accent text-xs font-mono bg-raised/30 p-2 rounded border border-line"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        );
      } catch {
        return <span key={index} className="font-mono text-xs">{part}</span>;
      }
    }
    if (part.startsWith('$') && part.endsWith('$') && part.length >= 2) {
      const latex = part.slice(1, -1).trim();
      try {
        const html = katex.renderToString(latex, { displayMode: false, throwOnError: false });
        return (
          <span
            key={index}
            className="text-accent font-mono px-0.5"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        );
      } catch {
        return <span key={index} className="font-mono text-xs">{part}</span>;
      }
    }

    const lines = part.split('\n\n');
    return (
      <span key={index}>
        {lines.map((paragraph, pIdx) => {
          const codeParts = paragraph.split(/(`[^`]+?`)/g);
          return (
            <span key={pIdx} className={pIdx > 0 ? 'block mt-2' : ''}>
              {codeParts.map((cp, cIdx) => {
                if (cp.startsWith('`') && cp.endsWith('`')) {
                  return (
                    <code
                      key={cIdx}
                      className="px-1.5 py-0.5 mx-0.5 rounded bg-raised border border-line text-accent font-mono text-[11px]"
                    >
                      {cp.slice(1, -1)}
                    </code>
                  );
                }
                const boldParts = cp.split(/(\*\*[^\*]+?\*\*)/g);
                return (
                  <React.Fragment key={cIdx}>
                    {boldParts.map((bp, bIdx) => {
                      if (bp.startsWith('**') && bp.endsWith('**')) {
                        return (
                          <strong key={bIdx} className="text-ink font-semibold">
                            {bp.slice(2, -2)}
                          </strong>
                        );
                      }
                      return bp;
                    })}
                  </React.Fragment>
                );
              })}
            </span>
          );
        })}
      </span>
    );
  });
}
