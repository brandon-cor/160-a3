// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
  precision mediump float;
  attribute vec4 a_Position;
  attribute vec2 a_UV;
  varying vec2 v_UV;
  attribute vec4 a_Color;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  uniform mat4 u_ViewMatrix;
  uniform mat4 u_ProjectionMatrix;
  void main() {
    gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
    // gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
    v_UV = a_UV;
  }`

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  varying vec2 v_UV;
  uniform vec4 u_FragColor;
  uniform sampler2D u_Sampler0;
  uniform sampler2D u_Sampler1;
  uniform sampler2D u_Sampler2;
  uniform sampler2D u_Sampler3;
  uniform int u_whichTexture;
  void main() {
    if (u_whichTexture == -2) {
      gl_FragColor = u_FragColor;  // color
    } else if (u_whichTexture == -1) {
      gl_FragColor = vec4(v_UV, 1.0, 1.0); // texture coordinates
    } else if (u_whichTexture == 0) {
      gl_FragColor = texture2D(u_Sampler0, v_UV); // texture 0
    } else if (u_whichTexture == 1) {
      gl_FragColor = texture2D(u_Sampler1, v_UV); // texture 1
    } else if (u_whichTexture == 2) {
      gl_FragColor = texture2D(u_Sampler2, v_UV); // texture 2
    } else if (u_whichTexture == 3) {
      gl_FragColor = texture2D(u_Sampler3, v_UV); // texture 3
    } else {
      gl_FragColor = vec4(1.0, 0.2, 0.2, 1.0); // error
    }
  }`

// Global Variables (UI or data passed to GLSL)
let canvas;
let gl;
let a_Position;
let a_UV;
let u_FragColor;
let u_Size;
let u_ModelMatrix;
let u_GlobalRotateMatrix;
let u_ProjectionMatrix;
let u_ViewMatrix;
let isDragging = false;
let lastMouseX = 0;
let lastMouseY = 0;
let mouseRotationSensitivity = 0.5;
let u_Samplers = [];
let u_whichTexture;
let g_globalHorizontalAngle = 0.0;
let g_globalVerticalAngle = 0.0;
let g_xAngle = 0.0;
let g_yAngle = 0.0;
let g_zAngle = 0.0;
let g_xPosition = 0.0;
let g_yPosition = 0.0;
let g_zPosition = 0.0;
let g_globalScale = 1.0;
let g_moveForward = false;
let g_moveBackward = false;
let g_moveLeft = false;
let g_moveRight = false;
let g_moveSpeed = 0.1;
let g_panLeft = false;
let g_panRight = false;
let g_panSpeed = 0.5;

