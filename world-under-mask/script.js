
//load content
document.addEventListener("DOMContentLoaded", function() {
    console.log("content loaded");

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
  for(let i=0;i<400;i++) {
    star = new THREE.Vector3(
      Math.random() * 600 - 300,
      Math.random() * 600 - 300,
      Math.random() * 600 - 300
    );
    star.velocity = 0;
    star.acceleration = 0.02;
    starGeo.vertices.push(star);
  }

  let sprite = new THREE.TextureLoader().load( 'images/square.png' );
  let starMaterial = new THREE.PointsMaterial({
    color: 0xaaaaaa,
    transparent: true,
    opacity:0.2,
    size: 15,
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

    let particleContainer = document.querySelector("#particle-container");
    let rotateFace = document.querySelector(".rotate_02");
    // rotateFace.addEventListener("mouseover",function(){

      
    //     let particle = document.createElement("div");
    //     particle.classList.add("particle");
    //     particle.innerHTML = `<img src="images/smile.png">`;
    //     particleContainer.append(particle);
    //     particle.style.left = (5+90*Math.random())+'%';
    //     particle.style.top = (20+60*Math.random()) +'%';
    //     particle.style.animationDelay = (2*Math.random()) + 's';
    //     setInterval(1000);
        

    // })
    rotateFace.addEventListener("click", function(){
        rotateFace.remove();
        showHomepage();
    });

    // let colorBox = ["#BBA144", "#368F7F", "#365A8F", "#6E368F","#8F3656"];

    // document.body.addEventListener("mousemove", function(){
    //     document.body.style.backgroundColor = `${colorBox[Math.floor(Math.random() * colorBox.length)]}`;
    // });
    
    function showHomepage(){
        let title = document.querySelector("h1");
        let sidePixel = document.querySelector(".pixel");
        let arrow = document.querySelector(".arrow");
        let roundedText = document.querySelector(".rounded-text");
        title.style.display = "inline";
        // sidePixel.style.display = "block";
        arrow.style.display = "block";
        roundedText.style.display = "block";
    }

    //mouse trail
    document.addEventListener("mousemove", function(e){
        let body = document.querySelector('body');
        let face = document.createElement('span');
        face.classList.add('face');
        let x = e.offsetX;
        let y = e.offsetY;
        face.style.left = x+'px';
        face.style.top = y+'px';
        let size = Math.random()* 60;
        face.style.width = size+'px';
        face.style.height = size+'px';
        body.appendChild(face);

        setTimeout(function(){
            face.remove();
        },2000)
    });

    let text = document.querySelector('.rounded-text');
    text.innerHTML = text.textContent.replace(/\S/g,"<span class='text'>$&</span>");
    let ele = document.querySelectorAll('.text');
    for(let i = 1; i<ele.length;i++){
        ele[i].style.transform = "rotate("+i*23+"deg)";
    }
  

  }); //end of content loaded listener
  
  
  
  