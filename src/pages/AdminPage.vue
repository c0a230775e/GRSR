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

      <q-btn
        v-if="!isAdmin"
        outline
        color="primary"
        icon="login"
        label="ログイン"
        @click="showLoginDialog = true"
      />

    </div>

    <h5 class="text-center q-mb-lg">
      予約一覧
    </h5>

    <q-dialog v-model="showLoginDialog">

      <q-card style="width:300px">

        <q-card-section>
          <div class="text-h6">
            管理者認証
          </div>
        </q-card-section>

        <q-card-section>

          <q-input
            v-model="password"
            type="password"
            label="パスワード"
            outlined
          />

        </q-card-section>

        <q-card-actions align="right">

          <q-btn
            flat
            label="キャンセル"
            v-close-popup
          />

          <q-btn
            color="primary"
            label="ログイン"
            @click="login"
          />

        </q-card-actions>

      </q-card>

    </q-dialog>

    <div
      v-for="(day, date) in groupedReservations"
      :key="date"
      class="date-group"
    >

      <!-- 日付 -->
      <div class="date-title-row">
        <div class="date-title">
          {{ displayDate(date) }}
        </div>
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

            <div
              v-if="isAdmin"
              class="q-mt-sm"
            >

              <div>
                氏名：
                {{ day[slot].passenger_name }}
              </div>

              <div>
                電話番号：
                {{ day[slot].phone_number }}
              </div>

            </div>

            <!-- 展開エリア -->
            <div
              v-if="expandedItems[day[slot].id]"
            >
              <!-- 画像モード -->
              <div
                v-if="!mapMode[date]"
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

              <!-- 地図モード -->
              <div
                v-else
                class="route-map-wrapper"
              >
                <div
                  :id="`route-map-${date}`"
                  class="route-map"
                />
              </div>
            </div>

            <!-- 一番下に矢印と削除 -->
            <div class="card-footer">

              <div class="footer-left">

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

                <span
                  class="map-toggle-text"
                  @click="toggleMapMode(date)"
                >
                  {{
                    mapMode[date]
                      ? '画像を表示'
                      : '地図を表示'
                  }}
                </span>

              </div>

              <q-btn
                v-if="isAdmin"
                color="negative"
                icon="delete"
                label="削除"
                flat
                @click="confirmDelete(day[slot])"
              />

            </div>


          </template>

          <q-separator
            v-if="slot === 'front'"
          />

        </div>

      </div>

    </div>

    <q-dialog v-model="deleteDialog">

      <q-card style="min-width:300px">

        <q-card-section class="text-h6">
          予約削除
        </q-card-section>

        <q-card-section>
          この予約を削除しますか？
        </q-card-section>

        <q-card-actions align="right">

          <q-btn
            flat
            label="いいえ"
            v-close-popup
          />

          <q-btn
            color="negative"
            label="はい"
            @click="removeReservation"
          />

        </q-card-actions>

      </q-card>

    </q-dialog>

  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { supabase } from '@/supabase'
import { useRouter } from 'vue-router'
import '@/css/AdminPage.scss'
import L from 'leaflet'
import { nextTick } from 'vue'
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
const router = useRouter()
const isAdmin = ref(false)
const showLoginDialog = ref(false)
const password = ref('')
const maps = {}
const deleteDialog = ref(false)
const deleteTarget = ref(null)
const mapMode = ref({})
const fromIcon = L.icon({
  iconUrl:
    'https://maps.gstatic.com/mapfiles/ms2/micons/blue-dot.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32]
})

const toIcon = L.icon({
  iconUrl:
    'https://maps.gstatic.com/mapfiles/ms2/micons/red-dot.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32]
})

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
function confirmDelete(item) {
  deleteTarget.value = item
  deleteDialog.value = true
}

async function removeReservation() {

  const item = deleteTarget.value

  if (!item) return

  if (item.share === false) {

    const { error: childErr } = await supabase
      .from('reservations')
      .delete()
      .eq('parent_id', item.id)

    if (childErr) {
      console.error(
        '子予約削除エラー:',
        childErr
      )
    }
  }

  const { error } = await supabase
    .from('reservations')
    .delete()
    .eq('id', item.id)

  if (error) {
    console.error(
      '予約削除エラー:',
      error
    )
    return
  }

  deleteDialog.value = false

  await loadReservations()
}

