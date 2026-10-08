<template>
  <q-page padding>
    <h5 class="text-center q-mb-lg">予約一覧</h5>

    <div v-for="t in sortedTimes" :key="t" class="q-mb-md">

      <!-- 親予約 -->
      <div v-if="grouped[t].parent" class="q-pa-sm bg-grey-3 rounded-borders">
        <div class="text-bold">{{ t }}</div>
        <div>{{ grouped[t].parent.ride_date }}</div>
        <div>{{ grouped[t].parent.people }}人</div>
        <div>{{ grouped[t].parent.from_name }} → {{ grouped[t].parent.to_name }}</div>

        <!-- ★ 削除ボタン（親予約） -->
        <q-btn
          color="red"
          flat
          label="削除"
          class="q-mt-sm"
          @click="removeReservation(grouped[t].parent)"
        />
      </div>

      <!-- 相乗り予約（インデント表示） -->
      <div
        v-for="child in grouped[t].children"
        :key="child.id"
        class="q-pa-sm q-ml-lg bg-grey-2 rounded-borders"
      >
        <div class="text-bold">相乗り予約</div>
        <div>{{ child.people }}人</div>
        <div>{{ child.from_name }} → {{ child.to_name }}</div>

        <!-- ★ 削除ボタン（子予約） -->
        <q-btn
          color="red"
          flat
          label="削除"
          class="q-mt-sm"
          @click="removeReservation(child)"
        />
      </div>

    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { supabase } from '@/supabase'

const reservations = ref([])

// 予約一覧を Supabase から取得
async function loadReservations() {
  const { data, error } = await supabase
    .from('reservations')
    .select('*')
    .order('time', { ascending: true })

  if (error) {
    console.error('Supabase error:', error)
    return
  }

  reservations.value = data
}

/* -------------------------
   ★ 削除処理（親なら子も削除）
------------------------- */
async function removeReservation(item) {
  if (!item) return

  // 親予約の場合 → 子予約も削除
  if (item.share === false) {
    const { error: childErr } = await supabase
      .from('reservations')
      .delete()
      .eq('parentId', item.id)

    if (childErr) {
      console.error('子予約削除エラー:', childErr)
    }
  }

  // 親・子どちらでも自身を削除
  const { error } = await supabase
    .from('reservations')
    .delete()
    .eq('id', item.id)

  if (error) {
    console.error('予約削除エラー:', error)
    return
  }

  // 再読み込み
  loadReservations()
}

// 時間帯ごとにグループ化
const grouped = computed(() => {
  const map = {}

  reservations.value.forEach(r => {
    if (!map[r.time]) map[r.time] = { parent: null, children: [] }

    if (r.share === false) {
      map[r.time].parent = r
    } else {
      map[r.time].children.push(r)
    }
  })

  return map
})

// 時間順に並べる
const sortedTimes = computed(() => {
  return Object.keys(grouped.value).sort()
})

onMounted(() => {
  loadReservations()
})
</script>
