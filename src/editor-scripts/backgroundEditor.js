import { closeModal } from "./modal.js";

function styleBackgroundEditorButton() {
  const style = document.createElement("style");
  style.innerHTML = `
        .editor-button-edit-background {
            display: flex;
            align-items: center;
            justify-content: center;
            box-sizing: border-box;
            position: absolute; 
            right: 0;
            top: 0;
            margin: 5px;
            padding: 10px;
            width: 50px;
            height: 50px;
            background-color: #0000001b;
            border: solid 1px rgba(128, 128, 128, 0.498);
            cursor: pointer;
            z-index: 9999;
        }
        .editor-button-edit-background img {
             width: 100%;
            height: 100%
        }
        .editor-button-edit-background:hover {
            background-color: #00000057;
        }
    `;
  style.setAttribute("data-editor-element", "");
  document.head.appendChild(style);
}

function createModal() {
  // Cria o elemento div para o pop-up
  const modal = document.createElement("div");
  modal.className = "edit-modal";
  modal.classList.add("non-editable");
  modal.id = "editBackgroundmodal";
  modal.setAttribute("data-editor-element", "");

  // Define o conteúdo HTML do pop-up
  modal.innerHTML = `
        <form id="editBackgroundForm" class="non-editable" onsubmit="editBackground(event)" style="width: 550px;">
            <div class="form-header">
                <h3 class="non-editable">Editar Background</h3>
                <div>
                    <button type="button" onclick="closeModal()">X</button>
                </div>
            </div>
            <div class="form-body">
                <div class="background-img-inputs" style="display: none;" data-background-img-inputs>
                    <p class="non-editable">Alterar Imagem de fundo</p>
                    <div>
                        <label for="background-img">Alterar Imagem via link</label>
                        <input type="url" name="background-img-link" id="background-img-link">
                    </div>
                    <span class="non-editable"> ou </span>
                    <div>
                        <label for="background-img-upload">Fazer upload da imagem</label>
                        <input type="file" name="background-img-upload" id="background-img-upload" accept="image/*">
                    </div>
                </div>
                <div class="colors-inputs">
                    <div data-background-color-input>
                        <label for="background-color">Alterar Cor de fundo</label>
                        <input type="color" name="background-color" id="background-color">
                    </div>
                </div>
            </div>
            <div class="form-footer">
                <button type="submit">Salvar</button>
                <button class="button-delete" type="button" onclick="deleteElementBackground()" style="width: 150px;">Excluir Elemento</button>
                <button class="button-delete" id="button-delete-backeground-img" type="button" onclick="deleteElementBackgroundImage()" style="width: 190px; display: none;">Excluir Imagem Fundo</button>
                <button type="button" onclick="closeModal()" id="button-cancel" style="display: none;">Cancelar</button>
            </div>
        </form>
    `;

  modal.style.display = "none";

  document.body.appendChild(modal);
}

function createBackgroundEditorButton() {
  const div = document.createElement("div");
  div.classList.add("editor-button-edit-background");
  div.classList.add("non-editable");
  div.setAttribute("data-editor-element", "");
  div.innerHTML = `<img class="non-editable" src="https://img.icons8.com/?size=100&id=41647&format=png&color=000000" alt="">`;
  div.addEventListener("click", elementClickHandler);

  return div;
}

function getElementsWithBackground() {
  const allElements = Array.from(document.querySelectorAll("*")); // Seleciona todos os elementos
  const elementsWithBackground = new Set(); // Usamos um Set para evitar duplicações

  allElements.forEach((element) => {
    const style = window.getComputedStyle(element); // Obtém o estilo computado do elemento
    const backgroundColor = style.getPropertyValue("background-color");
    const backgroundImage = style.getPropertyValue("background-image");

    // Verifica se o background-color está definido e não é "rgba(0, 0, 0, 0)" (transparente) ou "transparent"

    if (
      element instanceof HTMLElement &&
      !element.classList.contains("non-editable")
    ) {
      if (
        backgroundColor &&
        backgroundColor !== "rgba(0, 0, 0, 0)" &&
        backgroundColor !== "transparent"
      ) {
        elementsWithBackground.add(element); // Adiciona o elemento ao Set se tiver background-color válido
      }

      // Verifica se o background-image está definido e não é "none"
      if (backgroundImage && backgroundImage !== "none") {
        elementsWithBackground.add(element); // Adiciona o elemento ao Set se tiver background-image
      }
    }
  });

  return Array.from(elementsWithBackground); // Converte o Set de volta para array e retorna
}

let currentbackgroundElement = null;

