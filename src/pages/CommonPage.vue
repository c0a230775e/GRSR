<template>
  <q-page padding>

    <!-- 乗車人数 -->
    <RidePeopleSelector
      v-model="people"
      :options="peopleOptions"
      :btnColor="btnColor"
    />

    <!-- 月選択 -->
    <MonthSelector
      v-model="selectedMonth"
      :months="months"
      :btnColor="btnColor"
      :selectMonth="selectMonth"
    />

    <!-- 日付選択 -->
    <DaySelector
      v-model="rideDate"
      :freeRideDates="freeRideDates"
      :btnColor="btnColor"
      class="day-selector-block"
    />

    <!-- 時間選択 -->
    <TimeSelector
      v-if="rideDate"
      v-model="time"
      :availableTimeSlots="availableTimeSlots"
      :btnColor="btnColor"
    />

    <!-- 相乗りボタン -->
    <ShareRideButtons
      :hasReservedFront="hasReservedFront"
      :hasReservedBack="hasReservedBack"

      :reservedFrontLabel="reservedFrontLabel"
      :reservedBackLabel="reservedBackLabel"

      :shareDialogVisible="shareDialogVisible"
      :shareTarget="shareTarget"
      :shareError="shareError"

      :remainingFront="remainingFront"
      :remainingBack="remainingBack"
      :isFrontShareTarget="isFrontShareTarget"

      @open-share="onShareRide"
      @close-share="shareDialogVisible = false"
      @confirm-share="confirmShareRide"
    />

    <div class="row items-center justify-between q-mt-md q-mb-sm">
      <div class="text-subtitle1">乗車場所・降車場所</div>

      <q-btn
        color="primary"
        flat
        @click="placeSelectMode = placeSelectMode === 'photo' ? 'map' : 'photo'"
        :label="placeSelectMode === 'photo' ? '地図で選ぶ' : '写真で選ぶ'"
      />
    </div>


    <!-- 写真モード -->
    <div
      v-if="placeSelectMode === 'photo'"
      class="mode-wrapper q-mt-md"
    >
      <PhotoSelector
        :pins="pins"
        :placeSelectMode="placeSelectMode"
        @update:from="from = $event"
        @update:to="to = $event"
      />
    </div>

    <!-- 地図モード -->
    <div
      v-else
      class="mode-wrapper q-mt-md"
    >
      <PointSelector
        @update:from="from = $event"
        @update:to="to = $event"
      />
    </div>

    <!-- 共通表示 -->
    <SelectedPlaceView
      :from="from"
      :to="to"
    />

    <!-- ★ フッター固定エリア -->
    <div class="reservation-footer">

      <PreviewPanel
        :people="people"
        :rideDate="rideDate"
        :time="time"
        :from="from"
        :to="to"
      />

      <SubmitButton
        v-if="people && rideDate && time && from && to"
        :canSubmit="true"
        :submit="submit"
      />

    </div>
  </q-page>
</template>


<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import '@/css/CommonPage.scss'
import { supabase } from '@/supabase'

/* --- コンポーネント読み込み --- */
import RidePeopleSelector from '@/components/RidePeopleSelector.vue'
import MonthSelector from '@/components/MonthSelector.vue'
import DaySelector from '@/components/DaySelector.vue'
import TimeSelector from '@/components/TimeSelector.vue'
import PhotoSelector from '@/components/PhotoSelector.vue'
import SelectedPlaceView from '@/components/SelectedPlaceView.vue'
import ShareRideButtons from '@/components/ShareRideButtons.vue'
import PreviewPanel from '@/components/PreviewPanel.vue'
import SubmitButton from '@/components/SubmitButton.vue'
import PointSelector from '@/components/PointSelector.vue'

const router = useRouter()

/* --- UI 共通ボタンカラー --- */
function btnColor(active, disabled) {
  if (disabled) return 'grey-4'
  return active ? 'light-green' : 'grey-5'
}


/* --- 乗車人数 --- */
const peopleOptions = ['1', '2', '3', '4', '5']
const people = ref(null)

/* --- 月・日付選択 --- */
const now = new Date()
const currentYear = now.getFullYear()
const currentMonth = now.getMonth() + 1
const selectedMonth = ref(currentMonth)

const months = computed(() => [
  { year: currentYear, month: currentMonth },
  {
    year: currentMonth === 12 ? currentYear + 1 : currentYear,
    month: currentMonth === 12 ? 1 : currentMonth + 1
  }
])

