export async function captureScreenshot(): Promise<string> {
  const dataUrl = await chrome.tabs.captureVisibleTab();
  return dataUrl.split(",")[1];
}
