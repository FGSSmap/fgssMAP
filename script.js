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

// 地域設定を外部ファイルから読み込み
let regionSettings = {};
fetch("region-settings.json")
  .then(res => res.json())
  .then(data => { regionSettings = data; })
  .catch(err => console.error("地域設定読み込み失敗", err));

// ==========================
// iframe生成関数
// ==========================
function getIframeHTML(url) {
  return `<iframe src="${url}" width="100%" height="480" style="border:0;" allowfullscreen loading="lazy"></iframe>`;
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
// 初期設定
// ==========================
document.addEventListener("DOMContentLoaded", () => {
  // 最初の表示
  campusMap.style.display = "block";
  japanMap.style.display = "none";
  prefMap.style.display = "none";
  worldMap.style.display = "none";

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

        document.querySelectorAll(".geolonia-svg-map .prefecture").forEach(pref => {
          pref.addEventListener("mouseover", () => {
            pref.style.fill = "#ffaaaa";
            pref.style.cursor = "pointer";
          });
          pref.addEventListener("mouseleave", () => pref.style.fill = "");
          pref.addEventListener("click", () => {
            showPrefectureMap(pref.dataset.code);
            switchDisplay("pref");
            history.pushState({ view: "pref" }, "", "?view=pref");
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

// ==========================
// 地域選択イベント
// ==========================
document.getElementById('region-select').addEventListener('change', function() {
  const selectedValue = this.value;
  if (selectedValue && regionSettings[selectedValue]) {
    const setting = regionSettings[selectedValue];
    const regionName = setting.name;
    
    // 地図の範囲変更（新しい世界地図URL）
    const newUrl = `https://www.google.com/maps/d/embed?mid=1qtamWdIhe4du3uLXQxcD9IrGgNgaVoc&ehbc=2E312F&ll=${setting.center}&z=${setting.zoom}`;
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
  // 世界地図をデフォルトに戻す
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
  }
});

// ==========================
// 日本地図リンクの取得
// ==========================
let mapLinks = {};
fetch("https://fgssmap.github.io/fgssMAP/map-links.json")
  .then(res => res.json())
  .then(data => { mapLinks = data; })
  .catch(err => console.error("地図リンク読み込み失敗", err));

// ==========================
// 都道府県表示関数
// ==========================
function showPrefectureMap(code) {
  const url = mapLinks[code];
  switchDisplay("pref");

  if (!url) {
    prefMap.innerHTML = "<p>この都道府県の地図はまだ準備中です。</p>";
    return;
  }

  prefMap.innerHTML = getIframeHTML(url);
  
  const placemarkContainer = document.getElementById("placemarks-list");
  placemarkContainer.style.display = "block";

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
        return;
      }

      const placemarks = documentTag.getElementsByTagName("Placemark");

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
    });
}

function loadAndDisplayPrefPlacemarks(code){
  const placemarkContainer = document.getElementById("placemarks-list");
  placemarkContainer.style.display = "flex";

  const kmlPathP = `placemark/${code}.kml`;
  fetch(kmlPathP)
  .then(response => {
    if (!response.ok)throw new Error("KMLの読み込みに失敗しました");
    return response.text();
  })
  .then(str => new window.DOMParser().parseFromString(str, "text/xml"))
  .then(data => {
    placemarkContainer.innerHTML = "";
    
    const documentTag = data.getElementsByTagName("Document")[0];
    if(!documentTag){
      console.warn("Documentタグが見つかりません");
      return;
    }
    
    const placemarks = documentTag.getElementsByTagName("Placemark");

    for (const placemark of placemarks){
        const name = placemark.getElementsByTagName("name")[0]?.textContent || "名称不明";
        const descNode = placemark.getElementsByTagName("description")[0];
        const desc = descNode ? descNode.innerHTML : "";
        const coords = placemark.getElementsByTagName("coordinates")[0]?.textContent.trim() || "";
        const [lng, lat] = coords.split(",");
      
        const div = document.createElement("div");
        div.className = "placemark-box";
        div.innerHTML = `
          <h3>${name}</h3>
          <p><small>${desc}</small></p>
        `;
        placemarkContainer.appendChild(div);
    }
  })
  .catch(err => {
    console.error("KML読み込みエラー:", err);
  });
}
