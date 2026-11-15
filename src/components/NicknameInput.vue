<template>
  <div class="nickname-section">
    <div class="nickname-label">
      ニックネーム
    </div>

    <q-input
      outlined
      dense
      maxlength="20"
      placeholder="ニックネームを入力"
      :model-value="modelValue"
      @update:model-value="$emit('update:modelValue', $event)"
    />
  </div>
</template>

<script setup>
defineProps({
  modelValue: {
    type: String,
    default: ''
  }
})

defineEmits(['update:modelValue'])
</script>