// ==========================
// グローバル定義
// ==========================
const campusMapUrl = "https://www.google.com/maps/d/u/1/embed?mid=1nTgYFWkXf1UQHwGZCwdXuRv-aopgUkY&ehbc=2E312F";
const worldMapUrl = "https://www.google.com/maps/d/embed?mid=1qtamWdIhe4du3uLXQxcD9IrGgNgaVoc&ehbc=2E312F";

const campusMap = document.getElementById("campus-map");
const japanMap = document.getElementById("japan-map");
const prefMap = document.getElementById("prefecture-map");
const worldMap = document.getElementById("world-map");
const placemarkContainer = document.getElementById("placemarks-list");
const backButtonContainer = document.getElementById("back-button-container");

// 地域設定とマップリンクを外部ファイルから読み込み
let regionSettings = {};
let mapLinks = {};

// 地域名の日本語対応
const regionNames = {
  asia: "アジア",
  europe: "ヨーロッパ", 
  africa: "アフリカ",
  oceania: "オセアニア",
  "north-america": "北米"
};

// 都道府県名の対応表
const prefectureNames = {
  "1": "北海道", "2": "青森", "3": "岩手", "4": "宮城", "5": "秋田", "6": "山形", "7": "福島",
  "8": "茨城", "9": "栃木", "10": "群馬", "11": "埼玉", "12": "千葉", "13": "東京", "14": "神奈川",
  "15": "新潟", "16": "富山", "17": "石川", "18": "福井", "19": "山梨", "20": "長野", "21": "岐阜",
  "22": "静岡", "23": "愛知", "24": "三重", "25": "滋賀", "26": "京都", "27": "大阪", "28": "兵庫",
  "29": "奈良", "30": "和歌山", "31": "鳥取", "32": "島根", "33": "岡山", "34": "広島", "35": "山口",
  "36": "徳島", "37": "香川", "38": "愛媛", "39": "高知", "40": "福岡", "41": "佐賀", "42": "長崎",
  "43": "熊本", "44": "大分", "45": "宮崎", "46": "鹿児島", "47": "沖縄"
};

// ==========================
// 外部ファイル読み込み
// ==========================
fetch("region-settings.json")
  .then(res => res.json())
  .then(data => { regionSettings = data; })
  .catch(err => console.error("地域設定読み込み失敗", err));

fetch("map-links.json")
  .then(res => res.json())
  .then(data => { mapLinks = data; })
  .catch(err => console.error("地図リンク読み込み失敗", err));

// ==========================
// iframe生成関数
// ==========================
function getIframeHTML(url) {
  return `<iframe src="${url}" width="100%" height="480" style="border:0;" allowfullscreen loading="lazy"></iframe>`;
}

// ==========================
// 初期設定
// ==========================
document.addEventListener("DOMContentLoaded", () => {
  // 最初の表示
  campusMap.style.display = "block";
  japanMap.style.display = "none";
  prefMap.style.display = "none";
  worldMap.style.display = "none";
  backButtonContainer.style.display = "none";

  campusMap.innerHTML = getIframeHTML(campusMapUrl);
  loadAndDisplayPlacemarks("placemark/campus.kml");

  // ボタンのスタイル初期化
  let selected = document.getElementById("campus-button");
  selected.style.transformOrigin = "bottom center";
  selected.style.transform = "scaleY(1.3)";

  document.querySelectorAll(".map-buttons button").forEach(btn => {
    btn.addEventListener("click", function () {
      if (selected !== this) {
        selected.style.transform = "scaleY(1)";
        this.style.transformOrigin = "bottom center";
        this.style.transform = "scaleY(1.3)";
        selected = this;
      }
    });
  });

  // 初期表示切替
  switchDisplay("campus");
});

