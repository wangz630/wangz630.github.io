window.addEventListener("load", function() {
    //0 ~ 100 sq mi
        var sqmi0Name= document.querySelector("#sqmi0-nav");
        var sqmi0Image = document.querySelector(".sqmi0-image");
        
        function showSqmi0 () {
            sqmi0Image.style.opacity=".6";
        }
        
        function fadeSqmi0 () {
            sqmi0Image.style.opacity="0";
        }
        
        sqmi0Name.addEventListener("mouseover", showSqmi0);
        sqmi0Name.addEventListener("mouseout", fadeSqmi0);
    
    //100 ~ 500 sq mi
    var sqmi100Name= document.querySelector("#sqmi100-nav");
    var sqmi100Image = document.querySelector(".sqmi100-image");
    
    function showSqmi100 () {
        sqmi100Image.style.opacity=".6";
    }
    
    function fadeSqmi100 () {
        sqmi100Image.style.opacity="0";
    }
    
    sqmi100Name.addEventListener("mouseover", showSqmi100);
    sqmi100Name.addEventListener("mouseout", fadeSqmi100);
    
    //500 ~ 1000 sq mi
    var sqmi500Name= document.querySelector("#sqmi500-nav");
    var sqmi500Image = document.querySelector(".sqmi500-image");
    
    function showSqmi500 () {
        sqmi500Image.style.opacity=".6";
    }
    
    function fadeSqmi500 () {
        sqmi500Image.style.opacity="0";
    }
    
    sqmi500Name.addEventListener("mouseover", showSqmi500);
    sqmi500Name.addEventListener("mouseout", fadeSqmi500);

    //1000 ~ 10,000 sq mi
    var sqmi1000Name= document.querySelector("#sqmi1000-nav");
    var sqmi1000Image = document.querySelector(".sqmi1000-image");
    
    function showSqmi1000 () {
        sqmi1000Image.style.opacity=".6";
    }
    
    function fadeSqmi1000 () {
        sqmi1000Image.style.opacity="0";
    }
    
    sqmi1000Name.addEventListener("mouseover", showSqmi1000);
    sqmi1000Name.addEventListener("mouseout", fadeSqmi1000);

    //10,000 ~ 50,000 sq mi
    var sqmi10000Name= document.querySelector("#sqmi10000-nav");
    var sqmi10000Image = document.querySelector(".sqmi10000-image");
    
    function showSqmi10000 () {
        sqmi10000Image.style.opacity=".6";
    }
    
    function fadeSqmi10000 () {
        sqmi10000Image.style.opacity="0";
    }
    
    sqmi10000Name.addEventListener("mouseover", showSqmi10000);
    sqmi10000Name.addEventListener("mouseout", fadeSqmi10000);
    
     //50,000 ~ 100,000 sq mi
     var sqmi50000Name= document.querySelector("#sqmi50000-nav");
     var sqmi50000Image = document.querySelector(".sqmi50000-image");
     
     function showSqmi50000 () {
         sqmi50000Image.style.opacity=".6";
     }
     
     function fadeSqmi50000 () {
         sqmi50000Image.style.opacity="0";
     }
     
     sqmi50000Name.addEventListener("mouseover", showSqmi50000);
     sqmi50000Name.addEventListener("mouseout", fadeSqmi50000);
    
     //100,000 ~ 1 million sq mi
     var sqmi100000Name= document.querySelector("#sqmi100000-nav");
     var sqmi100000Image = document.querySelector(".sqmi100000-image");
     
     function showSqmi100000 () {
         sqmi100000Image.style.opacity=".6";
     }
     
     function fadeSqmi100000 () {
         sqmi100000Image.style.opacity="0";
     }
     
     sqmi100000Name.addEventListener("mouseover", showSqmi100000);
     sqmi100000Name.addEventListener("mouseout", fadeSqmi100000);
    
     //1 million ~ 10 million sq mi
     var million1Name= document.querySelector("#million1-nav");
     var million1Image = document.querySelector(".million1-image");
     
     function showMillion1 () {
        million1Image.style.opacity=".6";
     }
     
     function fadeMillion1 () {
        million1Image.style.opacity="0";
     }
     
     million1Name.addEventListener("mouseover", showMillion1);
     million1Name.addEventListener("mouseout", fadeMillion1);
    
    })