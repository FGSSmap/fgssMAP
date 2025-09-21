// ==========================
// グローバル変数とDOM要素の取得
// ==========================
const campusMapUrl = "https://www.google.com/maps/d/u/1/embed?mid=1nTgYFWkXf1UQHwGZCwdXuRv-aopgUkY&ehbc=2E312F";
const worldMapUrl = "https://www.google.com/maps/d/embed?mid=1qtamWdIhe4du3uLXQxcD9IrGgNgaVoc&ehbc=2E312F";

// DOM要素の取得
const campusMap = document.getElementById("campus-map");
const japanMap = document.getElementById("japan-map");
const prefMap = document.getElementById("prefecture-map");
const worldMap = document.getElementById("world-map");
const placemarkContainer = document.getElementById("placemarks-list");
const regionSelector = document.getElementById("region-selector");
const regionSelect = document.getElementById("region-select");
const selectedRegion = document.querySelector(".selected-region");
const regionName = document.getElementById("region-name");
const resetRegionBtn = document.getElementById("reset-region");
const loading = document.getElementById("loading");


// 現在のアクティブボタンを追跡
let selectedButton = null;

// 外部データの格納
let mapLinks = {};
let regionSettings = {};

// ==========================
// ユーティリティ関数
// ==========================

// iframe HTML生成
function getIframeHTML(url, title = "地図") {
  return `<iframe src="${url}" 
                  width="100%" 
                  height="100%" 
                  style="border:0;" 
                  allowfullscreen 
                  loading="lazy"
                  title="${title}">
          </iframe>`;
}

// ローディング表示制御
function showLoading(show = true) {
  loading.classList.toggle('show', show);
  loading.setAttribute('aria-hidden', !show);
}

// エラーハンドリング
function handleError(error, context = '') {
  console.error(`エラー ${context}:`, error);
  showLoading(false);
}

// 画像URL抽出（KMLのCDATA内から）
function extractImageFromDescription(description) {
  if (!description) return null;
  
  const imgMatch = description.match(/<img[^>]+src=["']([^"']+)["'][^>]*>/i);
  return imgMatch ? imgMatch[1] : null;
}

// 座標文字列をパース
function parseCoordinates(coordString) {
  if (!coordString) return null;
  
  const coords = coordString.trim().split(',');
  if (coords.length >= 2) {
    return {
      lng: parseFloat(coords[0]),
      lat: parseFloat(coords[1])
    };
  }
  return null;
}

// Google Maps URL生成（座標とズーム指定）
function generateMapsUrl(lat, lng, zoom = 15) {
  return `https://www.google.com/maps/@${lat},${lng},${zoom}z`;
}

// ==========================
// 外部データの読み込み
// ==========================

// 地域設定データの読み込み
async function loadRegionSettings() {
  try {
    const response = await fetch("region-settings.json");
    if (!response.ok) throw new Error('地域設定の読み込みに失敗しました');
    regionSettings = await response.json();
  } catch (error) {
    handleError(error, '地域設定読み込み');
    // フォールバック用のデフォルト設定
    regionSettings = {
      asia: { center: "35.0,105.0", zoom: "4z", name: "アジア" },
      europe: { center: "54.0,15.0", zoom: "4z", name: "ヨーロッパ" },
      africa: { center: "0.0,20.0", zoom: "3z", name: "アフリカ" },
      oceania: { center: "-25.0,140.0", zoom: "4z", name: "オセアニア" },
      "north-america": { center: "45.0,-100.0", zoom: "3z", name: "北米" }
    };
  }
}

// 地図リンクデータの読み込み
async function loadMapLinks() {
  try {
    // サンプルデータ（実際のプロジェクトでは外部ファイルから読み込み）
    mapLinks = {
      "35": "https://www.google.com/maps/d/embed?mid=sample-yamaguchi",
      "13": "https://www.google.com/maps/d/embed?mid=sample-tokyo"
      // 他の都道府県も追加可能
    };
  } catch (error) {
    handleError(error, '地図リンク読み込み');
  }
}

// ==========================
// プレースマークカード生成
// ==========================

