<template>
  <div class="point-selector">

    <!-- 検索エリア -->
    <div class="search-area">

      <q-select
        v-model="searchPlace"
        use-input
        fill-input
        hide-selected
        input-debounce="0"
        outlined
        dense
        label="場所を検索"
        option-label="label"
        :options="searchOptions"
        @filter="filterPlaces"
        @update:model-value="moveToPlace"
      >

        <template #option="scope">
          <q-item v-bind="scope.itemProps">
            <q-item-section>
              <q-item-label>
                {{ scope.opt.label }}
              </q-item-label>

              <q-item-label caption>
                {{ scope.opt.caption }}
              </q-item-label>

            </q-item-section>
          </q-item>
        </template>

      </q-select>

      <q-select
        v-model="selectedMainPlace"
        outlined
        dense
        label="メイン地点一覧"
        :options="mainPlaceOptions"
        @update:model-value="selectMainPlace"
      />

    </div>


    </div>

    <!-- メイン地図 -->
    <div id="map" class="map-container"></div>

    <!-- オーバーレイ -->
    <div
      v-if="showOverlay"
      class="overlay"
    >
      <div class="overlay-content">
        <div
          id="submap"
          class="submap-container"
        ></div>
        <!-- 選択画像 -->
        <div class="selected-image-wrapper">

          <q-img
            v-if="selectedSubPin"
            :src="selectedSubPin.image"
            class="point-selected-img"
          />

          <div
            v-else
            class="select-pin-message"
          >
            青色のピンを選択してください
          </div>

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
</template>

<script setup>
import { ref, onMounted } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import '@/css/CommonPage.scss'

const emit = defineEmits(['update:from', 'update:to'])

let map
const markers = []
const subMarkers = []
const pins = ref([])
let subMap = null

const centerLat = 35.6417633
const centerLng = 140.0473219

const searchPlace = ref(null)
const searchOptions = ref([])

const selectedMainPlace = ref(null)
const mainPlaceOptions = ref([])

const allPlaces = ref([])

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
      [35.6517931, 140.0636615],
      [35.6318486, 140.0317373]
    ],
    maxBoundsViscosity: 0.2,
    rotate: true,
    touchRotate: true
  })

  map.setBearing(-40)

  L.tileLayer(
    'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    {
      attribution: '&copy; OpenStreetMap contributors'
    }
  ).addTo(map)

  /* -------------------------
     初期位置へ戻るボタン
  ------------------------- */
  const CompassControl = L.Control.extend({
    options: {
      position: 'topleft'
    },

    onAdd() {
      const wrapper = L.DomUtil.create(
        'div',
        'leaflet-control-zoom leaflet-bar'
      )

      const button = L.DomUtil.create(
        'a',
        'leaflet-control-zoom-in',
        wrapper
      )

      button.innerHTML = '🧭'
      button.href = '#'
      button.title = '初期位置へ戻る'
      button.setAttribute('role', 'button')

      L.DomEvent.disableClickPropagation(wrapper)

      L.DomEvent.on(button, 'click', (e) => {
        L.DomEvent.preventDefault(e)

        map.setView(
          [centerLat, centerLng],
          15
        )
      })

      return wrapper
    }
  })

  map.addControl(new CompassControl())

  const res = await fetch('/assets/pins.json')
  pins.value = await res.json()

  allPlaces.value = []
  mainPlaceOptions.value = []

  pins.value.forEach(main => {

    mainPlaceOptions.value.push({
      label: main.name,
      value: main
    })

    allPlaces.value.push({
      label: main.name,
      mainPin: main,
      subPin: null
    })

    if (main.subLocations) {

      main.subLocations.forEach(sub => {

        allPlaces.value.push({
          label: sub.name,
          caption: main.name,
          mainPin: main,
          subPin: sub
        })

      })

    }

  })

  mainPlaceOptions.value.sort((a, b) =>
    a.label.localeCompare(
      b.label,
      'ja',
      {
        numeric: true
      }
    )
  )

  searchOptions.value = []

  pins.value.forEach(pin => {
    if (!pin.lat || !pin.lng) return

    const marker = L.marker(
      [pin.lat, pin.lng],
      {
        icon: blueIcon
      }
    ).addTo(map)

    marker.bindTooltip(pin.name, {
      permanent: true,
      direction: 'top',
      offset: [0, -10]
    })

    marker.closeTooltip()

    markers.push(marker)

    marker.on('click', () => {
      overlayPin.value = pin

      if (
        pin.subLocations &&
        pin.subLocations.length > 0
      ) {
        showSubPins(pin)
        return
      }

      selectedSubPin.value = pin
      showOverlay.value = true
    })
  })

  map.on('zoomend', () => {
    updatePinLabels()

    if (map.getZoom() < 18) {
      clearSubPins()

      selectedSubPin.value = null
      showOverlay.value = false
    }
  })

  updatePinLabels()
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

