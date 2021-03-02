window.addEventListener("load", function() {

var button1 = document.getElementById("button1")
var text = document.getElementById("text")
var button2 = document.getElementById("button2")
var chapter1 = document.getElementById("chapter1")
var chapter2 = document.getElementById("chapter2")
var chapter3 = document.getElementById("chapter3")
var chapter5 = document.getElementById("chapter5")
// var chapter = document.getElementsByClassName('chapter')
var chapter4 = document.getElementById("chapter4")
var nav = document.getElementById("nav")
var bar=document.getElementById('bar')

function changeColor(){
    if(screen.width > 360){
    document.body.style.backgroundColor= 'black';
    text.style.color='white';
    button1.style.opacity=0;
    button2.style.opacity=1;
    nav.style.backgroundColor='white';
    chapter1.style.color='black';
    // chapter.style.color='black';
    chapter2.style.color='black';
    chapter3.style.color='black';
    chapter5.style.color='black';
    chapter4.style.color='white';
    chapter4.style.backgroundColor='black';
    }else{
    document.body.style.backgroundColor= 'black';
    text.style.color='white';
    button1.style.display= 'none';
    button2.style.display='block';
    bar.style.backgroundColor="white";
    bar.style.opacity="0.9";
    button2.style.opacity=1;
    }
}

function changeBack(){
    if(screen.width > 360){
    document.body.style.backgroundColor= 'white';
    text.style.color='rgb(165, 165, 165)';
    button1.style.opacity=1;
    button2.style.opacity=0;
    nav.style.backgroundColor='black';
    chapter1.style.color='white';
    chapter2.style.color='white';
    chapter3.style.color='white';
    chapter5.style.color='white';
    chapter4.style.color='black';
    chapter4.style.backgroundColor='white';
    }else{
    document.body.style.backgroundColor= 'white';
    text.style.color='black';
    button1.style.display= 'block';
    button2.style.display='none';
    bar.style.backgroundColor="black";
    bar.style.opacity="0.8";
    button2.style.opacity=0;
    }
}


button1.addEventListener('click', changeColor);
button2.addEventListener('click', changeBack);

})