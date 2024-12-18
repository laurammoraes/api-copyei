import { closeModal } from "./modal.js";

function createModal() {
  // Cria o elemento div para o pop-up
  const modal = document.createElement("div");
  modal.className = "edit-modal";
  modal.classList.add("non-editable");
  modal.id = "imgEditormodal";
  modal.setAttribute("data-editor-element", "");

  // Define o conteúdo HTML do pop-up
  modal.innerHTML = `
        <form id="editImgForm" onsubmit="editImg(event)" class="non-editable">
            <div class="form-header">
                <h3 class="non-editable" >Editar Imagem</h3>
                <div>
                    <button type="button" onclick="closeModal()">X</button>
                </div>
            </div>
            <div class="form-body">
                <div class="background-img-inputs" data-img-inputs>
                    <p class="non-editable">Alterar Imagem</p>
                    <div>
                        <label for="img-link-src">Alterar Imagem via link</label>
                        <input type="url" name="img-link-src" id="img-link-src" value="">
                    </div>
                    <span class="non-editable"> ou </span>
                    <div>
                        <label for="img-upload">Fazer upload da imagem</label>
                        <input type="file" name="img-upload" id="img-upload" accept="image/*">
                    </div>
                    <div class="img-size-inputs">
                        <div>
                            <label for="img-height">Altura da imagem (px)</label>
                            <input type="number" name="img-height" id="img-height" placeholder="Pixels">
                        </div>
                        <div>
                            <label for="img-width">Largura da imagem (px)</label>
                            <input type="number" name="img-width" id="img-width" placeholder="Pixels"">
                        </div>
                    </div>
                </div>
            </div>
            <div class="form-footer">
                <button type="submit">Salvar</button>
                <button class="button-delete" type="button" onclick="deleteImg()">Excluir</button>
                <button type="button" onclick="closeModal()">Cancelar</button>
            </div>
        </form>
    `;

  modal.style.display = "none";

  document.body.appendChild(modal);
}

let currentImgElement = null;

function openModal(imgElement) {
  currentImgElement = imgElement;

  document.getElementById("imgEditormodal").style.display = "block";
  document.getElementById("img-link-src").value = imgElement.src;

  const style = window.getComputedStyle(imgElement);

  document.getElementById("img-width").value = style.width
    .replace("px", "")
    .split(".")[0];
  document.getElementById("img-height").value = style.height
    .replace("px", "")
    .split(".")[0];
}

export function deleteImg() {
  const isConfirmed = window.confirm(
    "Você tem certeza que deseja excluir este elemento?"
  );

  if (!isConfirmed) return;

  if (currentImgElement) {
    currentImgElement.remove();
    closeModal();
  }
}

function uploadImage(file, element) {
  const formData = new FormData();

  const url = window.location.href.split("/editor/");
  const serverUrl = url[0];
  const siteDomain = url[1].split("/")[0];

  formData.append("siteDomain", siteDomain);
  formData.append("image", file);

  fetch(`${serverUrl}/uploadImages`, {
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      const imageUrl = data.imagePath; // backend retorna 'imagePath'

      if (imageUrl) {
        element.src = `.${imageUrl}`;
        if (element.srcset) element.srcset = `.${imageUrl}`;
      } else {
        window.alert("Erro ao fazer upload da imagem");
      }
    })
    .catch((error) => {
      window.alert("Erro ao fazer upload da imagem");
      console.error("Erro ao fazer upload da imagem:", error);
    });
}

export function editImg(event) {
  event.preventDefault();
  const imgInputUpload = document.getElementById("img-upload");
  const file = imgInputUpload.files[0];

  const imgInputLink = document.getElementById("img-link-src");

  const imgWidth = document.getElementById("img-width").value;
  const imgHeight = document.getElementById("img-height").value;

  if (imgWidth <= 0 || imgHeight <= 0) {
    window.alert("As dimensões da imagem devem ser maiores que zero.");
    return;
  }

  if (file) {
    uploadImage(file, currentImgElement);
  } else if (imgInputLink.value.length > 0) {
    currentImgElement.src = imgInputLink.value;

    if (currentImgElement.srcset) currentImgElement.srcset = imgInputLink.value;
  }

  currentImgElement.style.width = imgWidth + "px";
  currentImgElement.style.height = imgHeight + "px";

  document.getElementById("editImgForm").reset();

  closeModal();
}

let imgClickHandler = function (event) {
  event.preventDefault();
  openModal(this);
};

export function addImgsEditor() {
  createModal();

  document.querySelectorAll("img").forEach((img) => {
    // Adicionar evento somente se a imagem não estiver dentro de um elemento <a>
    if (!img.closest("a") && !img.classList.contains("non-editable")) {
      img.addEventListener("click", imgClickHandler);
    }
  });
}

export function removeImgsEditorEvents() {
  document.querySelectorAll("img").forEach((img) => {
    img.removeEventListener("click", imgClickHandler);
  });
}
