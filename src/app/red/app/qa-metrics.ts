type ReviewRecord = { id: string; state: string };

export function countCorrectionStates(records: readonly ReviewRecord[], decisions: Readonly<Record<string, string>>) {
  return records.filter(({ id, state }) => {
    const currentState = decisions[id] ?? state;
    return currentState === "Corrección" || currentState === "Corrección solicitada";
  }).length;
}

export function countApprovedDecisions(decisions: Readonly<Record<string, string>>) {
  return Object.values(decisions).filter((decision) => decision === "Aprobada").length;
}
