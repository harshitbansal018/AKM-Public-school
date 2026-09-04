import { revalidateTag } from 'next/cache';

/**
 * Cache-busting hook, called by the Express API after any content change.
 *
 * Without this, a page stays cached until its timer expires — the school would
 * update their phone number and wait an hour to see it. The API pings this
 * endpoint on every successful admin write, so edits appear immediately.
 *
 * Protected by a shared secret: anyone who could call this freely could force
 * the site to re-fetch on every request and hammer the database.
 */
export async function POST(request) {
  const secret = request.headers.get('x-revalidate-secret');

  if (!process.env.REVALIDATE_SECRET) {
    return Response.json(
      { success: false, message: 'REVALIDATE_SECRET is not configured' },
      { status: 500 }
    );
  }

  if (secret !== process.env.REVALIDATE_SECRET) {
    return Response.json({ success: false, message: 'Invalid secret' }, { status: 401 });
  }

  let tags = [];
  try {
    const body = await request.json();
    tags = Array.isArray(body?.tags) ? body.tags : [];
  } catch {
    return Response.json({ success: false, message: 'Invalid JSON body' }, { status: 400 });
  }

  if (tags.length === 0) {
    return Response.json({ success: false, message: 'No tags supplied' }, { status: 400 });
  }

  for (const tag of tags) {
    revalidateTag(String(tag));
  }

  return Response.json({ success: true, revalidated: tags });
}
