document.getElementById("campus-button").addEventListener("click",() => {
  switchDisplay("campus");
});

document.getElementById("jp-button").addEventListener("click",()=>{
  switchDisplay("japan");
});

function switchDisplay(target){
  const campusMap = document.getElementById("campus-map");
  const japanMap = document.getElementById("japan-map");

  campusMap.style.display = target === "campus" ? "black" : "none";
  japanMap.style.display = target === "japan" ? "black" : "none";
};


if (target === "campus"){
  campusMap.innerHTML = `<iframe src="https://www.google.com/maps/d/u/1/embed?mid=1nTgYFWkXf1UQHwGZCwdXuRv-aopgUkY&ehbc=2E312F" width="640" height="480"></iframe>`;
}

if (target === "japan"){
  fetch('japan-,map.svg')
  .then(response => response.text())
  .then(svgData => {
    japanMap.innerHTML = svgData;
  })
  .catch(err => {japanMap.innerHTML = `<p>日本地図の読み込みに失敗しました</p>`;
                console.error(err);
                });
}}
