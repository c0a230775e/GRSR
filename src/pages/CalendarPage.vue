<template>
  <q-page padding>
    <h4>予約データ一覧</h4>

    <q-list bordered class="q-mt-md">
      <q-item v-for="(slot, index) in timeSlots" :key="index">
        <q-item-section>
          <div class="text-h6">月：{{ slot.month }}</div>
          <div class="text-h6">日付：{{ slot.date }}</div>
          <div class="text-body1">内容：{{ slot.label }}</div>
        </q-item-section>
      </q-item>
    </q-list>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const timeSlots = ref([])

onMounted(async () => {
  const url = new URL('@/assets/timeSlots.json', import.meta.url).href
  const res = await fetch(url + '?ts=' + Date.now())
  const json = await res.json()
  console.log("FETCH:", json)
  timeSlots.value = json
})
</script>
