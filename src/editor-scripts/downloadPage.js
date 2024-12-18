import { addConfigItem } from "./pageConfigEditor.js";

export function addDownloadUniquePageButtons() {
  // Captura a URL da página atual
  const currentUrl = window.location.href;
  const nameUrl = document.title;

  addConfigItem("Baixar Página", () =>
    downloadPage(currentUrl, `${nameUrl}.html`)
  );
}

export function downloadPage(url, filename) {
  fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.text();
    })
    .then((html) => {
      const blob = new Blob([html], { type: "text/html" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = filename;

      // Adiciona o link ao DOM e aciona o download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    })
    .catch((error) => console.error("Erro ao baixar o HTML:", error));
}
