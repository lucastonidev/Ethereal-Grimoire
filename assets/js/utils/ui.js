class UI {
  mainCharacters(data) {
    const container = document.getElementById("main-character");
    if (!container) return;

    const characters = Array.isArray(data) ? data : [data];

    characters.forEach(char => {
      if (!char || !char.fullName) return;

      const houseClass = this._getHouseClass(char.hogwartsHouse);
      const fallbackImg = `https://ui-avatars.com/api/?name=${encodeURIComponent(char.fullName)}&background=12131f&color=c9a227&size=220&font-size=0.4&bold=true`;
      const imgSrc = char.image && char.image.startsWith("http") ? char.image : fallbackImg;

      const card = document.createElement("article");
      card.className = "character-card";
      card.innerHTML = `
        <div
          class="character-img"
          role="img"
          aria-label="Foto de ${char.fullName}"
          style="background-image:url('${imgSrc}'),url('${fallbackImg}');"
        ></div>
        <div class="character-info">
          <h3>${char.fullName}</h3>
          <div class="character-items">
            ${char.hogwartsHouse ? `
            <div class="meta-items">
              <span class="house-badge ${houseClass}" aria-hidden="true"></span>
              <span>${char.hogwartsHouse}</span>
            </div>` : ""}
            ${char.birthdate ? `
            <div class="meta-items">
              <span>🎂</span>
              <span>${char.birthdate}</span>
            </div>` : ""}
            ${char.interpretedBy ? `
            <div class="meta-items">
              <span>🎬</span>
              <span>${char.interpretedBy}</span>
            </div>` : ""}
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
    container.querySelectorAll(".skeleton").forEach(sk => sk.remove());
  }

  _getHouseClass(house) {
    if (!house) return "unknown";
    const h = house.toLowerCase();
    if (h.includes("gryffindor")  || h.includes("grifinória"))  return "gryffindor";
    if (h.includes("slytherin")   || h.includes("sonserina"))   return "slytherin";
    if (h.includes("ravenclaw")   || h.includes("corvinal"))    return "ravenclaw";
    if (h.includes("hufflepuff")  || h.includes("lufa"))        return "hufflepuff";
    return "unknown";
  }
}

export { UI };
