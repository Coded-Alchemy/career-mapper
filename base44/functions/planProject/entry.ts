import { createClientFromRequest } from 'npm:@base44/sdk@0.8.49';

const CATEGORIES = ['Home Lab', 'Certification Project', 'Course Project', 'Portfolio Piece', 'Work Project', 'Other'];

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const skill_goal = (body.skill_goal || '').trim();
    const experience_level = body.experience_level || 'New to this';
    const hours_per_week = body.hours_per_week || '5';

    if (!skill_goal) return Response.json({ error: 'A skill or goal is required' }, { status: 400 });

    const prompt = `You are a senior tech career mentor who designs hands-on, portfolio-worthy projects that prove a specific skill to hiring managers.

Design a project around this goal: "${skill_goal}"

Learner context:
- Current experience: ${experience_level}
- Time available: ${hours_per_week} hours per week

Requirements:
- The project must be practical, buildable by one person, and directly demonstrate the skill "${skill_goal}" to an employer.
- Size the build steps to the experience level and weekly hours: more guidance and smaller steps for beginners, fewer/larger steps for advanced learners.
- Each build step must include a rough time estimate (e.g. "2-3 hours", "1 week").
- The portfolio bullet must be a single resume-ready line with a measurable outcome (quantify scale, volume, or impact).
- Suggested category must be one of: ${CATEGORIES.join(', ')}.
- tech_stack and skills_demonstrated should be concrete (specific tools/technologies and specific skills).

Return ONLY the structured project plan.`;

    const response_json_schema = {
      type: 'object',
      properties: {
        project_title: { type: 'string' },
        description: { type: 'string' },
        why_this_project: { type: 'string' },
        suggested_category: { type: 'string', enum: CATEGORIES },
        tech_stack: { type: 'array', items: { type: 'string' } },
        skills_demonstrated: { type: 'array', items: { type: 'string' } },
        build_steps: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              step: { type: 'string' },
              time_estimate: { type: 'string' },
            },
            required: ['step', 'time_estimate'],
          },
        },
        stretch_goals: { type: 'array', items: { type: 'string' } },
        portfolio_bullet: { type: 'string' },
      },
      required: [
        'project_title',
        'description',
        'why_this_project',
        'suggested_category',
        'tech_stack',
        'skills_demonstrated',
        'build_steps',
        'stretch_goals',
        'portfolio_bullet',
      ],
    };

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema,
    });

    return Response.json({ plan: result });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}