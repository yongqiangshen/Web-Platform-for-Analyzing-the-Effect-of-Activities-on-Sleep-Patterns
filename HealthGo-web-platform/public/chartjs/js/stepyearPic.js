const stepyearPic = document.getElementById("stepyearPic");

function refreshstepyearPic(){
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
     data = JSON.parse(this.responseText);
     Chart.defaults.scale.ticks.beginAtZero = true;

     let gymByMonth = new Chart(stepyearPic, data);

    }
  };
  xhttp.open("GET", "/graph/stepyearPic", true);
  xhttp.send();
}

refreshstepyearPic();
