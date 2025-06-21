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

  document.getElementById("jpbutton").addEventListener("click", function () {
    document.getElementById("maprange").style.display = "none";
    const japanMapDiv = document.getElementById("japan-map");
    japanMapDiv.style.display = "block";

    if (!japanMapDiv.innerHTML.trim()) {
      fetch("https://fgssmap.github.io/fgssMAP/japan-map.svg")
        .then(res => res.text())
        .then(svg => {
          japanMapDiv.innerHTML = svg;

          const prefs = document.querySelectorAll('.geolonia-svg-map .prefecture');
          prefs.forEach(pref => {
            pref.addEventListener('mouseover', event => {
              event.currentTarget.style.fill = "#ffaaaa";
            });

            pref.addEventListener('mouseleave', event => {
              event.currentTarget.style.fill = "";
            });

            pref.addEventListener('click', event => {
              const code = event.currentTarget.dataset.code;
              showPrefectureMap(code);
            });
          });
        })
        .catch(err => {
          console.error("SVG読み込み失敗", err);
          japanMapDiv.innerHTML = "<p>地図の読み込み失敗</p>";
        });
    }
  });

  document.getElementById("yamaguchibutton").addEventListener("click", function () {
    document.getElementById("maprange").style.display = "block";
    document.getElementById("japan-map").style.display = "none";
    document.getElementById("maprange").innerHTML = `<iframe src="${yamaguchicityMapUrl}"
                                             width="100%"
                                             height="450"
                                             style="border:0;"
                                             allowfullscreen=""
                                             loading="lazy"
                                             referrerpolicy="no-referrer-when-downgrade"></iframe>`;
  });
});

let mapLinks = {};
fetch("https://fgssmap.github.io/fgssMAP/map-links.json")
  .then(res => res.json())
  .then(data => {
    mapLinks = data;
  })
  .catch(err => {
    console.error("地図リンク読み込み失敗", err);
  });

function showPrefectureMap(code) {
  const url = mapLinks[code];
  const maprange = document.getElementById("maprange");
  const japanMap = document.getElementById("japan-map");

  maprange.style.display = "block";
  japanMap.style.display = "none";

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
      referrerpolicy="no-referrer-when-downgrade">
    </iframe>`;
}
