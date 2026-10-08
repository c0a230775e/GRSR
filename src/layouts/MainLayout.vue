<template>
  <q-layout view="lHh Lpr lFf" class="layout-bg">

    <q-page-container>
      <router-view />
    </q-page-container>

  </q-layout>
</template>

<script setup>
// タブ関連のコードは不要なので空でOK
</script>

<style scoped>
/* 画面全体の背景画像 */
.layout-bg {
  background-image: url('/assets/ベイタ君.jpg'); /* ← 好きな画像に変更 */
  background-size: cover;                 /* 画面全体に敷き詰める */
  background-position: center;            /* 中央に配置 */
  background-repeat: no-repeat;           /* 繰り返しなし */
}

/* q-page の背景を透明にする（重要） */
.q-page {
  background: transparent !important;
}
</style>
