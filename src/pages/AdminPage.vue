<template>
  <q-page padding>

    <h5 class="text-center q-mb-lg">
      予約一覧
    </h5>

    <div
      v-for="(day, date) in groupedReservations"
      :key="date"
      class="date-group"
    >

      <!-- 日付 -->
      <div class="date-title">
        {{ displayDate(date) }}
      </div>

      <div class="reservation-list-card q-mb-md">

        <div
          v-for="slot in ['front', 'back']"
          :key="slot"
          class="reservation-half"
        >

          <template v-if="day[slot]">

            <!-- 予約概要 -->
            <div class="preview-container">

              <!-- 左側 -->
              <div class="preview-left">

                <!-- 人数 -->
                <div class="preview-card preview-card-people">

                  <q-icon
                    name="groups"
                    color="primary"
                    size="24px"
                  />

                  <span>
                    {{ day[slot].people }}人
                  </span>

                </div>

                <!-- 時間 -->
                <div class="preview-card preview-card-datetime">

                  <q-icon
                    name="event"
                    color="orange"
                    size="24px"
                  />

                  <div class="preview-card-column">

                    <div>
                      {{ day[slot].time }}
                    </div>

                  </div>

                </div>

              </div>

              <!-- 場所 -->
              <div class="preview-card preview-card-location">

                <div class="preview-card-column">

                  <div class="preview-location">

                    <q-icon
                      name="location_on"
                      color="primary"
                      size="20px"
                    />

                    <span>
                      {{ day[slot].from_name }}
                    </span>

                  </div>

                  <div class="preview-location">

                    <q-icon
                      name="location_on"
                      color="negative"
                      size="20px"
                    />

                    <span>
                      {{ day[slot].to_name }}
                    </span>

                  </div>

                </div>

              </div>

            </div>

            <!-- 展開エリア -->
            <div
              v-if="expandedItems[day[slot].id]"
              class="location-photo-area"
            >

              <div class="location-photo-card">

                <div class="photo-title">
                  乗車場所
                </div>

                <img
                  :src="getPlaceImage(day[slot].from_name)"
                  class="location-photo"
                >

              </div>

              <div class="location-photo-card">

                <div class="photo-title">
                  降車場所
                </div>

                <img
                  :src="getPlaceImage(day[slot].to_name)"
                  class="location-photo"
                >

              </div>

            </div>

            <!-- 一番下に矢印と削除 -->
            <div class="card-footer">

              <q-btn
                flat
                dense
                size="lg"
                :icon="
                  expandedItems[day[slot].id]
                    ? 'expand_less'
                    : 'expand_more'
                "
                @click="toggleExpand(day[slot])"
              />

              <q-btn
                color="negative"
                icon="delete"
                label="削除"
                flat
                @click="removeReservation(day[slot])"
              />

            </div>

          </template>

          <template v-else>

            <div class="no-reservation">
              予約なし
            </div>

          </template>

          <q-separator
            v-if="slot === 'front'"
          />

        </div>

      </div>

    </div>

  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { supabase } from '@/supabase'
import '@/css/AdminPage.scss'


const reservations = ref([])
const expandedItems = ref({})
const pins = ref([])

/* -------------------------
   予約一覧取得
------------------------- */
async function loadReservations() {

  const { data, error } = await supabase
    .from('reservations')
    .select('*')
    .order('ride_date', { ascending: true })

  if (error) {
    console.error('Supabase error:', error)
    return
  }

  reservations.value = data
}

/* -------------------------
   削除処理
------------------------- */
async function removeReservation(item) {

  if (!item) return

  // 親予約を削除すると相乗り予約も削除
  if (item.share === false) {

    const { error: childErr } = await supabase
      .from('reservations')
      .delete()
      .eq('parent_id', item.id)

    if (childErr) {
      console.error('子予約削除エラー:', childErr)
    }

  }

  const { error } = await supabase
    .from('reservations')
    .delete()
    .eq('id', item.id)

  if (error) {
    console.error('予約削除エラー:', error)
    return
  }

  await loadReservations()
}

/* -------------------------
   日付表示
------------------------- */
function displayDate(date) {

  if (!date) return ''

  const parts = date.split('-')

  return `${parts[1]}/${parts[2]}`
}

function toggleExpand(item) {
  expandedItems.value[item.id] =
    !expandedItems.value[item.id]
}

// 画像取得
function getPlaceImage(placeName) {

  for (const mainPin of pins.value) {

    if (mainPin.name === placeName) {
      return mainPin.image
    }

    if (mainPin.subLocations) {

      const sub = mainPin.subLocations.find(
        s => s.name === placeName
      )

      if (sub) {
        return sub.image
      }

    }

  }

  return ''
}

/* -------------------------
   前半後半でグループ化
   相乗り人数を加算
------------------------- */
const groupedReservations = computed(() => {

  const result = {}

  reservations.value.forEach(r => {

    console.log(
      r.ride_date,
      r.time,
      r.people,
      r.share
    )
    const date = r.ride_date

    if (!result[date]) {

      result[date] = {
        front: null,
        back: null
      }

    }

    const minute = Number(r.time.split(':')[1])

    const slotType =
      minute < 30
        ? 'front'
        : 'back'

    if (!result[date][slotType]) {

      result[date][slotType] = {
        id: r.id,
        share: r.share,
        people: Number(r.people),
        ride_date: r.ride_date,
        time: r.time,
        from_name: r.from_name,
        to_name: r.to_name
      }

    } else {

      result[date][slotType].people += Number(r.people)

    }

  })

  return result

})

/* -------------------------
   初期ロード
------------------------- */
onMounted(async () => {

  const res = await fetch('/assets/pins.json')
  pins.value = await res.json()

  await loadReservations()

})
</script>