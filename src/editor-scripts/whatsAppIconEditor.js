import { closeModal } from "./modal.js";
import { addConfigItem } from "./pageConfigEditor.js";

function getElementParent(element) {
  if (
    element &&
    !(element.previousElementSibling || element.nextElementSibling)
  ) {
    return getElementParent(element.parentElement);
  } else {
    return element;
  }
}

function pageHasWhatsAppIcon() {
  // Verifica se já existe um ícone com link para o WhatsApp
  const joinWhatsApp = document.querySelector(".joinchat");

  const element = joinWhatsApp;

  if (element) {
    const parentElement = getElementParent(element);

    if (parentElement.id !== "whats-icon-editor") {
      parentElement.remove();
    }
  }
}

function createModal() {
  // Cria o elemento div para o pop-up
  const modal = document.createElement("div");
  modal.className = "edit-modal";
  modal.classList.add("non-editable");
  modal.id = "whatsIconEditormodal";
  modal.setAttribute("data-editor-element", "");

  // Define o conteúdo HTML do pop-up
  modal.innerHTML = `
        <form id="WhatsForm" onsubmit="editWhatsIcon(event)" class="non-editable">
            <div class="form-header">
                <h3 class="non-editable">Icone WhatsApp</h3>
                <div>
                    <button type="button" onclick="closeModal()">X</button>
                </div>
            </div>
            <div class="form-msg-error" id="form-msg-error">
                Numero WhatsApp deve estar no formato internacional, sem zeros, parênteses, ou caracteres especiais. Apenas números com o código do país.
            </div>
            <div class="form-body">
                <div class="background-Whats-inputs" data-Whats-inputs>
                    <div>
                        <label for="whats-number">*Numero WhatsApp</label>
                        <input type="tel" name="whats-number" id="whats-number" value="" placeholder="5511999999999">
                    </div>
                    <div>
                        <label for="whats-msg">Menssagem</label>
                        <input type="text" name="whats-msg" id="whats-msg">
                    </div>
                    <div> 
                        <label for="whats-msg" class="whats-label">Estilo do Ícone</label>
                        <div class="whats-radio-group">
                            <div class="whats-inputs-radio">
                                <input type="radio" name="whats-icon-style" value="android" id="android-radio" checked>
                                <label for="android-radio">Android</label>
                            </div>
                            <div class="whats-inputs-radio">
                                <input type="radio" name="whats-icon-style" value="ios" id="ios-radio">
                                <label for="ios-radio">IOS</label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="form-footer">
                <button type="submit">Salvar</button>
                <button class="button-delete" id="whats-button-delete" type="button" onclick="deleteWhats()">Excluir</button>
                <button type="button" onclick="closeModal()">Cancelar</button>
            </div>
        </form>
    `;

  modal.style.display = "none";

  document.body.appendChild(modal);
}

let currentWhatsElement = null;

export function openWhatsIconModal() {
  currentWhatsElement = document.getElementById("whats-icon-editor");

  if (currentWhatsElement) {
    let whatsLinkElement = document.getElementById(
      "link-whats-icon-editor"
    ).href;

    // Exemplo de link: https://wa.me/5511999999999?text=Ol%C3%A1%21%20Estou%20interessado%20no%20seu%20produto.

    whatsLinkElement = whatsLinkElement.split("https://wa.me/")[1].split("?");
    const message = whatsLinkElement[1]
      ? whatsLinkElement[1].split("text=")[1]
      : "";

    document.getElementById("whats-number").value = whatsLinkElement[0];
    document.getElementById("whats-msg").value = message
      ? decodeURIComponent(message)
      : "";

    if (currentWhatsElement.classList.contains("whats-icon-style-ios")) {
      document.getElementById("ios-radio").checked = true;
    } else {
      document.getElementById("android-radio").checked = true;
    }

    document.getElementById("whats-button-delete").style.display = "block";
  } else {
    document.getElementById("whats-button-delete").style.display = "none";
  }

  document.getElementById("whatsIconEditormodal").style.display = "block";
}

function addStyleWhatsIcon() {
  const style = document.createElement("style");
  style.id = "whats-icon-editor-style";

  style.innerHTML = `
        .whats-icon-editor {
            display: flex;
            align-items: center;
            justify-content: center;
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 9999999;
            padding: 10px;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .whats-icon-editor img {
            width: 70px;
            height: 70px;
        }
        
        .whats-icon-editor:hover {
            transform: scale(1.1);
        }
    `;

  document.head.appendChild(style);
}

