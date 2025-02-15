class Camera {
  constructor() {
    // initialize camera position, target point, and up direction
    this.eye = new Vector3([13, 0, 1]);
    this.at = new Vector3([0, 0, -100]);
    this.up = new Vector3([0, 1, 0]);
  }

  forward() {
    const f = new Vector3(this.at.elements);
    f.sub(this.eye);
    f.normalize();
    this.eye.add(f);
    this.at.add(f);
    return f;
  }

  back() {
    const f = new Vector3(this.at.elements);
    f.sub(this.eye);
    f.normalize();
    this.eye.sub(f);
    this.at.sub(f);
    return f;
  }

  left() {
    const f = new Vector3(this.at.elements);
    f.sub(this.eye);
    f.normalize();
    const s = Vector3.cross(f, this.up);
    s.normalize();
    this.eye.sub(s);
    this.at.sub(s);
    return s;
  }

  right() {
    const f = new Vector3(this.at.elements);
    f.sub(this.eye);
    f.normalize();
    const s = Vector3.cross(f, this.up);
    s.normalize();
    this.eye.add(s);
    this.at.add(s);
    return s;
  }

  turnLeft() {
    // rotate the camera view direction to the left around the vertical axis
    const f = new Vector3(this.at.elements);
    f.sub(this.eye);
    const r = Math.sqrt(f.elements[0] * f.elements[0] + f.elements[2] * f.elements[2]);
    let theta = Math.atan2(f.elements[0], f.elements[2]);
    theta += 0.05;  // rotation speed in radians
    f.elements[0] = r * Math.sin(theta);
    f.elements[2] = r * Math.cos(theta);
    f.add(this.eye);
    this.at = f;
  }

  turnRight() {
    // rotate the camera view direction to the right around the vertical axis
    const f = new Vector3(this.at.elements);
    f.sub(this.eye);
    const r = Math.sqrt(f.elements[0] * f.elements[0] + f.elements[2] * f.elements[2]);
    let theta = Math.atan2(f.elements[0], f.elements[2]);
    theta -= 0.05;  // rotation speed in radians
    f.elements[0] = r * Math.sin(theta);
    f.elements[2] = r * Math.cos(theta);
    f.add(this.eye);
    this.at = f;
  }

  moveForward(distance) {
    // move the camera forward in the direction it's facing while maintaining height
    let forward = new Vector3();
    forward.elements[0] = this.at.elements[0] - this.eye.elements[0];
    forward.elements[1] = 0; // lock vertical movement
    forward.elements[2] = this.at.elements[2] - this.eye.elements[2];
    forward.normalize();

    // update both camera position and target point
    this.eye.elements[0] += forward.elements[0] * distance;
    this.eye.elements[2] += forward.elements[2] * distance;
    this.at.elements[0] += forward.elements[0] * distance;
    this.at.elements[2] += forward.elements[2] * distance;
  }

  moveRight(distance) {
    // move the camera right relative to its current view direction
    let forward = new Vector3([
      this.at.elements[0] - this.eye.elements[0],
      0,
      this.at.elements[2] - this.eye.elements[2]
    ]);
    let right = Vector3.cross(forward, this.up);
    right.normalize();

    // update both camera position and target point
    this.eye.elements[0] += right.elements[0] * distance;
    this.eye.elements[2] += right.elements[2] * distance;
    this.at.elements[0] += right.elements[0] * distance;
    this.at.elements[2] += right.elements[2] * distance;
  }
}