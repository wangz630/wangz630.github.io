
VANTA.FOG({
  el: "#my-background",
  mouseControls: true,
  touchControls: true,
  gyroControls: false,
  minHeight: 700.00,
  minWidth: 1152.00,
  highlightColor: 0xf4bbbb,
  midtoneColor: 0xc78989,
  lowlightColor: 0xffc6dc,
  baseColor: 0xffeccd,
  blurFactor: 0.32,
  speed: 0.40,
  zoom: 1.10
})

var recipe1 = document.querySelector(".recipe1");
var image1 =document.querySelector(".recipe1 img");
var ingredient1 = document.querySelector(".ingredient1");
var stepContainer1  = document.querySelector(".perspective1");


    recipe1.addEventListener("click", function(){
        recipe1.classList.toggle("active");
        
        changeContent();

        function changeContent(){
            if(recipe1.classList.contains("active")){
                image1.style.display = "none";
                document.querySelector("h2").style.display = "none";
                ingredient1.style.display ="block";
                function ingredient(beef, bread, onion, egg, oil, chicken,ramen ){
                    ingredient1.innerHTML ="Ingredients:\n\n"+beef+" lb. ground beef\n\n"+bread+" c. panko bread crumbs\n\n"+onion+" green onion, thinly sliced\n\n"+egg+" egg\n\n"+oil+" tsp. sesame oil\n\n"+chicken+" c. chicken broth\n\n"+ramen+" packs instant ramen";
                }
                
                ingredient(1,1/2,3,1,2,3/4,3);
                stepContainer1.style.display = "block";
                closeButton.style.display = "inline";
            }else{
                image1.style.display = "block";
                document.querySelector("h2").style.display = "block";
                ingredient1.style.display ="none";
               
            }
        }
        var step11 = document.querySelector(".step1");
        var stepContent11 = document.querySelector(".step-content1");
        step11.innerHTML = "Step1";
        stepContent11.innerHTML = "In a large bowl, combine ground beef, panko bread crumbs, about half green onions, egg, garlic, and 1 teaspoon sesame oil. Season with red pepper flakes, salt and pepper, then mix until well combined. To form meatballs, scoop a heaping tablespoons of mixture and roll into balls.";
        var step21 = document.querySelector(".step2");
        var stepContent21 = document.querySelector(".step-content2");
        step21.innerHTML = "Step2";
        stepContent21.innerHTML = "In a large skillet over medium-high heat, heat a thin layer of vegetable oil. Add meatballs and sear until each sides develops a crust, about 2 minutes per side.";
        var step31 = document.querySelector(".step3");
        var stepContent31 = document.querySelector(".step-content3");
        step31.innerHTML = "Step3";
        stepContent31.innerHTML = "Remove meatballs from skillet, and add remaining sesame oil. Stir in ginger and cook until fragrant, about 30 seconds. Add chicken broth, soy sauce, brown sugar, and hoisin. Stir to combine and bring to a simmer. Return meatballs to skillet and cover skillet with a lid. Cook about 10 minutes more.";
        var step41 = document.querySelector(".step4");
        var stepContent41 = document.querySelector(".step-content4");
        step41.innerHTML = "Step4";
        stepContent41.innerHTML = "Meanwhile, cook ramen. In a large pot of boiling water, cooking ramen according to package instructions. Drain noodles.Add cooked noodles to skillet and toss until fully coated in sauce. Garnish with remaining green onion and sesame seeds. Serve warm.";
    });



    
