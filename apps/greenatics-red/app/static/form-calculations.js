(() => {
  const form = document.querySelector("form.record-form");
  if (!form) return;

  const formCode = form.querySelector('input[name="form_code"]')?.value;
  const parseDecimal = (raw) => {
    if (raw === undefined || raw === null || String(raw).trim() === "") return null;
    const match = String(raw).trim().match(/^(\d+)(?:\.(\d+))?$/);
    if (!match) return null;
    const fraction = match[2] || "";
    return { coefficient: BigInt(match[1] + fraction), scale: fraction.length };
  };
  const readDecimal = (id) => {
    const input = form.querySelector(`#${CSS.escape(id)}`);
    return parseDecimal(input?.value);
  };
  const rescale = (decimal, scale) => decimal.coefficient * 10n ** BigInt(scale - decimal.scale);
  const decimalText = (coefficient, scale) => {
    const digits = coefficient.toString().padStart(scale + 1, "0");
    if (scale === 0) return digits;
    const whole = digits.slice(0, -scale);
    const fraction = digits.slice(-scale).replace(/0+$/, "");
    return fraction ? `${whole}.${fraction}` : whole;
  };
  const decimalFixedText = (coefficient, scale) => {
    const digits = coefficient.toString().padStart(scale + 1, "0");
    return `${digits.slice(0, -scale)}.${digits.slice(-scale).padStart(scale, "0")}`;
  };
  const writeNumber = (id, value) => {
    const output = form.querySelector(`[data-derived-field="${CSS.escape(id)}"]`);
    if (!output) return;
    output.value = value ?? "";
  };

  const recalculate = () => {
    if (formCode === "D-07") {
      const tare = readDecimal("D07-005");
      const gross = readDecimal("D07-006");
      if (tare === null || gross === null) return writeNumber("D07-007", null);
      const scale = Math.max(tare.scale, gross.scale);
      const net = rescale(gross, scale) - rescale(tare, scale);
      writeNumber("D07-007", net >= 0n ? decimalText(net, scale) : null);
    } else if (formCode === "D-09") {
      const total = readDecimal("D09-002");
      const improper = readDecimal("D09-003");
      if (total === null || improper === null || total.coefficient <= 0n) return writeNumber("D09-004", null);
      const numerator = improper.coefficient * 10n ** BigInt(total.scale) * 10000n;
      const denominator = total.coefficient * 10n ** BigInt(improper.scale);
      if (numerator > denominator * 10000n) return writeNumber("D09-004", null);
      const roundedCents = (2n * numerator + denominator) / (2n * denominator);
      writeNumber("D09-004", decimalText(roundedCents, 2));
    } else if (formCode === "D-08") {
      const selected = form.querySelector("#D08-001")?.selectedOptions?.[0];
      const initial = parseDecimal(selected?.dataset.initialWeight);
      const peerTotal = parseDecimal(selected?.dataset.peerTotal);
      const fraction = readDecimal("D08-005");
      if (!selected?.value || initial === null) {
        writeNumber("D08-008", null);
        writeNumber("D08-009", null);
        writeNumber("D08-010", "Pendiente: enlaza un pesaje D-07 válido.");
        return;
      }
      if (selected.dataset.peerIncomplete === "true" || peerTotal === null || fraction === null) {
        writeNumber("D08-008", null);
        writeNumber("D08-009", null);
        writeNumber("D08-010", "Pendiente: completa el peso de todas las fracciones vinculadas.");
        return;
      }
      const scale = Math.max(initial.scale, peerTotal.scale, fraction.scale);
      const initialValue = rescale(initial, scale);
      const total = rescale(peerTotal, scale) + rescale(fraction, scale);
      const rawDifference = total - initialValue;
      const difference = rawDifference < 0n ? -rawDifference : rawDifference;
      let percentageText = "porcentaje no calculable (peso inicial 0 kg)";
      if (initialValue > 0n) {
        const roundedCents = (2n * difference * 10000n + initialValue) / (2n * initialValue);
        percentageText = `${decimalFixedText(roundedCents, 2)}%`;
      }
      writeNumber("D08-008", decimalText(total, scale));
      writeNumber("D08-009", `${decimalText(difference, scale)} kg; ${percentageText}`);
      writeNumber("D08-010", "Pendiente de revisar completitud, evidencia y tolerancia técnica interna.");
    }
  };

  form.addEventListener("input", recalculate);
  form.addEventListener("change", recalculate);
  recalculate();
})();
