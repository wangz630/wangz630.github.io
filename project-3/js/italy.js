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
        image.src = map.fields.Images[0].url;
        mapContainer.append(image);

        var mapGenre = map.fields.genre;
        mapGenre.forEach(function(genre) {
            mapContainer.classList.add(genre);
        });

        imageFilter();

    function imageFilter() {
      if (mapContainer.classList.contains("italy")) {
        mapContainer.style.display = "block";
      } else {
        mapContainer.style.display = "none";
      }
    //   var detailContainer = document.querySelector("#right-detail");
    //   window.addEventListener("mouseover", function() {
    //       var image = document.querySelector(".image-container");
    //       image.style.background = "#fff url('"+map.fields.Images[0].url+"')";
    //   //    if (image.src==map.fields.Images[index].url){
    //   //        image.style.display ="block";
    //   //    }
  
      }

      var detailMapContainer = document.createElement("div");
      detailMapContainer.classList.add("detail-image-container");
      document.querySelector(".image-container").append(detailMapContainer);

        var image = document.createElement('img');
        image.src = map.fields.Images[0].url;
        detailMapContainer.append(image);

        var location = document.createElement('h2');
        location.classList.add("location");
        location.innerText = map.fields.Location;
        detailMapContainer.append(location);

        var year = document.createElement('p');
        year.classList.add("year");
        year.innerText = map.fields.Year;
        detailMapContainer.appendChild(year);

        var functions = document.createElement('p');
        functions.classList.add("functions");
        functions.innerText = map.fields.Functions;
        detailMapContainer.appendChild(functions);

        var scale = document.createElement('p');
        scale.classList.add("scale");
        scale.innerText = map.fields.Scale;
        detailMapContainer.appendChild(scale);

        // window.addEventListener("mouseover", function() {
        //     if (detailMapContainer.classList.contains("australia")) {
        //         detailMapContainer.style.display = "block";
        //     } else {
        //         detailMapContainer.style.display = "none";
        //     }
        //     })
      

      mapContainer.addEventListener("click", function(event) {
      // songDescription.classList.toggle("active");
      image.classList.toggle("active");
      location.classList.toggle("active");
      year.classList.toggle("active");
      functions.classList.toggle("active");
      scale.classList.toggle("active");
    //   image.classList.toggle("active");
    });

    // function showImage(imgName) {
    //     var curImage = document.getElementById('currentImg');
    //     var thePath = 'images/';
    //     var theSource = thePath + imgName;
    //     curImage.src = theSource;
    //     curImage.alt = imgName;
    //     curImage.title = imgName;
    //  }

 

    });


    // document.querySelector("#right-detail").onscroll = function() {scrollFunction()};
    
    // function scrollFunction() {
    //     if (document.querySelector("#right-detail").scrollTop > 10 || document.documentElement.scrollTop > 10 && image.classList.contains("active")) {
    //       document.querySelectorAll("img.active").style.width = '100px' ;
    //     } 
    //     if (document.body.scrollTop > 50 || document.documentElement.scrollTop > 50) {
    //         document.querySelectorAll("img.active").style.width = '200px' ;
    //     } 
    //     if (document.body.scrollTop > 150 || document.documentElement.scrollTop > 150) {
    //         document.querySelectorAll("img.active").style.width = '300px' ;
    //     } 
    // }
    // document.getElementsByTagName("img")[0].style.width = '100px';
}




