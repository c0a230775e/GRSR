<script setup>
const { modelValue, options, btnColor } = defineProps({
  modelValue: {
    type: String,
    default: null
  },
  options: {
    type: Array,
    default: () => ['1', '2', '3', '4', '5']
  },
  btnColor: {
    type: Function,
    required: true
  }
})

const emit = defineEmits(['update:modelValue'])
</script>


<template>
  <div class="q-mb-md">
    <div class="text-subtitle1 q-mb-sm">乗車人数</div>

    <div class="row q-col-gutter-sm">
      <div
        class="col-4"
        v-for="n in options"
        :key="n"
      >
        <q-btn
          class="common-btn"
          :label="n"
          :color="btnColor(modelValue === n, false)"
          @click="emit('update:modelValue', n)"
        />
      </div>
    </div>
  </div>
</template>
