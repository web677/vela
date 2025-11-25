<template>
  <div class="register-page">
    <div class="auth-container card">
      <h1 class="auth-title">注册</h1>

      <form @submit.prevent="handleRegister" class="auth-form">
        <div class="form-group">
          <label>邮箱</label>
          <input 
            v-model="form.email" 
            type="email" 
            class="input" 
            placeholder="your@email.com"
            required 
          />
        </div>

        <div class="form-group">
          <label>密码</label>
          <input 
            v-model="form.password" 
            type="password" 
            class="input" 
            placeholder="至少6位"
            required 
          />
        </div>

        <div class="form-group">
          <label>姓名（选填）</label>
          <input 
            v-model="form.full_name" 
            type="text" 
            class="input" 
            placeholder="您的姓名"
          />
        </div>

        <div class="form-group">
          <label>电话（选填）</label>
          <input 
            v-model="form.phone" 
            type="tel" 
            class="input" 
            placeholder="手机号码"
          />
        </div>

        <button 
          type="submit" 
          :disabled="loading"
          class="btn btn-primary btn-lg btn-block"
        >
          {{ loading ? '注册中...' : '注册' }}
        </button>
      </form>

      <p class="auth-footer">
        已有账号？
        <router-link to="/login" class="link">立即登录</router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

const loading = ref(false)
const form = ref({
  email: '',
  password: '',
  full_name: '',
  phone: ''
})

const handleRegister = async () => {
  if (form.value.password.length < 6) {
    alert('密码至少6位')
    return
  }

  loading.value = true
  const result = await userStore.register(form.value)
  loading.value = false

  if (result.success) {
    router.push('/')
  } else {
    alert(result.message || '注册失败')
  }
}
</script>

<style scoped>
.register-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 200px);
  padding: 2rem;
}

.auth-container {
  width: 100%;
  max-width: 400px;
  padding: 2.5rem;
}

.auth-title {
  font-size: 2rem;
  font-weight: 700;
  text-align: center;
  margin-bottom: 2rem;
  color: var(--color-text-primary);
  background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-size: 0.9375rem;
  font-weight: 500;
  color: var(--color-text-secondary);
}

.btn-block {
  width: 100%;
  margin-top: 1rem;
}

.auth-footer {
  text-align: center;
  margin-top: 2rem;
  color: var(--color-text-secondary);
}

.link {
  color: var(--color-primary);
  text-decoration: none;
  font-weight: 600;
  transition: color var(--transition-base);
}

.link:hover {
  color: var(--color-primary-light);
}
</style>
