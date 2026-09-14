import { describe, expect, it } from "vitest";
import { isPlannerRole, validateScheduleDraft } from "@/lib/planning-domain";

describe("planning domain", () => {
  it("recognizes planning roles without granting operators or maintenance users", () => {
    expect(isPlannerRole("supervisor")).toBe(true);
    expect(isPlannerRole("technical")).toBe(true);
    expect(isPlannerRole("admin")).toBe(true);
    expect(isPlannerRole("director")).toBe(true);
    expect(isPlannerRole("operator")).toBe(false);
    expect(isPlannerRole("maintenance")).toBe(false);
  });

  it("accepts a valid canonical schedule draft", () => {
    expect(validateScheduleDraft({
      templateId: "template-1",
      plannedStart: "2026-08-14T13:00:00.000Z",
      plannedEnd: "2026-08-14T14:00:00.000Z",
      workerIds: ["worker-1", "worker-2"],
    })).toEqual({ ok: true });
  });

  it("rejects incomplete, inverted and duplicate-worker drafts", () => {
    expect(validateScheduleDraft({ templateId: "", plannedStart: "x", plannedEnd: "y", workerIds: [] })).toEqual({ ok: false, error: "Selecciona una actividad." });
    expect(validateScheduleDraft({ templateId: "template-1", plannedStart: "2026-08-14T14:00:00Z", plannedEnd: "2026-08-14T13:00:00Z", workerIds: ["worker-1"] })).toEqual({ ok: false, error: "La hora final debe ser posterior al inicio." });
    expect(validateScheduleDraft({ templateId: "template-1", plannedStart: "2026-08-14T13:00:00Z", plannedEnd: "2026-08-14T14:00:00Z", workerIds: ["worker-1", "worker-1"] })).toEqual({ ok: false, error: "Hay trabajadores repetidos en la programación." });
  });
});
