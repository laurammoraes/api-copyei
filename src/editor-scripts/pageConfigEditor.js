function addConfigMenuSyle() {
  var style = document.createElement("style");
  style.innerHTML = `
        .editor-configs-menu {
            position: fixed;
            top: 20px; 
            left: 20px;
            width: 250px;
            z-index: 999999999999 !important;
        }

        .editor-config-header {
            padding: 10px;
            border-bottom: 1px solid #ddd;
        }

        .editor-config-header h3 {
            margin: 0;
            font-size: 18px;
            text-align: center;
        }

        .editor-config-body {
            padding: 10px;
        }

        .editor-config-item {
            margin-bottom: 10px;
        }

        .editor-config-item button {
            width: 100%;
            padding: 10px;
            background-color: #0152aa;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 16px;
            transition: background-color 0.3s ease;
        }

        .editor-config-item button:hover {
            background-color: #0068d7;
        }
    `;
  document.head.appendChild(style);
}

function createConfigMenuElement() {
  const configMenu = document.createElement("div");
  configMenu.className = "editor-configs-menu";
  configMenu.classList.add("non-editable");
  configMenu.setAttribute("data-editor-element", "");

  configMenu.innerHTML = `
        <div class="editor-config-body" class="non-editable">
           
        </div>
    `;

  document.body.appendChild(configMenu);
  addConfigMenuSyle();
}

export function addConfigItem(label, action) {
  const configItem = document.createElement("div");
  configItem.className = "editor-config-item";
  configItem.classList.add("non-editable");
  configItem.setAttribute("data-editor-element", "");

  configItem.innerHTML = `
        <button type="button" class="non-editable" >${label}</button>
    `;

  configItem.querySelector("button").addEventListener("click", action);

  document.querySelector(".editor-config-body").appendChild(configItem);
}

export function addConfigMenuEditor() {
  createConfigMenuElement();
}

export function removeConfigMenuEditor() {
  const configMenu = document.querySelector(".editor-configs-menu");
  if (configMenu) {
    configMenu.remove();
  }
}
