# 08. Тестирование, снапшоты и проверка сценариев

## Что добавлено

В проект добавлены snapshot-тесты для ключевых пользовательских сценариев:

- просмотр дисциплин;
- загрузка учебной работы;
- просмотр архива;
- просмотр аналитики.

Тесты находятся в каталоге `src/tests/unit/`.

## Как запустить

Запуск всех unit-тестов:

```bash
npm run test
```

Запуск только добавленных и изменённых тестов:

```bash
npm run test -- src/tests/unit/modules/disciplines/DisciplinesPage.spec.ts src/tests/unit/modules/disciplines/components/UploadStudyWork.snapshot.spec.ts src/tests/unit/modules/archive/useArchive.snapshot.spec.ts src/tests/unit/modules/analytics/composables/useAnalytics.spec.ts
```

Обновление снапшотов, если изменение интерфейса сделано осознанно:

```bash
npm run test -- -u
```

## Как работают snapshot-тесты

Snapshot-тест сохраняет эталонный результат работы компонента или функции. При следующем запуске теста Vitest снова получает результат и сравнивает его с сохранённым эталоном.

Если результат совпал, тест проходит. Если разметка или данные изменились, тест падает и показывает разницу.

В проекте используются два вида снапшотов:

1. `toMatchSnapshot()` — сохраняет эталон в отдельный файл `__snapshots__/*.snap`.
2. `toMatchInlineSnapshot()` — хранит эталон прямо внутри теста.

## Где лежат снапшоты

Для просмотра дисциплин:

```text
src/tests/unit/modules/disciplines/__snapshots__/DisciplinesPage.spec.ts.snap
```

Для загрузки работы:

```text
src/tests/unit/modules/disciplines/components/__snapshots__/UploadStudyWork.snapshot.spec.ts.snap
```

Inline-снапшоты архива и аналитики находятся прямо в тестовых файлах:

```text
src/tests/unit/modules/archive/useArchive.snapshot.spec.ts
src/tests/unit/modules/analytics/composables/useAnalytics.spec.ts
```

## Сценарий 1. Просмотр дисциплин

Файл:

```text
src/tests/unit/modules/disciplines/DisciplinesPage.spec.ts
```

Добавленный тест:

```ts
it('snapshot: просмотр дисциплин фиксирует видимый список и статистику', async () => {
  const wrapper = mountDisciplinesPage()
  await flushPromises()

  expect(wrapper.text()).toContain('Весенняя практика')
  expect(wrapper.text()).toContain('Весенняя семинарская')
  expect(wrapper.html()).toMatchSnapshot()
})
```

Построчное объяснение:

- `it(...)` объявляет отдельный тестовый сценарий.
- `mountDisciplinesPage()` монтирует страницу дисциплин с подготовленными моками.
- `await flushPromises()` ждёт завершения асинхронных обновлений Vue.
- `expect(wrapper.text()).toContain(...)` проверяет, что нужные дисциплины реально отображаются.
- `expect(wrapper.html()).toMatchSnapshot()` сохраняет или сравнивает HTML-разметку страницы.

Что проверяет тест:

- открывается страница дисциплин;
- отображаются дисциплины весеннего семестра;
- отображаются карточки статистики;
- структура экрана не изменилась случайно.

## Сценарий 2. Загрузка учебной работы

Файл:

```text
src/tests/unit/modules/disciplines/components/UploadStudyWork.snapshot.spec.ts
```

### Логика теста

Тест монтирует модальное окно загрузки, заполняет форму, подставляет файл, мокает проверку документа, фиксирует снапшот результата проверки и проверяет итоговый payload.

Ключевые части:

```ts
vi.mock('@/api/info', () => ({
  validateDocument: validateDocumentMock,
}))
```

Эта строка заменяет реальный API проверки документа на мок. Тест не отправляет файл в сеть.

```ts
validateDocumentMock.mockResolvedValue({
  valid: true,
  percent: 96,
  errors: [],
  criteria: [...]
})
```

Здесь задаётся ответ validation API: документ прошёл проверку с результатом 96%.

```ts
await wrapper.get('select[data-label="Учебная группа *"]').setValue('4381')
await wrapper.get('select[data-label="Студент *"]').setValue('10')
await wrapper.get('input[data-label="Название работы *"]').setValue('Лабораторная работа 1')
```

Эти строки имитируют действия пользователя: выбор группы, студента и ввод названия работы.

```ts
const file = new File(['demo'], 'ПетровПП_Программирование_Лабораторная.docx', ...)
```

Создаётся тестовый файл в памяти. Реальный файл на диске не нужен.

```ts
Object.defineProperty(fileInput.element, 'files', {
  value: [file],
  configurable: true,
})
await fileInput.trigger('change')
```

Так тест имитирует выбор файла в `<input type="file">`.

```ts
await wrapper.get('.upload-actions-submit').trigger('click')
await flushPromises()
```

Нажимается кнопка загрузки, после чего Vue дожидается обработки промисов.

```ts
expect(validateDocumentMock).toHaveBeenCalledWith(file, {
  templateId: 7,
  annotate: true,
})
```

Проверяется, что форма действительно вызвала проверку документа с нужным шаблоном.

```ts
expect(wrapper.html()).toMatchSnapshot()
```

