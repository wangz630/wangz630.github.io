// let faceapi;
// let detections = [];

// // let video1;
// // // let canvas;

// // function setup1() {
// // //   canvas = createCanvas(480, 360);
// // //   canvas.id("canvas");

// //   video1 = createCapture(VIDEO);// Creat the video: ビデオオブジェクトを作る
// //   video1.id("video");
// //   video1.size(width, height);

// //   const faceOptions = {
// //     withLandmarks: true,
// //     withExpressions: true,
// //     withDescriptors: true,
// //     minConfidence: 0.5
// //   };

//   //Initialize the model: モデルの初期化
// //   faceapi = ml5.faceApi(video, faceOptions, faceReady);
// // }


// function faceReady() {
//   faceapi.detect(gotFaces);// Start detecting faces: 顔認識開始
// }

// // Got faces: 顔を検知
// function gotFaces(error, result) {
//   if (error) {
//     console.log(error);
//     return;
//   }

//   detections = result;　//Now all the data in this detections: 全ての検知されたデータがこのdetectionの中に
//   // console.log(detections);

//   clear();//Draw transparent background;: 透明の背景を描く
//   drawBoxs(detections);//Draw detection box: 顔の周りの四角の描画
//   drawLandmarks(detections);//// Draw all the face points: 全ての顔のポイントの描画
//   drawExpressions(detections, 20, 250, 14);//Draw face expression: 表情の描画

//   faceapi.detect(gotFaces);// Call the function again at here: 認識実行の関数をここでまた呼び出す
// }

// function drawBoxs(detections){
//   if (detections.length > 0) {//If at least 1 face is detected: もし1つ以上の顔が検知されていたら
//     for (f=0; f < detections.length; f++){
//       let {_x, _y, _width, _height} = detections[f].alignedRect._box;
//       stroke(44, 169, 225);
//       strokeWeight(1);
//       noFill();
//       rect(_x, _y, _width, _height);
//     }
//   }
// }

// function drawLandmarks(detections){
//   if (detections.length > 0) {//If at least 1 face is detected: もし1つ以上の顔が検知されていたら
//     for (f=0; f < detections.length; f++){
//       let points = detections[f].landmarks.positions;
//       for (let i = 0; i < points.length; i++) {
//         stroke(44, 169, 225);
//         strokeWeight(3);
//         point(points[i]._x, points[i]._y);
//       }
//     }
//   }
// }

// function drawExpressions(detections, x, y, textYSpace){
//   if(detections.length > 0){//If at least 1 face is detected: もし1つ以上の顔が検知されていたら
//     let {neutral, happy, angry, sad, disgusted, surprised, fearful} = detections[0].expressions;
//     textFont('Helvetica Neue');
//     textSize(14);
//     noStroke();
//     fill(44, 169, 225);

//     text("neutral:       " + nf(neutral*100, 2, 2)+"%", x, y);
//     text("happiness: " + nf(happy*100, 2, 2)+"%", x, y+textYSpace);
//     text("anger:        " + nf(angry*100, 2, 2)+"%", x, y+textYSpace*2);
//     text("sad:            "+ nf(sad*100, 2, 2)+"%", x, y+textYSpace*3);
//     text("disgusted: " + nf(disgusted*100, 2, 2)+"%", x, y+textYSpace*4);
//     text("surprised:  " + nf(surprised*100, 2, 2)+"%", x, y+textYSpace*5);
//     text("fear:           " + nf(fearful*100, 2, 2)+"%", x, y+textYSpace*6);
//   }else{//If no faces is detected: 顔が1つも検知されていなかったら
//     text("neutral: ", x, y);
//     text("happiness: ", x, y + textYSpace);
//     text("anger: ", x, y + textYSpace*2);
//     text("sad: ", x, y + textYSpace*3);
//     text("disgusted: ", x, y + textYSpace*4);
//     text("surprised: ", x, y + textYSpace*5);
//     text("fear: ", x, y + textYSpace*6);
//   }
// }

let video;
let tracker;
let layer;
let canvas;
let faceapi;

function setup() {
    canvas = createCanvas(640, 450);
    canvas.id("canvas");

  video = createCapture(VIDEO);
  video.size(width,height);
  video.hide();
  tracker = new clm.tracker();
  tracker.init();
  tracker.start(video.elt);
  layer = createGraphics(width,height);

//   const faceOptions = {
//     withLandmarks: true,
//     withExpressions: true,
//     withDescriptors: true,
//     minConfidence: 0.5
//   };


//     //Initialize the model: モデルの初期化
//     faceapi = ml5.faceApi(video, faceOptions, faceReady);
}


