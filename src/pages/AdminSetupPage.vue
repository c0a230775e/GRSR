<!-- <template>
  <q-page class="q-pa-md">
    <h4>管理者端末設定</h4>

    <q-btn
      label="この端末を管理者として登録"
      color="primary"
      class="full-width q-mt-md"
      @click="setAdmin"
    />
  </q-page>
</template>

<script setup>
import { useQuasar } from 'quasar'

const $q = useQuasar()

function setAdmin() {
  localStorage.setItem('isAdmin', 'true')
  $q.notify({ type: 'positive', message: '管理者端末として登録されました' })
}
</script> -->
