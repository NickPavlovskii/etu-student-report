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
        @keyup.enter="login"
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
  import { loginByLastName } from '@/api/info';

  const router = useRouter();
  const lastName = ref('');
  const error = ref(false);

  function makeFioShort(p) {
    const ln = (p?.lastName ?? '').trim();
    const fn = (p?.firstName ?? '').trim();
    const pt = (p?.patronymic ?? '').trim();

    const initials = (fn ? fn[0] + '.' : '') + (pt ? pt[0] + '.' : '');
    return (ln + (initials ? ' ' + initials : '')).trim() || 'Преподаватель';
  }

  function normalizeLastName(s) {
    return String(s ?? '')
      .trim()
      .split(/\s+/)
      .map((w) => (w ? w[0].toUpperCase() + w.slice(1).toLowerCase() : ''))
      .join(' ');
  }

  const login = async () => {
    error.value = false;

    const ln = normalizeLastName(lastName.value);
    if (!ln) return;

    try {
      localStorage.removeItem('user');

      const profile = await loginByLastName(ln);

      if (!profile || profile.ok === false) {
        error.value = true;
        return;
      }

      const roleRaw = (profile.role ?? 'TEACHER').toString().toUpperCase().trim();
      const role = roleRaw || 'TEACHER';

      const userToStore = {
        lastName: profile.lastName ?? ln,
        firstName: profile.firstName ?? '',
        patronymic: profile.patronymic ?? '',
        fioShort: profile.fioShort ?? makeFioShort(profile),

        role,
        roleDisplay: profile.roleDisplay ?? (role === 'ADMIN' ? 'Администратор' : 'Преподаватель'),
        status: profile.status ?? 'active',

        department: profile.department ?? profile.departmentName ?? '',
        position: profile.position ?? '',
        rank: profile.rank ?? '',
        degree: profile.degree ?? '',
      };

      localStorage.setItem('user', JSON.stringify(userToStore));

      router.push('/disciplines');
    } catch (e) {
      console.error(e);
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
