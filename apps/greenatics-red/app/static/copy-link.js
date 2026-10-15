(() => {
  for (const button of document.querySelectorAll("[data-copy-link-target]")) {
    button.addEventListener("click", async () => {
      const input = document.getElementById(button.dataset.copyLinkTarget);
      const status = document.getElementById(button.dataset.copyStatusTarget);
      if (!input || !status || !input.value) return;

      try {
        if (!navigator.clipboard?.writeText) throw new Error("clipboard-unavailable");
        await navigator.clipboard.writeText(input.value);
        status.textContent = "Enlace copiado. Entrégalo solo a la persona destinataria.";
      } catch (_error) {
        input.focus();
        input.select();
        status.textContent = "No se pudo copiar automáticamente. El enlace quedó seleccionado; cópialo manualmente y entrégalo solo a la persona destinataria.";
      }
    });
  }
})();
