<template>
  <div class="auth-page">
    <header class="auth-header">ИС «Отчеты»</header>

    <div class="auth-card">
      <div class="auth-title">Авторизация</div>

      <div class="auth-actions">
        <button
          class="auth-button"
          @click="loginByEtu"
        >
          Войти через ETU ID
        </button>

        <button
          class="auth-button"
          @click="loginByPartner"
        >
          Войти через Фамилию
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useRouter } from 'vue-router';
  const router = useRouter();

  const loginByEtu = () => {
    router.push('/EtuLogin');
  };

  const loginByPartner = () => {
    router.push('/Login');
  };
</script>

<style scoped>
  .auth-page {
    min-height: 100vh;
    background: #ffffff;
  }

  .auth-header {
    background: #1f3a93;
    color: #ffffff;
    padding: 16px 24px;
    font-size: 18px;
  }

  .auth-card {
    width: 520px;
    margin: 80px auto;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    background: #ffffff;
  }

  .auth-title {
    background: #1f3a93;
    color: #ffffff;
    padding: 14px;
    text-align: center;
    font-size: 18px;
  }

  .auth-actions {
    display: flex;
    gap: 24px;
    padding: 32px;
    justify-content: center;
  }

  .auth-button {
    min-width: 200px;
    padding: 14px 16px;
    border: 1px solid #9aa7e0;
    border-radius: 6px;
    background: #ffffff;
    color: #1f3a93;
    font-size: 14px;
    cursor: pointer;
  }

  .auth-button:hover {
    background: #f3f5ff;
  }
</style>
