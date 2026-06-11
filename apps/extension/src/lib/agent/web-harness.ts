import type { WebHarnessLike, TabState, WebAction } from "@repo/agent-core/web";
import { CanvasImage } from "./canvas-image";
import {
  attachDebugger,
  detachDebugger,
  sendCommand,
  charToKeyInput,
  NAMED_KEYS,
  type KeyInput,
} from "./cdp";

const STABILITY_TIMEOUT_MS = 5000;
const SETTLE_MS = 300;
const TOTAL_TYPING_DELAY_MS = 500;

const isMac =
  (navigator as Navigator & { userAgentData?: { platform?: string } })
    .userAgentData?.platform === "macOS" ||
  navigator.userAgent.includes("Mac");

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Ported verbatim from @repo/agent-core web/util.ts so the browser harness
// splits <enter>/<tab> markers identically to the upstream Playwright harness.
function parseTypeContent(content: string): string[] {
  const regex = /<enter>|<tab>/g;
  const result: string[] = [];
  let lastIndex = 0;
  content.replace(regex, (match, offset: number) => {
    const text = content.slice(lastIndex, offset).trim();
    if (text) result.push(text);
    result.push(match);
    lastIndex = offset + match.length;
    return match;
  });
  const remaining = content.slice(lastIndex).trim();
  if (remaining) result.push(remaining);
  return result;
}

interface EvaluateResponse<T> {
  result: { value: T };
}

/**
 * Browser implementation of {@link WebHarnessLike}, adapted from upstream's
 * Playwright WebHarness. Drives the user's live tab via chrome.debugger (CDP)
 * instead of Playwright; coordinates arrive already in CSS-pixel space (see
 * {@link CanvasImage}), so transform is identity and is intentionally dropped.
 */
export class WebHarness implements WebHarnessLike {
  private activeTabId: number;
  private readonly attached = new Set<number>();

  constructor(tabId: number) {
    this.activeTabId = tabId;
  }

  async start(): Promise<void> {
    await this.ensureAttached(this.activeTabId);
  }

  async stop(): Promise<void> {
    for (const tabId of this.attached) {
      await detachDebugger(tabId);
    }
    this.attached.clear();
  }

  private async ensureAttached(tabId: number): Promise<void> {
    if (this.attached.has(tabId)) return;
    await attachDebugger(tabId);
    this.attached.add(tabId);
  }

  private async evaluate<T>(expression: string): Promise<T> {
    const res = await sendCommand<EvaluateResponse<T>>(
      this.activeTabId,
      "Runtime.evaluate",
      { expression, returnByValue: true },
    );
    return res.result.value;
  }

  async screenshot(): Promise<CanvasImage> {
    const tab = await chrome.tabs.get(this.activeTabId);
    const dataUrl = await chrome.tabs.captureVisibleTab(tab.windowId, {
      format: "png",
    });
    const dpr = await this.evaluate<number>("window.devicePixelRatio");
    return CanvasImage.fromDataUrl(dataUrl, dpr || 1);
  }

  async retrieveTabState(): Promise<TabState> {
    const active = await chrome.tabs.get(this.activeTabId);
    const tabs = await chrome.tabs.query({ windowId: active.windowId });
    const sorted = [...tabs].sort((a, b) => a.index - b.index);
    const activeIndex = sorted.findIndex((t) => t.id === this.activeTabId);
    return {
      activeTab: activeIndex < 0 ? 0 : activeIndex,
      tabs: sorted.map((t) => ({
        index: t.index,
        url: t.url ?? "",
        title: t.title ?? "",
      })),
    };
  }

  private async mouse(
    type: "mouseMoved" | "mousePressed" | "mouseReleased" | "mouseWheel",
    x: number,
    y: number,
    extra: Record<string, unknown> = {},
  ): Promise<void> {
    await sendCommand(this.activeTabId, "Input.dispatchMouseEvent", {
      type,
      x,
      y,
      ...extra,
    });
  }

  async click({ x, y }: { x: number; y: number }): Promise<void> {
    await this.mouse("mouseMoved", x, y);
    await this.mouse("mousePressed", x, y, { button: "left", clickCount: 1 });
    await this.mouse("mouseReleased", x, y, { button: "left", clickCount: 1 });
    await this.waitForStability();
  }

  async doubleClick({ x, y }: { x: number; y: number }): Promise<void> {
    await this.mouse("mouseMoved", x, y);
    await this.mouse("mousePressed", x, y, { button: "left", clickCount: 1 });
    await this.mouse("mouseReleased", x, y, { button: "left", clickCount: 1 });
    await this.mouse("mousePressed", x, y, { button: "left", clickCount: 2 });
    await this.mouse("mouseReleased", x, y, { button: "left", clickCount: 2 });
    await this.waitForStability();
  }

  async rightClick({ x, y }: { x: number; y: number }): Promise<void> {
    await this.mouse("mouseMoved", x, y);
    await this.mouse("mousePressed", x, y, { button: "right", clickCount: 1 });
    await this.mouse("mouseReleased", x, y, { button: "right", clickCount: 1 });
    await this.waitForStability();
  }

