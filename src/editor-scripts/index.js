import { addMediumEditor } from "./mediumEditor.js";
import {
  addLinksEditor,
  deleteLink,
  editLink,
  accessLink,
} from "./linksEditor.js";
import { addImgsEditor, deleteImg, editImg } from "./imgsEditor.js";
import { addEditorSaveButtons, saveChanges } from "./buttonsEditor.js";
import {
  addBackgroundEditor,
  editBackground,
  deleteElementBackground,
  deleteElementBackgroundImage,
} from "./backgroundEditor.js";
import { deleteEditor } from "./deleteEditor.js";
import { addModalStyles, closeModal } from "./modal.js";
import {
  addWhatsAppButtonEditor,
  openWhatsIconModal,
  editWhatsIcon,
  deleteWhats,
} from "./whatsAppIconEditor.js";
import {
  addGmtEditor,
  openGmtModal,
  editGmt,
  deleteGmtScripts,
} from "./gmtEditor.js";
import {
  addPixelEditor,
  openPixelModal,
  editPixel,
  deletePixelScripts,
} from "./facebookPixelEditor.js";
import {
  addSEOButtonEditor,
  editSEOTags,
  openSEOModal,
} from "./seoTagsEditor.js";
import { addConfigMenuEditor } from "./pageConfigEditor.js";
import { addVideoEditor, editVideo, deleteVideo } from "./videoEditor.js";
import { addDownloadUniquePageButtons, downloadPage } from "./downloadPage.js";

// Expõe as funções globalmente no objeto `window`

// funções modal
window.closeModal = closeModal;

// funções links Editor
window.editLink = editLink;
window.deleteLink = deleteLink;
window.accessLink = accessLink;

//funções images Editor
window.addImgsEditor = addImgsEditor;
window.deleteImg = deleteImg;
window.editImg = editImg;

// funções Background Editor
window.addBackgroundEditor = addBackgroundEditor;
window.editBackground = editBackground;
window.deleteElementBackground = deleteElementBackground;
window.deleteElementBackgroundImage = deleteElementBackgroundImage;

// funções Butons Editor
window.saveChanges = saveChanges;
window.deleteEditor = deleteEditor;

window.downloadPage = downloadPage;

//funções WhatsApp Icon Editor
window.openWhatsIconModal = openWhatsIconModal;
window.editWhatsIcon = editWhatsIcon;
window.deleteWhats = deleteWhats;

//funções GMT Editor
window.openGmtModal = openGmtModal;
window.editGmt = editGmt;
window.deleteGmtScripts = deleteGmtScripts;

//funções Facebook Pixel Editor
window.openPixelModal = openPixelModal;
window.editPixel = editPixel;
window.deletePixelScripts = deletePixelScripts;

//funções SEO Editor
window.openSEOModal = openSEOModal;
window.editSEOTags = editSEOTags;

//funções video Editor
window.editVideo = editVideo;
window.deleteVideo = deleteVideo;

export function initialize() {
  window.onload = function () {
    addBackgroundEditor();
    addEditorSaveButtons();
    addVideoEditor();
    addDownloadUniquePageButtons();
  };
}

export function makePageEditable() {
  addModalStyles();

  addImgsEditor();
  addLinksEditor();
  addMediumEditor();

  addConfigMenuEditor();

  addWhatsAppButtonEditor();
  addGmtEditor();
  addPixelEditor();
  addSEOButtonEditor();

  initialize();
}

makePageEditable();
