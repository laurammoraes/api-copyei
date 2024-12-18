import { deleteEditor } from "./deleteEditor.js";

function addEditorSaveButtonsStyles() {
  const style = document.createElement("style");
  style.setAttribute("data-editor-element", "");

  style.innerHTML = `
        .editor-save-buttons {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            width: 250px;
            height: 55px;
            background-color: aquamarine;
            z-index: 99999999999 !important;
            border-radius: 10px;
            box-shadow: -1px 6px 11px -7px rgba(0,0,0,1);
        }
    
        .editor-save-buttons button {
            display: flex;
            align-items: center;
            justify-content: center;
            background: none;
            border: none;
            cursor: pointer;
            transition: all 0.3s ease;
            width: 100%;
        }
    
        .editor-save-buttons button h3 {
            color: black;
            text-align: center;
            font-size: 19px;
            font-weight: bolder;
            transition: font-size 0.3s ease;
            padding: 0 5px; 
        }
    
        .editor-save-buttons button img {
            width: 40px;
            height: 40px;
            transition: width 0.3s ease, height 0.3s ease; 
        }
    
         .editor-save-buttons:hover {
            width: 270px;
            height: 60px;
            background-color: rgb(96, 253, 201);
        }
        .editor-save-buttons button:active, 
        .editor-save-buttons button:focus, 
        .editor-save-buttons button:hover {
            background-color: rgb(96, 253, 201);
            border-radius: 10px;
        }
        
        .editor-save-buttons button:hover h3 {
            font-size: 21px; 
            font-weight: bolder;
        }

        .editor-save-buttons button:hover img {
            width: 50px; 
            height: 50px;
        }
    
    `;

  document.head.appendChild(style);
}

export function addEditorSaveButtons() {
  const editorSaveButtons = document.createElement("div");
  editorSaveButtons.className = "editor-save-buttons";
  editorSaveButtons.classList.add("non-editable");

  editorSaveButtons.setAttribute("data-editor-element", "");

  editorSaveButtons.innerHTML = `
        <button class="editor-save-button" type="button" onclick="saveChanges()">
            <img src="https://img.icons8.com/?size=100&id=3ZrilLwblTLa&format=png&color=000000" class="non-editable" alt="Salvar">
            <h3 class="non-editable"> Salvar Alterações</h3>
        </button>
    `;
  document.body.appendChild(editorSaveButtons);
  addEditorSaveButtonsStyles();
}

export function saveChanges() {
  const currentHref = window.location.href.split("#")[0];

  deleteEditor();

  const updatedHTML = document.documentElement.outerHTML;

  const pageUrl = currentHref.endsWith("/") ? currentHref : currentHref + "/";

  fetch(pageUrl + "save", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ htmlContent: updatedHTML }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        alert("Alterações salvas com sucesso!");

        window.location.href = currentHref.replace("editor", "site");
      } else {
        alert("Erro ao salvar as alterações.");
      }
    })
    .catch((error) => console.error("Erro:", error));
}
