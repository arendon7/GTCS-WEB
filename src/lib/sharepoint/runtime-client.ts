import {
  SharePointGraphReadonlyClient,
  parseSharePointGraphRuntimeConfig,
  type SharePointGraphRuntimeConfig,
  type SharePointListOptions,
} from "./graph-readonly";
import { assertSharePointDirectorySource } from "./source-binding";

class SourceBoundSharePointGraphRuntimeClient extends SharePointGraphReadonlyClient {
  constructor(private readonly runtimeConfig: SharePointGraphRuntimeConfig) {
    super(runtimeConfig);
  }

  override async listDirectory(relativeFolder = "", options: SharePointListOptions = {}) {
    const listing = await super.listDirectory(relativeFolder, options);
    return assertSharePointDirectorySource(listing, this.runtimeConfig.source);
  }
}

let runtimeClient: SourceBoundSharePointGraphRuntimeClient | null = null;

export function getSharePointGraphRuntimeClient() {
  if (!runtimeClient) {
    const config = parseSharePointGraphRuntimeConfig(process.env);
    if (!config.ok) throw new Error(config.error);
    runtimeClient = new SourceBoundSharePointGraphRuntimeClient(config.value);
  }
  return runtimeClient;
}
