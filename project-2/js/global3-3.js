window.addEventListener("load", function() {

window.onscroll = function() {scrollFunction()};

function scrollFunction() {
  if (document.body.scrollTop > 10 || document.documentElement.scrollTop > 10) {
    document.getElementById("text").style.fontSize = '8px' ;
    document.getElementById("text").style.width = '300px' ;
  } 
  if (document.body.scrollTop > 50 || document.documentElement.scrollTop > 50) {
    document.getElementById("text").style.fontSize = '12px' ;
    document.getElementById("text").style.width = '400px' ;
  } 
  if (document.body.scrollTop > 150 || document.documentElement.scrollTop > 150) {
    document.getElementById("text").style.fontSize = '18px' ;
    document.getElementById("text").style.width = '500px' ;
  } 
  if (document.body.scrollTop > 250 || document.documentElement.scrollTop > 250) {
    document.getElementById("text").style.fontSize = '22px' ;
    document.getElementById("text").style.width = '600px' ;
  }
  if (document.body.scrollTop > 350 || document.documentElement.scrollTop > 350) {
    document.getElementById("text").style.fontSize = '27px' ;
    document.getElementById("text").style.width = '700px' ;
  }
  if (document.body.scrollTop > 450 || document.documentElement.scrollTop > 450) {
    document.getElementById("text").style.fontSize = '32px' ;
    document.getElementById("text").style.width = '800px' ;
  }
  if (document.body.scrollTop > 550 || document.documentElement.scrollTop > 550) {
    document.getElementById("text").style.fontSize = '35px' ;
    document.getElementById("text").style.width = '900px' ;
  }
  if (document.body.scrollTop > 650 || document.documentElement.scrollTop > 650) {
    document.getElementById("text").style.fontSize = '39px' ;
    document.getElementById("text").style.width = '1000px' ;
  }
  if (document.body.scrollTop > 750 || document.documentElement.scrollTop > 750) {
    document.getElementById("text").style.fontSize = '39px' ;
    document.getElementById("text").style.width = '1000px' ;
  }
  if (document.body.scrollTop > 850 || document.documentElement.scrollTop > 850) {
    document.getElementById("text").style.fontSize = '42px' ;
    document.getElementById("text").style.width = '1100px' ;
  }
}

})