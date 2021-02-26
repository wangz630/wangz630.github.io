window.addEventListener("load", function() {

window.onscroll = function() {scrollFunction()};

function scrollFunction() {
  if (document.body.scrollTop > 10 || document.documentElement.scrollTop > 10) {
    document.getElementById("text").style.color = 'black' ;
  } 
  if (document.body.scrollTop > 100 || document.documentElement.scrollTop > 100) {
    document.getElementById("text").style.color = '#4e4e4e' ;
  } 
  if (document.body.scrollTop > 200 || document.documentElement.scrollTop > 200) {
    document.getElementById("text").style.color = '#636363';
  }
  if (document.body.scrollTop > 300 || document.documentElement.scrollTop > 300) {
    document.getElementById("text").style.color = '#8d8d8d';
  }
  if (document.body.scrollTop > 400 || document.documentElement.scrollTop > 400) {
    document.getElementById("text").style.color = '#bbbbbb';
  }
  if (document.body.scrollTop > 500 || document.documentElement.scrollTop > 500) {
    document.getElementById("text").style.color = '#e4e4e4';
  }
  if (document.body.scrollTop > 600 || document.documentElement.scrollTop > 500) {
    document.getElementById("text").style.color = '#ebebeb';
  }
  if (document.body.scrollTop > 700 || document.documentElement.scrollTop > 500) {
    document.getElementById("text").style.color = '#ffffff';
  }
}

})