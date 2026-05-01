<template>
  <div class="login-page">
    <div class="login-card">
      <div class="login-header">
        <el-icon size="48" color="#60a5fa"><OfficeBuilding /></el-icon>
        <h1>人事管理系統</h1>
        <p>HR Management System</p>
      </div>

      <el-form
        :model="form"
        :rules="rules"
        ref="formRef"
        size="large"
        @submit.prevent="handleLogin"
      >
        <el-form-item prop="username">
          <el-input
            v-model="form.username"
            placeholder="帳號"
            :prefix-icon="User"
            class="login-input"
          />
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="密碼"
            :prefix-icon="Lock"
            show-password
            class="login-input"
            @keyup.enter="handleLogin"
          />
        </el-form-item>

        <el-button
          type="primary"
          :loading="loading"
          size="large"
          style="width: 100%; margin-top: 8px"
          @click="handleLogin"
        >
          登入
        </el-button>
      </el-form>

      <p class="hint">預設帳號：admin　密碼：Admin@1234</p>
    </div>

    <!-- Background decorations -->
    <div class="bg-orb orb1"></div>
    <div class="bg-orb orb2"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { User, Lock, OfficeBuilding } from "@element-plus/icons-vue";
import { useAuthStore } from "@/stores/auth";

const router = useRouter();
const authStore = useAuthStore();
const formRef = ref();
const loading = ref(false);

const form = reactive({ username: "", password: "" });
const rules = {
  username: [{ required: true, message: "請輸入帳號", trigger: "blur" }],
  password: [{ required: true, message: "請輸入密碼", trigger: "blur" }],
};

async function handleLogin() {
  await formRef.value.validate();
  loading.value = true;
  try {
    await authStore.login(form.username, form.password);
    ElMessage.success("登入成功");
    router.push("/dashboard");
  } catch {
    ElMessage.error("帳號或密碼錯誤");
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #0f172a;
  position: relative;
  overflow: hidden;
}

.login-card {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 16px;
  padding: 48px 40px;
  width: 420px;
  position: relative;
  z-index: 1;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
}

.login-header {
  text-align: center;
  margin-bottom: 36px;
}
.login-header h1 {
  color: #f1f5f9;
  font-size: 24px;
  margin: 12px 0 4px;
  font-weight: 700;
}
.login-header p {
  color: #64748b;
  font-size: 14px;
}

:deep(.login-input .el-input__wrapper) {
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 8px;
  color: #f1f5f9;
}
:deep(.login-input .el-input__inner) {
  color: #f1f5f9;
}

.hint {
  text-align: center;
  color: #475569;
  font-size: 12px;
  margin-top: 20px;
}

.bg-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.15;
}
.orb1 {
  width: 400px;
  height: 400px;
  background: #3b82f6;
  top: -100px;
  right: -100px;
}
.orb2 {
  width: 300px;
  height: 300px;
  background: #6366f1;
  bottom: -80px;
  left: -80px;
}
</style>
