
        //getting time
        // const date = new Date();
        // const now = utcToZonedTime(date, this.clockEl.dataset.locale);
       
        var clock = document.querySelector(".myClock");
        //UI Update
            var second1 = document.querySelector(".hand--second1");
            var minute1 =document.querySelector(".hand--minute1");
            var hour1 = document.querySelector(".hand--hour1");
    


        function dragHand() {
          
                var active = false;
                var currentX;
                var currentY;
                var initialX;
                var initialY;
                var xOffset = 0;
                var yOffset = 0;
            
                document.body.addEventListener("touchstart", dragStart, false);
                document.body.addEventListener("touchend", dragEnd, false);
                document.body.addEventListener("touchmove", drag, false);
                document.body.addEventListener("mousedown", dragStart, false);
                document.body.addEventListener("mouseup", dragEnd, false);
                document.body.addEventListener("mousemove", drag, false);
            
                function dragStart(e) {
                  if (e.type === "touchstart") {
                    initialX = e.touches[0].clientX - xOffset;
                    initialY = e.touches[0].clientY - yOffset;
                  } else {
                    initialX = e.clientX - xOffset;
                    initialY = e.clientY - yOffset;
                  }
            
                  if (e.target === document.body|| clock) {
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
                    second1.style.transform = "rotate(" + xPos/60*360 + "deg)";
                    minute1.style.transform = "rotate(" + xPos/3600*360 + "deg)";
                    hour1.style.transform = "rotate(" + xPos/21600*360 + "deg)";
                  }
            
    
          }

          dragHand();


    const UI = {
      second: document.querySelector('.hand--second'),
      minute: document.querySelector('.hand--minute'),
      hour: document.querySelector('.hand--hour'),
    }
        
        
            function updateClock() {
                //getting time
                const now = new Date();
                const seconds = (now.getSeconds() + now.getMilliseconds()/1000) / 60 * 360
                const minutes = now.getMinutes() / 60 * 360
                const hours = now.getHours() / 12 * 360
                //UI Update
                UI.second.style.transform = `rotate(${seconds}deg)`;
                UI.minute.style.transform = `rotate(${minutes}deg)`;
                UI.hour.style.transform = `rotate(${hours}deg)`;
                requestAnimationFrame(updateClock)
            }
            requestAnimationFrame(updateClock)

var clock1 = document.querySelector('.clock1');         

document.querySelector('.worldClockText').addEventListener('click', switchToWorldClock)

          function switchToWorldClock(){
            clock.style.display = "none";
            clock1.style.display = "block";
            document.querySelector('.myClockText').style.opacity = ".2";
            document.querySelector('.worldClockText').style.opacity = "1";
            document.querySelector('.name1').style.opacity = "0";
          }

          document.querySelector('.myClockText').addEventListener('click', switchToMyClock)
          function switchToMyClock(){
            clock1.style.display = "none";
            clock.style.display = "block";
            document.querySelector('.worldClockText').style.opacity = ".2";
            document.querySelector('.myClockText').style.opacity = "1";
            document.querySelector('.name1').style.opacity = "1";
          }

