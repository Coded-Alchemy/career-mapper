import { createClientFromRequest } from 'npm:@base44/sdk@0.8.49';

const PLAIN_TEXT_TYPES = ['txt', 'md'];

function extensionOf(name: string) {
  const match = name.toLowerCase().match(/\.([a-z0-9]+)(?:[?#].*)?$/);
  return match ? match[1] : '';
}

function findEndOfCentralDirectory(bytes: Uint8Array) {
  const lowest = Math.max(0, bytes.length - 66000);
  for (let i = bytes.length - 22; i >= lowest; i--) {
    if (bytes[i] === 0x50 && bytes[i + 1] === 0x4b && bytes[i + 2] === 0x05 && bytes[i + 3] === 0x06) {
      return i;
    }
  }
  return -1;
}

// Reads a single entry out of a zip container (a .docx is a zip holding word/document.xml).
async function readZipEntry(bytes: Uint8Array, entryName: string) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const eocd = findEndOfCentralDirectory(bytes);
  if (eocd < 0) return null;

  const count = view.getUint16(eocd + 10, true);
  const decoder = new TextDecoder();
  let pointer = view.getUint32(eocd + 16, true);

  for (let i = 0; i < count && pointer + 46 <= bytes.length; i++) {
    if (view.getUint32(pointer, true) !== 0x02014b50) return null;

    const method = view.getUint16(pointer + 10, true);
    const compressedSize = view.getUint32(pointer + 20, true);
    const nameLength = view.getUint16(pointer + 28, true);
    const extraLength = view.getUint16(pointer + 30, true);
    const commentLength = view.getUint16(pointer + 32, true);
    const localOffset = view.getUint32(pointer + 42, true);
    const name = decoder.decode(bytes.subarray(pointer + 46, pointer + 46 + nameLength));

    if (name === entryName) {
      const localNameLength = view.getUint16(localOffset + 26, true);
      const localExtraLength = view.getUint16(localOffset + 28, true);
      const start = localOffset + 30 + localNameLength + localExtraLength;
      const raw = bytes.subarray(start, start + compressedSize);
      if (method === 0) return raw;
      if (method !== 8) return null;
      const stream = new Blob([raw]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
      return new Uint8Array(await new Response(stream).arrayBuffer());
    }

    pointer += 46 + nameLength + extraLength + commentLength;
  }

  return null;
}

function documentXmlToText(xml: string) {
  return xml
    .replace(/<w:tab\b[^>]*\/?>/g, '\t')
    .replace(/<w:br\b[^>]*\/?>/g, '\n')
    .replace(/<\/w:p>/g, '\n')
    .replace(/<[^>]*>/g, '')
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

async function fetchFile(signedUrl: string) {
  const res = await fetch(signedUrl);
  if (!res.ok) return null;
  return new Uint8Array(await res.arrayBuffer());
}

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

    const extension = extensionOf(file_uri);
    let text = '';

    if (extension === 'docx') {
      const bytes = await fetchFile(signedUrl);
      if (!bytes) return Response.json({ error: 'We could not open that file. Please try again.' }, { status: 502 });
      const documentXml = await readZipEntry(bytes, 'word/document.xml');
      if (!documentXml) {
        return Response.json({ error: 'We could not read that Word file. Please try saving it again as .docx or PDF.' }, { status: 422 });
      }
      text = documentXmlToText(new TextDecoder().decode(documentXml));
    } else if (PLAIN_TEXT_TYPES.includes(extension)) {
      const bytes = await fetchFile(signedUrl);
      if (!bytes) return Response.json({ error: 'We could not open that file. Please try again.' }, { status: 502 });
      text = new TextDecoder().decode(bytes);
    } else {
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

      if (result?.output) {
        text = typeof result.output === 'string' ? result.output : (result.output.text || '');
      }
    }

    text = (text || '').trim();
    if (!text) {
      return Response.json({
        error: 'We could not find any text in that file. If it is a scanned or image-only document, paste the text instead.',
      }, { status: 422 });
    }

    return Response.json({ text });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}