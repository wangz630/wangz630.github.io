//music visualizer

// keys & notes asset
var keyMap = {
    'C4': {
      'keyboard': 'A',
      'audio': undefined
    },
    'Db4': {
      'keyboard': 'W',
      'audio': undefined
    },
    'D4': {
      'keyboard': 'S',
      'audio': undefined
    },
    'Eb4': {
      'keyboard': 'E',
      'audio': undefined
    },
    'E4': {
      'keyboard': 'D',
      'audio': undefined
    },
    'F4': {
      'keyboard': 'F',
      'audio': undefined
    },
    'Gb4': {
      'keyboard': 'T',
      'audio': undefined
    },
    'G4': {
      'keyboard': 'G',
      'audio': undefined
    },
    'Ab4': {
      'keyboard': 'Y',
      'audio': undefined
    },
    'A4': {
      'keyboard': 'H',
      'audio': undefined
    },
    'Bb4': {
      'keyboard': 'U',
      'audio': undefined
    },
    'B4': {
      'keyboard': 'J',
      'audio': undefined
    },
    'C5': {
      'keyboard': 'K',
      'audio': undefined
    },
    'Db5': {
      'keyboard': 'O',
      'audio': undefined
    },
    'D5': {
      'keyboard': 'L',
      'audio': undefined
    },
    'Eb5': {
      'keyboard': 'P',
      'audio': undefined
    },
    'E5': {
      'keyboard': ';',
      'audio': undefined
    },
    'Piano-Chord': {
      'keyboard': '\'',
      'audio': undefined
    },
    'Small-Rack-Tom': {
      'keyboard': 'Z',
      'audio': undefined
    },
    'Big-Rack-Tom': {
      'keyboard': 'X',
      'audio': undefined
    },
    'Floor-Tom': {
      'keyboard': 'C',
      'audio': undefined
    },
    'High-Hat-Open': {
      'keyboard': 'V',
      'audio': undefined
    },
    'Hi-Hat-Closed': {
      'keyboard': 'B',
      'audio': undefined
    },
    'Kick': {
      'keyboard': 'N',
      'audio': undefined
    },
    'Snare': {
      'keyboard': 'M',
      'audio': undefined
    },
    'Shaker': {
      'keyboard': ',',
      'audio': undefined
    },
    'Clap': {
      'keyboard': '.',
      'audio': undefined
    },
    'Drum-Fill': {
      'keyboard': '/',
      'audio': undefined
    },
    'Guitar-Low': {
      'keyboard': 'Q',
      'audio': undefined
    },
    'Guitar-High': {
      'keyboard': 'R',
      'audio': undefined
    },
    'Guitar-Chord1': {
      'keyboard': 'I',
      'audio': undefined
    },
    'Guitar-Chord2': {
      'keyboard': '[',
      'audio': undefined
    },
    'Guitar-Chord3': {
      'keyboard': ']',
      'audio': undefined
    },
    'Guitar-Chord4': {
      'keyboard': '\\',
      'audio': undefined
    },

  };
  
  var damperPedalDown = false;
  
  document.addEventListener('DOMContentLoaded', function() {
    console.clear();
    console.log('Maestro, your piano is ready.');
    
     
    // Event registration via getElementsByClassName
    
    var whiteKeys = document.getElementsByClassName('white');
    for (i = 0; i < whiteKeys.length; i++) {
      var key = whiteKeys[i];
      key.addEventListener('click', function() {
        console.log('You are playing a white key');
      })
    }
    
    var blackKeys = document.getElementsByClassName('black');
    for (i = 0; i < blackKeys.length; i++) {
      var key = blackKeys[i];
      key.addEventListener('click', function() {
        console.log('You are playing a black key');
      })
    }
    
    // Event registration via querySelectorAll
    document.querySelectorAll('.key').forEach(function(el) {
      el.addEventListener('click', function() {
        playNote(el.id);
      })
    });
    
    // Event registration via looping through a map
    // Object.keys(keyMap).forEach(function(key) {
    //   document.getElementById(key).addEventListener('mousedown', function(e) {
    //     e.stopPropagation();
    //     playNote(key);
    //   });
    //   document.getElementById(key).addEventListener('mouseup', function(e) {
    //     e.stopPropagation();
    //     stopNote(key);
    //   });
    // });
    
    // Setup keyboard bindings for keyboard playback and
    // spacebar damper pedal control
    document.addEventListener('keydown', function(e) {
      var keyID = e.key.toUpperCase();
      Object.keys(keyMap).forEach(function(key) {
        // The !keyMap[key].audio condition is required 
        // to stop automatic repetition of sounds
        if (keyMap[key].keyboard === keyID && !keyMap[key].audio) {
          playNote(key);
        }
      });
      if (e.keyCode === 32) {
        damperPedalDown = true;
      }
    });
    document.addEventListener('keyup', function(e) {
      var keyID = e.key.toUpperCase();
      Object.keys(keyMap).forEach(function(key) {
        if (keyMap[key].keyboard === keyID) {
          stopNote(key);
        }
      });
      if (e.keyCode === 32) {
        damperPedalDown = false;
        stopAllNotes();
      }
    });
    
    // Map a mouse down / up event within the window for damper
    // control. What happens? Discuss event bubbling.
    var elements = document.getElementsByTagName('body');
    var bodyElement = elements[0];
    bodyElement.addEventListener('mousedown', function() {
      console.log('Damper pedal down via mouse.');
      damperPedalDown = true;
    });
    bodyElement.addEventListener('mouseup', function() {
      console.log('Damper pedal up via mouse.');
      damperPedalDown = false;
      stopAllNotes();
    });
      
  });

