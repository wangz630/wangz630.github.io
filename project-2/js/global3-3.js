window.addEventListener("load", function() {

window.onscroll = function() {scrollFunction()};

function scrollFunction() {
  if (document.body.scrollTop > 10 || document.documentElement.scrollTop > 10) {
    document.getElementById("text").style.fontSize = '1em' ;
  } 
  if (document.body.scrollTop > 100 || document.documentElement.scrollTop > 100) {
    document.getElementById("text").style.fontSize = '2em' ;
  } 
  if (document.body.scrollTop > 200 || document.documentElement.scrollTop > 200) {
    document.getElementById("text").style.fontSize = '3em' ;
  }
  if (document.body.scrollTop > 300 || document.documentElement.scrollTop > 300) {
    document.getElementById("text").style.fontSize = '4em' ;
  }
  if (document.body.scrollTop > 400 || document.documentElement.scrollTop > 400) {
    document.getElementById("text").style.fontSize = '5em' ;
  }
  if (document.body.scrollTop > 500 || document.documentElement.scrollTop > 500) {
    document.getElementById("text").style.fontSize = '6em' ;
  }
}

})