async function drawMap(placeName, mapId) {

  const location = getPlaceLocation(placeName)

  if (!location) return

  await nextTick()

  if (maps[mapId]) {
    maps[mapId].remove()
  }

  maps[mapId] = L.map(mapId, {
    rotate: false,
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


/* -------------------------
   日付表示
------------------------- */
function displayDate(date) {

  if (!date) return ''

  const parts = date.split('-')

  return `${parts[1]}/${parts[2]}`
}

async function toggleExpand(item) {

  const isOpening =
    !expandedItems.value[item.id]

  // 同じ日付の予約を閉じる
  Object.keys(expandedItems.value)
    .forEach(id => {

      const reservation =
        reservations.value.find(
          r => r.id === Number(id)
        )

      if (
        reservation &&
        reservation.ride_date === item.ride_date
      ) {
        expandedItems.value[id] = false
      }
    })

  // 選択したものだけ開く
  expandedItems.value[item.id] = isOpening

  if (isOpening) {

    await nextTick()

    if (!mapMode.value[item.ride_date]) {

      drawMap(
        item.from_name,
        `from-map-${item.id}`
      )

      drawMap(
        item.to_name,
        `to-map-${item.id}`
      )

    } else {

      drawRouteMap(item.ride_date)

    }
  }
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
    if (
      mainPin.name === placeName ||
      mainPin.name.includes(placeName) ||
      placeName.includes(mainPin.name)
    ) {
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

/* -------------------------
   前半後半でグループ化
   相乗り人数を加算
------------------------- */
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
        to_name: r.to_name,
        passenger_name: r.passenger_name,
        phone_number: r.phone_number
      }

    } else {

      result[date][slotType].people += Number(r.people)

    }

  })

  return result

})

function goReservation () {
  router.push('/')
}
function logout () {

  localStorage.removeItem('adminAuth')

  isAdmin.value = false
}
async function login () {

  const { data, error } = await supabase
    .from('settings')
    .select('value')
    .eq('key', 'admin_password')
    .single()

  if (error) {
    alert('設定取得エラー')
    return
  }

  if (password.value !== data.value) {
    alert('パスワードが違います')
    return
  }

  localStorage.setItem('adminAuth', 'true')
  localStorage.setItem('adminLoginTime', Date.now())

  isAdmin.value = true

  showLoginDialog.value = false

  // 3分後に自動ログアウト
  setTimeout(() => {

    logout()

  }, 3 * 60 * 1000)
}

function toggleMapMode(date) {

  mapMode.value[date] =
    !mapMode.value[date]

  nextTick(() => {
    if (mapMode.value[date]) {
      drawRouteMap(date)
    }
  })
}
async function drawRouteMap(date) {

  const day =
    groupedReservations.value[date]

  const ride =
    day?.front || day?.back

  if (!ride) return

  const from =
    getPlaceLocation(ride.from_name)

  const to =
    getPlaceLocation(ride.to_name)

  if (!from || !to) return

  const mapId = `route-map-${date}`

  await nextTick()

  const mapElement =
    document.getElementById(mapId)

  if (!mapElement) return

  if (maps[mapId]) {
    maps[mapId].remove()
  }

  const map = L.map(mapId)

  maps[mapId] = map

  L.tileLayer(
    'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    {
      attribution:
        '&copy; OpenStreetMap contributors'
    }
  ).addTo(map)

  L.marker(
    [from.lat, from.lng],
    {
      icon: fromIcon
    }
  )
  .addTo(map)
  .bindTooltip(
    ride.from_name,
    {
      permanent: true,
      direction: 'top',
      offset: [0, -24]
    }
  )

  L.marker(
    [to.lat, to.lng],
    {
      icon: toIcon
    }
  )
  .addTo(map)
  .bindTooltip(
    ride.to_name,
    {
      permanent: true,
      direction: 'top',
      offset: [0, -24]
    }
  )

  const bounds = L.latLngBounds([
    [from.lat, from.lng],
    [to.lat, to.lng]
  ])

  map.fitBounds(bounds, {
    padding: [40, 40]
  })

  L.polyline(
    [
      [from.lat, from.lng],
      [to.lat, to.lng]
    ],
    {
      color: '#10AA34',
      weight: 5
    }
  ).addTo(map)

  setTimeout(() => {
    map.invalidateSize()
  }, 100)
}

/* -------------------------
   初期ロード
------------------------- */
onMounted(async () => {
  const loginTime = Number(localStorage.getItem('adminLoginTime'))
  const now = Date.now()

  if (
    loginTime &&
    now - loginTime < 3 * 60 * 1000
  ) {

    isAdmin.value = true

    const remain =
      3 * 60 * 1000 - (now - loginTime)

    setTimeout(() => {
      logout()
    }, remain)

  } else {

    localStorage.removeItem('adminAuth')
    localStorage.removeItem('adminLoginTime')

    isAdmin.value = false

  }

  isAdmin.value =
    localStorage.getItem('adminAuth') === 'true'

  const res = await fetch('/assets/pins.json')
  pins.value = await res.json()

  await loadReservations()

})

</script>