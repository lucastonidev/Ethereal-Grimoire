class UI {
  constructor() {
    this.spells = undefined;
  }

  mainCharacters(data) {
    const mainCharactersContainer = document.getElementById("main-character");

    const formartClassHouse = (house) => {
      switch (house) {
        case "Grifinória":
          return "gryffindor";
        case "Lufa-lufa":
          return "slytherin";
        case "Corvinal":
          return "hufflepuff";
        case "Sonserina":
          return "ravenclaw";
        default:
          return "";
      }
    };

    function convertToBrazilianDate(dateString) {
      const months = {
        Jan: "01",
        Feb: "02",
        Mar: "03",
        Apr: "04",
        May: "05",
        Jun: "06",
        Jul: "07",
        Aug: "08",
        Sep: "09",
        Oct: "10",
        Nov: "11",
        Dec: "12",
      };
      const parts = dateString.split(" "); // Divide a string em partes: ["Jul", "31,", "1980"]

      if (parts.length !== 3) {
        return "Formato inválido. Use o formato como 'Jul 31, 1980'.";
      }

      const monthAbbr = parts[0]; // Ex.: "Jul"
      let day = parts[1].replace(",", ""); // Ex.: "31," -> "31"
      const year = parts[2]; // Ex.: "1980"

      if (!months[monthAbbr]) {
        return "Mês inválido. Verifique a abreviação do mês.";
      }

      const monthNumber = months[monthAbbr]; // Ex.: "Jul" -> "07"
      day = day.padStart(2, "0"); // Garante que o dia tenha dois dígitos, ex.: "5" -> "05"

      return `${day}/${monthNumber}/${year}`; // Retorna no formato DD/MM/AAAA
    }

    mainCharactersContainer.innerHTML += `
      <div class="character-card">
        <div class="character-img" style="background-image: url('${
          data[0].image
        }');"></div>
        <div class="character-info">
          <h3>${data[0].nickname}</h3>
          <div class="character-items">
            <p class="meta-items">Interpletado por: ${data[0].interpretedBy}</p>
            <p class="meta-items">
              Casa: ${data[0].hogwartsHouse}
              <span
                class="house ${formartClassHouse(data[0].hogwartsHouse)}"
              ></span>
            </p>
            <p class="meta-items">
              data de nascimento: ${convertToBrazilianDate(data[0].birthdate)}
            </p>
          </div>
        </div>
      </div>
    `;
  }
}

export { UI };
