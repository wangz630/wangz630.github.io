
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


let filterButtons = document.querySelector(".filters");
// Function to render your items
// function renderItems(collection) {
//     // out put stuff to html page and make data look NICE 
//     console.log("data records in your JSON:", collection); 
//     // will log something like this: [Record 1 {}, Record 2{}, Record 3{}];
//     collection.forEach(item => {
//       console.log(item);

//       let ticketImg = document.createElement("img");
//       ticketImg.src = item.img
//       let collectionlist=document.querySelector(".collection")
//       collectionlist.appendChild (ticketImg)
       
//     ticketImg.style.left = (5+75*Math.random())+'%';
//     ticketImg.style.top=(5+150*Math.random()) +'%';//change the scale of where the emoji show up
//     ti.style.display = "block";

//     })
      
//   }

  let rockaway = document.querySelector('#rockaway');
  let sunsetPark = document.querySelector('#sunsetPark');
  let east90thSt = document.querySelector('#east90thSt');
  let brooklynNavyYard = document.querySelector('#brooklynNavyYard');

   //create buttons for all filters [stops]
function filterItems(collection) {
    collection.forEach(item => {
      // let button=document.createElement("div");
      // button.innerHTML=item.stop;
      // filterButtons.appendChild(button);
      let showItem = document.querySelector('.showItem');
      let ticketImg = document.createElement("img");
      ticketImg.classList.add("image");
      ticketImg.src = item.img;
      showItem.appendChild(ticketImg);
      //add event listener to all the buttons 
      // let filteredItem;

      rockaway.addEventListener("click", function(){
            if(item.stop === "Rockaway"){
              ticketImg.style.display = "block";
            }else{
              ticketImg.style.display = "none";

            }
          })



      sunsetPark.addEventListener("click", function(){
            if(item.stop === "Sunset Park/BAT"){
              ticketImg.style.display = "block";
            }else{
              ticketImg.style.display = "none";

            }
      })
      east90thSt.addEventListener("click", function(){
        if(item.stop === "East 90th St"){
          ticketImg.style.display = "block";
        }else{
          ticketImg.style.display = "none";

        }
    })
      brooklynNavyYard.addEventListener("click", function(){
        if(item.stop === "Brooklyn Navy Yard"){
          ticketImg.style.display = "block";
        }else{
          ticketImg.style.display = "none";

        }
    })

      east34thStreet.addEventListener("click", function(){
        if(item.stop === "East 34th Street"){
          ticketImg.style.display = "block";
        }else{
          ticketImg.style.display = "none";

        }
    })

    soundview.addEventListener("click", function(){
      if(item.stop === "Soundview"){
        ticketImg.style.display = "block";
      }else{
        ticketImg.style.display = "none";

      }
  })
      
      
    })
  }



  // function clearPhotos() {
  //   const container = document.querySelector(".collection");
  //   // console.log(container);
  //   container.innerHTML = "";
  //   // while (allPhotos.childNodes.length > 0) {
  //   //   allPhotos.removeChild(allPhotos.firstChild);
  //   // }
  // }

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
  

     
   
    //add event listener to all the buttons 
    //every time you click a button, filters based off stops 
    //filtering:
    //if the stop=rockaway
      //only shows rockaway tag 
    // repeat for all filters 

  