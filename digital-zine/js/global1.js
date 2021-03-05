window.addEventListener("load", function() {

  var width = window.innerWidth;

  function openNav() {
    if(width <=500){
        document.getElementById("sidenav").style.width = "150px";
        document.body.style.backgroundColor = "#979797";
        document.getElementById("menu").style.backgroundColor = "#979797";
    }
    else if(width >500 && width <= 1024){
        document.getElementById("sidenav").style.width = "200px";
        document.body.style.backgroundColor = "#979797";
        document.getElementById("menu").style.backgroundColor = "#979797";
    }
    else if(width >1024){
    document.getElementById("sidenav").style.width = "250px";
    document.body.style.backgroundColor = "#979797";
    document.getElementById("menu").style.backgroundColor = "#979797";
    }
  }
      
      function closeNav() {
        document.getElementById("sidenav").style.width = "0";
        document.getElementById("menu").style.marginLeft= "0";
        document.body.style.backgroundColor = "black";
        document.getElementById("menu").style.backgroundColor = "black";
      }

      var open = document.getElementById('open');
      var close = document.getElementById('close');

      open.addEventListener('click', openNav)
      close.addEventListener('click', closeNav);
})