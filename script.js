document.addEventListener("DOMContentLoaded", () => {
  const yamaguchicityMapUrl =
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d422206.7648998558!2d131.5436647!3d34.2360294!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x354495c54c9efd75%3A0x263156320e32adf7!2z5bGx5Y-j55yM5bGx5Y-j5biC!5e0!3m2!1sja!2sjp!4v1750313187750!5m2!1sja!2sjp";

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
