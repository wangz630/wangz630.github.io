window.addEventListener("load", function() {

  // var width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;

  function openNav() {
        document.body.style.backgroundColor = "#979797";
        document.getElementById("menu").style.backgroundColor = "#979797";
        document.getElementById("sidenav").style.left="0px";
  }

  function closeNav() {
      document.getElementById("sidenav").style.left="-250px";
      document.body.style.backgroundColor = "white";
      document.getElementById("menu").style.backgroundColor = "white";
  }

      var open = document.getElementById('open');
      var close = document.getElementById('close');

      open.addEventListener('click', openNav);
      close.addEventListener('click', closeNav);
})