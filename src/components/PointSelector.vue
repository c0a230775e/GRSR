<template>
  <div class="point-selector">

    <!-- メイン地図 -->
    <div id="map" class="map-container"></div>

    <!-- オーバーレイ -->
    <div
      v-if="showOverlay"
      class="overlay"
    >
      <div class="overlay-content">

        <!-- サブ地図（サブ地点がある場合のみ表示） -->
        <div
          v-if="
            overlayPin?.subLocations &&
            overlayPin.subLocations.length > 0
          "
          id="submap"
          class="submap-container"
        />

        <!-- 選択画像 -->
        <div
          v-if="selectedSubPin"
          class="selected-image-wrapper"
        >
          <q-img
            :src="selectedSubPin.image"
            class="point-selected-img"
          />
        </div>

        <!-- ボタン -->
        <div class="sub-photo-actions">

          <div
            v-if="selectedSubPin"
            class="sub-photo-actions-top"
          >
            <q-btn
              color="negative"
              label="降車場所に設定"
              @click="setToLocation"
            />

            <q-btn
              color="primary"
              label="乗車場所に設定"
              @click="setFromLocation"
            />
          </div>

          <div class="sub-photo-actions-bottom">
            <q-btn
              flat
              label="キャンセル"
              @click="closeOverlay"
            />
          </div>

        </div>

      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import '@/css/CommonPage.scss'

const emit = defineEmits(['update:from', 'update:to'])

let map
let subMap = null
const markers = []

const pins = ref([])

const centerLat = 35.6439633
const centerLng = 140.0473219

// オーバーレイ制御
const showOverlay = ref(false)
const overlayPin = ref(null)

// サブピン選択状態
const selectedSubPin = ref(null)

// 青ピン（乗車）
const blueIcon = L.icon({
  iconUrl: 'https://maps.gstatic.com/mapfiles/ms2/micons/blue-dot.png',
  iconSize: [20, 20],
  iconAnchor: [10, 20]
})


onMounted(async () => {
  map = L.map('map', {
    center: [centerLat, centerLng],
    zoom: 15,
    minZoom: 15,
    maxBounds: [
      [35.6488675, 140.0542611],
      [35.6347742, 140.0411377]
    ],
    maxBoundsViscosity: 1.0,
    rotate: true,
    touchRotate: true
  })
  map.setBearing(-40)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map)

  const res = await fetch('/assets/pins.json')
  pins.value = await res.json()

  pins.value.forEach(pin => {
    if (!pin.lat || !pin.lng) return

    const marker = L.marker(
      [pin.lat, pin.lng],
      {
        icon: blueIcon
      }
    ).addTo(map)

    markers.push(marker)

    marker.bindTooltip(pin.name, {
      permanent: false,
      direction: 'top'
    })

    marker.on('click', () => {

      overlayPin.value = pin

      if (
        pin.subLocations &&
        pin.subLocations.length > 0
      ) {
        selectedSubPin.value = null
        showOverlay.value = true

        setTimeout(() => {
          showSubMap(pin)
        }, 50)

        return
      }

      selectedSubPin.value = pin
      showOverlay.value = true
    })
  })
})

function setFromLocation() {

  if (!selectedSubPin.value) return

  emit('update:from', {
    mainId: overlayPin.value.id,
    subCode: selectedSubPin.value.id,
    name: selectedSubPin.value.name,
    lat: selectedSubPin.value.lat,
    lng: selectedSubPin.value.lng,
    image: selectedSubPin.value.image
  })

  closeOverlay()
}

function setToLocation() {

  if (!selectedSubPin.value) return

  emit('update:to', {
    mainId: overlayPin.value.id,
    subCode: selectedSubPin.value.id,
    name: selectedSubPin.value.name,
    lat: selectedSubPin.value.lat,
    lng: selectedSubPin.value.lng,
    image: selectedSubPin.value.image
  })

  closeOverlay()
}

function showSubMap(mainPin) {

  const subMapElement = document.getElementById('submap')
  if (!subMapElement) return

  // 前回の地図を削除
  if (subMap) {
    subMap.remove()
    subMap = null
  }

  subMap = L.map('submap', {
    center: [mainPin.lat, mainPin.lng],
    zoom: 18,
    zoomControl: false,
    attributionControl: false,
    rotate: true,
    touchRotate: false
  })

  L.tileLayer(
    'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    {
      attribution: '&copy; OpenStreetMap contributors'
    }
  ).addTo(subMap)

  // オーバーレイ表示後にサイズ再計算
  setTimeout(() => {
    subMap.invalidateSize()
  }, 100)

  console.log(mainPin)
  console.log(mainPin.subLocations)

  if (!mainPin.subLocations || mainPin.subLocations.length === 0) {
    return
  }

  mainPin.subLocations.forEach(sub => {

    console.log('sub=', sub)

   const subMarker = L.marker(
      [sub.lat, sub.lng],
      {
        icon: blueIcon
      }
    ).addTo(subMap)

    subMarker.bindTooltip(sub.name)

    subMarker.on('click', () => {
      selectedSubPin.value = sub
    })
  })
  const latlngs = mainPin.subLocations.map(sub => [
    sub.lat,
    sub.lng
  ])

  subMap.fitBounds(latlngs)
}


function closeOverlay() {

  if (subMap) {
    subMap.remove()
    subMap = null
  }

  showOverlay.value = false
  selectedSubPin.value = null
}
</script>
