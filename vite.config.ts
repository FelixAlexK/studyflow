import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import * as dotenv from "dotenv";
import { nitro } from "nitro/vite";
import { fileURLToPath, URL } from "url";
import { defineConfig } from "vite";
import viteTsConfigPaths from "vite-tsconfig-paths";

// Load .env.local (TanStack Start/Vite convention)
dotenv.config({ path: ".env.local", quiet: true });
// Also load .env as fallback
dotenv.config({ quiet: true });

const config = defineConfig({
	resolve: {
		alias: {
			"@": fileURLToPath(new URL("./src", import.meta.url)),
		},
	},
	plugins: [
		devtools(),
		nitro(),
		// this is the plugin that enables path aliases
		viteTsConfigPaths({
			projects: ["./tsconfig.json"],
		}),
		tailwindcss(),
		tanstackStart(),
		viteReact(),
	],
	server: {
		port: 3000,
	},
	define: {
		// Ensure VITE_ env vars are available in SSR context
		'import.meta.env.VITE_CONVEX_URL': JSON.stringify(process.env.VITE_CONVEX_URL),
		'import.meta.env.VITE_SITE_URL': JSON.stringify(process.env.VITE_SITE_URL),
	},
});

export default config;