Фиксируется HTML окна после проверки. В снапшоте видно сообщение «Проверка пройдена».

```ts
expect({...}).toMatchInlineSnapshot(...)
```

Проверяется итоговый payload: студент, группа, вид контроля, учебный год, преподаватель, файл и процент проверки.

Что проверяет тест:

- форма принимает данные;
- файл попадает в состояние компонента;
- validation API вызывается с правильными параметрами;
- после проверки показывается результат;
- после подтверждения компонент отдаёт корректный payload через событие `submit`.

## Сценарий 3. Просмотр архива

Файл:

```text
src/tests/unit/modules/archive/useArchive.snapshot.spec.ts
```

### Логика теста

Проверяется composable `useArchive`, который отвечает за загрузку архива, нормализацию строк, фильтры и права доступа.

```ts
vi.mock('@/api/info', () => ({
  fetchArchiveReportsForTeacher: state.fetchArchiveReportsForTeacherMock,
  fetchArchiveReportsAll: state.fetchArchiveReportsAllMock,
}))
```

Реальные запросы архива заменяются моками.

```ts
state.user.canSeeAll.value = false
```

Так задаётся режим преподавателя. В этом режиме пользователь должен видеть только свои работы.

```ts
await vm.loadAll()
```

Запускается загрузка архива.

```ts
expect(state.fetchArchiveReportsForTeacherMock).toHaveBeenCalledWith(
  'Иванов',
  '2024-2025'
)
```

Проверяется, что для преподавателя вызывается личный API архива.

```ts
expect(vm.filteredRows.value).toMatchInlineSnapshot(...)
```

Фиксируется итоговый список строк архива после фильтрации по роли.

Во втором тесте:

```ts
state.user.canSeeAll.value = true
```

Включается режим заведующего кафедрой. После этого тест проверяет, что вызывается кафедральный API `fetchArchiveReportsAll`.

Что проверяет тест:

- преподаватель видит только свои работы;
- заведующий кафедрой видит кафедральный архив;
- строки без вида контроля скрываются;
- статусы `checked`, `pending`, `error` рассчитываются из результата проверки;
- справочники фильтров формируются из загруженных данных.

## Сценарий 4. Просмотр аналитики

Файл:

```text
src/tests/unit/modules/analytics/composables/useAnalytics.spec.ts
```

Добавлен тест:

```ts
it('snapshot: просмотр аналитики фиксирует кафедральные KPI и таблицы', async () => {
  ...
})
```

### Логика теста

Тест задаёт пользователю право `canSeeAll`, мокает ответы кафедральной аналитики и проверяет итоговое состояние composable `useAnalytics`.

```ts
userState.canSeeAll.value = true
```

Пользователь получает режим заведующего кафедрой.

```ts
getAdminAnalyticsMock.mockResolvedValue(...)
getAdminAnalyticsTeachersSummaryMock.mockResolvedValue(...)
getAdminAnalyticsDisciplinesTableMock.mockResolvedValue(...)
getAdminAnalyticsBySemesterMock.mockResolvedValue(...)
```

Каждый мок задаёт отдельный блок аналитики: KPI, преподаватели, дисциплины и семестры.

```ts
const vm = useAnalytics({
  academicYear: ref('2024/2025'),
  studyPeriod: ref('academic_year'),
  scopeMode: ref('department'),
})
```

Создаётся экземпляр composable в режиме кафедральной аналитики.

```ts
await vm.loadAll()
```

Запускается загрузка всех аналитических данных.

```ts
expect({
  showDepartmentStats: vm.showDepartmentStats.value,
  kpi: vm.kpi.value,
  disciplinesTable: vm.disciplinesTable.value,
  bySemester: vm.bySemester.value,
  teachersSummary: vm.teachersSummary.value,
  disciplinesWithTeachers: vm.disciplinesWithTeachers.value,
}).toMatchInlineSnapshot(...)
```

Снапшот фиксирует полное итоговое состояние аналитики.

Что проверяет тест:

- для заведующего кафедрой включается кафедральный режим;
- вызываются admin API-методы аналитики;
- KPI рассчитываются на основе таблицы дисциплин;
- Moodle-работы учитываются в агрегате;
- таблицы по дисциплинам, семестрам и преподавателям сохраняются в состоянии.

## Как читать результат тестов

Если тесты прошли:

```text
Test Files  4 passed
Tests       18 passed
```

Это значит, что логика сценариев совпадает с ожидаемым состоянием.

Если snapshot-тест упал, нужно понять причину:

- если интерфейс или структура данных изменились случайно — исправить код;
- если изменение сделано осознанно — обновить снапшоты командой `npm run test -- -u`.

## Чем snapshot-тест отличается от screenshot-теста

Snapshot-тест в этом проекте сравнивает HTML или объект данных. Он быстрый и запускается в jsdom без браузера.

Screenshot-тест сравнивает изображение страницы пиксель-в-пиксель. Для него обычно нужен Playwright или Storybook. Такой тест тяжелее и чувствительнее к шрифтам, размерам окна и теме оформления.

Для текущей ИС snapshot-тесты подходят для диплома как доказательство автоматизированной проверки:

- структуры страниц;
- сценария загрузки;
- нормализации архива;
- агрегирования аналитики.