// 0 = empty space
// 1-4 = wall height
const g_worldMap = [
  [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
  [2, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 2],
  [2, 2, 2, 0, 0, 3, 0, 0, 2, 2, 2, 2, 0, 0, 2],
  [2, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 2, 0, 0, 2],
  [2, 0, 5, 2, 2, 5, 2, 0, 2, 2, 0, 2, 0, 0, 2],
  [2, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 2, 0, 0, 2],
  [2, 1, 2, 3, 2, 2, 2, 0, 0, 2, 0, 2, 0, 0, 2],
  [2, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 2, 0, 0, 2],
  [2, 0, 2, 2, 2, 2, 2, 0, 0, 2, 0, 2, 0, 0, 2],
  [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 2],
  [2, 2, 2, 2, 2, 2, 2, 2, 4, 2, 5, 2, 0, 0, 2],
  [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
  [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
  [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
  [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2]
];

const setupWebGL = () => {
  // Retrieve <canvas> element
  canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  // gl = getWebGLContext(canvas);
  gl = canvas.getContext("webgl", { preserveDrawingBuffer: true });
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }
  // Enable blending and set blend function
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  gl.enable(gl.DEPTH_TEST);
}

const connectVariablesToGLSL = () => {
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  // Get the storage location of a_UV
  a_UV = gl.getAttribLocation(gl.program, 'a_UV');
  if (a_UV < 0) {
    console.log('Failed to get the storage location of a_UV');
    return;
  }

  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }

  // Get the storage location of u_ModelMatrix
  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if (!u_ModelMatrix) {
    console.log('Failed to get the storage location of u_ModelMatrix');
    return;
  }

  u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
  if (!u_GlobalRotateMatrix) {
    console.log('Failed to get the storage location of u_GlobalRotateMatrix');
    return;
  }

  u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
  if (!u_ViewMatrix) {
    console.log('Failed to get the storage location of u_ViewMatrix');
    return;
  }

  u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
  if (!u_ProjectionMatrix) {
    console.log('Failed to get the storage location of u_ProjectionMatrix');
    return;
  }

  let u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
  if (!u_Sampler0) {
    console.log('Failed to get the storage location of u_Sampler0');
    return false;
  }
  u_Samplers.push(u_Sampler0);

  let u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1');
  if (!u_Sampler1) {
    console.log('Failed to get the storage location of u_Sampler1');
    return false;
  }
  u_Samplers.push(u_Sampler1);

  let u_Sampler2 = gl.getUniformLocation(gl.program, 'u_Sampler2');
  if (!u_Sampler2) {
    console.log('Failed to get the storage location of u_Sampler2');
    return false;
  }
  u_Samplers.push(u_Sampler2);

  let u_Sampler3 = gl.getUniformLocation(gl.program, 'u_Sampler3');
  if (!u_Sampler3) {
    console.log('Failed to get the storage location of u_Sampler3');
    return false;
  }
  u_Samplers.push(u_Sampler3);

  u_whichTexture = gl.getUniformLocation(gl.program, 'u_whichTexture');
  if (!u_whichTexture) {
    console.log('Failed to get the storage location of u_whichTexture');
    return false;
  }
}

let images = {
  0: 'ground.jpg',
  1: 'cloud-sky.jpg',
  2: 'dog-fur.jpeg',
  3: 'dog-tail.jpg',
}

function initTextures() {
  for (let i = 0; i < Object.keys(images).length; i++) {
    const image = new Image();
    if (!image) {
      console.log('Failed to create the image object');
      return false;
    }

    image.onload = function () { sendImageToTexture(image, i); };
    // Tell the browser to load an Image
    image.src = images[i];
    console.log(image.src);
  }

  return true;
}

function sendImageToTexture(image, textureNum) {
  // Create a texture object
  var texture = gl.createTexture();
  if (!texture) {
    console.log('Failed to create the texture object');
    return false;
  }

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);  // Flip the image's y axis
  // Activate texture unit0
  gl.activeTexture(gl.TEXTURE0 + textureNum);
  // Bind the texture object to the target
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Set the texture parameter
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  // Set the image to texture
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

  // Set the texture unit to the sampler
  gl.uniform1i(u_Samplers[textureNum], textureNum);

}


const g_startTime = performance.now() / 1000.0;
let g_seconds = performance.now() / 1000.0 - g_startTime;

const tick = () => {
  g_seconds = performance.now() / 1000.0 - g_startTime;

  // Update camera position based on movement flags
  if (g_moveForward) {
    g_camera.moveForward(g_moveSpeed);
  }
  if (g_moveBackward) {
    g_camera.moveForward(-g_moveSpeed);
  }
  if (g_moveLeft) {
    g_camera.moveRight(-g_moveSpeed);
  }
  if (g_moveRight) {
    g_camera.moveRight(g_moveSpeed);
  }

  updateCamera();
  renderAllShapes();
  renderdog();
  requestAnimationFrame(tick);
}


const convertCoordinateEventToGL = (ev) => {
  let x = ev.clientX; // x coordinate of a mouse pointer
  let y = ev.clientY; // y coordinate of a mouse pointer
  let rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width / 2) / (canvas.width / 2);
  y = (canvas.height / 2 - (y - rect.top)) / (canvas.height / 2);

  return [x, y];
}

const updateCamera = () => {
  if (g_panLeft) {
    g_camera.turnLeft();
  }
  if (g_panRight) {
    g_camera.turnRight();
  }
  renderAllShapes();
}

let g_camera = new Camera();

