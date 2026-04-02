import Link from 'next/link';
import { Building2, MessageSquare, ArrowRight, Zap, Target, TrendingUp } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b border-[#E2E8F0] px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[#0F172A] rounded-lg flex items-center justify-center">
              <Zap size={16} className="text-[#F59E0B]" />
            </div>
            <div>
              <div className="text-sm font-bold text-[#0F172A] leading-none">Advance Academy</div>
              <div className="text-[10px] text-[#64748B] leading-none mt-0.5">advanceacademy.co.uk</div>
            </div>
          </div>
          <a
            href="https://advanceacademy.co.uk"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-[#64748B] hover:text-[#0F172A] font-medium transition-colors"
          >
            Back to Academy
          </a>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 pt-20 pb-16 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-[#FEF3C7] text-[#92400E] text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
            <Zap size={12} className="text-[#F59E0B]" />
            AI-Powered Career Tools
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold text-[#0F172A] leading-[1.1] tracking-tight mb-6">
            Stop Applying for Jobs.{' '}
            <span className="text-[#F59E0B]">Start Getting Replies.</span>
          </h1>
          <p className="text-lg text-[#64748B] leading-relaxed max-w-2xl mx-auto mb-10">
            Most graduates send hundreds of generic applications and hear nothing back.
            Our AI tools help you identify the right companies and write outreach that
            actually gets responses — from recruiters, hiring managers, and decision-makers.
          </p>

          {/* Stats */}
          <div className="flex items-center justify-center gap-8 mb-12 text-center">
            {[
              { value: '3x', label: 'Higher response rate' },
              { value: '20+', label: 'Target companies' },
              { value: '3', label: 'Outreach formats' },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-2xl font-bold text-[#0F172A]">{stat.value}</div>
                <div className="text-xs text-[#64748B] mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tools */}
      <section className="px-6 pb-24">
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-6">
          {/* Dream Company Finder */}
          <Link href="/dream-company" className="group block">
            <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-8 h-full hover:border-[#0F172A]/20 hover:shadow-lg transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#F59E0B]/5 to-transparent rounded-2xl" />
              <div className="relative">
                <div className="w-12 h-12 bg-[#0F172A] rounded-xl flex items-center justify-center mb-5">
                  <Building2 size={22} className="text-[#F59E0B]" />
                </div>
                <div className="inline-flex items-center gap-1.5 bg-[#0F172A] text-[#F59E0B] text-[10px] font-bold px-2.5 py-1 rounded-full mb-4 uppercase tracking-wide">
                  Feature 1
                </div>
                <h2 className="text-2xl font-bold text-[#0F172A] mb-3">
                  Dream Company Finder
                </h2>
                <p className="text-[#64748B] leading-relaxed mb-6">
                  Tell us your background, skills, and goals. We&apos;ll build a personalised
                  20-company target list across three tiers, identify the best-fit roles,
                  and map out your career roadmap.
                </p>
                <ul className="space-y-2 mb-8">
                  {[
                    { icon: Target, text: 'Profile analysis & market positioning' },
                    { icon: Building2, text: '20 target companies in 3 tiers' },
                    { icon: TrendingUp, text: 'Career roadmap: 0–5 years' },
                  ].map(({ icon: Icon, text }) => (
                    <li key={text} className="flex items-center gap-2.5 text-sm text-[#64748B]">
                      <Icon size={15} className="text-[#10B981] shrink-0" />
                      {text}
                    </li>
                  ))}
                </ul>
                <div className="flex items-center gap-2 text-[#0F172A] font-semibold text-sm group-hover:gap-3 transition-all">
                  Find my target companies
                  <ArrowRight size={16} />
                </div>
              </div>
            </div>
          </Link>

          {/* Outreach Generator */}
          <Link href="/outreach" className="group block">
            <div className="bg-[#0F172A] border border-[#0F172A] rounded-2xl p-8 h-full hover:shadow-lg transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#F59E0B]/10 to-transparent rounded-2xl" />
              <div className="relative">
                <div className="w-12 h-12 bg-[#F59E0B] rounded-xl flex items-center justify-center mb-5">
                  <MessageSquare size={22} className="text-[#0F172A]" />
                </div>
                <div className="inline-flex items-center gap-1.5 bg-white/10 text-[#F59E0B] text-[10px] font-bold px-2.5 py-1 rounded-full mb-4 uppercase tracking-wide">
                  Feature 2
                </div>
                <h2 className="text-2xl font-bold text-white mb-3">
                  Recruitment Outreach Generator
                </h2>
                <p className="text-white/60 leading-relaxed mb-6">
                  Paste your LinkedIn profile and target role. Get three
                  high-converting outreach scripts — LinkedIn DM, networking
                  email, and recruiter message — personalised to you.
                </p>
                <ul className="space-y-2 mb-8">
                  {[
                    { text: 'LinkedIn DM (max 120 words)' },
                    { text: 'Networking email (150–250 words)' },
                    { text: 'Recruiter message (direct & commercial)' },
                  ].map(({ text }) => (
                    <li key={text} className="flex items-center gap-2.5 text-sm text-white/60">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#F59E0B] shrink-0" />
                      {text}
                    </li>
                  ))}
                </ul>
                <div className="flex items-center gap-2 text-[#F59E0B] font-semibold text-sm group-hover:gap-3 transition-all">
                  Generate my outreach
                  <ArrowRight size={16} />
                </div>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#E2E8F0] px-6 py-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-[#0F172A] rounded-md flex items-center justify-center">
              <Zap size={12} className="text-[#F59E0B]" />
            </div>
            <span className="text-sm font-semibold text-[#0F172A]">Advance Academy</span>
          </div>
          <p className="text-xs text-[#94A3B8]">
            © {new Date().getFullYear()} Advance Academy. Helping graduates get hired faster.
          </p>
        </div>
      </footer>
    </div>
  );
}
