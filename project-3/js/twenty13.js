console.log("airtable practice");

//load airtable lib

var Airtable = require('airtable');
var base = new Airtable({apiKey: 'keyLDUimLxPjXCkcF'}).base('appqjTjKVd77BifP9');

base('World').select({}).eachPage(gotPageOfRecords, gotAllRecords);

let maps = [];

function gotPageOfRecords(records, fetchNextPage) {
    // console.log("gotPageOfRecords");
    maps.push(...records);
    fetchNextPage();
}

function gotAllRecords(err) {
    // console.log("gotAllRecords");
    if(err) {
        console.log("error loading maps");
        console.error(err);
        return;
    }
    

    consoleLogRecords();
    showData();
}

function consoleLogRecords() {
    // console.log("consoleLogRecords()");
    maps.forEach((map) => {
        console.log("map:", map);
    }

    );
}

function showData() {

    // console.log("showData()");
    maps.forEach((map) => {
        var mapContainer = document.createElement("div");
        mapContainer.classList.add("map-container");
        document.querySelector(".container").append(mapContainer);

        var image = document.createElement('img');
        image.classList.add("image-left")
        image.src = map.fields.Images[0].url;
        mapContainer.append(image);


        var mapGenre = map.fields.genre;
        mapGenre.forEach(function(genre) {
            mapContainer.classList.add(genre);
        });

        imageFilter();

    function imageFilter() {
      if (mapContainer.classList.contains("twenty13")) {
        mapContainer.style.display = "block";
      } else {
        mapContainer.style.display = "none";
      }
  
      }

      var detailMapContainer = document.createElement("div");
      detailMapContainer.classList.add("detail-image-container");
      document.querySelector(".image-container").append(detailMapContainer);

      var detailInformationContainer = document.createElement("div");
      detailInformationContainer.classList.add("detail-information-container");
      document.querySelector(".information-container").append(detailInformationContainer);

        var imageRight = document.createElement('img');
        imageRight.classList.add("image-right");
        imageRight.src = map.fields.Images[0].url;
        detailMapContainer.append(imageRight);

        var location = document.createElement('h2');
        location.classList.add("location");
        location.innerText = map.fields.Location;
        detailInformationContainer.append(location);

         var locationBrief = document.createElement('p');
        locationBrief.classList.add("location-brief");
        locationBrief.innerText = map.fields.Location_brief;
        detailInformationContainer.append(locationBrief);

        var year = document.createElement('p');
        year.classList.add("year");
        year.innerText = map.fields.Year;
        detailInformationContainer.appendChild(year);

        var functions = document.createElement('p');
        functions.classList.add("functions");
        functions.innerText = map.fields.Functions;
        detailInformationContainer.appendChild(functions);

        var scale = document.createElement('p');
        scale.classList.add("scale");
        scale.innerText = map.fields.Scale;
        detailInformationContainer.appendChild(scale);

      

        mapContainer.addEventListener("click", function(event) {
          imageRight.style.display = "block";
          location.style.display = "inline";
          year.style.display = "inline";
          functions.style.display = "inline";
          scale.style.display = "inline";
          locationBrief.style.display = "inline";
          document.querySelector(".close-button").style.display = "block";
          document.querySelector(".image-size-control1").style.display = "block";
          document.querySelector(".image-size-control2").style.display = "block";
          document.querySelector(".image-size-control3").style.display = "block";
  });
  
  function clearLeft(){
    document.querySelector(".container").style.opacity ="0";
    document.querySelector(".left-block").style.zIndex ="1";
    document.querySelector(".left-block").style.backgroundColor ="#81A0AD";
};

function showLeft(){
  if (mapContainer.classList.contains("twenty13")) {
    mapContainer.style.display = "block";
  } else {
    mapContainer.style.display = "none";
  };
  document.querySelector(".container").style.opacity ="1";
  document.querySelector(".left-block").style.zIndex ="-1";
  document.querySelector(".left-block").style.backgroundColor ="#486A7D";
  imageRight.style.display = "none";
          location.style.display = "none";
          year.style.display = "none";
          functions.style.display = "none";
          scale.style.display = "none";
          locationBrief.style.display = "none";
          document.querySelector(".close-button").style.display = "none";
          document.querySelector(".image-size-control1").style.display = "none";
          document.querySelector(".image-size-control2").style.display = "none";
          document.querySelector(".image-size-control3").style.display = "none";
};

var mapsAll = document.querySelectorAll(".map-container");
mapsAll.forEach(function(map){
  map.addEventListener("click", clearLeft);
})

document.querySelector(".close-button").addEventListener("click", showLeft);

document.querySelector(".image-size-control2").style.backgroundColor = "#8cc2ff";
document.querySelector(".image-size-control2 span").style.color = "#8cc2ff";

document.querySelector(".image-size-control1").addEventListener("click", function () {
  document.querySelector(".image-container").style.width= "150px";
  document.querySelector(".image-container").style.width= "150px";
  document.querySelector(".image-container").style.left= "54%";
  document.querySelector(".image-container").style.top= "40%";
  document.querySelector(".image-size-control1").style.backgroundColor = "#8cc2ff";
  document.querySelector(".image-size-control2").style.backgroundColor = "#F6E0BD";
  document.querySelector(".image-size-control3").style.backgroundColor = "#F6E0BD";
  document.querySelector(".image-size-control1 span").style.color = "#8cc2ff";
  document.querySelector(".image-size-control2 span").style.color = "#F6E0BD";
  document.querySelector(".image-size-control3 span").style.color = "#F6E0BD";
  
})

document.querySelector(".image-size-control2").addEventListener("click", function () {
  document.querySelector(".image-container").style.width= "400px";
  document.querySelector(".image-container").style.height= "400px";
  document.querySelector(".image-container").style.left= "45%";
  document.querySelector(".image-container").style.top= "25%";
  document.querySelector(".image-size-control2").style.backgroundColor = "#8cc2ff";
  document.querySelector(".image-size-control1").style.backgroundColor = "#F6E0BD";
  document.querySelector(".image-size-control3").style.backgroundColor = "#F6E0BD";
  document.querySelector(".image-size-control2 span").style.color = "#8cc2ff";
  document.querySelector(".image-size-control1 span").style.color = "#F6E0BD";
  document.querySelector(".image-size-control3 span").style.color = "#F6E0BD";
})


document.querySelector(".image-size-control3").addEventListener("click", function () {
  document.querySelector(".image-container").style.width= "700px";
  document.querySelector(".image-container").style.height= "600px";
  document.querySelector(".image-container").style.left= "35%";
  document.querySelector(".image-container").style.top= "10%";
  document.querySelector(".image-size-control3").style.backgroundColor = "#8cc2ff";
  document.querySelector(".image-size-control1").style.backgroundColor = "#F6E0BD";
  document.querySelector(".image-size-control2").style.backgroundColor = "#F6E0BD";
  document.querySelector(".image-size-control3 span").style.color = "#8cc2ff";
  document.querySelector(".image-size-control1 span").style.color = "#F6E0BD";
  document.querySelector(".image-size-control2 span").style.color = "#F6E0BD";
})



  });
}




