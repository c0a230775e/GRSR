<script setup>
const { modelValue, availableTimeSlots, btnColor } = defineProps({
  modelValue: Object,
  availableTimeSlots: Array,
  btnColor: Function
})

const emit = defineEmits(['update:modelValue'])
</script>


<template>
  <div v-if="availableTimeSlots.length" class="q-mb-md">
    <div class="text-subtitle1 q-mb-sm">予約時間</div>

    <div class="time-grid">
      <div
        v-for="slot in availableTimeSlots"
        :key="slot.label"
      >
        <q-btn
          class="common-btn"
          :label="slot.label"
          :color="btnColor(modelValue?.label === slot.label, slot.disabled)"
          :disable="slot.disabled"
          @click="!slot.disabled && emit('update:modelValue', slot)"
        />
      </div>
    </div>
  </div>
</template>
