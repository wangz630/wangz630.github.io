

let elements = document.querySelectorAll(".rolling-text");

      elements.forEach((element) => {
        let innerText = element.innerText;
        element.innerHTML = "";

        let textContainer = document.createElement("div");
        textContainer.classList.add("block");

        for (let letter of innerText) {
          let span = document.createElement("span");
          span.innerText = letter.trim() === "" ? "\xa0" : letter;
          span.classList.add("letter");
          textContainer.appendChild(span);
        }

        element.appendChild(textContainer);
        element.appendChild(textContainer.cloneNode(true));
      });

      elements.forEach((element) => {
        element.addEventListener("mouseover", () => {
          element.classList.remove("play");
        });
      });

      //mouse trail
    document.addEventListener("mousemove", function(e){
      let body = document.querySelector('body');
      let face = document.createElement('span');
      face.classList.add('face');
      let x = e.offsetX;
      let y = e.offsetY;
      face.style.left = x+'px';
      face.style.top = y+'px';
      let size = Math.random()* 60;
      face.style.width = size+'px';
      face.style.height = size+'px';
      body.appendChild(face);

      setTimeout(function(){
          face.remove();
      },2000)
  });

  let text = document.querySelector('.rounded-text');
  text.innerHTML = text.textContent.replace(/\S/g,"<span class='text'>$&</span>");
  let ele = document.querySelectorAll('.text');
  for(let i = 1; i<ele.length;i++){
      ele[i].style.transform = "rotate("+i*23+"deg)";
  }

