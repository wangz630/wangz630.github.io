

window.addEventListener("load", function() { // make sure page is loaded
    'use strict';

    const items = document.querySelectorAll("li");

    items.forEach(item =>{

        const photo = item.querySelector('.image'),
              parent = item.parentElement;

        item.addEventListener("mousemove", function(event){
            photo.classList.add('active');
            parent.classList.add('active');

            const cursorX = event.pageX,
                  cursorY = event.pageY;

      const itemLeft = item.getBoundingClientRect().left,
            itemTop = item.getBoundingClientRect().top;

      const photoPositionX = cursorX - itemLeft,
            photoPositionY = cursorY - itemTop - window.scrollY;

      if(photo.offsetHeight + 40 > event.clientY){
          photo.style.top = `${photoPositionY + 20}px`;
      }else{
          photo.style.top = `${photoPositionY - photo.offsetHeight - 20}px`;
      }
      photo.style.left = `${photoPositionX - 100}px`;

        });
        item.addEventListener("mouseout", function(event){
            photo.classList.remove("active");
            parent.classList.remove('active');
        });
    });
  

    // var listName1 = document.querySelector("#core-2-studio-name") //get element from html
    var listName2 = document.querySelector("#core-2-lab-name")
    var listName3 = document.querySelector("#core-1-studio-project-name")
    var listName4 = document.querySelector("#website-name")
    var listName5 = document.querySelector("#uiux-name")
    var listName6 = document.querySelector("#thesis-name")
    var listName7 = document.querySelector("#typography-name")

    // var container1 = document.querySelector("#core-2-studio-project-container")
    var container2 = document.querySelector("#core-2-lab-project-container")
    var container3 = document.querySelector("#core-1-studio-project-container")
    var container4 = document.querySelector("#website-project-container")
    var container5 = document.querySelector("#uiux-project-container")
    var container6 = document.querySelector("#thesis-project-container")
    var container7 = document.querySelector("#typography-project-container")



            // listName1.addEventListener('click', function (){ //attach a click event to listName1
            //         if(container1.classList.contains("open")){ // examine if there is a class "open" in container1
            //             container1.classList.remove("open"); // delete the class
            //             document.querySelectorAll('.upwards-arrow')[0].style.display="none"; //remove the first upwards-arrow after clicking
            //             document.querySelectorAll('.downwards-arrow')[0].style.display="inline"; // shows the first downwards-arrow
            //     }else{
            //         container1.classList.add("open");  // add class "open" to container1
            //         document.querySelectorAll('.upwards-arrow')[0].style.display="inline";  // shows the upwards-arrow when the list is opened
            //         document.querySelectorAll('.downwards-arrow')[0].style.display="none"; // removes the downwards-arrow
            //         }
            // })

            listName2.addEventListener('click', function (){  // just repeate the provious code but only change the variables
                if(container2.classList.contains("open")){
                    container2.classList.remove("open");
                    document.querySelectorAll('.upwards-arrow')[1].style.display="none"; // the second element in class "upwards-arrow"
                    document.querySelectorAll('.downwards-arrow')[1].style.display="inline";
            }else{
                container2.classList.add("open");
                document.querySelectorAll('.upwards-arrow')[1].style.display="inline";
                document.querySelectorAll('.downwards-arrow')[1].style.display="none";
                }
        })

        
        listName3.addEventListener('click', function (){ // still repeate the previous code
            if(container3.classList.contains("open")){
                container3.classList.remove("open");
                document.querySelectorAll('.upwards-arrow')[2].style.display="none"; // the thrid element in class "upwards-arrow"
                document.querySelectorAll('.downwards-arrow')[2].style.display="inline";
        }else{
            container3.classList.add("open");
            document.querySelectorAll('.upwards-arrow')[2].style.display="inline";
            document.querySelectorAll('.downwards-arrow')[2].style.display="none";
            }
    }) 

    listName4.addEventListener('click', function (){ // still repeate the previous code
        if(container4.classList.contains("open")){
            container4.classList.remove("open");
            // document.querySelectorAll('.upwards-arrow')[3].style.display="none"; // the thrid element in class "upwards-arrow"
            // document.querySelectorAll('.downwards-arrow')[3].style.display="inline";
    }else{
        container4.classList.add("open");
        // document.querySelectorAll('.upwards-arrow')[3].style.display="inline";
        // document.querySelectorAll('.downwards-arrow')[3].style.display="none";
        }
}) 

listName5.addEventListener('click', function (){ 
    if(container5.classList.contains("open")){
        container5.classList.remove("open");
}else{
    container5.classList.add("open");
    }
}) 

listName6.addEventListener('click', function (){ 
    if(container6.classList.contains("open")){
        container6.classList.remove("open");
}else{
    container6.classList.add("open");
    }
}) 

listName7.addEventListener('click', function (){ 
    if(container7.classList.contains("open")){
        container7.classList.remove("open");
}else{
    container7.classList.add("open");
    }
}) 

        var container = document.querySelector('#ball-container') //get element from html

        for (let i = 0; i < 20; i++) {  // a 30-time loop
            let ball = document.createElement('div'); // create tag <div> in html
            ball.classList.add('ball');  // give it a class name "ball"
            ball.style.left = (90*Math.random())+'%'; // give it a random left value from 0% to 90%
            ball.style.top=(190*Math.random()) +'%';  // give it a random top value from 0% to 90%, and each time you refresh the page, the layout will change
            container.appendChild(ball); // attach child "ball" to ID #ball-container
          }


//explore
var images = ["work1.jpg","work2.jpg","work3.gif","work4.jpg","work5.png","work6.jpg","work7.jpg","work8.jpg","work9.jpg","work10.jpg"]



exploreview();

function exploreview(){

  var num = Math.floor( Math.random() * images.length)
  var image = images[num];
  console.log(image);
  var imageBox = document.querySelector(".image-box");
  imageBox.style.display = "block";
  imageBox.style.width =(100+500*Math.random())+'px';
  imageBox.style.height = imageBox.style.width;
  imageBox.style.left = (5+75*Math.random())+'%';
  imageBox.style.top=(5+60*Math.random()) +'%';
  imageBox.innerHTML = `<img class = "back" src="./project-image/${image}">`;
  document.querySelector(".image").style.opacity = "1"; 


setInterval(function(){

  var num = Math.floor( Math.random() * images.length)
  var image = images[num];
  console.log(image);
  var imageBox = document.querySelector(".image-box");
  imageBox.style.width =(200+300*Math.random())+'px';
  imageBox.style.height = (200+300*Math.random())+'px';
  imageBox.style.left = (5+75*Math.random())+'%';
  imageBox.style.top=(0+60*Math.random()) +'%';
  imageBox.style.opacity = "1";
  imageBox.innerHTML = `<img class = "back" src="./project-image/${image}">`;
  document.querySelector(".image").style.opacity = "1"; 
},3000)

imageBox.style.opacity = "0";


}


  
window.onscroll = function() {scrollFunction()};

function scrollFunction() {
  if (document.body.scrollTop > 300 || document.documentElement.scrollTop > 300) {
    document.getElementById("all-project-container").style.opacity = '1' ;
    document.querySelector(".arrow").style.opacity = '0' ;
    document.querySelector(".project").style.opacity = '0' ;

  } else{
    document.getElementById("all-project-container").style.opacity = '0' ;
    document.querySelector(".arrow").style.opacity = '1' ;
    document.querySelector(".project").style.opacity = '1' ;

  }
}

let description = document.querySelector(".description");
let thesisImage = document.querySelector(".thesis-cover");
thesisImage.addEventListener("mouseover",function(){
    description.style.opacity ="1";
    })
    thesisImage.addEventListener("mouseout",function(){
        description.style.opacity ="0";
        })

let logo = document.querySelector(".logo");
logo.addEventListener("click", function(){
    // window.location.href = "https://wangz630.github.io/";
        document.body.scrollTop = 0; // For Safari
        document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera

});



    })
    
