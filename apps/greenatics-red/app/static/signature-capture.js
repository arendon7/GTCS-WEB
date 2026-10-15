(() => {
  document.querySelectorAll("form[data-signature-form]").forEach((form) => {
    const canvas = form.querySelector("[data-signature-canvas]");
    const strokesField = form.querySelector("[data-signature-strokes]");
    const submit = form.querySelector("[data-signature-submit]");
    const status = form.querySelector("[data-signature-status]");
    const context = canvas?.getContext("2d");
    if (!canvas || !context || !strokesField || !submit) return;

    let strokes = [];
    let activeStroke = null;
    let activePointerId = null;
    let keyboardDrawing = false;
    let keyboardFocused = false;
    let keyboardMode = false;
    let keyboardCursor = [0.5, 0.5];
    let saving = false;
    let pixelRatio = 1;
    const redraw = () => {
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.strokeStyle = "#17251c";
      context.lineWidth = 3.4 * pixelRatio;
      context.lineCap = "round";
      context.lineJoin = "round";
      for (const stroke of strokes) {
        context.beginPath();
        stroke.forEach(([x, y], index) => {
          const px = x * canvas.width;
          const py = y * canvas.height;
          if (index === 0) context.moveTo(px, py);
          else context.lineTo(px, py);
        });
        context.stroke();
      }
      if (keyboardFocused && keyboardMode) {
        context.beginPath();
        context.arc(keyboardCursor[0] * canvas.width, keyboardCursor[1] * canvas.height, 5 * pixelRatio, 0, Math.PI * 2);
        context.strokeStyle = "#557260";
        context.lineWidth = 1.5 * pixelRatio;
        context.stroke();
      }
      strokesField.value = JSON.stringify(strokes);
      submit.disabled = saving || !strokes.some((stroke) => stroke.length > 1);
      if (status && !saving) status.textContent = submit.disabled ? "Firma pendiente." : "Firma dibujada. Revísala y confirma para guardar.";
    };
    const resizeCanvas = () => {
      const bounds = canvas.getBoundingClientRect();
      if (!bounds.width || !bounds.height) return;
      const nextPixelRatio = Math.min(Math.max(window.devicePixelRatio || 1, 1), 3);
      const width = Math.round(bounds.width * nextPixelRatio);
      const height = Math.round(bounds.height * nextPixelRatio);
      if (canvas.width === width && canvas.height === height && pixelRatio === nextPixelRatio) return;
      pixelRatio = nextPixelRatio;
      if (canvas.width !== width) canvas.width = width;
      if (canvas.height !== height) canvas.height = height;
      redraw();
    };
    const pointFromEvent = (event) => {
      const bounds = canvas.getBoundingClientRect();
      return [
        Math.max(0, Math.min(1, (event.clientX - bounds.left) / bounds.width)),
        Math.max(0, Math.min(1, (event.clientY - bounds.top) / bounds.height)),
      ];
    };

    canvas.addEventListener("pointerdown", (event) => {
      if (saving) {
        event.preventDefault();
        return;
      }
      if (activePointerId !== null || activeStroke !== null) {
        event.preventDefault();
        return;
      }
      keyboardMode = false;
      if (strokes.length >= 12) {
        if (status) status.textContent = "Se alcanzó el máximo de trazos. Limpia para firmar de nuevo.";
        return;
      }
      event.preventDefault();
      activePointerId = event.pointerId;
      canvas.setPointerCapture(event.pointerId);
      activeStroke = [pointFromEvent(event)];
      strokes.push(activeStroke);
      redraw();
    });
    canvas.addEventListener("pointermove", (event) => {
      if (!activeStroke || event.pointerId !== activePointerId) return;
      event.preventDefault();
      const next = pointFromEvent(event);
      const previous = activeStroke[activeStroke.length - 1];
      if (Math.hypot(next[0] - previous[0], next[1] - previous[1]) > 0.002) {
        activeStroke.push(next);
        redraw();
      }
    });
    const finishStroke = (event) => {
      if (event.pointerId !== activePointerId) return;
      if (activeStroke && activeStroke.length < 2) strokes = strokes.filter((stroke) => stroke !== activeStroke);
      activeStroke = null;
      activePointerId = null;
      redraw();
    };
    canvas.addEventListener("pointerup", finishStroke);
    canvas.addEventListener("pointercancel", finishStroke);
    canvas.addEventListener("focus", () => {
      keyboardFocused = true;
      redraw();
    });
    canvas.addEventListener("keydown", (event) => {
      if (saving) {
        if (event.key === " " || event.key === "Spacebar" || event.key.startsWith("Arrow")) event.preventDefault();
        return;
      }
      if (event.key === " " || event.key === "Spacebar") {
        event.preventDefault();
        keyboardMode = true;
        if (event.repeat || keyboardDrawing || activeStroke !== null || activePointerId !== null) return;
        if (strokes.length >= 12) {
          if (status) status.textContent = "Se alcanzó el máximo de trazos. Limpia para firmar de nuevo.";
          return;
        }
        keyboardDrawing = true;
        activeStroke = [keyboardCursor.slice()];
        strokes.push(activeStroke);
        if (status) status.textContent = "Trazo iniciado. Mantén Espacio y mueve las flechas para dibujar.";
        redraw();
        return;
      }
      const directions = {
        ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0],
      };
      const direction = directions[event.key];
      if (!direction) return;
      event.preventDefault();
      keyboardMode = true;
      const step = event.shiftKey ? 0.04 : 0.01;
      keyboardCursor = [
        Math.max(0, Math.min(1, keyboardCursor[0] + direction[0] * step)),
        Math.max(0, Math.min(1, keyboardCursor[1] + direction[1] * step)),
      ];
      if (keyboardDrawing && activeStroke) activeStroke.push(keyboardCursor.slice());
      redraw();
    });
    canvas.addEventListener("keyup", (event) => {
      if ((event.key !== " " && event.key !== "Spacebar") || !keyboardDrawing) return;
      event.preventDefault();
      keyboardDrawing = false;
      if (activeStroke && activeStroke.length < 2) strokes = strokes.filter((stroke) => stroke !== activeStroke);
      activeStroke = null;
      redraw();
      if (status) status.textContent = "Trazo terminado. Puedes continuar con Espacio y las flechas o limpiar la firma.";
    });
    canvas.addEventListener("blur", () => {
      const wasKeyboardDrawing = keyboardDrawing;
      keyboardDrawing = false;
      if (activeStroke && activeStroke.length < 2) strokes = strokes.filter((stroke) => stroke !== activeStroke);
      activeStroke = null;
      keyboardFocused = false;
      keyboardMode = false;
      redraw();
      if (wasKeyboardDrawing && status) status.textContent = "Trazo terminado al salir del recuadro. Puedes continuar o limpiar la firma.";
    });
    if (typeof window.ResizeObserver === "function") {
      new window.ResizeObserver(resizeCanvas).observe(canvas);
    } else {
      window.addEventListener("resize", resizeCanvas, { passive: true });
    }
    form.querySelector("[data-signature-clear]")?.addEventListener("click", () => {
      if (saving) return;
      strokes = [];
      activeStroke = null;
      activePointerId = null;
      keyboardDrawing = false;
      keyboardCursor = [0.5, 0.5];
      redraw();
      canvas.focus();
    });
    form.addEventListener("submit", async (event) => {
      if (saving) {
        event.preventDefault();
        return;
      }
      if (submit.disabled || !strokes.some((stroke) => stroke.length > 1)) {
        event.preventDefault();
        if (status) status.textContent = "Dibuja tu firma antes de guardarla.";
        canvas.focus();
        return;
      }
      event.preventDefault();
      saving = true;
      redraw();
      if (status) status.textContent = "Guardando la constancia…";
      try {
        const response = await window.fetch(form.action, {
          method: "POST",
          body: new window.FormData(form),
          credentials: "same-origin",
          redirect: "follow",
        });
        if (response.redirected) {
          window.location.assign(response.url);
          return;
        }
        let detail = "";
        if ((response.headers?.get("content-type") || "").includes("application/json")) {
          try {
            const payload = await response.json();
            if (typeof payload?.detail === "string") detail = payload.detail;
          } catch (_error) {
            detail = "";
          }
        }
        saving = false;
        redraw();
        if (status) status.textContent = detail || (response.status === 403
          ? "No se pudo confirmar la identidad. Revisa la contraseña y vuelve a intentarlo."
          : response.status === 409
            ? "La constancia ya existe o el contenido cambió. Actualiza la ficha y comprueba su estado."
            : "RED no confirmó el guardado. Revisa los datos e inténtalo de nuevo.");
      } catch (_error) {
        saving = false;
        redraw();
        if (status) status.textContent = "Se perdió la conexión y no pudimos confirmar el resultado. Actualiza la ficha y revisa si la constancia aparece antes de volver a enviarla.";
      }
    });
    resizeCanvas();
    redraw();
  });
})();
