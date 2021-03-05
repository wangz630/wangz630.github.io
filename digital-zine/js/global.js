window.addEventListener("load", function() {

    function openNav() {
            document.getElementById("sidenav").style.width = "150px";
            document.body.style.backgroundColor = "#979797";
            document.getElementById("menu").style.backgroundColor = "#979797";
      }

      function openNav1() {
        document.getElementById("sidenav").style.width = "200px";
        document.body.style.backgroundColor = "#979797";
        document.getElementById("menu").style.backgroundColor = "#979797";

      }

      function openNav2() {
        document.getElementById("sidenav").style.width = "250px";
        document.body.style.backgroundColor = "#979797";
        document.getElementById("menu").style.backgroundColor = "#979797";

      }
      
      function closeNav() {
        document.getElementById("sidenav").style.width = "0";
        document.getElementById("menu").style.marginLeft= "0";
        document.body.style.backgroundColor = "white";
        document.getElementById("menu").style.backgroundColor = "white";
      }

      var open = document.getElementById('open');
      var close = document.getElementById('close');
      var width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
      
        if(width <= 500){
            open.addEventListener('click', openNav);
            close.addEventListener('click', closeNav);
        }
        if(width > 500 && width <= 1024){
            open.addEventListener('click', openNav1);
            close.addEventListener('click', closeNav);
        }
        if(width > 1024){
          open.addEventListener('click', openNav2);
          close.addEventListener('click', closeNav);
      }
    
      

      
})