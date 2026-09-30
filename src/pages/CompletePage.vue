<template>
  <q-page padding class="column flex-center">

    <div class="text-h5 text-center q-mb-md">
      {{ isShare ? '相乗り申請が完了しました！' : '予約が完了しました！' }}
    </div>

    <div class="text-center q-mb-xl">
      乗車の際は手をあげて、運転手にアピールしてください。
    </div>

    <!-- ★ 予約内容の表示 -->
    <div class="q-pa-md bg-grey-2 rounded-borders q-mb-xl" style="width: 100%; max-width: 400px;">
      <div class="text-subtitle1 q-mb-sm">
        {{ isShare ? '相乗り内容' : '予約内容' }}
      </div>

      <div>乗車人数：{{ info.people }}</div>
      <div>乗車日：{{ info.rideDate }}</div>
      <div>予約時間：{{ info.time }}</div>
      <div>乗車場所：{{ info.from }}</div>
      <div>降車場所：{{ info.to }}</div>
    </div>

    <!-- チェックボタン -->
    <q-btn
      label="✔"
      color="primary"
      class="full-width q-mt-xl"
      @click="goHome"
    />

  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { supabase } from '@/supabase'

const router = useRouter()
const route = useRoute()

const isShare = ref(false)
const info = ref({
  people: '',
  rideDate: '',
  time: '',
  from: '',
  to: ''
})

onMounted(async () => {
  // ★ 相乗り申請で来たかどうか判定
  if (route.query.mode === 'share') {
    isShare.value = true

    info.value = {
      people: route.query.people,
      rideDate: route.query.rideDate,
      time: route.query.time,
      from: route.query.from,
      to: route.query.to
    }
    return
  }

  // ★ 通常予約（Supabase の最新予約を取得）
  const { data, error } = await supabase
    .from('reservations')
    .select('*')
    .order('id', { ascending: false })
    .limit(1)

  if (error) {
    console.error('Supabase error:', error)
    return
  }

  const last = data[0]

  info.value = {
    people: last?.people,
    rideDate: last?.ride_date,
    time: last?.time,
    from: last?.from_name,
    to: last?.to_name
  }
})

function goHome() {
  router.push('/')
}
</script>