function showSubMap(mainPin) {
  const element = document.getElementById('submap')

  if (!element) return

  if (subMap) {
    subMap.remove()
    subMap = null
  }

  subMap = L.map('submap', {
    center: [mainPin.lat, mainPin.lng],
    zoom: 18,
    zoomControl: false,
    attributionControl: false
  })

  L.tileLayer(
    'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    {
      attribution: '&copy; OpenStreetMap contributors'
    }
  ).addTo(subMap)

  mainPin.subLocations.forEach(sub => {
    const marker = L.marker(
      [sub.lat, sub.lng],
      {
        icon: blueIcon
      }
    ).addTo(subMap)

    marker.bindTooltip(sub.name, {
      permanent: true,
      direction: 'top',
      offset: [0, -10]
    })

    marker.on('click', () => {
      selectedSubPin.value = sub
    })
  })

  const bounds = mainPin.subLocations.map(sub => [
    sub.lat,
    sub.lng
  ])

  subMap.fitBounds(bounds)

  setTimeout(() => {
    subMap.invalidateSize()
  }, 100)
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

function closeOverlay() {
  if (subMap) {
    subMap.remove()
    subMap = null
  }
  showOverlay.value = false

  selectedSubPin.value = null

  clearSubPins()

  map.setView(
    [centerLat, centerLng],
    15
  )
}

function updatePinLabels() {
  if (!map) return

  const zoom = map.getZoom()

  markers.forEach(marker => {
    if (zoom >= 16) {
      marker.openTooltip()
    } else {
      marker.closeTooltip()
    }
  })
}
function clearSubPins() {
  subMarkers.forEach(marker => {
    marker.closeTooltip()

    if (map.hasLayer(marker)) {
      map.removeLayer(marker)
    }
  })

  subMarkers.length = 0
}
function showSubPins(mainPin) {
  clearSubPins()

  map.setView(
    [mainPin.lat, mainPin.lng],
    18,
    {
      animate: true
    }
  )

  mainPin.subLocations.forEach(sub => {
    const marker = L.marker(
      [sub.lat, sub.lng],
      {
        icon: blueIcon
      }
    ).addTo(map)

    marker.bindTooltip(sub.name, {
      permanent: true,
      direction: 'top'
    })

    marker.on('click', () => {
      overlayPin.value = mainPin
      selectedSubPin.value = sub
      showOverlay.value = true

      setTimeout(() => {
        showSubMap(mainPin)
      }, 50)
    })

    subMarkers.push(marker)
  })
}

function normalizeText(text) {
  return text
    .toLowerCase()
    .replace(/[ァ-ヶ]/g, char =>
      String.fromCharCode(
        char.charCodeAt(0) - 0x60
      )
    )
}

function filterPlaces(val, update) {

  update(() => {

    if (!val || val.trim() === '') {
      searchOptions.value = []
      return
    }

    const keyword =
      normalizeText(val)

    searchOptions.value =
      allPlaces.value.filter(place => {

        const name =
          normalizeText(place.label)

        return (
          name.includes(keyword) ||
          (place.keywords || []).some(k =>
            normalizeText(k).includes(keyword)
          )
        )

      })
  })
}

function moveToPlace(place) {

  if (!place) return

  if (place.subPin) {

    overlayPin.value = place.mainPin
    selectedSubPin.value = place.subPin

    map.setView(
      [place.subPin.lat, place.subPin.lng],
      18
    )

    showOverlay.value = true

    setTimeout(() => {
      showSubMap(place.mainPin)
    }, 100)

    return
  }

  overlayPin.value = place.mainPin

  if (
    place.mainPin.subLocations &&
    place.mainPin.subLocations.length > 0
  ) {

    selectedSubPin.value = null

  } else {

    selectedSubPin.value =
      place.mainPin

  }

  map.setView(
    [
      place.mainPin.lat,
      place.mainPin.lng
    ],
    18
  )

  showOverlay.value = true

  setTimeout(() => {

    if (place.mainPin.subLocations) {
      showSubMap(place.mainPin)
    }

  }, 100)
}

function selectMainPlace(option) {

  if (!option) return

  const mainPin = option.value

  overlayPin.value = mainPin

  if (
    mainPin.subLocations &&
    mainPin.subLocations.length > 0
  ) {

    selectedSubPin.value = null

  } else {

    selectedSubPin.value =
      mainPin

  }

  map.setView(
    [
      mainPin.lat,
      mainPin.lng
    ],
    18
  )

  showOverlay.value = true

  setTimeout(() => {

    if (
      mainPin.subLocations &&
      mainPin.subLocations.length > 0
    ) {
      showSubMap(mainPin)
    }

  }, 100)
}

</script>
