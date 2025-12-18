<template>
  <v-container fluid>
    <v-card class="pa-6 mb-6">
      <div class="text-h6 mb-1">Архив учебных работ</div>
      <div class="text-body-2 text-medium-emphasis mb-4">
        Централизованное хранилище всех учебных работ кафедры
      </div>

      <v-row dense>
        <v-col
          cols="12"
          md="3"
        >
          <v-card
            class="pa-4"
            color="blue-lighten-5"
          >
            <div class="text-caption">Всего работ</div>
            <div class="text-h5">3</div>
          </v-card>
        </v-col>
        <v-col
          cols="12"
          md="3"
        >
          <v-card
            class="pa-4"
            color="green-lighten-5"
          >
            <div class="text-caption">Проверено</div>
            <div class="text-h5">2</div>
          </v-card>
        </v-col>
        <v-col
          cols="12"
          md="3"
        >
          <v-card
            class="pa-4"
            color="orange-lighten-5"
          >
            <div class="text-caption">Требуют проверки</div>
            <div class="text-h5">0</div>
          </v-card>
        </v-col>
        <v-col
          cols="12"
          md="3"
        >
          <v-card
            class="pa-4"
            color="red-lighten-5"
          >
            <div class="text-caption">С ошибками</div>
            <div class="text-h5">1</div>
          </v-card>
        </v-col>
      </v-row>
    </v-card>

    <v-card class="pa-6">
      <div class="text-subtitle-1 mb-4">Фильтры и поиск</div>
      <v-row dense>
        <v-col
          cols="12"
          md="6"
        >
          <v-text-field label="Поиск по ФИО студента или теме" />
        </v-col>
        <v-col
          cols="12"
          md="3"
        >
          <v-select label="Все дисциплины" />
        </v-col>
        <v-col
          cols="12"
          md="3"
        >
          <v-select label="Все группы" />
        </v-col>
      </v-row>

      <v-data-table
        :headers="headers"
        :items="items"
        class="mt-4"
      />
    </v-card>
  </v-container>
</template>

<script setup>
  const headers = [
    { title: 'Студент', key: 'student' },
    { title: 'Группа', key: 'group' },
    { title: 'Дисциплина', key: 'subject' },
    { title: 'Тип', key: 'type' },
    { title: 'Тема', key: 'topic' },
  ];

  const items = [];
</script>
