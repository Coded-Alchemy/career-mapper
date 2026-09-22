import { createClientFromRequest } from 'npm:@base44/sdk@0.8.49';

const TIMEFRAMES = ['30 days', '90 days', '6 months', '12 months'];

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const target_role = (body.target_role || '').trim();
    const resume_text = (body.resume_text || '').trim();
    const timeframe = TIMEFRAMES.includes(body.timeframe) ? body.timeframe : '90 days';

    if (!target_role) return Response.json({ error: 'A target role is required' }, { status: 400 });
    if (!resume_text) return Response.json({ error: 'Resume text is required' }, { status: 400 });

    const prompt = `You are a senior tech career strategist who gives honest, no-fluff career roadmaps to tech professionals. Be concrete and realistic — no padding, no false hope.

Target role: "${target_role}"
Goal timeframe: ${timeframe}

Resume:
"""
${resume_text}
"""

Produce a structured career roadmap for reaching the target role within the timeframe.

1. current_assessment: 2–3 honest sentences on where this resume stands today relative to the target role — what already counts, what's missing.

2. skill_gaps: the specific skills to acquire to be competitive for the target role. Each item:
   - skill: the skill name
   - priority: one of "Critical", "Important", "Nice to Have"
   - how_to_learn: a concrete, low-cost way to learn AND prove it (a home lab, a specific project, a free course). Be specific and actionable.

3. certifications: the certifications to earn IN ORDER, each:
   - name: certification name
   - why: why it matters for THIS target role
   - timeline: where it falls in the ${timeframe} timeline
   Only include certifications that actually move the needle for this role — no padding. If none are needed, return an empty array.

4. role_path: an honest call on whether the target role is reachable directly within ${timeframe}. Represent the path as ordered steps from current position to target role:
   - title: role title
   - duration: how long to stay (e.g. "6 months", "1 year"); use "Current" for the current position and "Goal" for the target role
   - extract: what to extract from this role (skills, responsibilities, resume bullets) before moving on; for the target role put "Target role"
   - is_current: true only for the first step (current position)
   - is_target: true only for the last step (target role)
   If the target is reachable directly within the timeframe, return exactly two steps: the current position and the target role.

5. milestones: break the ${timeframe} timeframe into concrete phases (use weeks for 30/90 days, months for 6/12 months). Each phase:
   - phase: a phase label (e.g. "Week 1–2", "Month 1")
   - actions: 2–4 specific actions drawn from the skill gaps and certifications

6. feasibility_note: if ${timeframe} is unrealistic for this jump, say so directly and state what timeframe is realistic. If it is realistic, say so briefly.

Return ONLY the structured roadmap.`;

    const response_json_schema = {
      type: 'object',
      properties: {
        current_assessment: { type: 'string' },
        skill_gaps: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              skill: { type: 'string' },
              priority: { type: 'string', enum: ['Critical', 'Important', 'Nice to Have'] },
              how_to_learn: { type: 'string' },
            },
            required: ['skill', 'priority', 'how_to_learn'],
          },
        },
        certifications: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              why: { type: 'string' },
              timeline: { type: 'string' },
            },
            required: ['name', 'why', 'timeline'],
          },
        },
        role_path: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              title: { type: 'string' },
              duration: { type: 'string' },
              extract: { type: 'string' },
              is_current: { type: 'boolean' },
              is_target: { type: 'boolean' },
            },
            required: ['title', 'duration', 'extract', 'is_current', 'is_target'],
          },
        },
        milestones: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              phase: { type: 'string' },
              actions: { type: 'array', items: { type: 'string' } },
            },
            required: ['phase', 'actions'],
          },
        },
        feasibility_note: { type: 'string' },
      },
      required: [
        'current_assessment',
        'skill_gaps',
        'certifications',
        'role_path',
        'milestones',
        'feasibility_note',
      ],
    };

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema,
    });

    return Response.json({ roadmap: result });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}