<template>
  <q-page padding>
    <h5 class="text-center q-mb-lg">予約情報入力</h5>

    <!-- 乗車人数 -->
    <div class="q-mb-md">
      <div class="text-subtitle1 q-mb-sm">乗車人数</div>
      <div class="row q-col-gutter-sm">
        <div class="col-4" v-for="n in peopleOptions" :key="n">
          <q-btn
            class="common-btn"
            :label="n"
            :color="btnColor(people === n, false)"
            @click="people = n"
          />
        </div>
      </div>
    </div>

    <!-- 月選択＋日付選択 -->
    <div class="q-mb-md">
      <div class="text-subtitle1 q-mb-sm">乗車日</div>

      <div class="row q-col-gutter-sm q-mb-sm">
        <div class="col-6" v-for="m in months" :key="m.month">
          <q-btn
            class="common-btn"
            :label="`${m.month}月`"
            :color="btnColor(selectedMonth === m.month, false)"
            @click="selectMonth(m.year, m.month)"
          />
        </div>
      </div>

      <div class="divider-line"></div>

      <div class="row q-col-gutter-sm">
        <div class="col-4" v-for="d in freeRideDates" :key="d.value">
          <q-btn
            class="common-btn"
            :label="d.label"
            :color="btnColor(rideDate === d.value, d.disabled)"
            :disable="d.disabled"
            @click="!d.disabled && (rideDate = d.value)"
          />
        </div>
      </div>
    </div>

    <!-- 時間選択 -->
    <div v-if="rideDate" class="q-mb-md">
      <div class="text-subtitle1 q-mb-sm">予約時間</div>

      <!-- 1〜2行目：既存の時間ボタン -->
      <div class="time-grid">
        <div v-for="slot in availableTimeSlots" :key="slot.label">
          <q-btn
            class="common-btn"
            :label="slot.label"
            :color="btnColor(time === slot.label, slot.disabled)"
            :disable="slot.disabled"
            @click="!slot.disabled && (time = slot.label)"
          />
        </div>
      </div>

      <!-- ★ 3行目：予約が入っている場合のみ相乗りボタンを表示 -->
      <!-- ★ 前半の相乗りボタン -->
      <div v-if="hasReservedFront" class="q-mt-md text-center">
        <q-btn
          class="common-btn"
          color="secondary"
          :label="reservedFrontLabel ? `${reservedFrontLabel} の相乗り` : '前半の相乗り'"
          @click="onShareRide('front')"
        />

      </div>

      <!-- ★ 後半の相乗りボタン -->
      <div v-if="hasReservedBack" class="q-mt-md text-center">
        <q-btn
          class="common-btn"
          color="secondary"
          :label="reservedBackLabel ? `${reservedBackLabel} の相乗り` : '後半の相乗り'"
          @click="onShareRide('back')"
        />

      </div>

    </div>

    <!-- 写真一覧 -->
    <div class="q-mb-md">
      <div class="text-subtitle1 q-mb-sm">乗車場所・降車場所</div>

      <div style="overflow-x: auto; white-space: nowrap;">
        <div class="photo-grid">
          <div
            v-for="pin in pins"
            :key="pin.id"
            class="photo-card"
            @click="onPhotoTap(pin)"
          >
            <div class="text-center text-bold q-mb-xs">No. {{ pin.id }}</div>
            <div class="text-center q-mb-xs">{{ pin.name }}</div>
            <q-img :src="pin.image" class="photo-img" />
          </div>
        </div>
      </div>
    </div>

    <!-- 選択した場所 -->
    <div class="q-mb-md">
      <div class="text-subtitle1 q-mb-sm">選択した場所</div>
      <div class="row q-col-gutter-sm">
        <div class="col-6" v-if="from">
          <div class="text-center q-mb-xs">乗車場所</div>
          <q-img :src="from.image" class="selected-img" />
          <div class="text-center q-mt-xs">{{ from.name }}</div>
        </div>
        <div class="col-6" v-if="to">
          <div class="text-center q-mb-xs">降車場所</div>
          <q-img :src="to.image" class="selected-img" />
          <div class="text-center q-mt-xs">{{ to.name }}</div>
        </div>
      </div>
    </div>

    <!-- 予約送信 -->
    <q-btn
      v-if="people && rideDate && time && from && to"
      label="予約送信"
      color="primary"
      class="common-btn q-mt-md"
      @click="submit"
    />

    <!-- プレビュー -->
    <div class="q-mt-lg q-pa-md bg-grey-2 rounded-borders">
      <div class="text-subtitle1 q-mb-sm">選択内容</div>
      <div>乗車人数：{{ people || '未選択' }}</div>
      <div>乗車日：{{ rideDate || '未選択' }}</div>
      <div>予約時間：{{ time || '未選択' }}</div>
      <div>乗車場所：{{ from?.name || '未選択' }}</div>
      <div>降車場所：{{ to?.name || '未選択' }}</div>
    </div>

    <!-- ポップアップ -->
    <q-dialog v-model="dialogVisible">
      <q-card class="dialog-card">

        <q-card-section class="text-h6">
          {{ dialogMode === 'from' ? '乗車場所に設定しますか？' : '降車場所に設定しますか？' }}
        </q-card-section>

        <q-card-section>
          <q-img :src="selectedPin?.image" class="dialog-img" />
          <div class="text-center q-mt-sm">{{ selectedPin?.name }}</div>
        </q-card-section>

        <q-btn
          flat
          label="✖"
          color="red"
          @click="dialogVisible = false"
          class="dialog-btn dialog-btn-close"
        />

        <q-btn
          flat
          label="✔"
          color="primary"
          @click="confirmSelection"
          class="dialog-btn dialog-btn-ok"
        />

      </q-card>
    </q-dialog>

    <!-- 相乗りポップアップ -->
    <q-dialog v-model="shareDialogVisible">
      <q-card class="dialog-card">

        <q-card-section class="text-h6">
          相乗り申請
        </q-card-section>

        <q-card-section>
          <div class="q-mb-sm">
            <div>予約時間：{{ shareTarget?.label }}</div>
            <div>予約済み人数：{{ shareTarget?.reservedPeople }} 人</div>
            <div>
              あと乗れる人数：
              {{ isFrontShareTarget ? remainingFront : remainingBack }} 人
            </div>
          </div>

          <div class="q-mb-md">
            <div class="text-bold">乗車場所</div>
            <div>{{ shareTarget?.reservedFrom }}</div>
          </div>

          <div class="q-mb-md">
            <div class="text-bold">降車場所</div>
            <div>{{ shareTarget?.reservedTo }}</div>
          </div>

          <div v-if="shareError" class="text-red q-mt-sm">
            {{ shareError }}
          </div>
        </q-card-section>

        <q-btn
          flat
          label="✖"
          color="red"
          @click="shareDialogVisible = false"
          class="dialog-btn dialog-btn-close"
        />

        <q-btn
          flat
          label="✔"
          color="primary"
          @click="confirmShareRide"
          class="dialog-btn dialog-btn-ok"
        />

      </q-card>
    </q-dialog>

  </q-page>
