<template>
  <div class="not-found-page">
    <header class="nf-header">
      <v-btn
        icon
        variant="text"
        class="nf-icon-btn"
        aria-label="Меню"
        @click="goHome"
      >
        <v-icon
          color="white"
          size="26"
        >
          mdi-menu
        </v-icon>
      </v-btn>
      <span class="nf-header-title">Ошибка 404. Страница не найдена</span>
      <v-spacer />
      <v-btn
        icon
        variant="text"
        class="nf-icon-btn"
        aria-label="Выход"
        @click="logout"
      >
        <v-icon
          color="white"
          size="26"
        >
          mdi-logout
        </v-icon>
      </v-btn>
    </header>

    <main class="nf-body">
      <div class="nf-card">
        <div class="nf-code">404</div>
        <div class="nf-subtitle">СТРАНИЦА НЕ НАЙДЕНА</div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
  import { useRouter } from 'vue-router';
  import { bumpUserStorageTick } from '@/composables/userStorageTick';

  const router = useRouter();

  function goHome() {
    const user = localStorage.getItem('user');
    router.push(user ? '/disciplines' : '/auth');
  }

  function logout() {
    localStorage.removeItem('user');
    bumpUserStorageTick();
    router.push('/auth');
  }
</script>

<style scoped>
  .not-found-page {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    background: #ffffff;
    font-family: system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif;
  }

  .nf-header {
    flex-shrink: 0;
    height: 50px;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 0 8px 0 4px;
    background: #1e3799;
    color: #ffffff;
    box-sizing: border-box;
    box-shadow:
      0 2px 8px rgba(15, 23, 42, 0.12),
      0 1px 0 rgba(255, 255, 255, 0.06) inset;
  }

  .nf-icon-btn {
    color: #ffffff !important;
  }

  .nf-header-title {
    font-size: 14px;
    font-weight: 500;
    letter-spacing: 0.01em;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .nf-body {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 32px 16px;
    background: #ffffff;
  }

  .nf-card {
    border: 1px solid #c8d4e8;
    border-radius: 0;
    padding: 56px 72px 52px;
    text-align: center;
    box-sizing: border-box;
    max-width: 100%;
    box-shadow:
      0 4px 6px -1px rgba(30, 55, 153, 0.08),
      0 12px 24px -4px rgba(15, 23, 42, 0.12),
      0 24px 48px -12px rgba(30, 55, 153, 0.06);
  }

  .nf-code {
    font-size: 110px;
    font-weight: 700;
    line-height: 0.95;
    color: #1e3799;
    letter-spacing: 0.02em;
  }

  .nf-subtitle {
    margin-top: 24px;
    font-size: 17px;
    font-weight: 700;
    color: #1e3799;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }
</style>
