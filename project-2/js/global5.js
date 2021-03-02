window.addEventListener("load", function() {
  

    var circle1 = document.getElementById("circle1");
    var box1=document.getElementById("box1");
    var text1=document.getElementById("text1");


    function blockFade(){
        box1.style.opacity = 0;
    }
    function sizeSmaller(){
        circle1.style.width='90px';
    }
    
    function sizeBigger(){
        circle1.style.width='120px';
    }

    text1.addEventListener('mouseover', sizeBigger);
    text1.addEventListener('mouseout', sizeSmaller);
    text1.addEventListener('mousedown', sizeSmaller);
    text1.addEventListener('mouseup', blockFade);
    // var currentImage = 'circle1';
    var circle2 = document.getElementById("circle2");
    var circle3 = document.getElementById("circle3");
    var circle4 = document.getElementById("circle4");
    var circle5 = document.getElementById("circle5");
    var circle6 = document.getElementById("circle6");
    var circle7 = document.getElementById("circle7");
    
    var currentImage = [];
    
    currentImage[0] = circle1;
    currentImage[1] = circle2;
    currentImage[2] = circle3;
    currentImage[3] = circle4;
    currentImage[4] = circle5;
    currentImage[5] = circle6;
    currentImage[6] = circle7;
    index = 0;

    function showImage() {
        if(currentImage.length >index ) {
            currentImage[index+1].style.opacity = 1;
            index++;
        }else {
            index = 0;
          }
    }

        text1.addEventListener('click', showImage);
    
        var box2=document.getElementById("box2");
        var text2=document.getElementById("text2");
    
    
        function blockFade2(){
            box2.style.opacity = 0;
        }
        function sizeSmaller2(){
            circle2.style.width='90px';
        }
        
        function sizeBigger2(){
            circle2.style.width='160px';
        }
    
            text2.addEventListener('mouseover', sizeBigger2);
            text2.addEventListener('mouseout', sizeSmaller2);
            text2.addEventListener('mousedown', sizeSmaller2);
            text2.addEventListener('mouseup', blockFade2);

           
            text2.addEventListener('click', showImage);

        var box3=document.getElementById("box3");
        var text3=document.getElementById("text3");
    
    
        function blockFade3(){
            box3.style.opacity = 0;
        }
        function sizeSmaller3(){
            circle3.style.width='90px';
        }
        
        function sizeBigger3(){
            circle3.style.width='160px';
        }
    
            text3.addEventListener('mouseover', sizeBigger3);
            text3.addEventListener('mouseout', sizeSmaller3);
            text3.addEventListener('mousedown', sizeSmaller3);
            text3.addEventListener('mouseup', blockFade3);

           
            text3.addEventListener('click', showImage);

            var box4=document.getElementById("box4");
            var text4=document.getElementById("text4");
        
        
            function blockFade4(){
                box4.style.opacity = 0;
            }
            function sizeSmaller4(){
                circle4.style.width='90px';
            }
            
            function sizeBigger4(){
                circle4.style.width='160px';
            }
        
                text4.addEventListener('mouseover', sizeBigger4);
                text4.addEventListener('mouseout', sizeSmaller4);
                text4.addEventListener('mousedown', sizeSmaller4);
                text4.addEventListener('mouseup', blockFade4);
    
               
                text4.addEventListener('click', showImage);

                var box5=document.getElementById("box5");
                var text5=document.getElementById("text5");
            
            
                function blockFade5(){
                    box5.style.opacity = 0;
                }
                function sizeSmaller5(){
                    circle5.style.width='90px';
                }
                
                function sizeBigger5(){
                    circle5.style.width='160px';
                }
            
                    text5.addEventListener('mouseover', sizeBigger5);
                    text5.addEventListener('mouseout', sizeSmaller5);
                    text5.addEventListener('mousedown', sizeSmaller5);
                    text5.addEventListener('mouseup', blockFade5);
        
                   
                    text5.addEventListener('click', showImage);

                    var box6=document.getElementById("box6");
                    var text6=document.getElementById("text6");
                
                
                    function blockFade6(){
                        box6.style.opacity = 0;
                    }
                    function sizeSmaller6(){
                        circle6.style.width='90px';
                    }
                    
                    function sizeBigger6(){
                        circle6.style.width='160px';
                    }
                
                        text6.addEventListener('mouseover', sizeBigger6);
                        text6.addEventListener('mouseout', sizeSmaller6);
                        text6.addEventListener('mousedown', sizeSmaller6);
                        text6.addEventListener('mouseup', blockFade6);
            
                       
                        text6.addEventListener('click', showImage);

                        var box7=document.getElementById("box7");
                        var text7=document.getElementById("text7");
                    
                    
                        function blockFade7(){
                            box7.style.opacity = 0;
                        }
                        function sizeSmaller7(){
                            circle7.style.width='90px';
                        }
                        
                        function sizeBigger7(){
                            circle7.style.width='160px';
                        }
                    
                            text7.addEventListener('mouseover', sizeBigger7);
                            text7.addEventListener('mouseout', sizeSmaller7);
                            text7.addEventListener('mousedown', sizeSmaller7);
                            text7.addEventListener('mouseup', blockFade7);
                
                           
                            text7.addEventListener('click', showImage);
})