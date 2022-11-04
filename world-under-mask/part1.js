var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(
    75, window.innerWidth/window.innerHeight,
    0.5, 1000
);
camera.position.z = 5;

var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

//Cube
var geometry = new THREE.BoxGeometry(1, 1, 1);
var material = new THREE.MeshNormalMaterial({color: 0x00aaff});

var cube = new THREE.Mesh(geometry, material);
scene.add(cube);

function animate(){
    requestAnimationFrame(animate);

    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;

    renderer.render(scene, camera);
}

animate();

//simple game part3
//load content
document.addEventListener("DOMContentLoaded", function() {
    console.log("content loaded");
  
    //create an array to hold images
    let sloth = ["sloth1", "sloth2", "sloth3", "sloth4", "sloth5", "sloth6", "sloth7","sloth8"];
  
  
    //use the array concat() method to add the array to itself and get two copies of each card.
    sloth = sloth.concat(sloth);
    // console.log(sloth);
    
    
    // // //use destructuring assignment to swap values
    // [sloth[3], sloth[4]] = [sloth[4], sloth[3]];
    // console.log(sloth);
  
    // let i =sloth.length-1;
    // console.log(i);
  //using for loop to swap all values from the end to start
    //i indicates the index of the array for each value
    for (let i = sloth.length-1; i > 0; i--) {
      //randomly get a number between 0 and i(i is not included)
      let j = Math.floor(Math.random() * i);
      //use destructuring assignment to swap values
      [sloth[i], sloth[j]] = [sloth[j], sloth[i]];
  }
  console.log(sloth);
    
  
  /* Creating the Cards */
    
    //find the list element where we will create the cards
  
    let icons = document.querySelector("#icons");
    //initial value of score
    var i = 0;
    document.querySelector("p").innerHTML = `Score: ${i}`;
    
    //loop through sloth array using the forEach method and create each "card" displaying one of the images
  
    sloth.forEach(createCard);
    
    //this function creates a card for each image
    function createCard (val, ind, array) {
      //create the new card element
      let card = document.createElement('li');
      //add a class "card " to all li element
      card.classList.add("card");
      //put the image in the new element
      card.innerHTML = `<img src="images/${val}.png">`;
      //get the image inside the card
      let cardimg = card.querySelector("img");
      //set a unique id for the card image using the value
      cardimg.id = val;
      //give all card images a "hidden" class at the beginning
      cardimg.classList.add("hidden");
      //append the element to the parent ul
      icons.append(card);
     //add event listener to card image
      cardimg.addEventListener("click",toggleCard);
  
    }
  
  
  //the code below is learnt from a youtube tutorial https://www.youtube.com/watch?v=-tlb4tv4mC4 
  //check cards
  function checkCards(e){
    //store e.target to a variable
    let clickedCard = e.target;
    console.log(clickedCard);
    //add a class to all cards that have been clicked on
    clickedCard.classList.toggle("flipped");
    //select all elements in html that have "flipped" className
    let flippedCards = document.querySelectorAll('.flipped');
    console.log(flippedCards);
     //logic
     //see things happened after two cards being flipped
    if(flippedCards.length === 2){
      //compare two id to see if they're the same or not
      //if same, cards are matched
      if(flippedCards[0].id === flippedCards[1].id){
        console.log("match");
        //display an image to indicate that images are matched
        document.querySelector("#true").style.display = "block";
        //make the image dissapear after a short period
         setTimeout(function(){
             document.querySelector("#true").style.display = "none";
          },1000);
        //apply change to each image that is matched
        flippedCards.forEach((card)=>{
          //remove class hidden
          card.classList.remove("hidden");
          //remove class flipped
          card.classList.remove("flipped");
          //add class showimg
          card.classList.add("showimg");
          console.log("remove listener");
          //remove event listener of the card so that it'll be unclickable
          card.removeEventListener("click",toggleCard);
          //add score
          i=i+0.5;
          document.querySelector("p").innerHTML = `Score: ${i}`;
        })
      }else{
        //if images not matched
        console.log("wrong");
        //show a message of false choice and hide that image soon
        document.querySelector("#false").style.display = "block";
        setTimeout(function(){
             document.querySelector("#false").style.display = "none";
          },1000);
        //for two card being flipped, hide them again after a short pause
        flippedCards.forEach((card)=>{
         //remove  a class name "flipped" 
        card.classList.remove("flipped");
          //delay a remove command
          setTimeout(function(){
             card.classList.remove("showimg");
          },500);
  
        });
      }
    }
      //collect all cards that have class "hidden" to see if all images are showing up
      let allHiddenCards = document.querySelectorAll('.hidden');
  //if no card contains hidden class name, then all images have been matched
  if(!allHiddenCards.length){
    //show congradulations after a short delay
    setTimeout(function(){
             document.querySelector("#congrad").style.display = "block";
          },1000);
  }
  
  }
  
  
    
  
    function toggleCard(e) {
      //e is the event that triggered the event
      //e.target is the element that event acted on
      console.log("toggle");
      //add the class to display the image
      e.target.classList.toggle("showimg");
      //do hte function(comparing cards) every time a card has been flipped
      checkCards(e); 
    }
      
  
    
  }); //end of content loaded listener
  
  
  
  