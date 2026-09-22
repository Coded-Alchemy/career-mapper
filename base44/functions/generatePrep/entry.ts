import { createClientFromRequest } from 'npm:@base44/sdk@0.8.49';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const job_description = (body.job_description || '').trim();
    const company = (body.company || '').trim();
    const role_title = (body.role_title || '').trim();

    if (!job_description) return Response.json({ error: 'A job description is required' }, { status: 400 });
    if (!company) return Response.json({ error: 'A company is required' }, { status: 400 });
    if (!role_title) return Response.json({ error: 'A role title is required' }, { status: 400 });

    const prompt = `You are a senior technical interviewer and interview coach. Build a tailored interview prep plan for this role.

Company: "${company}"
Role: "${role_title}"

Job description:
"""
${job_description}
"""

Produce a structured prep plan:

1. role_summary: 2–3 sentences on what this role is really about and what the interviewer is screening for.

2. likely_questions: 8–10 common interview questions most likely to come up for THIS specific role and description (a mix of screening and role-specific). Each item:
   - question: the question
   - answer_focus: one line on what a strong answer includes

3. behavioral_questions: 4–5 behavioral questions tailored to the description's requirements. Each item:
   - question: the behavioral question
   - hint: how to structure the answer using the STAR method (Situation, Task, Action, Result)

4. technical_questions: 4–6 technical questions or topics drawn from the specific tools, skills, and responsibilities in the description. Each item:
   - question: the technical question or topic
   - key_points: the key points a strong answer covers

5. prep_plan: a concrete, ordered preparation checklist for the days before the interview — topics to review from the description, which of the candidate's projects or experiences to prepare as stories, company research to do, and a mock-interview suggestion. Each item is one actionable line.

6. questions_to_ask: 4–5 smart questions the candidate should ask the interviewer, tailored to this role and company.

Return ONLY the structured prep plan.`;

    const response_json_schema = {
      type: 'object',
      properties: {
        role_summary: { type: 'string' },
        likely_questions: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              question: { type: 'string' },
              answer_focus: { type: 'string' },
            },
            required: ['question', 'answer_focus'],
          },
        },
        behavioral_questions: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              question: { type: 'string' },
              hint: { type: 'string' },
            },
            required: ['question', 'hint'],
          },
        },
        technical_questions: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              question: { type: 'string' },
              key_points: { type: 'string' },
            },
            required: ['question', 'key_points'],
          },
        },
        prep_plan: { type: 'array', items: { type: 'string' } },
        questions_to_ask: { type: 'array', items: { type: 'string' } },
      },
      required: [
        'role_summary',
        'likely_questions',
        'behavioral_questions',
        'technical_questions',
        'prep_plan',
        'questions_to_ask',
      ],
    };

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema,
    });

    return Response.json({ prep: result });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}