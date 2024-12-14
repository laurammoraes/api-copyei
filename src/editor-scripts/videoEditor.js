import { closeModal } from "./modal.js";

function createModal() {
  const modal = document.createElement("div");

  modal.className = "edit-modal";
  modal.classList.add("non-editable");
  modal.id = "videoEditormodal";
  modal.setAttribute("data-editor-element", "");

  modal.innerHTML = `
        <form id="editVideoForm" onsubmit="editVideo(event)" class="non-editable">
            <div class="form-header">
                <h3 class="non-editable">Editar Video</h3>
                <div>
                    <button type="button" onclick="closeModal()">X</button>
                </div>
            </div>
            <div class="form-body">
                <div class="background-video-inputs" data-video-inputs>
                    <div>
                        <label for="video-link-src">Alterar url do video</label>
                        <input type="url" name="video-link-src" id="video-link-src" value="">
                    </div>
                </div>
            </div>
            <div class="form-footer">
                <button type="submit">Salvar</button>
                <button class="button-delete" type="button" onclick="deleteVideo()">Excluir</button>
                <button type="button" onclick="closeModal()">Cancelar</button>
            </div>
        </form>
    `;

  modal.style.display = "none";
  document.body.appendChild(modal);
}

let currentVideoElement = null;

function openModal(videoElement) {
  currentVideoElement = videoElement;
  document.getElementById("videoEditormodal").style.display = "block";
  document.getElementById("video-link-src").value = videoElement.src;
}

export function deleteVideo() {
  const isConfirmed = window.confirm(
    "Você tem certeza que deseja excluir este elemento?"
  );

  if (!isConfirmed) return;

  if (currentVideoElement) {
    const videoId = currentVideoElement.src.split("/").pop();

    document.querySelector(`[data-editor-button-id="${videoId}"]`).remove();
    currentVideoElement.remove();
    closeModal();
  }
}

export function editVideo(event) {
  event.preventDefault();

  const videoInputLink = document.getElementById("video-link-src").value.trim();
  const videoIdMatch = videoInputLink.match(
    /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^&\n]{11})/
  );

  if (videoIdMatch && videoIdMatch[1]) {
    const videoId = videoIdMatch[1];
    currentVideoElement.src = `https://www.youtube.com/embed/${videoId}`;
  } else {
    alert("URL inválida.");
  }

  document.getElementById("editVideoForm").reset();
  closeModal();
}

let videoClickHandler = function (event) {
  event.preventDefault();
  openModal(this);
};

function createEditVideoButton(videoElement) {
  // Criar um novo botão de edição para cada iframe
  const editButton = document.createElement("button");
  editButton.classList.add("edit-video-button");
  editButton.setAttribute("data-editor-element", "");
  editButton.innerText = "Editar url";
  editButton.style.border = "0.1rem solid black";
  editButton.style.borderRadius = "0.3rem";
  editButton.style.backgroundColor = "#0152aa";
  editButton.style.color = "white";
  editButton.style.position = "absolute";
  editButton.style.zIndex = "999999999";
  editButton.style.cursor = "pointer";
  editButton.style.bottom = "0";
  editButton.style.left = "0";
  editButton.style.padding = "0.7rem 2rem";
  editButton.style.margin = "0.5rem";
  editButton.style.fontSize = "1rem";
  editButton.style.fontWeight = "bold";

  const videoId = videoElement.src.split("/").pop();

  editButton.setAttribute("data-editor-button-id", videoId);

  editButton.addEventListener("click", (event) => {
    event.stopPropagation();
    openModal(videoElement);
  });

  const parent = videoElement.parentElement;
  parent.style.position = "relative";

  parent.insertBefore(editButton, videoElement);

  videoElement.addEventListener("click", videoClickHandler, true);
}

// Função para verificar se o iframe é do YouTube
function isYouTubeIframe(iframe) {
  return (
    iframe.tagName === "IFRAME" &&
    (iframe.src.includes("youtube.com") ||
      iframe.src.includes("youtu.be") ||
      iframe.src.includes("youtube-nocookie.com"))
  );
}

// Função para executar quando um novo iframe do YouTube for adicionado
function handleNewYouTubeIframe(iframe) {
  if (iframe.classList.contains("has-editor-button")) return;

  createEditVideoButton(iframe);
}

// Configurar o MutationObserver
const observer = new MutationObserver((mutationsList) => {
  mutationsList.forEach((mutation) => {
    mutation.addedNodes.forEach((node) => {
      // Verifica se o novo nó adicionado é um iframe do YouTube
      if (node.tagName === "IFRAME" && isYouTubeIframe(node)) {
        handleNewYouTubeIframe(node);
      }
    });
  });
});

export function addVideoEditor() {
  createModal();
  document.querySelectorAll("iframe").forEach((iframe) => {
    const isYouTubeVideo =
      iframe.src.includes("youtube.com") || iframe.src.includes("youtu.be");
    if (isYouTubeVideo) {
      createEditVideoButton(iframe);
    }
  });

  // Iniciar a observação no corpo da página para novos elementos adicionados
  observer.observe(document.body, { childList: true, subtree: true });
}