function createPlacemarkCard(placemark) {
  const name = placemark.getElementsByTagName("name")[0]?.textContent || "名称不明";
  const descNode = placemark.getElementsByTagName("description")[0];
  const description = descNode ? descNode.textContent || descNode.innerHTML : "";
  const coordsNode = placemark.getElementsByTagName("coordinates")[0];
  const coordsString = coordsNode ? coordsNode.textContent.trim() : "";
  
  // 画像URLを抽出
  const imageUrl = extractImageFromDescription(description);
  
  // 座標をパース
  const coordinates = parseCoordinates(coordsString);
  
  // テキストから画像タグを除去してクリーンなテキストを取得
  const cleanDescription = description
    .replace(/<img[^>]*>/gi, '')
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  const card = document.createElement("div");
  card.className = "placemark-card";
  card.setAttribute('role', 'article');
  card.setAttribute('tabindex', '0');

  card.innerHTML = `
    <div class="placemark-header">
      ${imageUrl ? 
        `<img src="${imageUrl}" 
             alt="${name}" 
             class="placemark-image"
             loading="lazy"
             onerror="this.style.display='none';">` : 
        `<div class="placemark-overlay"></div>`
      }
      <div class="placemark-overlay">
        <h3 class="placemark-title">${name}</h3>
      </div>
    </div>
    <div class="placemark-content">
      ${cleanDescription ? 
        `<p class="placemark-description">${cleanDescription}</p>` : 
        ''
      }
      ${coordinates ? 
        `<div class="coordinates">
          <i class="fas fa-map-marker-alt"></i>
          <span>${coordinates.lat.toFixed(6)}, ${coordinates.lng.toFixed(6)}</span>
        </div>` : 
        ''
      }
      <div class="placemark-actions">
        ${coordinates ? 
          `<button class="placemark-btn primary zoom-btn" 
                   data-lat="${coordinates.lat}" 
                   data-lng="${coordinates.lng}"
                   data-name="${name}">
            <i class="fas fa-search-plus"></i>
            地図で確認
          </button>` : 
          ''
        }
        ${coordinates ? 
          `<a href="${generateMapsUrl(coordinates.lat, coordinates.lng)}" 
             target="_blank" 
             rel="noopener noreferrer"
             class="placemark-btn secondary">
            <i class="fas fa-external-link-alt"></i>
            Google Mapsで開く
          </a>` : 
          ''
        }
      </div>
    </div>
  `;

  return card;
}

// ==========================
// KMLファイル読み込みと表示
// ==========================

async function loadAndDisplayPlacemarks(kmlPath) {
  try {
    showLoading(true);
    
    const response = await fetch(kmlPath);
    if (!response.ok) throw new Error("KMLファイルの読み込みに失敗しました");
    
    const kmlText = await response.text();
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(kmlText, "text/xml");
    
    const documentTag = xmlDoc.getElementsByTagName("Document")[0];
    if (!documentTag) {
      throw new Error("有効なKMLファイルではありません");
    }

    const placemarks = documentTag.getElementsByTagName("Placemark");
    
    // プレースマークコンテナをクリアして準備
    placemarkContainer.innerHTML = '<div class="placemarks-grid"></div>';
    const grid = placemarkContainer.querySelector('.placemarks-grid');
    
    // プレースマークカードを生成
    for (const placemark of placemarks) {
      const card = createPlacemarkCard(placemark);
      grid.appendChild(card);
    }
    
    // プレースマークセクションを表示
    placemarkContainer.classList.add('show');
    
    // ズームボタンのイベントリスナーを設定
    setupZoomButtons();
    
    showLoading(false);
    
  } catch (error) {
    handleError(error, 'KML読み込み');
    placemarkContainer.innerHTML = `
      <div style="text-align: center; padding: 2rem; color: var(--text-secondary);">
        <i class="fas fa-exclamation-triangle" style="font-size: 2rem; margin-bottom: 1rem;"></i>
        <p>プレースマークの読み込みに失敗しました。</p>
      </div>
    `;
    placemarkContainer.classList.add('show');
  }
}

// ==========================
// 地図ズーム機能
// ==========================

function setupZoomButtons() {
  const zoomButtons = document.querySelectorAll('.zoom-btn');
  
  zoomButtons.forEach(button => {
    button.addEventListener('click', function() {
      const lat = this.getAttribute('data-lat');
      const lng = this.getAttribute('data-lng');
      const name = this.getAttribute('data-name');
      
      if (lat && lng) {
        zoomToCoordinate(lat, lng, name);
      }
    });
  });
}

