<template>
  <v-container class="login-page">
    <v-card
      class="login-card"
      elevation="2"
    >
      <h2>Авторизация</h2>

      <el-input
        v-model="lastName"
        placeholder="Введите фамилию преподавателя"
        clearable
      />

      <v-btn
        color="primary"
        class="mt-4"
        @click="login"
      >
        Войти
      </v-btn>

      <p
        v-if="error"
        class="error-text"
      >
        Преподаватель не найден
      </p>
    </v-card>
  </v-container>
</template>

<script setup>
  import { ref } from 'vue';
  import { useRouter } from 'vue-router';
  import disciplinesDB from '../db/db.json';

  const router = useRouter();
  const lastName = ref('');
  const error = ref(false);

  const login = () => {
    const teacherExists = disciplinesDB.some(
      (d) =>
        d.LastName &&
        d.LastName.toLowerCase() === lastName.value.trim().toLowerCase()
    );

    if (teacherExists) {
      localStorage.setItem('teacher', lastName.value.trim());
      router.push('/uploadWork');
    } else {
      error.value = true;
    }
  };
</script>

<style scoped>
  .login-page {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    background: #f5f6f8;
  }
  .login-card {
    padding: 24px;
    border-radius: 16px;
    width: 400px;
    text-align: center;
  }
  .error-text {
    color: red;
    margin-top: 12px;
  }
</style>

<style scoped>
  .login-page {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    background: #f5f6f8;
  }
  .login-card {
    padding: 24px;
    border-radius: 16px;
    width: 400px;
    text-align: center;
  }
  .error-text {
    color: red;
    margin-top: 12px;
  }
</style>
