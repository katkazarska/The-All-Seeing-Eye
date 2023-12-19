
let soundfile = [];
let currentSong = [];
let currentIndex;
let low = [];
let t = 0.5;
let amp1; let fft3;
let color1; let color2;

function preload() {

  for (let i = 0; i < 14; i++) {
    let fileVocals = str(i) + '/vocals.m4a';
    let fileBack = str(i) + '/backing vocals.m4a';
    let fileInstr = str(i) + '/other.m4a';
    soundfile.push(loadSound(fileVocals));
    soundfile.push(loadSound(fileBack));
    soundfile.push(loadSound(fileInstr));
  }
  for (const sound of soundfile) {
    sound.stop();
  }
}

function setup() {
  background(0);
  currentIndex = 0;

  const canvas = createCanvas(windowWidth, windowHeight);
  angleMode("degrees");
  colorMode(HSB);
  canvas.touchStarted(togglePlay);

  togglePlay();
}

function draw() {
  background(0, 70);

  frame(amp1);
  
  newEye(fft3.waveform());
}

function newEye(waveform){
  push();
  translate(width/2, height/2);
  noFill();
  stroke(255);

  for (let i = 0; i <= 180; i += 5) {
    let index = round(map(i, 0, 360, 0, waveform.length-1));
    let r1 = map(waveform[index]*5, -1, 1, height/15, height/12);
    let x1 = r1 * cos(i);
    let y1 = r1 * sin(i);

    let r2 = map(waveform[index]*5, -1, 1, height/8, height/6);
    let x2 = r2 * cos(i);
    let y2 = r2 * sin(i);

    gradientLine(x1, y1, x2, y2, 
      [color(0), color(color1[0], color1[1], color1[2]), color(0)]);
    gradientLine(x1, y1-10, x2, y2-5, 
      [color(0), color(color2[0], color2[1], color2[2]), color(0)]);

    gradientLine(x1, -y1, x2, -y2, 
      [color(0), color(color1[0], color1[1], color1[2]), color(0)]);
    gradientLine(x1, -y1-10, x2, -y2-5, 
      [color(0), color(color2[0], color2[1], color2[2]), color(0)]);
  }
  pop();
}

function frame(amp){
  push();
  translate(width/2, height/2);

  //map appropriately the volume level of the vocal track
  t = map(amp.getLevel(), 0, 1, 2, 50);
  
  //cycle by two degrees
  for (let a = -90; a <= 270; a += 2) {
    //create a noise function for the edge of the frame
    let n = noise(
      cos(6*a)+1, 
      sin(6*a)+1,
      millis()/6000);
    //compute the radius so that it's dependent on the volume
    let r = map(n*t, 0, 1, height/5, height/4);
    //compute the x and y coordinates, stretched on the x axis
    let x = r * sin(a)*1.5;
    let y = r * cos(a);

    //create a noise function for color so the rays look like shining light
    let col = map(noise(x/50, y/50, millis()/1000), 0, 1, 0, 100);

    //cast the rays from the edge of the frame beyond the edge of the window
    noStroke();
    color1[2] = col;
    fill(color1);
    ray(x, y);

    color2[2] = col;
    fill(color2);
    ray(x-10, y+10);

  }
  color1[2] = 100;
  color2[2] = 100;
  pop();
}

function ray(x1, y1) {

  p1 = new p5.Vector(0, 0);
  p2 = new p5.Vector(x1, y1);

  let diagonal = new p5.Vector(windowWidth, windowHeight).mag();
  let direction = p5.Vector.sub(p2, p1).setMag(diagonal);
  let end = p5.Vector.add(p1, direction);

  quad(x1, y1, x1+10, y1, end.x, end.y, end.x+150, end.y+10);
}


function gradientLine(x1, y1, x2, y2, colors) {
  let gradient = drawingContext.createLinearGradient(x1, y1, x2, y2); 
  
  gradient.addColorStop(0, colors[0]);
  gradient.addColorStop(0.5, colors[1]);
  gradient.addColorStop(1, colors[2]); 

  drawingContext.strokeStyle = gradient; 
  line(x1, y1, x2, y2);
}

function setColor() {
  let colors = [[180, 100, 100], [60, 100, 100], [300, 100, 100]];
  color1 = random(colors);
  colors.splice(colors.indexOf(color1), 1);
  color2 = random(colors);
}

function togglePlay() {
  setColor();

  soundfile[currentIndex].stop();
  soundfile[currentIndex+1].stop();
  soundfile[currentIndex+2].stop();

  currentIndex = (currentIndex + 3) % 42;

  amp1 = new p5.Amplitude(0.9);
  amp1.setInput(soundfile[currentIndex]);

  fft3 = new p5.FFT(1, 1024);
  fft3.setInput(soundfile[currentIndex+2]);

  soundfile[currentIndex].play();
  soundfile[currentIndex+1].play();
  soundfile[currentIndex+2].play();
}