
var Airtable = require("airtable");
console.log(Airtable);

// use airtable library, connect to our base using API key
var base = new Airtable({ apiKey: "keyLDUimLxPjXCkcF" }).base(
    "appuQXgjREzWskbnr"
  );

//get the "nature" table from the base, select ALL the records, and specify the functions that will receive the data
base("inspiration").select({}).eachPage(gotPageOfPhotos, gotAllPhotos);

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
  photoImage.classList.add("inspiration-image");
  photoImage.src = photo.fields.inspiration_image[0].url;

  photoContainer.append(photoImage);


  const photoTitle = document.createElement("span");
  photoTitle.classList.add("title");
  photoTitle.innerText = photo.fields.title;
  photoContainer.append(photoTitle);

  return photoContainer;
});

// appends coverContainers to .covers all at once.
  // the append() method lets you append multiple elements simultaneously if you provide a comma-separated list inside the parentheses.
  // for example: document.body.append(element1, element2, element3). it is like writing an array without the brackets.
  // that is what the ... is for. it strips the brackets out of the array when we pass it as an argument to a function 
    document.querySelector(".photos").append(...photoContainers);

    var allPhotos = document.querySelectorAll(".photo-container");
    console.log(allPhotos);

    allPhotos.forEach((photo)=>{
        photo.style.left = (5+75*Math.random())+'%';
        photo.style.top=(5+150*Math.random()) +'%';//change the scale of where the emoji show up
        photo.style.display = "block";


//show clicked image on top
photo.addEventListener("mouseover",showOnTop); //change where to click to trigger the event

function showOnTop(){       

      photo.style.zIndex = "1";
      photo.style.width = "300px";
      photo.style.height = "auto";
      photo.children[0].style.width = "300px";
      photo.children[0].style.height = "auto";
      photo.children[1].style.display = "block";
   
}


photo.addEventListener("mouseout",showOnBottom); //change where to click to trigger the event

function showOnBottom(){       

      photo.style.zIndex = "-1";
      photo.style.width = "150px";
      photo.style.height = "150px";
      photo.children[0].style.width = "150px";
      photo.children[0].style.height = "auto";
      photo.children[1].style.display = "none";
   
}



      })


// drag 
var dragItems = document.querySelectorAll(".photo-container");
console.log(dragItems);
//    var container = document.querySelector(".photos");
    dragItems.forEach((dragItem)=>{
    var active = false;
    var currentX;
    var currentY;
    var initialX;
    var initialY;
    var xOffset = 0;
    var yOffset = 0;

    dragItem.addEventListener("touchstart", dragStart, false);
    dragItem.addEventListener("touchend", dragEnd, false);
    dragItem.addEventListener("touchmove", drag, false);

    dragItem.addEventListener("mousedown", dragStart, false);
    dragItem.addEventListener("mouseup", dragEnd, false);
    dragItem.addEventListener("mousemove", drag, false);

    function dragStart(e) {
      if (e.type === "touchstart") {
        initialX = e.touches[0].clientX - xOffset;
        initialY = e.touches[0].clientY - yOffset;
      } else {
        initialX = e.clientX - xOffset;
        initialY = e.clientY - yOffset;
      }

      if (e.target === dragItem) {
        active = true;
      }
    }

    function dragEnd(e) {
      initialX = currentX;
      initialY = currentY;

      active = false;
    }

    function drag(e) {
      if (active) {
      
        e.preventDefault();
      
        if (e.type === "touchmove") {
          currentX = e.touches[0].clientX - initialX;
          currentY = e.touches[0].clientY - initialY;
        } else {
          currentX = e.clientX - initialX;
          currentY = e.clientY - initialY;
        }

        xOffset = currentX;
        yOffset = currentY;

        setTranslate(currentX, currentY, dragItem);
      }
    }

    function setTranslate(xPos, yPos, el) {
      el.style.transform = "translate3d(" + xPos + "px, " + yPos + "px, 0)";
    }

  });





      

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





