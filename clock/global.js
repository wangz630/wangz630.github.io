import { utcToZonedTime } from 'date-fns-tz';

class Clock {
    constructor(el){
        this.clockEl = el;
        this.UI = {};
        this.initializeClock();
    }


    updateClock = () => {
        //getting time
        const date = new Date();
        const now = utcToZonedTime(date, this.clockEl.dataset.locale);
        const seconds = (now.getSeconds() + now.getMilliseconds()/1000) / 60 * 360
        const minutes = now.getMinutes() / 60 * 360
        const hours = now.getHours() / 12 * 360
        //UI Update
        this.UI.am_pm.textContent= now.getHours() > 12 ? 'PM' : 'AM';
        this.UI.second.style.transform = `rotate(${seconds}deg)`;
        this.UI.minute.style.transform = `rotate(${minutes}deg)`;
        this.UI.hour.style.transform = `rotate(${hours}deg)`;
        requestAnimationFrame(this.updateClock)
    }

    initializeClock() {
        this.clockEl.innerHTML = `  <svg class="clockface" width="300" height="300" viewBox="-150 -150 300 300">     
        <circle class="ring ring--minutes" r="145" pathlength="60"/>
        <circle class="ring ring--hours" r="145" pathlength="12"/>
        <circle class="ring ring--center" r="3" />
         <text x="50" y="10" class="am-pm">AM</text>
        <line class="hand hand--minute" x1="0" y1="2" x2="0" y2="-110" />
        <line class="hand hand--hour" x1="0" y1="2" x2="0" y2="-60" />  
        <line class="hand hand--second" x1="0" y1="12" x2="0" y2="-130" /> 
      </svg> `
      this.UI.am_pm = this.clockEl.querySelector('.am-pm');
      this.UI.second =this.clockEl.querySelector('.hand--second');
      this.UI.minute =this.clockEl.querySelector('.hand--minute');
      this.UI.hour = this.clockEl.querySelector('.hand--hour');
      requestAnimationFrame(this.updateClock)
    } 
}

const clocks = document.querySelectorAll('.clock');
clocks.forEach(el => new Clock(el));

var clock1 = document.querySelector(".clock1");
var clock2 = document.querySelector(".clock2");
var clock3 = document.querySelector(".clock3");
var clock4 = document.querySelector(".clock4");
var clock5 = document.querySelector(".clock5");
var clock6 = document.querySelector(".clock6");
var clock7 = document.querySelector(".clock7");
var clock8 = document.querySelector(".clock8");
var clock9 = document.querySelector(".clock9");

var name1 = document.querySelector(".name1");
var name2 = document.querySelector(".name2");
var name3 = document.querySelector(".name3");
var name4 = document.querySelector(".name4");
var name5 = document.querySelector(".name5");
var name6 = document.querySelector(".name6");
var name7 = document.querySelector(".name7");
var name8 = document.querySelector(".name8");
var name9 = document.querySelector(".name9");


name1.addEventListener("click", function(){
    clocks.forEach((clock) => {
        clock.style.display = "none";
    });
    clock1.style.display = "block";
});

name2.addEventListener("click", function(){
    clocks.forEach((clock) => {
        clock.style.display = "none";
    });
    clock2.style.display = "block";
});

name3.addEventListener("click", function(){
    clocks.forEach((clock) => {
        clock.style.display = "none";
    });
    clock3.style.display = "block";
});

name4.addEventListener("click", function(){
    clocks.forEach((clock) => {
        clock.style.display = "none";
    });
    clock4.style.display = "block";
});

name5.addEventListener("click", function(){
    clocks.forEach((clock) => {
        clock.style.display = "none";
    });
    clock5.style.display = "block";
});


name6.addEventListener("click", function(){
    clocks.forEach((clock) => {
        clock.style.display = "none";
    });
    clock6.style.display = "block";
});


name7.addEventListener("click", function(){
    clocks.forEach((clock) => {
        clock.style.display = "none";
    });
    clock7.style.display = "block";
});

name8.addEventListener("click", function(){
    clocks.forEach((clock) => {
        clock.style.display = "none";
    });
    clock8.style.display = "block";
});

name9.addEventListener("click", function(){
    clocks.forEach((clock) => {
        clock.style.display = "none";
    });
    clock9.style.display = "block";
});











