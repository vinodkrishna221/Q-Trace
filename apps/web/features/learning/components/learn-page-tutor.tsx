'use client';

import * as React from 'react';
import { MessageCircle, X, Send, Loader2, Bot, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api-client';
import { useRoleStore } from '@/lib/role-store';

// ─── Page context definitions ─────────────────────────────────────────────────

export interface LearnPageContext {
  pageName: string;
  moduleId: string;
  concepts: string;
  formulas: string;
  steps: string;
  fallbackAnswers: Record<string, string>;
}

export const ORACLE_PAGE_CONTEXT: LearnPageContext = {
  pageName: 'Phase Oracle & Toffoli Gate (CCX)',
  moduleId: 'mod_oracle',
  concepts:
    'Phase Oracle, quantum phase kickback, U_ω operator, Toffoli gate (CCX), phase flip, superposition, Grover\'s algorithm oracle step, marked state |101⟩',
  formulas:
    'U_ω|x⟩ = (-1)^{f(x)}|x⟩  where f(x)=1 only for the marked state. The oracle flips sign (phase) of the marked amplitude.',
  steps:
    'Step 1: 3D chest ring — 8 chests in superposition, oracle phase-flips |101⟩. Step 2: Formula decoder — U_ω, |x⟩, (-1)^{f(x)} clickable explanations. Step 3: Phase Inversion Mirror — visual amplitude sign flip. Step 4: CCX Gate Simulator — Toffoli gate that implements the oracle.',
  fallbackAnswers: {
    default:
      'On this page you\'re learning about the **Phase Oracle** — the quantum gate U_ω that secretly marks the target state |101⟩ by flipping its amplitude sign from +1/√8 to -1/√8.\n\nThe key insight: measurement probability = |amplitude|² so the sign cancels out. The mark is **completely invisible** until the Diffusion operator runs next and amplifies it.',
    'u_ω|uω|oracle|u_omega':
      '**U_ω** (the phase oracle) is defined as: U_ω|x⟩ = (-1)^{f(x)}|x⟩\n\nWhere f(x) = 1 only for the marked state x = |101⟩, and f(x) = 0 for all other states.\n\nEffect: the amplitude of |101⟩ gets multiplied by -1 (sign flip). All other states are untouched. Because probability ∝ |amplitude|², this sign change is invisible to measurement!',
    'phase|kickback|flip':
      '**Phase kickback** is the mechanism by which the oracle imprints a phase of -1 onto the marked state.\n\nWhen you apply CCX (Toffoli) with the ancilla qubit in |−⟩ = (|0⟩-|1⟩)/√2, the control qubits pick up a phase of -1 when the control pattern matches — this is the "kickback". The ancilla returns to |−⟩ unchanged, while the control register carries the phase mark.',
    'ccx|toffoli|gate':
      '**CCX (Toffoli gate)** is a 3-qubit controlled gate: it flips the target qubit only when BOTH control qubits are |1⟩.\n\nIn the oracle circuit:\n1. X gate flips q[1] (so pattern |1,0,1⟩ → |1,1,1⟩)\n2. CCX fires on |1,1,1⟩ and phase-flips via the ancilla\n3. X gate restores q[1]\n\nNet result: only |101⟩ gets phase -1.',
    'measure|measurement|visible|invisible':
      'After the oracle, if you measure immediately you\'ll see a **uniform distribution** — each of the 8 states has probability 1/8 = 12.5%.\n\nWhy? Measurement probability = |amplitude|² and (-1/√8)² = (1/√8)² = 1/8. The sign cancels!\n\nThe phase mark only becomes useful after the **Diffusion operator** reflects amplitudes about their mean, turning phase difference into probability difference.',
    'superposition|equal':
      'Before the oracle, Grover\'s algorithm puts all qubits into **equal superposition** using Hadamard gates:\n\n|ψ⟩ = (1/√8)(|000⟩ + |001⟩ + |010⟩ + |011⟩ + |100⟩ + |101⟩ + |110⟩ + |111⟩)\n\nEvery state has amplitude 1/√8 ≈ 0.354. The oracle then flips only |101⟩ to -1/√8.',
    'hi|hello|hey|help':
      'Hi! I\'m your **Oracle AI Tutor** 🔮\n\nI know everything on this page about the Phase Oracle (U_ω), Toffoli gate (CCX), phase kickback, and how the oracle marks state |101⟩.\n\nAsk me anything — like:\n• "What does U_ω mean?"\n• "Why is the phase flip invisible?"\n• "How does the CCX gate work?"',
  },
};

export const DIFFUSION_PAGE_CONTEXT: LearnPageContext = {
  pageName: 'Amplitude Amplification & Inversion About the Mean',
  moduleId: 'mod_diffusion',
  concepts:
    'Diffusion operator, amplitude amplification, inversion about the mean, Grover diffusion, reflection, mean amplitude, 2|ψ⟩⟨ψ| - I, convergence, over-rotation',
  formulas:
    'D = 2|ψ⟩⟨ψ| - I  (Grover diffusion operator). Reflection: new amplitude = 2·mean - old_amplitude. After oracle: mean ≈ (N-2)/(N√N). After diffusion: marked state amplitude ≈ (N+2)/(N√N).',
  steps:
    'Step 1: Broken seesaw story — phase flip drops marked amplitude below zero. Step 2: DiffusionAmplitudeVisualizer — bar chart shows amplitudes before/after diffusion. Step 3: DiffusionFormulaDecoder — clickable 2|ψ⟩⟨ψ|-I formula. Step 4: SouffleOverRotationMeter — too many iterations overrotate and reduce probability. Step 5: Diffusion mean scrubber & Grover 2D rotation.',
  fallbackAnswers: {
    default:
      'On this page you\'re learning about the **Diffusion operator** D = 2|ψ⟩⟨ψ| - I.\n\nAfter the oracle phase-flips the marked state, the diffusion operator reflects all amplitudes about their average. This catapults the marked state from 12.5% to ~94.5% probability in √N iterations!',
    'diffusion|operator|2|ψ|mean|inversion':
      '**Diffusion operator** D = 2|ψ⟩⟨ψ| - I performs *inversion about the mean*:\n\n• Compute mean amplitude μ of all N states\n• New amplitude of each state = 2μ - old_amplitude\n\nAfter the oracle, the marked state has amplitude -1/√8 ≈ -0.354 while others have +0.354. Mean ≈ 6×0.354/8 ≈ 0.265.\n\nDiffusion: marked → 2(0.265)-(-0.354) = **+0.884** 🚀\nOthers → 2(0.265)-(0.354) = **+0.177** (reduced)',
    'over.rotation|souffle|too many|iterations|converge':
      '**Over-rotation** happens when you run too many Grover iterations.\n\nGrover\'s works like rotating an angle in 2D state space. Optimal iterations = ⌊π√N/4⌋. For N=8: ≈ 2 iterations.\n\nIf you run 3+ iterations, the marked state amplitude overshoots past 1, "falls off the other side", and probability starts *decreasing* — just like a soufflé that bakes too long!',
    'amplitude|bar|chart|visualiz':
      'The **amplitude bar chart** shows the quantum state as signed bars:\n\n• Before oracle: all 8 bars at +0.354 (uniform superposition)\n• After oracle: |101⟩ bar flips to -0.354, others stay +0.354\n• After diffusion: |101⟩ bar jumps to ~+0.884, others shrink to ~+0.177\n\nProbability = bar_height², so |101⟩ goes from 12.5% → **78%** after one Grover iteration!',
    'reflection|reflect|about|average':
      '**Reflection about the mean** is the geometric picture of diffusion:\n\nImagine all amplitudes as heights on a number line. Draw a horizontal line at their average (mean). Reflect each bar vertically across that line.\n\nBars *above* the mean get pushed down. Bars *below* the mean (the marked state after oracle flip) get pushed UP — dramatically!\n\nThis is why the marked state amplifies after each Grover iteration.',
    'hi|hello|hey|help':
      'Hi! I\'m your **Diffusion AI Tutor** 🌊\n\nI know everything on this page about the Diffusion operator (D = 2|ψ⟩⟨ψ|-I), amplitude amplification, inversion about the mean, and over-rotation.\n\nAsk me anything — like:\n• "How does inversion about the mean work?"\n• "What is over-rotation?"\n• "Why does the marked state grow so fast?"',
  },
};

// ─── Chat message type ────────────────────────────────────────────────────────

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

// ─── Smart client fallback ────────────────────────────────────────────────────

function getContextualFallback(question: string, ctx: LearnPageContext): string {
  const q = question.toLowerCase();
  for (const [keys, answer] of Object.entries(ctx.fallbackAnswers)) {
    if (keys === 'default') continue;
    if (keys.split('|').some((k) => q.includes(k))) return answer;
  }
  return ctx.fallbackAnswers['default'] ?? 'I am here to help! Ask me anything about this page.';
}

// ─── Markdown-lite renderer ───────────────────────────────────────────────────

function renderMarkdown(text: string) {
  // Bold **text**
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    return <span key={i}>{part}</span>;
  });
}

