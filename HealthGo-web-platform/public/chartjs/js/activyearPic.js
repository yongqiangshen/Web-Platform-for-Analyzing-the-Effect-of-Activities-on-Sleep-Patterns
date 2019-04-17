const activyearPic = document.getElementById("activyearPic");

function refreshactivyearPic(){
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
     data = JSON.parse(this.responseText);
     Chart.defaults.scale.ticks.beginAtZero = true;

     let gymByMonth = new Chart(activyearPic, data);

    }
  };
  xhttp.open("GET", "/graph/activyearPic", true);
  xhttp.send();
}

refreshactivyearPic();
