document.addEventListener("DOMContentLoaded", () => {
  const yamaguchiMapUrl = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d422206.7648998558!2d131.5436647!3d34.2360294!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x354495c54c9efd75%3A0x263156320e32adf7!2z5bGx5Y-j55yM5bGx5Y-j5biC!5e0!3m2!1sja!2sjp!4v1750313187750!5m2!1sja!2sjp";
  document.getElementById("maprange").innerHTML = `<iframe
  src = "${yamaguchiMapUrl}"
  width="100%"
  height="450"
  style="border:0;"
  allowfullscreen=""
  loading="lazy"
  referrerpolicy="no-referrer-when-downgrade"></iframe>`;
  let selected = document.getElementById("yamaguchimap");
  selected.style.transform = "scaleY(1.3)";

  document.querySelectorAll(".mainmap button").forEach(btn => {
    btn.addEventListener("click", function () {
      if (selected !== this) {
        selected.style.transform = "scaleY(1)";
        this.style.transform = "scaleY(1.3)";
        selected = this;
      }
    });
  }); 
}); 

document.getElementById("yamaguchimap").addEventListener("click",function(){document.getElementById("japan-map").style.display="none";
 document.getElementById("maprange").style.display="block";
 const yamaguchiMapUrl = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d422206.7648998558!2d131.5436647!3d34.2360294!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x354495c54c9efd75%3A0x263156320e32adf7!2z5bGx5Y-j55yM5bGx5Y-j5biC!5e0!3m2!1sja!2sjp!4v1750313187750!5m2!1sja!2sjp";
 document.getElementById("maprange").innerHTML=`<iframe src="${yamaguchiMapUrl}"
  width="100%"
  height="450"
  style="border:0;"
  allwfullscreen=""
  loading="lazy"
    referrerpolicy="no-referrer-when-downgrade"></iframe>`;});

document.getElementById("jpmap").addEventListener("click",function(){document.getElementById("japan-map").style.display="block";
 document.getElementById("maprange").style.display="none";}
)

const prefs = document.querySelectorAll('.geolonia-svg-map .prefecture');
prefs.forEach((pref)=>{
pref.addEventListener('mouseover',(event)=>{event.currentTarget.style.fill = "#ffaaaa";});
pref.addEventListener('mouseleave',(event)=>{event.currentTarget.style.fill = "";});
pref.addEventListener('click', (event) => {
      const code = event.currentTarget.dataset.code;
      showPrefectureMap(code);
    });
  });

function showPrefectureMap(code) {
  const mapUrls = {
　   
    "35": "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d844212.6013676944!2d131.63343944999994!3d34.256058299999985!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3544c719765a8ffd%3A0x490cbcc25354e270!2z5bGx5Y-j55yM!5e0!3m2!1sja!2sjp!4v1750041306016!5m2!1sja!2sjp",
    
    // 他の都道府県コードを追加可能
  };
 
  const url = mapUrls[code];
  if (!url) {
    document.getElementById("maprange").innerHTML = "<p>この都道府県の地図はまだ準備中です。</p>";
    document.getElementById("maprange").style.display="block";
    document.getElementById("japan-map").style.display="none";
    return;
  }
  document.getElementById("maprange").style.display = "block";
  document.getElementById("japan-map").style.display="none";
  
   document.getElementById("maprange").innerHTML = `<iframe src="${url}"
  width="100%"
  height="450"
  style="border:0;"
  allowfullscrean""
  loading="lzy"
  referrerpolicy="no-referrer-when-downgrade"></iframe>`;
}
