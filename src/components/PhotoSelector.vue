<script setup>
const { pins, onPhotoTap, placeSelectMode } = defineProps({
  pins: Array,
  onPhotoTap: Function,
  placeSelectMode: String
})

</script>

<template>
  <!-- 写真モードのときだけ写真一覧を表示 -->
  <div v-if="placeSelectMode === 'photo'" class="q-mb-md">
    <div style="overflow-x: auto; white-space: nowrap;">
      <div class="photo-grid">
        <div
          v-for="pin in pins"
          :key="pin.id"
          class="photo-card"
          @click="onPhotoTap(pin)"
        >
          <div class="text-center q-mb-xs">{{ pin.name }}</div>
          <q-img :src="pin.image" class="photo-img" />
        </div>
      </div>
    </div>
  </div>
</template>
