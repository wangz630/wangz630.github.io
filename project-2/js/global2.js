window.addEventListener("load", function() {
  

        var hidden = document.querySelectorAll(".hidden")
    
        function dropShadow(e){
            var x = e.target;
            x.style.backgroundColor="black";
        }

        function sizeSmaller(e){
            var x = e.target;
            x.style.fontSize="34px";
        }
    
            
        function sizeSmaller1(e){
            var x = e.target;
            x.style.fontSize="20px";
        }
        
            hidden.forEach(function(x) {
                if(window.width > 360){
                    x.addEventListener('mousedown', sizeSmaller);
                    x.addEventListener('click', dropShadow);
            }else{
                    x.addEventListener('mousedown', sizeSmaller1);
                    x.addEventListener('click', dropShadow);
                }
            })
    
        
            
    
        
    
        
    });
    
    