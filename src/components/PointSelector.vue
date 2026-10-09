<template>
  <div class="point-selector">

    <!-- タブ -->
    <q-tabs
      v-model="selectMode"
      class="custom-tabs"
      no-caps
      align="left"
    >
      <q-tab
        name="from"
        label="乗車場所を設定"
        :class="selectMode === 'to' ? 'tab1-inactive' : ''"
      />

      <q-tab
        name="to"
        label="降車場所を設定"
        :class="selectMode === 'from' ? 'tab2-inactive' : ''"
      />
    </q-tabs>

    <!-- コンテンツ（地図） -->
    <div
      class="tab-content"
      :class="selectMode === 'from' ? 'tab1-content' : 'tab2-content'"
    >
      <div id="map" class="map-container"></div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const emit = defineEmits(['update:from', 'update:to'])

let map
const selectMode = ref('from')

// 青ピン（乗車）
const blueIcon = L.icon({
  iconUrl: 'https://maps.gstatic.com/mapfiles/ms2/micons/blue-dot.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32]
})

// 赤ピン（降車）
const redIcon = L.icon({
  iconUrl: 'https://maps.gstatic.com/mapfiles/ms2/micons/red-dot.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32]
})

onMounted(async () => {
  const centerLat = 35.64063
  const centerLng = 140.04563

  map = L.map('map', {
    center: [centerLat, centerLng],
    zoom: 15,
    minZoom: 15,
    maxBounds: [
      [35.6300, 140.0400],
      [35.6495, 140.0520]
    ],
    maxBoundsViscosity: 1.0
  })

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map)

  const res = await fetch('/assets/pins.json')
  const pins = await res.json()

  pins.forEach(pin => {
    if (!pin.lat || !pin.lng) return

    const marker = L.marker([pin.lat, pin.lng], {
      icon: selectMode.value === 'from' ? blueIcon : redIcon
    }).addTo(map)

    marker.bindTooltip(pin.name, {
      permanent: false,
      direction: 'top'
    })

    marker.on('click', () => {
      const payload = {
        name: pin.name,
        lat: pin.lat,
        lng: pin.lng,
        image: pin.image
      }

      if (selectMode.value === 'from') {
        emit('update:from', payload)
      } else {
        emit('update:to', payload)
      }
    })
  })
})
</script>
