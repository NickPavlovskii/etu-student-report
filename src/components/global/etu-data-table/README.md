# EtuDataTable

Таблица данных с колонками, строками, скелетоном при загрузке, пустым состоянием и слотами для ячеек. Глобально регистрируется как **`etu-data-table`** (`components/global/index.js`).

## Подключение

**Глобально** (уже в приложении):

```vue
<etu-data-table … />
```

**Локальный импорт:**

```ts
import EtuDataTable from '@/components/global/etu-data-table/EtuDataTable.vue';
```

Типы колонок:

```ts
import type { TableColumn, EtuDataTableColumn } from '@/components/global/etu-data-table/types';
```

## Обязательные пропсы

| Проп | Тип | Описание |
|------|-----|----------|
| **`columns`** | `TableColumn<T>[]` | Описание колонок: `key`, `header`, опционально `headerClass`, `cellClass`, `sortable`, … |
| **`rows`** | `T[]` | Массив строк (объекты с полями, совпадающими с `key` колонок, если используете дефолтное отображение ячеек) |

## Опциональные пропсы

| Проп | По умолчанию | Описание |
|------|----------------|----------|
| `rowKey` | — | Имя поля строки для стабильного `:key` (например `id`). Если значения нет — ключ `row-{index}` |
| `loading` | `false` | Идёт загрузка |
| `showSkeleton` | `true` | Показывать скелетон-строки, пока `loading === true` |
| `skeletonRows` | `5` | Число строк скелетона |
| `hideHeader` | `false` | Скрыть `<thead>` |
| `emptyIcon` | `mdi-clipboard-text-search-outline` | Иконка пустого состояния (MDI) |
| `emptyText` | `Записи не найдены` | Текст по умолчанию при пустом списке |
| `wrapClass` | — | Доп. класс(ы) на корневую обёртку `.etu-dt-wrap` |
| `tableClass` | — | Класс(ы) на `<table class="etu-dt-table">` |
| `rowClass` | — | `(row, index) => string \| string[]` — классы на `<tr>` |
| `rowStyle` | — | `(row, index) => Record<string, string>` — инлайн-стили на `<tr>` (например CSS-переменные для анимации) |
| `shadow` | `false` | Тень вокруг рамки |
| `scrollable` | `false` | Горизонтальный скролл (`overflow-x: auto`) |
| `tableMinWidth` | — | Например `700px` — `min-width` у `<table>` |

## События

| Событие | Аргументы |
|---------|-----------|
| `row-click` | `(row, index)` |
| `sort` | `(columnKey, 'asc' \| 'desc')` — только если у колонки `sortable: true` |

## Слоты

| Слот | Назначение |
|------|------------|
| **`colgroup`** | `<colgroup><col … /></colgroup>` — ширины/классы колонок |
| **`header-{key}`** | Свой контент заголовка колонки; в scope: `column` |
| **`cell-{key}`** | Ячейка; в scope: `row`, `value`, `index`, `column` |
| **`empty`** | Полная замена блока «нет данных» (иконка + текст по умолчанию не используются, если слот задан) |
| **`footer`** | Подвал таблицы (`<tfoot>`) |

Если слот **`cell-{key}`** не задан, в ячейке выводится `row[key]` или результат `column.formatter(value, row)`.

## Колонка `TableColumn`

- **`key`** — идентификатор и ключ в объекте строки.
- **`header`** — текст в шапке.
- **`headerClass`** — классы на `<th>` (в админке часто `th th-sep` или `th-filled th-sep`).
- **`cellClass`** / **`cellStyle`** — классы и стили на `<td>`.
- **`sortable`** — включает сортировку по клику (событие `sort`).
- **`formatter`** — функция форматирования значения для дефолтной ячейки.

## Кастомизация внешнего вида

На корне **`.etu-dt-wrap`** заданы CSS-переменные (можно переопределить снаружи):

`--etu-dt-border`, `--etu-dt-bg`, `--etu-dt-cell-border`, `--etu-dt-th-color`, `--etu-dt-th-bg`, `--etu-dt-th-border`, `--etu-dt-sep`, `--etu-dt-row-hover`, `--etu-dt-font`, `--etu-dt-th-font`, `--etu-dt-th-weight`, `--etu-dt-th-spacing`, `--etu-dt-cell-pad-y`, `--etu-dt-cell-pad-x`.

Доменные стили (цвета конкретных ячеек, чипы, кнопки) задаются в родительском компоненте через **`:deep(...)`** или классы, переданные в `cellClass` / `wrapClass`.

## Минимальный пример

```vue
<etu-data-table
  :columns="[
    { key: 'name', header: 'Имя' },
    { key: 'email', header: 'Email' },
  ]"
  :rows="users"
  row-key="id"
/>
```

## Пример со слотом ячейки

```vue
<etu-data-table :columns="cols" :rows="items">
  <template #cell-actions="{ row }">
    <v-btn size="small" @click="edit(row)">Изменить</v-btn>
  </template>
</etu-data-table>
```

## Примеры в проекте

- **`UserTab.vue`** — пользователи: слоты `#cell-fio`, `#cell-disciplines`, …, `#colgroup`, `#empty`, `rowStyle` для анимации строк.
- **`AuditTable.vue`** — журнал: `row-key="id"`, слоты `#cell-date`, `#cell-user`, …