//   var result = document.querySelector("#note-indicator");

// // Detect when we are pressing a key anywhere on the webpage (document)
// document.addEventListener("keydown", function(event){
  
//   // Print out the event details to the console
//   console.log(event);
//   // Print out what key we just pressed
//   console.log("what did we just press:")
//   console.log(event.key)
  
//   // Check if the key we pressed is the Enter key
//   // If so, turn our page blue
//   // if (event.key == "Enter"){
//   //   result.innerText = "";
//   // }
  
//   // Change the inside of the result paragraph to include the key we just pressed
//   result.innerText = "You just pressed: " + event.key;
  
  
// })
  
  function playNote(note) {
    console.log('Playing note: ' + note);
    document.getElementById('note-indicator').innerHTML = note;
    document.getElementById(note).classList.add('pressed');
    // Stop the note if it's already playing
    var notePlaying = keyMap[note].audio;
    if (notePlaying) {
      notePlaying.pause();
      notePlaying.currentTime = 0;
      keyMap[note].audio = undefined;
    }
    // Play the note
    var noteURL = './sound/' + note + '.mp3';
    var noteSound = new Audio(noteURL);
    keyMap[note].audio = noteSound;
    noteSound.play();
  }
  
  function stopNote(note) {
    // Stop the note only if the damper pedal is up
    if (!damperPedalDown) {
      console.log('Stopping note: ' + note);
      document.getElementById(note).classList.remove('pressed');
      var notePlaying = keyMap[note].audio;
      if (notePlaying) {
        // Stop the note
        notePlaying.pause();
        notePlaying.currentTime = 0;
        keyMap[note].audio = undefined;
      }
    }
  }
  
  function stopAllNotes() {
    Object.keys(keyMap).forEach(function(key) {
      stopNote(key);
    });
  }

  
 
