import { Camera } from "./Camera.js";
import { Renderer } from "./Renderer.js";
import { Character } from "./Character.js";

export class MaraudersMap {
  constructor(canvasId, bgSrc) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext("2d");

    this.mapWidth = 3000;
    this.mapHeight = 1687;

    this.camera = new Camera(this.canvas, this.mapWidth, this.mapHeight);
    this.renderer = new Renderer(this.ctx, this.mapWidth, this.mapHeight);

    // Carrega o Fundo
    this.bgImage = new Image();
    this.bgImage.src = bgSrc;

    // Carrega o Ícone da Pegada via SVG Base64 (Super leve!)
    this.footprintImg = new Image();
    this.footprintImg.src =
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 40'%3E%3Cpath fill='%233e2723' d='M11.6,2C8.3,1.3,4.4,4,3,8.3c-1.3,4.1,1.1,9.8,4.2,12.3c2.9,2.4,5,4.7,4.5,9.6c-0.2,2.3,1.5,5.1,3.7,5.6 c2.7,0.6,6.3-2.1,6.8-5.7C23,24,21.5,21.2,18,18.7c-3.1-2.2-5.7-5.1-4.7-9.5C14,5.8,14.2,2.5,11.6,2z M10,34.5 c-1.8-0.3-3.6,1.4-3.2,3.3c0.4,1.7,2.2,2.7,4,2.3c1.9-0.4,3-2,2.6-3.8C13.1,34.7,11.6,34.8,10,34.5z'/%3E%3C/svg%3E";

    // Onde a magia fica guardada
    this.characters = [];
    this.footprints = [];

    this.isRunning = false;
    this.initResize();
    this.initMagic();

    // 1. Definição das zonas interativas baseadas nas coordenadas das salas
    this.interactiveZones = [
      {
        id: "gryffindor",
        type: "circle",
        x: 482,
        y: 768,
        r: 150,
        name: "Grifinória",
      },
      {
        id: "ravenclaw",
        type: "circle",
        x: 2050,
        y: 480,
        r: 150,
        name: "Corvinal",
      },
      {
        id: "slytherin",
        type: "rect",
        x: 900,
        y: 1200,
        w: 350,
        h: 300,
        name: "Sonserina",
      },
      {
        id: "hufflepuff",
        type: "rect",
        x: 1800,
        y: 815,
        w: 250,
        h: 300,
        name: "Lufa-Lufa",
      },
    ];

    this.dynamicHousesData = [];
    this.fetchHousesData();

