// ==========================
// グローバル定義
// ==========================
const campusMapUrl = "https://www.google.com/maps/d/u/1/embed?mid=1nTgYFWkXf1UQHwGZCwdXuRv-aopgUkY&ehbc=2E312F";

const campusMap = document.getElementById("campus-map");
const japanMap = document.getElementById("japan-map");
const prefMap = document.getElementById("prefecture-map");
const placemarkContainer = document.getElementById("placemarks-list");

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

  // placemark 表示管理
  if (target === "campus") {
    campusMap.innerHTML = getIframeHTML(campusMapUrl);
    loadAndDisplayPlacemarks("placemark/campus.kml");
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
