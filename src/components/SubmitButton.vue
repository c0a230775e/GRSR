<script setup>
const { canSubmit, submit } = defineProps({
  canSubmit: Boolean,
  submit: Function
})
</script>


<template>
  <q-btn
    v-if="canSubmit"
    label="予約送信"
    class="common-btn q-mt-md"
    style="background-color:#10AA34;color:white"
    @click="submit"
  />
</template>
