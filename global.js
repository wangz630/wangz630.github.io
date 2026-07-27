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
    var waList = document.querySelector("#wa-name")
    var vgaList = document.querySelector("#vga-name")
    var typoList = document.querySelector("#typo-name")
    var webexList = document.querySelector("#webex-name")
    
    // var listName2 = document.querySelector("#core-2-lab-name")
    // var listName3 = document.querySelector("#core-1-studio-project-name")
    // var listName4 = document.querySelector("#website-name")
    // var listName5 = document.querySelector("#uiux-name")
    // var listName6 = document.querySelector("#thesis-name")
    // var listName7 = document.querySelector("#typography-name")

    // var container1 = document.querySelector("#core-2-studio-project-container")
    var waContainer = document.querySelector("#wa-container")
    var vgaContainer = document.querySelector("#vga-container")
    var typoContainer = document.querySelector("#typo-container")
    var wcContainer = document.querySelector("#wc-container")
    var webexContainer = document.querySelector("#webex-container")

    // var container2 = document.querySelector("#core-2-lab-project-container")
    // var container3 = document.querySelector("#core-1-studio-project-container")
    // var container4 = document.querySelector("#website-project-container")
    // var container5 = document.querySelector("#uiux-project-container")
    // var container6 = document.querySelector("#thesis-project-container")
    // var container7 = document.querySelector("#typography-project-container")


//             listName2.addEventListener('click', function (){  // just repeate the provious code but only change the variables
//                 if(container2.classList.contains("open")){
//                     container2.classList.remove("open");
//                     document.querySelectorAll('.upwards-arrow')[1].style.display="none"; // the second element in class "upwards-arrow"
//                     document.querySelectorAll('.downwards-arrow')[1].style.display="inline";
//             }else{
//                 container2.classList.add("open");
//                 document.querySelectorAll('.upwards-arrow')[1].style.display="inline";
//                 document.querySelectorAll('.downwards-arrow')[1].style.display="none";
//                 }
//         })

        
//         listName3.addEventListener('click', function (){ // still repeate the previous code
//             if(container3.classList.contains("open")){
//                 container3.classList.remove("open");
//                 document.querySelectorAll('.upwards-arrow')[2].style.display="none"; // the thrid element in class "upwards-arrow"
//                 document.querySelectorAll('.downwards-arrow')[2].style.display="inline";
//         }else{
//             container3.classList.add("open");
//             document.querySelectorAll('.upwards-arrow')[2].style.display="inline";
//             document.querySelectorAll('.downwards-arrow')[2].style.display="none";
//             }
//     }) 

//     listName4.addEventListener('click', function (){ // still repeate the previous code
//         if(container4.classList.contains("open")){
//             container4.classList.remove("open");
//             // document.querySelectorAll('.upwards-arrow')[3].style.display="none"; // the thrid element in class "upwards-arrow"
//             // document.querySelectorAll('.downwards-arrow')[3].style.display="inline";
//     }else{
//         container4.classList.add("open");
//         // document.querySelectorAll('.upwards-arrow')[3].style.display="inline";
//         // document.querySelectorAll('.downwards-arrow')[3].style.display="none";
//         }
// }) 

// listName5.addEventListener('click', function (){ 
//     if(container5.classList.contains("open")){
//         container5.classList.remove("open");
// }else{
//     container5.classList.add("open");
//     }
// }) 

// listName6.addEventListener('click', function (){ 
//     if(container6.classList.contains("open")){
//         container6.classList.remove("open");
// }else{
//     container6.classList.add("open");
//     }
// }) 

// listName7.addEventListener('click', function (){ 
//     if(container7.classList.contains("open")){
//         container7.classList.remove("open");
// }else{
//     container7.classList.add("open");
//     }
// })


