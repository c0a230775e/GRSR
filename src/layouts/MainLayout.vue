<template>
  <q-layout view="lHh Lpr lFf" class="layout-bg">

    <q-header class="custom-header">
      <q-toolbar>
        <q-toolbar-title class="text-center header-title">
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
// 特になし
</script>

<style scoped>
.layout-bg {
  background-image: url('/assets/ベイタ君.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.custom-header {
  background: linear-gradient(
    to bottom,
    #8bc34a 0%,
    #aed581 50%,
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