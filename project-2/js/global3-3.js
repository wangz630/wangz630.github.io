window.addEventListener("load", function() {

window.onscroll = function() {scrollFunction()};

function scrollFunction() {
  if (document.body.scrollTop > 10 || document.documentElement.scrollTop > 10) {
    document.getElementById("text").style.fontSize = '8px' ;
    document.getElementById("text").style.width = '300px' ;
    document.getElementById("text").style.lineHeight = '30px' ;
  } 
  if (document.body.scrollTop > 150 || document.documentElement.scrollTop > 150) {
    document.getElementById("text").style.fontSize = '12px' ;
    document.getElementById("text").style.width = '400px' ;
    document.getElementById("text").style.lineHeight = '35px' ;
  } 
  if (document.body.scrollTop > 300 || document.documentElement.scrollTop > 300) {
    document.getElementById("text").style.fontSize = '18px' ;
    document.getElementById("text").style.width = '500px' ;
    document.getElementById("text").style.lineHeight = '40px' ;
  } 
  if (document.body.scrollTop > 450 || document.documentElement.scrollTop > 450) {
    document.getElementById("text").style.fontSize = '22px' ;
    document.getElementById("text").style.width = '600px' ;
    document.getElementById("text").style.lineHeight = '45px' ;
  }
  if (document.body.scrollTop > 600 || document.documentElement.scrollTop > 600) {
    document.getElementById("text").style.fontSize = '27px' ;
    document.getElementById("text").style.width = '700px' ;
    document.getElementById("text").style.lineHeight = '50px' ;
  }
  if (document.body.scrollTop > 750 || document.documentElement.scrollTop > 750) {
    document.getElementById("text").style.fontSize = '32px' ;
    document.getElementById("text").style.width = '800px' ;
    document.getElementById("text").style.lineHeight = '55px' ;
  }
  if (document.body.scrollTop > 900 || document.documentElement.scrollTop > 900) {
    document.getElementById("text").style.fontSize = '35px' ;
    document.getElementById("text").style.width = '900px' ;
    document.getElementById("text").style.lineHeight = '60px' ;
  }
  if (document.body.scrollTop > 1050 || document.documentElement.scrollTop > 1050) {
    document.getElementById("text").style.fontSize = '39px' ;
    document.getElementById("text").style.width = '1000px' ;
    document.getElementById("text").style.lineHeight = '65px' ;
  }
  if (document.body.scrollTop > 1200 || document.documentElement.scrollTop > 1200) {
    document.getElementById("text").style.fontSize = '42px' ;
    document.getElementById("text").style.width = '1100px' ;
    document.getElementById("text").style.lineHeight = '70px' ;
  }
  if (1350 < document.body.scrollTop > 1400||1350 < document.documentElement.scrollTop > 1400) {
    document.getElementById("text").style.fontSize = '45px' ;
    document.getElementById("text").style.width = '1200px' ;
    document.getElementById("text").style.lineHeight = '75px' ;
  }
}

})