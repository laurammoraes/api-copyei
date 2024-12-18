import { closeModal } from "./modal.js";

function createModal() {
  const modal = document.createElement("div");
  modal.className = "edit-modal";
  modal.classList.add("non-editable");
  modal.id = "linkEditormodal";
  modal.setAttribute("data-editor-element", "");

  // Define o conteúdo HTML do pop-up
  modal.innerHTML = `
        <form id="editLinkForm" onsubmit="editLink(event)" class="non-editable">
            <div class="form-header">
                <h3 class="non-editable">Editar Link</h3>
                <div>
                    <button type="button"onclick="accessLink()" style= "color: rgb(59, 59, 255);">Acessar Link</button>
                    <button type="button" onclick="closeModal()">X</button>
                </div>
            </div>
            <div class="form-body">
                <div data-link-input>
                    <label for="href">Link</label>
                    <input type="text" name="href" id="href-link" placeholder="Link">
                </div>

                <div data-link-img-input style="display:none;">
                    <label for="href">Imagem</label>
                    <input type="text" name="imagem" id="img-link" placeholder="Link Imagem">
                </div>

                <div data-link-text-input>
                    <label for="text">Texto</label>
                    <input type="text" name="text" id="text-link" placeholder="Texto">
                </div>
                
                <div class="colors-inputs">
                    <div data-link-text-color-input>
                        <label for="text">Alterar Cor do Texto</label>
                        <input type="color" name="text-color" id="text-color-link" placeholder="Cor do Texto">
                    </div>

                    <div data-link-background-color-input>
                        <label for="text">Alterar Cor de fundo</label>
                        <input type="color" name="background-color" value="" id="background-color-link" placeholder="Cor de Fundo">
                    </div>
                </div>

            </div>
            <div class="form-footer">
                <button type="submit">Salvar</button>
                <button class="button-delete" onclick="deleteLink()" type="button">Excluir</button>
                <button type="button" onclick="closeModal()">Cancelar</button>
            </div>
        </form>
    `;

  // Adiciona o pop-up ao body
  modal.style.display = "none";
  document.body.appendChild(modal);
}

let currentLinkElement = null;

function openModal(linkElement) {
  currentLinkElement = linkElement;

  // Preenche os campos de link e texto
  const linkHrefInput = document.getElementById("href-link");
  const linkTextInput = document.getElementById("text-link");
  const imgInput = document.querySelector("[data-link-img-input]");
  const textInput = document.querySelector("[data-link-text-input]");
  const textColorInput = document.querySelector("[data-link-text-color-input]");
  const backgroundColorInput = document.querySelector(
    "[data-link-background-color-input]"
  );

  linkHrefInput.value = linkElement.href;
  const elementText = (linkTextInput.value = linkElement.textContent.trim());

  document.getElementById("linkEditormodal").style.display = "block";

  // Verifica se o link contém uma imagem e exibe o input de imagem
  const imgInLinkElement = linkElement.querySelector("img");
  if (imgInLinkElement) {
    imgInput.style.display = "block";
    document.getElementById("img-link").value = imgInLinkElement.src;
  } else {
    imgInput.style.display = "none";
  }

  // Exibe ou oculta os inputs de texto e cor de texto com base no conteúdo
  const shouldShowTextInputs = elementText.length > 0;
  textInput.style.display = shouldShowTextInputs ? "block" : "none";
  textColorInput.style.display = shouldShowTextInputs ? "flex" : "none";

  // Define a cor atual do texto no input de cor
  const currentTextColor =
    linkElement.style.color || getComputedStyle(linkElement).color;
  document.getElementById("text-color-link").value = rgbToHex(currentTextColor);

  // Verifica o background (cor ou imagem) e exibe o input de background color se necessário
  const computedStyle = getComputedStyle(linkElement);
  const backgroundColor = computedStyle.backgroundColor;
  const backgroundImage = computedStyle.backgroundImage;

  const shouldShowBackground =
    (backgroundColor &&
      backgroundColor !== "rgba(0, 0, 0, 0)" &&
      backgroundColor !== "transparent") ||
    (backgroundImage &&
      (backgroundImage.includes("linear-gradient") ||
        backgroundImage.includes("radial-gradient")));

  if (shouldShowBackground) {
    backgroundColorInput.style.display = "flex";

    // Se houver background color, converte para hexadecimal e define no input
    if (backgroundColor) {
      backgroundColorInput.value = rgbToHex(backgroundColor);
    }
  } else {
    backgroundColorInput.style.display = "none";
  }
}

