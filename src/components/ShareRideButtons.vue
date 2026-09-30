<script setup>
const {
  hasReservedFront,
  hasReservedBack,
  reservedFrontLabel,
  reservedBackLabel,
  onShareRide
} = defineProps({
  hasReservedFront: Boolean,
  hasReservedBack: Boolean,
  reservedFrontLabel: String,
  reservedBackLabel: String,
  onShareRide: Function
})
</script>


<template>
  <!-- ★ 前半の相乗りボタン -->
  <div v-if="hasReservedFront" class="q-mt-md text-center">
    <q-btn
      class="common-btn"
      color="secondary"
      :label="reservedFrontLabel ? `${reservedFrontLabel} の相乗り` : '前半の相乗り'"
      @click="onShareRide('front')"
    />
  </div>

  <!-- ★ 後半の相乗りボタン -->
  <div v-if="hasReservedBack" class="q-mt-md text-center">
    <q-btn
      class="common-btn"
      color="secondary"
      :label="reservedBackLabel ? `${reservedBackLabel} の相乗り` : '後半の相乗り'"
      @click="onShareRide('back')"
    />
  </div>
</template>