function zoomToCoordinate(lat, lng, name) {
  // 現在アクティブな地図コンテナを特定
  const activeMapContainer = document.querySelector('.map-container.active');
  if (!activeMapContainer) return;
  
  // 現在の iframe を取得
  const currentIframe = activeMapContainer.querySelector('iframe');
  if (!currentIframe) return;
  
  // 現在の地図URLを取得
  let currentUrl = currentIframe.src;
  let baseUrl = '';
  
  // アクティブな地図タイプに応じてベースURLを決定
  if (activeMapContainer.id === 'campus-map') {
    baseUrl = campusMapUrl;
  } else if (activeMapContainer.id === 'world-map') {
    baseUrl = worldMapUrl;
  } else {
    // その他の地図の場合は現在のURLをベースとして使用
    baseUrl = currentUrl.split('&ll=')[0].split('&z=')[0];
  }
  
  // 座標とズームパラメータを追加して新しいURLを生成
  const zoomedMapUrl = `${baseUrl}&ll=${lat},${lng}&z=17`;
  
  // スムーズなズーム効果
  showZoomAnimation(activeMapContainer, () => {
    // 既存のiframeのsrcを更新（地図の再読み込みなし！）
    currentIframe.src = zoomedMapUrl;
    currentIframe.title = `${name} - 詳細地図`;
    
    // ズームリセットボタンを追加
    addZoomResetButton(activeMapContainer, name, baseUrl);
    
    // ユーザーにフィードバックを提供
    showZoomNotification(`📍 ${name} にズームしました`);
  });
}

function showZoomAnimation(container, callback) {
  // より自然なズームインエフェクト
  container.style.transition = 'all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
  container.style.transform = 'scale(1.02)';
  container.style.filter = 'blur(1px)';
  container.style.opacity = '0.8';
  
  // ズーム感を演出する擬似的なオーバーレイ
  const overlay = document.createElement('div');
  overlay.className = 'zoom-overlay';
  overlay.innerHTML = '<i class="fas fa-search-plus"></i><p>詳細地図を読み込み中...</p>';
  container.appendChild(overlay);
  
  setTimeout(() => {
    callback();
    
    // 新しい地図が読み込まれた後の復帰アニメーション
    setTimeout(() => {
      container.style.transform = 'scale(1)';
      container.style.filter = 'blur(0)';
      container.style.opacity = '1';
      
      // オーバーレイを除去
      setTimeout(() => {
        if (overlay.parentNode) {
          overlay.remove();
        }
        container.style.transition = '';
      }, 500);
    }, 200);
  }, 300);
}

function addZoomResetButton(container, locationName, originalUrl) {
  // 既存のリセットボタンを削除
  const existingResetBtn = container.querySelector('.zoom-reset-btn');
  if (existingResetBtn) {
    existingResetBtn.remove();
  }
  
  // リセットボタンを作成
  const resetButton = document.createElement('button');
  resetButton.className = 'zoom-reset-btn';
  resetButton.innerHTML = `
    <i class="fas fa-arrow-left"></i>
    <span>元の地図に戻る</span>
  `;
  resetButton.setAttribute('aria-label', `${locationName}のズームを解除して元の地図に戻る`);
  
  // 元のURLを data属性として保存
  resetButton.dataset.originalUrl = originalUrl;
  
  // リセットボタンのクリックイベント
  resetButton.addEventListener('click', () => {
    resetMapView(container, originalUrl);
  });
  
  // ボタンをコンテナに追加
  container.appendChild(resetButton);
}

function resetMapView(container, originalUrl) {
  const currentIframe = container.querySelector('iframe');
  if (!currentIframe) return;
  
  showZoomAnimation(container, () => {
    // 既存のiframeのsrcを元のURLに戻す（スムーズ！）
    if (originalUrl) {
      currentIframe.src = originalUrl;
    } else {
      // フォールバック: コンテナIDに基づいて元のURLを決定
      const containerId = container.id;
      switch (containerId) {
        case 'campus-map':
          currentIframe.src = campusMapUrl;
          currentIframe.title = "キャンパス周辺地図";
          break;
        case 'world-map':
          const currentRegionValue = regionSelect.value;
          if (currentRegionValue && regionSettings[currentRegionValue]) {
            const setting = regionSettings[currentRegionValue];
            currentIframe.src = `${worldMapUrl}&ll=${setting.center}&z=${setting.zoom}`;
            currentIframe.title = `${setting.name}地図`;
          } else {
            currentIframe.src = worldMapUrl;
            currentIframe.title = "世界地図";
          }
          break;
        default:
          // その他の地図の場合
          currentIframe.src = currentIframe.src.split('&ll=')[0].split('&z=')[0];
          break;
      }
    }
    
    // リセットボタンを削除
    const resetBtn = container.querySelector('.zoom-reset-btn');
    if (resetBtn) {
      resetBtn.remove();
    }
    
    showZoomNotification('🗺️ 元の地図に戻りました');
  });
}

