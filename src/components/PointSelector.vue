<template>
  <div class="point-selector">
    <!-- ピン設定モード選択 -->
    <div class="q-mb-md flex justify-around">
      <q-btn
        label="乗車場所を設定"
        color="primary"
        :flat="selectMode !== 'from'"
        @click="selectMode = 'from'"
      />

      <q-btn
        label="降車場所を設定"
        color="red"
        :flat="selectMode !== 'to'"
        @click="selectMode = 'to'"
      />
    </div>

    <div class="row q-col-gutter-md">
      
      <!-- 左：マップ -->
      <div class="col-12 col-md-7">
        <div id="map" class="map-container"></div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const emit = defineEmits(['update:from', 'update:to'])

let map

// 乗車場所
let fromMarker = null
const fromAddress = ref('')

// 降車場所
let toMarker = null
const toAddress = ref('')

// ピン設定モード
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

// 日本形式の住所整形
function formatJapaneseAddress(addr) {
  const prefecture = addr.state || ''
  const city = addr.city || addr.town || addr.village || ''
  const suburb = addr.suburb || addr.neighbourhood || ''
  const road = addr.road || ''
  const houseNumber = addr.house_number || ''

  const building =
    addr.building ||
    addr.amenity ||
    addr.shop ||
    addr.commercial ||
    addr.public_building ||
    ''

  let baseAddress = `${prefecture}${city}${suburb}${road}${houseNumber}`
  if (building) baseAddress += ` ${building}`

  return baseAddress
}

// 逆ジオコーディング（自作 API）
async function fetchAddress(lat, lng) {
  const res = await fetch(`http://localhost:3001/api/reverse?lat=${lat}&lng=${lng}`)
  const data = await res.json()

  if (data.error === 'Rate limit exceeded') {
    return 'アクセスが集中しているため住所を取得できませんでした（429）'
  }

  if (!data.address) {
    return data.display_name || '住所を取得できませんでした'
  }

  return formatJapaneseAddress(data.address)
}

onMounted(() => {
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

  // 地図クリックでピンを刺す
  map.on('click', async e => {
    const { lat, lng } = e.latlng

    if (selectMode.value === 'from') {
      if (fromMarker) map.removeLayer(fromMarker)
      fromMarker = L.marker([lat, lng], { icon: blueIcon }).addTo(map)

      fromMarker.bindTooltip('乗車場所', {
        permanent: true,
        direction: 'top',
        offset: [0, -20]
      }).openTooltip()

      fromAddress.value = await fetchAddress(lat, lng)

      emit('update:from', {
        name: fromAddress.value,
        lat,
        lng,
        image: null
      })

    } else {
      if (toMarker) map.removeLayer(toMarker)
      toMarker = L.marker([lat, lng], { icon: redIcon }).addTo(map)

      toMarker.bindTooltip('降車場所', {
        permanent: true,
        direction: 'top',
        offset: [0, -20]
      }).openTooltip()

      toAddress.value = await fetchAddress(lat, lng)

      emit('update:to', {
        name: toAddress.value,
        lat,
        lng,
        image: null
      })
    }
  })
})
</script>

<style scoped>
.map-container {
  width: 100%;
  height: 300px;
  border-radius: 8px;
  overflow: hidden;
}

.selected-box {
  border: 1px solid #ccc;
}
</style>
