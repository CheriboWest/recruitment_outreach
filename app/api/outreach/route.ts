import { NextRequest } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are an elite career strategist, recruiter, and hiring manager combined. Your outputs must be specific, personalised, human-sounding, and sharp. Avoid all cliches, generic advice, and AI-sounding phrasing. Optimise every output for real-world hiring success and high response rates.`;

function encode(obj: object): string {
  return JSON.stringify(obj) + '\n';
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { targetRole, targetCompany, linkedinInput } = body;

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: object) => {
        controller.enqueue(encoder.encode(encode(event)));
      };

      try {
        // Chain 5 — Profile Signal Extraction
        send({ type: 'status', message: '[INFO] Extracting profile signals...' });
        send({ type: 'section_start', section: 'signals' });

        let signalsText = '';
        const signalsStream = client.messages.stream({
          model: 'claude-sonnet-4-5',
          max_tokens: 600,
          system: SYSTEM_PROMPT,
          messages: [{
            role: 'user',
            content: `Extract the following from this LinkedIn profile/About section to use for personalising outreach:
- Tone of voice (1 sentence)
- Top 3 strengths or skills demonstrated
- Most notable experience or achievement
- Unique angle or differentiator

Output as JSON:
{
  "tone": "string",
  "strengths": ["string", "string", "string"],
  "notableExperience": "string",
  "uniqueAngle": "string"
}

LinkedIn profile:
${linkedinInput}

Return ONLY valid JSON, no markdown code blocks.`
          }]
        });

        for await (const chunk of signalsStream) {
          if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
            signalsText += chunk.delta.text;
            send({ type: 'chunk', section: 'signals', text: chunk.delta.text });
          }
        }
        send({ type: 'section_end', section: 'signals' });

        // Chain 6 — LinkedIn DM
        send({ type: 'status', message: '[INFO] Drafting LinkedIn DM...' });
        send({ type: 'section_start', section: 'linkedin' });

        const linkedinStream = client.messages.stream({
          model: 'claude-sonnet-4-5',
          max_tokens: 300,
          system: SYSTEM_PROMPT,
          messages: [{
            role: 'user',
            content: `Write a LinkedIn DM for this candidate targeting a ${targetRole} role at ${targetCompany}.

Rules:
- Maximum 120 words
- Personalised — references their specific background, not generic
- Confident, not desperate or needy
- Clear CTA: spark a conversation, NOT ask for a job
- No generic phrases like "I hope this message finds you well" or "I'm passionate about..."
- No bullet points — flowing, natural message
- Sound like a person, not a bot

Candidate profile signals:
${signalsText}

Target role: ${targetRole}
Target company: ${targetCompany}

Write ONLY the message text, nothing else. No subject line, no labels.`
          }]
        });

        for await (const chunk of linkedinStream) {
          if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
            send({ type: 'chunk', section: 'linkedin', text: chunk.delta.text });
          }
        }
        send({ type: 'section_end', section: 'linkedin' });

        // Chain 7 — Networking Email
        send({ type: 'status', message: '[INFO] Drafting networking email...' });
        send({ type: 'section_start', section: 'email' });

        const emailStream = client.messages.stream({
          model: 'claude-sonnet-4-5',
          max_tokens: 500,
          system: SYSTEM_PROMPT,
          messages: [{
            role: 'user',
            content: `Write a networking email for this candidate targeting a ${targetRole} role at ${targetCompany}.

Structure:
1. Strong opening hook (not "My name is..." — lead with something interesting)
2. Why them specifically / why ${targetCompany} (specific, not generic)
3. Credibility — what makes this candidate worth their time
4. Value proposition — what they bring
5. Low-pressure CTA (not "Please give me a job")

Rules:
- 150–250 words
- Include: Subject line, then the email body
- Natural and human — like a smart person wrote it, not a template
- Specific to ${targetCompany} and ${targetRole}

Candidate profile signals:
${signalsText}

Format exactly as:
Subject: [subject line]

[email body]`
          }]
        });

        for await (const chunk of emailStream) {
          if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
            send({ type: 'chunk', section: 'email', text: chunk.delta.text });
          }
        }
        send({ type: 'section_end', section: 'email' });

        // Chain 8 — Recruiter Message
        send({ type: 'status', message: '[INFO] Drafting recruiter message...' });
        send({ type: 'section_start', section: 'recruiter' });

        const recruiterStream = client.messages.stream({
          model: 'claude-sonnet-4-5',
          max_tokens: 400,
          system: SYSTEM_PROMPT,
          messages: [{
            role: 'user',
            content: `Write a message to a recruiter for this candidate seeking a ${targetRole} role${targetCompany ? ` (open to ${targetCompany} and similar)` : ''}.

Rules:
- Direct and results-focused
- Emphasise relevance and commercial impact
- Confident, commercial tone — treat it like a pitch
- 100–150 words
- Include key credentials upfront
- End with a clear, professional ask
- Sound like a top candidate, not a desperate job-seeker
- No fluff, no filler

Candidate profile signals:
${signalsText}

Write ONLY the message text, nothing else. No labels.`
          }]
        });

        for await (const chunk of recruiterStream) {
          if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
            send({ type: 'chunk', section: 'recruiter', text: chunk.delta.text });
          }
        }
        send({ type: 'section_end', section: 'recruiter' });

        send({ type: 'status', message: '[SUCCESS] Outreach scripts ready.' });
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
