# Document Validator — проверка документов (Python, опционально)

**Основной бэкенд приложения — Java (Spring).** Валидация документов в работе приложения выполняется через Java: фронт отправляет запросы на `POST /api/validate` на порт 8081.

Этот Python-сервис (FastAPI, порт 8082) — **отдельный прототип/альтернатива** для проверки DOCX по критериям шаблона. Он не используется фронтом. Его можно удалить, если вся проверка идёт через Java, или оставить для локальных тестов/разработки без Java.

## Установка

```bash
cd document-validator
pip install -r requirements.txt
```

## Запуск

```bash
uvicorn main:app --reload --port 8082
```

Сервис будет доступен на `http://localhost:8082`.

## API

- `GET /health` — проверка работоспособности
- `POST /validate` — проверка документа
  - `file` (form-data) — файл DOCX
  - `template` (form-data, опционально) — JSON с критериями шаблона

Пример:
```bash
curl -X POST http://localhost:8082/validate \
  -F "file=@document.docx" \
  -F 'template={"font":"Times New Roman","fontSize":"14 пт","minPages":"10"}'
```
