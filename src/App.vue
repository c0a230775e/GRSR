<script setup>
import { onMounted } from 'vue'
import { initializeUserId } from './boot/user'

onMounted(() => {
  initializeUserId()
})
</script>

<template>
  <router-view />
</template>