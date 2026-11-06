import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig, type Plugin } from "vite"
import { inspectAttr } from 'kimi-plugin-inspect-react'

/**
 * CSP для прод-сборки: приложение полностью самодостаточно
 * (шрифты и всё остальное — same-origin, внешних запросов нет).
 * В dev-режиме не добавляется: она конфликтует с HMR/React Refresh.
 */
const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'", // инлайн-стили React и <style> из chart.tsx
  "img-src 'self' data:",
  "font-src 'self'",
  "connect-src 'self'",
  "worker-src 'self'",
  "manifest-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ')

function cspPlugin(): Plugin {
  return {
    name: 'polo-inject-csp',
    apply: 'build',
    transformIndexHtml(html) {
      return html.replace(
        '<meta name="viewport"',
        `<meta http-equiv="Content-Security-Policy" content="${CONTENT_SECURITY_POLICY}" />\n    <meta name="viewport"`,
      )
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  base: './',
  plugins: [
    // code-path-атрибуты нужны только в dev-инспекторе, в прод их не добавляем
    ...(command === 'serve' ? [inspectAttr()] : []),
    react(),
    cspPlugin(),
  ],
  server: {
    port: 3000,
  },
  preview: {
    port: 3000,
    // Arena/preview-прокси подставляет свой поддомен вместо localhost
    allowedHosts: ['.e2b.app'],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
