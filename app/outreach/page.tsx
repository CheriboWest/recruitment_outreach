'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, MessageSquare, RefreshCw, Zap, Mail, Users, Linkedin } from 'lucide-react';
import WizardProgress from '@/components/WizardProgress';
import TerminalLoader from '@/components/TerminalLoader';
import CopyButton from '@/components/CopyButton';
import type { OutreachInput } from '@/types';

const WIZARD_STEPS = ['Target Role', 'Target Company', 'Your Profile'];

const EMPTY_FORM: OutreachInput = {
  targetRole: '',
  targetCompany: '',
  linkedinInput: '',
};

interface OutreachResults {
  linkedinDM?: string;
  networkingEmail?: string;
  recruiterMessage?: string;
}

export default function OutreachPage() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<OutreachInput>(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [loadingDone, setLoadingDone] = useState(false);
  const [results, setResults] = useState<OutreachResults>({});
  const [error, setError] = useState<string | null>(null);

  const updateForm = (key: keyof OutreachInput, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const canProceed = () => {
    const values = [form.targetRole, form.targetCompany, form.linkedinInput];
    return values[step]?.trim().length > 0;
  };

  const handleSubmit = useCallback(async () => {
    setLoading(true);
    setLogs([]);
    setLoadingDone(false);
    setResults({});
    setError(null);

    const localBuffers: Record<string, string> = {};

    try {
      const response = await fetch('/api/outreach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetRole: form.targetRole,
          targetCompany: form.targetCompany,
          linkedinInput: form.linkedinInput,
        }),
      });

      if (!response.body) throw new Error('No response body');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const event = JSON.parse(line);

            if (event.type === 'status') {
              setLogs(prev => [...prev, event.message]);
            } else if (event.type === 'section_start') {
              localBuffers[event.section] = '';
            } else if (event.type === 'chunk') {
              localBuffers[event.section] = (localBuffers[event.section] || '') + event.text;
              // Update results progressively for the visible sections
              if (event.section === 'linkedin') {
                setResults(prev => ({ ...prev, linkedinDM: localBuffers['linkedin'] }));
              } else if (event.section === 'email') {
                setResults(prev => ({ ...prev, networkingEmail: localBuffers['email'] }));
              } else if (event.section === 'recruiter') {
                setResults(prev => ({ ...prev, recruiterMessage: localBuffers['recruiter'] }));
              }
            } else if (event.type === 'done') {
              setLoadingDone(true);
              // Save session
              fetch('/api/save-session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  tool_used: 'outreach',
                  target_role: form.targetRole,
                  target_company: form.targetCompany,
                  linkedin_input: form.linkedinInput,
                  outreach_linkedin: localBuffers['linkedin'] || '',
                  outreach_email: localBuffers['email'] || '',
                  outreach_recruiter: localBuffers['recruiter'] || '',
                }),
              }).catch(() => {});
            } else if (event.type === 'error') {
              setError(event.message);
            }
          } catch {
            // skip malformed lines
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }, [form]);

  const handleRegenerate = () => {
    setResults({});
    setLogs([]);
    setLoadingDone(false);
    setError(null);
    handleSubmit();
  };

  const isShowingLoader = loading && !Object.values(results).some(v => v && v.length > 50);
  const isShowingResults = Object.values(results).some(v => v && v.length > 0);

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b border-[#E2E8F0] px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-[#64748B] hover:text-[#0F172A] transition-colors">
            <ArrowLeft size={16} />
            <span className="text-sm font-medium">Back</span>
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-[#0F172A] rounded-lg flex items-center justify-center">
              <Zap size={13} className="text-[#F59E0B]" />
            </div>
            <span className="text-sm font-semibold text-[#0F172A]">Outreach Generator</span>
          </div>
          <div className="w-16" />
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-10">

        {/* Wizard */}
        {!isShowingLoader && !isShowingResults && (
          <>
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-[#0F172A] mb-2">Recruitment Outreach Generator</h1>
              <p className="text-[#64748B]">3 inputs. 3 personalised outreach scripts. Ready in under a minute.</p>
            </div>

            <WizardProgress steps={WIZARD_STEPS} currentStep={step} />

            <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-8">
              {step === 0 && (
                <div>
                  <label className="block text-lg font-bold text-[#0F172A] mb-1">Target Role</label>
                  <p className="text-[#64748B] text-sm mb-4">The specific job title you&apos;re going after.</p>
                  <input
                    type="text"
                    value={form.targetRole}
                    onChange={e => updateForm('targetRole', e.target.value)}
                    placeholder="e.g. Product Manager, Software Engineer, Marketing Analyst"
                    className="w-full border border-[#E2E8F0] rounded-xl px-4 py-3 text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#0F172A]/20 focus:border-[#0F172A] bg-white transition-all"
                  />
                </div>
              )}

              {step === 1 && (
                <div>
                  <label className="block text-lg font-bold text-[#0F172A] mb-1">Target Company</label>
                  <p className="text-[#64748B] text-sm mb-4">The specific company you&apos;re reaching out to.</p>
                  <input
                    type="text"
                    value={form.targetCompany}
                    onChange={e => updateForm('targetCompany', e.target.value)}
                    placeholder="e.g. Google, Monzo, Deloitte, Goldman Sachs"
                    className="w-full border border-[#E2E8F0] rounded-xl px-4 py-3 text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#0F172A]/20 focus:border-[#0F172A] bg-white transition-all"
                  />
                </div>
              )}

              {step === 2 && (
                <div>
                  <label className="block text-lg font-bold text-[#0F172A] mb-1">Your LinkedIn / About Section</label>
                  <p className="text-[#64748B] text-sm mb-4">
                    Paste your LinkedIn About section, summary, or key experience. The more you give us,
                    the more personalised your outreach will be.
                  </p>
                  <textarea
                    value={form.linkedinInput}
                    onChange={e => updateForm('linkedinInput', e.target.value)}
                    placeholder="Paste your LinkedIn About section or a summary of your background, experience, and what makes you stand out..."
                    rows={8}
                    className="w-full border border-[#E2E8F0] rounded-xl px-4 py-3 text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#0F172A]/20 focus:border-[#0F172A] resize-none bg-white transition-all"
                  />
                </div>
              )}

              <div className="flex items-center justify-between mt-8">
                <button
                  onClick={() => setStep(s => Math.max(0, s - 1))}
                  disabled={step === 0}
                  className="flex items-center gap-2 text-sm font-medium text-[#64748B] hover:text-[#0F172A] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ArrowLeft size={15} />
                  Back
                </button>

                {step < WIZARD_STEPS.length - 1 ? (
                  <button
                    onClick={() => setStep(s => s + 1)}
                    disabled={!canProceed()}
                    className="flex items-center gap-2 bg-[#0F172A] text-white text-sm font-semibold px-6 py-2.5 rounded-xl hover:bg-[#1e293b] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    Continue
                    <ArrowRight size={15} />
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={!canProceed()}
                    className="flex items-center gap-2 bg-[#F59E0B] text-[#0F172A] text-sm font-bold px-6 py-2.5 rounded-xl hover:bg-[#D97706] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    Generate Outreach
                    <Zap size={15} />
                  </button>
                )}
              </div>
            </div>
          </>
        )}

        {/* Loading state */}
        {isShowingLoader && (
          <div className="text-center">
            <h2 className="text-2xl font-bold text-[#0F172A] mb-2">Crafting your outreach...</h2>
            <p className="text-[#64748B] mb-8">Extracting your profile signals and writing 3 personalised scripts.</p>
            <TerminalLoader messages={logs} isComplete={loadingDone} />
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <p className="text-red-600 text-sm font-medium">[ERROR] {error}</p>
            <button onClick={handleRegenerate} className="mt-2 text-sm text-red-700 underline">Try again</button>
          </div>
        )}

        {/* Results */}
        {isShowingResults && (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-[#0F172A]">Your Outreach Scripts</h2>
                <p className="text-[#64748B] text-sm mt-1">
                  {form.targetRole} → {form.targetCompany}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => { setResults({}); setLogs([]); setLoadingDone(false); setStep(0); }}
                  className="flex items-center gap-1.5 text-sm text-[#64748B] border border-[#E2E8F0] rounded-lg px-3 py-2 hover:border-[#0F172A]/20 transition-colors"
                >
                  <ArrowLeft size={13} />
                  Edit
                </button>
                <button
                  onClick={handleRegenerate}
                  disabled={loading}
                  className="flex items-center gap-1.5 text-sm text-[#0F172A] border border-[#E2E8F0] rounded-lg px-3 py-2 hover:border-[#0F172A]/20 transition-colors disabled:opacity-50"
                >
                  <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
                  Regenerate all
                </button>
              </div>
            </div>

            {/* LinkedIn DM */}
            {results.linkedinDM && (
              <OutreachCard
                icon={<Linkedin size={16} className="text-[#0077B5]" />}
                title="LinkedIn DM"
                badge="Max 120 words"
                badgeColor="bg-blue-50 text-blue-700"
                content={results.linkedinDM}
                loading={loading && !loadingDone && !results.networkingEmail}
                onRegenerate={() => handleRegenerate()}
              />
            )}

            {/* Networking Email */}
            {results.networkingEmail && (
              <OutreachCard
                icon={<Mail size={16} className="text-[#10B981]" />}
                title="Networking Email"
                badge="150–250 words"
                badgeColor="bg-green-50 text-green-700"
                content={results.networkingEmail}
                loading={loading && !loadingDone && !results.recruiterMessage}
                onRegenerate={() => handleRegenerate()}
              />
            )}

            {/* Recruiter Message */}
            {results.recruiterMessage && (
              <OutreachCard
                icon={<Users size={16} className="text-[#8B5CF6]" />}
                title="Recruiter Message"
                badge="Direct & commercial"
                badgeColor="bg-purple-50 text-purple-700"
                content={results.recruiterMessage}
                loading={false}
                onRegenerate={() => handleRegenerate()}
              />
            )}

            {/* Still loading remaining */}
            {loading && !loadingDone && (
              <TerminalLoader messages={logs} isComplete={false} />
            )}

            {loadingDone && (
              <div className="bg-[#F0FDF4] border border-[#BBF7D0] rounded-xl p-4 text-center">
                <p className="text-[#166534] text-sm font-medium">
                  All 3 scripts ready. Copy and personalise as needed.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function OutreachCard({
  icon, title, badge, badgeColor, content, loading, onRegenerate
}: {
  icon: React.ReactNode;
  title: string;
  badge: string;
  badgeColor: string;
  content: string;
  loading: boolean;
  onRegenerate: () => void;
}) {
  return (
    <div className="border border-[#E2E8F0] rounded-2xl overflow-hidden">
      <div className="px-5 py-4 bg-[#F8FAFC] border-b border-[#E2E8F0] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          {icon}
          <span className="font-bold text-[#0F172A] text-sm">{title}</span>
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${badgeColor}`}>{badge}</span>
          {loading && (
            <span className="text-[10px] text-[#64748B] animate-pulse">Writing...</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <CopyButton text={content} />
          <button
            onClick={onRegenerate}
            className="inline-flex items-center gap-1 text-xs text-[#64748B] hover:text-[#0F172A] transition-colors"
          >
            <RefreshCw size={12} />
            Regenerate
          </button>
        </div>
      </div>
      <div className="p-5">
        <div className="text-sm text-[#0F172A] leading-relaxed whitespace-pre-wrap font-[450]">
          {content}
        </div>
      </div>
    </div>
  );
}
