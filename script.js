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
