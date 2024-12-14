import { removeMediumEditor } from "./mediumEditor.js";
import { removeLinksEditorEvents } from "./linksEditor.js";
import { removeBackgroundEditor } from "./backgroundEditor.js";
import { removeWhatsIconClickHandler } from "./whatsAppIconEditor.js";
import { removeConfigMenuEditor } from "./pageConfigEditor.js";

function deleteEditorElements() {
  const editorElements = document.querySelectorAll("[data-editor-element]");

  editorElements.forEach((element) => element.remove());
}

export function deleteEditor() {
  removeBackgroundEditor();
  removeMediumEditor();
  removeLinksEditorEvents();
  deleteEditorElements();
  removeWhatsIconClickHandler();
  removeConfigMenuEditor();
}
