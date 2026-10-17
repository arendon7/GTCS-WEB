(() => {
  const formSelector = "form[data-pmirs-progress-form]";
  const busyForms = new WeakSet();
  const lockedControls = new WeakMap();
  const timeoutMs = 45000;
  const healthTimeoutMs = 5000;

  async function redHealthAvailable() {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), healthTimeoutMs);
    try {
      const response = await fetch("/api/health", {
        method: "GET",
        credentials: "same-origin",
        cache: "no-store",
        headers: { Accept: "application/json" },
        signal: controller.signal,
      });
      const health = response.ok ? await response.json() : null;
      return response.ok && health?.status === "ok" && health?.application === "GREENATICS RED";
    } catch (_error) {
      return false;
    } finally {
      window.clearTimeout(timeout);
    }
  }

  function statusParts(form) {
    const status = form.querySelector("[data-pmirs-submit-status]");
    return {
      status,
      message: status?.querySelector("[data-pmirs-status-message]"),
      actions: status?.querySelector("[data-pmirs-status-actions]"),
    };
  }

  function setStatus(form, text, state = "info", { focus = false, actions = [] } = {}) {
    const parts = statusParts(form);
    if (!parts.status || !parts.message || !parts.actions) return;
    parts.message.textContent = text;
    parts.status.dataset.state = state;
    parts.status.hidden = !text;
    parts.status.setAttribute("role", state === "error" ? "alert" : "status");
    parts.status.setAttribute("aria-live", state === "error" ? "assertive" : "polite");
    parts.actions.replaceChildren(...actions);
    if (focus && text) parts.status.focus();
  }

  function setBusy(form, busy) {
    if (busy) {
      const controls = [...form.querySelectorAll('input:not([type="hidden"]), select, textarea, button[type="button"]')];
      lockedControls.set(form, controls.map((control) => ({ control, wasDisabled: control.disabled })));
      for (const { control } of lockedControls.get(form)) control.disabled = true;
    } else {
      for (const { control, wasDisabled } of lockedControls.get(form) || []) control.disabled = wasDisabled;
      lockedControls.delete(form);
    }
    for (const button of form.querySelectorAll('button[type="submit"]')) {
      if (busy) {
        button.dataset.previousLabel = button.textContent;
        button.textContent = "Guardando avance…";
      } else {
        if (button.dataset.previousLabel) button.textContent = button.dataset.previousLabel;
        delete button.dataset.previousLabel;
      }
      button.disabled = busy;
    }
    if (busy) form.dataset.submitting = "true";
    else delete form.dataset.submitting;
  }

  function isLoginUrl(url) {
    return url.pathname === "/login" || url.pathname.startsWith("/login/");
  }

  async function responseDetail(response) {
    const contentType = response.headers?.get("Content-Type") || "";
    if (contentType.includes("application/json")) {
      try {
        const body = await response.json();
        if (typeof body.detail === "string" && body.detail.trim()) return body.detail.trim().slice(0, 500);
      } catch (_error) {
        // The status-specific guidance below is safer than displaying malformed data.
      }
    }
    return "";
  }

  function sessionRecovery(form, loginUrl) {
    const loginLink = document.createElement("a");
    loginLink.className = "button secondary";
    loginLink.href = loginUrl;
    loginLink.target = "_blank";
    loginLink.rel = "noopener";
    loginLink.textContent = "Abrir ingreso en otra pestaña";

    const recoverButton = document.createElement("button");
    recoverButton.type = "button";
    recoverButton.className = "button secondary";
    recoverButton.textContent = "Ya inicié sesión; recuperar formulario";
    recoverButton.addEventListener("click", async () => {
      recoverButton.disabled = true;
      setStatus(form, "Comprobando la sesión y renovando la seguridad del formulario…", "info");
      try {
        const response = await fetch("/api/me", {
          method: "GET",
          credentials: "same-origin",
          cache: "no-store",
          headers: { Accept: "application/json" },
        });
        const finalUrl = new URL(response.url, window.location.href);
        const body = response.ok && !isLoginUrl(finalUrl) ? await response.json() : null;
        const csrf = typeof body?.csrf_token === "string" ? body.csrf_token : "";
        const tokenField = form.querySelector('input[name="csrf"]');
        if (!csrf || !tokenField) {
          recoverButton.disabled = false;
          setStatus(
            form,
            "La sesión aún no está disponible. Inicia sesión en la otra pestaña y vuelve a recuperar este formulario.",
            "error",
            { focus: true, actions: [loginLink, recoverButton] },
          );
          return;
        }
        tokenField.value = csrf;
        setStatus(form, "Sesión recuperada. Tus datos siguen en esta pantalla; vuelve a enviar el avance.", "info", { focus: true });
        form.querySelector('button[type="submit"]')?.focus();
      } catch (_error) {
        recoverButton.disabled = false;
        setStatus(
          form,
          "No se pudo renovar la seguridad. Conserva esta pantalla, verifica tu ingreso e inténtalo de nuevo.",
          "error",
          { focus: true, actions: [loginLink, recoverButton] },
        );
      }
    });

    setStatus(
      form,
      "La sesión parece haber vencido. Tus datos permanecen en esta pantalla. Inicia sesión en otra pestaña y luego recupera el formulario.",
      "error",
      { focus: true, actions: [loginLink, recoverButton] },
    );
  }

  document.addEventListener("submit", async (event) => {
    const form = event.target.closest?.(formSelector);
    if (!form || busyForms.has(form)) return;
    event.preventDefault();

    if (navigator.onLine === false && !(await redHealthAvailable())) {
      setStatus(
        form,
        "RED no respondió a la comprobación de conexión. No se envió el avance. Conserva esta pantalla y vuelve a intentar con la misma clave cuando RED responda.",
        "error",
        { focus: true },
      );
      return;
    }

    const data = new FormData(form);
    const submitter = event.submitter;
    if (submitter?.name) data.append(submitter.name, submitter.value);
    const actionUrl = form.getAttribute("action") || window.location.href;
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), timeoutMs);
    busyForms.add(form);
    setBusy(form, true);
    setStatus(form, "Enviando el avance. Mantén esta pantalla hasta recibir confirmación.", "info");

    try {
      const response = await fetch(actionUrl, {
        method: "POST",
        body: data,
        credentials: "same-origin",
        headers: { Accept: "text/html, application/json" },
        signal: controller.signal,
      });
      const finalUrl = new URL(response.url, window.location.href);
      if (isLoginUrl(finalUrl)) {
        sessionRecovery(form, finalUrl.href);
        return;
      }
      if (response.ok && (response.redirected || finalUrl.href !== new URL(actionUrl, window.location.href).href)) {
        form.dataset.saved = "true";
        const unsavedNotice = form.querySelector("[data-unsaved-notice]");
        if (unsavedNotice) unsavedNotice.hidden = true;
        window.location.assign(finalUrl.href);
        return;
      }
      if (response.ok) {
        setStatus(form, "RED confirmó la respuesta, pero no entregó la página de destino. Actualiza el expediente para verificar el avance.", "info", { focus: true });
        return;
      }
      if (response.status === 401) {
        sessionRecovery(form, new URL("/login", window.location.href).href);
        return;
      }
      const detail = await responseDetail(response);
      if (response.status === 422) {
        setStatus(form, detail || "RED no aceptó el avance. Revisa los campos, corrige el dato y vuelve a enviar; tus valores siguen en esta pantalla.", "error", { focus: true });
      } else if (response.status === 403) {
        setStatus(form, detail || "Tu perfil no tiene permiso para registrar este avance. Consulta con la persona administradora del expediente.", "error", { focus: true });
      } else if ([408, 425, 429].includes(response.status) || response.status >= 500) {
        setStatus(
          form,
          `RED respondió con estado ${response.status}; pudo guardar antes de fallar. Conserva los datos y reintenta aquí con la misma clave.`,
          "error",
          { focus: true },
        );
      } else {
        setStatus(form, detail || `RED respondió con estado ${response.status}. Actualiza el expediente antes de cambiar o volver a enviar este avance.`, "error", { focus: true });
      }
    } catch (_error) {
      setStatus(
        form,
        "No se pudo confirmar la respuesta de RED; el avance pudo haberse guardado. Conserva esta pantalla y reintenta aquí con la misma clave para evitar duplicados.",
        "error",
        { focus: true },
      );
    } finally {
      window.clearTimeout(timeout);
      setBusy(form, false);
      busyForms.delete(form);
    }
  });
})();
