export interface KeyInput {
  key: string;
  code: string;
  keyCode: number;
  text?: string;
  shift: boolean;
}

const DEBUGGER_PROTOCOL_VERSION = "1.3";

export function attachDebugger(tabId: number): Promise<void> {
  return new Promise((resolve, reject) => {
    chrome.debugger.attach({ tabId }, DEBUGGER_PROTOCOL_VERSION, () => {
      const err = chrome.runtime.lastError;
      // Re-attaching an already-attached tab is not a failure for our purposes.
      if (err && !err.message?.includes("Already attached")) {
        reject(new Error(err.message));
        return;
      }
      resolve();
    });
  });
}

export function detachDebugger(tabId: number): Promise<void> {
  return new Promise((resolve) => {
    chrome.debugger.detach({ tabId }, () => {
      void chrome.runtime.lastError;
      resolve();
    });
  });
}

export function sendCommand<R = unknown>(
  tabId: number,
  method: string,
  params?: Record<string, unknown>,
): Promise<R> {
  return new Promise((resolve, reject) => {
    chrome.debugger.sendCommand({ tabId }, method, params ?? {}, (result) => {
      const err = chrome.runtime.lastError;
      if (err) {
        reject(new Error(`${method}: ${err.message}`));
        return;
      }
      resolve(result as R);
    });
  });
}

export const NAMED_KEYS = {
  enter: { key: "Enter", code: "Enter", keyCode: 13, text: "\r", shift: false },
  tab: { key: "Tab", code: "Tab", keyCode: 9, shift: false },
  backspace: { key: "Backspace", code: "Backspace", keyCode: 8, shift: false },
} satisfies Record<string, KeyInput>;

// US keyboard layout: chars reachable via Shift, mapped to the physical key
// that produces them. keyCode is the unshifted key's virtual code (Chromium /
// puppeteer convention) so on-page handlers reading event.keyCode behave.
const SHIFTED: Record<string, { code: string; keyCode: number }> = {
  "!": { code: "Digit1", keyCode: 49 },
  "@": { code: "Digit2", keyCode: 50 },
  "#": { code: "Digit3", keyCode: 51 },
  $: { code: "Digit4", keyCode: 52 },
  "%": { code: "Digit5", keyCode: 53 },
  "^": { code: "Digit6", keyCode: 54 },
  "&": { code: "Digit7", keyCode: 55 },
  "*": { code: "Digit8", keyCode: 56 },
  "(": { code: "Digit9", keyCode: 57 },
  ")": { code: "Digit0", keyCode: 48 },
  _: { code: "Minus", keyCode: 189 },
  "+": { code: "Equal", keyCode: 187 },
  "{": { code: "BracketLeft", keyCode: 219 },
  "}": { code: "BracketRight", keyCode: 221 },
  "|": { code: "Backslash", keyCode: 220 },
  ":": { code: "Semicolon", keyCode: 186 },
  '"': { code: "Quote", keyCode: 222 },
  "<": { code: "Comma", keyCode: 188 },
  ">": { code: "Period", keyCode: 190 },
  "?": { code: "Slash", keyCode: 191 },
  "~": { code: "Backquote", keyCode: 192 },
};

const UNSHIFTED: Record<string, { code: string; keyCode: number }> = {
  "-": { code: "Minus", keyCode: 189 },
  "=": { code: "Equal", keyCode: 187 },
  "[": { code: "BracketLeft", keyCode: 219 },
  "]": { code: "BracketRight", keyCode: 221 },
  "\\": { code: "Backslash", keyCode: 220 },
  ";": { code: "Semicolon", keyCode: 186 },
  "'": { code: "Quote", keyCode: 222 },
  ",": { code: "Comma", keyCode: 188 },
  ".": { code: "Period", keyCode: 190 },
  "/": { code: "Slash", keyCode: 191 },
  "`": { code: "Backquote", keyCode: 192 },
  " ": { code: "Space", keyCode: 32 },
};

export function charToKeyInput(char: string): KeyInput {
  if (char >= "a" && char <= "z") {
    return {
      key: char,
      code: `Key${char.toUpperCase()}`,
      keyCode: char.toUpperCase().charCodeAt(0),
      text: char,
      shift: false,
    };
  }
  if (char >= "A" && char <= "Z") {
    return {
      key: char,
      code: `Key${char}`,
      keyCode: char.charCodeAt(0),
      text: char,
      shift: true,
    };
  }
  if (char >= "0" && char <= "9") {
    return {
      key: char,
      code: `Digit${char}`,
      keyCode: char.charCodeAt(0),
      text: char,
      shift: false,
    };
  }
  const shifted = SHIFTED[char];
  if (shifted) {
    return { key: char, code: shifted.code, keyCode: shifted.keyCode, text: char, shift: true };
  }
  const unshifted = UNSHIFTED[char];
  if (unshifted) {
    return { key: char, code: unshifted.code, keyCode: unshifted.keyCode, text: char, shift: false };
  }
  // Unknown / non-ASCII: still inserts via text on keyDown.
  return { key: char, code: "", keyCode: 0, text: char, shift: false };
}
