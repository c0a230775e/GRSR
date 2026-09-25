<template>
  <q-layout view="lHh Lpr lFf">

    <q-page-container>
      <router-view />
    </q-page-container>

    <!-- ★ Quasar が期待する正しい footer 構造 -->
    <q-footer elevated class="bg-grey-2 text-primary">
      <q-toolbar>
        <q-toolbar-title class="text-center">
          グリスロ
        </q-toolbar-title>
      </q-toolbar>
    </q-footer>

  </q-layout>
</template>

<script setup>
// タブ関連のコードは不要なので空でOK
</script>