const rideDate = ref('')
const freeRideDates = ref([])

const placeSelectMode = ref('photo')  // 'photo' or 'map'

/* --- 写真選択 --- */
const pins = ref([])
const from = ref(null)
const to = ref(null)

/* --- timeSlots.json 読み込み --- */
const timeSlotsRaw = ref([])

async function loadAllSlots() {
  const url = '/assets/timeSlots.json?ts=' + Date.now()
  const res = await fetch(url)
  timeSlotsRaw.value = await res.json()
}

function getFreeDates(month) {
  return timeSlotsRaw.value
    .filter(s => s.label === 'フリー運行' && Number(s.month) === month)
    .map(s => Number(s.date))
}

function isPastDate(year, month, day) {
  const today = new Date()
  return (
    year < today.getFullYear() ||
    (year === today.getFullYear() && month < today.getMonth() + 1) ||
    (year === today.getFullYear() && month === today.getMonth() + 1 && day < today.getDate())
  )
}

function updateFreeRideDates(year, month) {
  const freeDates = [...new Set(getFreeDates(month))]
  const lastDay = new Date(year, month, 0).getDate()

  freeRideDates.value = freeDates
    .filter(d => d <= lastDay)
    .map(d => ({
      label: `${d}日`,
      value: `${year}-${String(month).padStart(2,'0')}-${String(d).padStart(2,'0')}`,
      disabled: isPastDate(year, month, d)
    }))
}

function selectMonth(year, month) {
  selectedMonth.value = month
  rideDate.value = ''
  time.value = null
  updateFreeRideDates(year, month)
}

/* --- 時間ボタン生成 --- */
const time = ref(null)
const timeSlots = ref([])

function formatTime(t) {
  return `${String(t.getHours()).padStart(2,'0')}:${String(t.getMinutes()).padStart(2,'0')}`
}

function createTimeButtons(label, y, m, d) {
  const [startStr] = label.split('-')
  const base = `${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`

  const start = new Date(`${base} ${startStr}`)
  const offsets = [0, 10, 20, 40, 50]

  return offsets.map(min => {
    const t = new Date(start.getTime() + min * 60000)
    return {
      label: formatTime(t),
      start: t,
      end: new Date(t.getTime() + 10 * 60000)
    }
  })
}

function updateTimeSlots(y, m, d) {
  const slot = timeSlotsRaw.value.find(s =>
    Number(s.month) === m &&
    Number(s.date) === d &&
    s.label !== 'フリー運行'
  )
  timeSlots.value = slot ? createTimeButtons(slot.label, y, m, d) : []
}

watch(rideDate, newDate => {
  if (!newDate) return
  const [y, m, d] = newDate.split('-').map(Number)
  updateTimeSlots(y, m, d)
})

/* --- 予約済みスロット読み込み --- */
const reservedSlots = ref([])
let reservedPeopleMap = {}
let reservedDetailMap = {}

async function loadReservedSlots() {
  const { data, error } = await supabase.from('reservations').select('*')
  if (error) return

  reservedSlots.value = data.map(r => r.time)

  reservedPeopleMap = {}
  reservedDetailMap = {}

  data.forEach(r => {
    if (!reservedPeopleMap[r.time]) reservedPeopleMap[r.time] = 0
    reservedPeopleMap[r.time] += r.people

    if (!reservedDetailMap[r.time]) {
      reservedDetailMap[r.time] = {
        id: r.id,
        from: r.from_name,
        to: r.to_name
      }
    }
  })
}

/* --- 時間ボタンの予約不可判定 --- */
function isExpired(slot) {
  return new Date() >= new Date(slot.start.getTime() + 10 * 60000)
}

const availableTimeSlots = computed(() => {
  const groupA = timeSlots.value.slice(0, 3)
  const groupB = timeSlots.value.slice(3, 5)

  const groupA_reserved = groupA.some(slot => reservedSlots.value.includes(slot.label))
  const groupB_reserved = groupB.some(slot => reservedSlots.value.includes(slot.label))

  return timeSlots.value.map((slot, index) => {
    const reserved = reservedSlots.value.includes(slot.label)
    const expired = isExpired(slot)

    let groupDisabled = false
    if (index < 3 && groupA_reserved) groupDisabled = true
    if (index >= 3 && groupB_reserved) groupDisabled = true

    return {
      ...slot,
      reserved,
      reservedPeople: reservedPeopleMap[slot.label] || 0,
      reservedId: reservedDetailMap[slot.label]?.id || null,
      reservedFrom: reservedDetailMap[slot.label]?.from || null,
      reservedTo: reservedDetailMap[slot.label]?.to || null,
      disabled: reserved || expired || groupDisabled
    }
  })
})

