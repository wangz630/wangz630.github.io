let filterButtons=document.querySelector(".filters");
// Function to render your items
function renderItems(collection) {
    // out put stuff to html page and make data look NICE 
    console.log("data records in your JSON:", collection); 
    // will log something like this: [Record 1 {}, Record 2{}, Record 3{}];
    collection.forEach(item => {
      console.log(item);

      let ticketImg = document.createElement("img");
      ticketImg.src = item.img
      let collectionlist=document.querySelector(".collection")
      collectionlist.appendChild (ticketImg)
    })
      
  }

   //create buttons for all filters [stops]
function filterItems(collection) {
    collection.forEach(item => {
      // let button=document.createElement("div");
      // button.innerHTML=item.stop;
      // filterButtons.appendChild(button);
      showItem = document.querySelector('.showItem');
      let ticketImg = document.createElement("img");
      //add event listener to all the buttons 
      let filteredItem;
      let rockaway = document.querySelector('#rockaway');
      let sunsetPark = document.querySelector('#sunsetPark');
      let east90thSt = document.querySelector('#east90thSt');
      let brooklynNavyYard = document.querySelector('#brooklynNavyYard');

      rockaway.addEventListener("click", function(){
            if(item.stop === "Rockaway"){
              filteredItem = item.img;
              ticketImg.src = filteredItem;
            }
          })
      sunsetPark.addEventListener("click", function(){
            if(item.stop === "Sunset Park/BAT"){
              filteredItem = item.img;
              ticketImg.src = filteredItem;
            }
      })
      east90thSt.addEventListener("click", function(){
        if(item.stop === "East 90th St"){
          filteredItem = item.img;
          ticketImg.src = filteredItem;
        }
    })
      brooklynNavyYard.addEventListener("click", function(){
        if(item.stop === "Brooklyn Navy Yard"){
          filteredItem = item.img;
          ticketImg.src = filteredItem;
        }
    })

      east34thStreet.addEventListener("click", function(){
        if(item.stop === "East 34th Street"){
          filteredItem = item.img;
          ticketImg.src = filteredItem;
        }
    })

      
      showItem.appendChild(ticketImg);
      
      
    })
  }

function updateFilteredItems(item){
  showItem = document.querySelector('.showItem');
  let ticketImg = document.createElement("img");
  ticketImg.src = item.img;
  // showItem.appendChild(ticketImg);
}


  // let collection = document.createElement("div");

  // let fruits= document.createElement("td")
  // let row=document.createElement("tr")
  // row.classList.add("row")
  // fruits.innerHTML=item.fruits;

  // let colorOutside= document.createElement("td")
  // colorOutside.innerHTML=item.colorOutside;
 
  // let size= document.createElement("td")
  // size.innerHTML=item.size;

  // let flavor= document.createElement("td")
  // flavor.innerHTML=item.flavor;


  // row.append(fruits, colorOutside, size, flavor)
  // parent.append(row)
  // console.log(item.colorOutside);
  

  // Fetch gets your JSON file.
  fetch("./ferrydata.json")
    .then(function (response) {
      return response.json();
    })
    .then(function (collection) {
      // And passes the data to the function, above!
      // renderItems(collection.reverse()); // In reverse order
      filterItems(collection)
    });

     
   
    //add event listener to all the buttons 
    //every time you click a button, filters based off stops 
    //filtering:
    //if the stop=rockaway
      //only shows rockaway tag 
    // repeat for all filters 

  