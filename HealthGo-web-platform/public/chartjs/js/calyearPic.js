const calyearPic = document.getElementById("calyearPic");

function refreshcalyearPic(){
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
     data = JSON.parse(this.responseText);
     Chart.defaults.scale.ticks.beginAtZero = true;

     let gymByMonth = new Chart(calyearPic, data);

    }
  };
  xhttp.open("GET", "/graph/calyearPic", true);
  xhttp.send();
}

refreshcalyearPic();
