// Create a canvas element that will cover the entire screen
const canvas = document.createElement('canvas');
canvas.style.position = 'fixed';
canvas.style.top = 0;
canvas.style.left = 0;
canvas.style.width = '100%';
canvas.style.height = '100%';
canvas.style.zIndex = -1;
document.body.appendChild(canvas);

// Get the 2D context of the canvas
const context = canvas.getContext('2d');

// Generate a random noise pattern
const noiseData = [];
for (let i = 0; i < canvas.width * canvas.height; i++) {
	noiseData.push(Math.floor(Math.random() * 256));
}

// Create an image data object from the noise pattern
const noiseImage = context.createImageData(canvas.width, canvas.height);
noiseImage.data.set(noiseData);

// Render the noise pattern to the canvas
context.putImageData(noiseImage, 0, 0);

const ctx = canvas.getContext('2d');

let width = window.innerWidth;
let height = window.innerHeight;

canvas.width = width;
canvas.height = height;

const noise = () => {
  const imageData = ctx.createImageData(width, height);

  for (let i = 0; i < imageData.data.length; i += 4) {
    const value = Math.floor(Math.random() * 256);
    imageData.data[i] = value;
    imageData.data[i + 1] = value;
    imageData.data[i + 2] = value;
    imageData.data[i + 3] = 255;
  }

  ctx.putImageData(imageData, 0, 0);
};

noise();

window.addEventListener('resize', () => {
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = width;
  canvas.height = height;
  noise();
});

setInterval(noise, 100);
