<template>
  <div class="login-page">
    <div class="auth-container card">
      <h1 class="auth-title">登录</h1>

      <div class="auth-form">
        <!-- 手机号 -->
        <div class="form-group">
          <label>手机号</label>
          <input
            v-model="form.phone"
            type="tel"
            class="input"
            placeholder="请输入手机号"
            maxlength="11"
          />
        </div>

        <!-- 短信验证码 -->
        <div class="form-group">
          <label>短信验证码</label>
          <div style="display: flex; gap: 12px; align-items: center">
            <input
              v-model="form.smsCode"
              type="text"
              class="input"
              placeholder="请输入短信验证码"
              style="flex: 1"
              maxlength="6"
              @keyup.enter="handleLogin"
            />
            <button
              type="button"
              class="btn btn-secondary"
              @click="handleSendSms"
              :disabled="codeSending || countdown > 0"
            >
              {{
                countdown > 0
                  ? `${countdown}秒后重试`
                  : codeSending
                  ? "发送中..."
                  : "获取验证码"
              }}
            </button>
          </div>
        </div>

        <!-- 登录按钮 -->
        <button
          type="button"
          @click="handleLogin"
          :disabled="loading"
          class="btn btn-primary btn-lg btn-block"
        >
          {{ loading ? "登录中..." : "登录/注册" }}
        </button>

        <!-- 隐私提示 -->
        <p class="privacy-notice">
          登录即表示您已阅读并同意我们的
          <router-link to="/legal/terms" target="_blank" class="privacy-link"
            >《用户服务协议》</router-link
          >
          和
          <router-link to="/legal/privacy" target="_blank" class="privacy-link"
            >《隐私政策》</router-link
          >
        </p>
      </div>

      <p class="auth-footer">没有账号？输入手机号和验证码将自动注册</p>
    </div>
  </div>
  <!-- 阿里云图形验证码容器 -->
  <div id="captcha-container"></div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useUserStore } from "@/stores/user";
import { useNotification } from "@/composables/useNotification";
import apiClient from "@/api/client";

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();
const notification = useNotification();

const loading = ref(false);
const codeSending = ref(false);
const countdown = ref(0);
const captchaInstance = ref(null);
const captchaReady = ref(false);

const form = ref({
  phone: "18516577205",
  smsCode: "",
});

// 初始化阿里云图形验证
const initCaptcha = async () => {
  try {
    const response = await apiClient.get("/auth/captcha-config");
    const { captchaId } = response.data;

    if (!window.initAlicom4) {
      notification.error("验证码SDK未加载");
      return;
    }

    window.initAlicom4(
      {
        captchaId: captchaId,
        product: "bind",
        protocol: "https://",
      },
      function (captcha) {
        captcha.appendTo("#captcha-container");

        window.captchaObj = captcha;
        captchaInstance.value = captcha;

        captcha.onReady(function () {
          captchaReady.value = true;
        });

        captcha.onSuccess(function () {
          const result = captcha.getValidate();
          if (result) {
            sendSmsCode(result);
          }
        });

        captcha.onFail(function () {
          notification.error("图形验证失败，请重试");
        });

        captcha.onError(function (err) {
          notification.error("验证码出错");
        });
      }
    );
  } catch (error) {
    notification.error("初始化验证码失败");
  }
};

// 点击获取验证码按钮
const handleSendSms = () => {
  // 验证手机号
  if (!form.value.phone) {
    notification.warning("请输入手机号");
    return;
  }

  const phoneRegex = /^1[3-9]\d{9}$/;
  if (!phoneRegex.test(form.value.phone)) {
    notification.warning("请输入有效的手机号");
    return;
  }

  // 检查发送频率
  if (codeSending.value || countdown.value > 0) {
    return;
  }

  // 调起阿里云图形验证
  if (!captchaInstance.value) {
    notification.error("验证码未初始化，请刷新页面重试");
    return;
  }

  captchaInstance.value.showCaptcha();
};

// 发送短信验证码（在图形验证成功后调用）
const sendSmsCode = async (validateData) => {
  if (!validateData) {
    notification.error("验证参数无效");
    return;
  }

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
      // 开始倒计时
      countdown.value = 60;
      const timer = setInterval(() => {
        countdown.value--;
        if (countdown.value <= 0) {
          clearInterval(timer);
        }
      }, 1000);
    } else {
      notification.error(response.data.message || "发送验证码失败");
    }
  } catch (error) {
    notification.error("发送验证码失败，请重试");
  } finally {
    codeSending.value = false;
  }
};

// 登录
const handleLogin = async () => {
  if (loading.value) return;

  if (!form.value.phone || !form.value.smsCode) {
    notification.warning("请输入手机号和短信验证码");
    return;
  }

  loading.value = true;

  try {
    const result = await userStore.phoneLogin({
      phone: `+86${form.value.phone}`,
      token: form.value.smsCode,
    });

    if (result.success) {
      notification.success("登录成功！");
      setTimeout(() => {
        const redirect = route.query.redirect || "/";
        router.push(redirect);
      }, 500);
    } else {
      notification.error(result.message || "登录失败，请重试");
    }
  } catch (error) {
    notification.error("登录失败，请检查验证码后重试");
  } finally {
    loading.value = false;
  }
};

// 页面加载时初始化图形验证
onMounted(() => {
  initCaptcha();
});

// 组件卸载时销毁验证码实例
onBeforeUnmount(() => {
  if (captchaInstance.value && captchaInstance.value.destroy) {
    captchaInstance.value.destroy();
  }
});
</script>

<style scoped>
.login-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 200px);
  padding: var(--spacing-xl);
  background-color: var(--color-bg-primary);
}

.auth-container {
  width: 100%;
  max-width: 420px;
  padding: var(--spacing-3xl);
  background-color: var(--color-bg-elevated);
  border: 1px solid var(--color-border-light);
}

.auth-title {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  text-align: center;
  margin-bottom: var(--spacing-2xl);
  color: var(--color-primary);
  font-family: var(--font-heading);
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.form-group label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
}

.btn-block {
  width: 100%;
  margin-top: var(--spacing-md);
}

.btn-secondary {
  padding: var(--spacing-sm) var(--spacing-md);
  white-space: nowrap;
  min-width: 120px;
}

.auth-footer {
  text-align: center;
  margin-top: var(--spacing-2xl);
  padding-top: var(--spacing-xl);
  border-top: 1px solid var(--color-border-light);
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.link {
  color: var(--color-primary);
  text-decoration: none;
  font-weight: var(--font-weight-semibold);
  transition: color var(--duration-base);
}

.link:hover {
  color: var(--color-primary-dark);
}

.privacy-notice {
  margin-top: var(--spacing-lg);
  padding: var(--spacing-md);
  background-color: var(--color-bg-secondary);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  text-align: center;
  line-height: var(--line-height-relaxed);
}

.privacy-link {
  color: var(--color-primary);
  text-decoration: underline;
  white-space: nowrap;
}

.privacy-link:hover {
  color: var(--color-primary-dark);
}

/* 验证码容器 - 与测试页面保持完全一致 */
#captcha-container {
  /* height: 0; */
}
</style>
<style>
.captcha4_bind_box,
.captcha4_box_wrap {
  overflow: visible;
}
</style>
