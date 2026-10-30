<template>
  <!-- 相乗りポップアップ -->
  <q-dialog
    :model-value="shareDialogVisible"
  >
    <q-card class="dialog-card">

      <q-card-section class="text-h6">
        相乗り申請
      </q-card-section>

      <q-card-section>

        <div class="reservation-list-card">

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
                    {{ shareTarget?.reservedPeople }}人
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
                      {{ shareTarget?.label }}
                    </div>

                    <div class="text-grey">

                      残り

                      {{
                        isFrontShareTarget
                          ? remainingFront
                          : remainingBack
                      }}

                      人

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
                      {{ shareTarget?.reservedFrom }}
                    </span>

                  </div>

                  <div class="preview-location">

                    <q-icon
                      name="location_on"
                      color="negative"
                      size="20px"
                    />

                    <span>
                      {{ shareTarget?.reservedTo }}
                    </span>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>

        <div
          v-if="shareError"
          class="text-red q-mt-sm"
        >
          {{ shareError }}
        </div>

      </q-card-section>
      <div class="location-photo-area">

        <div class="location-photo-card">

          <div class="photo-title">
            乗車場所
          </div>

          <img
            :src="props.fromImage"
            class="location-photo"
          >

          <div
            id="share-from-map"
            class="location-mini-map"
          />

        </div>

        <div class="location-photo-card">

          <div class="photo-title">
            降車場所
          </div>

          <img
            :src="props.toImage"
            class="location-photo"
          >

          <div
            id="share-to-map"
            class="location-mini-map"
          />

        </div>

      </div>

      <div class="dialog-buttons">

        <q-btn
          flat
          label="✖"
          color="red"
          size="28px"
          class="dialog-action-btn"
          @click="emit('close-share')"
        />

        <q-btn
          flat
          label="✔"
          color="primary"
          size="28px"
          class="dialog-action-btn"
          @click="emit('confirm-share')"
        />

      </div>

    </q-card>
  </q-dialog>

</template>

<script setup>
import '@/css/AdminPage.scss';
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { onMounted, watch, nextTick } from 'vue'
import { ref } from 'vue'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

delete L.Icon.Default.prototype._getIconUrl

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow
})
const pins = ref([])
const maps = {}
const props = defineProps({
  hasReservedFront: Boolean,
  hasReservedBack: Boolean,

  reservedFrontLabel: String,
  reservedBackLabel: String,

  shareDialogVisible: Boolean,
  shareTarget: Object,
  shareError: String,

  remainingFront: Number,
  remainingBack: Number,
  isFrontShareTarget: Boolean,

  fromImage: String,
  toImage: String,

  fromPlace: String,
  toPlace: String
})

const emit = defineEmits([
  'open-share',
  'close-share',
  'confirm-share'
])

onMounted(async () => {

  const res = await fetch('/assets/pins.json')
  pins.value = await res.json()

})

function getPlaceLocation(placeName) {

  for (const mainPin of pins.value) {

    if (mainPin.name === placeName) {
      return {
        lat: mainPin.lat,
        lng: mainPin.lng
      }
    }

    const sub =
      mainPin.subLocations?.find(
        s => s.name === placeName
      )

    if (sub) {
      return {
        lat: sub.lat,
        lng: sub.lng
      }
    }
  }

  return null
}

function drawMap(placeName, mapId) {

  const location =
    getPlaceLocation(placeName)

  if (!location) return

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

  maps[mapId].dragging.disable()
  maps[mapId].touchZoom.disable()
  maps[mapId].doubleClickZoom.disable()
  maps[mapId].scrollWheelZoom.disable()

  L.tileLayer(
    'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
  ).addTo(maps[mapId])

  L.marker([
    location.lat,
    location.lng
  ]).addTo(maps[mapId])
}

watch(
  () => props.shareDialogVisible,
  async visible => {

    if (!visible) return

    await nextTick()

    drawMap(
      props.fromPlace,
      'share-from-map'
    )

    drawMap(
      props.toPlace,
      'share-to-map'
    )
  }
)
</script>