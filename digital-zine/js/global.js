window.addEventListener("load", function() {

    function openNav() {
        if(screen.width <=500){
            document.getElementById("sidenav").style.width = "150px";
            document.body.style.backgroundColor = "#979797";
            document.getElementById("menu").style.backgroundColor = "#979797";
        }
        if(screen.width >500 && screen.width <= 1024){
            document.getElementById("sidenav").style.width = "200px";
            document.body.style.backgroundColor = "#979797";
            document.getElementById("menu").style.backgroundColor = "#979797";
        }else{
        document.getElementById("sidenav").style.width = "250px";
        document.body.style.backgroundColor = "#979797";
        document.getElementById("menu").style.backgroundColor = "#979797";
        }
      }
      
      function closeNav() {
        document.getElementById("sidenav").style.width = "0";
        document.getElementById("menu").style.marginLeft= "0";
        document.body.style.backgroundColor = "white";
        document.getElementById("menu").style.backgroundColor = "white";
      }

      var open = document.getElementById('open');
      var close = document.getElementById('close');

      open.addEventListener('click', openNav)
      close.addEventListener('click', closeNav);
})