  async drag({
    x1,
    y1,
    x2,
    y2,
  }: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  }): Promise<void> {
    await this.mouse("mouseMoved", x1, y1);
    await this.mouse("mousePressed", x1, y1, { button: "left", clickCount: 1 });
    await this.mouse("mouseMoved", x2, y2, { button: "left", buttons: 1 });
    await this.mouse("mouseReleased", x2, y2, { button: "left", clickCount: 1 });
    await this.waitForStability();
  }

  async scroll({
    x,
    y,
    deltaX,
    deltaY,
  }: {
    x: number;
    y: number;
    deltaX: number;
    deltaY: number;
  }): Promise<void> {
    await this.mouse("mouseMoved", x, y);
    await this.mouse("mouseWheel", x, y, { deltaX, deltaY });
    await this.waitForStability();
  }

  private async key(
    input: KeyInput,
    type: "keyDown" | "keyUp" | "rawKeyDown",
    modifiers: number,
  ): Promise<void> {
    const params: Record<string, unknown> = {
      type,
      modifiers,
      windowsVirtualKeyCode: input.keyCode,
      code: input.code,
      key: input.key,
    };
    if (type === "keyDown" && input.text) params.text = input.text;
    await sendCommand(this.activeTabId, "Input.dispatchKeyEvent", params);
  }

  private async pressChar(char: string): Promise<void> {
    const input = charToKeyInput(char);
    const modifiers = input.shift ? 8 : 0;
    await this.key(input, "keyDown", modifiers);
    await this.key(input, "keyUp", modifiers);
  }

  private async pressKey(input: KeyInput): Promise<void> {
    await this.key(input, "keyDown", 0);
    await this.key(input, "keyUp", 0);
  }

  private async typeContent(content: string): Promise<void> {
    const chunks = parseTypeContent(content);
    let totalTextLength = 0;
    for (const chunk of chunks) {
      if (chunk !== "<enter>" && chunk !== "<tab>") totalTextLength += chunk.length;
    }
    for (const chunk of chunks) {
      if (chunk === "<enter>") {
        await this.pressKey(NAMED_KEYS.enter);
      } else if (chunk === "<tab>") {
        await this.pressKey(NAMED_KEYS.tab);
      } else {
        const charDelay =
          totalTextLength > 0
            ? (TOTAL_TYPING_DELAY_MS * (chunk.length / totalTextLength)) /
              chunk.length
            : 0;
        for (const char of chunk) {
          await this.pressChar(char);
          if (charDelay > 0) await sleep(charDelay);
        }
      }
    }
  }

  async type({ content }: { content: string }): Promise<void> {
    await this.typeContent(content);
    await this.waitForStability();
  }

  async clickAndType({
    x,
    y,
    content,
  }: {
    x: number;
    y: number;
    content: string;
  }): Promise<void> {
    await this.click({ x, y });
    await this.typeContent(content);
    await this.waitForStability();
  }

  async enter(): Promise<void> {
    await this.pressKey(NAMED_KEYS.enter);
  }

  async tab(): Promise<void> {
    await this.pressKey(NAMED_KEYS.tab);
  }

  async backspace(): Promise<void> {
    await this.pressKey(NAMED_KEYS.backspace);
  }

  async selectAll(): Promise<void> {
    const modifiers = isMac ? 4 : 2;
    const modKey: KeyInput = isMac
      ? { key: "Meta", code: "MetaLeft", keyCode: 91, shift: false }
      : { key: "Control", code: "ControlLeft", keyCode: 17, shift: false };
    const a = charToKeyInput("a");
    await this.key(modKey, "rawKeyDown", modifiers);
    await this.key(a, "rawKeyDown", modifiers);
    await this.key(a, "keyUp", modifiers);
    await this.key(modKey, "keyUp", 0);
  }

  async switchTab({ index }: { index: number }): Promise<void> {
    const active = await chrome.tabs.get(this.activeTabId);
    const tabs = await chrome.tabs.query({ windowId: active.windowId });
    const target = tabs.find((t) => t.index === index);
    if (!target?.id) throw new Error(`No tab at index ${index}`);
    this.activeTabId = target.id;
    await chrome.tabs.update(target.id, { active: true });
    await this.ensureAttached(target.id);
    await this.waitForStability();
  }

  async newTab(): Promise<void> {
    const tab = await chrome.tabs.create({
      url: "https://www.google.com",
      active: true,
    });
    if (!tab.id) throw new Error("Failed to open new tab");
    this.activeTabId = tab.id;
    await this.ensureAttached(tab.id);
    await this.waitForStability();
  }

  async navigate(url: string): Promise<void> {
    await chrome.tabs.update(this.activeTabId, { url });
    await this.waitForStability();
  }

  async goBack(): Promise<void> {
    await chrome.tabs.goBack(this.activeTabId);
    await this.waitForStability();
  }

  async executeAction(action: WebAction): Promise<void> {
    switch (action.variant) {
      case "load":
        await this.navigate(action.url);
        break;
      case "click":
        await this.click({ x: action.x, y: action.y });
        break;
      case "type":
        await this.clickAndType({ x: action.x, y: action.y, content: action.content });
        break;
      case "scroll":
        await this.scroll({
          x: action.x,
          y: action.y,
          deltaX: action.deltaX,
          deltaY: action.deltaY,
        });
        break;
      case "tab":
        await this.switchTab({ index: action.index });
        break;
    }
  }

  async waitForStability(timeout = STABILITY_TIMEOUT_MS): Promise<void> {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      let ready: string | undefined;
      try {
        ready = await this.evaluate<string>("document.readyState");
      } catch {
        // Execution context is torn down mid-navigation; keep polling until it returns.
        ready = undefined;
      }
      if (ready === "complete") break;
      await sleep(100);
    }
    await sleep(SETTLE_MS);
  }
}
