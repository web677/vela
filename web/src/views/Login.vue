<template>
  <div class="luxury-login">
    <VCard class="login-card" padding="xl">
      <div class="login-header">
        <h1 class="login-title">VELA</h1>
        <p class="login-subtitle">欢迎回来</p>
      </div>

      <div class="login-form">
        <VInput
          v-model="form.phone"
          type="tel"
          label="手机号"
          placeholder="请输入手机号"
          required
          :maxlength="11"
        />

        <VInput
          v-model="form.smsCode"
          type="text"
          label="验证码"
          placeholder="请输入验证码"
          required
          :maxlength="6"
          @keyup.enter="handleLogin"
        >
          <template #suffix>
            <button
              class="code-btn"
              @click="handleSendSms"
              :disabled="codeSending || countdown > 0"
            >
              {{
                countdown > 0
                  ? `${countdown}秒`
                  : codeSending
                  ? "发送中"
                  : "获取验证码"
              }}
            </button>
          </template>
        </VInput>

        <VButton
          variant="primary"
          size="lg"
          block
          :loading="loading"
          @click="handleLogin"
        >
          登录 / 注册
        </VButton>

        <p class="login-notice">
          登录即表示同意
          <router-link to="/legal/terms" class="login-link"
            >《用户协议》</router-link
          >
          和
          <router-link to="/legal/privacy" class="login-link"
            >《隐私政策》</router-link
          >
        </p>
      </div>
    </VCard>
  </div>

  <div id="captcha-container"></div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useUserStore } from "@/stores/user";
import { useNotification } from "@/composables/useNotification";
import { VButton, VCard, VInput } from "@/components/ui";
import apiClient from "@/api/client";

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();
const notification = useNotification();

const loading = ref(false);
const codeSending = ref(false);
const countdown = ref(0);
const captchaInstance = ref(null);

const form = ref({
  phone: "",
  smsCode: "",
});

const initCaptcha = async () => {
  try {
    const response = await apiClient.get("/auth/captcha-config");
    const { captchaId } = response.data;

    if (!window.initAlicom4) return;

    window.initAlicom4(
      { captchaId, product: "bind", protocol: "https://" },
      function (captcha) {
        captcha.appendTo("#captcha-container");
        captchaInstance.value = captcha;

        captcha.onSuccess(function () {
          const result = captcha.getValidate();
          if (result) sendSmsCode(result);
        });
      }
    );
  } catch (error) {
    console.error(error);
  }
};

const handleSendSms = () => {
  if (!form.value.phone) {
    notification.warning("请输入手机号");
    return;
  }

  if (!/^1[3-9]\d{9}$/.test(form.value.phone)) {
    notification.warning("请输入有效的手机号");
    return;
  }

  if (captchaInstance.value) {
    captchaInstance.value.showCaptcha();
  }
};

const sendSmsCode = async (validateData) => {
  codeSending.value = true;

  try {
    const response = await apiClient.post("/auth/send-sms-code", {
      phone: `+86${form.value.phone}`,
      lotNumber: validateData.lot_number,
      captchaOutput: validateData.captcha_output,
      passToken: validateData.pass_token,
      genTime: validateData.gen_time,
    });

    if (response.data.success) {
      notification.success("验证码已发送");
      countdown.value = 60;
      const timer = setInterval(() => {
        countdown.value--;
        if (countdown.value <= 0) clearInterval(timer);
      }, 1000);
    }
  } catch (error) {
    notification.error("发送失败");
  } finally {
    codeSending.value = false;
  }
};

const handleLogin = async () => {
  if (!form.value.phone || !form.value.smsCode) {
    notification.warning("请填写完整信息");
    return;
  }

  loading.value = true;

  try {
    const result = await userStore.phoneLogin({
      phone: `+86${form.value.phone}`,
      token: form.value.smsCode,
    });

    if (result.success) {
      notification.success("登录成功");
      setTimeout(() => {
        router.push(route.query.redirect || "/");
      }, 500);
    } else {
      notification.error(result.message || "登录失败");
    }
  } catch (error) {
    notification.error("登录失败");
  } finally {
    loading.value = false;
  }
};

onMounted(() => initCaptcha());
onBeforeUnmount(() => {
  if (captchaInstance.value?.destroy) {
    captchaInstance.value.destroy();
  }
});
</script>

<style scoped>
.luxury-login {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-4xl) var(--spacing-lg);
  background: linear-gradient(
    135deg,
    var(--color-cream) 0%,
    var(--color-bg-secondary) 100%
  );
}

.login-card {
  width: 100%;
  max-width: 460px;
  box-shadow: var(--shadow-elevated);
}

.login-header {
  text-align: center;
  margin-bottom: var(--spacing-3xl);
}

.login-title {
  font-family: var(--font-family-elegant);
  font-size: var(--font-size-4xl);
  font-weight: var(--font-weight-regular);
  color: var(--color-ebony);
  letter-spacing: var(--letter-spacing-wider);
  margin: 0 0 var(--spacing-sm) 0;
}

.login-subtitle {
  font-size: var(--font-size-base);
  color: var(--color-text-secondary);
  letter-spacing: var(--letter-spacing-wide);
  margin: 0;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
}

.code-btn {
  background: none;
  border: none;
  color: var(--color-text-primary);
  font-size: var(--font-size-xs);
  text-transform: uppercase;
  letter-spacing: var(--letter-spacing-wider);
  cursor: pointer;
  transition: var(--transition-base);
  white-space: nowrap;
}

.code-btn:hover:not(:disabled) {
  color: var(--color-ebony);
}

.code-btn:disabled {
  opacity: var(--opacity-disabled);
  cursor: not-allowed;
}

.login-notice {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  text-align: center;
  line-height: var(--line-height-relaxed);
  margin: 0;
}

.login-link {
  color: var(--color-ebony);
  text-decoration: underline;
}

#captcha-container {
  position: fixed;
  z-index: var(--z-modal);
}
</style>

<style>
.captcha4_bind_box,
.captcha4_box_wrap {
  overflow: visible !important;
}
</style>
