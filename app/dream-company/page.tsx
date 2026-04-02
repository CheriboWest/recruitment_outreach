'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, ArrowRight, Building2, RefreshCw, ChevronDown, ChevronUp, Zap
} from 'lucide-react';
import WizardProgress from '@/components/WizardProgress';
import TerminalLoader from '@/components/TerminalLoader';
import CopyButton from '@/components/CopyButton';
import type { DreamCompanyInput, ProfileAnalysis, CompanyMatrix, TargetRole, RoadmapPhase } from '@/types';

const WIZARD_STEPS = ['Education', 'Experience', 'Skills', 'Interests', 'Salary', 'Location'];

const EMPTY_FORM: DreamCompanyInput = {
  degree: '',
  workExperience: '',
  skills: '',
  interests: '',
  targetSalary: '',
  location: '',
};

interface Results {
  profileAnalysis?: ProfileAnalysis;
  companyMatrix?: CompanyMatrix;
  targetRoles?: TargetRole[];
  careerRoadmap?: RoadmapPhase[];
}

function parseSection(text: string): unknown {
  try {
    // Remove any stray markdown
    const clean = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(clean);
  } catch {
    return null;
  }
}

export default function DreamCompanyPage() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<DreamCompanyInput>(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [loadingDone, setLoadingDone] = useState(false);
  const [results, setResults] = useState<Results>({});
  const [sectionBuffers, setSectionBuffers] = useState<Record<string, string>>({});
  const [expandedRoadmap, setExpandedRoadmap] = useState<number | null>(0);
  const [error, setError] = useState<string | null>(null);

  const updateForm = (key: keyof DreamCompanyInput, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const canProceed = () => {
    const values = [
      form.degree, form.workExperience, form.skills,
      form.interests, form.targetSalary, form.location
    ];
    return values[step]?.trim().length > 0;
  };

  const handleSubmit = useCallback(async () => {
    setLoading(true);
    setLogs([]);
    setLoadingDone(false);
    setResults({});
    setSectionBuffers({});
    setError(null);

    const localBuffers: Record<string, string> = {};
    let currentSection = '';

    try {
      const response = await fetch('/api/dream-company', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          degree: form.degree,
          workExperience: form.workExperience,
          skills: form.skills,
          interests: form.interests,
          targetSalary: form.targetSalary,
          location: form.location,
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
              currentSection = event.section;
              localBuffers[event.section] = '';
            } else if (event.type === 'chunk') {
              localBuffers[event.section] = (localBuffers[event.section] || '') + event.text;
              setSectionBuffers({ ...localBuffers });
            } else if (event.type === 'section_end') {
              const parsed = parseSection(localBuffers[event.section] || '');
              if (parsed) {
                if (event.section === 'profile') {
                  setResults(prev => ({ ...prev, profileAnalysis: parsed as ProfileAnalysis }));
                } else if (event.section === 'companies') {
                  setResults(prev => ({ ...prev, companyMatrix: parsed as CompanyMatrix }));
                } else if (event.section === 'roles') {
                  setResults(prev => ({ ...prev, targetRoles: parsed as TargetRole[] }));
                } else if (event.section === 'roadmap') {
                  setResults(prev => ({ ...prev, careerRoadmap: parsed as RoadmapPhase[] }));
                }
              }
            } else if (event.type === 'done') {
              setLoadingDone(true);
              // Save session
              fetch('/api/save-session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  tool_used: 'dream-company',
                  degree: form.degree,
                  work_experience: form.workExperience,
                  skills: form.skills,
                  interests: form.interests,
                  target_salary: form.targetSalary,
                  location: form.location,
                  generated_companies: parseSection(localBuffers['companies'] || '') || {},
                  generated_roles: parseSection(localBuffers['roles'] || '') || [],
                  career_roadmap: parseSection(localBuffers['roadmap'] || '') || [],
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

  const isShowingResults = loadingDone || Object.keys(results).length > 0;
  const isShowingLoader = loading || (logs.length > 0 && !loadingDone);

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
            <span className="text-sm font-semibold text-[#0F172A]">Dream Company Finder</span>
          </div>
          <div className="w-16" />
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-10">
        {/* Wizard (show when not loading/results) */}
        {!isShowingLoader && !isShowingResults && (
          <>
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-[#0F172A] mb-2">Dream Company Finder</h1>
              <p className="text-[#64748B]">Tell us about yourself — we&apos;ll build your personalised company hit-list.</p>
            </div>

            <WizardProgress steps={WIZARD_STEPS} currentStep={step} />

            <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-8">
              {step === 0 && (
                <WizardField
                  label="Degree / Education"
                  hint="e.g. BSc Computer Science, University of Manchester, 2:1 (2024)"
                  value={form.degree}
                  onChange={v => updateForm('degree', v)}
                  type="text"
                  placeholder="Your degree, university, and grade"
                />
              )}
              {step === 1 && (
                <WizardField
                  label="Work Experience"
                  hint="Include internships, part-time, projects. Be specific — company names, roles, outputs."
                  value={form.workExperience}
                  onChange={v => updateForm('workExperience', v)}
                  type="textarea"
                  placeholder="e.g. 6-month internship at Deloitte in audit. Part-time analyst at startup. Built and launched a SaaS product with 200 users..."
                />
              )}
              {step === 2 && (
                <WizardField
                  label="Skills"
                  hint="Technical and soft skills. The more specific, the better."
                  value={form.skills}
                  onChange={v => updateForm('skills', v)}
                  type="text"
                  placeholder="e.g. Python, SQL, Excel, financial modelling, stakeholder management, project delivery"
                />
              )}
              {step === 3 && (
                <WizardField
                  label="Interests & Passions"
                  hint="Industries, problem spaces, or causes you genuinely care about."
                  value={form.interests}
                  onChange={v => updateForm('interests', v)}
                  type="text"
                  placeholder="e.g. fintech, sustainability, consumer brands, healthcare innovation"
                />
              )}
              {step === 4 && (
                <WizardField
                  label="Desired Salary"
                  hint="Being specific helps us target the right tier of companies."
                  value={form.targetSalary}
                  onChange={v => updateForm('targetSalary', v)}
                  type="text"
                  placeholder="e.g. £28,000–£35,000, or £40k+"
                />
              )}
              {step === 5 && (
                <WizardField
                  label="Preferred Location"
                  hint="City, region, or remote preference."
                  value={form.location}
                  onChange={v => updateForm('location', v)}
                  type="text"
                  placeholder="e.g. London, Manchester, Remote, Open to relocation"
                />
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
                    Generate Strategy
                    <Zap size={15} />
                  </button>
                )}
              </div>
            </div>
          </>
        )}

        {/* Loading state */}
        {isShowingLoader && !loadingDone && (
          <div className="text-center">
            <h2 className="text-2xl font-bold text-[#0F172A] mb-2">Building your strategy...</h2>
            <p className="text-[#64748B] mb-8">Our AI is working through 4 analysis chains. This takes about 30–60 seconds.</p>
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
          <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-[#0F172A]">Your Career Strategy</h2>
                <p className="text-[#64748B] text-sm mt-1">Personalised analysis based on your profile</p>
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
                  Regenerate
                </button>
              </div>
            </div>

            {/* Profile Analysis */}
            {results.profileAnalysis && (
              <ResultCard title="Profile Analysis" subtitle="Your market positioning">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="bg-[#0F172A] rounded-xl p-4">
                    <div className="text-[#64748B] text-xs font-semibold uppercase tracking-wide mb-1">Market Level</div>
                    <div className="text-[#F59E0B] text-lg font-bold">{results.profileAnalysis.marketLevel}</div>
                  </div>
                  <div className="bg-[#F8FAFC] rounded-xl p-4">
                    <div className="text-[#64748B] text-xs font-semibold uppercase tracking-wide mb-2">Assessment</div>
                    <p className="text-[#0F172A] text-sm leading-relaxed">{results.profileAnalysis.assessment}</p>
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4 mt-4">
                  <div>
                    <div className="text-[#64748B] text-xs font-semibold uppercase tracking-wide mb-2">Top Strengths</div>
                    <ul className="space-y-1.5">
                      {results.profileAnalysis.strengths.map((s, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-[#0F172A]">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#10B981] mt-1.5 shrink-0" />
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <div className="text-[#64748B] text-xs font-semibold uppercase tracking-wide mb-2">Key Gaps</div>
                    <ul className="space-y-1.5">
                      {results.profileAnalysis.gaps.map((g, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-[#0F172A]">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#F59E0B] mt-1.5 shrink-0" />
                          {g}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </ResultCard>
            )}

            {/* Company Matrix */}
            {results.companyMatrix && (
              <ResultCard title="Target Company Matrix" subtitle="20 companies across 3 tiers">
                <div className="space-y-5">
                  {[
                    { key: 'tier1' as const, label: 'Tier 1 — Aspirational', color: 'bg-purple-50 border-purple-200 text-purple-700', dot: 'bg-purple-400' },
                    { key: 'tier2' as const, label: 'Tier 2 — Sweet Spot', color: 'bg-blue-50 border-blue-200 text-blue-700', dot: 'bg-blue-400' },
                    { key: 'tier3' as const, label: 'Tier 3 — High Probability', color: 'bg-green-50 border-green-200 text-green-700', dot: 'bg-green-400' },
                  ].map(({ key, label, color, dot }) => (
                    <div key={key}>
                      <div className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border mb-3 ${color}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${dot}`} />
                        {label}
                      </div>
                      <div className="space-y-2">
                        {results.companyMatrix![key].map((company, i) => (
                          <div key={i} className="flex items-start gap-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-4 py-3">
                            <div className="w-8 h-8 bg-[#0F172A] rounded-lg flex items-center justify-center shrink-0">
                              <Building2 size={14} className="text-[#F59E0B]" />
                            </div>
                            <div>
                              <div className="font-semibold text-[#0F172A] text-sm">{company.name}</div>
                              <div className="text-[#64748B] text-xs mt-0.5">{company.reason}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </ResultCard>
            )}

            {/* Target Roles */}
            {results.targetRoles && (
              <ResultCard title="Target Roles" subtitle="10 job titles to pursue">
                <div className="space-y-2">
                  {results.targetRoles.map((role, i) => (
                    <div key={i} className="flex items-start gap-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-4 py-3">
                      <div className="text-[#94A3B8] text-sm font-mono w-5 shrink-0">{String(i + 1).padStart(2, '0')}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-[#0F172A] text-sm">{role.title}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            role.level === 'Senior' ? 'bg-purple-100 text-purple-700' :
                            role.level === 'Mid' ? 'bg-blue-100 text-blue-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            {role.level}
                          </span>
                        </div>
                        <div className="text-[#64748B] text-xs mt-0.5">{role.reason}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </ResultCard>
            )}

            {/* Career Roadmap */}
            {results.careerRoadmap && (
              <ResultCard title="Career Roadmap" subtitle="Your 5-year strategic plan">
                <div className="space-y-3">
                  {results.careerRoadmap.map((phase, i) => (
                    <div key={i} className="border border-[#E2E8F0] rounded-xl overflow-hidden">
                      <button
                        className="w-full flex items-center justify-between px-4 py-3.5 bg-[#F8FAFC] hover:bg-[#F1F5F9] transition-colors"
                        onClick={() => setExpandedRoadmap(expandedRoadmap === i ? null : i)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 bg-[#0F172A] text-[#F59E0B] rounded-lg flex items-center justify-center text-xs font-bold">
                            {i + 1}
                          </div>
                          <div className="text-left">
                            <div className="font-semibold text-[#0F172A] text-sm">{phase.phase}</div>
                            <div className="text-[#64748B] text-xs">{phase.timeframe}</div>
                          </div>
                        </div>
                        {expandedRoadmap === i ? <ChevronUp size={16} className="text-[#64748B]" /> : <ChevronDown size={16} className="text-[#64748B]" />}
                      </button>

                      {expandedRoadmap === i && (
                        <div className="px-4 py-4 grid sm:grid-cols-3 gap-4 border-t border-[#E2E8F0]">
                          <div>
                            <div className="text-[#64748B] text-xs font-semibold uppercase tracking-wide mb-2">Key Actions</div>
                            <ul className="space-y-1.5">
                              {phase.actions.map((a, j) => (
                                <li key={j} className="flex items-start gap-2 text-xs text-[#0F172A]">
                                  <div className="w-1 h-1 rounded-full bg-[#0F172A] mt-1.5 shrink-0" />
                                  {a}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <div className="text-[#64748B] text-xs font-semibold uppercase tracking-wide mb-2">Skills to Build</div>
                            <ul className="space-y-1.5">
                              {phase.skills.map((s, j) => (
                                <li key={j} className="flex items-start gap-2 text-xs text-[#0F172A]">
                                  <div className="w-1 h-1 rounded-full bg-[#10B981] mt-1.5 shrink-0" />
                                  {s}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <div className="text-[#64748B] text-xs font-semibold uppercase tracking-wide mb-2">Strategic Moves</div>
                            <ul className="space-y-1.5">
                              {phase.strategicMoves.map((m, j) => (
                                <li key={j} className="flex items-start gap-2 text-xs text-[#0F172A]">
                                  <div className="w-1 h-1 rounded-full bg-[#F59E0B] mt-1.5 shrink-0" />
                                  {m}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </ResultCard>
            )}

            {/* Loading partial results hint */}
            {loading && !loadingDone && (
              <TerminalLoader messages={logs} isComplete={false} />
            )}

            {loadingDone && (
              <div className="text-center py-4">
                <Link
                  href="/outreach"
                  className="inline-flex items-center gap-2 bg-[#F59E0B] text-[#0F172A] font-bold px-6 py-3 rounded-xl hover:bg-[#D97706] transition-colors"
                >
                  Now generate your outreach messages
                  <ArrowRight size={16} />
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function WizardField({
  label, hint, value, onChange, type, placeholder
}: {
  label: string;
  hint: string;
  value: string;
  onChange: (v: string) => void;
  type: 'text' | 'textarea';
  placeholder: string;
}) {
  return (
    <div>
      <label className="block text-lg font-bold text-[#0F172A] mb-1">{label}</label>
      <p className="text-[#64748B] text-sm mb-4">{hint}</p>
      {type === 'textarea' ? (
        <textarea
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          rows={5}
          className="w-full border border-[#E2E8F0] rounded-xl px-4 py-3 text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#0F172A]/20 focus:border-[#0F172A] resize-none bg-white transition-all"
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full border border-[#E2E8F0] rounded-xl px-4 py-3 text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#0F172A]/20 focus:border-[#0F172A] bg-white transition-all"
        />
      )}
    </div>
  );
}

function ResultCard({
  title, subtitle, children
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-[#E2E8F0] rounded-2xl overflow-hidden">
      <div className="px-6 py-4 border-b border-[#E2E8F0] bg-[#F8FAFC] flex items-center justify-between">
        <div>
          <h3 className="font-bold text-[#0F172A]">{title}</h3>
          <p className="text-[#64748B] text-xs mt-0.5">{subtitle}</p>
        </div>
      </div>
      <div className="p-6">
        {children}
      </div>
    </div>
  );
}
