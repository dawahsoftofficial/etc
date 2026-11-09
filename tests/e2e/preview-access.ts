// Test-only viewer login for the private-preview gate. The e2e server runs with SITE_ACCESS set to this pair, and every
// browser context and API request sends it, so the whole suite runs behind the gate exactly as staging does.
export const PREVIEW = { username: "e2e-viewer", password: "e2e-preview-pass-123" };
export const PREVIEW_SITE_ACCESS = `${PREVIEW.username}:${PREVIEW.password}`;