</template>


<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import '@/css/CommonPage.scss'

const router = useRouter()

// UI 共通ボタンカラー
function btnColor(active, disabled) {
  if (disabled) return 'grey-4'
  return active ? 'primary' : 'grey-5'
}

// 乗車人数
const peopleOptions = ['1', '2', '3', '4', '5']
const people = ref(null)

// 月・日付選択
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
const pins = ref([])
const from = ref(null)
const to = ref(null)
const dialogVisible = ref(false)
const dialogMode = ref('from')
const selectedPin = ref(null)

function onPhotoTap(pin) {
  selectedPin.value = pin
  dialogMode.value = from.value ? 'to' : 'from'
  dialogVisible.value = true
}

function confirmSelection() {
  if (dialogMode.value === 'from') from.value = selectedPin.value
  else to.value = selectedPin.value
  dialogVisible.value = false
}

// timeSlots.json 読み込み
const timeSlotsRaw = ref([])

async function loadAllSlots() {
  // 開発環境かどうか判定
  const isDev = window.location.hostname === 'localhost'

  // URL を切り替え
  const url = isDev
    ? '/assets/timeSlots.json?ts=' + Date.now()
    : 'http://10.203.36.66:4000/assets/timeSlots.json?ts=' + Date.now()

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

// 時間ボタン生成
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

// 予約済みスロット読み込み
const reservedSlots = ref([])
let reservedPeopleMap = {}
let reservedDetailMap = {}

function loadReservedSlots() {
  const rawReservations = JSON.parse(localStorage.getItem('reservations') || '[]')

  reservedSlots.value = rawReservations.map(r => r.time)

  reservedPeopleMap = {}
  reservedDetailMap = {}

  rawReservations.forEach(r => {
    // ★ 同じ時間帯の人数を合計する
    if (!reservedPeopleMap[r.time]) {
      reservedPeopleMap[r.time] = 0
    }
    reservedPeopleMap[r.time] += Number(r.people)

    // ★ from/to は最初の予約者のものを使う
    if (!reservedDetailMap[r.time]) {
      reservedDetailMap[r.time] = {
        from: r.from,
        to: r.to
      }
    }
  })
}

// 時間ボタンの予約不可判定
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
      reservedFrom: reservedDetailMap[slot.label]?.from || null,
      reservedTo: reservedDetailMap[slot.label]?.to || null,
      disabled: reserved || expired || groupDisabled
    }
  })
})