// Generate shapes for each note repeatedly
  var keys = document.querySelectorAll('.key');
  document.addEventListener("keypress", function(){
    keys.forEach((key) =>{
      if(key.classList.contains("C4") && key.classList.contains("pressed")){
        console.log("C4 press");
        var shapeC4 = document.createElement("div");
        shapeC4.classList.add("shapec4");
        document.querySelector(".shape-container").appendChild(shapeC4);
        shapeC4.style.left = (95*Math.random())+'%';
        shapeC4.style.top=(95*Math.random()) +'%';
      }else if(key.classList.contains("Db4") && key.classList.contains("pressed")){
        console.log("Db4 press");
        var shapeD4 = document.querySelectorAll(".shaped4");
        shapeD4.forEach((shape)=>{
          shape.style.width = "90px";
          shape.style.height = "90px";
          shape.style.left = (95*Math.random())+'%';
          shape.style.top=(95*Math.random()) +'%';
        })
      }else if(key.classList.contains("D4") && key.classList.contains("pressed")){
        console.log("D4 press");
        var shapeD4 = document.createElement("div");
        shapeD4.classList.add("shaped4");
        document.querySelector(".shape-container").appendChild(shapeD4);
        shapeD4.style.left = (95*Math.random())+'%';
        shapeD4.style.top=(95*Math.random()) +'%';
      }else if(key.classList.contains("Eb4") && key.classList.contains("pressed")){
        console.log("Eb4 press");
        var shapeEb4 = document.createElement("div");
        shapeEb4.classList.add("shapeeb4");
        document.querySelector(".shape-container").appendChild(shapeEb4);
        shapeEb4.style.left = (95*Math.random())+'%';
        shapeEb4.style.top=(95*Math.random()) +'%';
      }else if(key.classList.contains("E4") && key.classList.contains("pressed")){
        console.log("E4 press");
        var shapeE4 = document.createElement("div");
        shapeE4.classList.add("shapee4");
        document.querySelector(".shape-container").appendChild(shapeE4);
        shapeE4.style.left = (95*Math.random())+'%';
        shapeE4.style.top=(95*Math.random()) +'%';
      }else if(key.classList.contains("F4") && key.classList.contains("pressed")){
        console.log("F4 press");
        var shapeF4 = document.createElement("div");
        shapeF4.classList.add("shapef4");
        document.querySelector(".shape-container").appendChild(shapeF4);
        shapeF4.style.left = (95*Math.random())+'%';
        shapeF4.style.top=(95*Math.random()) +'%';
      }else if(key.classList.contains("Gb4") && key.classList.contains("pressed")){
        console.log("Gb4 press");
        var shapeD4 = document.querySelectorAll(".shaped4");
        shapeD4.forEach((shape)=>{
          shape.style.border ="2px solid #4B8585";
          shape.style.left = (95*Math.random())+'%';
          shape.style.top=(95*Math.random()) +'%';
        })
      }else if(key.classList.contains("G4") && key.classList.contains("pressed")){
        console.log("G4 press");
        var shapeC4 = document.querySelectorAll(".shapec4");
        shapeC4.forEach((shape)=>{
          shape.style.backgroundColor = "#D45F82";
          shape.style.left = (95*Math.random())+'%';
          shape.style.top=(95*Math.random()) +'%';
        })
      }else if(key.classList.contains("Ab4") && key.classList.contains("pressed")){
        console.log("Ab4 press");
        var shapeE4 = document.querySelectorAll(".shapee4");
        shapeE4.forEach((shape)=>{
          shape.style.width = "120px";
          shape.style.height = "120px";
          shape.style.left = (95*Math.random())+'%';
          shape.style.top=(95*Math.random()) +'%';
        })
      }else if(key.classList.contains("A4") && key.classList.contains("pressed")){
        console.log("A4 press");
        var shapeA4 = document.createElement("div");
        shapeA4.classList.add("shapea4");
        document.querySelector(".shape-container").appendChild(shapeA4);
        shapeA4.style.left = (95*Math.random())+'%';
        shapeA4.style.top=(95*Math.random()) +'%';
      }else if(key.classList.contains("Bb4") && key.classList.contains("pressed")){
        console.log("Bb4 press");
        var shapeE5 = document.querySelectorAll(".shapee5");
        shapeE5.forEach((shape)=>{
          shape.style.width = "120px";
          shape.style.height = "120px";
          shape.style.left = (95*Math.random())+'%';
          shape.style.top=(95*Math.random()) +'%';
        })
      }else if(key.classList.contains("B4") && key.classList.contains("pressed")){
        console.log("B4 press");
        var shapeB4 = document.createElement("div");
        shapeB4.classList.add("shapeb4");
        document.querySelector(".shape-container").appendChild(shapeB4);
        shapeB4.style.left = (95*Math.random())+'%';
        shapeB4.style.top=(95*Math.random()) +'%';
      }else if(key.classList.contains("C5") && key.classList.contains("pressed")){
        console.log("C5 press");
        var shapeC5 = document.createElement("div");
        shapeC5.classList.add("shapec5");
        document.querySelector(".shape-container").appendChild(shapeC5);
        shapeC5.style.left = (95*Math.random())+'%';
        shapeC5.style.top=(95*Math.random()) +'%';
      }else if(key.classList.contains("Db5") && key.classList.contains("pressed")){
        console.log("Db5 press");
        var shapeDb5 = document.createElement("div");
        shapeDb5.classList.add("shapedb5");
        document.querySelector(".shape-container").appendChild(shapeDb5);
        shapeDb5.style.left = (95*Math.random())+'%';
        shapeDb5.style.top=(95*Math.random()) +'%';
      }else if(key.classList.contains("D5") && key.classList.contains("pressed")){
        console.log("D5 press");
        var shapeA4 = document.querySelectorAll(".shapea4");
        shapeA4.forEach((shape)=>{
          shape.style.width = "30px";
          shape.style.height = "30px";
          shape.style.border ="2px solid #a4c58f";
          shape.style.backgroundColor ="transparent";
          shape.style.left = (95*Math.random())+'%';
          shape.style.top=(95*Math.random()) +'%';
        })
      }else if(key.classList.contains("Eb5") && key.classList.contains("pressed")){
        console.log("Eb5 press");
        var shapeEb5 = document.createElement("div");
        shapeEb5.classList.add("shapeeb5");
        document.querySelector(".shape-container").appendChild(shapeEb5);
        shapeEb5.style.left = (95*Math.random())+'%';
        shapeEb5.style.top=(95*Math.random()) +'%';
      }else if(key.classList.contains("E5") && key.classList.contains("pressed")){
        console.log("E5 press");
        var shapeE5 = document.createElement("div");
        shapeE5.classList.add("shapee5");
        document.querySelector(".shape-container").appendChild(shapeE5);
        shapeE5.style.left = (95*Math.random())+'%';
        shapeE5.style.top=(95*Math.random()) +'%';
      }else if(key.classList.contains("Small-Rack-Tom") && key.classList.contains("pressed")){
        console.log("Small-Rack-Tom press");
        var shapeSrt = document.createElement("div");
        shapeSrt.classList.add("shapesrt");
        document.querySelector(".shape-container").appendChild(shapeSrt);
        shapeSrt.style.left = (95*Math.random())+'%';
        shapeSrt.style.top=(95*Math.random()) +'%';
        
      }else if(key.classList.contains("Big-Rack-Tom") && key.classList.contains("pressed")){
        console.log("Big-Rack-Tom press");
        var shapeBrt = document.createElement("div");
        shapeBrt.classList.add("shapebrt");
        document.querySelector(".shape-container").appendChild(shapeBrt);
        shapeBrt.style.left = (95*Math.random())+'%';
        shapeBrt.style.top=(95*Math.random()) +'%';
      }else if(key.classList.contains("Floor-Tom") && key.classList.contains("pressed")){
        console.log("Floor-Tom press");
        var shapeFt = document.createElement("div");
        shapeFt.classList.add("shapeft");
        document.querySelector(".shape-container").appendChild(shapeFt);
        shapeFt.style.left = (95*Math.random())+'%';
        shapeFt.style.top=(95*Math.random()) +'%';


      }else if(key.classList.contains("High-Hat-Open") && key.classList.contains("pressed")){
        console.log("High-Hat-Open press");
        var shapeHho = document.createElement("div");
        shapeHho.classList.add("shapehho");
        document.querySelector(".shape-container").appendChild(shapeHho);
        shapeHho.style.left = (95*Math.random())+'%';
        shapeHho.style.top=(95*Math.random()) +'%';
      }else if(key.classList.contains("Hi-Hat-Closed") && key.classList.contains("pressed")){
        console.log("Hi-Hat-Closed press");
        var shapeHhc = document.createElement("div");
        shapeHhc.classList.add("shapehhc");
        document.querySelector(".shape-container").appendChild(shapeHhc);
        shapeHhc.style.left = (95*Math.random())+'%';
        shapeHhc.style.top=(95*Math.random()) +'%';
      }else if(key.classList.contains("Kick") && key.classList.contains("pressed")){
        console.log("Kick press");
        var shapeF4 = document.querySelectorAll(".shapef4");
        shapeF4.forEach((shape)=>{
          shape.style.width = "100px";
          shape.style.height = "100px";
          shape.style.borderRadius ="50% 50%";
          shape.style.backgroundColor ="#B99DF4";
          shape.style.left = (95*Math.random())+'%';
          shape.style.top=(95*Math.random()) +'%';
        })
      }else if(key.classList.contains("Snare") && key.classList.contains("pressed")){
        console.log("Snare press");
        var shapeSn = document.createElement("div");
        shapeSn.classList.add("shapesn");
        document.querySelector(".shape-container").appendChild(shapeSn);
        shapeSn.style.left = (95*Math.random())+'%';
        shapeSn.style.top=(95*Math.random()) +'%';
        
      }else if(key.classList.contains("Shaker") && key.classList.contains("pressed")){
        console.log("Shaker press");
       var shapeEb5 = document.querySelectorAll(".shapeeb5");
        shapeEb5.forEach((shape)=>{
          shape.style.width = "20px";
          shape.style.height = "20px";
          shape.style.borderRadius ="50% 50%";
          shape.style.left = (95*Math.random())+'%';
          shape.style.top=(95*Math.random()) +'%';
        })
      }else if(key.classList.contains("Clap") && key.classList.contains("pressed")){
        console.log("Clap press");
         var shapeE4 = document.querySelectorAll(".shapee4");
        shapeE4.forEach((shape)=>{
          shape.style.width = "150px";
          shape.style.height = "150px";
          shape.style.borderRadius ="50% 50%";
          shape.style.left = (95*Math.random())+'%';
          shape.style.top=(95*Math.random()) +'%';
        })
      }else if(key.classList.contains("Drum-Fill") && key.classList.contains("pressed")){
        console.log("Drum-Fill press");
         var shapeEb4 = document.querySelectorAll(".shapeeb4");
        shapeEb4.forEach((shape)=>{
          shape.style.border ="none";
          shape.style.backgroundColor ="#e76161";
          shape.style.width = "40px";
          shape.style.height = "40px";
          shape.style.borderRadius ="50% 50%";
          shape.style.left = (95*Math.random())+'%';
          shape.style.top=(95*Math.random()) +'%';
        })
      }else if(key.classList.contains("Piano-Chord") && key.classList.contains("pressed")){
        console.log("Piano-Chord press");
        var shapeF4 = document.querySelectorAll(".shapef4");
        shapeF4.forEach((shape)=>{
          shape.style.backgroundColor ="#FAEE81";
          shape.style.left = (95*Math.random())+'%';
          shape.style.top=(95*Math.random()) +'%';
        })
      }else if(key.classList.contains("Guitar-Low") && key.classList.contains("pressed")){
        console.log("Guitar-Low press");
        var shapeGl = document.createElement("div");
        shapeGl.classList.add("shapegl");
        document.querySelector(".shape-container").appendChild(shapeGl);
        shapeGl.style.left = (95*Math.random())+'%';
        shapeGl.style.top=(95*Math.random()) +'%';
      }else if(key.classList.contains("Guitar-High") && key.classList.contains("pressed")){
        console.log("Guitar-High press");
        var shapeGh = document.createElement("div");
        shapeGh.classList.add("shapegh");
        document.querySelector(".shape-container").appendChild(shapeGh);
        shapeGh.style.left = (95*Math.random())+'%';
        shapeGh.style.top=(95*Math.random()) +'%';
      
      }else if(key.classList.contains("Guitar-Chord1") && key.classList.contains("pressed")){
        console.log("Guitar-Chord1 press");
        var shapeDb5 = document.querySelectorAll(".shapedb5");
        shapeDb5.forEach((shape)=>{
          shape.style.width = '1px';
          shape.style.border ="2px solid #6E7CFF";
          shape.style.backgroundColor ="transparent";
          shape.style.left = (95*Math.random())+'%';
          shape.style.top=(95*Math.random()) +'%';
        })
      }else if(key.classList.contains("Guitar-Chord2") && key.classList.contains("pressed")){
        console.log("Guitar-Chord2 press");
        var shapePc2 = document.createElement("div");
        shapePc2.classList.add("shapepc2");
        document.querySelector(".shape-container").appendChild(shapePc2);
        shapePc2.style.left = (95*Math.random())+'%';
        shapePc2.style.top=(95*Math.random()) +'%';
      }else if(key.classList.contains("Guitar-Chord3") && key.classList.contains("pressed")){
        console.log("Guitar-Chord3 press");
        var shapeEb5 = document.querySelectorAll(".shapeeb5");
        shapeEb5.forEach((shape)=>{
          shape.style.border ="none";
          shape.style.backgroundColor ="#95e2be";
          shape.style.width ='3px';
          shape.style.height = '50px';
          shape.style.left = (95*Math.random())+'%';
          shape.style.top=(95*Math.random()) +'%';
        })
      }else if(key.classList.contains("Guitar-Chord4") && key.classList.contains("pressed")){
        console.log("Guitar-Chord4 press");
        var shapeE5 = document.querySelectorAll(".shapee5");
        shapeE5.forEach((shape)=>{
          shape.style.width = "10px";
          shape.style.height = "100px";
          shape.style.left = (95*Math.random())+'%';
          shape.style.top=(95*Math.random()) +'%';
        })
      }
      
      
      
      
   

    });
    
  })


