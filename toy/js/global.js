window.addEventListener("load", function() {
  

    var blocks = document.querySelectorAll("#blocks")
    var button = document.getElementById("button")

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
        block.style.setProperty("-webkit-filter", "drop-shadow(12px 16px 12px  rgba(0, 0, 0, 0.8))");
    }


    blocks.forEach(function(block) {
        block.addEventListener('mouseover', dropShadow);
        block.addEventListener('mouseout', noShadow);
        block.addEventListener('mousedown', noShadow);
        block.addEventListener('mouseup', blockFade);

    })


    


        var images = [], 
        index = 0;
        
        images[0] = "image/cat1.jpg";
        images[1] = "image/cat2.jpg";
        images[2] = "image/cat3.jpg";
        images[3] = "image/cat4.jpg";
        images[4] = "image/cat5.jpg";
        images[5] = "image/cat6.jpg";
        
        
        index = Math.floor(Math.random() * images.length);
        console.log(images.length);
        
        document.getElementById("image-container").style.background = "#fff url('"+images[index]+"') no-repeat center center fixed";
        

    
    

 



    
        

    

    
});

