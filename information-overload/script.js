const canvas = document.getElementById('canvas1');
let ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// let gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
// gradient.addColorStop(0, 'red');
// gradient.addColorStop(0.2, 'yellow');
// gradient.addColorStop(0.4, 'green');
// gradient.addColorStop(0.6, 'cyan');
// gradient.addColorStop(0.8, 'blue');
// gradient.addColorStop(1, 'magenta');

// let gradient = ctx.createRadialGradient(canvas.width/2, canvas.height/2, 100, canvas.width/2, canvas.height/2, canvas.width/2);
// gradient.addColorStop(0, 'red');
// gradient.addColorStop(0.2, 'yellow');
// gradient.addColorStop(0.4, 'green');
// gradient.addColorStop(0.6, 'cyan');
// gradient.addColorStop(0.8, 'blue');
// gradient.addColorStop(1, 'magenta');

// var currentX;
// var currentY;
// var initialX;
// var initialY;
// var xOffset = 0;
// var yOffset = 0;


// function drag(e) {
  
    
//       e.preventDefault();
//         currentX = e.touches[0].clientX - initialX;
//         currentY = e.touches[0].clientY - initialY;


//       xOffset = currentX;
//       yOffset = currentY;

//       setTranslate(currentX, currentY, el);
//     }
  

//   function setTranslate(xPos, yPos, el) {
//     gradient = ctx.createRadialGradient(xPos, yPos, 100, canvas.width/2, canvas.height/2, canvas.width/2);
//   }



canvas.addEventListener('mousedown', function(){
    gradient.addColorStop(Math.random(), 'red');
        gradient.addColorStop(Math.random(), 'yellow');
        gradient.addColorStop(Math.random(), 'green');
        gradient.addColorStop(Math.random(), 'cyan');
        gradient.addColorStop(Math.random(), 'blue');
        gradient.addColorStop(Math.random(), 'magenta');
    });

    // canvas.addEventListener('mousemove', function(){
    //     gradient.addColorStop(Math.random(), 'red');
    //     gradient.addColorStop(Math.random(), 'yellow');
    //     gradient.addColorStop(Math.random(), 'green');
    //     gradient.addColorStop(Math.random(), 'cyan');
    //     gradient.addColorStop(Math.random(), 'blue');
    //     gradient.addColorStop(Math.random(), 'magenta');
    //     });

    canvas.addEventListener('mouseup', function(){
        gradient.addColorStop(0, '#0aff0a');
        gradient.addColorStop(0.2, '#0aff0a');
        gradient.addColorStop(0.4, '#0aff0a');
        gradient.addColorStop(0.6, '#0aff0a');
        gradient.addColorStop(0.8, '#0aff0a');
        gradient.addColorStop(1, '#0aff0a');
        });


let gradient = ctx.createRadialGradient(canvas.width/2, canvas.height/2, 100, canvas.width/2, canvas.height/2, canvas.width/2);
gradient.addColorStop(0, '#0aff0a');
gradient.addColorStop(0.2, '#0aff0a');
gradient.addColorStop(0.4, '#0aff0a');
gradient.addColorStop(0.6, '#0aff0a');
gradient.addColorStop(0.8, '#0aff0a');
gradient.addColorStop(1, '#0aff0a');







class Symbol{
    constructor(x,y,fontSize,canvasHeight){
        this.characters = 'あいうえおさしすせそかきくけこなにぬねのたちつてとヅプエェケセテネヘメレヱゲゼデペオォコソトノホモヨョロヲゴゾドヴッン가방꽃년도마땅라디오 몸빵비쌀강조금친구친구하나ङघऴऌबज़अञमयर你我他水鸟地电科技编程艺术设计蝴蝶红黄蓝绿青蓝紫东西南北中愛風馬無車語言汉字社会昼夜虫重叠游戏区别观察樂發勞澀廣團鐵繪繩賣聽圓莓巢步時岛屿再见你好纸张打印网络0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        this.x = x;
        this.y = y;
        this.fontSize = fontSize;
        this.text = '';
        this.canvasHeight = canvasHeight;
    }
    draw(context){
        this.text = this.characters.charAt(Math.floor(Math.random()*this.characters.length));
        // context.fillStyle = "#0aff0a";
        context.fillText(this.text, this.x*this.fontSize, this.y*this.fontSize);
        if(this.y*this.fontSize > this.canvasHeight && Math.random() > 0.98 ){
            this.y = 0;
        }else{
            this.y +=1;
        }
    }
}

class Effect{
    constructor(canvasWidth, canvasHeight){
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.fontSize = 15;
        this.columns = this.canvasWidth/this.fontSize;
        this.symbols = [];
        this.#initialize();
        console.log(this.symbols);
    }
    #initialize(){
        for(let i = 0; i < this.columns; i++){
            this.symbols[i] = new Symbol(i, 0, this.fontSize, this.canvasHeight);
        }
    }
    resize(width, height){
        this.canvasWidth = width;
        this.canvasHeight = height;
        this.columns = this.canvasWidth/this.fontSize;
        this.symbols = [];
        this.#initialize;
    }
}

const effect = new Effect(canvas.width, canvas.height);
let lastTime = 0;
const fps = 60;
const nextFrame = 1000/fps;
let timer = 0;

function animate(timeStamp){
    const deltaTime = timeStamp - lastTime;
    lastTime = timeStamp;
    if(timer > nextFrame){
        ctx.fillStyle = 'rgba(0,0,0,0.05)';
        ctx.textAlign = 'center'; 
        ctx.fillRect(0,0,canvas.width,canvas.height);
        ctx.fillStyle = gradient;//"#0aff0a";
        ctx.font = effect.fontSize + 'px monospace';
        effect.symbols.forEach(symbol => symbol.draw(ctx));
        timer = 0;
    }else{
        timer += deltaTime;
    }

    requestAnimationFrame(animate);
}
animate(0);

window.addEventListener('resize', function(){
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    effect.resize(canvas.width, canvas.height);
    gradient.addColorStop(0, 'red');
        gradient.addColorStop(0.5, 'cyan');
        gradient.addColorStop(1, 'magenta');
});