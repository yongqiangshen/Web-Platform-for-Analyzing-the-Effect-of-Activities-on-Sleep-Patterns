const sedyearPic = document.getElementById("sedyearPic");

function refreshsedyearPic(){
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
     data = JSON.parse(this.responseText);
     Chart.defaults.scale.ticks.beginAtZero = true;

     let gymByMonth = new Chart(sedyearPic, data);

    }
  };
  xhttp.open("GET", "/graph/sedyearPic", true);
  xhttp.send();
}

refreshsedyearPic();
