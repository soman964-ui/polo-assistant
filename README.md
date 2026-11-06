# Polo Assistant

Локальное приложение-помощник владельца Volkswagen Polo Sedan / Liftback (1.6 MPI, 1.4 TSI):
журнал обслуживания с регламентом и напоминаниями, учёт топлива и расходов, справочник по машине.

## Приватность и хранение данных

**Приложение работает полностью автономно и не отправляет в интернет ничего о пользователе:**

- все данные (профиль, VIN, госномер, журнал ТО, заправки, расходы) хранятся только в `localStorage` на устройстве владельца;
- нет бэкенда, аккаунтов, аналитики и телеметрии — в коде нет ни одного сетевого запроса;
- шрифты самохостируются (`@fontsource-variable/*`), внешние CDN не используются;
- продакшен-сборка отдаёт `Content-Security-Policy: default-src 'self'` и `<meta name="referrer" content="no-referrer">`;
- резервная копия — JSON-файл через «Настройки → Экспорт JSON». Файл содержит VIN и госномер в открытом виде и хранится там, куда вы его сохраните;
- Android-сборка: `allowBackup=false`, только HTTPS, release-сборка минифицирована.

## Стек

React 19 · TypeScript · Vite 7 · Tailwind CSS 3 + shadcn/ui · React Router 7 · Vitest · Capacitor 8 (Android) · PWA (manifest + service worker)

## Требования

- Node.js ≥ 20.19 (в CI используется Node 22), npm ≥ 10
- для Android-сборки: JDK 17+, Android Studio — см. [ANDROID.md](ANDROID.md)

## Команды

```bash
npm ci            # установка зависимостей
npm run dev       # dev-сервер на http://localhost:3000
npm run build     # продакшен-сборка в dist/ (tsc + vite)
npm run preview   # предпросмотр продакшен-сборки
npm test          # юнит-тесты (vitest)
npm run lint      # ESLint
npm audit --omit=dev --audit-level=moderate   # аудит production-зависимостей
```

## Структура

```
src/
  pages/Home.tsx        экран с вкладками (обзор/ТО/топливо/расходы/справочник)
  sections/             разделы приложения
  components/           SettingsDialog, ErrorBoundary, GaugeRing, ui/ (shadcn)
  lib/store.tsx         состояние + localStorage + zod-валидация импорта/загрузки
  lib/maintenance.ts    расчёт сроков обслуживания по регламенту
  lib/dates.ts          безопасный парсинг дат ГГГГ-ММ-ДД в локальной зоне
  data/polo.ts          справочные данные: двигатели, КПП, регламент, артикулы
public/                 PWA: sw.js, manifest.webmanifest, icons/
android/                нативный проект Capacitor (ru.poloassistant.app)
```

## Данные и резервное копирование

Формат экспорта — версионированный JSON (`version: 1`). Импорт принимает как текущий, так и
прежний плоский формат: структура проверяется схемой zod, повреждённые отдельные записи
отбрасываются, а не роняют приложение. Если данные в хранилище повреждены настолько, что
интерфейс не стартует, показывается экран восстановления — можно скачать сырую копию
`localStorage` или стереть данные.

## CI

GitHub Actions (`.github/workflows/quality.yml`): аудит production-зависимостей (moderate+),
аудит всех зависимостей (high+), ESLint, тесты, сборка. Actions запинены по commit SHA,
обновления — через Dependabot. Еженедельный cron-аудит по расписанию.

## Публикация

Приложение — статический PWA: отдавайте `dist/` с корня домена (абсолютные пути `/manifest.webmanifest`, `/sw.js` рассчитаны на корень). Для Android см. [ANDROID.md](ANDROID.md).

## Лицензия

Лицензия не выбрана — все права у владельца репозитория.
