<template>
  <article class="etu-docs-panel">
    <h1>Глобальные компоненты Student Works</h1>
    <p>
      Переиспользуемые UI-компоненты <strong>СПбГЭТУ</strong> для работы со студенческими
      работами. Регистрируются глобально через
      <code>src/components/global/index.js</code> и доступны в любом шаблоне Vue без импорта.
    </p>

    <h2>Стек</h2>
    <ul>
      <li><strong>Vue 3</strong> + <strong>Vite</strong> + TypeScript</li>
      <li><strong>Vuetify 3</strong> — кнопки, чипы, карточки</li>
      <li><strong>Element Plus</strong> — таблицы, карточки метрик</li>
    </ul>

    <h2>Каталог компонентов</h2>
    <table>
      <thead>
        <tr>
          <th>Тег</th>
          <th>Файл</th>
          <th>Назначение</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><code>etu-button</code></td>
          <td><code>EtuButton.vue</code></td>
          <td>Кнопка на базе <code>v-btn</code>, скругление 10px, иконки-картинки по URL</td>
        </tr>
        <tr>
          <td><code>etu-stat-card</code></td>
          <td><code>EtuStatCard.vue</code></td>
          <td>Карточка метрики (<code>el-card</code>), иконка MDI, варианты <code>color</code></td>
        </tr>
        <tr>
          <td><code>etu-info-card</code></td>
          <td><code>EtuInfoCard.vue</code></td>
          <td>Плитка с иконкой в цветном квадрате и значением</td>
        </tr>
        <tr>
          <td><code>etu-page-header</code></td>
          <td><code>EtuPageHeader.vue</code></td>
          <td>Шапка страницы на <code>v-card</code> со слотом <code>right</code></td>
        </tr>
        <tr>
          <td><code>etu-data-table</code></td>
          <td><code>EtuDataTable.vue</code></td>
          <td>Таблица с сортировкой, скелетоном и CSS-переменными <code>--etu-dt-*</code></td>
        </tr>
        <tr>
          <td><code>etu-label-chip</code></td>
          <td><code>EtuLabelChip.vue</code></td>
          <td>Метка: inline или chip, пресеты цвета, счётчик, closable</td>
        </tr>
        <tr>
          <td><code>etu-searchable-select</code></td>
          <td><code>EtuSearchableSelect.vue</code></td>
          <td>Выпадающий список с поиском (варианты toolbar / settings)</td>
        </tr>
        <tr>
          <td><code>etu-pill-search-select</code></td>
          <td><code>EtuPillSearchSelect.vue</code></td>
          <td>Селект-«таблетка» с поиском, single / multiple</td>
        </tr>
        <tr>
          <td><code>etu-segment-switcher</code></td>
          <td><code>EtuSegmentSwitcher.vue</code></td>
          <td>Переключатель сегментов (pill toggle)</td>
        </tr>
        <tr>
          <td><code>etu-tea-loader</code></td>
          <td><code>EtuTeaLoader.vue</code></td>
          <td>Анимированный «чайник» — inline или overlay</td>
        </tr>
        <tr>
          <td><code>etu-loading-page</code></td>
          <td><code>EtuLoadingPage.vue</code></td>
          <td>Полноэкранный экран загрузки</td>
        </tr>
      </tbody>
    </table>

    <h2>Навигация</h2>
    <p>
      В боковой панели: <strong>Документация</strong> — токены и каталог; <strong>Глобальные
      компоненты</strong> — интерактивные превью с Controls и Autodocs.
    </p>
  </article>
</template>
