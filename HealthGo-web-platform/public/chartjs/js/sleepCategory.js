const sleepCategory = document.getElementById("sleepcategory");

function refreshsleepPic(){
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
     data = JSON.parse(this.responseText);
     Chart.defaults.scale.ticks.beginAtZero = true;

     let sleepcategory = new Chart(sleepCategory, data);

    }
  };
  xhttp.open("GET", "/graph/sleepCategory", true);
  xhttp.send();
}

refreshsleepPic();