function createElementWhatsIcon() {
  const whatsIcon = document.createElement("div");
  whatsIcon.className = "whats-icon-editor";
  whatsIcon.classList.add("non-editable");
  whatsIcon.id = "whats-icon-editor";
  whatsIcon.innerHTML = `
    <a id="link-whats-icon-editor" href="" class="non-editable" target="_blank">
        <img src="https://img.icons8.com/?size=100&id=16713&format=png&color=000000" alt="WhatsApp Icon">
    </a>`;

  document.body.appendChild(whatsIcon);

  addStyleWhatsIcon();
}

function createWhatsAppLink(phoneNumber, message) {
  const encodedMessage = encodeURIComponent(message);

  const whatsappLink = encodedMessage
    ? `https://wa.me/${phoneNumber}?text=${encodedMessage}`
    : `https://wa.me/${phoneNumber}`;

  return whatsappLink;
}

function numberValidation(number) {
  return number && number.length === 13 && Number(number) !== NaN;
}

function whatsIconClickHandler(event) {
  event.preventDefault();
  event.stopPropagation(); // Impede a propagação do evento

  // Se o target for null ou '_blank', muda para '_self'
  if (!this.target || this.target === "_blank") {
    this.target = "_self";
  }
  openWhatsIconModal(this);
}

function whatsIconSyle(iconStyle) {
  const whatsIcon = document.getElementById("whats-icon-editor");

  if (iconStyle === "android") {
    whatsIcon.querySelector("img").src =
      "https://img.icons8.com/?size=100&id=16713&format=png&color=000000";

    if (whatsIcon.classList.contains("whats-icon-style-ios")) {
      whatsIcon.classList.remove("whats-icon-style-ios");
    }

    whatsIcon.classList.add("whats-icon-style-android");
  } else {
    whatsIcon.querySelector("img").src =
      "https://img.icons8.com/?size=100&id=UBjTW632xuVM&format=png&color=000000";

    if (whatsIcon.classList.contains("whats-icon-style-android")) {
      whatsIcon.classList.remove("whats-icon-style-android");
    }

    whatsIcon.classList.add("whats-icon-style-ios");
  }
}

export function editWhatsIcon(event) {
  event.preventDefault();

  const whatsNumber = document.getElementById("whats-number").value;
  const whatsMsg = document.getElementById("whats-msg").value;
  const whatsIconStyle = document.querySelector(
    'input[name="whats-icon-style"]:checked'
  ).value;

  if (!numberValidation(whatsNumber)) {
    const formMsgError = document.getElementById("form-msg-error");
    formMsgError.style.display = "flex";

    setTimeout(() => {
      formMsgError.style.display = "none";
    }, 10000);

    return;
  }

  const whatsIcon = document.getElementById("whats-icon-editor");

  if (!whatsIcon) {
    createElementWhatsIcon();
    addEventListenerWhatsIconClickHandler();
  }

  document.getElementById("link-whats-icon-editor").href = createWhatsAppLink(
    whatsNumber,
    whatsMsg
  );
  whatsIconSyle(whatsIconStyle);

  closeModal();
}

function addEventListenerWhatsIconClickHandler() {
  const whatsIcon = document.getElementById("whats-icon-editor");

  if (whatsIcon) {
    whatsIcon.addEventListener("click", whatsIconClickHandler, true);
  }
}

export function removeWhatsIconClickHandler() {
  const whatsIcon = document.getElementById("whats-icon-editor");

  if (whatsIcon) {
    whatsIcon.removeEventListener("click", whatsIconClickHandler, true);
  }
}

export function deleteWhats() {
  const isConfirmed = window.confirm(
    "Você tem certeza que deseja excluir o icone do whatsapp?"
  );

  if (!isConfirmed) {
    return;
  }

  const whatsIcon = document.getElementById("whats-icon-editor");

  if (whatsIcon) {
    whatsIcon.remove();

    document.getElementById("whats-icon-editor-style").remove();

    document.getElementById("whats-number").value = "";
    document.getElementById("whats-msg").value = "";
  }

  alert("Icone do WhatsApp excluído com sucesso!");

  closeModal();
}

export function addWhatsAppButtonEditor() {
  pageHasWhatsAppIcon();

  addConfigItem("Adicionar Icone WhatsApp", openWhatsIconModal);

  addEventListenerWhatsIconClickHandler();
  createModal();
}