// ==========================
// 表示切替関数
// ==========================
function switchDisplay(target) {
  campusMap.style.display = target === "campus" ? "block" : "none";
  japanMap.style.display = target === "japan" ? "block" : "none";
  prefMap.style.display = target === "pref" ? "block" : "none";
  worldMap.style.display = target === "world" ? "block" : "none";
  
  // 戻るボタンの表示制御
  backButtonContainer.style.display = target === "pref" ? "block" : "none";
  
  // 地域選択の表示制御
  toggleRegionSelector(target === "world");

  // placemark 表示管理
  if (target === "campus") {
    campusMap.innerHTML = getIframeHTML(campusMapUrl);
    loadAndDisplayPlacemarks("placemark/campus.kml");
  } else if (target === "world") {
    worldMap.innerHTML = getIframeHTML(worldMapUrl);
    placemarkContainer.style.display = "none";
    placemarkContainer.innerHTML = "";
  } else if (target === "pref") {
    // 都道府県地図は個別の関数で処理
    placemarkContainer.style.display = "block";
  } else {
    placemarkContainer.style.display = "none";
    placemarkContainer.innerHTML = "";
  }

  // 日本地図の読み込み
  if (target === "japan") {
    fetch("japan-map.svg")
      .then(response => response.text())
      .then(svgData => {
        japanMap.innerHTML = svgData;
        
        // 都道府県クリックイベントを追加
        document.querySelectorAll(".prefecture").forEach(pref => {
          pref.style.fill = "#EEEEEE";
          pref.style.stroke = "#000000";
          pref.style.strokeWidth = "1.0";
          pref.style.cursor = "pointer";
          
          pref.addEventListener("mouseover", () => {
            pref.style.fill = "#ffcccc";
          });
          
          pref.addEventListener("mouseleave", () => {
            pref.style.fill = "#EEEEEE";
          });
          
          pref.addEventListener("click", () => {
            const prefCode = pref.dataset.code;
            if (prefCode) {
              showPrefectureMap(prefCode);
              switchDisplay("pref");
              history.pushState({ view: "pref", code: prefCode }, "", `?view=pref&code=${prefCode}`);
            }
          });
        });
      })
      .catch(err => {
        japanMap.innerHTML = `<p>日本地図の読み込みに失敗しました</p>`;
        console.error(err);
      });
    placemarkContainer.innerHTML = "";
  }
}

// ==========================
// 地域選択の表示/非表示制御
// ==========================
function toggleRegionSelector(show) {
  const regionSelector = document.querySelector('.region-selector');
  if (show) {
    regionSelector.style.display = 'flex';
  } else {
    regionSelector.style.display = 'none';
    // リセット
    document.getElementById('region-select').style.display = 'block';
    document.getElementById('selected-region').style.display = 'none';
    document.getElementById('region-select').value = '';
  }
}

// ==========================
// ボタンクリックイベント
// ==========================
document.getElementById("campus-button").addEventListener("click", () => {
  switchDisplay("campus");
  campusMap.innerHTML = getIframeHTML(campusMapUrl);
  history.pushState({ view: "campus" }, "", "?view=campus");
});

document.getElementById("jp-button").addEventListener("click", () => {
  switchDisplay("japan");
  history.pushState({ view: "japan" }, "", "?view=japan");
});

document.getElementById("world-button").addEventListener("click", () => {
  switchDisplay("world");
  history.pushState({ view: "world" }, "", "?view=world");
});

// 戻るボタンのイベント
document.getElementById("back-to-japan").addEventListener("click", () => {
  switchDisplay("japan");
  history.pushState({ view: "japan" }, "", "?view=japan");
});

// ==========================
// 地域選択イベント
// ==========================
document.getElementById('region-select').addEventListener('change', function() {
  const selectedValue = this.value;
  if (selectedValue && regionSettings[selectedValue]) {
    const setting = regionSettings[selectedValue];
    const regionName = regionNames[selectedValue];
    
    // 地図の範囲変更
    const newUrl = `${worldMapUrl}&ll=${setting.center}&z=${setting.zoom}`;
    worldMap.innerHTML = getIframeHTML(newUrl);
    
    // 選択された地域名を表示
    document.getElementById('region-select').style.display = 'none';
    document.getElementById('selected-region').style.display = 'block';
    document.getElementById('selected-region').textContent = regionName;
  }
});

// 選択された地域名をクリックしたらドロップダウンに戻る
document.getElementById('selected-region').addEventListener('click', function() {
  document.getElementById('region-select').style.display = 'block';
  document.getElementById('selected-region').style.display = 'none';
  document.getElementById('region-select').value = '';
  // 世界地図を初期状態にリセット
  worldMap.innerHTML = getIframeHTML(worldMapUrl);
});

// ==========================
// 履歴の戻る・進む対応
// ==========================
window.addEventListener("popstate", (event) => {
  const state = event.state;
  if (!state) return;

  if (state.view === "campus") {
    document.getElementById("campus-button").click();
  } else if (state.view === "japan") {
    document.getElementById("jp-button").click();
  } else if (state.view === "world") {
    document.getElementById("world-button").click();
  } else if (state.view === "pref" && state.code) {
    showPrefectureMap(state.code);
    switchDisplay("pref");
  }
});