    this.initClickEvents();
  }

  async fetchHousesData() {
    try {
      const res = await fetch(
        "https://raw.githubusercontent.com/lucastonidev/ethereal-data/refs/heads/main/data/pt/houses.pt.json",
      );
      if (res.ok) {
        this.dynamicHousesData = await res.json();
      }
    } catch (e) {
      console.error("Erro ao buscar dados dinâmicos das casas:", e);
    }
  }

  initClickEvents() {
    this.canvas.addEventListener("click", (e) => {
      // 1. Pega as coordenadas reais do clique ignorando a margem da tela
      const rect = this.canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left - this.camera.x;
      const clickY = e.clientY - rect.top - this.camera.y;

      // 2. Verifica se o clique caiu dentro de alguma zona
      for (const zone of this.interactiveZones) {
        if (zone.type === "circle") {
          const dist = Math.hypot(clickX - zone.x, clickY - zone.y);
          if (dist <= zone.r) {
            this.openModal(zone);
            break;
          }
        } else if (zone.type === "rect") {
          if (
            clickX >= zone.x &&
            clickX <= zone.x + zone.w &&
            clickY >= zone.y &&
            clickY <= zone.y + zone.h
          ) {
            this.openModal(zone);
            break;
          }
        }
      }
    });

    // Bônus: Muda o cursor para "mãozinha" quando passar por cima de uma casa
    this.canvas.addEventListener("mousemove", (e) => {
      if (this.camera.isDragging) return;
      const rect = this.canvas.getBoundingClientRect();
      const hoverX = e.clientX - rect.left - this.camera.x;
      const hoverY = e.clientY - rect.top - this.camera.y;

      let isHovering = false;
      for (const z of this.interactiveZones) {
        if (
          z.type === "circle" &&
          Math.hypot(hoverX - z.x, hoverY - z.y) <= z.r
        )
          isHovering = true;
        if (
          z.type === "rect" &&
          hoverX >= z.x &&
          hoverX <= z.x + z.w &&
          hoverY >= z.y &&
          hoverY <= z.y + z.h
        )
          isHovering = true;
      }
      this.canvas.style.cursor = isHovering ? "pointer" : "grab";
    });
  }

  initResize() {
    const resizeCanvas = () => {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
      this.camera.clamp();
    };
    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();
  }

  initMagic() {
    // AS ROTAS DA CENA PRINCIPAL (Sincronizadas com as novas paredes)
    const pathDumbledore = [
      { x: 660, y: 250 }, // Centro do novo escritório do Dumbledore
      { x: 700, y: 250 },
    ];
    const pathSnape = [
      { x: 1075, y: 1350 },
      { x: 1075, y: 1170 },
      { x: 1380, y: 1170 },
      { x: 1380, y: 1100 },
      { x: 1200, y: 730 },
      { x: 820, y: 730 },
      { x: 820, y: 550 },
      { x: 680, y: 550 },
      { x: 680, y: 350 }, // Chega exatamente na nova porta
    ];
    const pathHermione = [
      { x: 482, y: 768 }, // Começa no centro da nova Torre da Grifinória
      { x: 482, y: 565 }, // Sobe até conectar com o corredor
      { x: 660, y: 565 }, // Segue até o corredor principal
      { x: 660, y: 350 }, // Para na porta do Dumbledore
    ];
    const pathHarry = [
      { x: 820, y: 730 },
      { x: 820, y: 550 },
      { x: 700, y: 550 },
      { x: 700, y: 350 }, // Para na porta ao lado da Hermione
    ];

    // AS NOVAS ROTAS (HAGRID E DOBBY)
    const pathHagrid = [
      { x: 330, y: 1350 }, // Centro da nova Cabana
      { x: 330, y: 1550 }, // Caminha pelo quintal
    ];
    const pathDobby = [
      { x: 1600, y: 1250 }, // Ajustado para as Cozinhas deslocadas (x: 1550)
      { x: 1850, y: 1250 },
      { x: 1850, y: 1400 },
      { x: 1600, y: 1400 },
    ];

    this.characters = [];

    // Carregando a Cena de Espionagem
    this.characters.push(new Character("Harry Potter", pathHarry));
    this.characters.push(
      new Character("Hermione Granger", pathHermione, "#4a2c2a"),
    );
    this.characters.push(new Character("Severo Snape", pathSnape, "#5c1b18"));
    this.characters.push(
      new Character("Alvo Dumbledore", pathDumbledore, "#2a3b5c"),
    );

    // Carregando os Novos Habitantes
    this.characters.push(new Character("Rúbeo Hagrid", pathHagrid, "#40260c"));
    this.characters.push(new Character("Dobby", pathDobby, "#665e49"));
  }

  addFootprint(footprint) {
    this.footprints.push(footprint);
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;

    const loop = () => {
      this.update();
      if (this.isRunning) requestAnimationFrame(loop);
    };

    if (this.bgImage.complete && this.footprintImg.complete) {
      loop();
    } else {
      // Garante que as duas imagens carregaram antes de iniciar
      this.bgImage.onload = () => {
        if (this.footprintImg.complete) loop();
      };
      this.footprintImg.onload = () => {
        if (this.bgImage.complete) loop();
      };
    }
  }

  update() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.save();
    this.ctx.translate(this.camera.x, this.camera.y);

    this.renderer.drawBackground(this.bgImage);

    // 1. CORREDORES (As passagens)
    this.renderer.drawCorridor(450, 520, 350, 60, "h");
    this.renderer.drawCorridor(450, 520, 60, 100, "v");
    this.renderer.drawCorridor(790, 520, 60, 240, "v");
    this.renderer.drawCorridor(850, 700, 350, 60, "h");
    this.renderer.drawCorridor(1600, 950, 200, 60, "h");
    this.renderer.drawCorridor(1350, 1100, 60, 40, "v");
    this.renderer.drawCorridor(1150, 1140, 560, 60, "h");
    this.renderer.drawCorridor(1660, 1140, 60, 60, "v");
    this.renderer.drawCorridor(1150, 1140, 60, 60, "v");
    this.renderer.drawCorridor(1450, 450, 450, 60, "h");
    this.renderer.drawCorridor(1450, 510, 60, 90, "v");

    // CORRIGIDO: Corredor do Dumbledore (descido de 300 para 350)
    this.renderer.drawCorridor(650, 350, 60, 170, "v");

    // NOVOS CORREDORES CORRIGIDOS
    this.renderer.drawCorridor(300, 1000, 898, 60, "h"); // Caminho do Hagrid descido para y=850
    this.renderer.drawCorridor(300, 1000, 60, 240, "v"); // Descida para a Cabana ajustada
    this.renderer.drawCorridor(1600, 700, 760, 60, "h");
    this.renderer.drawCorridor(370, 450, 280, 60, "h"); // Passagem Hogsmeade descida para y=450
    this.renderer.drawCorridor(370, 380, 60, 70, "v"); // Conector da loja descido

    // 2. SALAS E TORRES
    this.renderer.drawCastleTower(482, 768, 150, "Torre da<br>Grifinória");
    this.renderer.drawCastleTower(2050, 480, 150, "Torre da<br>Corvinal");
    // CORRIGIDO: Escritório descido de 200 para 350
    this.renderer.drawCastleTower(680, 250, 100, "Escritório de<br>Dumbledore");

    // NOVAS SALAS E TORRES CORRIGIDAS
    this.renderer.drawCastleTower(330, 1350, 120, "Cabana do<br>Hagrid"); // Descido para 1350
    this.renderer.drawCastleRoom(
      1550,
      1200,
      350,
      250,
      "Cozinhas de<br>Hogwarts",
    );
    this.renderer.drawCastleRoom(
      2350,
      500,
      350,
      300,
      "Pátio da Torre<br>do Relógio",
    );

    // CORRIGIDO: Loja descida de 80 para 230
    this.renderer.drawCastleRoom(
      250,
      230,
      300,
      150,
      "Dedos de Mel<br>(Hogsmeade)",
    );

    this.renderer.drawCastleRoom(
      900,
      1200,
      350,
      300,
      "Masmorras da<br>Sonserina",
    );
    this.renderer.drawCastleRoom(1800, 815, 250, 300, "Porões da<br>Lufa-Lufa");
    this.renderer.drawCastleRoom(1200, 600, 400, 500, "Salão<br>Principal");

    // 3. MAGIA: PERSONAGENS E PEGADAS
    const currentTime = Date.now();
    const footprintLifespan = 4000;

    this.characters.forEach((char) => char.update(this));

    for (let i = this.footprints.length - 1; i >= 0; i--) {
      const fp = this.footprints[i];
      const age = currentTime - fp.createdAt;

      if (age >= footprintLifespan) {
        this.footprints.splice(i, 1);
      } else {
        fp.opacity = (1 - age / footprintLifespan) * (fp.baseOpacity || 1);
        this.renderer.drawFootprint(fp, this.footprintImg);
      }
    }

    this.characters.forEach((char) => this.renderer.drawCharacterName(char));

    // 4. TEXTOS FLUTUANTES E TÍTULO
    this.renderer.drawFloatingText("Banheiro da Murta Que Geme", 950, 650, -10);
    this.renderer.drawFloatingText("Câmara Secreta", 1450, 1400, 15);
    this.renderer.drawFloatingText("Entrada para Hogsmeade", 600, 350, -25);
    this.renderer.drawTitleBanner();

    this.ctx.restore();
  }

  openModal(zone) {
    // 1. Dados base e senhas (fallback caso a API demore)
    const baseInfo = {
      gryffindor: {
        name: "Grifinória",
        password: "caput draconis",
        quote:
          "“Quem sabe sua morada é a Grifinória, casa onde habitam os corações indômitos.”",
        founder: "Godric Gryffindor",
        animal: "Leão",
        colors: "Escarlate e Dourado",
        element: "Fogo",
        desc: "A casa dos corajosos e cavalheiros.",
      },
      slytherin: {
        name: "Sonserina",
        password: "sangue-puro",
        quote:
          "“Quem sabe a Sonserina será a sua casa, e ali fará seus verdadeiros amigos.”",
        founder: "Salazar Slytherin",
        animal: "Serpente",
        colors: "Verde e Prata",
        element: "Água",
        desc: "A casa dos ambiciosos e astutos.",
      },
      ravenclaw: {
        name: "Corvinal",
        password: "o ovo ou a galinha",
        quote:
          "“Quem sabe será a velha e sábia Corvinal, a casa dos que têm a mente sempre alerta.”",
        founder: "Rowena Ravenclaw",
        animal: "Águia",
        colors: "Azul e Bronze",
        element: "Ar",
        desc: "A casa dos sábios e criativos.",
      },
      hufflepuff: {
        name: "Lufa-Lufa",
        password: "ritmo de helga",
        quote:
          "“Quem sabe é na Lufa-Lufa que você vai morar, onde seus moradores são justos e leais.”",
        founder: "Helga Hufflepuff",
        animal: "Texugo",
        colors: "Amarelo e Preto",
        element: "Terra",
        desc: "A casa dos leais e dedicados.",
      },
    };

    let data = { ...baseInfo[zone.id] };

    // 2. Mescla os dados base com os dados dinâmicos da API
    if (this.dynamicHousesData && this.dynamicHousesData.length > 0) {
      const apiHouse = this.dynamicHousesData.find(
        (h) => h.name.toLowerCase() === data.name.toLowerCase(),
      );
      if (apiHouse) {
        data.founder = apiHouse.founder || data.founder;
        data.animal = apiHouse.animal || data.animal;
        data.element = apiHouse.element || data.element;
        data.desc = apiHouse.description || data.desc;
        if (apiHouse.colors) {
          data.colors = Array.isArray(apiHouse.colors)
            ? apiHouse.colors.join(" e ")
            : apiHouse.colors;
        }
      }
    }

    const modal = document.getElementById("house-modal");

    // Tela de Senha (permanece igual ao que fizemos antes)
    modal.innerHTML = `
      <div class="modal-parchment">
        <h2 class="modal-title">${data.name}</h2>
        <p class="modal-traits" style="margin-bottom: 10px;">Acesso Restrito. Diga a senha:</p>
        <input type="text" id="house-password-input" class="password-input" placeholder="Sua resposta..." autocomplete="off">
        <p id="password-error" style="color: #9b1c1c; display: none; font-family: 'IM Fell English SC'; margin-top: 15px; font-size: 18px;">
          Senha incorreta! A passagem permanece selada.
        </p>
        <div style="margin-top: 30px; display: flex; gap: 15px; justify-content: center;">
          <button class="close-btn" id="verify-password-btn">Revelar</button>
          <button class="close-btn" onclick="document.getElementById('house-modal').classList.remove('active')">Voltar</button>
        </div>
      </div>
    `;

    modal.classList.add("active");

    const verifyBtn = document.getElementById("verify-password-btn");
    const passInput = document.getElementById("house-password-input");
    const passError = document.getElementById("password-error");

    const checkPassword = () => {
      const attemptedPassword = passInput.value.toLowerCase().trim();

      if (
        attemptedPassword === data.password ||
        attemptedPassword === "alohomora"
      ) {
        // 3. Renderiza os dados com o Tema (theme-${zone.id}) e a LOGO dinâmicos!
        const logoUrl = `https://raw.githubusercontent.com/lucastonidev/ethereal-data/main/image/houses/${zone.id}.png`;

        modal.innerHTML = `
          <div class="modal-parchment fade-in-modal theme-${zone.id}">
            <img src="${logoUrl}" class="modal-house-logo" alt="Brasão da ${data.name}">
            <h2 class="modal-title">${data.name}</h2>
            <p class="modal-traits">${data.quote}</p>
            
            <div class="modal-info-grid">
              <div>
                <p><strong>Fundador</strong> ${data.founder}</p>
                <p><strong>Símbolo</strong> ${data.animal}</p>
              </div>
              <div>
                <p><strong>Cores</strong> ${data.colors}</p>
                <p><strong>Elemento</strong> ${data.element}</p>
              </div>
            </div>

            <p style="font-size: 18px; margin-bottom: 30px; line-height: 1.6;">
              ${data.desc}
            </p>

            <button class="close-btn" onclick="document.getElementById('house-modal').classList.remove('active')">
              Malfeito Feito
            </button>
          </div>
        `;
      } else {
        passError.style.display = "block";
        passInput.value = "";
        passInput.focus();

        const parchment = modal.querySelector(".modal-parchment");
        parchment.animate(
          [
            { transform: "translateX(0)" },
            { transform: "translateX(-10px)" },
            { transform: "translateX(10px)" },
            { transform: "translateX(-10px)" },
            { transform: "translateX(0)" },
          ],
          { duration: 300 },
        );
      }
    };

    verifyBtn.addEventListener("click", checkPassword);
    passInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") checkPassword();
    });

    setTimeout(() => passInput.focus(), 100);
  }
}
