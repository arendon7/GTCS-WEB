(function () {
  "use strict";

  function values(raw) {
    return String(raw || "")
      .split("|")
      .map(function (value) { return value.trim().toLocaleLowerCase(); })
      .filter(Boolean);
  }

  function update(form, group) {
    var source = document.getElementById(group.dataset.requiredWhenField || "");
    if (!source || !form.contains(source)) return;

    var current = String(source.value || "").trim().toLocaleLowerCase();
    var equals = values(group.dataset.requiredWhenValues);
    var notEquals = values(group.dataset.requiredWhenNotValues);
    var required = (equals.length > 0 && equals.indexOf(current) !== -1)
      || (notEquals.length > 0 && current && notEquals.indexOf(current) === -1);

    group.querySelectorAll("input, select, textarea").forEach(function (control) {
      if (control.dataset.existingEvidence === "true") {
        control.required = false;
      } else {
        control.required = Boolean(required);
      }
    });
  }

  document.querySelectorAll("form").forEach(function (form) {
    var groups = Array.from(form.querySelectorAll("[data-required-when-field]"));
    if (!groups.length) return;
    var source = document.getElementById(groups[0].dataset.requiredWhenField || "");
    if (source) {
      source.addEventListener("change", function () {
        groups.forEach(function (group) { update(form, group); });
      });
      source.addEventListener("input", function () {
        groups.forEach(function (group) { update(form, group); });
      });
    }
    groups.forEach(function (group) { update(form, group); });
  });
})();
