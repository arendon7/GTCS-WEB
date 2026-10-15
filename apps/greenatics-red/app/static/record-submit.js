(() => {
  const formSelector = "form.record-form";
  const busyForms = new WeakSet();
  const lockedControls = new WeakMap();
  const baseRequestTimeoutMs = 90_000;
  const extraPerUploadMbMs = 15_000;
  const maximumRequestTimeoutMs = 15 * 60_000;

  function setStatus(message, state = "unknown") {
    const banner = document.querySelector("[data-network-status]");
    const target = banner?.querySelector("[data-network-message]");
    if (!banner || !target) return;
    banner.dataset.networkState = state;
    target.textContent = message;
  }

  function offerSessionRecovery(form, loginUrl, message) {
    setStatus(message, "auth-required");
    const actions = document.querySelector("[data-session-actions]");
    if (!actions) return;

    const loginLink = document.createElement("a");
    loginLink.className = "button secondary";
    loginLink.href = loginUrl;
    loginLink.target = "_blank";
    loginLink.rel = "noopener";
    loginLink.textContent = "Abrir ingreso";

    const refreshButton = document.createElement("button");
    refreshButton.type = "button";
    refreshButton.className = "button secondary";
    refreshButton.textContent = "Ya inicié sesión; recuperar formulario";
    function showRecoveryActions() {
      actions.hidden = false;
      actions.replaceChildren(loginLink, refreshButton);
    }

    refreshButton.addEventListener("click", async () => {
      refreshButton.disabled = true;
      setStatus("Comprobando la sesión y renovando la seguridad de este formulario…", "checking-session");
      try {
        const response = await fetch("/api/me", {
          method: "GET",
          credentials: "same-origin",
          headers: { Accept: "application/json" },
        });
        const finalUrl = new URL(response.url, window.location.href);
        const csrf = response.ok && !finalUrl.pathname.startsWith("/login/") && finalUrl.pathname !== "/login"
          ? (await response.json()).csrf_token
          : "";
        const tokenField = form.querySelector('input[name="csrf"]');
        if (!csrf || !tokenField) {
          setStatus("La sesión sigue cerrada. Inicia sesión en la otra pestaña y vuelve a intentar recuperar este formulario.", "auth-required");
          refreshButton.disabled = false;
          showRecoveryActions();
          refreshButton.focus?.();
          return;
        }

        tokenField.value = csrf;
        actions.replaceChildren();
        actions.hidden = true;
        setStatus("Sesión recuperada. Tus datos y archivos siguen en esta pantalla; revisa el formulario y vuelve a enviarlo.", "session-restored");
        form.querySelector('button[type="submit"]')?.focus?.();
      } catch (_error) {
        setStatus("No se pudo renovar la seguridad del formulario. Conserva esta pantalla, verifica tu ingreso y vuelve a intentarlo.", "error");
        refreshButton.disabled = false;
        showRecoveryActions();
        refreshButton.focus?.();
      }
    });
    showRecoveryActions();
    refreshButton.focus?.();
  }

  function copyControlValues(sourceForm, targetForm) {
    const sources = new Map();
    for (const control of sourceForm.elements) {
      if (!control.name) continue;
      const values = sources.get(control.name) || [];
      values.push(control);
      sources.set(control.name, values);
    }

    const seen = new Map();
    for (const target of targetForm.elements) {
      if (!target.name) continue;
      const index = seen.get(target.name) || 0;
      seen.set(target.name, index + 1);
      const source = sources.get(target.name)?.[index];
      if (!source || target.type === "file" || source.type === "file") continue;

      if (target.tagName === "SELECT") {
        target.replaceChildren(...[...source.options].map((option) => option.cloneNode(true)));
        for (let optionIndex = 0; optionIndex < target.options.length; optionIndex += 1) {
          target.options[optionIndex].selected = Boolean(source.options[optionIndex]?.selected);
        }
      } else if (target.type === "checkbox" || target.type === "radio") {
        target.checked = source.checked;
      } else {
        target.value = source.value;
      }
    }
  }

  function showServerErrors(html, form) {
    const parsed = new DOMParser().parseFromString(html, "text/html");
    const renderedForm = parsed.querySelector(formSelector);
    if (!renderedForm) return false;
    copyControlValues(renderedForm, form);

    const renderedAlert = parsed.querySelector('[role="alert"]');
    let currentAlert = document.querySelector('[role="alert"]');
    if (renderedAlert) {
      if (!currentAlert) {
        currentAlert = document.createElement("div");
        currentAlert.className = "notice error";
        currentAlert.setAttribute("role", "alert");
        form.before(currentAlert);
      }
      currentAlert.tabIndex = -1;
      const renderedErrorList = renderedAlert.querySelector?.("[data-validation-errors]");
      if (renderedErrorList && typeof currentAlert.replaceChildren === "function") {
        currentAlert.replaceChildren(...Array.from(renderedAlert.childNodes, (node) => node.cloneNode(true)));
      } else {
        currentAlert.textContent = renderedAlert.textContent.trim();
      }
      const hasSelectedFiles = [...form.querySelectorAll('input[type="file"]')]
        .some((input) => input.files?.length > 0);
      if (hasSelectedFiles) {
        const fileNotice = currentAlert.querySelector?.("[data-file-error-note]");
        if (fileNotice) {
          fileNotice.textContent = "Los archivos siguen seleccionados en esta pantalla; corrige los campos y vuelve a enviar.";
        } else {
          currentAlert.textContent = currentAlert.textContent
            .replace(/\s*Los archivos(?: nuevos?)? no se guardaron; selecciónalos de nuevo\.?/i, "")
            .trim();
          currentAlert.append(document.createTextNode(" Los archivos siguen seleccionados en esta pantalla; corrige los campos y vuelve a enviar."));
        }
      }
    }
    return true;
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
      button.disabled = busy;
    }
    if (busy) form.dataset.submitting = "true";
    else delete form.dataset.submitting;
  }

  function requestTimeoutMs(form) {
    let uploadBytes = 0;
    for (const input of form.querySelectorAll('input[type="file"]')) {
      for (const file of input.files || []) uploadBytes += Number(file.size) || 0;
    }
    const uploadMegabytes = Math.ceil(uploadBytes / (1024 * 1024));
    return Math.min(maximumRequestTimeoutMs, baseRequestTimeoutMs + uploadMegabytes * extraPerUploadMbMs);
  }

  const form = document.querySelector(formSelector);
  const initialAlert = form && document.querySelector('[role="alert"]');
  if (initialAlert) {
    initialAlert.tabIndex = -1;
    initialAlert.focus();
  }

  document.addEventListener("submit", async (event) => {
    const form = event.target.closest?.(formSelector);
    if (!form || busyForms.has(form)) return;
    event.preventDefault();

    const data = new FormData(form);
    const submitter = event.submitter;
    if (submitter?.name) data.append(submitter.name, submitter.value);
    const actionUrl = form.getAttribute("action") || window.location.href;
    busyForms.add(form);
    setBusy(form, true);
    setStatus("Enviando el formulario. Mantén esta pantalla abierta hasta recibir confirmación.", "sending");
    const controller = typeof AbortController === "function" ? new AbortController() : null;
    let timedOut = false;
    const timeoutId = controller && typeof window.setTimeout === "function" && typeof window.clearTimeout === "function"
      ? window.setTimeout(() => { timedOut = true; controller.abort(); }, requestTimeoutMs(form))
      : null;

    try {
      const response = await fetch(actionUrl, {
        method: "POST",
        body: data,
        credentials: "same-origin",
        headers: { Accept: "text/html" },
        signal: controller?.signal,
      });

      const finalUrl = new URL(response.url, window.location.href);
      if (finalUrl.pathname === "/login" || finalUrl.pathname.startsWith("/login/")) {
        offerSessionRecovery(
          form, finalUrl.href,
          "La sesión parece haber vencido. Tus datos y archivos siguen en esta pantalla. Inicia sesión en otra pestaña y luego recupera este formulario.",
        );
        setBusy(form, false);
        busyForms.delete(form);
        return;
      }

      if (response.status === 422) {
        const html = await response.text();
        if (!showServerErrors(html, form)) {
          setStatus("RED rechazó el formulario y no devolvió los errores. Tus datos y archivos siguen en esta pantalla; revisa el formulario e inténtalo de nuevo.", "error");
        } else {
          setStatus("Revisa los mensajes de validación. Tus datos y archivos siguen en esta pantalla.", "validation-error");
        }
        setBusy(form, false);
        busyForms.delete(form);
        document.querySelector('[role="alert"]')?.focus?.();
        return;
      }

      if (!response.ok) {
        if (response.status === 403 && response.headers?.get("X-RED-Error-Code") === "csrf-expired") {
          offerSessionRecovery(
            form, new URL("/login", window.location.href).href,
            "La seguridad de este formulario venció. Inicia sesión en otra pestaña si hace falta y recupera el formulario antes de reintentar.",
          );
          setBusy(form, false);
          busyForms.delete(form);
          return;
        }
        if (response.status === 408 || response.status === 425 || response.status === 429 || response.status >= 500) {
          setStatus(`RED no confirmó el guardado (error ${response.status}). Conserva esta pantalla y, cuando la conexión mejore, vuelve a pulsar el mismo botón sin cambiar respuestas ni archivos. RED comprobará si el primer intento se guardó y evitará duplicarlo. No recargues ni abras otro formulario.`, "error");
          setBusy(form, false);
          busyForms.delete(form);
          return;
        }
        setStatus(`RED respondió con el estado ${response.status}. Tus datos y archivos siguen en esta pantalla; puedes corregir o reintentar.`, "error");
        setBusy(form, false);
        busyForms.delete(form);
        return;
      }

      form.dataset.saved = "true";
      window.location.assign(finalUrl.href);
    } catch (_error) {
      if (timedOut) {
        setStatus("El envío superó el tiempo de espera. RED pudo haberlo guardado; conserva esta pantalla y reintenta con la misma clave, sin cambiar respuestas ni archivos. No recargues ni abras otro formulario.", "error");
      } else {
        setStatus("No se pudo confirmar el guardado. Conserva esta pantalla y, cuando vuelva la conexión, pulsa de nuevo el mismo botón sin cambiar respuestas ni archivos. RED comprobará si el primer intento se guardó y evitará duplicarlo. No recargues ni abras otro formulario.", "error");
      }
      setBusy(form, false);
      busyForms.delete(form);
    } finally {
      if (timeoutId !== null) window.clearTimeout(timeoutId);
    }
  });
})();