/* --- 相乗りボタン表示判定 --- */
const reservedPeopleFront = computed(() =>
  availableTimeSlots.value.slice(0, 3).reduce((sum, slot) => sum + slot.reservedPeople, 0)
)

const reservedPeopleBack = computed(() =>
  availableTimeSlots.value.slice(3, 5).reduce((sum, slot) => sum + slot.reservedPeople, 0)
)

const reservedFrontLabel = computed(() => {
  const slot = availableTimeSlots.value.slice(0, 3).find(s => s.reserved)
  return slot ? slot.label : null
})

const reservedBackLabel = computed(() => {
  const slot = availableTimeSlots.value.slice(3, 5).find(s => s.reserved)
  return slot ? slot.label : null
})

const remainingFront = computed(() => 5 - reservedPeopleFront.value)
const remainingBack = computed(() => 5 - reservedPeopleBack.value)

const hasReservedFront = computed(() =>
  availableTimeSlots.value.slice(0, 3).some(slot => slot.reserved && remainingFront.value > 0)
)

const hasReservedBack = computed(() =>
  availableTimeSlots.value.slice(3, 5).some(slot => slot.reserved && remainingBack.value > 0)
)

/* --- 相乗りポップアップ --- */
const shareDialogVisible = ref(false)
const shareTarget = ref(null)
const shareError = ref('')

function onShareRide(mode) {

  let targetSlots = mode === 'front'
    ? availableTimeSlots.value.slice(0, 3)
    : availableTimeSlots.value.slice(3, 5)

  console.log('mode=', mode)
  console.log('targetSlots=', targetSlots)

  const reservedSlot = targetSlots.find(
    s => s.reserved
  )

  console.log('reservedSlot=', reservedSlot)

  if (!reservedSlot) return

  shareTarget.value = reservedSlot
  shareDialogVisible.value = true
}

const isFrontShareTarget = computed(() => {
  const idx = availableTimeSlots.value.findIndex(s => s.label === shareTarget.value?.label)
  return idx >= 0 && idx < 3
})

async function confirmShareRide() {

  if (!people.value) {
    shareError.value = '乗車人数を選択してください'
    return
  }

  const isFront =
    availableTimeSlots.value.indexOf(
      shareTarget.value
    ) < 3

  const remaining =
    isFront
      ? remainingFront.value
      : remainingBack.value

  if (people.value > remaining) {

    shareError.value =
      `人数オーバーです（あと ${remaining} 人まで）`

    return
  }

  const { error } = await supabase
    .from('reservations')
    .insert({
      ride_date: rideDate.value,
      time: shareTarget.value.label,
      people: Number(people.value),
      from_name: shareTarget.value.reservedFrom,
      to_name: shareTarget.value.reservedTo,
      share: true,
      parent_id: shareTarget.value.reservedId
    })

  if (error) {
    console.error('share insert error', error)
    return
  }

  await loadReservedSlots()

  router.push({
    path: '/complete',
    query: {
      mode: 'share',
      people: people.value,
      time: shareTarget.value.label,
      rideDate: rideDate.value,
      from: shareTarget.value.reservedFrom,
      to: shareTarget.value.reservedTo
    }
  })

}

/* --- 初期ロード --- */
onMounted(async () => {
  loadReservedSlots()

  const res = await fetch('/assets/pins.json')
  pins.value = await res.json()

  await loadAllSlots()
  updateFreeRideDates(currentYear, currentMonth)

  window.addEventListener('storage', () => {
    loadReservedSlots()

    if (rideDate.value) {
      const [y, m, d] = rideDate.value.split('-').map(Number)
      updateTimeSlots(y, m, d)
    }
  })
})

/* --- 予約送信 --- */
async function submit() {

  const { error } = await supabase
    .from('reservations')
    .insert({
      ride_date: rideDate.value,
      time: time.value.label,
      people: Number(people.value),

      from_id: from.value.id,
      to_id: to.value.id,

      from_name: from.value.name,
      to_name: to.value.name,

      share: false
    })

  if (error) {
    console.error(error)
    return
  }

  router.push('/complete')
}
</script>
