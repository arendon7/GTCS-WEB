(() => {
  const selector = "form[data-evidence-upload-form]";
  const busyForms = new WeakSet();
  const lockedControls = new WeakMap();

  function setStatus(form, message, state = "info", actions = []) {
    const status = form.querySelector("[data-evidence-upload-status]");
    const text = status?.querySelector("[data-evidence-upload-message]");
    const actionSlot = status?.querySelector("[data-evidence-upload-actions]");
    if (!status || !text || !actionSlot) return;
    text.textContent = message;
    status.hidden = !message;
    status.dataset.state = state;
    status.setAttribute("role", state === "error" ? "alert" : "status");
    status.setAttribute("aria-live", state === "error" ? "assertive" : "polite");
    actionSlot.replaceChildren(...actions);
  }

  function setBusy(form, busy) {
    if (busy) {
      const controls = [...form.querySelectorAll('input[type="file"], button[type="submit"]')];
      lockedControls.set(form, controls.map((control) => ({ control, wasDisabled: control.disabled })));
      for (const { control } of lockedControls.get(form)) control.disabled = true;
      const button = form.querySelector('button[type="submit"]');
      if (button) {
        button.dataset.previousLabel = button.textContent;
        button.textContent = "Adjuntando…";
      }
      form.dataset.submitting = "true";
      return;
    }
    for (const { control, wasDisabled } of lockedControls.get(form) || []) control.disabled = wasDisabled;
    lockedControls.delete(form);
    const button = form.querySelector('button[type="submit"]');
    if (button?.dataset.previousLabel) button.textContent = button.dataset.previousLabel;
    if (button) delete button.dataset.previousLabel;
    delete form.dataset.submitting;
  }

  function isLogin(url) {
    return url.pathname === "/login" || url.pathname.startsWith("/login/");
  }

  function sessionRecovery(form, loginUrl) {
    const loginLink = document.createElement("a");
    loginLink.className = "button secondary";
    loginLink.href = loginUrl;
    loginLink.target = "_blank";
    loginLink.rel = "noopener";
    loginLink.textContent = "Abrir ingreso en otra pestaña";

    const recover = document.createElement("button");
    recover.type = "button";
    recover.className = "button secondary";
    recover.textContent = "Ya inicié sesión; recuperar carga";
    recover.addEventListener("click", async () => {
      recover.disabled = true;
      setStatus(form, "Comprobando la sesión y renovando la seguridad de esta carga…");
      try {
        const response = await fetch("/api/me", {
          method: "GET", credentials: "same-origin", cache: "no-store",
          headers: { Accept: "application/json" },
        });
        const finalUrl = new URL(response.url, window.location.href);
        const body = response.ok && !isLogin(finalUrl) ? await response.json() : null;
        const token = typeof body?.csrf_token === "string" ? body.csrf_token : "";
        const csrfField = form.querySelector('input[name="csrf"]');
        if (!token || !csrfField) throw new Error("session-not-restored");
        csrfField.value = token;
        setStatus(form, "Sesión recuperada. El archivo y la clave siguen en esta pantalla; reenvía esta misma carga.");
        form.querySelector('button[type="submit"]')?.focus();
      } catch (_error) {
        recover.disabled = false;
        setStatus(form, "No se pudo renovar la sesión. Inicia sesión en la otra pestaña y vuelve a recuperar esta carga.", "error", [loginLink, recover]);
      }
    });
    setStatus(
      form,
      "La sesión parece haber vencido. Conserva esta pantalla y el archivo seleccionado; inicia sesión en otra pestaña y recupera la carga antes de reintentar.",
      "error",
      [loginLink, recover],
    );
  }

  async function responseDetail(response) {
    try {
      const body = await response.json();
      return typeof body?.detail === "string" ? body.detail.trim().slice(0, 500) : "";
    } catch (_error) {
      return "";
    }
  }

  document.addEventListener("submit", async (event) => {
    const form = event.target.closest?.(selector);
    if (!form || busyForms.has(form)) return;
    event.preventDefault();

    if (navigator.onLine === false) {
      setStatus(form, "No hay conexión. RED no guarda este archivo sin conexión. Conserva la pantalla y reintenta aquí con el mismo archivo cuando vuelva la red.", "error");
      return;
    }

    const fileInput = form.querySelector('input[type="file"]');
    if (!fileInput?.files?.length) {
      fileInput?.focus();
      setStatus(form, "Selecciona el archivo que vas a adjuntar.", "error");
      return;
    }

    const data = new FormData(form);
    busyForms.add(form);
    setBusy(form, true);
    setStatus(form, "Enviando el archivo. Mantén esta pantalla abierta hasta recibir confirmación.");
    const controller = new AbortController();
    const fileSize = Number(fileInput.files[0]?.size) || 0;
    const timeoutMs = Math.min(15 * 60_000, 90_000 + Math.ceil(fileSize / (1024 * 1024)) * 15_000);
    let timedOut = false;
    const timeoutId = window.setTimeout(() => { timedOut = true; controller.abort(); }, timeoutMs);

    try {
      const response = await fetch(form.getAttribute("action") || window.location.href, {
        method: "POST", body: data, credentials: "same-origin",
        headers: { Accept: "text/html, application/json" }, signal: controller.signal,
      });
      const finalUrl = new URL(response.url, window.location.href);
      if (isLogin(finalUrl)) {
        sessionRecovery(form, finalUrl.href);
        return;
      }
      if (response.ok && response.redirected) {
        form.dataset.saved = "true";
        window.location.assign(finalUrl.href);
        return;
      }
      if (response.ok) {
        setStatus(form, "RED confirmó la carga. Actualiza el expediente para comprobar que aparece en la lista.");
        return;
      }
      if (response.status === 401 || (response.status === 403 && response.headers?.get("X-RED-Error-Code") === "csrf-expired")) {
        sessionRecovery(form, new URL("/login", window.location.href).href);
        return;
      }
      const detail = await responseDetail(response);
      if ([408, 425, 429].includes(response.status) || response.status >= 500) {
        setStatus(form, `RED respondió ${response.status} y pudo haber guardado el archivo. Conserva el mismo archivo y esta pantalla; vuelve a enviarlo aquí para que RED compruebe el primer intento y evite duplicarlo.${detail ? ` ${detail}` : ""}`, "error");
      } else {
        setStatus(form, detail || `RED respondió ${response.status}. Conserva el archivo y revisa el mensaje antes de volver a enviar.`, "error");
      }
    } catch (_error) {
      const reason = timedOut ? "se agotó el tiempo de espera" : "se perdió la respuesta";
      setStatus(form, `RED ${reason}; pudo haber guardado el archivo. Mantén esta pantalla, el archivo y la misma clave; vuelve a enviarlo aquí para comprobar el primer intento sin duplicarlo. No recargues ni cambies el archivo.`, "error");
    } finally {
      window.clearTimeout(timeoutId);
      setBusy(form, false);
      busyForms.delete(form);
    }
  });
})();
