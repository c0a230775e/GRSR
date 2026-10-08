<template>
  <div class="tab-container">

    <h1 class="title">Title</h1>

    <!-- タブ -->
    <q-tabs
      v-model="activeTab"
      class="custom-tabs"
      no-caps
      align="left"
    >
      <q-tab
        name="tab1"
        label="Tab 1"
      />

      <q-tab
        name="tab2"
        label="Tab 2"
      />
    </q-tabs>

    <!-- コンテンツ -->
    <div
      class="tab-content"
      :class="activeTab === 'tab1' ? 'tab1-content' : 'tab2-content'"
    >

      <!-- Tab 1 -->
      <div v-if="activeTab === 'tab1'">
        Tab 1 のコンテンツ
      </div>

      <!-- Tab 2 -->
      <div v-else>
        Tab 2 のコンテンツ
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const activeTab = ref('tab1')
</script>

<style scoped>
.tab-container {
  width: 100%;
  max-width: 570px;
  margin: 0 auto;
}

.title {
  margin: 30px 0 15px;
  text-align: center;
  color: #2fb087;
  font-size: 48px;
  font-weight: 700;
}

/* =========================
   タブ全体
========================= */

.custom-tabs {
  height: 44px;
  border-bottom: 2px solid #2fb087;
}

/* =========================
   各タブ
========================= */

.custom-tabs :deep(.q-tab) {
  min-width: 174px;
  height: 44px;
  padding: 0 24px;

  color: white;
  background-color: #2fb087;

  border-radius: 10px 10px 0 0;

  font-size: 20px;
  font-weight: 600;

  margin-right: 10px;
}

/* =========================
   選択中のタブ
========================= */

.custom-tabs :deep(.q-tab--active) {
  color: #2fb087;
  background-color: white;

  border: 2px solid #2fb087;
  border-bottom: none;

  position: relative;
  z-index: 2;
}

/* Quasar標準の下線を消す */

.custom-tabs :deep(.q-tab__indicator) {
  display: none;
}

/* =========================
   コンテンツ
========================= */

.tab-content {
  min-height: 200px;

  padding: 32px;

  font-size: 20px;
  text-align: center;

  border: 2px solid #2fb087;
  border-top: none;

  border-radius: 0 0 10px 10px;
}

/* Tab 1 */

.tab1-content {
  background-color: #e8f8f2;
  color: #2fb087;
}

/* Tab 2 */

.tab2-content {
  background-color: #fff3e8;
  color: #d9822b;
}
</style>
