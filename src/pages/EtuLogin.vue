<template>
  <div class="login-wrapper">
    <div class="login-card">
      <div class="header">
        <div class="row">
          <div class="col-12 d-flex justify-content-center flex-row mb-3">
            <div>
              <a href="/">
                <img
                  src="../assets/logo.jpg"
                  class="head-image mr-2"
                  style="width: 40px"
                  alt=""
                />
              </a>
            </div>
            <div>
              <div
                class="mr-3 rounded-circle"
                style="font-size: 75%; padding: 10px; background-color: #05336e"
              >
                <v-icon
                  size="25"
                  color="white"
                >
                  mdi-archive-outline
                </v-icon>
              </div>
            </div>
            <div class="d-flex flex-center">
              <h2 class="title mb-0">Отчеты</h2>
            </div>
          </div>
        </div>

        <form
          class="mt-2 d-flex flex-column align-items-center text-center"
          role="form"
          method="POST"
          action="https://lk.etu.ru/login"
        >
          <input
            type="hidden"
            name="_token"
            value="ll4Yfwf6FXmCp9R9ogMQc85Q5SKfy67nBkCplvvl"
          />
          <input
            type="text"
            name="etuid"
            value="true"
            hidden=""
          />

          <p
            class="mb-3"
            style="color: #000; font-size: 1.25rem"
          >
            Войти или зарегистрироваться&nbsp;через
          </p>
          <button
            @click="login"
            data-eid="login"
            type="submit"
            class="btn-etuid px-5 d-flex align-items-center justify-content-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              style="height: 2rem"
              viewBox="0 0 264.78 75"
            >
              <g>
                <path
                  d="M105.95,64.69h-23.84V8.11h23.84v7.35h-15.33v16.06h14.36v7.39h-14.36v18.27h15.33v7.51Z"
                  style="fill: #000000; stroke-width: 0px"
                ></path>
                <path
                  d="M129.56,64.69h-8.44V15.58h-10.8v-7.47h29.99v7.47h-10.76v49.11Z"
                  style="fill: #000000; stroke-width: 0px"
                ></path>
                <path
                  d="M179.05,8.11v38.43c0,4.31-.62,7.86-1.88,10.64-1.25,2.79-3.08,4.86-5.5,6.23-2.41,1.37-5.4,2.05-8.96,2.05-5.32,0-9.38-1.54-12.19-4.62-2.81-3.08-4.22-7.81-4.22-14.18V8.11h8.51v38.39c0,4.05.68,6.96,2.03,8.73,1.35,1.77,3.32,2.65,5.9,2.65,1.7,0,3.13-.38,4.28-1.14,1.15-.76,2.02-1.98,2.61-3.66.59-1.68.89-3.9.89-6.66V8.11h8.51Z"
                  style="fill: #000000; stroke-width: 0px"
                ></path>
                <path
                  d="M203.21,64.69V8.11h13.47v56.58h-13.47Z"
                  style="fill: #000000; stroke-width: 0px"
                ></path>
                <path
                  d="M264.78,35.2c0,6.27-.95,11.6-2.84,15.98s-4.64,7.73-8.22,10.04c-3.59,2.31-7.95,3.46-13.08,3.46h-14.59V8.11h15.52c4.95,0,9.16,1.04,12.62,3.13,3.46,2.09,6.09,5.15,7.89,9.17,1.81,4.03,2.71,8.95,2.71,14.78ZM250.85,35.74c0-3.82-.35-6.9-1.06-9.25-.71-2.35-1.77-4.06-3.17-5.13-1.41-1.07-3.17-1.61-5.28-1.61h-1.82v33.21h1.04c3.56,0,6.17-1.39,7.82-4.18,1.65-2.79,2.48-7.13,2.48-13.04Z"
                  style="fill: #000000; stroke-width: 0px"
                ></path>
                <path
                  d="M28.28,0C12.68,0,0,12.68,0,28.27v12.47c0,3.74.75,10.96,5.72,17.21,2.21,2.77,4.97,4.94,8.19,6.43,3.54,1.65,7.66,2.49,12.24,2.49,5.47,0,10.95-2.39,15.04-6.55,4.42-4.49,6.85-10.67,6.85-17.42v-14.64c0-10.89-8.86-19.75-19.75-19.75-10.89,0-19.75,8.86-19.75,19.75v14.66c0,1.93.45,3.85,1.35,5.72,1.26,2.63,3.27,4.92,5.8,6.63,2.65,1.78,5.61,2.72,8.56,2.73,2.8-.04,5.26-.49,7.35-1.48,2.83-1.32,5.02-3.61,6.33-6.6,1.05-2.38,1.58-5.2,1.58-8.38v-13.29c0-6.19-5.04-11.22-11.22-11.22-6.19,0-11.22,5.04-11.22,11.22v14.66c0,1.84.74,3.63,2.05,4.92,1.32,1.31,3.06,2.03,4.92,2.03,3.83,0,6.95-3.12,6.95-6.95v-14.66c0-1.28-1.04-2.32-2.32-2.32s-2.32,1.04-2.32,2.32v14.66c0,.63-.23,1.19-.67,1.63-.89.88-2.41.87-3.29,0-.44-.44-.68-1.01-.68-1.63v-14.66c0-1.76.69-3.41,1.93-4.66,1.25-1.25,2.9-1.93,4.65-1.93,1.75,0,3.41.69,4.65,1.93,1.25,1.25,1.93,2.9,1.93,4.65v13.28c0,1.64-.17,3.15-.51,4.5-.27,1.09-.65,2.07-1.13,2.91-.78,1.37-1.8,2.39-3.12,3.12-1.55.85-3.52,1.28-5.86,1.29h-.01c-2.64,0-5.5-1.24-7.67-3.31-1.05-1-1.91-2.18-2.5-3.41-.59-1.22-.9-2.51-.9-3.72v-14.66c0-4.03,1.57-7.82,4.43-10.68,2.86-2.86,6.65-4.43,10.68-4.43s7.82,1.57,10.68,4.43c2.86,2.86,4.43,6.65,4.43,10.68v14.64c0,7.07-3,11.61-5.52,14.17-3.22,3.28-7.49,5.16-11.72,5.16h-.02c-3.88,0-7.34-.69-10.28-2.06-3.76-1.76-6.67-4.6-8.65-8.44-1.66-3.24-2.57-7.15-2.57-11v-12.47c0-6.31,2.46-12.25,6.92-16.71s10.4-6.92,16.71-6.92,12.25,2.46,16.71,6.92c4.46,4.46,6.92,10.4,6.92,16.71v15.86c0,6.43-2.55,13.04-7.02,18.12-2.19,2.49-4.8,4.54-7.55,5.91-2.91,1.46-5.96,2.2-9.06,2.2-1.28,0-2.32,1.04-2.32,2.32s1.04,2.32,2.32,2.32c3.84,0,7.58-.91,11.14-2.69,4.96-2.49,9.24-6.51,12.36-11.64,3.12-5.12,4.77-10.84,4.77-16.54v-15.86c0-15.59-12.69-28.27-28.27-28.27Z"
                  style="fill: #4582ec; stroke-width: 0px"
                ></path>
              </g>
            </svg>
          </button>
        </form>
      </div>
    </div>
    <footer class="footer">
      <div>webmaster@etu.ru</div>
      <div>СПбГЭТУ «ЛЭТИ»</div>
    </footer>
  </div>
