<template>
  <div class="preview-panel">
    <div class="preview-container">

      <!-- 左側（人数 + 日時） -->
      <div class="preview-left">

        <!-- 乗車人数 -->
        <div class="preview-card preview-card-people">
          <q-icon
            name="groups"
            color="primary"
            size="24px"
          />
          <span>
            {{ people || '未選択' }}
          </span>
        </div>

        <!-- 乗車日・予約時間 -->
        <div class="preview-card preview-card-datetime">
          <q-icon
            name="event"
            color="orange"
            size="24px"
          />

          <div class="preview-card-column">
            <div>
              {{ displayRideDate || '未選択' }}
            </div>

            <div>
              {{ time?.label || '未選択' }}
            </div>
          </div>
        </div>

      </div>

      <!-- 右側（乗車場所・降車場所） -->
      <div class="preview-card preview-card-location">
        <div class="preview-card-column">

          <div class="preview-location">
            <q-icon
              name="location_on"
              color="primary"
              size="20px"
            />
            <span>
              {{ from?.name || '未選択' }}
            </span>
          </div>

          <div class="preview-location">
            <q-icon
              name="location_on"
              color="negative"
              size="20px"
            />
            <span>
              {{ to?.name || '未選択' }}
            </span>
          </div>

        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const { people, rideDate, time, from, to } = defineProps({
  people: String,
  rideDate: String,
  time: Object,
  from: Object,
  to: Object
})

const displayRideDate = computed(() => {
  if (!rideDate) return '未選択'

  const parts = rideDate.split('-')

  return `${parts[1]}/${parts[2]}`
})
</script>