
//load content
document.addEventListener("DOMContentLoaded", function() {
    console.log("content loaded");
    
  let cat = [];
  let dog = [];
    
    //Get elements from HTML
    let start = document.querySelector("#start-button");
    let firstPageImages = document.querySelector("#first-page-images")
    
    let container = document.querySelector("#container");
    let catContainer = document.querySelector("#cat-container");
    let dogContainer = document.querySelector("#dog-container");
    let home = document.querySelector(".home    ");
    let filterAll = document.querySelector("#filter-all");
    let filterDog = document.querySelector("#filter-dog");
    let filterCat = document.querySelector("#filter-cat");
    
  
  //use Event Listener to remove start button and images on current page and show animal bubbles and categories on the page when start button was clicked
  start.addEventListener("click",function(){
    //remove elements
    document.body.removeChild(start);
    document.body.removeChild(firstPageImages);
    document.body.removeChild(home);
    //call function
    showAllAnimals();
    //show new button
    refreshButton.style.display = "block";
    //turn all categories text from opacity 0 to 1
    filterAll.style.opacity = "1";
    filterDog.style.opacity = "1";
    filterCat.style.opacity = "1";
  
  })
  
   //p5 
    
  // function setup (){
  //   var protection = 0;
  //   var circles = [];
    
  // for (var i = 0; i < 20; i++){
  // var circle = {
  //   x:random(width),
  //   y:random(height),
  //   r:60
  // };
  // var overlapping = false;
  // for(var j = 0; j < circles.length; i++){
  //   var other = circles[i];
  //   var d = dist(circles.x, circle.y, other.x, other.y);
  //   if(d < circle.r + other.r){
  //     //they are overlapping
  //     overlapping = true;
  //     break;
  //   }
  // }
  //   if(!overlapping){
  //     circles.push(circle);
  //   }
  // protection++;
  
  // if(protection > 10000){
  //   break;
  // }
  // }
    
  // for (var i = 0; i < circles.length; i++){
  //   fill(255,0,150,100);
  //   noStroke();
  //   ellipse(circles[i].x, circles[i].y, circles[i].r*2, circles[i].r*2);
  // }
  // }
  
  
  
  
    // bubble generator
  function showAllAnimals(){
    for(let i = 0; i < 10; i++){
      //create each image container
      let catCard = document.createElement("div");
      catCard.classList.add("cat-card");
      catCard.classList.add("card");
      catCard.innerHTML = `<img src="images/cat.png">`;
      //placed randomly
      catCard.style.left = (5+90*Math.random())+'%';
      catCard.style.top = (20+60*Math.random()) +'%';
      catCard.style.animationDelay = (2*Math.random()) + 's';
      //append div to container
      catContainer.append(catCard);
    
  
  // get random cat images from Cats API
  function getRandomKitty(){
            let catQuery = 'https://api.thecatapi.com/v1/images/search';
      let response = fetch(catQuery);
    //fetch API
    fetch(catQuery)
      //turn it to a json file
      .then(response => response.json())
      .then(console.log(response))
      .then(data => {
        //get the url of the image
        let url = data[0].url;
        console.log(url);
        catCard.addEventListener("mouseover", function(){
          //using cat image to replace cat icon when mouse is hover on the icon
          catCard.innerHTML = `<img id="cat-image" src=${url}>`;
        });
        //when pointer moves out, the image is hidden again
         catCard.addEventListener("mouseout", function(){
         catCard.innerHTML = `<img src="images/cat.png">`;
       });
                                 
      })
  }
    //call the funtion
    getRandomKitty();
      //repeate the process to get random dog images
      let dogCard = document.createElement("div");
      dogCard.classList.add("dog-card");
      dogCard.classList.add("card");
      dogCard.innerHTML = `<img src="images/dog.png">`;
      dogCard.style.left = (5+90*Math.random())+'%';
      dogCard.style.top = (20+60*Math.random()) +'%';
      dogCard.style.animationDelay = (2*Math.random()) + 's';
      // dogCard.style.transform = `rotate(${(90*Math.random())}deg)`;
      dogContainer.append(dogCard);
      
      function getRandomDoggo(){
      let dogQuery = 'https://dog.ceo/api/breeds/image/random';
     let response = fetch(dogQuery);
    fetch(dogQuery)
      .then(response => response.json())
      .then(console.log(response))
      .then(data => {
        let url = data.message;
        console.log(url);
       dogCard.addEventListener("mouseover", function(){
         dogCard.innerHTML = `<img id="dog-image" src=${url} > `;
         // dogCard.querySelector("img").style.opacity = "1";
          // dogCard.querySelector("img").style.transitionDuration = "0.5s";
         
       });
        dogCard.addEventListener("mouseout", function(){
         dogCard.innerHTML = `<img src="images/dog.png">`;
       });
  
      
      })
  }
    getRandomDoggo();
      
    }
    //showing larger image
  showModal();
  }
    //only show dog images (divide function showAllAnimals into two parts to either show dog or cat images) 
    function showOnlyDogs(){
      for(let i = 0; i < 10; i++){
       let dogCard = document.createElement("div");
      dogCard.classList.add("dog-card");
      dogCard.innerHTML = `<img src="images/dog.png">`;
      dogCard.style.left = (5+90*Math.random())+'%';
      dogCard.style.top = (20+60*Math.random()) +'%';
      dogCard.style.animationDelay = (2*Math.random()) + 's';
      dogContainer.append(dogCard);
      
      function getRandomDoggo(){
      let dogQuery = 'https://dog.ceo/api/breeds/image/random';
     let response = fetch(dogQuery);
    fetch(dogQuery)
      .then(response => response.json())
      .then(console.log(response))
      .then(data => {
        let url = data.message;
        console.log(url);
       dogCard.addEventListener("mouseover", function(){
         dogCard.innerHTML = `<img id="dog-image" src=${url} > `;
         // dogCard.querySelector("img").style.opacity = "1";
          // dogCard.querySelector("img").style.transitionDuration = "0.5s";
         
       });
        dogCard.addEventListener("mouseout", function(){
         dogCard.innerHTML = `<img src="images/dog.png">`;
       });
  
      
      })
  }   getRandomDoggo();
      }
    showModal();
    }
  
    //only shows cat images
    function showOnlyCats(){
      for(let i = 0; i < 10; i++){
      let catCard = document.createElement("div");
      catCard.classList.add("cat-card");
      catCard.innerHTML = `<img src="images/cat.png">`;
      catCard.style.left = (5+90*Math.random())+'%';
      catCard.style.top = (20+60*Math.random()) +'%';
      catCard.style.animationDelay = (2*Math.random()) + 's';
      catContainer.append(catCard);
  
    
  function getRandomKitty(){
            let catQuery = 'https://api.thecatapi.com/v1/images/search';
      let response = fetch(catQuery);
    fetch(catQuery)
      .then(response => response.json())
      .then(console.log(response))
      .then(data => {
        let url = data[0].url;
        console.log(url);
        catCard.addEventListener("mouseover", function(){
          catCard.innerHTML = `<img id="cat-image" src=${url}>`;
        });
         catCard.addEventListener("mouseout", function(){
         catCard.innerHTML = `<img src="images/cat.png">`;
       });
                                 
      })
  }
    getRandomKitty();
      }
    showModal();
    }
  
  
    
  
    
  //filter switch event listener
    //dog filter
    filterDog.addEventListener("click", function(){
      //refresh the images on the page and get a new group of dog images
      dogRefresh();
      //show and hide the background block
      filterDog.style.backgroundColor = "rgba(255, 255, 255, 0.37)";
      filterAll.style.backgroundColor = "rgba(255, 255, 255, 0)";
      filterCat.style.backgroundColor = "rgba(255, 255, 255, 0)";
    });
    
    //cat filter
    filterCat.addEventListener("click", function(){
          catRefresh();
      filterDog.style.backgroundColor = "rgba(255, 255, 255, 0)";
      filterAll.style.backgroundColor = "rgba(255, 255, 255, 0)";
      filterCat.style.backgroundColor = "rgba(255, 255, 255, 0.37)";
    });
    //all filter
    filterAll.addEventListener("click", function(){
            refresh();
      filterDog.style.backgroundColor = "rgba(255, 255, 255, 0)";
      filterAll.style.backgroundColor = "rgba(255, 255, 255, 0.37)";
      filterCat.style.backgroundColor = "rgba(255, 255, 255, 0)";
    });
  
    //find all buttons fron html
  let refreshButton = document.querySelector("#refresh");
  let dogRefreshButton = document.querySelector("#dog-refresh");
  let catRefreshButton = document.querySelector("#cat-refresh");
  //event listener to trigger refresh funcion
    refreshButton.addEventListener("click", refresh);
    dogRefreshButton.addEventListener("click", dogRefresh);
    catRefreshButton.addEventListener("click", catRefresh);
  
  //refresh for all animal images
  function refresh(){
    //hide unused buttons and display the right one
    dogRefreshButton.style.display = "none";
    catRefreshButton.style.display = "none";
    refreshButton.style.display = "block";
    //grab all dog bubbles on the page by class and store them into an array
    let allDogCards = document.querySelectorAll(".dog-card");
    console.log(allDogCards);
    //using forEach to remove all dog images
  allDogCards.forEach(dog => {
    dog.remove();
  });
     let allCatCards = document.querySelectorAll(".cat-card");
    console.log(allCatCards);
    //remove all cat images
  allCatCards.forEach(cat => {
    cat.remove();
  });
    //again call this animal generating funtion to create a new group of images
      showAllAnimals();
    
      console.log("Refreshed"); 
  }
  
  //refresh function for cat only
    function catRefresh(){
      dogRefreshButton.style.display = "none";
    catRefreshButton.style.display = "block";
    refreshButton.style.display = "none";
         let allCatCards = document.querySelectorAll(".cat-card");
    console.log(allCatCards);
  allCatCards.forEach(cat => {
    cat.remove();
  });
  
        let allDogCards = document.querySelectorAll(".dog-card");
    console.log(allDogCards);
  allDogCards.forEach(dog => {
    dog.remove();
  });
    //create cat only images
    showOnlyCats();
  
    console.log("Refreshed"); 
    }
  
  //refresh for dog only category
     function dogRefresh(){
    dogRefreshButton.style.display = "block";
    catRefreshButton.style.display = "none";
    refreshButton.style.display = "none";
         let allDogCards = document.querySelectorAll(".dog-card");
    console.log(allDogCards);
  allDogCards.forEach(dog => {
    dog.remove();
  });
  
        let allCatCards = document.querySelectorAll(".cat-card");
    console.log(allCatCards);
  allCatCards.forEach(cat => {
    cat.remove();
  });
    //create dog images only
    showOnlyDogs();
    console.log("Refreshed"); 
    }
  //learn from W3school, Image Modal
  //showing a larger image once click on the animal bubble
    function showModal(){
    //get all the bubbles on the currrent page
     let allCatCards = document.querySelectorAll(".cat-card");
     let allDogCards = document.querySelectorAll(".dog-card");
    
    //apply changes to each of images
    allCatCards.forEach((card)=>{
  
    //give each bubble an eventlistener
  card.addEventListener("click", function(){
        // Get the modal
    let modal = document.getElementById('myModal');
  
  // Get the image and insert it inside the modal 
  let img = card.querySelector("#cat-image");
      console.log(img);
  let modalImg = document.getElementById("img01");
  let adopt = document.getElementById("adopt-button");
    //display modal
    modal.style.display = "block";
    //add link of the image to the empty modal image
    modalImg.src = img.src;
    modalImg.style.transform = "rotate(0deg)";
    //make sure the image not react to any other events and previous animations will no longer work 
    modalImg.style.pointerEvents = "none";
  
    // Get the element for modal closing
  let close = document.getElementsByClassName("close")[0];
  
  // When the user clicks on (x), close the modal
    close.addEventListener("click",function(){
        modal.style.display = "none";
    });
    //when the user clicks on adopt button, close the modal and lead to next page
  adopt.addEventListener("click",matchPage);
    function matchPage(){
      //display all elements from match-page
      let matchPage = document.querySelector("#match-page");
        matchPage.style.display = "block";
      //hide all things on current page
      let secondPage = document.querySelector('#second-page');
      document.body.removeChild(secondPage);
      close.style.display = "none";
      adopt.style.display = "none";
      document.querySelector("h1").style.display = "none";
      //change the image size
      modalImg.style.width = "130px";
      //adjust image position and add shodows and animations to the image
        modalImg.style.filter = "drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25))";
        modalImg.style.marginTop = "120px";
        modalImg.style.animation = "float 7s ease-in-out infinite";
      //set background color of modal to trasnparent and send it backward using z-index to ensure it doesn't cover new elments on the page
      modal.style.backgroundColor = "transparent";
        modal.style.zIndex = "-1";
  
    }
    })
    ;
  }); 
  
  //do the same thing as cat images to dog images
      allDogCards.forEach((card)=>{
  
      card.addEventListener("click", function(){
        // Get the modal
    let modal = document.getElementById('myModal');
  
  // Get the image and insert it inside the modal - use its "alt" text as a caption
  let img = card.querySelector("#dog-image");
      console.log(img);
  let modalImg = document.getElementById("img01");
  let adopt = document.getElementById("adopt-button");
    modal.style.display = "block";
    modalImg.src = img.src;
    modalImg.style.transform = "rotate(0deg)";
    modalImg.style.pointerEvents = "none";
  
    // Get the <span> element that closes the modal
  let close = document.getElementsByClassName("close")[0];
  
  // When the user clicks on  (x), close the modal
    close.addEventListener("click",function(){
        modal.style.display = "none";
    });
    
  adopt.addEventListener("click",matchPage);
      function matchPage(){
      let matchPage = document.querySelector("#match-page");
        matchPage.style.display = "block";
      let secondPage = document.querySelector('#second-page');
      document.body.removeChild(secondPage);
       close.style.display = "none";
      adopt.style.display = "none";
      modalImg.style.width = "130px";
        modalImg.style.filter = "drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25))";
        modalImg.style.marginTop = "120px";
        modalImg.style.animation = "float 7s ease-in-out infinite";
      modal.style.backgroundColor = "transparent";
        modal.style.zIndex = "-1";
        document.querySelector("h1").style.display = "none";
    }
    
    });
  }); 
    }
  
  //Friendship tester
  
  //find the enter button
  let enter = document.querySelector("#enter-button")
  
  //find input element
  let nameInput = document.querySelector("#name");
  
  
  //find the message element
  let message = document.querySelector("#message");
  
  
  //find the score element
  let score = document.querySelector("#score");
  
  
  //add a function to show the result image and score
  function showResult() {
    //generates a random number between 50-100
    function getRandNum(){
      let randNum = Math.floor(Math.random() * 50 + 50);
      //return the random number
      return randNum
  }
    //declare a variable to call the random number generator function and hold the return value
      let rand = getRandNum();
  
    //check the value
      console.log(rand);
    
      //assign user input value to a variable
      let name = nameInput.value;
      //display score in html
       score.innerHTML = `${rand}%`;
    
      //display screaming face if the number is between 0 -20
      if (rand >= 50 && rand <= 70){
        message.innerHTML = `Great opportunity to get to know  <strong><p style = "font-size:25px">${name}</p></strong> better! `;
      //display crying face if the number is between 20-40
       } else if(rand > 70 && rand <= 90){
        message.innerHTML = `Good chemistry between you and <strong><p style = "font-size:25px">${name}</p></strong>! `;
      //display neutral face if the number is between 40-60
       }else if(rand > 90 && rand <= 100){
        message.innerHTML = `You and <strong><p style = "font-size:25px">${name}</p></strong> are a perfect match! `;
      //display heart-eyes face if the number is between 60-80
       }//end conditionals
  } //end function
  
  
  //add event listener / call event handler for enter button
  enter.addEventListener("click",showResult); 
  
  //restart the game from the the first page
  let restart = document.querySelector("#restart-button");
  restart.addEventListener("click",function(){
    //reload the page
    location.reload();
  });
  }); //end of content loaded listener  