<template>
  <div class="toolbar">
    <div
      :class="['search-box', { 'search-box--active': searchFocused }]"
    >
      <v-icon
        class="search-box__icon"
        size="17"
      >
        mdi-magnify
      </v-icon>
      <input
        ref="searchEl"
        class="search-box__input"
        placeholder="Поиск по имени или email…"
        :value="usersSearch"
        @input="onSearchInput"
        @focus="searchFocused = true"
        @blur="searchFocused = false"
        @keydown.escape="clearSearch"
      />
      <Transition name="pop">
        <button
          v-if="usersSearch"
          class="search-box__clear"
          type="button"
          aria-label="Очистить"
          @click="clearSearch"
        >
          <v-icon size="13">mdi-close</v-icon>
        </button>
      </Transition>
    </div>

    <Transition
      name="counter-swap"
      mode="out-in"
    >
      <admin-count-chip
        :key="countLabel"
        :label="countLabel"
      />
    </Transition>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import AdminCountChip from '../AdminCountChip.vue';

  const props = defineProps<{
    usersSearch: string;
    countLabel: string;
    debouncedLoadTeachers: () => void;
  }>();

  const emit = defineEmits<{ 'update:usersSearch': [value: string] }>();

  const searchEl = ref<HTMLInputElement>();
  const searchFocused = ref(false);

  function onSearchInput(e: Event) {
    emit('update:usersSearch', (e.target as HTMLInputElement).value);
    props.debouncedLoadTeachers();
  }

  function clearSearch() {
    emit('update:usersSearch', '');
    props.debouncedLoadTeachers();
    searchEl.value?.focus();
  }
</script>

<style scoped>
.toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 18px;
  flex-wrap: wrap;
}

.search-box {
  flex: 1 1 240px;
  max-width: 400px;
  display: flex;
  align-items: center;
  gap: 7px;
  height: 40px;
  padding: 0 12px;
  background: #eff6ff;
  border: 1.5px solid #bfdbfe;
  border-radius: 11px;
  transition:
    border-color 0.2s cubic-bezier(0.4, 0, 0.2, 1),
    background 0.2s cubic-bezier(0.4, 0, 0.2, 1),
    box-shadow 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
.search-box--active {
  border-color: #2563eb;
  background: #fff;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.18);
}
.search-box__icon {
  color: #a8a29e;
  flex-shrink: 0;
  transition: color 0.2s;
}
.search-box--active .search-box__icon {
  color: #2563eb;
}

.search-box__input {
  flex: 1;
  align-self: stretch;
  min-height: 0;
  border: 0;
  outline: 0;
  background: transparent;
  font: inherit;
  font-size: 13.5px;
  color: #1c1917;
  line-height: 1.35;
  padding: 0;
  margin: 0;
}
.search-box__input::placeholder {
  color: #a8a29e;
}

.search-box__clear {
  width: 22px;
  height: 22px;
  display: grid;
  place-items: center;
  border: 0;
  border-radius: 50%;
  background: #e7e5e4;
  color: #57534e;
  cursor: pointer;
  transition:
    background 0.15s,
    transform 0.15s;
}
.search-box__clear:hover {
  background: #a8a29e;
  color: #fff;
  transform: scale(1.08);
}

.pop-enter-active,
.pop-leave-active {
  transition:
    opacity 0.12s,
    transform 0.12s cubic-bezier(0.4, 0, 0.2, 1);
}
.pop-enter-from,
.pop-leave-to {
  opacity: 0;
  transform: scale(0.5);
}

.counter-swap-enter-active,
.counter-swap-leave-active {
  transition:
    opacity 0.15s,
    transform 0.15s cubic-bezier(0.4, 0, 0.2, 1);
}
.counter-swap-enter-from {
  opacity: 0;
  transform: translateY(-3px);
}
.counter-swap-leave-to {
  opacity: 0;
  transform: translateY(3px);
}
</style>