waList.addEventListener('click', function (){
    if(waContainer.classList.contains("open")){
        waContainer.classList.remove("open");
}else{
    waContainer.classList.add("open");
    }
})
vgaList.addEventListener('click', function (){
    if(vgaContainer.classList.contains("open")){
        vgaContainer.classList.remove("open");
}else{
    vgaContainer.classList.add("open");
    }
})
typoList.addEventListener('click', function (){
    if(typoContainer.classList.contains("open")){
        typoContainer.classList.remove("open");
}else{
    typoContainer.classList.add("open");
    }
})
webexList.addEventListener('click', function (){
    if(webexContainer.classList.contains("open")){
        webexContainer.classList.remove("open");
        wcContainer.classList.remove("open");
}else{
    webexContainer.classList.add("open");
    wcContainer.classList.add("open");
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


//explore — thumbnails from the Website & Application and Typography sections
var images = [
    // Website & Application
    "Vicino Cover Image.png", "route-app.png", "artisk-cover.jpg", "empower.png", "greatlake.png",
    "puzzle.png", "work21.jpeg", "scene07.jpg", "work4.jpeg", "atomo.gif",
    "work12.jpg", "work13.jpg", "kindle.png", "dating.png",
    // Typography & Graphics
    "sunawear1.jpg", "work16.jpg", "work17.jpg", "work19.jpg"
]



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


//scroll
// window.onscroll = function() {scrollFunction()};

// function scrollFunction() {
//   if (document.body.scrollTop > 1000 || document.documentElement.scrollTop > 1000) {
//     document.getElementById("all-project-container").style.opacity = '1' ;
//     document.querySelector(".arrow").style.opacity = '0' ;
//     document.querySelector(".project").style.opacity = '0' ;

//   } else{
//     document.getElementById("all-project-container").style.opacity = '0' ;
//     document.querySelector(".arrow").style.opacity = '1' ;
//     document.querySelector(".project").style.opacity = '1' ;

//   }
// }

// let description = document.querySelector(".description");
// let thesisImage = document.querySelector(".thesis-cover");
// thesisImage.addEventListener("mouseover",function(){
//     description.style.opacity ="1";
//     })
//     thesisImage.addEventListener("mouseout",function(){
//         description.style.opacity ="0";
//         })

let logo = document.querySelector(".logo");
logo.addEventListener("click", function(){
    // window.location.href = "https://wangz630.github.io/";
        document.body.scrollTop = 0; // For Safari
        document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera

});

// fade the scroll hint out once the user starts scrolling down
let scrollHint = document.querySelector(".scroll-hint");
if (scrollHint) {
    window.addEventListener("scroll", function () {
        let scrolled = document.body.scrollTop > 150 || document.documentElement.scrollTop > 150;
        scrollHint.classList.toggle("hidden", scrolled);
    });
}

// "Projects" nav → smooth-scroll to the Website & Application section
let projectsNav = document.querySelector("#projectsNav");
if (projectsNav) {
    projectsNav.addEventListener("click", function (e) {
        e.preventDefault();
        let target = document.querySelector("#wa-name");
        if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
}

// smooth letter-by-letter reveal for the name + subtitle on the home screen
(function () {
    let h1 = document.querySelector("h1");
    let h2 = document.querySelector("h2");
    if (!h1 || !h2) return;
    let reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return; // leave the original text as-is

    function makeChars(container, text, bold) {
        let spans = [];
        for (let i = 0; i < text.length; i++) {
            let s = document.createElement("span");
            s.className = "tw-char" + (bold ? " zi" : "");
            s.textContent = text[i] === " " ? " " : text[i];
            s.style.display = "inline-block";
            s.style.opacity = "0";
            s.style.transform = "translateY(0.42em)";
            s.style.filter = "blur(4px)";
            s.style.transition =
                "opacity 0.55s ease, transform 0.6s cubic-bezier(0.2, 0.9, 0.25, 1), filter 0.55s ease";
            s.style.willChange = "opacity, transform, filter";
            container.appendChild(s);
            spans.push(s);
        }
        return spans;
    }

    let h2Text = h2.textContent;
    h1.innerHTML = "";
    h2.textContent = "";

    let chars = [];
    [["I'm ", false], ["Zi Wang", true], [".", false]].forEach(function (seg) {
        chars = chars.concat(makeChars(h1, seg[0], seg[1]));
    });
    let h1Count = chars.length;
    chars = chars.concat(makeChars(h2, h2Text, false));

    chars.forEach(function (s, i) {
        // small extra beat between the name and the subtitle
        let delay = 180 + i * 40 + (i >= h1Count ? 160 : 0);
        setTimeout(function () {
            s.style.opacity = "1";
            s.style.transform = "none";
            s.style.filter = "none";
        }, delay);
    });
})();

// scroll-reveal: section titles and project cards fade up as they enter view
(function () {
    let headings = document.querySelectorAll("#main-container h4");
    let cards = document.querySelectorAll(
        "#wa-container > div, #typo-container > div, #vga-container > div, #wc-container > div"
    );
    headings.forEach(function (el) { el.classList.add("reveal"); });
    cards.forEach(function (el, i) {
        el.classList.add("reveal");
        // gentle stagger within each row
        el.style.transitionDelay = (i % 4) * 70 + "ms";
    });

    if (!("IntersectionObserver" in window)) {
        // no support: just show everything
        headings.forEach(function (el) { el.classList.add("revealed"); });
        cards.forEach(function (el) { el.classList.add("revealed"); });
        return;
    }
    let io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add("revealed");
                io.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });

    headings.forEach(function (el) { io.observe(el); });
    cards.forEach(function (el) { io.observe(el); });
})();

// arriving from a project's back button (#p-...) → locate that project card
(function () {
    var hash = window.location.hash;
    if (!hash || hash.indexOf("#p-") !== 0) return;
    var target = document.querySelector(hash);
    if (!target) return;
    // make sure the card (and its section) are visible, then scroll to it
    var section = target.closest("#wa-container, #vga-container, #typo-container, #wc-container");
    if (section) section.classList.add("open");
    target.classList.add("revealed");
    setTimeout(function () {
        target.scrollIntoView({ behavior: "auto", block: "center" });
    }, 80);
})();



    })
    
