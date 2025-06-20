document.addEventListener("DOMContentLoaded", () => {
  const yamaguchicityMapUrl = 
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d422206.7648998558!2d131.5436647!3d34.2360294!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x354495c54c9efd75%3A0x263156320e32adf7!2z5bGx5Y-j55yM5bGx5Y-j5biC!5e0!3m2!1sja!2sjp!4v1750313187750!5m2!1sja!2sjp";

  document.getElementById("maprange").innerHTML = `
    <iframe 
      src="${yamaguchicityMapUrl}"
      width="100%"
      height="450"
      style="border:0;"
      allowfullscreen=""
      loading="lazy"
      referrerpolicy="no-referrer-when-downgrade">
    </iframe>
  `;

  let selected = document.getElementById("yamaguchibutton");
  selected.style.transform = "scaleY(1.3)";

  document.querySelectorAll(".map-buttons button").forEach(btn => {
    btn.addEventListener("click", function () {
      if (selected !== this) {
        selected.style.transform = "scaleY(1)";
        this.style.transform = "scaleY(1.3)";
        selected = this;
      }
    });
  });
});

fetch("japan-map.svg")
  .then(res => res.text())
  .then(svg => {
    document.getElementById("japan-map").innerHTML = svg;
  })
  .catch(err => console.error("SVG読み込み失敗", err));

document.getElementById("yamaguchibutton").addEventListener("click",function(){document.getElementById("maprange").style.display="block";
                                                                              document.getElementById("japan-map").style.display="none";});

document.getElementById("jpbutton").addEventListener("click",function(){document.getElementById("maprange").style.display="none";
                                                                       document.getElementById("japan-map").style.display="block";});

async function init() {
  const map = "./japan-map.svg";
  const container = document.querySelector('#japan-map');
  const maprange = document.getElementById("maprange");

  // 地図読み込み
  const res = await fetch(map);
  if (!res.ok) {
    console.error("SVG地図の読み込み失敗");
    return;
  }

  const svg = await res.text();
  container.innerHTML = svg;

  // 地図リンクの読み込み
  let mapLinks = {};
  try {
    const mapRes = await fetch("map-links.json");
    mapLinks = await mapRes.json();
  } catch (err) {
    console.error("地図リンクの読み込み失敗", err);
  }

  // イベント設定
  const prefs = document.querySelectorAll('.geolonia-svg-map .prefecture');
  prefs.forEach(pref => {
    pref.addEventListener('mouseover', e => {
      e.currentTarget.style.fill = "#ff0000";
    });

    pref.addEventListener('mouseleave', e => {
      e.currentTarget.style.fill = "";
    });

    pref.addEventListener('click', e => {
      const code = e.currentTarget.dataset.code;
      showPrefectureMap(code);
    });
  });

  function showPrefectureMap(code) {
    const url = mapLinks[code];
    container.style.display = "none";
    maprange.style.display = "block";

    if (!url) {
      maprange.innerHTML = "<p>この都道府県の地図はまだ準備中です。</p>";
      return;
    }

    maprange.innerHTML = `
      <iframe src="${url}"
        width="100%"
        height="450"
        style="border:0;"
        allowfullscreen=""
        loading="lazy"
        referrerpolicy="no-referrer-when-downgrade"></iframe>
    `;
  }
}

// 実行
init();