// remove all the shapes on the page  
  document.addEventListener("keydown", function(){
    
      if (event.key == "Enter"){
        console.log("enter");
        document.querySelector(".keyboard").classList.toggle("hide");
        document.querySelector("#note-indicator").classList.toggle("hide");
      }else if (event.keyCode == 8){
        console.log("backspace");
        document.querySelector("#note-indicator").innerText = "Press any keys";
        var randomColor = [];
        index = 0;
        randomColor[0] = '#63617B';
        randomColor[1] = '#6A4D59';
        randomColor[2] = '#667772';
        randomColor[3] = '#736559';
        randomColor[4] = '#6A446D';
        randomColor[5] = '#762B42';
        randomColor[6] = '#453747';
        randomColor[7] = '#51657D';
        
        
        index = Math.floor(Math.random() * randomColor.length);
        console.log(randomColor.length);
        document.querySelector('body').style.backgroundColor = ""+randomColor[index]+"";
        var removeC4 = document.querySelectorAll('.shapec4');
    removeC4.forEach((e)=>{
      e.remove();
    })
    var removeDb4 = document.querySelectorAll('.shapedb4');
    removeDb4.forEach((e)=>{
      e.remove();
    })
    var removeD4 = document.querySelectorAll('.shaped4');
    removeD4.forEach((e)=>{
      e.remove();
    })
    var removeEb4 = document.querySelectorAll('.shapeeb4');
    removeEb4.forEach((e)=>{
      e.remove();
    })
    var removeE4 = document.querySelectorAll('.shapee4');
    removeE4.forEach((e)=>{
      e.remove();
    })
    var removeF4 = document.querySelectorAll('.shapef4');
    removeF4.forEach((e)=>{
      e.remove();
    })
    var removeGb4 = document.querySelectorAll('.shapegb4');
    removeGb4.forEach((e)=>{
      e.remove();
    })
    var removeG4 = document.querySelectorAll('.shapeg4');
    removeG4.forEach((e)=>{
      e.remove();
    })
    var removeAb4 = document.querySelectorAll('.shapeab4');
    removeAb4.forEach((e)=>{
      e.remove();
    })
    var removeA4 = document.querySelectorAll('.shapea4');
    removeA4.forEach((e)=>{
      e.remove();
    })
    var removeBb4 = document.querySelectorAll('.shapebb4');
    removeBb4.forEach((e)=>{
      e.remove();
    })
    var removeB4 = document.querySelectorAll('.shapeb4');
    removeB4.forEach((e)=>{
      e.remove();
    })
    var removeC5 = document.querySelectorAll('.shapec5');
    removeC5.forEach((e)=>{
      e.remove();
    })
    var removeDb5 = document.querySelectorAll('.shapedb5');
    removeDb5.forEach((e)=>{
      e.remove();
    })
    var removeD5 = document.querySelectorAll('.shaped5');
    removeD5.forEach((e)=>{
      e.remove();
    })
    var removeEb5 = document.querySelectorAll('.shapeeb5');
    removeEb5.forEach((e)=>{
      e.remove();
    })
    var removeE5 = document.querySelectorAll('.shapee5');
    removeE5.forEach((e)=>{
      e.remove();
    })
    var removeBrt = document.querySelectorAll('.shapebrt');
    removeBrt.forEach((e)=>{
      e.remove();
    })
    var removeGl = document.querySelectorAll('.shapegl');
    removeGl.forEach((e)=>{
      e.remove();
    })
    var removeSrt = document.querySelectorAll('.shapesrt');
    removeSrt.forEach((e)=>{
      e.remove();
    })
    var removeGh = document.querySelectorAll('.shapegh');
    removeGh.forEach((e)=>{
      e.remove();
    })
    var removePc2 = document.querySelectorAll('.shapepc2');
    removePc2.forEach((e)=>{
      e.remove();
    })
    var removeSn = document.querySelectorAll('.shapesn');
    removeSn.forEach((e)=>{
      e.remove();
    })
    var removeFt = document.querySelectorAll('.shapeft');
    removeFt.forEach((e)=>{
      e.remove();
    })
    var removeHho = document.querySelectorAll('.shapehho');
    removeHho.forEach((e)=>{
      e.remove();
    })
    var removeHhc = document.querySelectorAll('.shapehhc');
    removeHhc.forEach((e)=>{
      e.remove();
    })
    // document.body.style.backgroundColor ="#6A4D59";
    // document.querySelector('#note-indicator').style.backgroundColor = '#6A4D59';
      }
    })
  

 
  
