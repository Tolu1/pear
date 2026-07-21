const BLOCKED_SCHEMES = [
  "chrome:",
  "chrome-extension:",
  "chrome-untrusted:",
  "devtools:",
  "edge:",
  "brave:",
  "opera:",
  "vivaldi:",
  "about:",
  "view-source:",
];

const BLOCKED_HOSTS = ["chromewebstore.google.com", "chrome.google.com"];

export function isDrivableUrl(url: string | undefined): boolean {
  if (!url) return false;

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return false;
  }

  if (BLOCKED_SCHEMES.includes(parsed.protocol)) return false;
  if (BLOCKED_HOSTS.includes(parsed.hostname)) return false;

  return true;
}
