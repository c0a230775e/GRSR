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
        :class="activeTab === 'tab2' ? 'tab1-inactive' : ''"
      />

      <q-tab
        name="tab2"
        label="Tab 2"
        :class="activeTab === 'tab1' ? 'tab2-inactive' : ''"
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
  /* ★ 下線を消す */
  border-bottom: none;
  background-color: #ffffff; /* ← コンテンツと同じ色に統一 */
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
   選択中のタブ（外枠線を完全に消す）
========================= */

.custom-tabs :deep(.q-tab--active) {
  color: #2fb087;

  /* ★ 選択タブの背景色は動的に切り替え（既存のまま） */
  background-color: v-bind(activeTab === 'tab1' ? '#e8f8f2' : '#ffe8e8');

  /* ★ 外枠線を完全に消す */
  border: none;

  position: relative;
  z-index: 2;
}

/* =========================
   非選択タブ（既に色を切り替えている）
========================= */

.tab1-inactive {
  background-color: #e8f8f2 !important;
  color: #2fb087 !important;
}

.tab2-inactive {
  background-color: #ffe8e8 !important;
  color: #d9822b !important;
}

/* =========================
   コンテンツ（境界線なし）
========================= */

.tab-content {
  min-height: 200px;
  padding: 32px;
  font-size: 20px;
  text-align: center;

  border: none; /* ← 境界線なし */

  /* ★ タブと完全に一体化させるため角丸を下だけに */
  border-radius: 0 0 10px 10px;
}

/* Tab1 */
.tab1-content {
  background-color: #e8f8f2;
  color: #2fb087;
}

/* Tab2 */
.tab2-content {
  background-color: #ffe8e8;
  color: #d9822b;
}

</style>
