const LOAD_TIMEOUT_MS = 15000;

export function navigateTab(tabId: number, url: string): Promise<void> {
  return new Promise((resolve) => {
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      chrome.tabs.onUpdated.removeListener(listener);
      clearTimeout(timer);
      resolve();
    };

    const listener = (id: number, info: chrome.tabs.TabChangeInfo) => {
      if (id === tabId && info.status === "complete") finish();
    };

    const timer = setTimeout(finish, LOAD_TIMEOUT_MS);
    chrome.tabs.onUpdated.addListener(listener);
    void chrome.tabs.update(tabId, { url });
  });
}
