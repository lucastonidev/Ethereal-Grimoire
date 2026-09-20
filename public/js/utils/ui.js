class UI {
  mainCharacters(data) {
    const container = document.getElementById("main-character");
    if (!container) return;

    const characters = Array.isArray(data) ? data : [data];

    characters.forEach((char) => {
      if (!char || !char.fullName) return;

      const houseClass = this._getHouseClass(char.hogwartsHouse);
      const fallbackImg = `https://ui-avatars.com/api/?name=${encodeURIComponent(char.fullName)}&background=12131f&color=c9a227&size=220&font-size=0.4&bold=true`;
      const imgSrc =
        char.image && char.image.startsWith("http") ? char.image : fallbackImg;

      // Pega apenas o primeiro e último nome para não quebrar a linha
      const nameParts = char.fullName.split(" ");
      const shortName =
        nameParts.length > 1
          ? `${nameParts[0]} ${nameParts[nameParts.length - 1]}`
          : char.fullName;

      const card = document.createElement("article");
      card.className = `character-card house-${houseClass}`;
      // Usamos tabindex="0" para o celular entender o "toque" como foco
      card.setAttribute("tabindex", "0");
      card.innerHTML = `
        <div class="portrait-img-wrapper">
          <img src="${imgSrc}" alt="Foto de ${char.fullName}" class="portrait-img" loading="lazy" onerror="this.src='${fallbackImg}'" />
          <div class="portrait-data">
            <h3 class="char-name">${shortName}</h3>
            <p class="char-role">${char.interpretedBy || "Bruxo"}</p>
            <div class="char-stats">
              ${char.hogwartsHouse ? `<div class="stat-row"><span class="stat-label">Casa</span><span class="stat-value">${char.hogwartsHouse}</span></div>` : ""}
              ${char.birthdate ? `<div class="stat-row"><span class="stat-label">Nascimento</span><span class="stat-value">${char.birthdate}</span></div>` : ""}
            </div>
          </div>
        </div>
      `;
      container.appendChild(card);
    });
  }

  renderSkeletons(container, count = 4) {
    for (let i = 0; i < count; i++) {
      const sk = document.createElement("div");
      sk.className = "skeleton skeleton-card";
      sk.setAttribute("aria-hidden", "true");
      container.appendChild(sk);
    }
  }

  clearSkeletons(container) {
    if (!container) return;
    container.querySelectorAll(".skeleton").forEach((sk) => sk.remove());
  }

  _getHouseClass(house) {
    if (!house) return "unknown";
    const h = house.toLowerCase();
    if (h.includes("gryffindor") || h.includes("grifinória"))
      return "gryffindor";
    if (h.includes("slytherin") || h.includes("sonserina")) return "slytherin";
    if (h.includes("ravenclaw") || h.includes("corvinal")) return "ravenclaw";
    if (h.includes("hufflepuff") || h.includes("lufa")) return "hufflepuff";
    return "unknown";
  }
}

export { UI };