// ==========================
// 都道府県表示関数
// ==========================
function showPrefectureMap(code) {
  const url = mapLinks[code];
  
  if (!url) {
    prefMap.innerHTML = `<p>「${prefectureNames[code]}」の地図はまだ準備中です。</p>`;
    placemarkContainer.innerHTML = `<p>「${prefectureNames[code]}」のプレースマークデータを準備中です。</p>`;
    return;
  }

  prefMap.innerHTML = getIframeHTML(url);
  
  // プレースマーク読み込み
  loadAndDisplayPrefPlacemarks(code);
}

// ==========================
// Placemark 読み込み関数
// ==========================
function loadAndDisplayPlacemarks(kmlPath) {
  placemarkContainer.style.display = "flex";

  fetch(kmlPath)
    .then(response => {
      if (!response.ok) throw new Error("KMLの読み込みに失敗しました");
      return response.text();
    })
    .then(str => new window.DOMParser().parseFromString(str, "text/xml"))
    .then(data => {
      placemarkContainer.innerHTML = "";

      const documentTag = data.getElementsByTagName("Document")[0];
      if (!documentTag) {
        console.warn("Documentタグが見つかりません");
        placemarkContainer.innerHTML = "<p>プレースマークデータが見つかりません</p>";
        return;
      }

      const placemarks = documentTag.getElementsByTagName("Placemark");
      
      if (placemarks.length === 0) {
        placemarkContainer.innerHTML = "<p>プレースマークが登録されていません</p>";
        return;
      }

      for (const placemark of placemarks) {
        const name = placemark.getElementsByTagName("name")[0]?.textContent || "名称不明";
        const descNode = placemark.getElementsByTagName("description")[0];
        const descHTML = descNode ? descNode.innerHTML : "";

        const div = document.createElement("div");
        div.className = "placemark-box";
        div.innerHTML = `
          <h3>${name}</h3>
          <div class="placemark-desc">${descHTML}</div>
        `;
        placemarkContainer.appendChild(div);
      }
    })
    .catch(err => {
      console.error("KML読み込みエラー:", err);
      placemarkContainer.innerHTML = `<p>プレースマークデータの読み込みに失敗しました: ${err.message}</p>`;
    });
}

// ==========================
// 都道府県別プレースマーク読み込み関数
// ==========================
function loadAndDisplayPrefPlacemarks(code) {
  const placemarkContainer = document.getElementById("placemarks-list");
  placemarkContainer.style.display = "flex";
  
  const prefName = prefectureNames[code] || `都道府県コード${code}`;
  const kmlPath = `placemark/${code}.kml`;
  
  fetch(kmlPath)
    .then(response => {
      if (!response.ok) {
        throw new Error(`「${prefName}」のKMLファイルが見つかりません`);
      }
      return response.text();
    })
    .then(str => new window.DOMParser().parseFromString(str, "text/xml"))
    .then(data => {
      placemarkContainer.innerHTML = "";
      
      const documentTag = data.getElementsByTagName("Document")[0];
      if (!documentTag) {
        console.warn("Documentタグが見つかりません");
        placemarkContainer.innerHTML = `<p>「${prefName}」のプレースマークデータが正しく読み込めません</p>`;
        return;
      }
      
      const placemarks = documentTag.getElementsByTagName("Placemark");

      if (placemarks.length === 0) {
        placemarkContainer.innerHTML = `<p>「${prefName}」のプレースマークはまだ登録されていません</p>`;
        return;
      }

      // プレースマークを表示
      for (const placemark of placemarks) {
        const name = placemark.getElementsByTagName("name")[0]?.textContent || "名称不明";
        const descNode = placemark.getElementsByTagName("description")[0];
        const desc = descNode ? descNode.innerHTML : "説明なし";
        const coords = placemark.getElementsByTagName("coordinates")[0]?.textContent.trim() || "";
        
        const div = document.createElement("div");
        div.className = "placemark-box";
        div.innerHTML = `
          <h3>${name}</h3>
          <div class="placemark-desc">${desc}</div>
        `;
        placemarkContainer.appendChild(div);
      }
    })
    .catch(err => {
      console.error("KML読み込みエラー:", err);
      placemarkContainer.innerHTML = `<p>「${prefName}」のプレースマークデータの読み込みに失敗しました</p>`;
    });
}

// ==========================
// URLパラメータによる初期表示制御
// ==========================
document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const view = urlParams.get('view');
  const code = urlParams.get('code');
  
  if (view === 'japan') {
    document.getElementById("jp-button").click();
  } else if (view === 'world') {
    document.getElementById("world-button").click();
  } else if (view === 'pref' && code) {
    showPrefectureMap(code);
    switchDisplay("pref");
  } else {
    // デフォルトはキャンパス表示
    document.getElementById("campus-button").click();
  }
});
