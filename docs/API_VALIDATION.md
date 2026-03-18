# Интеграция с фронтендом: API проверки документов

Документ для AI/разработчика фронтенда. Описывает backend API проверки документов и шаблонов, контракты запросов/ответов и сценарии интеграции.

---

## 1. Базовая конфигурация

| Параметр | Значение |
|----------|----------|
| **Base URL** | `http://localhost:8081` (dev) или переменная окружения |
| **CORS** | Разрешён origin из `app.cors-allowed-origins` (по умолчанию `http://localhost:5173`) |
| **Swagger UI** | `http://localhost:8081/swagger` — интерактивная документация |

---

## 2. Эндпоинты для интеграции

### 2.1. Шаблоны проверки (`/api/templates`)

| Метод | Путь | Описание |
|-------|------|----------|
| GET | `/api/templates` | Список всех шаблонов |
| GET | `/api/templates/{id}` | Получить шаблон по ID |
| POST | `/api/templates` | Создать шаблон |
| PUT | `/api/templates/{id}` | Обновить шаблон |
| DELETE | `/api/templates/{id}` | Удалить шаблон |
| POST | `/api/templates/{id}/title-page-template` | Загрузить макет титульного листа (DOC/DOCX/PDF) и извлечь обязательные элементы |

### 2.2. Валидация документов (`/api/validate`)

| Метод | Путь | Описание |
|-------|------|----------|
| POST | `/api/validate` | Проверить документ по шаблону (PDF, DOC, DOCX) |

---

## 3. TypeScript-интерфейсы

### 3.1. Шаблон проверки (VerificationTemplate)

```typescript
interface VerificationTemplate {
  id: number;
  name: string;
  description?: string;
  criteria: TemplateCriteria;
  createdAt?: string;  // ISO 8601
  updatedAt?: string;  // ISO 8601
}

interface TemplateCriteria {
  name?: string;
  description?: string;
  fileFormat?: string;           // ".doc или .docx"
  font?: string;                 // "Times New Roman"
  fontSize?: string;             // "14 пт"
  lineSpacing?: string;          // "1.5"
  minPages?: string;             // "10"
  minSources?: string;           // "7"
  illNumbering?: string;
  figurePosition?: string;
  figureCaption?: string;
  tableTitle?: string;
  submissionFormat?: string;
  hasTitlePage?: boolean;
  hasToc?: boolean;
  hasIntroduction?: boolean;
  hasMainPart?: boolean;
  hasConclusion?: boolean;
  hasBibliography?: boolean;
  hasAppendices?: boolean;
  /** Обязательные строки на титульном листе — для проверки соответствия макету */
  titlePageRequiredStrings?: string[];
}
```

### 3.2. Результат проверки (ValidationResult)

```typescript
interface ValidationResult {
  valid: boolean;              // true = нет критичных ошибок
  percent: number;             // 0–100
  criteria: CriteriaResult[];  // все результаты
  errors: CriteriaResult[];    // ошибки (level: "error")
  warnings: CriteriaResult[];  // предупреждения (level: "warning")
  errorMessage?: string;       // при ошибке (файл не загружен, неподдерживаемый формат)
  /** Base64-строка файла с выделенными ошибками (при annotate=true) */
  annotatedFileBase64?: string;
  /** Имя файла для скачивания (например "document_замечания.docx") */
  annotatedFileName?: string;
}

interface CriteriaResult {
  code: string;      // FILE_FORMAT | FONT | FONT_SIZE | LINE_SPACING | MIN_PAGES | MIN_SOURCES | HAS_TOC | HAS_INTRODUCTION | HAS_CONCLUSION | HAS_BIBLIOGRAPHY | HAS_APPENDICES | HAS_TITLE_PAGE
  title: string;     // "Формат файла", "Шрифт", ...
  passed: boolean;
  message?: string;
  expected?: string;
  actual?: string;
  level?: "error" | "warning";
}
```

### 3.3. Коды критериев (code)