export function rgbToHex(rgb) {
  if (!rgb) return "#ffffff";
  const rgbValues = rgb.match(/\d+/g);
  if (!rgbValues || rgbValues.length < 3) return "#ffffff";
  return `#${(
    (1 << 24) +
    (+rgbValues[0] << 16) +
    (+rgbValues[1] << 8) +
    +rgbValues[2]
  )
    .toString(16)
    .slice(1)}`;
}

export function deleteLink() {
  const isConfirmed = window.confirm(
    "Você tem certeza que deseja excluir este elemento?"
  );

  if (!isConfirmed) return;

  if (currentLinkElement) {
    currentLinkElement.remove();
    closeModal();
  }
}

function findTextElement(parent) {
  let textElement = null;

  function traverse(node) {
    if (
      node.nodeType === Node.ELEMENT_NODE &&
      node.textContent.trim().length > 0
    ) {
      const hasTextOnly = [...node.childNodes].every(
        (child) => child.nodeType === Node.TEXT_NODE
      );

      if (hasTextOnly) {
        textElement = node;
        return;
      }
    }

    node.childNodes.forEach((child) => {
      if (!textElement) {
        traverse(child);
      }
    });
  }

  traverse(parent);
  return textElement;
}

export function editLink(event) {
  event.preventDefault();
  const newHref = document.getElementById("href-link").value;
  const newText = document.getElementById("text-link").value;
  const newImg = document.getElementById("img-link").value;
  const newTextColor = document.getElementById("text-color-link").value;
  const newBackgroundColor = document.getElementById(
    "background-color-link"
  ).value; // Nova variável para cor de fundo

  if (currentLinkElement) {
    let elementWithText = findTextElement(currentLinkElement);
    const imgInLinkElement = currentLinkElement.querySelector("img");

    if (imgInLinkElement && newImg.length > 0) {
      imgInLinkElement.src = newImg;
      if (imgInLinkElement.srcset) imgInLinkElement.srcset = newImg;
    }

    if (elementWithText && newText.length > 0) {
      elementWithText.textContent = newText;
    } else if (newText.length > 0) {
      currentLinkElement.textContent = newText;
    }

    if (newTextColor.length > 0) {
      currentLinkElement.style.color = newTextColor;
    }

    // Aplica cor de fundo somente se o campo tiver sido modificado
    if (
      newBackgroundColor !== "" &&
      document.querySelector("[data-link-background-color-input]").style
        .display !== "none"
    ) {
      const computedStyle = getComputedStyle(currentLinkElement);
      const backgroundImage = computedStyle.backgroundImage;

      if (
        (backgroundImage && backgroundImage.includes("linear-gradient")) ||
        backgroundImage.includes("radial-gradient")
      ) {
        currentLinkElement.style.backgroundImage = "none";
      }
      currentLinkElement.style.backgroundColor = newBackgroundColor;
    }

    currentLinkElement.href = newHref;
  }

  closeModal();
}

export function accessLink() {
  if (currentLinkElement) {
    window.open(currentLinkElement.href, "_blank");
  }
}

let linkClickHandler = function (event) {
  event.preventDefault();
  event.stopPropagation(); // Impede a propagação do evento

  // Se o target for null ou '_blank', muda para '_self'
  if (!this.target || this.target === "_blank") {
    this.target = "_self";
  }
  openModal(this);
};

export function addLinksEditor() {
  createModal();

  document.querySelectorAll("a").forEach((link) => {
    if (!link.classList.contains("non-editable"))
      link.addEventListener("click", linkClickHandler, true);
  });
}

export function removeLinksEditorEvents() {
  document.querySelectorAll("a").forEach((link) => {
    link.removeEventListener("click", linkClickHandler);
  });
}
