export class InputManager {
  constructor(canvas) {
    this.canvas = canvas;
    this.keys = {};
    this.targetX = null;
    this.shooting = false;
    this.pointerActive = false;

    this._onKeyDown = this._onKeyDown.bind(this);
    this._onKeyUp = this._onKeyUp.bind(this);
    this._onPointerDown = this._onPointerDown.bind(this);
    this._onPointerMove = this._onPointerMove.bind(this);
    this._onPointerUp = this._onPointerUp.bind(this);
    this._onPointerLeave = this._onPointerLeave.bind(this);

    window.addEventListener('keydown', this._onKeyDown);
    window.addEventListener('keyup', this._onKeyUp);
    canvas.addEventListener('pointerdown', this._onPointerDown);
    canvas.addEventListener('pointermove', this._onPointerMove);
    canvas.addEventListener('pointerup', this._onPointerUp);
    canvas.addEventListener('pointerleave', this._onPointerLeave);
  }

  _onKeyDown(e) {
    this.keys[e.key] = true;
    if (e.code === 'Space' || e.key === ' ' || e.key === 'Spacebar') this.shooting = true;
  }

  _onKeyUp(e) {
    this.keys[e.key] = false;
    if (e.code === 'Space' || e.key === ' ' || e.key === 'Spacebar') this.shooting = false;
  }

  _onPointerDown(e) {
    this.pointerActive = true;
    this.targetX = e.clientX;
    this.shooting = true;
  }

  _onPointerMove(e) {
    if (this.pointerActive && e.buttons > 0) {
      this.targetX = e.clientX;
    }
  }

  _onPointerUp() {
    this.pointerActive = false;
    this.targetX = null;
    this.shooting = false;
  }

  _onPointerLeave() {
    this.pointerActive = false;
    this.targetX = null;
    this.shooting = false;
  }

  dirX() {
    let dir = 0;
    if (this.keys['ArrowLeft'] || this.keys['a'] || this.keys['A']) dir -= 1;
    if (this.keys['ArrowRight'] || this.keys['d'] || this.keys['D']) dir += 1;
    return dir;
  }

  wantsShoot() {
    return this.shooting || this.keys[' '] || this.keys['Spacebar'];
  }

  dispose() {
    window.removeEventListener('keydown', this._onKeyDown);
    window.removeEventListener('keyup', this._onKeyUp);
    this.canvas.removeEventListener('pointerdown', this._onPointerDown);
    this.canvas.removeEventListener('pointermove', this._onPointerMove);
    this.canvas.removeEventListener('pointerup', this._onPointerUp);
    this.canvas.removeEventListener('pointerleave', this._onPointerLeave);
  }
}
