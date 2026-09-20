export class Character {
  constructor(name, pathPoints, color = "#2b1b18") {
    this.name = name;
    this.path = pathPoints;
    this.color = color;

    this.targetIndex = 1;
    this.x = pathPoints[0].x;
    this.y = pathPoints[0].y;

    this.speed = 1.2;
    this.stepDistance = 18;
    this.distanceSinceLastStep = 0;
    this.stepToggle = false;

    // Novas propriedades de animação
    this.pauseTimer = 0;
    this.opacity = 1.0;
  }

  update(map) {
    // 1. Controle de Pausa (Ficar parado na porta ouvindo)
    if (this.pauseTimer > 0) {
      this.pauseTimer--;
    } else {
      const target = this.path[this.targetIndex];
      const dx = target.x - this.x;
      const dy = target.y - this.y;
      const distance = Math.hypot(dx, dy);

      // Chegou no ponto alvo
      if (distance < this.speed) {
        this.x = target.x;
        this.y = target.y;
        this.targetIndex++;

        // Chegou no fim da rota (Inverte e Pausa)
        if (this.targetIndex >= this.path.length) {
          this.path.reverse();
          this.targetIndex = 1;
          this.pauseTimer = 300; // Fica parado por ~5 segundos (considerando 60fps)
        }
      } else {
        // Caminhando
        const angle = Math.atan2(dy, dx);
        this.x += Math.cos(angle) * this.speed;
        this.y += Math.sin(angle) * this.speed;
        this.distanceSinceLastStep += this.speed;

        if (this.distanceSinceLastStep >= this.stepDistance) {
          this.distanceSinceLastStep = 0;
          this.stepToggle = !this.stepToggle;

          map.addFootprint({
            x: this.x,
            y: this.y,
            angle: angle,
            isLeft: this.stepToggle,
            baseOpacity: this.opacity, // A pegada também recebe a invisibilidade
            createdAt: Date.now(),
          });
        }
      }
    }

    // 2. Lógica da Capa da Invisibilidade
    this.opacity = 1.0; // Volta ao normal por padrão

    if (this.name === "Harry Potter" || this.name === "Hermione Granger") {
      const snape = map.characters.find((c) => c.name === "Severo Snape");
      if (snape) {
        const distToSnape = Math.hypot(snape.x - this.x, snape.y - this.y);
        if (distToSnape < 180) {
          // Raio de detecção de 180 pixels
          this.opacity = 0.15; // Quase invisível (Capa ativada!)
        }
      }
    }
  }
}
