<template>
  <q-page class="column flex-center q-pa-sm">

    <div class="text-h5 text-center q-mb-sm">
      {{ isShare ? '相乗り申請が完了しました！' : '予約が完了しました！' }}
    </div>

    <div class="text-center q-mb-md">
      乗車の際は手をあげて、運転手にアピールしてください。
    </div>

    <!-- ★ 予約内容の表示 -->
    <div class="q-pa-sm bg-grey-2 rounded-borders q-mb-md" style="width: 100%; max-width: 400px;">
      <div class="text-subtitle1 q-mb-sm">
        {{ isShare ? '相乗り内容' : '予約内容' }}
      </div>

      <div class="reservation-list-card q-mb-sm">

        <div class="reservation-half">

          <div class="preview-container">

            <!-- 左側 -->
            <div class="preview-left">

              <div class="preview-card preview-card-people">
                <q-icon
                  name="groups"
                  color="primary"
                  size="24px"
                />
                <span>
                  {{ info.people }}人
                </span>
              </div>

              <div class="preview-card preview-card-datetime">
                <q-icon
                  name="event"
                  color="orange"
                  size="24px"
                />

                <div class="preview-card-column">
                  <div>
                    {{ info.time }}
                  </div>

                  <div class="text-grey-7">
                    {{ displayDate(info.rideDate) }}
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
                    {{ info.from }}
                  </span>
                </div>

                <div class="preview-location">
                  <q-icon
                    name="location_on"
                    color="negative"
                    size="20px"
                  />

                  <span>
                    {{ info.to }}
                  </span>
                </div>

              </div>

            </div>

          </div>

        </div>

        <div class="location-photo-area q-mt-md">

          <div class="location-photo-card">

            <div class="photo-title">
              乗車場所
            </div>

            <img
              :src="getPlaceImage(info.from)"
              class="location-photo"
            >

            <div
              id="from-map"
              class="location-mini-map"
            />

          </div>

          <div class="location-photo-card">

            <div class="photo-title">
              降車場所
            </div>

            <img
              :src="getPlaceImage(info.to)"
              class="location-photo"
            >

            <div
              id="to-map"
              class="location-mini-map"
            />

          </div>
        </div>
      </div>
      <!-- チェックボタン -->
    <q-btn
      label="✔"
      color="primary"
      class="full-width q-mt-sm"
      @click="goHome"
    />
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { supabase } from '@/supabase'
import '@/css/AdminPage.scss'

import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

delete L.Icon.Default.prototype._getIconUrl

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow
})


const router = useRouter()
const route = useRoute()
const pins = ref([])
const maps = {}

const isShare = ref(false)
const info = ref({
  people: '',
  rideDate: '',
  time: '',
  from: '',
  to: ''
})

onMounted(async () => {

  const res = await fetch('/assets/pins.json')
  pins.value = await res.json()

  // 相乗り予約
  if (route.query.mode === 'share') {

    isShare.value = true

    info.value = {
      people: route.query.people,
      rideDate: route.query.rideDate,
      time: route.query.time,
      from: route.query.from,
      to: route.query.to
    }

    await nextTick()

    drawMap(info.value.from, 'from-map')
    drawMap(info.value.to, 'to-map')

    return
  }

  // 通常予約
  const { data, error } = await supabase
    .from('reservations')
    .select('*')
    .order('id', { ascending: false })
    .limit(1)

  if (error) {
    console.error('Supabase error:', error)
    return
  }

  const last = data[0]

  info.value = {
    people: last?.people,
    rideDate: last?.ride_date,
    time: last?.time,
    from: last?.from_name,
    to: last?.to_name
  }

  await nextTick()

  drawMap(info.value.from, 'from-map')
  drawMap(info.value.to, 'to-map')
})

function displayDate(date) {
  if (!date) return ''

  const parts = date.split('-')

  return `${parts[1]}/${parts[2]}`
}

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

function goHome() {
  router.push('/')
}
</script>
