<template>

  <!-- 前半 -->
  <div
    v-if="hasReservedFront"
    class="q-mt-md text-center"
  >
    <q-btn
      class="common-btn"
      color="light-green-6"
      :label="
        reservedFrontLabel
          ? `${reservedFrontLabel} の相乗り`
          : '前半の相乗り'
      "
      @click="emit('open-share', 'front')"
    />
  </div>

  <!-- 後半 -->
  <div
    v-if="hasReservedBack"
    class="q-mt-md text-center"
  >
    <q-btn
      class="common-btn"
      color="light-green-6"
      :label="
        reservedBackLabel
          ? `${reservedBackLabel} の相乗り`
          : '後半の相乗り'
      "
      @click="emit('open-share', 'back')"
    />
  </div>

  <!-- 相乗りポップアップ -->
  <q-dialog
    :model-value="shareDialogVisible"
  >
    <q-card class="dialog-card">

      <q-card-section class="text-h6">
        相乗り申請
      </q-card-section>

      <q-card-section>

        <div class="q-mb-sm">
          <div>
            予約時間：{{ shareTarget?.label }}
          </div>

          <div>
            予約済み人数：
            {{ shareTarget?.reservedPeople }}
            人
          </div>

          <div>
            あと乗れる人数：
            {{
              isFrontShareTarget
                ? remainingFront
                : remainingBack
            }}
            人
          </div>
        </div>

        <div class="q-mb-md">
          <div class="text-bold">
            乗車場所
          </div>

          <div>
            {{ shareTarget?.reservedFrom }}
          </div>
        </div>

        <div class="q-mb-md">
          <div class="text-bold">
            降車場所
          </div>

          <div>
            {{ shareTarget?.reservedTo }}
          </div>
        </div>

        <div
          v-if="shareError"
          class="text-red q-mt-sm"
        >
          {{ shareError }}
        </div>

      </q-card-section>

      <q-btn
        flat
        label="✖"
        color="red"
        class="dialog-btn dialog-btn-close"
        @click="emit('close-share')"
      />

      <q-btn
        flat
        label="✔"
        color="primary"
        class="dialog-btn dialog-btn-ok"
        @click="emit('confirm-share')"
      />

    </q-card>
  </q-dialog>

</template>

<script setup>
defineProps({
  hasReservedFront: Boolean,
  hasReservedBack: Boolean,

  reservedFrontLabel: String,
  reservedBackLabel: String,

  shareDialogVisible: Boolean,
  shareTarget: Object,
  shareError: String,

  remainingFront: Number,
  remainingBack: Number,
  isFrontShareTarget: Boolean
})

const emit = defineEmits([
  'open-share',
  'close-share',
  'confirm-share'
])
</script>