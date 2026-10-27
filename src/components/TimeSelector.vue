<script setup>

const props = defineProps({
  modelValue: Object,

  availableTimeSlots: {
    type: Array,
    default: () => []
  },

  btnColor: Function,

  hasReservedFront: Boolean,
  hasReservedBack: Boolean,

  reservedFrontLabel: String,
  reservedBackLabel: String
})

const emit = defineEmits([
  'update:modelValue',
  'open-share'
])

</script>

<template>

  <div
    v-if="props.availableTimeSlots.length"
    class="q-mb-md"
  >

    <div class="text-subtitle1 q-mb-sm">
      予約時間
    </div>

    <div class="time-grid">

      <!-- 前半 -->

      <template v-if="props.hasReservedFront">

        <div class="share-btn-wrapper">
          <q-btn
            class="common-btn share-btn"
            color="light-green-6"
            :label="`${props.reservedFrontLabel} の相乗り`"
            @click="emit('open-share', 'front')"
          />
        </div>

      </template>

      <template v-else>

        <div
          v-for="slot in props.availableTimeSlots.slice(0, 3)"
          :key="slot.label"
        >
          <q-btn
            class="common-btn"
            :label="slot.label"
            :color="
              props.btnColor(
                props.modelValue?.label === slot.label,
                slot.disabled
              )
            "
            :disable="slot.disabled"
            @click="
              !slot.disabled &&
              emit('update:modelValue', slot)
            "
          />
        </div>

      </template>

      <!-- 後半 -->

      <template v-if="props.hasReservedBack">

        <div class="share-btn-wrapper">
          <q-btn
            class="common-btn share-btn"
            color="light-green-6"
            :label="`${props.reservedBackLabel} の相乗り`"
            @click="emit('open-share', 'back')"
          />
        </div>

      </template>

      <template v-else>

        <div
          v-for="slot in props.availableTimeSlots.slice(3, 5)"
          :key="slot.label"
        >
          <q-btn
            class="common-btn"
            :label="slot.label"
            :color="
              props.btnColor(
                props.modelValue?.label === slot.label,
                slot.disabled
              )
            "
            :disable="slot.disabled"
            @click="
              !slot.disabled &&
              emit('update:modelValue', slot)
            "
          />
        </div>

      </template>

    </div>

  </div>

</template>
