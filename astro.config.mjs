import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import vercel from '@astrojs/vercel';

const supabaseUrl = process.env.PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || 'https://qqcwnqwlgvqxntadwcmi.supabase.co';
const supabaseKey = process.env.PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_vs5qBXJb99coW2LSwvkKsQ_dI_DzLqj';

// https://astro.build/config
export default defineConfig({
  output: 'server',
  adapter: vercel(),
  integrations: [
    react(),
    tailwind()
  ],
  vite: {
    ssr: {
      noExternal: ['lucide-react']
    },
    define: {
      'import.meta.env.PUBLIC_SUPABASE_URL': JSON.stringify(supabaseUrl),
      'import.meta.env.PUBLIC_SUPABASE_ANON_KEY': JSON.stringify(supabaseKey),
    }
  }
});
