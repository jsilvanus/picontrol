import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

export default defineConfig({
  base: "./",
  plugins: [
    {
      name: "html-rewrite",
      configureServer(server) {
        server.middlewares.use((req, _res, next) => {
          if (req.url === "/catalog" || req.url === "/catalog/") {
            req.url = "/catalog.html";
          }
          next();
        });
      }
    }
  ],
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL("./index.html", import.meta.url)),
        multiview: fileURLToPath(new URL("./multiview.html", import.meta.url)),
        catalog: fileURLToPath(new URL("./catalog.html", import.meta.url))
      }
    }
  },
  server: {
    port: 5173,
    proxy: {
      "/api": "http://127.0.0.1:3100",
      "/multiview": "http://127.0.0.1:3100",
      "/pipgm": "http://127.0.0.1:3100"
    }
  }
});