function showZoomNotification(message) {
  // 通知要素を作成
  const notification = document.createElement('div');
  notification.className = 'zoom-notification';
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  // アニメーション表示
  setTimeout(() => notification.classList.add('show'), 100);
  
  // 3秒後に自動削除
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// ==========================
// 表示切り替え管理
// ==========================

function switchDisplay(target) {
  // 全ての地図コンテナを非表示
  document.querySelectorAll('.map-container').forEach(container => {
    container.classList.remove('active');
  });
  
  // プレースマークを非表示
  placemarkContainer.classList.remove('show');
  placemarkContainer.innerHTML = '';
  
  // 地域選択を非表示
  regionSelector.classList.remove('show');
  resetRegionSelection();

  // 対象の地図を表示
  const targetMap = document.getElementById(`${target}-map`);
  if (targetMap) {
    targetMap.classList.add('active');
  }

  switch (target) {
    case "campus":
      campusMap.innerHTML = getIframeHTML(campusMapUrl, "キャンパス周辺地図");
      loadAndDisplayPlacemarks("placemark/campus.kml");
      break;
      
    case "japan":
      loadJapanMap();
      break;
      
    case "world":
      worldMap.innerHTML = getIframeHTML(worldMapUrl, "世界地図");
      regionSelector.classList.add('show');
      break;
      
    case "pref":
      // 都道府県地図は別途処理
      break;
  }
}

// ==========================
// 日本地図の読み込み
// ==========================

async function loadJapanMap() {
  try {
    showLoading(true);
    
    // 簡易的な日本地図SVGを生成（実際のプロジェクトでは外部ファイルから読み込み）
    const japanSvg = `
      <svg viewBox="0 0 1000 1000" xmlns="http://www.w3.org/2000/svg" class="geolonia-svg-map">
        <title>日本地図</title>
        <g class="prefectures">
          <g class="prefecture" data-code="35" fill="#EEEEEE" stroke="#000" stroke-width="1">
            <title>山口県</title>
            <rect x="100" y="400" width="80" height="40" rx="5"/>
            <text x="140" y="425" text-anchor="middle" font-size="12" fill="#333">山口</text>
          </g>
          <g class="prefecture" data-code="13" fill="#EEEEEE" stroke="#000" stroke-width="1">
            <title>東京都</title>
            <rect x="400" y="300" width="60" height="30" rx="5"/>
            <text x="430" y="320" text-anchor="middle" font-size="10" fill="#333">東京</text>
          </g>
        </g>
      </svg>
    `;
    
    japanMap.innerHTML = japanSvg;
    
    // 都道府県クリックイベントを設定
    setupPrefectureClicks();
    
    showLoading(false);
    
  } catch (error) {
    handleError(error, '日本地図読み込み');
    japanMap.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: center; height: 100%; background: var(--surface-secondary);">
        <p style="color: var(--text-secondary);">日本地図の読み込みに失敗しました</p>
      </div>
    `;
  }
}

function setupPrefectureClicks() {
  const prefectures = document.querySelectorAll(".prefecture");
  
  prefectures.forEach(pref => {
    pref.addEventListener("mouseover", () => {
      pref.setAttribute('fill', '#fbbf24');
      pref.style.cursor = 'pointer';
    });
    
    pref.addEventListener("mouseleave", () => {
      pref.setAttribute('fill', '#EEEEEE');
    });
    
    pref.addEventListener("click", () => {
      const code = pref.dataset.code;
      if (code) {
        showPrefectureMap(code);
      }
    });
  });
}

// ==========================
// 都道府県地図表示
// ==========================

function showPrefectureMap(code) {
  const url = mapLinks[code];
  
  switchDisplay("pref");
  
  if (!url) {
    prefMap.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: center; height: 100%; background: var(--surface-secondary); flex-direction: column; gap: 1rem;">
        <i class="fas fa-map" style="font-size: 3rem; color: var(--text-secondary);"></i>
        <p style="color: var(--text-secondary);">この地域の地図はまだ準備中です</p>
      </div>
    `;
    return;
  }
  
  prefMap.innerHTML = getIframeHTML(url, "都道府県地図");
  
  // 都道府県別のKMLファイルがあれば読み込み
  const kmlPath = `placemark/${code}.kml`;
  loadAndDisplayPlacemarks(kmlPath);
}

// ==========================
// 地域選択機能
// ==========================

function resetRegionSelection() {
  regionSelect.style.display = 'block';
  selectedRegion.classList.remove('show');
  regionSelect.value = '';
}

regionSelect.addEventListener('change', function() {
  const selectedValue = this.value;
  
  if (selectedValue && regionSettings[selectedValue]) {
    const setting = regionSettings[selectedValue];
    const name = setting.name || selectedValue;
    
    // 地図の範囲を変更
    const newUrl = `${worldMapUrl}&ll=${setting.center}&z=${setting.zoom}`;
    worldMap.innerHTML = getIframeHTML(newUrl, `${name}地図`);
    
    // 選択された地域名を表示
    regionSelect.style.display = 'none';
    selectedRegion.classList.add('show');
    regionName.textContent = name;
    
    // 履歴を更新
    updateHistory("world", { region: selectedValue });
  }
});

resetRegionBtn.addEventListener('click', function() {
  resetRegionSelection();
  worldMap.innerHTML = getIframeHTML(worldMapUrl, "世界地図");
  updateHistory("world");
});

// ==========================
// ボタンイベント処理
// ==========================

function setupMapButtons() {
  const buttons = document.querySelectorAll('.map-btn');
  
  buttons.forEach(button => {
    button.addEventListener('click', function() {
      // アクティブボタンの更新
      buttons.forEach(btn => btn.classList.remove('active'));
      this.classList.add('active');
      selectedButton = this;
      
      // 対応する地図表示
      const buttonId = this.id;
      const target = buttonId.replace('-button', '');
      switchDisplay(target);
      
      // 履歴更新
      updateHistory(target);
    });
  });
}

// ==========================
// 履歴管理
// ==========================

function updateHistory(view, params = {}) {
  const url = new URLSearchParams();
  url.set('view', view);
  
  Object.entries(params).forEach(([key, value]) => {
    url.set(key, value);
  });
  
  const newUrl = `?${url.toString()}`;
  history.pushState({ view, ...params }, '', newUrl);
}

function handlePopState(event) {
  const state = event.state;
  if (!state) return;
  
  const buttons = document.querySelectorAll('.map-btn');
  buttons.forEach(btn => btn.classList.remove('active'));
  
  switch (state.view) {
    case 'campus':
      document.getElementById('campus-button').classList.add('active');
      switchDisplay('campus');
      break;
    case 'japan':
      document.getElementById('jp-button').classList.add('active');
      switchDisplay('japan');
      break;
    case 'world':
      document.getElementById('world-button').classList.add('active');
      switchDisplay('world');
      if (state.region) {
        regionSelect.value = state.region;
        regionSelect.dispatchEvent(new Event('change'));
      }
      break;
    case 'pref':
      if (state.code) {
        showPrefectureMap(state.code);
      }
      break;
  }
}



// ==========================
// URL パラメータ処理
// ==========================

function handleInitialLoad() {
  const urlParams = new URLSearchParams(window.location.search);
  const view = urlParams.get('view') || 'campus';
  const region = urlParams.get('region');
  
  // 適切なボタンをアクティブに
  const buttons = document.querySelectorAll('.map-btn');
  buttons.forEach(btn => btn.classList.remove('active'));
  
  const targetButton = document.getElementById(`${view}-button`);
  if (targetButton) {
    targetButton.classList.add('active');
    selectedButton = targetButton;
  }
  
  // 対応する表示に切り替え
  switchDisplay(view);
  
  // 地域指定がある場合
  if (view === 'world' && region) {
    setTimeout(() => {
      regionSelect.value = region;
      regionSelect.dispatchEvent(new Event('change'));
    }, 500);
  }
}

// ==========================
// 初期化処理
// ==========================

async function initialize() {
  try {
    showLoading(true);
    
    // 外部データの読み込み
    await Promise.all([
      loadRegionSettings(),
      loadMapLinks()
    ]);
    
    // イベントリスナーの設定
    setupMapButtons();
    
    // 履歴管理
    window.addEventListener('popstate', handlePopState);
    
    // 初期表示の処理
    handleInitialLoad();
    
    showLoading(false);
    
    console.log('FGSSmap初期化完了');
    
  } catch (error) {
    handleError(error, '初期化');
  }
}

// DOMContentLoaded イベントで初期化
document.addEventListener("DOMContentLoaded", initialize);
