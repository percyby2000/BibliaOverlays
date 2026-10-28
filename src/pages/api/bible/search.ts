import type { APIRoute } from 'astro';
import { BibleService } from '../../../services/bibleService';

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const query = url.searchParams.get('q') || '';
  const version = url.searchParams.get('version') || 'RVR1960';

  if (!query.trim()) {
    return new Response(JSON.stringify({ results: [] }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const results = BibleService.search(query, version);

  return new Response(JSON.stringify({
    success: true,
    query,
    count: results.length,
    results,
    connection: BibleService.getConnectionStatus()
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
};
