
var Airtable = require("airtable");
console.log(Airtable);

// use airtable library, connect to our base using API key
var base = new Airtable({ apiKey: "keyCelRUKzAZcpJXJ" }).base(
    "appYBXV5xbQgaNSGw"
  );

//get the "nature" table from the base, select ALL the records, and specify the functions that will receive the data
base("nature").select({}).eachPage(gotPageOfPhotos, gotAllPhotos);

// an empty array to hold our data
const photos = [];

// callback function that receives our data
function gotPageOfPhotos(records, fetchNextPage) {
  console.log("gotPageOfPhotos()");
  // add the records from this page to our books array
  photos.push(...records);
  // request more pages
  fetchNextPage();
}

// call back function that is called when all pages are loaded
function gotAllPhotos(err) {
  console.log("gotAllPhotos()");

// report an error, you'd want to do something better than this in production
  if (err) {
    console.log("error loading data");
    console.error(err);
    return;
 }

  // call functions to log and show the books
  consoleLogPhotos();
  showPhotos(photos);
  addFilterListeners();
}
 
// just loop through the photos and console.log them
function consoleLogPhotos() {
  console.log("consoleLogPhotos()");
  photos.forEach((photo) => {
    console.log("Photo:", photo);
  });
}

function showPhotos(array) {
  console.log("showPhotos()");

// look through our airtable data, create elements
// function showPhotos() {
//   console.log("showPhotos()");
//   photos.forEach((photo) => {

// create an array of .cover-container elements out of the array passed as an argument to this function
const photoContainers = array.map((photo) => {
  const photoContainer = document.createElement("div");
  photoContainer.classList.add("photo-container");

  const photoImage = document.createElement("img");
  photoImage.classList.add("land-image");
  photoImage.src = photo.fields.land_image[0].url;

  photoContainer.append(photoImage);
  return photoContainer;
});

// appends coverContainers to .covers all at once.
  // the append() method lets you append multiple elements simultaneously if you provide a comma-separated list inside the parentheses.
  // for example: document.body.append(element1, element2, element3). it is like writing an array without the brackets.
  // that is what the ... is for. it strips the brackets out of the array when we pass it as an argument to a function 
    document.querySelector(".photos").append(...photoContainers);
}

//function to clear the content of .covers
function clearPhotos() {
  const allPhotos = document.querySelector(".photos");
  while (allPhotos.childNodes.length > 0) {
    allPhotos.removeChild(allPhotos.firstChild);
  }
}
addFilterEventListeners();
// add filter functionality to every .filter-item
function addFilterEventListeners() {
  const filterItems = document.querySelectorAll(".filter-item");
  filterItems.forEach((item) => {
    item.addEventListener("click", (event) => {
  // remove all photos first
      clearPhotos();

  // event.target means the element being clicked on. note that you need event as an argument in the event listener callback, like so: (event) => {}

      // parentNode means the parent of the element. in this case, the parentNode of button.filter-item is li.
      // however, we want to get the 'data-category' attribute of the ul that is the parent of the li, so we call parentNode twice

      const category = event.target.parentNode.parentNode.getAttribute("data-category");
      const value = event.target.getAttribute("data-value");      

  // the filter() method lets us filter an array according to a condition. so if we do covers.filter((cover) => cover.fields.background[0] === "city") then it will return an array of covers with a city background
      // using brackets, we can access the property of an object with a variable
      // then we pass the filtered array to showCovers()

      showPhotos(photos.filter((photo) => photo.fields[category][0] === value));
    }, false);
  });
}


