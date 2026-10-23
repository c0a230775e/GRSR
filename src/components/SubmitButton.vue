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
    color="light-green-6"
    class="common-btn q-mt-md"
    @click="submit"
  />
</template>
