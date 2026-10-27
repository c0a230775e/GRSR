<template>

  <div class="memo-card">

    <q-input
      :model-value="name"
      @update:model-value="$emit('update:name', $event)"
      outlined
      label="お名前"
      maxlength="20"
    />

    <q-input
      :model-value="phone"
      @update:model-value="$emit('update:phone', $event)"
      outlined
      type="tel"
      label="電話番号"
      class="q-mt-sm"
    />

  </div>

</template>

<script setup>

defineProps({
  name: {
    type: String,
    default: ''
  },
  phone: {
    type: String,
    default: ''
  }
})

defineEmits([
  'update:name',
  'update:phone'
])

</script>

<style scoped>
.memo-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
</style>