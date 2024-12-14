import { closeModal } from "./modal.js";
import { addConfigItem } from "./pageConfigEditor.js";

function createModal() {
  const modal = document.createElement("div");
  modal.className = "edit-modal";
  modal.classList.add("non-editable");
  modal.id = "gmtEditorModal";
  modal.setAttribute("data-editor-element", "");

  modal.innerHTML = `
        <form id="gmtForm" onsubmit="editGmt(event)" class="non-editable">
            <div class="form-header">
                <h3 class="non-editable">Adicionar GMT a página</h3>
                <div>
                    <button type="button" onclick="closeModal()">X</button>
                </div>
            </div>

            <div class="form-body">
                <div class="background-gmt-inputs" data-gmt-inputs>
                    <div>
                        <label for="gmt-number">*Codigo do Contêiner</label>
                        <input type="text" name="gmt-number" id="gmt-number" value="" placeholder="GTM-XXXXXXXX">
                    </div>
                </div>
            </div>
            <div class="form-footer">
                <button type="submit">Salvar</button>
                <button class="button-delete" type="button" id="gmt-button-delete" onclick="deleteGmtScripts()">Excluir</button>
                <button type="button" onclick="closeModal()">Cancelar</button>
            </div>
        </form>
    `;

  modal.style.display = "none";

  document.body.appendChild(modal);
}

export function openGmtModal() {
  if (document.querySelectorAll("[gmt-script]").length === 0) {
    document.getElementById("gmt-button-delete").style.display = "none";
  } else {
    document.getElementById("gmt-button-delete").style.display = "block";
  }
  document.getElementById("gmtEditorModal").style.display = "block";
}

function addGTM(containerID) {
  var scriptTag = document.createElement("script");

  scriptTag.setAttribute("gmt-script", "");

  scriptTag.innerHTML = `
      (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
      new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
      j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
      'https://www.googletagmanager.com/gtm.js?id=' + i + dl;f.parentNode.insertBefore(j,f);
      })(window,document,'script','dataLayer','${containerID}');
    `;

  // Insere o script dentro da tag <head>
  document.head.appendChild(scriptTag);

  var noScriptTag = document.createElement("noscript");

  noScriptTag.setAttribute("gmt-script", "");

  noScriptTag.innerHTML = `
      <iframe src="https://www.googletagmanager.com/ns.html?id=${containerID}"
      height="0" width="0" style="display:none;visibility:hidden"></iframe>
    `;

  // Insere o noscript logo após o início do <body>
  document.body.insertAdjacentElement("afterbegin", noScriptTag);
}

export function editGmt(event) {
  event.preventDefault();

  const gmtNumber = document.getElementById("gmt-number").value;

  if (gmtNumber.length === 0) {
    return;
  }

  const gmtScript = document.querySelectorAll("[gmt-script]");

  if (gmtScript.length > 0) {
    gmtScript.forEach((script) => {
      script.remove();
    });
  }

  addGTM(gmtNumber);

  alert("GMT adicionado com sucesso!");

  closeModal();
}

export function deleteGmtScripts() {
  const isConfirmed = window.confirm(
    "Você tem certeza que deseja excluir os scripts do GTM?"
  );

  if (!isConfirmed) {
    return;
  }

  const gmtScript = document.querySelectorAll("[gmt-script]");

  if (gmtScript.length > 0) {
    gmtScript.forEach((script) => {
      script.remove();
    });
  }

  alert("GMT excluído com sucesso!");

  closeModal();
}

export function addGmtEditor() {
  createModal();

  addConfigItem("Adicionar GMT", openGmtModal);
}
