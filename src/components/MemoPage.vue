<template>

  <div class="memo-card">

    <q-input
      v-model="name"
      outlined
      label="お名前"
      maxlength="20"
    />

    <q-input
      v-model="phone"
      outlined
      type="tel"
      label="電話番号"
      class="q-mt-sm"
    />

  </div>

</template>

<script setup>
const name = defineModel('name')
const phone = defineModel('phone')
</script>

<style scoped>
.memo-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
</style>