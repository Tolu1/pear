let urlHistory: string[] = [];

const onChange = () => {
  const currentUrl = window.location.href;
  urlHistory.push(currentUrl);
  if (urlHistory.length > 10) {
    urlHistory.shift();
  }

  chrome.runtime
    .sendMessage({
      type: "PAGE_CHANGED",
      context: {
        url: window.location.href,
        history: [...urlHistory],
      },
    })
    .catch(() => {});
};

onChange();

let currentUrl = window.location.href;
new MutationObserver(() => {
  if (currentUrl !== window.location.href) {
    currentUrl = window.location.href;
    onChange();
  }
}).observe(document.body, { childList: true, subtree: true });

window.addEventListener("popstate", onChange);