// 相乗りボタン表示判定
// ★ 前半（3枠）の予約人数合計
const reservedPeopleFront = computed(() => {
  return availableTimeSlots.value
    .slice(0, 3)
    .reduce((sum, slot) => sum + slot.reservedPeople, 0)
})

// ★ 後半（2枠）の予約人数合計
const reservedPeopleBack = computed(() => {
  return availableTimeSlots.value
    .slice(3, 5)
    .reduce((sum, slot) => sum + slot.reservedPeople, 0)
})

// ★ 前半の予約時間（存在すればその label を返す）
const reservedFrontLabel = computed(() => {
  const slot = availableTimeSlots.value.slice(0, 3).find(s => s.reserved)
  return slot ? slot.label : null
})

// ★ 後半の予約時間（存在すればその label を返す）
const reservedBackLabel = computed(() => {
  const slot = availableTimeSlots.value.slice(3, 5).find(s => s.reserved)
  return slot ? slot.label : null
})

// ★ 前半の相乗りボタン表示判定
const hasReservedFront = computed(() =>
  availableTimeSlots.value.slice(0, 3).some(slot =>
    slot.reserved && remainingFront.value > 0
  )
)

// ★ 後半の相乗りボタン表示判定
const hasReservedBack = computed(() =>
  availableTimeSlots.value.slice(3, 5).some(slot =>
    slot.reserved && remainingBack.value > 0
  )
)

const remainingFront = computed(() => 5 - reservedPeopleFront.value)
const remainingBack = computed(() => 5 - reservedPeopleBack.value)

// 相乗りポップアップ
const shareDialogVisible = ref(false)
const shareTarget = ref(null)
const shareError = ref('')

function onShareRide(mode) {
  let targetSlots = mode === 'front'
    ? availableTimeSlots.value.slice(0, 3)
    : availableTimeSlots.value.slice(3, 5)

  const reservedSlot = targetSlots.find(s => s.reserved)
  if (!reservedSlot) return

  shareTarget.value = reservedSlot
  shareError.value = ''
  shareDialogVisible.value = true
}

const isFrontShareTarget = computed(() => {
  const idx = availableTimeSlots.value.findIndex(s => s.label === shareTarget.value?.label)
  return idx >= 0 && idx < 3
})

function confirmShareRide() {
  if (!people.value) {
    shareError.value = '乗車人数を選択してください'
    return
  }

  const isFront = availableTimeSlots.value.indexOf(shareTarget.value) < 3
  const remaining = isFront ? remainingFront.value : remainingBack.value

  if (people.value > remaining) {
    shareError.value = `人数オーバーです（あと ${remaining} 人まで）`
    return
  }

  const reservations = JSON.parse(localStorage.getItem('reservations') || '[]')

 reservations.push({
    id: Date.now(),
    share: true,
    rideDate: rideDate.value,
    time: shareTarget.value.label,
    from: shareTarget.value.reservedFrom,
    to: shareTarget.value.reservedTo,
    people: people.value
  })



  localStorage.setItem('reservations', JSON.stringify(reservations))
  loadReservedSlots()

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

// 初期ロード
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

// 予約送信
function submit() {
  const reservations = JSON.parse(localStorage.getItem('reservations') || '[]')

  const newId = Date.now()

  reservations.push({
    id: newId,
    people: people.value,
    time: time.value,
    rideDate: rideDate.value,
    from: from.value.name,
    to: to.value.name
  })

  localStorage.setItem('reservations', JSON.stringify(reservations))
  loadReservedSlots()
  router.push('/complete')
}


</script>
