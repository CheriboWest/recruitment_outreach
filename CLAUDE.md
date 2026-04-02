# Advance Academy — Project Guidelines

## Brand Identity
- **Product Name:** Recruitment Outreach Generator
- **Parent Brand:** Advance Academy
- **Tagline:** Stop Applying for Jobs. Start Getting Replies.
- **Website:** advanceacademy.co.uk

## Colours
- **Primary (Navy):** #0F172A
- **Accent (Gold):** #F59E0B
- **Background:** #FFFFFF (light theme)
- **Surface/Card:** #F8FAFC
- **Border:** #E2E8F0
- **Success:** #10B981
- **Warning:** #F59E0B
- **Error:** #EF4444
- **Text Primary:** #0F172A
- **Text Secondary:** #64748B

## Typography
- **Font:** Inter (Google Fonts)
- **Heading weight:** 700
- **Body weight:** 400–500
- **Use clean hierarchy:** large headings, generous spacing, readable body text

## Tone of Voice
- Elite but approachable
- Strategic and confident
- Human — never robotic or corporate
- Outcome-focused (talk about results, not features)
- Audience: graduates and early-career professionals (22–30), many international students navigating the UK job market

## Audience
- Graduates and early-career professionals
- International students (including Vietnamese students) in the UK
- People actively job searching or planning their next move
- Users of Advance Academy's career coaching and mentorship services

## UI Principles
- Clean, modern, minimalist — premium fintech/SaaS feel
- Step-by-step wizard flows (never overwhelm with all inputs at once)
- Cards for results with clear hierarchy
- Every text output has a Copy to Clipboard button
- Loading states must feel intelligent (animated terminal log, not a spinner)
- Mobile responsive

## AI Output Quality Standards
- All AI outputs must sound like they were written by a top 1% career strategist
- Never generic, never clichéd, never obviously AI-generated
- Personalised to the user's specific inputs every time
- Specific company names, specific role titles, specific actions — no vague advice
- Outreach messages must sound like the candidate wrote them, not a bot

## Project Structure Conventions
- Use Next.js App Router
- All API calls in /app/api/ route handlers
- Environment variables in .env.local (never hardcoded)
- TailwindCSS for all styling
- Lucide React for icons
- Supabase client initialised in /lib/supabase.ts

## Environment Variables Required
```
ANTHROPIC_API_KEY=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

## Supabase Table: outreach_sessions
| Column | Type |
|---|---|
| id | uuid (primary key) |
| created_at | timestamp |
| email | text (nullable) |
| tool_used | text |
| degree | text |
| work_experience | text |
| skills | text |
| interests | text |
| target_salary | text |
| location | text |
| target_role | text |
| target_company | text |
| linkedin_input | text |
| job_description | text (nullable) |
| match_score | integer (nullable) |
| bridge_keywords | jsonb (nullable) |
| generated_companies | jsonb |
| generated_roles | jsonb |
| career_roadmap | jsonb |
| outreach_linkedin | text |
| outreach_email | text |
| outreach_recruiter | text |

## Key Features Summary
1. **Dream Company Finder** — profile analysis → 3-tier company matrix → target roles → career roadmap
2. **Recruitment Outreach Generator** — LinkedIn input → personalised DM, networking email, recruiter message
3. **JD Match Scanner** (Phase 2) — paste job description → match % + bridge keywords injected into outreach
4. **Email Gate** (Phase 2) — blur results, capture email to unlock
5. **PDF Download** (Phase 2) — print-to-PDF with Advance Academy branding

## Do Not
- Use dark mode as default (light theme only)
- Use generic loading spinners — always use the terminal log animation
- Show all form inputs at once — always use step-by-step wizard
- Hardcode any API keys
- Use any font other than Inter
