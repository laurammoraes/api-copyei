import { closeModal } from "./modal.js";
import { addConfigItem } from "./pageConfigEditor.js";

function createModal() {
  const modal = document.createElement("div");
  modal.className = "edit-modal";
  modal.classList.add("non-editable");
  modal.id = "pixelEditorModal";
  modal.setAttribute("data-editor-element", "");

  modal.innerHTML = `
        <form id="pixelForm" onsubmit="editPixel(event)" class="non-editable">
            <div class="form-header">
                <h3 class="non-editable">Adicionar Facebook Pixel à página</h3>
                <div>
                    <button type="button" onclick="closeModal()">X</button>
                </div>
            </div>

            <div class="form-body">
                <div class="background-pixel-inputs" data-pixel-inputs>
                    <div>
                        <label for="pixel-number">*Código do Pixel</label>
                        <input type="text" name="pixel-number" id="pixel-number" value="" placeholder="Pixel ID">
                    </div>
                </div>
            </div>
            <div class="form-footer">
                <button type="submit">Salvar</button>
                <button class="button-delete" type="button" id="pixel-button-delete" onclick="deletePixelScripts()">Excluir</button>
                <button type="button" onclick="closeModal()">Cancelar</button>
            </div>
        </form>
    `;

  modal.style.display = "none";

  document.body.appendChild(modal);
}

export function openPixelModal() {
  if (document.querySelectorAll("[pixel-script]").length === 0) {
    document.getElementById("pixel-button-delete").style.display = "none";
  } else {
    document.getElementById("pixel-button-delete").style.display = "block";
  }
  document.getElementById("pixelEditorModal").style.display = "block";
}

function addFacebookPixel(pixelID) {
  var scriptTag = document.createElement("script");
  scriptTag.setAttribute("pixel-script", "");

  scriptTag.innerHTML = `
      !function(f,b,e,v,n,t,s)
      {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
      n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t,s)}(window,document,'script',
      'https://connect.facebook.net/en_US/fbevents.js');
      fbq('init', '${pixelID}'); 
      fbq('track', 'PageView');
    `;

  document.head.appendChild(scriptTag);

  var noScriptTag = document.createElement("noscript");
  noScriptTag.setAttribute("pixel-script", "");

  noScriptTag.innerHTML = `
      <img height="1" width="1" style="display:none"
      src="https://www.facebook.com/tr?id=${pixelID}&ev=PageView&noscript=1"/>
    `;

  document.body.insertAdjacentElement("afterbegin", noScriptTag);
}

export function editPixel(event) {
  event.preventDefault();

  const pixelNumber = document.getElementById("pixel-number").value;

  if (pixelNumber.length === 0) {
    return;
  }

  const pixelScript = document.querySelectorAll("[pixel-script]");

  if (pixelScript.length > 0) {
    pixelScript.forEach((script) => {
      script.remove();
    });
  }

  addFacebookPixel(pixelNumber);

  alert("Facebook Pixel adicionado com sucesso!");

  closeModal();
}

export function deletePixelScripts() {
  const isConfirmed = window.confirm(
    "Você tem certeza que deseja excluir os scripts do Facebook Pixel?"
  );

  if (!isConfirmed) {
    return;
  }

  const pixelScript = document.querySelectorAll("[pixel-script]");

  if (pixelScript.length > 0) {
    pixelScript.forEach((script) => {
      script.remove();
    });
  }

  alert("Facebook Pixel excluído com sucesso!");

  closeModal();
}

export function addPixelEditor() {
  createModal();
  addConfigItem("Adicionar Facebook Pixel", openPixelModal);
}
