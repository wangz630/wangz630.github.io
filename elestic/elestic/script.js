console.log("Is my script file working?");


// load the airtable library, call it "Airtable";
var Airtable = require("airtable");
// console.log(Airtable);

// use airtable library, connect to our base using API key
var base = new Airtable({ apiKey: "keyj7RMo1jrIjBKGu" }).base(
  "appyU6UrGpIRaSrPs"
);


// get our collection base, select all the records
// specify functions that will receive the data
base("color")
  .select({})
  .eachPage(gotPageOfColors, gotAllColors);

  // an empty array to hold our data
var colors = [];


// callback function that receives our data
function gotPageOfColors(records, fetchNextPage) {
  console.log("gotPageOfColors()");
  // add the records from this page to our array
  colors.push(...records);
  // request more pages
  fetchNextPage();
}

// call back function that is called when all pages are loaded
function gotAllColors(err) {
  console.log("gotAllColors()");


// report an error, you'd want to do something better than this in production
  if (err) {
    console.log("error loading data");
    console.error(err);
    return;
  }

   // call functions to log and show the books
  consoleLogColors();
  showColors();
}



// just loop through the books and console.log them
function consoleLogColors() {
  console.log("consoleLogColors()");
  colors.forEach(color => {
    console.log("Color:", color);
  });
}



// look through our airtable data, create elements
function showColors() {
  console.log("showColors()");
  colors.forEach((color) => {
    // create container for each song
    var colorContainer = document.createElement("div");
   	colorContainer.classList.add("color-container");
  	document.querySelector(".container").append(colorContainer);

    // add song titles
   	var colorTitle = document.createElement("h1");
    colorTitle.classList.add("color-title");
    colorTitle.innerText = color.fields.name;
    colorContainer.append(colorTitle);


    var colorImage = document.createElement("img");
    colorImage.classList.add("color-image");
    colorImage.src = color.fields.color[0].url;
    colorContainer.append(colorImage);
	
	var nameOfCompany = document.createElement("h5");
    nameOfCompany.classList.add("color-company");
    nameOfCompany.innerText = color.fields.company;
    colorContainer.append(nameOfCompany);

    // get genre filed from airtable
    //loop through the array  and add each genre as a class
    //to the song container

    var colorSeries = color.fields.color_series;
    colorSeries.forEach(function(colorseries){
    	colorContainer.classList.add(colorseries);
    })
    //add event liostner to our filters
    //to add an active class to our song
    var filterWhite = document.querySelector(".white1");
    filterWhite.addEventListener("click", function() {
      if (colorContainer.classList.contains("white")) {
        colorContainer.style.background = "red";
      } else {
        colorContainer.style.background = "grey";
      }
    });



	});

  	
}
   
 