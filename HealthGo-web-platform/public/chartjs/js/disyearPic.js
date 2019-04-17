const disyearPic = document.getElementById("disyearPic");

function refreshdisyearPic(){
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
     data = JSON.parse(this.responseText);
     Chart.defaults.scale.ticks.beginAtZero = true;

     let gymByMonth = new Chart(disyearPic, data);

    }
  };
  xhttp.open("GET", "/graph/disyearPic", true);
  xhttp.send();
}

refreshdisyearPic();
