<template>
  <q-page class="flex flex-center">
    <q-card style="width: 320px">
      <q-card-section>
        <div class="text-h6 text-center">
          管理者認証
        </div>
      </q-card-section>

      <q-card-section>
        <q-input
          v-model="password"
          label="パスワード"
          type="password"
          outlined
        />
      </q-card-section>

      <q-card-section>
        <q-btn
          color="primary"
          label="ログイン"
          class="full-width"
          @click="login"
        />
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/supabase'

const router = useRouter()
const password = ref('')

async function login () {
  const { data, error } = await supabase
    .from('settings')
    .select('value')
    .eq('key', 'admin_password')
    .single()


    console.log(data)
    console.log(error)

  if (error) {
    alert('設定取得エラー')
    console.error(error)
    return
  }

  if (password.value !== data.value) {
    alert('パスワードが違います')
    return
  }

  localStorage.setItem('adminAuth', 'true')
  console.log(data)
console.log(error)

  router.push('/admin')
}
</script>