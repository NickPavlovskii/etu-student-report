<template>
  <v-card
    class="cards-wrap"
    elevation="0"
  >
    <v-row dense>
      <v-col
        v-for="(item, i) in items"
        :key="item.codeRow ?? i"
        cols="12"
        md="4"
      >
        <discipline-card
          :item="item"
          class="discipline-card-item"
          @click="$emit('open-discipline', item)"
        />
      </v-col>
    </v-row>
  </v-card>
</template>

<script setup lang="ts">
  import DisciplineCard from '@/modules/disciplines/components/DisciplineCard.vue';
  import type { AdminDisciplineCardItem } from '../../model';

  defineProps<{
    items: AdminDisciplineCardItem[];
  }>();

  defineEmits<{
    'open-discipline': [item: AdminDisciplineCardItem];
  }>();
</script>

<style scoped>
  .cards-wrap {
    background: transparent;
    border-radius: 0;
    padding: 0;
    box-shadow: none;
    border: none;
  }

  .discipline-card-item {
    cursor: pointer;
    transition:
      transform 0.15s,
      box-shadow 0.15s;
  }
  .discipline-card-item:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08) !important;
  }
</style>
