
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// LOCAL proxy: the browser posts to /api/lead; this dev server forwards to Make and adds the API key.
// MAKE_* vars have no VITE_ prefix, so they are NEVER bundled into the site.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const hook = env.MAKE_WEBHOOK_URL ? new URL(env.MAKE_WEBHOOK_URL) : null;
  return {
    plugins: [react()],
    server: hook && {
      proxy: {
        '/api/lead': {
          target: hook.origin,
          changeOrigin: true,
          xfwd: true, // adds X-Forwarded-For (client IP)
          rewrite: () => hook.pathname,
          headers: { 'X-Make-ApiKey': env.MAKE_API_KEY || '' },
        },
      },
    },
  };
});
