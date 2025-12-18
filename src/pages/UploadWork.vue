<template>
  <v-container fluid>
    <v-card class="pa-6 mb-6">
      <div class="d-flex justify-space-between align-center mb-2">
        <div class="text-h6">Мои дисциплины</div>
        <v-btn prepend-icon="mdi-plus">Добавить дисциплину</v-btn>
      </div>
      <div class="text-body-2 text-medium-emphasis">
        Обзор учебных дисциплин и текущего статуса работ
      </div>

      <v-row
        dense
        class="mt-4"
      >
        <v-col
          cols="12"
          md="3"
        >
          <v-card
            class="pa-4"
            color="blue-lighten-5"
          >
            <div class="text-caption">Дисциплины</div>
            <div class="text-h5">5</div>
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
            <div class="text-caption">Загружено работ</div>
            <div class="text-h5">263 / 303</div>
          </v-card>
        </v-col>
        <v-col
          cols="12"
          md="3"
        >
          <v-card
            class="pa-4"
            color="purple-lighten-5"
          >
            <div class="text-caption">Выполнение</div>
            <div class="text-h5">87%</div>
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
            <div class="text-caption">Требуют внимания</div>
            <div class="text-h5">40</div>
          </v-card>
        </v-col>
      </v-row>
    </v-card>

    <v-row dense>
      <v-col
        cols="12"
        md="4"
        v-for="n in 5"
        :key="n"
      >
        <v-card class="pa-4">
          <div class="text-subtitle-1">Информатика и программирование</div>
          <div class="text-caption mb-2">2024 / 2025</div>

          <v-progress-linear
            model-value="75"
            height="6"
            class="mb-2"
          />
          <div class="text-caption">Выполнение: 75%</div>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
