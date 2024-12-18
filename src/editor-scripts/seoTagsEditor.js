import { closeModal } from "./modal.js";
import { addConfigItem } from "./pageConfigEditor.js";

function createSEOModal() {
  // Cria o modal para edição das tags SEO
  const modal = document.createElement("div");
  modal.className = "edit-modal";
  modal.classList.add("non-editable");
  modal.id = "seoModal";
  modal.setAttribute("data-editor-element", "");

  // Define o conteúdo HTML do modal
  modal.innerHTML = `
        <form id="SEOForm" onsubmit="editSEOTags(event)" class="non-editable">
            <div class="form-header">
                <h3 class="non-editable">Editar Tags SEO</h3>
                <div>
                    <button type="button" onclick="closeModal()">X</button>
                </div>
            </div>
            <div class="form-body">
                <div>
                    <label for="seo-title">Título da Página</label>
                    <input type="text" id="seo-title" placeholder="Título da página">
                </div>
                <div>
                    <label for="seo-description">Descrição</label>
                    <input type="text" id="seo-description" placeholder="Descrição da página">
                </div>
                <div>
                    <label for="seo-keywords">Palavras-chave</label>
                    <input type="text" id="seo-keywords" placeholder="Ex: keyword1, keyword2">
                </div>
                <div>
                    <label for="seo-robots">Robots</label>
                    <input type="text" id="seo-robots" placeholder="index, follow">
                </div>

                <div class="background-img-inputs" data-favicon-inputs>
                    <p class="non-editable">Alterar Imagem Favicon</p>
                    <div>
                        <label for="favicon-link-src">Alterar Imagem via link</label>
                        <input type="url" name="favicon-link-src" id="favicon-link-src" value="">
                    </div>
                    <span class="non-editable"> ou </span>
                    <div>
                        <label for="favicon-upload">Fazer upload da imagem</label>
                        <input type="file" name="favicon-upload" id="favicon-upload" accept="image/*">
                    </div>
                </div>
                
            </div>
            <div class="form-footer">
                <button type="submit">Salvar</button>
                <button type="button" onclick="closeModal()">Cancelar</button>
            </div>
        </form>
    `;

  modal.style.display = "none";
  document.body.appendChild(modal);
}

export function openSEOModal() {
  // Preenche os campos do modal com os valores atuais das tags SEO

  document.getElementById("seo-title").value = document.title;

  const metaDescription = document.querySelector('meta[name="description"]');
  const metaKeywords = document.querySelector('meta[name="keywords"]');
  const metaRobots = document.querySelector('meta[name="robots"]');

  const faviconElement = document.querySelector('link[rel="icon"]');

  document.getElementById("favicon-link-src").value = faviconElement
    ? faviconElement.href
    : "";

  document.getElementById("seo-description").value = metaDescription
    ? metaDescription.getAttribute("content")
    : "";
  document.getElementById("seo-keywords").value = metaKeywords
    ? metaKeywords.getAttribute("content")
    : "";
  document.getElementById("seo-robots").value = metaRobots
    ? metaRobots.getAttribute("content")
    : "";

  document.getElementById("seoModal").style.display = "block";
}

function uploadImage(file) {
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
        document.querySelectorAll('link[rel="icon"]').forEach((favicon) => {
          favicon.href = `.${imageUrl}`;
        });
      } else {
        window.alert("Erro ao fazer upload da imagem");
      }
    })
    .catch((error) => {
      window.alert("Erro ao fazer upload da imagem");
      console.error("Erro ao fazer upload da imagem:", error);
    });
}

export function editSEOTags(event) {
  event.preventDefault();

  // Atualiza o título da página
  const newTitle = document.getElementById("seo-title").value;
  document.title = newTitle;

  // Atualiza a meta description
  let metaDescription = document.querySelector('meta[name="description"]');
  if (!metaDescription) {
    metaDescription = document.createElement("meta");
    metaDescription.setAttribute("name", "description");
    document.head.appendChild(metaDescription);
  }
  metaDescription.setAttribute(
    "content",
    document.getElementById("seo-description").value
  );

  // Atualiza as meta keywords
  let metaKeywords = document.querySelector('meta[name="keywords"]');
  if (!metaKeywords) {
    metaKeywords = document.createElement("meta");
    metaKeywords.setAttribute("name", "keywords");
    document.head.appendChild(metaKeywords);
  }
  metaKeywords.setAttribute(
    "content",
    document.getElementById("seo-keywords").value
  );

  // Atualiza a meta robots
  let metaRobots = document.querySelector('meta[name="robots"]');
  if (!metaRobots) {
    metaRobots = document.createElement("meta");
    metaRobots.setAttribute("name", "robots");
    document.head.appendChild(metaRobots);
  }
  metaRobots.setAttribute(
    "content",
    document.getElementById("seo-robots").value
  );

  // Atualiza o favicon
  const faviconElement = document.querySelector('link[rel="icon"]');
  if (!faviconElement) {
    const faviconLink = document.createElement("link");
    faviconLink.setAttribute("rel", "icon");
    document.head.appendChild(faviconLink);
  }

  const faviconInput = document.getElementById("favicon-upload");
  if (faviconInput.files.length > 0) {
    uploadImage(faviconInput.files[0]);
  } else {
    document.querySelectorAll('link[rel="icon"]').forEach((favicon) => {
      favicon.href = document.getElementById("favicon-link-src").value;
    });
  }

  // Limpar o formulário
  document.getElementById("SEOForm").reset();

  closeModal();
  alert("Tags SEO atualizadas com sucesso!");
}

export function addSEOButtonEditor() {
  createSEOModal();

  addConfigItem("Editar Tags SEO", openSEOModal);
}