const renderAllShapes = () => {
  let startTime = performance.now();
  gl.clearColor(0, 0, 0, 1.0);  // This sets the background to black
  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  const globalRotateMatrix = new Matrix4();
  globalRotateMatrix.rotate(g_globalVerticalAngle, 1, 0, 0);
  globalRotateMatrix.rotate(g_globalHorizontalAngle, 0, 1, 0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotateMatrix.elements);

  const perspectiveMatrix = new Matrix4();
  perspectiveMatrix.setPerspective(60, canvas.width / canvas.height, 0.1, 100);
  gl.uniformMatrix4fv(u_ProjectionMatrix, false, perspectiveMatrix.elements);

  const viewMatrix = new Matrix4();
  viewMatrix.setLookAt(g_camera.eye.elements[0], g_camera.eye.elements[1], g_camera.eye.elements[2],
    g_camera.at.elements[0], g_camera.at.elements[1], g_camera.at.elements[2],
    g_camera.up.elements[0], g_camera.up.elements[1], g_camera.up.elements[2]);
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);

  const cube = new Cube();
  cube.color = [1, 0, 0, 1];
  cube.textureNum = 0;
  cube.matrix.translate(0, -0.5, 0);
  cube.matrix.scale(50, 0, 50);
  cube.matrix.translate(-0.5, 0, -0.5);
  cube.render();

  renderWalls();

  const sky = new Cube();
  sky.color = [1, 1, 1, 1];
  sky.textureNum = 1;  // This should be using the cloud-sky.jpg texture
  sky.matrix.scale(50, 50, 50);
  sky.matrix.translate(-0.5, -0.5, -0.5);
  sky.render();

  let duration = performance.now() - startTime;
  sendTextToHTML(`ms: ${Math.floor(duration)} fps: ${Math.floor(10000 / duration) / 10}`, 'info');
}

const sendTextToHTML = (text, htmlTag) => {
  let htmlObj = document.getElementById(htmlTag);
  if (!htmlObj) {
    console.log(`Failed to get ${htmlTag} from HTML`);
    return;
  }
  htmlObj.innerHTML = text;
}

function main() {
  setupWebGL();
  connectVariablesToGLSL();

  // Add keyup event listener
  document.onkeydown = keydown;
  document.onkeyup = keyup;

  initTextures();

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  requestAnimationFrame(tick);
}

function keydown(ev) {
  switch (ev.code) {
    case "KeyW":
      g_moveForward = true;
      break;
    case "KeyS":
      g_moveBackward = true;
      break;
    case "KeyA":
      g_moveLeft = true;
      break;
    case "KeyD":
      g_moveRight = true;
      break;
    case "KeyQ":  // Q key -> pan right
      g_panRight = true;
      break;
    case "KeyE":  // E key -> pan left
      g_panLeft = true;
      break;
  }
  renderAllShapes();
}

function keyup(ev) {
  switch (ev.code) {
    case "KeyW":
      g_moveForward = false;
      break;
    case "KeyS":
      g_moveBackward = false;
      break;
    case "KeyA":
      g_moveLeft = false;
      break;
    case "KeyD":
      g_moveRight = false;
      break;
    case "KeyQ":
      g_panRight = false;
      break;
    case "KeyE":
      g_panLeft = false;
      break;
  }
}

function renderWalls() {
  const wallSize = 3.0;  // Increased size to match sky scale
  const worldOffset = -g_worldMap.length * wallSize / 2;  // Center the maze

  for (let x = 0; x < g_worldMap.length; x++) {
    for (let z = 0; z < g_worldMap[x].length; z++) {
      if (g_worldMap[x][z] > 0) {
        const height = g_worldMap[x][z] * 0.75;  // Taller walls
        const wall = new Cube();
        wall.color = [0.8, 0.8, 0.0, 1.0];
        wall.textureNum = -2;
        wall.matrix.translate(worldOffset + x * wallSize, -0.5, worldOffset + z * wallSize);
        wall.matrix.scale(wallSize, height, wallSize);
        wall.matrix.translate(-0.5, 0, -0.5);
        wall.render();
      }
    }
  }
}
