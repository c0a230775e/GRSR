<script setup>
const { pins, onPhotoTap } = defineProps({
  pins: Array,
  onPhotoTap: Function
})
</script>

<template>
  <div class="q-mb-md">
    <div style="overflow-x: auto; white-space: nowrap;">
      <div class="photo-grid">
        <div
          v-for="pin in pins"
          :key="pin.id"
          class="photo-card"
          @click="onPhotoTap(pin)"
        >
          <div class="text-center text-bold q-mb-xs">No. {{ pin.id }}</div>
          <div class="text-center q-mb-xs">{{ pin.name }}</div>
          <q-img :src="pin.image" class="photo-img" />
        </div>
      </div>
    </div>
  </div>
</template>
