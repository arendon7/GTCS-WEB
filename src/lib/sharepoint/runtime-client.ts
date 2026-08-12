import { createSharePointGraphReadonlyClient, type SharePointGraphReadonlyClient } from "./graph-readonly";

let runtimeClient: SharePointGraphReadonlyClient | null = null;

export function getSharePointGraphRuntimeClient() {
  if (!runtimeClient) runtimeClient = createSharePointGraphReadonlyClient(process.env);
  return runtimeClient;
}
