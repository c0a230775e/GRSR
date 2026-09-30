<script setup>
const { from, to } = defineProps({
  from: Object,
  to: Object
})
</script>


<template>
  <div class="q-mb-md">
    <div class="text-subtitle1 q-mb-sm">選択した場所</div>

    <div class="row q-col-gutter-sm">
      <!-- 乗車場所 -->
      <div class="col-6" v-if="from">
        <div class="text-center q-mb-xs">乗車場所</div>
        <q-img :src="from.image" class="selected-img" />
        <div class="text-center q-mt-xs">{{ from.name }}</div>
      </div>

      <!-- 降車場所 -->
      <div class="col-6" v-if="to">
        <div class="text-center q-mb-xs">降車場所</div>
        <q-img :src="to.image" class="selected-img" />
        <div class="text-center q-mt-xs">{{ to.name }}</div>
      </div>
    </div>
  </div>
</template>
