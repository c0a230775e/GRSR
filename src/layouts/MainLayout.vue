<template>
  <q-layout view="lHh Lpr lFf" class="layout-bg">

    <q-header class="custom-header">
      <q-toolbar>
        <q-toolbar-title
          class="text-center header-title"
          @click="onTitleClick"
        >
          ベイ太くん乗車予約
        </q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>

  </q-layout>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const tapCount = ref(0)

let tapTimer = null

function onTitleClick () {

  tapCount.value++

  clearTimeout(tapTimer)

  tapTimer = setTimeout(() => {
    tapCount.value = 0
  }, 3000)

  if (tapCount.value >= 3) {

    tapCount.value = 0

    clearTimeout(tapTimer)

    router.push('/admin')
  }
}
</script>

<style scoped>
.custom-header {
  background: linear-gradient(
    to bottom,
    #8bc34a 0%,
    #10AA34 50%,
    #fcfcfc 100%
  );
}

.header-title {
  color: white;
  font-size: 24px;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.3);
}

.q-page {
  background: transparent !important;
}
</style>