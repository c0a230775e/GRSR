<template>
  <div class="point-selector">

    <q-tabs
      v-model="selectMode"
      class="custom-tabs"
      :class="selectMode === 'from' ? 'tab1-active' : 'tab2-active'"
    >
      <q-tab
        name="from"
        label="乗車場所を設定"
        :class="[
          selectMode === 'from' ? 'tab1-active' : '',
          selectMode === 'to' ? 'tab1-inactive' : ''
        ]"
      />

      <q-tab
        name="to"
        label="降車場所を設定"
        :class="[
          selectMode === 'to' ? 'tab2-active' : '',
          selectMode === 'from' ? 'tab2-inactive' : ''
        ]"
      />
    </q-tabs>

    <div
      class="tab-content"
      :class="selectMode === 'from' ? 'tab1-content' : 'tab2-content'"
    >
      <div id="map" class="map-container"></div>
    </div>

    <!-- ★ オーバーレイ -->
    <div v-if="showOverlay" class="overlay">
      <div class="overlay-content">

        <!-- 左上 × ボタン -->
        <div class="overlay-close" @click="closeOverlay">×</div>

        <!-- サブ地図 -->
        <div id="submap" class="submap-container"></div>

        <!-- 左下：サブピン画像（クリック時のみ表示） -->
        <div v-if="selectedSubPin" class="overlay-subimg">
          <img :src="selectedSubPin.image" alt="" class="overlay-img" />
        </div>

        <!-- 右下：チェックボタン（クリック時のみ表示） -->
        <div v-if="selectedSubPin" class="overlay-check-btn" @click="confirmSubPin">
          ✔
        </div>

      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import '@/css/CommonPage.scss'

const emit = defineEmits(['update:from', 'update:to'])

let map
const markers = []
const selectMode = ref('from')

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

// 赤ピン（降車）
const redIcon = L.icon({
  iconUrl: 'https://maps.gstatic.com/mapfiles/ms2/micons/red-dot.png',
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

    const marker = L.marker([pin.lat, pin.lng], {
      icon: selectMode.value === 'from' ? blueIcon : redIcon
    }).addTo(map)

    markers.push(marker)

    watch(selectMode, (newMode) => {
      markers.forEach(marker => {
        marker.setIcon(newMode === 'from' ? blueIcon : redIcon)
      })
    })

    marker.bindTooltip(pin.name, {
      permanent: false,
      direction: 'top'
    })

    marker.on('click', () => {
      overlayPin.value = pin
      selectedSubPin.value = null
      showOverlay.value = true

      setTimeout(() => {
        showSubMap(pin)
      }, 50)
    })
  })
})

function showSubMap(mainPin) {
  const subMapElement = document.getElementById('submap')
  if (!subMapElement) return

  const subMap = L.map('submap', {
    center: [mainPin.lat, mainPin.lng],
    zoom: 18,
    zoomControl: false,
    attributionControl: false,
    rotate: true,
    touchRotate: false
  })

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(subMap)

  if (!mainPin.subs || mainPin.subs.length === 0) return

  mainPin.subs.forEach(sub => {
    const subMarker = L.marker([sub.lat, sub.lng], {
      icon: L.icon({
        iconUrl: '/assets/subpin.png',
        iconSize: [28, 28],
        iconAnchor: [14, 28]
      })
    }).addTo(subMap)

    subMarker.bindTooltip(`${mainPin.id}-${sub.code}`)

    subMarker.on('click', () => {
      selectedSubPin.value = sub
    })
  })
}

function confirmSubPin() {
  if (!selectedSubPin.value || !overlayPin.value) return

  emit(selectMode.value === 'from' ? 'update:from' : 'update:to', {
    mainId: overlayPin.value.id,
    subCode: selectedSubPin.value.code,
    lat: selectedSubPin.value.lat,
    lng: selectedSubPin.value.lng,
    image: selectedSubPin.value.image
  })

  closeOverlay()
}

function closeOverlay() {
  showOverlay.value = false
  selectedSubPin.value = null
}
</script>
