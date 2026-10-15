(() => {
  const method = "browser_geolocation";

  const capturedLocation = (raw) => {
    if (!raw) return null;
    try {
      const value = JSON.parse(raw);
      if (value && value.method === method) return value;
    } catch (_error) {
      return null;
    }
    return null;
  };

  const summary = (value) => {
    const location = capturedLocation(value);
    if (!location) return value ? "Valor previo conservado; la fuente de sus coordenadas no está registrada en el formato de captura RED." : "Sin ubicación capturada.";
    const time = String(location.captured_at || "").replace("T", " ").replace("Z", " UTC");
    return `Latitud ${location.latitude}, longitud ${location.longitude} · precisión informada ±${location.accuracy_m} m · hora del dispositivo ${time}`;
  };

  document.querySelectorAll("[data-gps-capture]").forEach((button) => {
    const fieldId = button.dataset.gpsCapture;
    const input = document.getElementById(fieldId);
    const group = button.closest(".gps-capture-control");
    const status = group?.querySelector("[data-gps-status]");
    const current = group?.querySelector("[data-gps-summary]");
    if (!input || !status || !current) return;

    current.textContent = summary(input.value);

    button.addEventListener("click", () => {
      if (!window.isSecureContext) {
        status.textContent = "La captura de ubicación requiere HTTPS o localhost seguro.";
        return;
      }
      if (!navigator.geolocation) {
        status.textContent = "Este navegador no ofrece captura de ubicación. Puedes dejar el campo pendiente.";
        return;
      }

      button.disabled = true;
      status.textContent = "Solicitando permiso y ubicación al dispositivo…";
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude, accuracy } = position.coords;
        if (![latitude, longitude, accuracy].every(Number.isFinite) || Math.abs(latitude) > 90 || Math.abs(longitude) > 180 || accuracy < 0) {
          status.textContent = "El dispositivo devolvió coordenadas que no se pueden usar. No se guardaron.";
          button.disabled = false;
          return;
        }

        const location = {
          method,
          latitude: Number(latitude.toFixed(7)),
          longitude: Number(longitude.toFixed(7)),
          accuracy_m: Math.round(accuracy * 10) / 10,
          captured_at: new Date(position.timestamp).toISOString(),
        };
        input.value = JSON.stringify(location);
        current.textContent = summary(input.value);
        input.dispatchEvent(new Event("input", { bubbles: true }));
        input.dispatchEvent(new Event("change", { bubbles: true }));
        status.textContent = "Ubicación capturada en este dispositivo. Revisa la precisión y registra la fuente o método antes de enviar.";
        button.disabled = false;
      }, (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          status.textContent = "No se concedió permiso de ubicación. El campo queda sin cambiar.";
        } else if (error.code === error.TIMEOUT) {
          status.textContent = "El dispositivo tardó demasiado en obtener la ubicación. Inténtalo otra vez o deja el campo pendiente.";
        } else {
          status.textContent = "No se pudo obtener la ubicación. Verifica el GPS del dispositivo o deja el campo pendiente.";
        }
        button.disabled = false;
      }, { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 });
    });
  });
})();
