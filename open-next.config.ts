import { defineCloudflareConfig } from '@opennextjs/cloudflare';

// R2-backed incremental caching is intentionally deferred until the owner
// provisions and approves a production bucket. The default adapter cache keeps
// this preparation free of external infrastructure mutations.
export default defineCloudflareConfig({});
