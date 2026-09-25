<template>
  <q-page padding>

    <h5 class="text-center q-mb-lg">予約一覧（管理者）</h5>

    <q-list bordered separator>

      <div
        v-for="(items, date) in groupedReservations"
        :key="date"
        class="date-block"
      >

        <div class="text-h6 q-mt-md q-mb-sm">
          📅 {{ date }}
        </div>

        <!-- 前半 -->
        <div class="text-subtitle2 q-mt-sm">▶ 前半</div>
        <q-item
          v-for="item in items.front"
          :key="item.id"
          :class="item.share ? 'indent-share' : ''"
        >
          <q-item-section>
            <div><b>種類：</b>{{ item.share ? '相乗り予約' : '通常予約' }}</div>
            <div><b>ID：</b>{{ item.id }}</div>
            <div v-if="item.parentId"><b>親ID：</b>{{ item.parentId }}</div>
            <div>人数：{{ item.people }}</div>
            <div>予約時間：{{ item.time }}</div>
            <div>乗車場所：{{ item.from }}</div>
            <div>降車場所：{{ item.to }}</div>
          </q-item-section>

          <q-item-section side>
            <q-btn flat round color="red" icon="delete" @click="remove(item.id)" />
          </q-item-section>
        </q-item>

        <!-- 後半 -->
        <div class="text-subtitle2 q-mt-sm">▶ 後半</div>
        <q-item
          v-for="item in items.back"
          :key="item.id"
          :class="item.share ? 'indent-share' : ''"
        >
          <q-item-section>
            <div><b>種類：</b>{{ item.share ? '相乗り予約' : '通常予約' }}</div>
            <div><b>ID：</b>{{ item.id }}</div>
            <div v-if="item.parentId"><b>親ID：</b>{{ item.parentId }}</div>
            <div>人数：{{ item.people }}</div>
            <div>予約時間：{{ item.time }}</div>
            <div>乗車場所：{{ item.from }}</div>
            <div>降車場所：{{ item.to }}</div>
          </q-item-section>

          <q-item-section side>
            <q-btn flat round color="red" icon="delete" @click="remove(item.id)" />
          </q-item-section>
        </q-item>

      </div>

    </q-list>

  </q-page>
</template>


<script setup>
import { ref, onMounted, computed } from 'vue'
import '@/css/AdminPage.scss'

const reservations = ref([])
const timeSlotsRaw = ref([])

onMounted(async () => {
  loadReservations()

  const url = new URL('@/assets/timeSlots.json', import.meta.url).href
  const res = await fetch(url)
  timeSlotsRaw.value = await res.json()

  window.addEventListener('storage', () => {
    loadReservations()
  })
})

function loadReservations() {
  reservations.value = JSON.parse(localStorage.getItem('reservations') || '[]')
}

//  親予約削除 → 子予約も削除
function remove(id) {
  const target = reservations.value.find(r => r.id === id)
  if (!target) return

  reservations.value = reservations.value.filter(item =>
    !(
      item.rideDate === target.rideDate &&
      item.time === target.time &&
      item.from === target.from &&
      item.to === target.to
    )
  )

  localStorage.setItem('reservations', JSON.stringify(reservations.value))
  window.dispatchEvent(new Event('storage'))
}

/* -------------------------
   ★ groupedReservations
------------------------- */
const groupedReservations = computed(() => {
  const groups = {}

  reservations.value.forEach(r => {
    if (!groups[r.rideDate]) {
      groups[r.rideDate] = { front: [], back: [] }
    }

    const parts = r.rideDate.split('-')
    const month = Number(parts[1])
    const day = Number(parts[2])

    const slot = timeSlotsRaw.value.find(s =>
      Number(s.month) === month &&
      Number(s.date) === day &&
      s.label !== 'フリー運行'
    )

    if (!slot) return

    const [startStr] = slot.label.split('-')
    const [baseHour, baseMin] = startStr.split(':').map(Number)
    const baseTotalMin = baseHour * 60 + baseMin

    const [hour, minute] = r.time.split(':').map(Number)
    const totalMin = hour * 60 + minute

    const offset = totalMin - baseTotalMin

    if (offset === 0 || offset === 10 || offset === 20) {
      groups[r.rideDate].front.push(r)
    } else {
      groups[r.rideDate].back.push(r)
    }
  })

  return groups
})
</script>
