import { rgbToHex } from "./linksEditor.js";

let editor;

// Função para adicionar os estilos do MediumEditor
function addMediumEditorStyles() {
  if (
    !document.querySelector(
      'link[href="https://cdn.jsdelivr.net/npm/medium-editor@latest/dist/css/medium-editor.min.css"]'
    )
  ) {
    const mediumEditorStyles = document.createElement("link");
    mediumEditorStyles.rel = "stylesheet";
    mediumEditorStyles.href =
      "https://cdn.jsdelivr.net/npm/medium-editor@latest/dist/css/medium-editor.min.css";
    mediumEditorStyles.setAttribute("data-editor-element", "");
    document.head.insertBefore(mediumEditorStyles, document.head.firstChild);
  }

  if (
    !document.querySelector(
      'link[href="https://cdn.jsdelivr.net/npm/medium-editor@latest/dist/css/themes/default.min.css"]'
    )
  ) {
    const mediumEditorThemeStyles = document.createElement("link");
    mediumEditorThemeStyles.rel = "stylesheet";
    mediumEditorThemeStyles.href =
      "https://cdn.jsdelivr.net/npm/medium-editor@latest/dist/css/themes/default.min.css";
    mediumEditorThemeStyles.setAttribute("data-editor-element", "");
    document.head.insertBefore(
      mediumEditorThemeStyles,
      document.head.firstChild
    );
  }
}

// Função para adicionar os scripts do MediumEditor
function addMediumEditorScripts(callback) {
  if (
    !document.querySelector(
      'script[src="//cdn.jsdelivr.net/npm/medium-editor@latest/dist/js/medium-editor.min.js"]'
    )
  ) {
    const mediumEditorScripts = document.createElement("script");
    mediumEditorScripts.src =
      "//cdn.jsdelivr.net/npm/medium-editor@latest/dist/js/medium-editor.min.js";
    mediumEditorScripts.setAttribute("data-editor-element", "");

    // Adiciona um listener para garantir que o script seja carregado antes de continuar
    mediumEditorScripts.onload = () => {
      if (callback) {
        callback();
      }
    };

    document.body.appendChild(mediumEditorScripts);
  } else if (callback) {
    callback();
  }
}

// Função para obter os elementos editáveis da página
function getEditableElements() {
  const editableElements = [];

  document
    .querySelectorAll(
      "h1, h2, h3, h4, h5, h6, p, a, span, li, div, section, aside, b, i, em, strong, u, small, mark, del, ins, sub, sup, pre, code, blockquote, q, cite, abbr, address, dt, dd, nav, header, footer, article, td"
    )
    .forEach((element) => {
      const isInsideLink = element.closest("a") !== null;
      const hasLinkChildren = element.querySelector("a") !== null;
      const isTextualElement = [
        "H1",
        "H2",
        "H3",
        "H4",
        "H5",
        "H6",
        "P",
        "SPAN",
        "LI",
        "B",
        "I",
        "EM",
        "STRONG",
        "U",
        "SMALL",
        "MARK",
        "DEL",
        "INS",
        "SUB",
        "SUP",
        "PRE",
        "CODE",
        "BLOCKQUOTE",
        "Q",
        "CITE",
        "ABBR",
        "ADDRESS",
        "DT",
        "DD",
        "TD",
      ].includes(element.tagName);

      if (
        !element.classList.contains("non-editable") &&
        !isInsideLink &&
        !hasLinkChildren &&
        isTextualElement &&
        element.textContent.trim().length > 0
      ) {
        editableElements.push(element);
      } else if (
        !element.classList.contains("non-editable") &&
        !isInsideLink &&
        !isTextualElement &&
        element.children.length === 0 &&
        element.textContent.trim().length > 0
      ) {
        editableElements.push(element);
      }
    });

  return editableElements;
}