var recipe2 = document.querySelector(".recipe2");
var image2 =document.querySelector(".recipe2 img");
var ingredient2 = document.querySelector(".ingredient2");
var closeButton = document.querySelector(".close-button");

    recipe2.addEventListener("click", function(){
        recipe2.classList.toggle("active");
        
        changeContent();

        function changeContent(){
            if(recipe2.classList.contains("active")){
                image2.style.display = "none";
                document.querySelector("h3").style.display = "none";
                ingredient2.style.display ="block";
                function ingredient(tofu, sauce, sriracha, oil, vinegar, sugar,powder){
                    ingredient2.innerHTML ="Ingredients:\n\n"+tofu+" block extra-firm tofu\n\n"+sauce+" tbsp. soy sauce \n\n"+sriracha+" tbsp. Sriracha\n\n"+oil+" c. tbsp. oil\n\n"+vinegar+" tbsp. rice wine vinegar\n\n"+sugar+" tbsp. brown sugar\n\n"+powder+" tsp. baking powder";
                }
                
                ingredient(1,2,1,3,2,2,1/4);
                stepContainer1.style.display = "block";
                closeButton.style.display = "inline";
            }else{
                image2.style.display = "block";
                document.querySelector("h3").style.display = "block";
                ingredient2.style.display ="none";
                // stepContainer1.style.display = "none";
                
            }
        }
        var step12 = document.querySelector(".step1");
        var stepContent12 = document.querySelector(".step-content1");
        step12.innerHTML = "Step1";
        stepContent12.innerHTML = "Carefully pat tofu dry: On a cutting board, sandwich tofu between doubled layers of paper towels and press down slowly to remove moisture without cracking the block. Remove paper towels and cut tofu into 32 equal pieces: halve tofu laterally across, then cut the block into a 4x4 grid.";
        var step22 = document.querySelector(".step2");
        var stepContent22 = document.querySelector(".step-content2");
        step22.innerHTML = "Step2";
        stepContent22.innerHTML = "In a medium bowl, whisk together garlic, ginger, soy sauce, Sriracha, sesame oil, until smooth. Set aside half this mixture and reserve for glazing later. Preheat oven to 400°. Meanwhile, add tofu to bowl and toss gently to coat in marinade. Let sit 15 minutes, then drain off excess marinade.";
        var step32 = document.querySelector(".step3");
        var stepContent32 = document.querySelector(".step-content3");
        step32.innerHTML = "Step3";
        stepContent32.innerHTML = "In a small bowl, whisk together cornstarch and baking powder. Sprinkle over tofu and gently toss to coat evenly. Drizzle over remaining 1 tablespoon sesame oil and toss to coat each piece. Spread tofu evenly out onto a baking sheet and bake for 15 minutes.";
        var step42 = document.querySelector(".step4");
        var stepContent42 = document.querySelector(".step-content4");
        step42.innerHTML = "Step4";
        stepContent42.innerHTML = "Decrease oven temperature to 375°. Flip tofu pieces to allow for even toasting, then return tray to oven and continue to bake until tofu is deeply golden, about 15 minutes more. Brush with reserved marinade mixture for a glaze finish, then sprinkle with green onions and sesame.";
    });

var recipe3 = document.querySelector(".recipe3");
var image3 =document.querySelector(".recipe3 img");
var ingredient3 = document.querySelector(".ingredient3");


    recipe3.addEventListener("click", function(){
        recipe3.classList.toggle("active");
        
        changeContent();

        function changeContent(){
            if(recipe3.classList.contains("active")){
                image3.style.display = "none";
                document.querySelector("h4").style.display = "none";
                ingredient3.style.display ="block";
                function ingredient(flour, water, oil, scallion, sauce){
                    ingredient3.innerHTML ="Ingredients:\n\n"+flour+" c. flour\n\n"+water+" c. boiling water \n\n"+oil+" c. vegetable oil \n\n"+scallion+" c. thinly sliced scallions\n\n"+sauce+" tbsp. soy sauce";
                }
                
                ingredient(2,1,1/4,1,2);
                stepContainer1.style.display = "block";
                closeButton.style.display = "inline";
            }else{
                image3.style.display = "block";
                document.querySelector("h4").style.display = "block";
                ingredient3.style.display ="none";
            }
        }
        
        var step13 = document.querySelector(".step1");
        var stepContent13 = document.querySelector(".step-content1");
        step13.innerHTML = "Step1";
        stepContent13.innerHTML = "Combine flour and boiling water in a large bowl and stir to combine until a mass of dough forms. Transfer dough to a lightly floured surface and knead until smooth, slightly tacky ball forms, 3 to 4 minutes.";
        var step23 = document.querySelector(".step2");
        var stepContent23 = document.querySelector(".step-content2");
        step23.innerHTML = "Step2";
        stepContent23.innerHTML = "Transfer dough ball to a medium bowl and cover with a kitchen towel or plastic wrap. Let rest 30 minutes at room temperature, or up to overnight in the fridge. ";
        var step33 = document.querySelector(".step3");
        var stepContent33 = document.querySelector(".step-content3");
        step33.innerHTML = "Step3";
        stepContent33.innerHTML = "Separate dough into four equally-sized balls. Return 3 to bowl and recover with plastic wrap. Roll remaining ball into an 8” disk, and brush with a thin layer of the oil mixture. Roll tightly, then twist into a tight spiral, tucking the outer end underneath the roll. Flatten the spiral.";
        var step43 = document.querySelector(".step4");
        var stepContent43 = document.querySelector(".step-content4");
        step43.innerHTML = "Step4";
        stepContent43.innerHTML = "Add ¼ vegetable oil to an 8” skillet over medium-high heat until shimmering and gently add first pancake. Cook, until golden on one side. Flip and cook until golden on underside. Remove to paper-towel lined plate and season immediately with salt. Repeat with the remaining pancakes.";


    });

    closeButton.addEventListener("click", function(){
        
        closeStep();

        function closeStep(){
                stepContainer1.style.display = "none";
                closeButton.style.display = "none";
            }


        })






