import type { APIRoute } from 'astro';
import { BibleService } from '../../../services/bibleService';

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const ref = url.searchParams.get('ref');
  const version = url.searchParams.get('version') || 'RVR1960';

  if (!ref) {
    return new Response(JSON.stringify({ error: 'Parámetro "ref" es requerido. Ejemplo: ?ref=Juan 3:16' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const passage = await BibleService.getPassage(ref, version);
    return new Response(JSON.stringify({
      success: true,
      data: passage,
      connection: BibleService.getConnectionStatus()
    }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600'
      }
    });
  } catch (err: any) {
    return new Response(JSON.stringify({
      success: false,
      error: err.message || 'Error al obtener el pasaje'
    }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
