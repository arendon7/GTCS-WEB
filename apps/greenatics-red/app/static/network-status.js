(() => {
  const banner = document.querySelector("[data-network-status]");
  const message = banner?.querySelector("[data-network-message]");
  const recheckButton = banner?.querySelector("[data-network-recheck]");
  if (!banner || !message) return;

  let checkSequence = 0;
  const requestTimeoutMs = 5000;

  function setStatus(state, text) {
    if (banner.dataset.networkState === state && message.textContent === text) return;
    banner.dataset.networkState = state;
    message.textContent = text;
  }

  async function updateNetworkStatus() {
    const sequence = ++checkSequence;
    const browserOffline = navigator.onLine === false;
    if (recheckButton) recheckButton.disabled = true;
    setStatus("checking", "Comprobando que GREENATICS RED, la base de datos y el almacenamiento respondan. El envío aún requiere confirmación al guardar.");
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), requestTimeoutMs);
    try {
      const response = await fetch("/api/health", {
        method: "GET",
        credentials: "same-origin",
        cache: "no-store",
        headers: { Accept: "application/json" },
        signal: controller.signal,
      });
      const health = response.ok ? await response.json() : null;
      if (sequence !== checkSequence) return;
      if (
        response.ok && health?.status === "ok" &&
        health?.application === "GREENATICS RED"
      ) {
        setStatus("connected", "GREENATICS RED, la base de datos y el almacenamiento responden. Esto no anticipa la validación del formulario ni el resultado del guardado; espera su confirmación antes de salir.");
      } else {
        setStatus(
          browserOffline ? "offline" : "unavailable",
          browserOffline
            ? "El navegador indica que no hay conexión y RED no respondió. RED no guarda este formulario sin conexión. Mantén esta pantalla; cuando RED responda, reintenta desde aquí. Si recargaste o perdiste los datos, usa solo la contingencia aprobada."
            : "GREENATICS RED no confirmó que la aplicación, la base de datos y el almacenamiento estén disponibles. Conserva esta pantalla y no cierres el formulario; vuelve a comprobar antes de reintentar.",
        );
      }
    } catch (_error) {
      if (sequence !== checkSequence) return;
      setStatus(
        browserOffline ? "offline" : "unavailable",
        browserOffline
          ? "El navegador indica que no hay conexión y RED no respondió. RED no guarda este formulario sin conexión. Mantén esta pantalla; cuando RED responda, reintenta desde aquí. Si recargaste o perdiste los datos, usa solo la contingencia aprobada."
          : "No se pudo confirmar la respuesta de GREENATICS RED, la base de datos y el almacenamiento. Conserva esta pantalla y no cierres el formulario; vuelve a comprobar antes de reintentar.",
      );
    } finally {
      window.clearTimeout(timeout);
      if (sequence === checkSequence && recheckButton) recheckButton.disabled = false;
    }
  }

  window.addEventListener("online", updateNetworkStatus);
  recheckButton?.addEventListener("click", updateNetworkStatus);
  window.addEventListener("offline", () => {
    checkSequence += 1;
    updateNetworkStatus();
  });
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") updateNetworkStatus();
  });
  updateNetworkStatus();
})();
