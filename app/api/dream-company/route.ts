import { NextRequest } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are an elite career strategist, recruiter, and hiring manager combined. Your outputs must be specific, personalised, human-sounding, and sharp. Avoid all cliches, generic advice, and AI-sounding phrasing. Optimise every output for real-world hiring success and high response rates.`;

function encode(obj: object): string {
  return JSON.stringify(obj) + '\n';
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { degree, workExperience, skills, interests, targetSalary, location } = body;

  const profileSummary = `
Degree/Education: ${degree}
Work Experience: ${workExperience}
Skills: ${skills}
Interests: ${interests}
Desired Salary: ${targetSalary}
Preferred Location: ${location}
`.trim();

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: object) => {
        controller.enqueue(encoder.encode(encode(event)));
      };

      try {
        // Chain 1 — Profile Analysis
        send({ type: 'status', message: '[INFO] Analysing candidate profile...' });
        send({ type: 'section_start', section: 'profile' });

        let profileText = '';
        const profileStream = client.messages.stream({
          model: 'claude-sonnet-4-5',
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: [{
            role: 'user',
            content: `Analyse this candidate profile and provide:
1. Market positioning level (one of: Entry-Level, Mid-Level, Senior, Career-Pivot)
2. Top 5 strengths (specific, not generic)
3. Key gaps or areas to address (honest but constructive)
4. Honest market assessment (2-3 sentences on their realistic position)

Output as JSON with this exact structure:
{
  "marketLevel": "string",
  "strengths": ["string", "string", "string", "string", "string"],
  "gaps": ["string", "string", "string"],
  "assessment": "string"
}

Candidate profile:
${profileSummary}

Return ONLY valid JSON, no markdown code blocks.`
          }]
        });

        for await (const chunk of profileStream) {
          if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
            profileText += chunk.delta.text;
            send({ type: 'chunk', section: 'profile', text: chunk.delta.text });
          }
        }
        send({ type: 'section_end', section: 'profile' });

        // Chain 2 — Company Matrix
        send({ type: 'status', message: '[INFO] Scouting Tier 1 companies...' });
        send({ type: 'status', message: '[INFO] Building company matrix...' });
        send({ type: 'section_start', section: 'companies' });

        let companiesText = '';
        const companiesStream = client.messages.stream({
          model: 'claude-sonnet-4-5',
          max_tokens: 2000,
          system: SYSTEM_PROMPT,
          messages: [{
            role: 'user',
            content: `Based on this candidate profile, generate 20 target companies grouped into three tiers. Be specific and name real companies.

Tiers:
- Tier 1 (Aspirational): Top-name firms, stretch targets — realistic but competitive
- Tier 2 (Sweet Spot): Strong fit, candidate has a genuine shot at
- Tier 3 (High-Probability Entry Points): Near-certain fit, great for building experience

For each company: company name + one specific sentence on why this candidate fits there.

Output as JSON with this exact structure:
{
  "tier1": [{"name": "string", "reason": "string"}, ...],
  "tier2": [{"name": "string", "reason": "string"}, ...],
  "tier3": [{"name": "string", "reason": "string"}, ...]
}

Each tier should have 6-7 companies. Total = 20.

Candidate profile:
${profileSummary}

Profile analysis context:
${profileText}

Return ONLY valid JSON, no markdown code blocks.`
          }]
        });

        for await (const chunk of companiesStream) {
          if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
            companiesText += chunk.delta.text;
            send({ type: 'chunk', section: 'companies', text: chunk.delta.text });
          }
        }
        send({ type: 'section_end', section: 'companies' });

        // Chain 3 — Target Roles
        send({ type: 'status', message: '[INFO] Mapping target roles...' });
        send({ type: 'section_start', section: 'roles' });

        let rolesText = '';
        const rolesStream = client.messages.stream({
          model: 'claude-sonnet-4-5',
          max_tokens: 1200,
          system: SYSTEM_PROMPT,
          messages: [{
            role: 'user',
            content: `Based on this candidate's profile, generate 10 target job titles they should be applying for. Mix of realistic and aspirational.

For each role:
- Job title (specific, not vague)
- Level: Entry / Mid / Senior
- One-line reason it fits this candidate specifically

Output as JSON array:
[
  {"title": "string", "level": "string", "reason": "string"},
  ...
]

Candidate profile:
${profileSummary}

Return ONLY valid JSON array, no markdown code blocks.`
          }]
        });

        for await (const chunk of rolesStream) {
          if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
            rolesText += chunk.delta.text;
            send({ type: 'chunk', section: 'roles', text: chunk.delta.text });
          }
        }
        send({ type: 'section_end', section: 'roles' });

        // Chain 4 — Career Roadmap
        send({ type: 'status', message: '[INFO] Building your career roadmap...' });
        send({ type: 'section_start', section: 'roadmap' });

        const roadmapStream = client.messages.stream({
          model: 'claude-sonnet-4-5',
          max_tokens: 2000,
          system: SYSTEM_PROMPT,
          messages: [{
            role: 'user',
            content: `Build a strategic career roadmap for this candidate across three phases. Be specific — name real tools, certifications, companies, and actions.

Phases:
1. 0–6 months: Immediate priorities, quick wins
2. 6–18 months: Building momentum, levelling up
3. 2–5 years: Career acceleration, strategic positioning

For each phase provide:
- 3-4 key actions (specific and actionable)
- 2-3 skills to develop (specific)
- 1-2 strategic career moves

Output as JSON array:
[
  {
    "phase": "Phase 1",
    "timeframe": "0–6 months",
    "actions": ["string", ...],
    "skills": ["string", ...],
    "strategicMoves": ["string", ...]
  },
  ...
]

Candidate profile:
${profileSummary}

Companies targeting: ${companiesText.slice(0, 500)}
Target roles: ${rolesText.slice(0, 500)}

Return ONLY valid JSON array, no markdown code blocks.`
          }]
        });

        for await (const chunk of roadmapStream) {
          if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
            send({ type: 'chunk', section: 'roadmap', text: chunk.delta.text });
          }
        }
        send({ type: 'section_end', section: 'roadmap' });

        send({ type: 'status', message: '[SUCCESS] Strategy ready.' });
        send({ type: 'done' });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        send({ type: 'error', message });
      } finally {
        controller.close();
      }
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Transfer-Encoding': 'chunked',
      'Cache-Control': 'no-cache',
    },
  });
}
