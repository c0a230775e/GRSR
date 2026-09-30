<script setup>
const { people, rideDate, time, from, to } = defineProps({
  people: String,
  rideDate: String,
  time: Object,
  from: Object,
  to: Object
})
</script>


<template>
  <div class="q-mt-lg q-pa-md bg-grey-2 rounded-borders">
    <div class="text-subtitle1 q-mb-sm">選択内容</div>

    <div>乗車人数：{{ people || '未選択' }}</div>
    <div>乗車日：{{ rideDate || '未選択' }}</div>
    <div>予約時間：{{ time?.label || '未選択' }}</div>
    <div>乗車場所：{{ from?.name || '未選択' }}</div>
    <div>降車場所：{{ to?.name || '未選択' }}</div>
  </div>
</template>