function AssistantMessage({ content }: { content: string }) {
  const lines = content.split('\n');
  return (
    <div className="space-y-1">
      {lines.map((line, i) => {
        if (line.startsWith('• ')) {
          return (
            <div key={i} className="flex gap-1.5 text-xs text-text-secondary leading-relaxed">
              <span className="text-accent mt-0.5">•</span>
              <span>{renderMarkdown(line.slice(2))}</span>
            </div>
          );
        }
        if (line.trim() === '') return <div key={i} className="h-1" />;
        return (
          <p key={i} className="text-xs text-text-secondary leading-relaxed">
            {renderMarkdown(line)}
          </p>
        );
      })}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface LearnPageTutorProps {
  pageContext: LearnPageContext;
}

export function LearnPageTutor({ pageContext }: LearnPageTutorProps) {
  const { activeLearnerProfile } = useRoleStore();
  const [open, setOpen] = React.useState(false);
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [input, setInput] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const bottomRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Scroll to bottom on new messages
  React.useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  // Focus input when opened
  React.useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 150);
  }, [open]);

  const sendMessage = React.useCallback(async () => {
    const question = input.trim();
    if (!question || loading) return;

    const userMsg: ChatMessage = { role: 'user', content: question };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const history = messages.map((m) => ({ role: m.role, content: m.content }));

      // Inject page context as a system-framing prefix on the question
      const contextualQuestion = `[Context: You are a tutor for the "${pageContext.pageName}" learn page. Key concepts: ${pageContext.concepts}. Formulas shown: ${pageContext.formulas}. Page steps: ${pageContext.steps}. Answer only questions about this page's content.]\n\nStudent question: ${question}`;

      const res = await apiClient.askTutorChat({
        learnerProfileId: activeLearnerProfile?.id ?? 'lp_demo_alice',
        question: contextualQuestion,
        moduleId: pageContext.moduleId,
        history,
        learnerRole: 'PHYSICS_TO_CODE',
      });

      const assistantMsg: ChatMessage = {
        role: 'assistant',
        content: res.data.answer,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      // Contextual client-side fallback
      const fallback = getContextualFallback(question, pageContext);
      setMessages((prev) => [...prev, { role: 'assistant', content: fallback }]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, messages, pageContext, activeLearnerProfile]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const suggestionQuestions = React.useMemo(() => {
    if (pageContext.moduleId === 'mod_oracle') {
      return ['What does U_ω mean?', 'Why is the phase flip invisible?', 'How does CCX work?'];
    }
    return ['How does inversion about the mean work?', 'What is over-rotation?', 'Explain D = 2|ψ⟩⟨ψ| - I'];
  }, [pageContext.moduleId]);

  return (
    <>
      {/* ── Floating Trigger Button ── */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Open AI Tutor"
        className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full shadow-lg px-4 py-2.5 text-xs font-mono font-semibold transition-all duration-200 select-none
          ${open
            ? 'bg-accent text-white pr-3'
            : 'bg-surface border border-border-subtle text-text-primary hover:border-accent hover:text-accent'
          }`}
      >
        {open ? (
          <>
            <ChevronDown className="w-4 h-4" />
            <span>Hide Tutor</span>
          </>
        ) : (
          <>
            <Bot className="w-4 h-4" />
            <span>Ask AI Tutor</span>
          </>
        )}
      </button>

      {/* ── Chat Drawer ── */}
      {open && (
        <div
          className="fixed bottom-[4.5rem] right-6 z-50 w-[360px] max-w-[calc(100vw-1.5rem)] flex flex-col rounded-xl border border-border-subtle bg-surface shadow-xl"
          style={{ maxHeight: '520px' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border-subtle bg-surface-raised/50 rounded-t-xl">
            <div className="flex items-center gap-2">
              <Bot className="w-4 h-4 text-accent" />
              <span className="text-xs font-mono font-semibold text-text-primary">AI Page Tutor</span>
              <span className="text-[10px] font-mono text-text-muted bg-surface-sunken px-1.5 py-0.5 rounded">
                {pageContext.moduleId === 'mod_oracle' ? 'Oracle' : pageContext.pageName.split(' ').slice(0, 2).join(' ')}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-text-muted hover:text-text-primary transition-colors"
              aria-label="Close tutor"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-0" style={{ maxHeight: '340px' }}>
            {messages.length === 0 && (
              <div className="space-y-3">
                <p className="text-xs text-text-muted font-mono text-center py-2">
                  I know everything on this page. Ask anything! 🔮
                </p>
                <div className="space-y-1.5">
                  {suggestionQuestions.map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => {
                        setInput(q);
                        setTimeout(() => inputRef.current?.focus(), 50);
                      }}
                      className="w-full text-left text-xs px-3 py-2 rounded-lg border border-border-subtle bg-surface-raised/40 text-text-secondary hover:border-accent hover:text-text-primary transition-colors font-mono"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && (
                  <div className="w-5 h-5 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Bot className="w-3 h-3 text-accent" />
                  </div>
                )}
                <div
                  className={`max-w-[85%] rounded-xl px-3 py-2 ${
                    msg.role === 'user'
                      ? 'bg-accent text-white text-xs font-sans'
                      : 'bg-surface-raised border border-border-subtle'
                  }`}
                >
                  {msg.role === 'user' ? (
                    <p className="text-xs leading-relaxed">{msg.content}</p>
                  ) : (
                    <AssistantMessage content={msg.content} />
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-2 justify-start">
                <div className="w-5 h-5 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-3 h-3 text-accent" />
                </div>
                <div className="bg-surface-raised border border-border-subtle rounded-xl px-3 py-2">
                  <Loader2 className="w-3.5 h-3.5 text-text-muted animate-spin" />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="px-3 py-3 border-t border-border-subtle bg-surface-raised/30 rounded-b-xl">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about this page…"
                disabled={loading}
                className="flex-1 text-xs font-mono bg-surface border border-border-subtle rounded-lg px-3 py-2 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all disabled:opacity-50"
              />
              <Button
                size="sm"
                onClick={sendMessage}
                disabled={!input.trim() || loading}
                className="h-8 w-8 p-0 rounded-lg bg-accent text-white hover:bg-accent/90 disabled:opacity-40"
                aria-label="Send"
              >
                <Send className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
