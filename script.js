// グローバルに定義
const campusMapUrl = "https://www.google.com/maps/d/u/1/embed?mid=1nTgYFWkXf1UQHwGZCwdXuRv-aopgUkY&ehbc=2E312F";

// iframeを生成する関数
function getIframeHTML(url) {
  return `<iframe src="${url}" width="100%" height="480" frameborder="0" style="border:0;" allowfullscreen></iframe>`;
}

// 初期設定
document.addEventListener("DOMContentLoaded", () => {
  const campusMap = document.getElementById("campus-map");
  campusMap.innerHTML = getIframeHTML(campusMapUrl);

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

  switchDisplay("campus");
});

// 表示切り替え関数
function switchDisplay(target) {
  const campusMap = document.getElementById("campus-map");
  const japanMap = document.getElementById("japan-map");

  // 表示切り替え
  campusMap.style.display = target === "campus" ? "block" : "none";
  japanMap.style.display = target === "japan" ? "block" : "none";

  // 中身の切り替え
  if (target === "campus") {
    campusMap.innerHTML = getIframeHTML(campusMapUrl);
  }

  if (target === "japan") {
    fetch('japan-map.svg')
      .then(response => response.text())
      .then(svgData => {
        japanMap.innerHTML = svgData;

        document.querySelectorAll('.geolonia-svg-map .prefecture').forEach(pref => {
          pref.addEventListener("mouseover", () => pref.style.fill = "#ffaaaa");
          pref.addEventListener("mouseleave", () => pref.style.fill = "");
          pref.addEventListener("click", () => showPrefectureMap(pref.dataset.code));
        });
      })
      .catch(err => {
        japanMap.innerHTML = `<p>日本地図の読み込みに失敗しました</p>`;
        console.error(err);
      });
  }
}

// ボタンクリック時のイベントリスナー
document.getElementById("campus-button").addEventListener("click", () => {
  switchDisplay("campus");
  document.getElementById("campus-map").innerHTML = getIframeHTML(campusMapUrl);
  history.pushState({ view: "campus" }, "", "?view=campus");
});

document.getElementById("jp-button").addEventListener("click", () => {
  switchDisplay("japan");
  history.pushState({ view: "japan" }, "", "?view=japan");
});

//履歴で戻る
window.addEventListener("popstate", (event) => {
  const state = event.state;
  if (!state) return;

  if (state.view === "campus") {
    document.getElementById("campus-button").click();
  } else if (state.view === "japan") {
    document.getElementById("jp-button").click();
  } else if (state.code) {
    showPrefectureMap(state.code);
  } else if (state.country) {
    showCountryMap(state.country);
  }
});
