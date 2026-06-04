<div align="center">

<img src="public/logo-leti.png" alt="Логотип СПбГЭТУ «ЛЭТИ»" width="140" />

# ИС «Отчёты»

**Веб-клиент информационной системы учёта учебных работ** для кафедры информатики и прикладной математики **[СПбГЭТУ «ЛЭТИ»](https://etu.ru/)** — федерального автономного университета (основан в **1886** году).

*Vue 3 · TypeScript · Vite*

</div>

---

## О системе

**Информационная система (ИС)** предназначена для автоматизации работы с учебными работами в вузе:

| Роль / сценарий | Возможности |
|-----------------|-------------|
| **Преподаватель** | Просмотр своих дисциплин, загрузка и проверка отчётов студентов, переход в архив по работам |
| **Кафедра / администратор** | Управление пользователями, просмотр дисциплин кафедры, журнал событий (аудит) |
| **Аналитика** | Сводные данные по ошибкам и показателям (модуль аналитики) |
| **Настройки** | Типы контроля и связанные параметры для дисциплин |

Этот репозиторий — **фронтенд (SPA/PWA)**: интерфейс в браузере, данные приходят с **бэкенд-API** (отдельный сервер).

---

## Документы и материалы проекта

| # | Материал | Ссылка |
|---|----------|--------|
| 1 | 🎨 Макеты интерфейса (Figma) | [открыть →](https://www.figma.com/design/PrjP3KfCcN75dqbui7dXxv/ИС-%22Хранения-отчетов%22?node-id=0-1&p=f&t=E0ahp0hEarQElY6G-0) |
| 2 | 📋 Техническое задание (ТЗ) | [открыть →](#) |
| 3 | 📖 Руководство пользователя | [открыть →](https://drive.google.com/file/d/1mLg8U7OABEI-qzc_d-pGqNCTDx7Ud1H7/view?usp=drive_link) |
| 4 | ✅ Акт внедрения | [открыть →](https://drive.google.com/file/d/1sH_75bRLwjyn3f6H9XWFb90_JjrqEc1w/view?usp=drive_link) |
| 5 | 🎓 ВКР (PDF) | [открыть →](https://drive.google.com/file/d/10YqBOmn8-5bQlKkcoBK4dzecQnSnbWQy/view?usp=drive_link) |
| 6 | 📄 Статья | [открыть →](https://drive.google.com/file/d/1-8N_WGgyaZuHD8EGF5LhBDxWms3EX4cE/view?usp=drive_link) |
| 7 | 📊 Презентация к защите | [открыть →](https://docs.google.com/presentation/d/1pU6WyQsEZWTusmJ_zry6T_g5bf-HA6Fj/edit?usp=drive_link&ouid=107322948642047659645&rtpof=true&sd=true) |
| 8 | 🔷 Диаграмма прецедентов (Use Case) | [открыть →](https://drive.google.com/file/d/1zGYmhjedD3JOsEQSM-w7pD-1qzdxd6HE/view?usp=drive_link) |
| 9 | 🏆 Диплом участника конференции | [открыть →](https://drive.google.com/file/d/18s-J5TAuWR45ScMVKw8UcnaogIT3-eZF/view?usp=drive_link) |

---

## Технологический стек

| Слой | Технологии |
|------|------------|
| **Фреймворк** | [Vue 3](https://vuejs.org/) (Composition API, `<script setup>`) |
| **Язык** | [TypeScript](https://www.typescriptlang.org/) |
| **Сборка** | [Vite](https://vitejs.dev/) |
| **Маршрутизация** | [Vue Router](https://router.vuejs.org/) |
| **UI** | [Vuetify 3](https://vuetifyjs.com/), [Element Plus](https://element-plus.org/), иконки [MDI](https://materialdesignicons.com/) |
| **Стили** | SCSS, [Tailwind CSS](https://tailwindcss.com/) (через Vite) |
| **HTTP** | [Axios](https://axios-http.com/) |
| **Таблицы / Excel** | [SheetJS (xlsx)](https://sheetjs.com/) |

Инструменты разработки: ESLint, `vue-tsc` для проверки типов перед сборкой.

---

## Тесты, макеты и Storybook

В проекте **заложены** (и будут отражены в репозитории после настройки): юнит-тесты, Figma и Storybook для глобального UI-kit.

| Направление | Назначение | Ссылка / команда |
|-------------|------------|------------------|
| **Unit-тесты** | Проверка утилит, composables и ключевых компонентов (планируется, например, Vitest + Vue Test Utils). В `package.json` появится скрипт вроде `npm run test`. | *команда — после настройки* |
| **Figma** | Макеты интерфейса, сетки и согласованность с дизайн-системой. | *ссылка на файл Figma — будет добавлена* |
| **Storybook** | Документация и изолированная разработка глобальных компонентов в [`src/components/global/`](src/components/global/) (префикс `Etu*`: кнопки, таблицы, селекты и т.д.). | *локально: `npm run storybook` или ссылка на деплой — после настройки* |

> **Примечание.** Пока Storybook и тестовый раннер не подключены в сборке — обновите таблицу выше реальными URL и командами, когда они появятся.

---

## Структура проекта

```
student-works-pw/
├── src/
│   ├── api/                 # HTTP-запросы к бэкенду
│   ├── assets/              # Статика (иконки и др.)
│   ├── components/global/   # Общий UI-kit (кнопки, таблицы, селекты — префикс Etu*)
│   ├── composables/         # Переиспользуемая логика Vue
│   ├── modules/             # Страницы по разделам ИС
│   │   ├── auth/            # Вход, выбор способа авторизации
│   │   ├── disciplines/     # Список дисциплин и карточка дисциплины
│   │   ├── archive/         # Архив отчётов
│   │   ├── admin/           # Администрирование (сотрудники, дисциплины кафедры, журнал)
│   │   ├── analytics/       # Аналитика
│   │   └── settings/        # Настройки (типы контроля и т.д.)
│   ├── router.ts            # Маршруты и guard авторизации
│   ├── types/               # Общие типы (например, пользователь)
│   ├── utils/               # Утилиты
│   ├── App.vue
│   └── main.ts
├── public/
├── vite.config.ts           # Сборка, путь `outDir`, прокси `/api`
├── tsconfig.*.json
└── package.json
```

---

## Быстрый старт

### Требования

- **Node.js** 18+ (рекомендуется актуальный LTS)
- **npm** (или `pnpm` / `yarn`)

### Установка зависимостей

```bash
npm install
```

### Режим разработки

```bash
npm run dev
```

Откройте в браузере адрес из консоли (обычно **http://localhost:5173**).  
Для работы с данными нужен **бэкенд**: в dev-режиме запросы к `/api` проксируются на **http://localhost:8081** (см. `vite.config.ts`).

### Продакшен-сборка

```bash
npm run build
```

Выполняется проверка типов (`vue-tsc`) и сборка. Результат:

`dist/frontend/contents/panda/client`

Путь задан под раздачу статики бэкендом; при необходимости измените `build.outDir` в `vite.config.ts`.




