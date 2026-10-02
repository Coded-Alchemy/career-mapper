import { createClientFromRequest } from 'npm:@base44/sdk@0.8.49';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const file_uri = (body.file_uri || '').trim();
    if (!file_uri) return Response.json({ error: 'A file is required' }, { status: 400 });

    // Ownership gate: only the user who uploaded a private file can sign it,
    // so a caller cannot read someone else's uploaded resume.
    let signedUrl = '';
    try {
      const signed = await base44.integrations.Core.CreateFileSignedUrl({ file_uri, expires_in: 300 });
      signedUrl = signed?.signed_url || '';
    } catch (e) {
      signedUrl = '';
    }
    if (!signedUrl) {
      return Response.json({ error: 'You can only read a file you uploaded.' }, { status: 403 });
    }

    const result = await base44.asServiceRole.integrations.Core.ExtractDataFromUploadedFile({
      file_url: signedUrl,
      json_schema: {
        type: 'object',
        properties: {
          text: { type: 'string' },
        },
        required: ['text'],
      },
    });

    let text = '';
    if (result?.output) {
      text = typeof result.output === 'string' ? result.output : (result.output.text || '');
    }

    return Response.json({ text });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}