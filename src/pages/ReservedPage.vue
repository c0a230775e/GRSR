<template>
  <q-page padding>

    <!-- 予約画面へ戻る -->
    <div class="top-button-row">

      <q-btn
        outline
        color="primary"
        icon="arrow_back"
        label="予約画面へ戻る"
        @click="goReservation"
      />

    </div>

    <h5 class="text-center q-mb-lg">
      予約履歴
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

                <div
                  :id="`from-map-${day[slot].id}`"
                  class="location-mini-map"
                />

              </div>

              <div class="location-photo-card">

                <div class="photo-title">
                  降車場所
                </div>

                <img
                  :src="getPlaceImage(day[slot].to_name)"
                  class="location-photo"
                >

                <div
                  :id="`to-map-${day[slot].id}`"
                  class="location-mini-map"
                />

              </div>

            </div>

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
                label="予約キャンセル"
                flat
                @click="removeReservation(day[slot])"
            />

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
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/supabase'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import '@/css/AdminPage.scss'

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

delete L.Icon.Default.prototype._getIconUrl

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow
})

const reservations = ref([])
const expandedItems = ref({})
const pins = ref([])
const maps = {}
const router = useRouter()

const groupedReservations = computed(() => {

  const result = {}

  reservations.value.forEach(r => {

    const date = r.ride_date

    if (!result[date]) {
      result[date] = {
        front: null,
        back: null
      }
    }

    const minute =
      Number(r.time.split(':')[1])

    const slotType =
      minute < 30
        ? 'front'
        : 'back'

    if (!result[date][slotType]) {

      result[date][slotType] = {
        ...r
      }

    } else {

      result[date][slotType].people +=
        Number(r.people)

    }

  })

  return result
})

onMounted(async () => {

  const res = await fetch('/assets/pins.json')

  pins.value = await res.json()

  await loadReservations()
})

async function loadReservations() {

  const userId =
    localStorage.getItem('userId')

  const { data, error } = await supabase
    .from('reservations')
    .select('*')
    .eq('user_id', userId)
    .order('ride_date', { ascending: true })

  if (error) {
    console.error(error)
    return
  }

  reservations.value = data || []
}

function displayDate(date) {

  if (!date) return ''

  const parts = date.split('-')

  return `${parts[1]}/${parts[2]}`
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

function getPlaceLocation(placeName) {
  for (const mainPin of pins.value) {

    if (mainPin.name === placeName) {
      return {
        lat: mainPin.lat,
        lng: mainPin.lng
      }
    }

    if (mainPin.subLocations) {

      const sub = mainPin.subLocations.find(
        s => s.name === placeName
      )

      if (sub) {
        return {
          lat: sub.lat,
          lng: sub.lng
        }
      }
    }
  }

  return null
}

async function drawMap(placeName, mapId) {

  const location = getPlaceLocation(placeName)

  if (!location) return

  await nextTick()

  if (maps[mapId]) {
    maps[mapId].remove()
  }

  maps[mapId] = L.map(mapId, {
    zoomControl: false,
    attributionControl: false,

    dragging: false,
    touchZoom: false,
    scrollWheelZoom: false,
    doubleClickZoom: false,
    boxZoom: false,
    keyboard: false,
    tap: false
  }).setView(
    [location.lat, location.lng],
    17
  )

  L.tileLayer(
    'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
  ).addTo(maps[mapId])

  L.marker([
    location.lat,
    location.lng
  ]).addTo(maps[mapId])
}

async function toggleExpand(item) {

  expandedItems.value[item.id] =
    !expandedItems.value[item.id]

  if (expandedItems.value[item.id]) {

    await nextTick()

    drawMap(
      item.from_name,
      `from-map-${item.id}`
    )

    drawMap(
      item.to_name,
      `to-map-${item.id}`
    )
  }
}

async function removeReservation(item) {

  if (!item) return

  if (item.share === false) {

    await supabase
      .from('reservations')
      .delete()
      .eq('parent_id', item.id)
  }

  const { error } = await supabase
    .from('reservations')
    .delete()
    .eq('id', item.id)

  if (error) {
    console.error(error)
    return
  }

  await loadReservations()
}
function goReservation() {
  router.push('/')
}

</script>

<style scoped>
.reserved-page {
  padding: 16px;
}

.page-title {
  font-size: 22px;
  font-weight: 700;
  margin-bottom: 16px;
}

.reservation-card {
  margin-bottom: 12px;
}

.date {
  font-size: 18px;
  font-weight: 700;
}

.time {
  color: #10aa34;
  font-weight: 700;
}

.route {
  margin-top: 6px;
}

.people {
  margin-top: 6px;
}

.empty-message {
  text-align: center;
  color: #999;
  margin-top: 32px;
}

.top-button-row {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  width: 100%;
  margin-bottom: 16px;
}
</style>