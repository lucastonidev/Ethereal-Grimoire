export class Camera {
  constructor(canvas, mapWidth, mapHeight) {
    this.canvas = canvas;
    this.mapWidth = mapWidth;
    this.mapHeight = mapHeight;

    this.x = -400;
    this.y = -150;

    this.isDragging = false;
    this.startDragX = 0;
    this.startDragY = 0;

    this.initEvents();
  }

  clamp() {
    if (this.x > 0) this.x = 0;
    if (this.y > 0) this.y = 0;

    const minX = this.canvas.width - this.mapWidth;
    const minY = this.canvas.height - this.mapHeight;

    if (this.x < minX) this.x = minX;
    if (this.y < minY) this.y = minY;
  }

  initEvents() {
    // Mouse
    this.canvas.addEventListener("mousedown", (e) => {
      this.isDragging = true;
      this.startDragX = e.clientX - this.x;
      this.startDragY = e.clientY - this.y;
    });

    window.addEventListener("mousemove", (e) => {
      if (!this.isDragging) return;
      this.x = e.clientX - this.startDragX;
      this.y = e.clientY - this.startDragY;
      this.clamp();
    });

    window.addEventListener("mouseup", () => (this.isDragging = false));
    window.addEventListener("mouseleave", () => (this.isDragging = false));

    // Touch
    this.canvas.addEventListener("touchstart", (e) => {
      this.isDragging = true;
      this.startDragX = e.touches[0].clientX - this.x;
      this.startDragY = e.touches[0].clientY - this.y;
    });

    window.addEventListener("touchmove", (e) => {
      if (!this.isDragging) return;
      this.x = e.touches[0].clientX - this.startDragX;
      this.y = e.touches[0].clientY - this.startDragY;
      this.clamp();
    });

    window.addEventListener("touchend", () => (this.isDragging = false));
  }
}