//remove all shapes when click
  // document.body.addEventListener("click", function(){
  //   var removeC4 = document.querySelectorAll('.shapec4');
  //   removeC4.forEach((e)=>{
  //     e.remove();
  //   })
  //   var removeDb4 = document.querySelectorAll('.shapedb4');
  //   removeDb4.forEach((e)=>{
  //     e.remove();
  //   })
  //   var removeD4 = document.querySelectorAll('.shaped4');
  //   removeD4.forEach((e)=>{
  //     e.remove();
  //   })
  //   var removeEb4 = document.querySelectorAll('.shapeeb4');
  //   removeEb4.forEach((e)=>{
  //     e.remove();
  //   })
  //   var removeE4 = document.querySelectorAll('.shapee4');
  //   removeE4.forEach((e)=>{
  //     e.remove();
  //   })
  //   var removeF4 = document.querySelectorAll('.shapef4');
  //   removeF4.forEach((e)=>{
  //     e.remove();
  //   })
  //   var removeGb4 = document.querySelectorAll('.shapegb4');
  //   removeGb4.forEach((e)=>{
  //     e.remove();
  //   })
  //   var removeG4 = document.querySelectorAll('.shapeg4');
  //   removeG4.forEach((e)=>{
  //     e.remove();
  //   })
  //   var removeAb4 = document.querySelectorAll('.shapeab4');
  //   removeAb4.forEach((e)=>{
  //     e.remove();
  //   })
  //   var removeA4 = document.querySelectorAll('.shapea4');
  //   removeA4.forEach((e)=>{
  //     e.remove();
  //   })
  //   var removeBb4 = document.querySelectorAll('.shapebb4');
  //   removeBb4.forEach((e)=>{
  //     e.remove();
  //   })
  //   var removeB4 = document.querySelectorAll('.shapeb4');
  //   removeB4.forEach((e)=>{
  //     e.remove();
  //   })
  //   var removeC5 = document.querySelectorAll('.shapec5');
  //   removeC5.forEach((e)=>{
  //     e.remove();
  //   })

  // })
  
