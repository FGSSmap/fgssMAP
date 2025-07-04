document.addEventListener("DOMContentLoaded", () => {
  const yamaguchicityMapUrl =
    "https://www.google.com/maps/d/u/1/embed?mid=1nTgYFWkXf1UQHwGZCwdXuRv-aopgUkY&ehbc=2E312F";

  // 初期表示
  document.getElementById("maprange").innerHTML = getIframeHTML(yamaguchicityMapUrl);
  let selected = document.getElementById("yamaguchibutton");
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


  // 山口
  document.getElementById("yamaguchibutton").addEventListener("click", () => {
    switchDisplay("yamaguchi");
    document.getElementById("maprange").innerHTML = getIframeHTML(yamaguchicityMapUrl);
    history.pushState({ view: "yamaguchi" }, "", "?view=yamaguchi");
  });

  // 日本
  document.getElementById("jpbutton").addEventListener("click", () => {
    switchDisplay("japan");
    history.pushState({ view: "japan" }, "", "?view=japan");
    const japanMapDiv = document.getElementById("japan-map");

    if (!japanMapDiv.innerHTML.trim()) {
      fetch("https://fgssmap.github.io/fgssMAP/japan-map.svg")
        .then(res => res.text())
        .then(svg => {
          japanMapDiv.innerHTML = svg;
          document.querySelectorAll('.geolonia-svg-map .prefecture').forEach(pref => {
            pref.addEventListener("mouseover", () => pref.style.fill = "#ffaaaa");
            pref.addEventListener("mouseleave", () => pref.style.fill = "");
            pref.addEventListener("click", () => showPrefectureMap(pref.dataset.code));
          });
        })
        .catch(() => {
          japanMapDiv.innerHTML = "<p>地図の読み込み失敗</p>";
        });
    }
  });

// 🌍 世界地図ボタンの処理
document.getElementById("worldbutton").addEventListener("click", () => {
  switchDisplay("world");
  history.pushState({ view: "world" }, "", "?view=world");
  const worldMapDiv = document.getElementById("world-map");

  if (!worldMapDiv.innerHTML.trim()) {
    fetch("https://fgssmap.github.io/fgssMAP/map.svg")
      .then(res => res.text())
      .then(svg => {
        worldMapDiv.innerHTML = svg;

        // <g cc="xx"> に対応
        document.querySelectorAll('#world-map svg g[cc]').forEach(group => {
          group.addEventListener("mouseover", () => group.style.opacity = "0.7");
          group.addEventListener("mouseleave", () => group.style.opacity = "1");
          group.addEventListener("mouseover", () => group.style.fill = "#ffaaaa");
          group.addEventListener("mouseleave", () => group.style.fill = "");
          group.addEventListener("click", () => {
            const code = group.getAttribute("cc")?.toLowerCase();
            if (code) showCountryMap(code);
          });
        });
      })
      .catch(() => {
        worldMapDiv.innerHTML = "<p>世界地図の読み込み失敗</p>";
      });
  }
});


  // 初期状態履歴
  history.replaceState({ view: "yamaguchi" }, "", "?view=yamaguchi");
});

// 履歴で戻る対応
window.addEventListener("popstate", (event) => {
  const state = event.state;
  if (!state) return;

  if (state.view === "yamaguchi") {
    document.getElementById("yamaguchibutton").click();
  } else if (state.view === "japan") {
    document.getElementById("jpbutton").click();
  } else if (state.view === "world") {
    document.getElementById("worldbutton").click();
  } else if (state.code) {
    showPrefectureMap(state.code);
  } else if (state.country) {
    showCountryMap(state.country);
  }
});

// 表示切替
function switchDisplay(target) {
  document.getElementById("maprange").style.display = target === "yamaguchi" ? "block" : "none";
  document.getElementById("japan-map").style.display = target === "japan" ? "block" : "none";
  document.getElementById("world-map").style.display = target === "world" ? "block" : "none";
}

// iframe用HTML作成
function getIframeHTML(url) {
  return `<iframe src="${url}" width="100%" height="450" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>`;
}

// 日本地図リンク
let mapLinks = {};
fetch("https://fgssmap.github.io/fgssMAP/map-links.json")
  .then(res => res.json())
  .then(data => { mapLinks = data; })
  .catch(err => console.error("地図リンク読み込み失敗", err));

function showPrefectureMap(code) {
  const url = mapLinks[code];
  if (!url) {
    document.getElementById("maprange").innerHTML = "<p>この都道府県の地図はまだ準備中です。</p>";
    return;
  }
  switchDisplay("yamaguchi");
  history.pushState({ code }, "", `?pref=${code}`);
  document.getElementById("maprange").innerHTML = getIframeHTML(url);
}

// 🌍 世界リンクの読み込みと地図表示
let worldLinks = {};
fetch("https://fgssmap.github.io/fgssMAP/map-links-world.json")
  .then(res => res.json())
  .then(data => { worldLinks = data; })
  .catch(err => console.error("世界リンク読み込み失敗", err));

function showCountryMap(code) {
  const url = worldLinks[code];
  if (!url) {
    document.getElementById("maprange").innerHTML = "<p>この国の地図はまだ準備中です。</p>";
    return;
  }
  // 🌍 地図切り替え
  switchDisplay("yamaguchi");
  document.getElementById("maprange").innerHTML = getIframeHTML(url);
  history.pushState({ country: code }, "", `?country=${code}`);
}

// 観光地データの読み込みと表示（都道府県コードまたは国コードに対応）
function loadSpots(areaCode) {
  const spotContainer = document.getElementById("spot-list");
  if (!spotContainer) return;

  // areaCodeが都道府県（2桁の数字）か国コード（英字）かを判定
  const isJapan = /^[0-9]{2}$/.test(areaCode);
  const filePath = isJapan
    ? `./data/spots/japan/${areaCode}.json`
    : `./data/spots/world/${areaCode}.json`;

  fetch(filePath)
    .then(res => {
      if (!res.ok) throw new Error("データが取得できませんでした");
      return res.json();
    })
    .then(data => {
      spotContainer.innerHTML = ""; // 初期化

      data.forEach(spot => {
        const div = document.createElement("div");
        div.className = "spot-box";

        const imageTag = spot.image
          ? `<img src="${spot.image}" alt="${spot.name}">`
          : `<div class="no-image">画像なし</div>`;

        div.innerHTML = `
          ${imageTag}
          <h3>${spot.name}</h3>
          <p>${spot.comment}</p>
        `;
        spotContainer.appendChild(div);
      });
    })
    .catch((err) => {
      console.error("読み込みエラー:", err);
      spotContainer.innerHTML = "<p>観光地情報の読み込みに失敗しました。</p>";
    });
}

// 地図切り替え時に観光地リストも更新する
function switchToArea(areaCode) {
  switchMapDisplay(areaCode); // 地図表示切り替え処理
  loadSpots(areaCode);        // 観光地JSON読み込み
}