// Função para adicionar o MediumEditor aos elementos da página
export function addMediumEditor() {
  addMediumEditorStyles();

  function colorPickerFormSyle() {
    const colorPickerForm = document.createElement("style");
    colorPickerForm.setAttribute("data-editor-element", "");
    colorPickerForm.innerHTML = `
             .editor-color-picker-modal {
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 15px;
            }

            .editor-color-picker-modal label {
                margin-right: 10px;
                color: rgb(255, 255, 255);
                font-size: 1.1rem;
                font-weight: bold;
            }

            .editor-color-picker-modal input[type="color"] {
                width: 45px;
                height: 35px;
                background: none;
                border: none;
                outline: none;
                cursor: pointer;
            }

            .editor-color-picker-modal div {
                display: flex;
                align-items: center;
                justify-content: center;
                margin-left: 10px;
            }

            .editor-color-picker-modal button {
                width: 40px;
                height: 40px;
                border: none;
                outline: none;
                font-size: 1.4rem;
                line-height: 1.4rem;
                font-weight: bold;
                cursor: pointer;
                background: none;
                transition: color 0.3s ease, transform 0.3s ease;
                color: rgb(255, 255, 255);
                text-align: center;
            }

            .editor-color-picker-modal button:hover {
                transform: scale(1.3); 
                color: green;
            }
        `;

    document.head.appendChild(colorPickerForm);
  }

  // adiciona o input de edição de cor do texto
  function createColorPickerInput() {
    const toolbar = document.getElementById("medium-editor-toolbar-1");

    const colorPickerForm = document.createElement("div");
    colorPickerForm.classList.add("editor-color-picker-modal");

    colorPickerForm.innerHTML = `
            <label for="text-color">Text Color: </label>
            <input type="color" id="editor-input-text-color" placeholder="Type a link" data-placeholder="Text Color">
            <button id="editor-button-text-color" title="Confirm">✓</button>
        `;

    colorPickerFormSyle();

    toolbar.appendChild(colorPickerForm);

    const colorPickerInputButton = document.getElementById(
      "editor-button-text-color"
    );

    colorPickerInputButton.addEventListener("click", () => {
      const color = document.getElementById("editor-input-text-color").value;

      applyTextColor(color);

      editor.getExtensionByName("toolbar").hideToolbar();
    });
  }

  function applyTextColor(color) {
    const selectedText = window.getSelection();

    if (selectedText.rangeCount) {
      const range = selectedText.getRangeAt(0);
      const selectedString = range.toString();
      const parentElement = selectedText.anchorNode.parentElement;

      if (parentElement.innerText.trim() === selectedString.trim()) {
        parentElement.innerHTML = selectedString;
        parentElement.style.color = color;
        return;
      }

      const span = document.createElement("span");
      span.style.color = color;
      span.textContent = selectedString;

      range.deleteContents();
      range.insertNode(span);
    }
  }

  addMediumEditorScripts(() => {
    const editableElements = getEditableElements();

    editor = new MediumEditor(editableElements, {
      toolbar: {
        allowMultiParagraphSelection: true,
        buttons: [
          "bold",
          "italic",
          "underline",
          "anchor",
          "h1",
          "h2",
          "quote",
          "orderedlist",
          "unorderedlist",
          "justifyLeft",
          "justifyCenter",
          "justifyRight",
          "strikethrough",
          "removeFormat",
        ],
        diffLeft: 0,
        diffTop: -10,
        firstButtonClass: "medium-editor-button-first",
        lastButtonClass: "medium-editor-button-last",
        relativeContainer: null,
        standardizeSelectionStart: false,
        static: false,
        align: "center",
        sticky: false,
        updateOnEmptySelection: false,
      },
      placeholder: {
        text: "",
      },
    });

    createColorPickerInput();

    // obtem a cor do texto selecionado
    editor.subscribe("showToolbar", function () {
      const selectedText = window.getSelection();

      if (selectedText.rangeCount > 0) {
        const range = selectedText.getRangeAt(0);
        const parentElement = range.commonAncestorContainer.parentElement;

        const color =
          parentElement.style.color ||
          window.getComputedStyle(parentElement).color;

        if (color) {
          const colorPickerInput = document.getElementById(
            "editor-input-text-color"
          );
          colorPickerInput.value = rgbToHex(color);
        }
      }
    });
  });
}

// Função para remover o MediumEditor e os elementos criados por ele
export function removeMediumEditor() {
  if (typeof editor !== "undefined" && editor) {
    editor.destroy();
  }

  document.querySelectorAll('[contenteditable="true"]').forEach((element) => {
    element.removeAttribute("contenteditable");
    element.classList.remove("medium-editor-element");
  });

  const toolbarElements = document.querySelectorAll(
    ".medium-editor-toolbar, .medium-editor-anchor-preview, .medium-editor-placeholder"
  );
  toolbarElements.forEach((toolbar) => {
    toolbar.remove();
  });

  const mediumEditorStyles = document.querySelectorAll("style, link");
  mediumEditorStyles.forEach((style) => {
    if (
      style.innerHTML.includes("medium-editor") ||
      (style.href && style.href.includes("medium-editor"))
    ) {
      style.remove();
    }
  });

  editor = null;
}
