<script setup>
const { modelValue, freeRideDates, btnColor } = defineProps({
  modelValue: String,
  freeRideDates: Array,
  btnColor: Function
})

const emit = defineEmits(['update:modelValue'])
</script>


<template>
  <div class="row q-col-gutter-sm">
    <div
      class="col-4"
      v-for="d in freeRideDates"
      :key="d.value"
    >
      <q-btn
        class="common-btn"
        :label="d.label"
        :color="btnColor(modelValue === d.value, d.disabled)"
        :disable="d.disabled"
        @click="!d.disabled && emit('update:modelValue', d.value)"
      />
    </div>
  </div>
</template>
