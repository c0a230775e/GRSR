<script setup>
const { modelValue, months, btnColor, selectMonth } = defineProps({
  modelValue: Number,
  months: Array,
  btnColor: Function,
  selectMonth: Function
})

const emit = defineEmits(['update:modelValue'])
</script>


<template>
  <div class="q-mb-md">
    <div class="text-subtitle1 q-mb-sm">乗車日</div>

    <!-- 月選択 -->
    <div class="row q-col-gutter-sm q-mb-sm">
      <div
        class="col-6"
        v-for="m in months"
        :key="m.month"
      >
        <q-btn
          class="common-btn"
          :label="`${m.month}月`"
          :color="btnColor(modelValue === m.month, false)"
          @click="
            emit('update:modelValue', m.month);
            selectMonth(m.year, m.month);
          "
        />
      </div>
    </div>
  </div>
</template>
