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
  reservedBackLabel: String,

  reservedFrontFrom: String,
  reservedFrontTo: String,

  reservedBackFrom: String,
  reservedBackTo: String,

  frontFull: Boolean,
  backFull: Boolean,

  remainingFront: Number,
  remainingBack: Number
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

    <div class="section-title q-mb-sm">
      予約時間
    </div>

    <div class="time-grid">

      <!-- 前半 -->

      <template v-if="props.hasReservedFront">

        <div class="share-btn-wrapper">
          <q-btn
            class="common-btn share-btn"
            :disable="props.frontFull"
            :class="{ 'share-btn-full': props.frontFull }"
            @click="emit('open-share', 'front')"
          >
            <div class="share-content">

              <div class="share-label">
                相乗り
              </div>

              <div class="share-left">
                <div class="share-time">
                  {{ props.reservedFrontLabel }}
                </div>

                <div class="share-text">
                  {{
                    props.frontFull
                      ? '満員'
                      : `あと${props.remainingFront}人`
                  }}
                </div>

              </div>

              <div class="share-right">
                <div class="share-place">
                  <span class="place-label">乗：</span>
                  <span class="place-name">
                    {{ props.reservedFrontFrom }}
                  </span>
                </div>

                <div class="share-place">
                  <span class="place-label">降：</span>
                  <span class="place-name">
                    {{ props.reservedFrontTo }}
                  </span>
                </div>
              </div>

            </div>
          </q-btn>
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
            :disable="props.backFull"
            :class="{ 'share-btn-full': props.backFull }"
            @click="emit('open-share', 'back')"
          >
            <div class="share-content">

              <div class="share-label">
                相乗り
              </div>

              <div class="share-left">
                <div class="share-time">
                  {{ props.reservedBackLabel }}
                </div>

                <div class="share-text">
                  {{
                    props.backFull
                      ? '満員'
                      : `あと${props.remainingBack}人`
                  }}
                </div>

              </div>

              <div class="share-right">
                <div class="share-place">
                  <span class="place-label">乗：</span>
                  <span class="place-name">
                    {{ props.reservedBackFrom }}
                  </span>
                </div>

                <div class="share-place">
                  <span class="place-label">降：</span>
                  <span class="place-name">
                    {{ props.reservedBackTo }}
                  </span>
                </div>
              </div>

            </div>
          </q-btn>
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
