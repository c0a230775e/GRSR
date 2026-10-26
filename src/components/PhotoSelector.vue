<template>

  <div
    v-if="placeSelectMode === 'photo'"
    class="q-mb-md"
  >

    <div class="photo-scroll-wrapper">

      <div class="photo-grid">

        <div
          v-for="pin in arrangedPins"
          :key="pin.id"
          class="photo-card"
          @click="openSubSelector(pin)"
        >

          <div class="text-center text-bold q-mb-xs">
            No. {{ pin.id }}
          </div>

          <div class="text-center q-mb-xs">
            {{ pin.name }}
          </div>

          <q-img
            :src="pin.image"
            class="photo-img"
          />

        </div>

      </div>

    </div>

  </div>

  <!-- サブ地点選択 -->

  <q-dialog v-model="showDialog">

    <q-card class="sub-photo-dialog">

      <q-card-section>

        <div class="text-h6">
          画像を選択
        </div>

      </q-card-section>

      <q-card-section>

        <div class="sub-photo-scroll">
          <div class="sub-photo-grid">
            <div
              v-for="sub in selectedMainPin?.subLocations || []"
              :key="sub.id"
              class="sub-photo-card"
              :class="{ selected: selectedSubPin?.id === sub.id }"
              @click="selectSubPin(sub)"
            >
              <div class="sub-photo-title">
                {{ sub.name }}
              </div>

              <q-img
                :src="sub.image"
                class="photo-img"
              />
            </div>
          </div>
        </div>

      </q-card-section>

      <div class="sub-photo-actions">

        <div class="sub-photo-actions-top">
          <q-btn
            color="negative"
            label="降車場所に設定"
            :disable="!selectedSubPin"
            @click="setToLocation"
          />

          <q-btn
            color="primary"
            label="乗車場所に設定"
            :disable="!selectedSubPin"
            @click="setFromLocation"
          />
        </div>

        <div class="sub-photo-actions-bottom">
          <q-btn
            flat
            label="キャンセル"
            @click="closeDialog"
          />
        </div>

      </div>


    </q-card>

  </q-dialog>

</template>

<script setup>
  import { computed, ref } from 'vue'

  const emit = defineEmits([
    'update:from',
    'update:to'
  ])

  const { pins, placeSelectMode } = defineProps({
    pins: Array,
    placeSelectMode: String
  })

  const showDialog = ref(false)
  const selectedMainPin = ref(null)
  const selectedSubPin = ref(null)

  /* -----------------------------------
    2行 × 縦方向優先の並び順に変換
  ----------------------------------- */
  const arrangedPins = computed(() => {

    const row1 = []
    const row2 = []

    pins.forEach((p, i) => {
      if (i % 2 === 0) {
        row1.push(p)
      } else {
        row2.push(p)
      }
    })

    const result = []
    const maxLen = Math.max(row1.length, row2.length)

    for (let i = 0; i < maxLen; i++) {

      if (row1[i]) {
        result.push(row1[i])
      }

      if (row2[i]) {
        result.push(row2[i])
      }

    }

    return result
  })

  function openSubSelector(pin) {

    selectedMainPin.value = pin
    selectedSubPin.value = null
    showDialog.value = true

  }

  function selectSubPin(sub) {

    selectedSubPin.value = sub

  }

  function setFromLocation() {

    if (!selectedSubPin.value) return

    emit('update:from', {
      mainId: selectedMainPin.value.id,
      subCode: selectedSubPin.value.id,
      name: selectedSubPin.value.name,
      lat: selectedSubPin.value.lat,
      lng: selectedSubPin.value.lng,
      image: selectedSubPin.value.image
    })

    closeDialog()
  }

  function setToLocation() {

    if (!selectedSubPin.value) return

    emit('update:to', {
      mainId: selectedMainPin.value.id,
      subCode: selectedSubPin.value.id,
      name: selectedSubPin.value.name,
      lat: selectedSubPin.value.lat,
      lng: selectedSubPin.value.lng,
      image: selectedSubPin.value.image
    })

    closeDialog()
  }

  function closeDialog() {

    showDialog.value = false
    selectedMainPin.value = null
    selectedSubPin.value = null

  }
</script>