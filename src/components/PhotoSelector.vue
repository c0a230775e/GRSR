<script setup>
import { computed } from 'vue'
const { pins, onPhotoTap, placeSelectMode } = defineProps({
  pins: Array,
  onPhotoTap: Function,
  placeSelectMode: String
})

/* -----------------------------------
   2行 × 縦方向優先の並び順に変換
----------------------------------- */
const arrangedPins = computed(() => {
  const row1 = []  // 上段（奇数 index）
  const row2 = []  // 下段（偶数 index）

  pins.forEach((p, i) => {
    if (i % 2 === 0) row1.push(p)
    else row2.push(p)
  })

  const result = []
  const maxLen = Math.max(row1.length, row2.length)

  for (let i = 0; i < maxLen; i++) {
    if (row1[i]) result.push(row1[i])
    if (row2[i]) result.push(row2[i])
  }

  return result
})
</script>

<template>
  <div v-if="placeSelectMode === 'photo'" class="q-mb-md">
    <div class="photo-scroll-wrapper">
      <div class="photo-grid">
        <div
          v-for="pin in arrangedPins"
          :key="pin.id"
          class="photo-card"
          @click="onPhotoTap(pin)"
        >
          <!-- 写真番号 -->
          <div class="text-center text-bold q-mb-xs">
            No. {{ pin.id }}
          </div>

          <!-- 名前 -->
          <div class="text-center q-mb-xs">
            {{ pin.name }}
          </div>

          <!-- 写真 -->
          <q-img :src="pin.image" class="photo-img" />
        </div>
      </div>
    </div>
  </div>
</template>
