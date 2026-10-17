(() => {
  const rowCountAnnouncement = (verb, count, singular, plural) => {
    const noun = count === 1 ? singular : plural;
    return `Fila ${verb}. ${count} ${noun} en total.`;
  };

  document.querySelectorAll("[data-repeatable-table]").forEach((table) => {
    const noun = table.dataset.rowNoun || "elemento";
    const plural = table.dataset.rowNounPlural || `${noun}s`;
    const maxRows = Number.parseInt(table.dataset.maxRows, 10) || 50;
    const rows = table.querySelector("[data-rows]");
    const template = table.querySelector("[data-row-template]");
    const addButton = table.querySelector("[data-add-row]");
    const announcement = table.querySelector("[data-row-announcement]");
    if (!rows || !template || !addButton) return;

    const updateRows = () => {
      const items = [...rows.querySelectorAll(".repeatable-row")];
      items.forEach((row, index) => {
        const number = index + 1;
        const legend = row.querySelector("legend");
        const remove = row.querySelector("[data-remove-row]");
        if (legend) legend.textContent = `${noun.charAt(0).toUpperCase()}${noun.slice(1)} ${number}`;
        row.querySelectorAll("[data-row-field]").forEach((input) => {
          input.setAttribute("aria-label", `${input.dataset.rowLabel || input.dataset.rowField} ${number}`);
        });
        if (remove) {
          remove.hidden = false;
          remove.setAttribute("aria-label", `${remove.dataset.removeLabel || `Quitar ${noun}`} ${number}`);
        }
      });
      addButton.disabled = items.length >= maxRows;
      addButton.textContent = items.length >= maxRows ? `Límite de ${maxRows} ${plural}` : `Agregar ${noun}`;
    };

    addButton.hidden = false;
    updateRows();

    addButton.addEventListener("click", () => {
      if (rows.querySelectorAll(".repeatable-row").length >= maxRows) return;
      const fragment = template.content.cloneNode(true);
      const row = fragment.querySelector(".repeatable-row");
      if (!row) return;
      rows.append(fragment);
      updateRows();
      row.querySelector("[data-row-field]")?.focus();
      if (announcement) announcement.textContent = rowCountAnnouncement("agregada", rows.querySelectorAll(".repeatable-row").length, noun, plural);
    });

    rows.addEventListener("click", (event) => {
      const remove = event.target.closest("[data-remove-row]");
      if (!remove) return;
      const row = remove.closest(".repeatable-row");
      if (!row) return;
      const next = row.nextElementSibling || row.previousElementSibling;
      row.remove();
      updateRows();
      const focusTarget = next?.querySelector("input,select,textarea") || addButton;
      focusTarget.focus();
      if (announcement) announcement.textContent = rowCountAnnouncement("quitada", rows.querySelectorAll(".repeatable-row").length, noun, plural);
    });
  });
})();
