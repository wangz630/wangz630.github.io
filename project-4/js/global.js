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
    // var noteURL = 'https://itu.dk/people/tiwr/piano/' + note + '.mp3';
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

  
 
// Generate shapes for each note
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
        var shapeDb4 = document.createElement("div");
        shapeDb4.classList.add("shapedb4");
        document.querySelector(".shape-container").appendChild(shapeDb4);
        shapeDb4.style.left = (95*Math.random())+'%';
        shapeDb4.style.top=(95*Math.random()) +'%';
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
        var shapeGb4 = document.createElement("div");
        shapeGb4.classList.add("shapegb4");
        document.querySelector(".shape-container").appendChild(shapeGb4);
        shapeGb4.style.left = (95*Math.random())+'%';
        shapeGb4.style.top=(95*Math.random()) +'%';
      }else if(key.classList.contains("G4") && key.classList.contains("pressed")){
        console.log("G4 press");
        var shapeG4 = document.createElement("div");
        shapeG4.classList.add("shapeg4");
        document.querySelector(".shape-container").appendChild(shapeG4);
        shapeG4.style.left = (95*Math.random())+'%';
        shapeG4.style.top=(95*Math.random()) +'%';
      }else if(key.classList.contains("Ab4") && key.classList.contains("pressed")){
        console.log("Ab4 press");
        var shapeAb4 = document.createElement("div");
        shapeAb4.classList.add("shapeab4");
        document.querySelector(".shape-container").appendChild(shapeAb4);
        shapeAb4.style.left = (95*Math.random())+'%';
        shapeAb4.style.top=(95*Math.random()) +'%';
      }else if(key.classList.contains("A4") && key.classList.contains("pressed")){
        console.log("A4 press");
        var shapeA4 = document.createElement("div");
        shapeA4.classList.add("shapea4");
        document.querySelector(".shape-container").appendChild(shapeA4);
        shapeA4.style.left = (95*Math.random())+'%';
        shapeA4.style.top=(95*Math.random()) +'%';
      }else if(key.classList.contains("Bb4") && key.classList.contains("pressed")){
        console.log("Bb4 press");
        var shapeBb4 = document.createElement("div");
        shapeBb4.classList.add("shapebb4");
        document.querySelector(".shape-container").appendChild(shapeBb4);
        shapeBb4.style.left = (95*Math.random())+'%';
        shapeBb4.style.top=(95*Math.random()) +'%';
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
        var shapeD5 = document.createElement("div");
        shapeD5.classList.add("shaped5");
        document.querySelector(".shape-container").appendChild(shapeD5);
        shapeD5.style.left = (95*Math.random())+'%';
        shapeD5.style.top=(95*Math.random()) +'%';
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
        var shapeC4 = document.querySelectorAll(".shapec4");
        shapeC4.forEach((shape)=>{
          shape.style.backgroundColor ="#BC7ED1";
          shape.style.left = (95*Math.random())+'%';
          shape.style.top=(95*Math.random()) +'%';
          // shape.style.backgroundColor ="#" + ("00000" + ((Math.random() * 16777215 + 0.5) >> 0).toString(16)).slice(-6);
        })
      }else if(key.classList.contains("Big-Rack-Tom") && key.classList.contains("pressed")){
        console.log("Big-Rack-Tom press");
        var shapeDb4 = document.querySelectorAll(".shapedb4");
        shapeDb4.forEach((shape)=>{
          shape.style.backgroundColor ="#7E86D1";
          shape.style.left = (95*Math.random())+'%';
          shape.style.top=(95*Math.random()) +'%';
        })
      }else if(key.classList.contains("Floor-Tom") && key.classList.contains("pressed")){
        console.log("Floor-Tom press");
        var shapeD4 = document.querySelectorAll(".shaped4");
        shapeD4.forEach((shape)=>{
          shape.style.border ="2px solid #4B8585";
          shape.style.left = (95*Math.random())+'%';
          shape.style.top=(95*Math.random()) +'%';
        })
      }else if(key.classList.contains("High-Hat-Open") && key.classList.contains("pressed")){
        console.log("High-Hat-Open press");
        var shapeEb4 = document.querySelectorAll(".shapeeb4");
        shapeEb4.forEach((shape)=>{
          shape.style.border ="none";
          shape.style.backgroundColor ="#e76161";
          shape.style.left = (95*Math.random())+'%';
          shape.style.top=(95*Math.random()) +'%';
        })
      }else if(key.classList.contains("Hi-Hat-Closed") && key.classList.contains("pressed")){
        console.log("Hi-Hat-Closed press");
        var shapeE4 = document.querySelectorAll(".shapee4");
        shapeE4.forEach((shape)=>{
          shape.style.width = "150px";
          shape.style.height = "150px";
          shape.style.left = (95*Math.random())+'%';
          shape.style.top=(95*Math.random()) +'%';
        })
      }else if(key.classList.contains("Kick") && key.classList.contains("pressed")){
        console.log("Kick press");
        var shapeF4 = document.querySelectorAll(".shapef4");
        shapeF4.forEach((shape)=>{
          shape.style.width = "100px";
          shape.style.height = "100px";
          shape.style.backgroundColor ="#B99DF4";
          shape.style.left = (95*Math.random())+'%';
          shape.style.top=(95*Math.random()) +'%';
        })
      }else if(key.classList.contains("Snare") && key.classList.contains("pressed")){
        console.log("Snare press");
        var shapeGb4 = document.querySelectorAll(".shapegb4");
        shapeGb4.forEach((shape)=>{
          shape.style.backgroundColor ="#EB7D7D";
          shape.style.left = (95*Math.random())+'%';
          shape.style.top=(95*Math.random()) +'%';
        })
      }else if(key.classList.contains("Shaker") && key.classList.contains("pressed")){
        console.log("Shaker press");
        var shapeG4 = document.querySelectorAll(".shapeg4");
        shapeG4.forEach((shape)=>{
          shape.style.border ="2px solid #f3df9e";
          shape.style.backgroundColor ="transparent";
          shape.style.left = (95*Math.random())+'%';
          shape.style.top=(95*Math.random()) +'%';
        })
      }else if(key.classList.contains("Clap") && key.classList.contains("pressed")){
        console.log("Clap press");
        var shapeAb4 = document.querySelectorAll(".shapeab4");
        shapeAb4.forEach((shape)=>{
          shape.style.width = "200px";
          shape.style.height = "100px";
          shape.style.left = (95*Math.random())+'%';
          shape.style.top=(95*Math.random()) +'%';
        })
      }else if(key.classList.contains("Drum-Fill") && key.classList.contains("pressed")){
        console.log("Drum-Fill press");
        var shapeA4 = document.querySelectorAll(".shapea4");
        shapeA4.forEach((shape)=>{
          shape.style.border ="2px solid #a4c58f";
          shape.style.backgroundColor ="transparent";
          // shape.style.left = (95*Math.random())+'%';
          // shape.style.top=(95*Math.random()) +'%';
        })
      }else if(key.classList.contains("Piano-Chord") && key.classList.contains("pressed")){
        console.log("Piano-Chord press");
        var shapeBb4 = document.querySelectorAll(".shapebb4");
        shapeBb4.forEach((shape)=>{
          shape.style.width = "200px";
          shape.style.height = "200px";
          shape.style.backgroundColor ="transparent";
          shape.style.left = (95*Math.random())+'%';
          shape.style.top=(95*Math.random()) +'%';
        })
      }else if(key.classList.contains("Guitar-Low") && key.classList.contains("pressed")){
        console.log("Guitar-Low press");
        var shapeB4 = document.querySelectorAll(".shapeb4");
        shapeB4.forEach((shape)=>{
          shape.style.width = "20px";
          shape.style.height = "20px";
          shape.style.left = (95*Math.random())+'%';
          shape.style.top=(95*Math.random()) +'%';
        })
      }else if(key.classList.contains("Guitar-High") && key.classList.contains("pressed")){
        console.log("Guitar-High press");
        var shapeC5 = document.querySelectorAll(".shapec5");
        shapeC5.forEach((shape)=>{
          shape.style.backgroundColor ="#FBF683";
          shape.style.left = (95*Math.random())+'%';
          shape.style.top=(95*Math.random()) +'%';
        })
      }else if(key.classList.contains("Guitar-Chord1") && key.classList.contains("pressed")){
        console.log("Guitar-Chord1 press");
        var shapeDb5 = document.querySelectorAll(".shapedb5");
        shapeDb5.forEach((shape)=>{
          shape.style.border ="2px solid #6E7CFF";
          shape.style.backgroundColor ="transparent";
          shape.style.left = (95*Math.random())+'%';
          shape.style.top=(95*Math.random()) +'%';
        })
      }else if(key.classList.contains("Guitar-Chord2") && key.classList.contains("pressed")){
        console.log("Guitar-Chord2 press");
        var shapeD5 = document.querySelectorAll(".shaped5");
        shapeD5.forEach((shape)=>{
          shape.style.width = "30px";
          shape.style.height = "30px";
          shape.style.borderRadius = "50% 50%";
          shape.style.left = (95*Math.random())+'%';
          shape.style.top=(95*Math.random()) +'%';
        })
      }else if(key.classList.contains("Guitar-Chord3") && key.classList.contains("pressed")){
        console.log("Guitar-Chord3 press");
        var shapeEb5 = document.querySelectorAll(".shapeeb5");
        shapeEb5.forEach((shape)=>{
          shape.style.border ="none";
          shape.style.backgroundColor ="#95e2be";
          shape.style.left = (95*Math.random())+'%';
          shape.style.top=(95*Math.random()) +'%';
        })
      }else if(key.classList.contains("Guitar-Chord4") && key.classList.contains("pressed")){
        console.log("Guitar-Chord4 press");
        var shapeE5 = document.querySelectorAll(".shapee5");
        shapeE5.forEach((shape)=>{
          shape.style.width = "10px";
          shape.style.height = "10px";
          shape.style.left = (95*Math.random())+'%';
          shape.style.top=(95*Math.random()) +'%';
        })
      }
      
      
      
      
   

    });
    
  })
  
  document.addEventListener("keydown", function(){
    
      if (event.key == "Enter"){
        console.log("enter");
        document.querySelector(".keyboard").classList.toggle("hide");
        document.querySelector("#note-indicator").classList.toggle("hide");
      }else if (event.keyCode == 8){
        console.log("backspace");
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
  
