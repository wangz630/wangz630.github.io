// var dragItem = document.querySelector("#item");
// var container = document.querySelector("#container");

// var active = false;
// var currentX;
// var currentY;
// var initialX;
// var initialY;
// var xOffset = 0;
// var yOffset = 0;

// dragItem.addEventListener("touchstart", dragStart, false);
// dragItem.addEventListener("touchend", dragEnd, false);
// container.addEventListener("touchmove", drag, false);

// dragItem.addEventListener("mousedown", dragStart, false);
// dragItem.addEventListener("mouseup", dragEnd, false);
// dragItem.addEventListener("mousemove", drag, false);

// function dragStart(e) {
//   if (e.type === "touchstart") {
//     initialX = e.touches[0].clientX - xOffset;
//     initialY = e.touches[0].clientY - yOffset;
//   } else {
//     initialX = e.clientX - xOffset;
//     initialY = e.clientY - yOffset;
//   }

//   if (e.target === dragItem) {
//     active = true;
//   }
// }

// function dragEnd(e) {
//   initialX = currentX;
//   initialY = currentY;

//   active = false;
// }

// function drag(e) {
//   if (active) {
  
//     e.preventDefault();
  
//     if (e.type === "touchmove") {
//       currentX = e.touches[0].clientX - initialX;
//       currentY = e.touches[0].clientY - initialY;
//     } else {
//       currentX = e.clientX - initialX;
//       currentY = e.clientY - initialY;
//     }

//     xOffset = currentX;
//     yOffset = currentY;

//     setTranslate(currentX, currentY, dragItem);
//   }
// }

// function setTranslate(xPos, yPos, el) {
//   el.style.transform = "translate3d(" + xPos + "px, " + yPos + "px, 0)";
// }

// chinese font from adobe 
(function(d) {
  var config = {
    kitId: 'owy4qqq',
    scriptTimeout: 3000,
    async: true
  },
  h=d.documentElement,t=setTimeout(function(){h.className=h.className.replace(/\bwf-loading\b/g,"")+" wf-inactive";},config.scriptTimeout),tk=d.createElement("script"),f=false,s=d.getElementsByTagName("script")[0],a;h.className+=" wf-loading";tk.src='https://use.typekit.net/'+config.kitId+'.js';tk.async=true;tk.onload=tk.onreadystatechange=function(){a=this.readyState;if(f||a&&a!="complete"&&a!="loaded")return;f=true;clearTimeout(t);try{Typekit.load(config)}catch(e){}};s.parentNode.insertBefore(tk,s)
})(document);

// prints a message in the browser's dev tools console
console.log("hello");

// click anywhere on the page, emoji will shows up
// the description also will shows up

function randomEmoji() {
return 'rgb(${Math.floor(Math.random()*256)}, ${Math.floor(Math.random()*256)},${Math.floor(Math.random()*256)})';
}

// emoji description 
// // array with initial values
const emojiList = [
  {
      emoji: '😢',
      description: '	嘿嘿'

  },
  {
      emoji: '😃',
      description: '哈哈'
  },
  {
      emoji: '🥳',
      description: '聚会笑脸'
  },
  {
      emoji: '👻',
      description: '鬼'
  },
  {
      emoji: '😫',
      description: '累死了'
  },
  {
      emoji: '😠',
      description: '生气'
  },
  {
      emoji: '😝',
      description: '吐舌'
  },
  {
      emoji: '🤪',
      description: '滑稽'
  },
  {
      emoji: '😱',
      description: '吓死了'
  },
  {
      emoji: '🥺',
      description: '喜笑颜开'
  },
  {
      emoji: '🥰',
      description: '喜笑颜开'
   }, 
  {
      emoji: '😂',
      description: '笑哭了'
  },
  {
      emoji: '🙄',
      description: '翻白眼'
  },
  {
      emoji: '🤩',
      description: '好崇拜哦'
  },
  {
      emoji: '🤡',
      description: '小丑脸'
  },
  {
      emoji: '🙏',
      description: '双手合十'
  },
  {
    emoji: '😘',
    description: '飞吻'
  },
  {
    emoji: '😪',
    description: '困'
  },
  {
    emoji: '👪',
    description: '家庭'
  },
  {
    emoji: '😲',
    description: '震惊'
  },
];


// var clickable = document.getElementById('container');
// var clickable = document.querySelector('p');
// clickable.addEventListener("click", function(e) {
// var emojiContainer = document.createElement("div");
// emojiContainer.classList.add('emoji-container');
// document.querySelector(".emoji-box").append(emojiContainer);
// var emoji = document.createElement('span');
// var description = document.createElement('description');
// var rand = Math.floor(Math.random() * emojiList.length);
// emoji.append(emojiList[rand].emoji);
// description.append(emojiList[rand].description);

// emojiContainer.style.position = "absolute";

// emojiContainer.style.emoji = randomEmoji();

// emojiContainer.style.left = e.pageX + "px";
// emojiContainer.style.top = e.pageY + "px";
// emojiContainer.style.transition = "all 0.9s";

// emojiContainer.append(emoji, description);

// setTimeout(function() {
//   emojiContainer.style.opacity = "1";
//   emojiContainer.style.transform = "translateY(-50px) scale(1.8)";
// }, 800);

// setTimeout(function() {
//   emojiContainer.style.opacity = "1";
//   emojiContainer.style.transform = "translateY(-100px) scale(0.8)";
// }, 800);


// });
var clickable = document.querySelector('p');
// clickable.addEventListener("click", function(e) {
// var emojiContainer = document.createElement("div");
// emojiContainer.classList.add('emoji-container');
// document.querySelector(".emoji-box").append(emojiContainer);
// emoji.style.left = (95*Math.random())+'%';
//   emoji.style.top=(95*Math.random()) +'%';
// })

var emojiContainer = document.querySelectorAll(".emoji-container");
emojiContainer.forEach((emoji)=>{
  emoji.style.left = (95*Math.random())+'%';
  emoji.style.top=(95*Math.random()) +'%';
})




// drag 
var dragItems = document.querySelectorAll(".emoji-container");




   var container = document.querySelector(".emoji-box");
    dragItems.forEach((dragItem)=>{
      // if(dragItem.classList.contains("pressed")){
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
   

//from bilibili-drag

// var box = document.getElementById("box");
// box.onmousedown = function(event) {
//   var event = event;
//   var pageX = event.pageX;
//   var pageY = event.pageY;
//   var boxX = pageX - box.offsetLeft;
//   var boxY = pageY - box.offsetTop;

//   document.onmousemove = function(event) {
//     var event = event;
  
//     var pageX = event.pageX;
//     var pageY = event.pageY;
//     box.style.left = pageX - boxX + "px";
//     box.style.top = pageY - boxY + "px";
//   }
// }
//   document.onmouseup = function() {
//     document.onmousemove = null;
//   }



// clear emoji button 
function myFunction() {
while (document.querySelectorAll('.emoji-container').length > 0) {
  document.querySelector('.emoji-container').remove();
}
}