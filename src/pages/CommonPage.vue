<template>
  <q-page padding>

    <div class="top-button-row">

      <q-btn
        outline
        color="primary"
        icon="history"
        label="予約履歴"
        @click="openReservedPage"
      />

    </div>

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

      :hasReservedFront="hasReservedFront"
      :hasReservedBack="hasReservedBack"

      :reservedFrontLabel="reservedFrontLabel"
      :reservedBackLabel="reservedBackLabel"

      :reservedFrontFrom="reservedFront?.reservedFrom"
      :reservedFrontTo="reservedFront?.reservedTo"

      :reservedBackFrom="reservedBack?.reservedFrom"
      :reservedBackTo="reservedBack?.reservedTo"

      :frontFull="remainingFront <= 0"
      :backFull="remainingBack <= 0"

      :remaining-front="remainingFront"
      :remaining-back="remainingBack"

      @open-share="onShareRide"
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

      :from-image="shareFromImage"
      :to-image="shareToImage"

      :from-place="shareTarget?.reservedFrom"
      :to-place="shareTarget?.reservedTo"

      @open-share="onShareRide"
      @close-share="shareDialogVisible = false"
      @confirm-share="confirmShareRide"
    />

    <div class="mode-wrapper q-mt-md">

      <div class="section-title q-mb-sm">
        乗車場所・降車場所
      </div>

      <div class="place-guide">
        場所を検索するか、青色のピンを選択してください
      </div>

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

    <q-expansion-item
      icon="person"
      label="氏名・電話番号を入力する（任意）"
      class="q-mt-md q-mb-xl"
      header-class="text-grey-7"
      @show="onOpenPassengerInfo"
    >


      <div class="text-caption text-grey q-mb-md">
        通常は入力不要です。必要な方のみ入力してください。
      </div>

      <MemoPage
        v-model:name="passengerName"
        v-model:phone="phoneNumber"
      />

    </q-expansion-item>
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
import SelectedPlaceView from '@/components/SelectedPlaceView.vue'
import ShareRideButtons from '@/components/ShareRideButtons.vue'
import PreviewPanel from '@/components/PreviewPanel.vue'
import SubmitButton from '@/components/SubmitButton.vue'
import PointSelector from '@/components/PointSelector.vue'
import MemoPage from '@/components/MemoPage.vue'


const router = useRouter()

/* --- UI 共通ボタンカラー --- */
function btnColor(active, disabled) {
  if (disabled) return 'grey-3'
  return active ? 'positive' : 'white'
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

/* --- 乗降場所選択 --- */
const from = ref(null)
const to = ref(null)

const passengerName = ref('')
const phoneNumber = ref('')

/* --- timeSlots.json 読み込み --- */
const timeSlotsRaw = ref([])
const pins = ref([])

async function loadAllSlots() {
  const url = '/assets/timeSlots.json?ts=' + Date.now()
  const res = await fetch(url)
  timeSlotsRaw.value = await res.json()
}

function openReservedPage() {
  router.push('/reserved')
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

  reservedSlots.value = data.map(
    r => `${r.ride_date}_${r.time}`
  )

  reservedPeopleMap = {}
  reservedDetailMap = {}

  data.forEach(r => {
    const key =
      `${r.ride_date}_${r.time}`

    if (!reservedPeopleMap[key]) {
      reservedPeopleMap[key] = 0
    }

    reservedPeopleMap[key] += r.people

    if (!reservedDetailMap[key]) {
      reservedDetailMap[key] = {
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
    const reservationKey =
      `${rideDate.value}_${slot.label}`

    const reserved =
      reservedSlots.value.includes(
        reservationKey
      )
    const expired = isExpired(slot)

    let groupDisabled = false
    if (index < 3 && groupA_reserved) groupDisabled = true
    if (index >= 3 && groupB_reserved) groupDisabled = true

    return {
      ...slot,
      reserved,
      reservedPeople:reservedPeopleMap[reservationKey] || 0,
      reservedId:
      reservedDetailMap[reservationKey]?.id || null,
      reservedFrom:reservedDetailMap[reservationKey]?.from || null,
      reservedTo:reservedDetailMap[reservationKey]?.to || null,
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

const reservedFront = computed(() =>
  availableTimeSlots.value
    .slice(0, 3)
    .find(slot => slot.reserved)
)

const reservedBack = computed(() =>
  availableTimeSlots.value
    .slice(3, 5)
    .find(slot => slot.reserved)
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
  availableTimeSlots.value
    .slice(0, 3)
    .some(slot => slot.reserved)
)

const hasReservedBack = computed(() =>
  availableTimeSlots.value
    .slice(3, 5)
    .some(slot => slot.reserved)
)

/* --- 相乗りポップアップ --- */
const shareDialogVisible = ref(false)
const shareTarget = ref(null)
const shareError = ref('')

const shareFromImage = computed(() => {

  if (!shareTarget.value) return ''

  return getPlaceImage(
    shareTarget.value.reservedFrom
  )
})

const shareToImage = computed(() => {

  if (!shareTarget.value) return ''

  return getPlaceImage(
    shareTarget.value.reservedTo
  )
})

function getPlaceImage(placeName) {

    for (const mainPin of pins.value) {

      if (mainPin.name === placeName) {
        return mainPin.image
      }

      const sub =
        mainPin.subLocations?.find(
          s => s.name === placeName
        )

      if (sub) {
        return sub.image
      }
    }

    return ''
  }

function onShareRide(mode) {

  let targetSlots = mode === 'front'
    ? availableTimeSlots.value.slice(0, 3)
    : availableTimeSlots.value.slice(3, 5)
  const reservedSlot = targetSlots.find(
    s => s.reserved
  )

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
      user_id: localStorage.getItem('userId'),
      ride_date: rideDate.value,
      time: shareTarget.value.label,
      people: Number(people.value),

      from_name: shareTarget.value.reservedFrom,
      to_name: shareTarget.value.reservedTo,

      passenger_name: passengerName.value,
      phone_number: phoneNumber.value,

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

function onOpenPassengerInfo () {

  setTimeout(() => {

    window.scrollBy({
      top: 200,
      behavior: 'smooth'
    })

  }, 300)

}

/* --- 初期ロード --- */
onMounted(async () => {
  loadReservedSlots()
  await loadAllSlots()
  updateFreeRideDates(currentYear, currentMonth)
  const res = await fetch('/assets/pins.json')
  pins.value = await res.json()

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
      user_id: localStorage.getItem('userId'),

      ride_date: rideDate.value,
      time: time.value.label,
      people: Number(people.value),

      from_id: from.value.id,
      to_id: to.value.id,

      from_name: from.value.name,
      to_name: to.value.name,

      passenger_name: passengerName.value,
      phone_number: phoneNumber.value,

      share: false
    })

  if (error) {
    console.error(error)
    return
  }

  router.push('/complete')
}
</script>
