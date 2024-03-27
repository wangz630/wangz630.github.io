//using promises to handle asynchronous events and external data

//ready function
document.addEventListener("DOMContentLoaded", function() {
    //define an array to hold the slideshow data 
    let slideshow = [];
    //find the ul the slides will be written to 
    const slides = document.querySelector("#slides");
    
    //this example uses an external data file called portfolio.json
    const datafile = "portfolio.json";
    const request = new Request(datafile);
  
    //call the fetch method and store the response to a variable
    let response = fetch(datafile);
  
    //fetch returns a Promise which you can then handle with then() and catch(). When the request completes, a response object is returned
    fetch(request)
    .then(response => response.json())
    .then(console.log(response))
    .then(data => {
      //console.log(data)
      console.log(data.portfolio)
      for (const work of data.portfolio) {
        //create new li to hold slide content
        let slide = document.createElement('li');
        slide.classList.add("slide","fade");
        //set the content of the slide
        slide.innerHTML = `<div class="numbertext">${work.number} / 10</div><img src="${work.image}"><div class='text'><span class='title'>${work.title}</div>`;
      //append to the ul
      slides.appendChild(slide);
      }
  
  //learn from https://www.w3schools.com/howto/howto_js_slideshow.asp
    //store a value to variable
    let slideIndex = 1;

      
    //trigger a function 
    showSlides(slideIndex);

    // autoplay(slideIndex);
    // function autoplay() {
    //     plusSlides(1);
    //     setTimeout(autoplay, 10000);
    // }
      
    //get two buttons from html  
    let prev = document.querySelector(".prev");
    let next = document.querySelector(".next");
      
    //add event listener to each of the button  
    prev.addEventListener("click",function() {
      plusSlides(-1);
    });
      
    next.addEventListener("click",function() {
      plusSlides(1);
    });
      
  
  
  function plusSlides(n) {
      //change the value of slideIndex by + 1 or - 1 to it depending on which button you click (n can be + 1 or - 1)
     slideIndex = slideIndex + n;
    //show the next/previous slide
     showSlides(slideIndex);
  }
  
  
  function showSlides(n) {
    //grab all slides from html
    let allSlides = document.querySelectorAll(".slide");
    console.log(allSlides);
    //if you are on the last slide and want to move right to the next slide, show you first slide(set index value to 1 again) then
    if (n > allSlides.length) {slideIndex = 1} 
    //if you are on the first slide and want to move left to the previous slide, show you the last slide then
    if (n < 1) {slideIndex = allSlides.length}
    //hide all slide first
    for (i = 0; i < allSlides.length; i++) {
      allSlides[i].style.display = "none";  
    }
    //display one image in array based on the number of slide page (since index in array starts from 0, do slideIndex minus 1 to make sure we get the right number)
    allSlides[slideIndex-1].style.display = "block"; 
  }
  
      
    })
    .catch(console.error);
  
    window.onscroll = function() {scrollFunction()};

    function scrollFunction() {
      if (document.body.scrollTop > 500 || document.documentElement.scrollTop > 500) {
        document.getElementById("arrow").style.display = 'none' ;
        document.getElementById("scroll").style.display = 'none' ;
      } else{
        document.getElementById("arrow").style.display = 'block' ;
        document.getElementById("scroll").style.display = 'block' ;
      }
    }
  
  
  
  
  
  });
  
