window.addEventListener("load", function() { // make sure page is loaded
  

    var listName1 = document.querySelector("#core-2-studio-name") //get element from html
    var listName2 = document.querySelector("#core-2-lab-name")
    var listName3 = document.querySelector("#core-1-studio-project-name")
    var container1 = document.querySelector("#core-2-studio-project-container")
    var container2 = document.querySelector("#core-2-lab-project-container")
    var container3 = document.querySelector("#core-1-studio-project-container")



            listName1.addEventListener('click', function (){ //attach a click event to listName1
                    if(container1.classList.contains("open")){ // examine if there is a class "open" in container1
                        container1.classList.remove("open"); // delete the class
                        document.querySelectorAll('.upwards-arrow')[0].style.display="none"; //remove the first upwards-arrow after clicking
                        document.querySelectorAll('.downwards-arrow')[0].style.display="inline"; // shows the first downwards-arrow
                }else{
                    container1.classList.add("open");  // add class "open" to container1
                    document.querySelectorAll('.upwards-arrow')[0].style.display="inline";  // shows the upwards-arrow when the list is opened
                    document.querySelectorAll('.downwards-arrow')[0].style.display="none"; // removes the downwards-arrow
                    }
            })

            listName2.addEventListener('click', function (){  // just repeate the provious code but only change the variables
                if(container2.classList.contains("open")){
                    container2.classList.remove("open");
                    document.querySelectorAll('.upwards-arrow')[1].style.display="none"; // the second element in class "upwards-arrow"
                    document.querySelectorAll('.downwards-arrow')[1].style.display="inline";
            }else{
                container2.classList.add("open");
                document.querySelectorAll('.upwards-arrow')[1].style.display="inline";
                document.querySelectorAll('.downwards-arrow')[1].style.display="none";
                }
        })

        
        listName3.addEventListener('click', function (){ // still repeate the previous code
            if(container3.classList.contains("open")){
                container3.classList.remove("open");
                document.querySelectorAll('.upwards-arrow')[2].style.display="none"; // the thrid element in class "upwards-arrow"
                document.querySelectorAll('.downwards-arrow')[2].style.display="inline";
        }else{
            container3.classList.add("open");
            document.querySelectorAll('.upwards-arrow')[2].style.display="inline";
            document.querySelectorAll('.downwards-arrow')[2].style.display="none";
            }
    }) 

        var container = document.querySelector('#ball-container') //get element from html

        for (let i = 0; i < 30; i++) {  // a 30-time loop
            let ball = document.createElement('div'); // create tag <div> in html
            ball.classList.add('ball');  // give it a class name "ball"
            ball.style.left = (90*Math.random())+'%'; // give it a random left value from 0% to 90%
            ball.style.top=(190*Math.random()) +'%';  // give it a random top value from 0% to 90%, and each time you refresh the page, the layout will change
            container.appendChild(ball); // attach child "ball" to ID #ball-container
          }

    })