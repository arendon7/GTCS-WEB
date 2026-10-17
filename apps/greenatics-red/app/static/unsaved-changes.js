(() => {
  const forms = [];
  const recordForm = document.querySelector("form.record-form");
  if (recordForm) forms.push({ form: recordForm, notice: document.querySelector("[data-unsaved-notice]") });
  for (const form of document.querySelectorAll("form[data-pmirs-progress-form]")) {
    forms.push({ form, notice: form.querySelector("[data-unsaved-notice]") });
  }

  for (const { form, notice } of forms) {
    let dirty = false;

    function markDirty() {
      if (dirty) return;
      dirty = true;
      form.dataset.dirty = "true";
      if (notice) notice.hidden = false;
    }

    form.addEventListener("input", markDirty);
    form.addEventListener("change", markDirty);
    form.addEventListener("submit", markDirty);
    form.addEventListener("click", (event) => {
      if (event.target.closest?.("[data-add-row], [data-remove-row], [data-gps-capture]")) {
        markDirty();
      }
    });
    window.addEventListener("beforeunload", (event) => {
      if (!dirty || form.dataset.saved === "true") return;
      event.preventDefault();
      event.returnValue = "";
    });
  }
})();
