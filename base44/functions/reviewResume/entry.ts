import { createClientFromRequest } from 'npm:@base44/sdk@0.8.49';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const resume_text = (body.resume_text || '').trim();
    const target_role = (body.target_role || '').trim();

    if (!resume_text) return Response.json({ error: 'Resume text is required' }, { status: 400 });
    if (!target_role) return Response.json({ error: 'A target job title is required' }, { status: 400 });

    const prompt = `You are a senior tech recruiter and ATS (Applicant Tracking System) optimization expert. Give an honest, specific, actionable review of this resume for the target role.

Target role: "${target_role}"

Resume:
"""
${resume_text}
"""

Produce a structured review:

1. overall_score: an ATS fit score from 0–100 reflecting how well this resume matches the target role. Be honest — a generic or mismatched resume should score low.

2. best_jobs: 3–5 specific tech roles this resume is best suited for RIGHT NOW (given its current skills and experience), as short role titles.

3. transferable_skills: the core transferable skills found in the resume that are valuable across tech roles.

4. resume_suggestions: specific, ATS-focused rewrite suggestions. Include missing keywords for the target role, weak bullets to strengthen with metrics/quantified impact, and formatting issues. Each suggestion should be one concrete, actionable line.

5. linkedin_suggestions: improvements for the LinkedIn profile — a stronger headline, an improved About section direction, and skills-section additions. Each as one actionable line.

Return ONLY the structured review.`;

    const response_json_schema = {
      type: 'object',
      properties: {
        overall_score: { type: 'number' },
        best_jobs: { type: 'array', items: { type: 'string' } },
        transferable_skills: { type: 'array', items: { type: 'string' } },
        resume_suggestions: { type: 'array', items: { type: 'string' } },
        linkedin_suggestions: { type: 'array', items: { type: 'string' } },
      },
      required: [
        'overall_score',
        'best_jobs',
        'transferable_skills',
        'resume_suggestions',
        'linkedin_suggestions',
      ],
    };

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema,
    });

    return Response.json({ review: result });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}