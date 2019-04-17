const sleepyearPic = document.getElementById("sleepyearPic");

function refreshsleepyearPic(){
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
     data = JSON.parse(this.responseText);
     Chart.defaults.scale.ticks.beginAtZero = true;

     let gymByMonth = new Chart(sleepyearPic, data);

    }
  };
  xhttp.open("GET", "/graph/sleepyearPic", true);
  xhttp.send();
}

refreshsleepyearPic();
