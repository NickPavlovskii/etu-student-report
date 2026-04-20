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
        :loading="loading"
        :disabled="loading"
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

<script setup lang="ts">
  import { ref } from 'vue';
  import { useRouter } from 'vue-router';
  import { loginByLastName } from '@/api/info';
  import { bumpUserStorageTick } from '@/composables/userStorageTick';

  const router = useRouter();
  const lastName = ref('');
  const error = ref(false);
  const loading = ref(false);

  function makeFioShort(p: Record<string, unknown>) {
    const ln = String(p.lastName ?? '').trim();
    const fn = String(p.firstName ?? '').trim();
    const pt = String(p.patronymic ?? '').trim();

    const initials = (fn ? fn[0] + '.' : '') + (pt ? pt[0] + '.' : '');
    return (ln + (initials ? ' ' + initials : '')).trim() || 'Преподаватель';
  }

  function normalizeLastName(s: string) {
    return String(s ?? '')
      .trim()
      .split(/\s+/)
      .map((w) => {
        if (!w) return '';
        const head = w[0];
        return head
          ? head.toUpperCase() + w.slice(1).toLowerCase()
          : '';
      })
      .join(' ');
  }

  function unwrapProfile(raw: unknown): Record<string, unknown> | null {
    if (raw == null || typeof raw !== 'object' || Array.isArray(raw)) {
      return null;
    }
    let o = raw as Record<string, unknown>;
    if (
      'data' in o &&
      o.data != null &&
      typeof o.data === 'object' &&
      !Array.isArray(o.data)
    ) {
      o = o.data as Record<string, unknown>;
    }
    if (o.ok === false || o.success === false || o.found === false) {
      return null;
    }
    return o;
  }

  const login = async () => {
    error.value = false;

    const ln = normalizeLastName(lastName.value);
    if (!ln || loading.value) return;

    try {
      loading.value = true;
      localStorage.removeItem('user');
      bumpUserStorageTick();

      const raw = await loginByLastName(ln);
      const profile = unwrapProfile(raw);
      if (!profile) {
        error.value = true;
        return;
      }

      const roleRaw = (profile.role ?? 'TEACHER').toString().toUpperCase().trim();
      const role = roleRaw || 'TEACHER';

      const userToStore = {
        lastName: String(profile.lastName ?? ln),
        firstName: String(profile.firstName ?? ''),
        patronymic: String(profile.patronymic ?? ''),
        fioShort: String(profile.fioShort ?? makeFioShort(profile)),

        role,
        roleDisplay: String(
          profile.roleDisplay ??
            (role === 'ADMIN' ? 'Администратор' : 'Преподаватель')
        ),
        status: String(profile.status ?? 'active'),

        department: String(profile.department ?? profile.departmentName ?? ''),
        position: String(profile.position ?? ''),
        rank: String(profile.rank ?? ''),
        degree: String(profile.degree ?? ''),
      };

      localStorage.setItem('user', JSON.stringify(userToStore));
      bumpUserStorageTick();

      await router.replace({ name: 'disciplines' });
    } catch (e) {
      console.error('[LoginPage]', e);
      error.value = true;
    } finally {
      loading.value = false;
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
