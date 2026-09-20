export class Renderer {
  constructor(ctx, mapWidth, mapHeight) {
    this.ctx = ctx;
    this.mapWidth = mapWidth;
    this.mapHeight = mapHeight;
  }

  drawBackground(bgImage) {
    if (bgImage.complete) {
      this.ctx.drawImage(bgImage, 0, 0, this.mapWidth, this.mapHeight);
    }
  }

  // --- CORREDORES COM ASPECTO MEDIEVAL (Parede Dupla) ---
  drawCorridor(x, y, width, height, type) {
    // 1. Fundo do corredor
    this.ctx.fillStyle = "rgba(212, 189, 161, 0.75)";
    this.ctx.fillRect(x, y, width, height);

    const wallThickness = 6; // Distância entre a linha grossa externa e a fina interna

    this.ctx.setLineDash([]); // Garante linha sólida para as paredes

    if (type === "h") {
      // --- CORREDOR HORIZONTAL ---

      // Paredes Externas (Grossas)
      this.ctx.strokeStyle = "#3e2723";
      this.ctx.lineWidth = 3;
      this.ctx.beginPath();
      this.ctx.moveTo(x, y); // Parede de cima
      this.ctx.lineTo(x + width, y);
      this.ctx.moveTo(x, y + height); // Parede de baixo
      this.ctx.lineTo(x + width, y + height);
      this.ctx.stroke();

      // Paredes Internas (Finas)
      this.ctx.lineWidth = 1;
      this.ctx.beginPath();
      this.ctx.moveTo(x, y + wallThickness); // Parede de cima (interna)
      this.ctx.lineTo(x + width, y + wallThickness);
      this.ctx.moveTo(x, y + height - wallThickness); // Parede de baixo (interna)
      this.ctx.lineTo(x + width, y + height - wallThickness);
      this.ctx.stroke();

      // Linha Tracejada Central
      this.ctx.strokeStyle = "rgba(62, 39, 35, 0.4)";
      this.ctx.lineWidth = 2;
      this.ctx.setLineDash([8, 8]);
      this.ctx.beginPath();
      this.ctx.moveTo(x, y + height / 2);
      this.ctx.lineTo(x + width, y + height / 2);
      this.ctx.stroke();
    } else if (type === "v") {
      // --- CORREDOR VERTICAL ---

      // Paredes Externas (Grossas)
      this.ctx.strokeStyle = "#3e2723";
      this.ctx.lineWidth = 3;
      this.ctx.beginPath();
      this.ctx.moveTo(x, y); // Parede esquerda
      this.ctx.lineTo(x, y + height);
      this.ctx.moveTo(x + width, y); // Parede direita
      this.ctx.lineTo(x + width, y + height);
      this.ctx.stroke();

      // Paredes Internas (Finas)
      this.ctx.lineWidth = 1;
      this.ctx.beginPath();
      this.ctx.moveTo(x + wallThickness, y); // Parede esquerda (interna)
      this.ctx.lineTo(x + wallThickness, y + height);
      this.ctx.moveTo(x + width - wallThickness, y); // Parede direita (interna)
      this.ctx.lineTo(x + width - wallThickness, y + height);
      this.ctx.stroke();

      // Linha Tracejada Central
      this.ctx.strokeStyle = "rgba(62, 39, 35, 0.4)";
      this.ctx.lineWidth = 2;
      this.ctx.setLineDash([8, 8]);
      this.ctx.beginPath();
      this.ctx.moveTo(x + width / 2, y);
      this.ctx.lineTo(x + width / 2, y + height);
      this.ctx.stroke();
    }

    // Reseta o tracejado para não quebrar outros desenhos do loop
    this.ctx.setLineDash([]);
  }

  // --- NOVA FUNÇÃO: Textos anotados à mão (Easter Eggs) ---
  drawFloatingText(text, x, y, angle) {
    this.ctx.save();
    this.ctx.translate(x, y);
    this.ctx.rotate((angle * Math.PI) / 180); // Rotaciona o canvas no ângulo desejado

    this.ctx.fillStyle = "rgba(62, 39, 35, 0.55)"; // Cor de tinta desbotada
    this.ctx.font = '28px "Nothing You Could Do", cursive';
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";
    this.ctx.fillText(text, 0, 0);

    this.ctx.restore();
  }

  drawRoom(x, y, width, height, text) {
    this.ctx.strokeStyle = "#3e2723";
    this.ctx.fillStyle = "rgba(212, 189, 161, 0.9)"; // Pouco mais opaco para ficar acima dos corredores
    this.ctx.lineWidth = 3;

    this.ctx.fillRect(x, y, width, height);
    this.ctx.strokeRect(x, y, width, height);

    this.ctx.fillStyle = "#3e2723";
    this.ctx.font = '24px "IM Fell English SC"';
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";

    const lines = text.split("<br>");
    lines.forEach((line, index) => {
      this.ctx.fillText(
        line,
        x + width / 2,
        y + height / 2 + (index * 28 - (lines.length - 1) * 14),
      );
    });
  }

  // --- SALAS RETANGULARES COM ARQUITETURA ---
  drawCastleRoom(x, y, width, height, text) {
    this.ctx.fillStyle = "rgba(212, 189, 161, 0.85)"; // Fundo do pergaminho
    this.ctx.fillRect(x, y, width, height);

    // Parede Externa (Grossa)
    this.ctx.strokeStyle = "#3e2723";
    this.ctx.lineWidth = 3;
    this.ctx.strokeRect(x, y, width, height);

    // Parede Interna (Fina - cria a sensação de parede de castelo)
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(x + 8, y + 8, width - 16, height - 16);

    // Pilares/Torreões nos 4 cantos da sala
    const drawTurret = (cx, cy) => {
      this.ctx.beginPath();
      this.ctx.arc(cx, cy, 10, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.lineWidth = 2;
      this.ctx.stroke();

      // Detalhe interno do pilar
      this.ctx.beginPath();
      this.ctx.arc(cx, cy, 3, 0, Math.PI * 2);
      this.ctx.lineWidth = 1;
      this.ctx.stroke();
    };

    drawTurret(x, y); // Canto superior esquerdo
    drawTurret(x + width, y); // Canto superior direito
    drawTurret(x, y + height); // Canto inferior esquerdo
    drawTurret(x + width, y + height); // Canto inferior direito

    // Texto Centralizado
    this.ctx.fillStyle = "#3e2723";
    this.ctx.font = '24px "IM Fell English SC"';
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";

    const lines = text.split("<br>");
    lines.forEach((line, index) => {
      this.ctx.fillText(
        line,
        x + width / 2,
        y + height / 2 + (index * 28 - (lines.length - 1) * 14),
      );
    });
  }

  // --- TORRES CIRCULARES ---
  drawCastleTower(cx, cy, radius, text) {
    this.ctx.fillStyle = "rgba(212, 189, 161, 0.85)";

    // Parede Externa (Círculo grosso)
    this.ctx.beginPath();
    this.ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.strokeStyle = "#3e2723";
    this.ctx.lineWidth = 3;
    this.ctx.stroke();

    // Parede Interna (Círculo fino)
    this.ctx.beginPath();
    this.ctx.arc(cx, cy, radius - 10, 0, Math.PI * 2);
    this.ctx.lineWidth = 1;
    this.ctx.stroke();

    // Detalhe Central (Uma rosa dos ventos / escada circular leve no meio)
    this.ctx.beginPath();
    this.ctx.arc(cx, cy, radius - 25, 0, Math.PI * 2);
    this.ctx.setLineDash([4, 4]); // Tracejado para detalhe
    this.ctx.stroke();
    this.ctx.setLineDash([]); // Reseta

    // Texto Centralizado
    this.ctx.fillStyle = "#3e2723";
    this.ctx.font = '24px "IM Fell English SC"';
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";

    const lines = text.split("<br>");
    lines.forEach((line, index) => {
      this.ctx.fillText(line, cx, cy + (index * 28 - (lines.length - 1) * 14));
    });
  }

  drawTitleBanner() {
    const bannerWidth = 900;
    const bannerHeight = 140;
    const x = this.mapWidth / 2 - bannerWidth / 2;
    const y = 160;

    this.ctx.fillStyle = "rgba(212, 189, 161, 0.95)";
    this.ctx.fillRect(x, y, bannerWidth, bannerHeight);

    this.ctx.strokeStyle = "#3e2723";
    this.ctx.lineWidth = 4;

    this.ctx.beginPath();
    this.ctx.moveTo(x, y);
    this.ctx.lineTo(x + bannerWidth, y);
    this.ctx.stroke();

    this.ctx.beginPath();
    this.ctx.moveTo(x, y + bannerHeight);
    this.ctx.lineTo(x + bannerWidth, y + bannerHeight);
    this.ctx.stroke();

    this.ctx.fillStyle = "#3e2723";
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";

    this.ctx.font = '24px "IM Fell English SC"';
    this.ctx.fillText(
      "Os Srs. Aluado, Rabicho, Almofadinhas e Pontas têm o orgulho de apresentar",
      this.mapWidth / 2,
      y + 45,
    );

    this.ctx.font = 'bold 54px "IM Fell English SC"';
    this.ctx.fillText("O Mapa dos Marotos", this.mapWidth / 2, y + 100);
  }

  drawFootprint(footprint, footprintImg) {
    this.ctx.save();

    // Calcula o afastamento dos pés (um do lado do outro)
    const offsetDistance = 6;
    const offsetX =
      Math.cos(footprint.angle + Math.PI / 2) *
      (footprint.isLeft ? -offsetDistance : offsetDistance);
    const offsetY =
      Math.sin(footprint.angle + Math.PI / 2) *
      (footprint.isLeft ? -offsetDistance : offsetDistance);

    this.ctx.translate(footprint.x + offsetX, footprint.y + offsetY);
    // + 90 graus (Math.PI/2) porque o ícone original aponta pra cima
    this.ctx.rotate(footprint.angle + Math.PI / 2);

    if (footprint.isLeft) {
      this.ctx.scale(-1, 1); // Espelha a imagem para o pé esquerdo
    }

    this.ctx.globalAlpha = footprint.opacity; // Aplica a transparência que vai sumindo

    // Desenha o icone da pegada centralizado
    this.ctx.drawImage(footprintImg, -6, -10, 12, 20);

    this.ctx.restore();
  }

  drawCharacterName(character) {
    this.ctx.save(); // Salva o estado para não afetar o resto do mapa

    // Aplica a opacidade (Invisibilidade)
    this.ctx.globalAlpha = character.opacity;

    this.ctx.fillStyle = character.color;
    this.ctx.font = 'bold 18px "Nothing You Could Do", cursive';
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "bottom";

    this.ctx.shadowColor = "rgba(212, 189, 161, 0.9)";
    this.ctx.shadowBlur = 4;

    this.ctx.fillText(character.name, character.x, character.y - 15);

    this.ctx.restore(); // Restaura a opacidade para 100%
  }
}
