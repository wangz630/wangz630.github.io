window.addEventListener("load", function() {
  

    var block1 = document.getElementById("block1")
    var block2 = document.getElementById("block2")
    var block3 = document.getElementById("block3")
    var block4 = document.getElementById("block4")



    function blockFade(e){
        var block = e.target;
        block.style.opacity = 0;
    }
    function noShadow(e){
        var block = e.target;
        block.style.setProperty("-webkit-filter", "drop-shadow(0px 0px 0px)");
    }
    
    function dropShadow(e){
        var block = e.target;
        block.style.setProperty("-webkit-filter", "drop-shadow(10px 12px 12px rgba(0, 0, 0, 0.4))");
    }

   
        block1.addEventListener('mouseover', dropShadow);
        block1.addEventListener('mouseleave', noShadow);
        block1.addEventListener('mousedown', noShadow);
        block1.addEventListener('mouseup', blockFade);

        block2.addEventListener('mouseover', dropShadow);
        block2.addEventListener('mouseleave', noShadow);
        block2.addEventListener('mousedown', noShadow);
        block2.addEventListener('mouseup', blockFade);

        block3.addEventListener('mouseover', dropShadow);
        block3.addEventListener('mouseleave', noShadow);
        block3.addEventListener('mousedown', noShadow);
        block3.addEventListener('mouseup', blockFade);

        block4.addEventListener('mouseover', dropShadow);
        block4.addEventListener('mouseleave', noShadow);
        block4.addEventListener('mousedown', noShadow);
        block4.addEventListener('mouseup', blockFade);


    //function random() {
   // var images= ["cat1","cat2","cat3","cat4"];
    //var imageNum = Math.floor(Math.random() * images.length);
   // var s = "../image/" + images[imageNum] + ".jpg";
   // document.getElementById("image-container").style.backgroundImage ("url("  + s + ")");
//}

    
});

