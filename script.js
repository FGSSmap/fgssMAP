function swichDisplay(taeget){
  const campusMap = document.getElementById("campus-map");
  const japanMap = document.getElementById("japan-map");

  campusMap.style.display = taeget === "campus" ? "black" : "none";
  japanMap.style.display = target === "japan" ? "black" : "none";
}

document.getElementById("campus-button").addEventListener("click",() => {
  switchDisplay("campus");
});

document.getElementById("jp-button").addEventListener("click",()=>{
  switchDisplay("japan");
});
