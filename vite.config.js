import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
	plugins: [vue()],

	 server: {
    proxy: {
      '/api/auth': {
        target: process.env.VITE_PUBLIC_CONVEX_SITE_URL || 'https://outgoing-ox-416.convex.site',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
