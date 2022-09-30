//galaxy background generator
let scene, camera, renderer, stars, starGeo;

function init() {

  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(60,window.innerWidth / window.innerHeight, 1, 1000);
  camera.position.z = 1;
  camera.rotation.x = Math.PI/2;

  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  starGeo = new THREE.Geometry();
  for(let i=0;i<6000;i++) {
    star = new THREE.Vector3(
      Math.random() * 600 - 300,
      Math.random() * 600 - 300,
      Math.random() * 600 - 300
    );
    star.velocity = 0;
    star.acceleration = 0.02;
    starGeo.vertices.push(star);
  }

  let sprite = new THREE.TextureLoader().load( 'star.png' );
  let starMaterial = new THREE.PointsMaterial({
    color: 0xaaaaaa,
    size: 0.5,
    map: sprite
  });

  stars = new THREE.Points(starGeo,starMaterial);
  scene.add(stars);

  window.addEventListener("resize", onWindowResize, false);

  animate(); 
}
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }
function animate() {
  starGeo.vertices.forEach(p => {
    p.velocity += p.acceleration
    p.y -= p.velocity;
    
    if (p.y < -200) {
      p.y = 200;
      p.velocity = 0;
    }
  });
  starGeo.verticesNeedUpdate = true;
  stars.rotation.y +=0.002;

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
init();


//background dragging interaction
var draggingSpace = document.body;
function drag() {
          
    var active = false;
    var currentX;
    var currentY;
    var initialX;
    var initialY;
    var xOffset = 0;
    var yOffset = 0;

    draggingSpace.addEventListener("touchstart", dragStart, false);
    draggingSpace.addEventListener("touchend", dragEnd, false);
    draggingSpace.addEventListener("touchmove", drag, false);
    draggingSpace.addEventListener("mousedown", dragStart, false);
    draggingSpace.addEventListener("mouseup", dragEnd, false);
    draggingSpace.addEventListener("mousemove", drag, false);

    function dragStart(e) {
      if (e.type === "touchstart") {
        initialX = e.touches[0].clientX - xOffset;
        initialY = e.touches[0].clientY - yOffset;
      } else {
        initialX = e.clientX - xOffset;
        initialY = e.clientY - yOffset;
      }

      if (e.target === document.body|| document.querySelector(".swiper")||document.querySelectorAll("img")) {
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

        setRotate(currentX);
      }
    }


    function setRotate(xPos) {
        stars.rotation.y +=xPos;
      }


}

drag();



//NFT generator

// let sentence = "SATELLITE";
// let sentenceArray = [];

// let r1 = 40;
// let theta = 0;

// function setup() {
//   createCanvas(400, 500);
//   sentenceArray = sentence.split('');
//   console.log(sentenceArray);
//   textStyle(BOLDITALIC);
// }

// function draw() {
//   background(0, 4, 130);
//   fill(0, 0, 220);
//   noStroke();
//   ellipse(400,200,200,400);
//   ellipse(0,300,200,400);
//   textSize(37);
//   fill(0, 4, 255);
    
//   for(i=0;i<20;i+=1){
    
//     text("S  A  T  E  L  L  I  T  E", i*2, i*40);
//   }
  
//   translate(width/2, height/2);
  
  
//   let x = r1*cos(theta);
//   let y = r1*sin(theta);
  
//   theta += 0.01;
  
//   textSize(12);
  
//   function mouseDragged(){
//       for(let i = 0; i<sentenceArray.length;i++){
//     rotate(QUARTER_PI/1.25);
//     push();
//     translate(x, y);
//     rotate(PI);
//     fill(255, 251, 235);
//     text(sentenceArray[i],0,0);
//     pop();
//   }
  
//  for(let i = 0; i<sentenceArray.length;i++){
//     fill(255, 251, 235);
//     text(sentenceArray[i],x*i,y-20);
//   }
  
//   for(let i = 0; i<sentenceArray.length;i++){
//     fill(255, 251, 235);
//     text(sentenceArray[i],-x*i,y-20);
    
//  for(let i = 0; i<sentenceArray.length;i++){
//     fill(255, 251, 235);
//     text(sentenceArray[i],x*i*0.9,y);
//   }
  
//   for(let i = 0; i<sentenceArray.length;i++){
//     fill(255, 251, 235);
//     text(sentenceArray[i],-x*i*0.9,y);
    
//      for(let i = 0; i<sentenceArray.length;i++){
//     fill(255, 251, 235);
//     text(sentenceArray[i],x*i,y+20);
//   }
  
//   for(let i = 0; i<sentenceArray.length;i++){
//     fill(255, 251, 235);
//     text(sentenceArray[i],-x*i,y+20);
//   }
// }
//   }
//   }
// mouseDragged();

// }


//swiping gallery
var swiper = new Swiper(".mySwiper", {
  effect: "coverflow",
  grabCursor: true,
  centeredSlides: true,
  slidesPerView: "auto",
  coverflowEffect: {
    rotate: 50,
    stretch: 0,
    depth: 100,
    modifier: 1,
    slideShadows: true,
  },
  loop: true,
  autoplay: {
    delay: 700,
    disableOnInteraction: false,
  },
});



var slides = document.querySelectorAll(".swiper-slide");



slides.forEach((slide)=>{


  slide.addEventListener("mouseover", showTitle);
  slide.addEventListener("mouseout", hideTitle);

  function showTitle(){
    var title = slide.querySelector("h1");
    title.style.opacity = "1";
  }

  function hideTitle(){
    var title = slide.querySelector("h1");
    title.style.opacity = "0";
  }


})

var gallery = document.querySelector("#gallery-button");
gallery.style.color = "#8a2be2";

gallery.addEventListener("click", galleryview);

function galleryview(){
  gallery.style.color = "blueviolet";
  explore.style.color = "white";
  document.querySelector(".image-box").style.display = "none";
  slides.forEach((slide)=>{
    slide.style.display = "block";
  })
  
  

  
}



//explore
var images = ["image-1.gif","image-2.gif","image-3.png","image-4.gif","image-5.svg","image-6.png","image-7.png","image-8.png","image-9.gif","image-10.png"]
var names = ["0xy Utility Token #10","8OD","HALLOWEEN LOBBY","Kitaro World #1581","Level 13 at {46, 13}","MEDUSA GORGON LOBBY","Mint Pass #815","Skyblock Spawn - Organic","UNDW3 Lacoste","We All Survived Death #4475"];


var explore = document.querySelector("#explore-button");

explore.addEventListener("click", exploreview);

function exploreview(){
  explore.style.color = "blueviolet";
  gallery.style.color = "white";
  var slides = document.querySelectorAll(".swiper-slide");
  slides.forEach((slide)=>{
    slide.style.display = "none"
  })

  var num = Math.floor( Math.random() * images.length)
  var image = images[num];
  var name = names[num];
  console.log(image);
  var imageBox = document.querySelector(".image-box");
  imageBox.style.display = "block";
  imageBox.style.width =(50+200*Math.random())+'px';
  imageBox.style.height = imageBox.style.width;
  imageBox.style.left = (5+75*Math.random())+'%';
  imageBox.style.top=(5+60*Math.random()) +'%';
  imageBox.innerHTML = `<img class = "image" src="./images/${image}"><br><h1 class = "name">${name}</h1>`;
  document.querySelector(".image").style.opacity = "1"; 


setInterval(function(){

  var num = Math.floor( Math.random() * images.length)
  var image = images[num];
  var name = names[num];
  console.log(image);
  var imageBox = document.querySelector(".image-box");
  imageBox.style.width =(50+200*Math.random())+'px';
  imageBox.style.height = imageBox.style.width;
  imageBox.style.left = (5+75*Math.random())+'%';
  imageBox.style.top=(5+60*Math.random()) +'%';
  imageBox.style.opacity = "1";
  imageBox.innerHTML = `<img class = "image" src="./images/${image}"><br><h1 class = "name">${name}</h1>`;
  document.querySelector(".image").style.opacity = "1"; 
},3000)

imageBox.style.opacity = "0";


}



















