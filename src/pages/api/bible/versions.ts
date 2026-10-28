import type { APIRoute } from 'astro';
import { BibleService } from '../../../services/bibleService';

export const prerender = false;

export const GET: APIRoute = async () => {
  const versions = BibleService.getVersions();
  const books = BibleService.getBooks();
  const connection = BibleService.getConnectionStatus();

  return new Response(JSON.stringify({
    success: true,
    connection,
    versions,
    books
  }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=86400'
    }
  });
};
