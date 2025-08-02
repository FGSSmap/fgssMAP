//switchDisplayの指定
document.getElementById("campus-button").addEventListener("click", () => {
  switchDisplay("campus");
});

document.getElementById("jp-button").addEventListener("click", () => {
  switchDisplay("japan");
});

function switchDisplay(target) {
  const campusMap = document.getElementById("campus-map");
  const japanMap = document.getElementById("japan-map");

  // 表示切り替え
  campusMap.style.display = target === "campus" ? "block" : "none";
  japanMap.style.display = target === "japan" ? "block" : "none";

  //中身の切り替え
  if (target === "campus") {

    const campusMapUrl = "https://www.google.com/maps/d/u/1/embed?mid=1nTgYFWkXf1UQHwGZCwdXuRv-aopgUkY&ehbc=2E312F"
    
    campusMap.innerHTML = getIframeHTML(campusMapUrl);
  }

  if (target === "japan") {
    fetch('japan-map.svg')
      .then(response => response.text())
      .then(svgData => {
        japanMap.innerHTML = svgData;
      })
        .then(svg => {
          japanMapDiv.innerHTML = svg;
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

switchDisplay("campus");

// キャンパス
  document.getElementById("campus-button").addEventListener("click", () => {
    switchDisplay("campus");
    document.getElementById("campusMap").innerHTML = getIframeHTML(campusMapUrl);
    history.pushState({ view: "campus" }, "", "?view=caｍpus");
  });

//日本
document.getelementById("jp-button").addEventListener("click", ()=>{
  switchDisplay("japan");
  history.pushState({ view: "japan"},"","?view=japan");
  const japanMapDiv = document.getElementById("japan-map");

})