function draw() {
  background(220);
  let positions = tracker.getCurrentPosition();
  image(video, 0 , 0);
//   console.log(positions);

  
  if(positions){

    let active = true;
    if(active == true){
        beginShape();
        for (let i = 0; i<positions.length; i++){
        vertex(positions[i][0],positions[i][1]);  
      }
        endShape();
        
        textSize(200)
        text("👀",positions[27][0]-30,positions[27][1]+100)
        text("👄",positions[44][0]-40,positions[44][1]+100)
    }else if(active == false){
       background();
       setup();draw();
    }
  

    let closeMouth = dist(positions[57][0],positions[57][1],positions[60][0], positions[60][1])
    let smile = dist(positions[44][0],positions[44][1],positions[60][0], positions[60][1])
    console.log(positions[24][1] - positions[21][1])
      if(closeMouth >= 20 && positions[44][1] - positions[60][1] > 0){
        // shocked expression >>> neutral
        textSize(50)
        text("😐",positions[19][0]-20,positions[19][1]-10)
        text("😐",positions[21][0]-20,positions[21][1]-40)
        text("😐",positions[33][0]-20,positions[33][1]-80)
        text("😐",positions[17][0]-20,positions[17][1]-40)
        text("😐",positions[15][0]-20,positions[15][1]-10)
      }else if(positions[44][1] - positions[57][1] < 0 && positions[44][1] - positions[60][1] < 0 && positions[57][1] - positions[60][1] <15){
        //smile >>>>> sad
        textSize(50)
        text("☔️",positions[19][0]-20,positions[19][1]-10)
        text("☔️",positions[21][0]-20,positions[21][1]-40)
        text("☔️",positions[33][0]-20,positions[33][1]-80)
        text("☔️",positions[17][0]-20,positions[17][1]-40)
        text("☔️",positions[15][0]-20,positions[15][1]-10)
      }else if(positions[44][1] - positions[57][1] < 0 && positions[57][1] - positions[60][1] >=15 ){
        //big smile >>>>> angry
        textSize(50)
        text("🔥",positions[19][0]-20,positions[19][1]-10)
        text("🔥",positions[21][0]-20,positions[21][1]-40)
        text("🔥",positions[33][0]-20,positions[33][1]-80)
        text("🔥",positions[17][0]-20,positions[17][1]-40)
        text("🔥",positions[15][0]-20,positions[15][1]-10)
      }else if(positions[44][1] - positions[57][1] > 0 && positions[44][1] - positions[60][1] > 0 ){
        //sad >>>>>smile
        textSize(50)
        text("😊",positions[19][0]-20,positions[19][1]-10)
        text("😊",positions[21][0]-20,positions[21][1]-40)
        text("😊",positions[33][0]-20,positions[33][1]-80)
        text("😊",positions[17][0]-20,positions[17][1]-40)
        text("😊",positions[15][0]-20,positions[15][1]-10)
      }else if(positions[24][1] - positions[21][1]<=25 &&positions[57][1] - positions[60][1] <=15 ){
        //angry >>>>> big smile
        textSize(50)
        text("😄",positions[19][0]-20,positions[19][1]-10)
        text("😄",positions[21][0]-20,positions[21][1]-40)
        text("😄",positions[33][0]-20,positions[33][1]-80)
        text("😄",positions[17][0]-20,positions[17][1]-40)
        text("😄",positions[15][0]-20,positions[15][1]-10)
      }else{
        //neutral >>>> shocked
        textSize(50)
        text("🤯",positions[19][0]-20,positions[19][1]-10)
        text("💥",positions[21][0]-20,positions[21][1]-40)
        text("😱",positions[33][0]-20,positions[33][1]-80)
        text("🤯",positions[17][0]-20,positions[17][1]-40)
        text("😱",positions[15][0]-20,positions[15][1]-10)
      }

}
}

    

setInterval(function(){
    let texts =["Sad?","Angry?","Neutral?","Happy?","Shocked?"]
    var num = Math.floor( Math.random() * texts.length)
    document.querySelector("h1").innerHTML = `${texts[num]}`;
  },1000)
  

  
  

  
  
  