function getCurrentbackgroundElement(backgroundButtonElement) {
  const backegroundId = backgroundButtonElement.getAttribute(
    "data-background-button-id"
  );

  if (backegroundId) {
    return document.querySelector(
      `[data-background-element-id="${backegroundId}"]`
    );
  }

  return backgroundButtonElement.parentElement;
}

function openModal(backgroundButtonElement) {
  currentbackgroundElement = getCurrentbackgroundElement(
    backgroundButtonElement
  );

  const style = window.getComputedStyle(currentbackgroundElement);
  const backgroundColor = style.getPropertyValue("background-color");
  const backgroundImage = style.getPropertyValue("background-image");

  const imgInput = document.querySelector("[data-background-img-inputs]");
  const colorInput = document.querySelector("[data-background-color-input]");

  // Verifica se possui backgroundImagem e se é do tipo url
  if (backgroundImage && backgroundImage.includes("url")) {
    imgInput.style.display = "block";

    const url = backgroundImage.match(/url\((.*?)\)/)[1].replace(/['"]+/g, "");
    document.getElementById("background-img-link").value = url;

    document.getElementById("button-delete-backeground-img").style.display =
      "block";
    document.getElementById("button-cancel").style.display = "none";
  } else {
    imgInput.style.display = "none";

    document.getElementById("button-delete-backeground-img").style.display =
      "none";
    document.getElementById("button-cancel").style.display = "block";
  }

  // Verifica se possui backgroundColor ou backgroundImage do tipo gradiente
  if (
    (backgroundColor &&
      backgroundColor !== "rgba(0, 0, 0, 0)" &&
      backgroundColor !== "transparent") ||
    (backgroundImage &&
      (backgroundImage.includes("linear-gradient") ||
        backgroundImage.includes("radial-gradient")))
  ) {
    colorInput.style.display = "flex";
    if (backgroundColor) {
      const hexColor = rgbToHex(backgroundColor);
      colorInput.style.display = "flex";
      document.getElementById("background-color").value = hexColor;
    }
  } else {
    colorInput.style.display = "none";
  }

  document.getElementById("editBackgroundmodal").style.display = "block";
}

function rgbToHex(rgb) {
  if (!rgb) return "#ffffff";

  // Match valores RGB ou RGBA
  const rgbValues = rgb.match(/\d+/g);
  if (!rgbValues || rgbValues.length < 3) return "#ffffff";

  // Converte os três primeiros valores (RGB) para hex
  const r = parseInt(rgbValues[0], 10);
  const g = parseInt(rgbValues[1], 10);
  const b = parseInt(rgbValues[2], 10);

  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

function uploadImage(file, element) {
  const formData = new FormData();

  const url = window.location.href.split("/editor/");
  const serverUrl = url[0];
  const siteDomain = url[1].split("/")[0];

  // Adiciona o arquivo e o domínio do site ao FormData
  formData.append("siteDomain", siteDomain);
  formData.append("image", file);

  fetch(`${serverUrl}/uploadImages`, {
    method: "POST",
    body: formData, // O navegador gerenciará o Content-Type corretamente
  })
    .then((response) => response.json())
    .then((data) => {
      const imageUrl = data.imagePath; // backend retorna 'imagePath'

      if (imageUrl) {
        // Remove possíveis classes com estilos de background
        element.classList.forEach((cls) => {
          if (cls.startsWith("vc_custom_")) {
            element.classList.remove(cls);
          }
        });

        element.style.setProperty(
          "background-image",
          `url(.${imageUrl})`,
          "important"
        );
        element.style.setProperty(
          "background-repeat",
          "no-repeat",
          "important"
        );
        element.style.setProperty("background-size", "cover", "important");
        element.style.setProperty("background-position", "center", "important");
      } else {
        window.alert("Erro ao fazer upload da imagem");
      }
    })
    .catch((error) => {
      window.alert("Erro ao fazer upload da imagem");
      console.error("Erro ao fazer upload da imagem:", error);
    });
}

export function editBackground(event) {
  event.preventDefault();

  const newBackgroundColor = document.getElementById("background-color").value;

  const imgInputUpload = document.getElementById("background-img-upload");
  const file = imgInputUpload.files[0];

  const imgInputLink = document.getElementById("background-img-link");

  // Verifica se o campo de imagem está visível
  if (
    document.querySelector("[data-background-img-inputs]").style.display ===
    "block"
  ) {
    if (file) {
      uploadImage(file, currentbackgroundElement);
    } else if (imgInputLink.value) {
      // Remove possíveis classes com estilos de background
      currentbackgroundElement.classList.forEach((cls) => {
        if (cls.startsWith("vc_custom_")) {
          currentbackgroundElement.classList.remove(cls);
        }
      });

      // Força a atualização do background via style
      currentbackgroundElement.style.setProperty(
        "background-image",
        `url(${imgInputLink.value})`,
        "important"
      );
      currentbackgroundElement.style.setProperty(
        "background-repeat",
        "no-repeat",
        "important"
      );
      currentbackgroundElement.style.setProperty(
        "background-size",
        "cover",
        "important"
      );
      currentbackgroundElement.style.setProperty(
        "background-position",
        "center",
        "important"
      );
    }
  }

  if (currentbackgroundElement && newBackgroundColor.length > 0) {
    const style = window.getComputedStyle(currentbackgroundElement);
    const backgroundImage = style.getPropertyValue("background-image");

    // Remove gradientes se necessário
    if (
      backgroundImage &&
      (backgroundImage.includes("linear-gradient") ||
        backgroundImage.includes("radial-gradient"))
    ) {
      currentbackgroundElement.style.backgroundImage = "none";
    }

    // Aplica a nova cor de fundo
    currentbackgroundElement.style.setProperty(
      "background-color",
      newBackgroundColor,
      "important"
    );
  }

  closeModal();
}

export function deleteElementBackground() {
  const isConfirmed = window.confirm(
    "Você tem certeza que deseja excluir este elemento?"
  );
  if (!isConfirmed) return;

  if (currentbackgroundElement) {
    currentbackgroundElement.remove();
    closeModal();
  }
}

export function deleteElementBackgroundImage() {
  const isConfirmed = window.confirm(
    "Você tem certeza que deseja excluir a imagem de fundo deste elemento?"
  );
  if (!isConfirmed) return;

  if (currentbackgroundElement) {
    currentbackgroundElement.style.backgroundImage = "none";

    currentbackgroundElement.classList.forEach((cls) => {
      if (cls.startsWith("vc_custom_")) {
        currentbackgroundElement.classList.remove(cls);
      }
    });

    currentbackgroundElement.style.setProperty("background-image", "none");

    const style = window.getComputedStyle(currentbackgroundElement);

    if (
      style.getPropertyValue("background-color") === "rgba(0, 0, 0, 0)" ||
      style.getPropertyValue("background-color") === "transparent"
    ) {
      currentbackgroundElement.style.setProperty("background-color", "#ffffff");
    }

    closeModal();
  }
}

let elementClickHandler = function (event) {
  event.preventDefault();
  openModal(this);
};

function elementHasContent(element) {
  const childrens = Array.from(element.querySelectorAll("*"));

  const elementDiferentDiv = childrens.some((child) => child.tagName !== "DIV");

  return elementDiferentDiv || element.textContent.trim().length > 0;
}

function ajustStyleButton(button, element) {
  const buttonSytle = window.getComputedStyle(button);
  const elementStyle = window.getComputedStyle(element);

  const elementHeight = Number(elementStyle.height.split("px")[0]);
  const buttonHeight = Number(buttonSytle.height.split("px")[0]);

  if (elementHeight < buttonHeight) {
    button.style.height = "80%";
  }
}

// Ajusta a posição do botão de edição de background
function setBackgroundButtonPosition(button, element) {
  if (window.getComputedStyle(element).position !== "absolute") {
    element.style.position = "relative";
    element.insertBefore(button, element.firstChild);
  } else {
    const backegroundId = Math.floor(Math.random() * 1000000);

    element.setAttribute("data-background-element-id", backegroundId);

    button.setAttribute("data-background-button-id", backegroundId);

    document.body.appendChild(button);

    const rect = element.getBoundingClientRect();
    button.style.right = `${rect.left + window.scrollX + 10}px`;
    button.style.top = `${rect.top + window.scrollY + 5}px`;
  }
}

export function addBackgroundEditor() {
  createModal();
  styleBackgroundEditorButton();

  getElementsWithBackground().forEach((element) => {
    if (
      !["A", "BUTTON", "INPUT", "BODY", "SPAN"].includes(element.tagName) &&
      !element.closest("a") &&
      window.getComputedStyle(element).visibility !== "hidden" &&
      window.getComputedStyle(element).display !== "none" &&
      !element.classList.contains("non-editable") &&
      elementHasContent(element)
    ) {
      const button = createBackgroundEditorButton();

      ajustStyleButton(button, element);
      setBackgroundButtonPosition(button, element);
    }
  });
}

export function removeBackgroundEditor() {
  const buttons = document.querySelectorAll(".editor-button-edit-background");
  buttons.forEach((button) => {
    button.parentElement.style.removeProperty("position");
    button.remove();
  });

  document
    .querySelectorAll("[data-background-button-id]")
    .forEach((element) => {
      element.removeAttribute("data-background-element-id");
    });

  document.querySelectorAll("section").forEach((element) => {
    if (window.getComputedStyle(element).visibility === "hidden") {
      element.remove();
    }
  });
}