| code | title (пример) | Описание |
|------|----------------|----------|
| FILE_FORMAT | Формат файла | .doc, .docx, .pdf |
| FONT | Шрифт | Times New Roman и т.п. |
| FONT_SIZE | Размер шрифта | 14 пт |
| LINE_SPACING | Межстрочный интервал | 1.5 |
| MIN_PAGES | Минимальное количество страниц | Кол-во страниц |
| MIN_SOURCES | Минимальное количество источников | Кол-во в списке литературы |
| HAS_TOC | Оглавление | Наличие «содержание»/«оглавление» |
| HAS_INTRODUCTION | Введение | Наличие «введение» |
| HAS_CONCLUSION | Заключение | Наличие «заключение» |
| HAS_BIBLIOGRAPHY | Список источников/литературы | Наличие раздела |
| HAS_APPENDICES | Приложения | Наличие «приложени» |
| HAS_TITLE_PAGE | Титульный лист по шаблону | Обязательные элементы из titlePageRequiredStrings |

---

## 4. Форматы запросов

### 4.1. GET `/api/templates`

**Ответ:** `VerificationTemplate[]`

### 4.2. GET `/api/templates/{id}`

**Ответ:** `VerificationTemplate`

### 4.3. POST `/api/templates`

**Тело:** `{ name, description?, criteria? }`

**Ответ:** `VerificationTemplate` (201 Created)

### 4.4. PUT `/api/templates/{id}`

**Тело:** то же, что в POST.

**Ответ:** `VerificationTemplate`

### 4.5. DELETE `/api/templates/{id}`

**Ответ:** 204 No Content

### 4.6. POST `/api/templates/{id}/title-page-template`

**Тип:** `multipart/form-data`  
**Поле:** `file` — DOC, DOCX или PDF (макет титульного листа)

**Ответ:** `VerificationTemplate` (обновлённый)

**Ошибки (400):** «Файл не загружен», «Не удалось извлечь элементы из шаблона», «Неподдерживаемый формат»

### 4.7. POST `/api/validate`

**Тип:** `multipart/form-data`

| Поле/параметр | Тип | Обязательное | Описание |
|---------------|-----|--------------|----------|
| file | File | да | PDF, DOC или DOCX |
| templateId | number (query) | нет | ID шаблона из БД |
| template | JSON (part) | нет | Критерии напрямую (если templateId не задан) |
| annotate | boolean (query) | нет, default: false | Файл с подсветкой ошибок в ответе |

**Ответ:** `ValidationResult`

---

## 5. Сценарии интеграции

### 5.1. Форма создания/редактирования шаблона

1. Поля: `name`, `description`, `criteria`.
2. Кнопка **«Загрузить макет титульного листа»** → `POST /api/templates/{id}/title-page-template`.
3. После загрузки — обновить состояние из ответа (`criteria.titlePageRequiredStrings`).

### 5.2. Проверка перед загрузкой работы

1. Пользователь выбирает файл и шаблон.
2. `POST /api/validate?templateId={id}&annotate=true` с файлом.
3. Показать результат: таблица критериев, процент, valid.
4. Кнопки: «Загрузить», «Скачать с замечаниями» (если есть annotatedFileBase64).

### 5.3. Загрузка макета титульного листа

1. На странице шаблона: кнопка «Привязать макет титульного листа».
2. Выбор файла (DOC, DOCX, PDF).
3. `POST /api/templates/{id}/title-page-template` с файлом.
4. При успехе — обновить `criteria.titlePageRequiredStrings` в UI.

---

## 6. Ограничения

| Аспект | Описание |
|--------|----------|
| Подсветка ошибок (annotate) | Только для DOCX. Для PDF возвращается исходный файл. |
| Форматы | PDF, DOC, DOCX |
| Макс. размер | 50 MB |

---

## 7. Краткая сводка

**Интегрировать:**
1. CRUD шаблонов — GET/POST/PUT/DELETE `/api/templates`.
2. Загрузка макета титульного листа — POST `/api/templates/{id}/title-page-template`.
3. Проверка документа — POST `/api/validate` с `file`, `templateId`, опционально `annotate=true`.
4. Отображение — таблица по `criteria` с `passed`, `expected`, `actual`, `level`.

**Ключевые поля:** `valid`, `percent`, `criteria`, `errors`, `warnings`, `annotatedFileBase64`, `annotatedFileName`.
