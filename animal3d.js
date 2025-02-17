// Global Variables Related to UI Elements

function cloneMatrix4(matrix) {
  var newMatrix = new Matrix4();
  newMatrix.elements = new Float32Array(matrix.elements);
  return newMatrix;
}

function renderdog() {

  // Draw the body cube
  var body = new Cube();
  body.color = [0.776, 0.525, 0.259, 1.0];
  body.textureNum = 2;
  body.matrix.setTranslate(-0.25, -0.25, 0.0);
  var bodyCoordinatesMat = new Matrix4(body.matrix);
  body.matrix.scale(0.5, .5, .75);
  body.render();

  // Draw the tail
  var tail = new Cube();
  tail.textureNum = 3;
  tail.color = [1, 0.65, 0.65, 1.0];
  tail.matrix = cloneMatrix4(bodyCoordinatesMat);
  tail.matrix.translate(0.075, 0.10, 0.75);
  tail.matrix.scale(0.35, 0.5, 0.5);

  // Draw the tail
  var tail2 = new Cube();
  tail2.color = [0.945, 0.761, 0.490, 1.0];
  tail2.textureNum = 3;
  tail2.matrix = cloneMatrix4(bodyCoordinatesMat);
  tail2.matrix.translate(0.075, 0.10, 0.75);
  tail2.matrix.rotate(-g_tailAngle, 1, 0, 0);
  tail2.matrix.scale(0.15, 0.55, 0.15);
  tail2.render();

  // Draw a neck
  var neck = new Cube();
  neck.color = [0.992, 0.961, 0.886, 1.0];
  neck.textureNum = -2;
  neck.matrix = cloneMatrix4(bodyCoordinatesMat);
  neck.matrix.setTranslate(0.0, 0.10, 0.05);
  neck.matrix.rotate(-g_neckAngle, 1, 0, 0);
  var neckCoordinatesMat = new Matrix4(neck.matrix);
  neck.matrix.scale(0.25, 0.45, 0.25);
  neck.matrix.translate(-0.5, 0, 0);
  neck.render();

  // Draw a head
  var head = new Cube();
  head.textureNum = -2;
  head.color = [0.945, 0.761, 0.490, 1.0];
  head.matrix = neckCoordinatesMat;
  head.matrix.translate(0, 0.45, -0.15);
  head.matrix.rotate(g_headAngle * 0.5, 0, 1, 0);
  var headCoordinatesMat = new Matrix4(head.matrix);
  head.matrix.scale(0.35, 0.3, 0.45);
  head.matrix.translate(-0.5, 0, -0.0001);
  head.render();

  // Draw a nose
  var nose = new Cube();
  nose.color = [0.35, 0.35, 0.35, 1.0];
  nose.textureNum = -2;
  nose.matrix = cloneMatrix4(headCoordinatesMat);
  nose.matrix.translate(0, 0.45, -0.10);
  if (g_nose_size === 1)
    nose.matrix.scale(0.15, 0.10, 0.25);
  else
    nose.matrix.scale(0.10, 0.10, 0.10);
  nose.matrix.translate(-0.5, -4.25, -0.0001);
  nose.render();

  // Draw a nose
  var nose2 = new Cube();
  nose.color = [0.35, 0.35, 0.35, 1.0];
  nose2.matrix = headCoordinatesMat;
  nose2.textureNum = -2;
  nose2.matrix.translate(0, 0.45, -0.10);
  nose2.matrix.scale(0.15, 0.10, 0.25);
  nose2.matrix.translate(-0.5, -4.25, -0.0001);

  // Draw ears
  var ear = new Tetrahedron(); // Left ear
  ear.color = g_color_1;
  ear.textureNum = -2;
  ear.matrix = headCoordinatesMat;
  ear.matrix.translate(1.0, 2.65, -0.20);
  ear.matrix.scale(0.4, 1.5, 0.85);
  ear.matrix.rotate(-g_earsAngle, 1, 0, 0);
  ear.render();

  var ear2 = new Tetrahedron(); // Right ear
  ear2.color = g_color_1;
  ear2.textureNum = -2;
  ear2.matrix = headCoordinatesMat;
  ear2.matrix.translate(-2.5, 0, -0.10);
  ear2.matrix.scale(0.8, 1.0, 0.85);
  ear2.matrix.rotate(-g_earsAngle, 1, 0, 0);
  ear2.render();

  // Draw four legs
  var leg = new Cube(); // Front left
  leg.color = [0.992, 0.961, 0.886, 1.0];
  leg.textureNum = -2;
  leg.matrix = cloneMatrix4(bodyCoordinatesMat);
  leg.matrix.setTranslate(0.05, -0.05, 0.05);
  leg.matrix.rotate(g_legsAngle, 1, 0, 0);
  leg.matrix.scale(0.05, -0.45, 0.05);
  leg.render();

  var leg2 = new Cube(); // Front right
  leg2.color = [0.992, 0.961, 0.886, 1.0];
  leg2.textureNum = -2;
  leg2.matrix = cloneMatrix4(bodyCoordinatesMat);
  leg2.matrix.setTranslate(-0.15, -0.05, 0.05);
  leg2.matrix.rotate(-g_legsAngle, 1, 0, 0);
  leg2.matrix.scale(0.05, -0.45, 0.05);
  leg2.render();

  var leg3 = new Cube(); // Back left
  leg3.color = [0.992, 0.961, 0.886, 1.0];
  leg3.textureNum = -2;
  leg3.matrix = cloneMatrix4(bodyCoordinatesMat);
  leg3.matrix.setTranslate(0.05, -0.05, 0.5);
  leg3.matrix.rotate(-g_legsAngle, 1, 0, 0);
  leg3.matrix.scale(0.05, -0.45, 0.05);
  leg3.render();

  var leg4 = new Cube(); // Back right
  leg4.color = [0.992, 0.961, 0.886, 1.0];
  leg4.textureNum = -2;
  leg4.matrix = cloneMatrix4(bodyCoordinatesMat);
  leg4.matrix.setTranslate(-0.15, -0.05, 0.5);
  leg4.matrix.rotate(g_legsAngle, 1, 0, 0);
  leg4.matrix.scale(0.05, -0.45, 0.05);
  leg4.render();
}