</template>

<script setup lang="ts">
  import { useRouter } from 'vue-router';

  const router = useRouter();

  const login = () => {
    router.push('/Login');
  };
</script>

<style scoped>
  .login-wrapper {
    min-height: 100vh;
    background: #f5f7fb;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .login-card {
    background: #ffffff;
    width: 640px;
    margin-top: 80px;
    padding: 32px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
    border-radius: 6px;
  }
  .btn-etuid {
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: center;

    border-radius: 3rem;
    border: 2px solid #4582ec;
    padding: 12px 48px;
    background: #ffffff;
    cursor: pointer;
    transition: background-color 0.25s;
  }
  .login-header {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .logos {
    display: flex;
    gap: 8px;
  }
  .logo-circle {
    width: 35px;
    height: 35px;
    border-radius: 50%;
    border: 2px solid #05336e;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    color: white;
    background-color: #05336e;
  }
  .logo {
    width: 42px;
    height: 42px;

    display: flex;
    align-items: center;
    justify-content: center;
  }

  .title {
    font-size: 22px;
    color: #1f3a93;
    font-family: Open Sans Condensed, Helvetica Neue, Helvetica, Arial,
      sans-serif;
  }

  .login-content {
    text-align: center;
    margin-top: 32px;
  }

  .etu-button {
    margin-top: 16px;
    padding: 14px 36px;
    border-radius: 30px;
    border: 2px solid #3b6df0;
    background: #ffffff;
    color: #000;
    font-size: 18px;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 12px;
  }

  .etu-button:hover {
    background: #f0f4ff;
  }

  .fingerprint {
    font-size: 20px;
    color: #3b6df0;
  }

  .links {
    margin-top: 24px;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .links a {
    font-size: 14px;
    color: #1f3a93;
    text-decoration: none;
  }

  .footer {
    margin-top: auto;
    padding: 24px;
    font-size: 13px;
    text-align: center;
  }

  .footer-links {
    margin-top: 8px;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
</style>
