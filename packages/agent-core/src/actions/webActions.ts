import { createAction } from ".";
import { z } from "zod";

export const clickCoordAction = createAction({
    name: 'mouse:click',
    description: "Click something",
    schema: z.object({
        x: z.number().int(),
        y: z.number().int(),
    }),
    render: ({ x, y }) => `⊙ click (${x}, ${y})`
});

export const mouseDoubleClickAction = createAction({
    name: 'mouse:double_click',
    schema: z.object({
        x: z.number().int(),
        y: z.number().int(),
    }),
    render: ({ x, y }) => `⊙ double click (${x}, ${y})`
});

export const mouseRightClickAction = createAction({
    name: 'mouse:right_click',
    schema: z.object({
        x: z.number().int(),
        y: z.number().int(),
    }),
    render: ({ x, y }) => `⊙ right click (${x}, ${y})`
});

export const mouseDragAction = createAction({
    name: 'mouse:drag',
    description: "Click and hold mouse in one location and release in another",
    schema: z.object({
        from: z.object({ x: z.number().int(), y: z.number().int() }),
        to: z.object({ x: z.number().int(), y: z.number().int() })
    }),
    render: ({ from, to }) => `⤡ drag (${from.x}, ${from.y}) -> (${to.x}, ${to.y})`
});

export const typeAction = createAction({
    name: 'keyboard:type',
    description: "Make sure to click where you need to type first",
    schema: z.object({
        content: z.string().describe("Content to type"),
    }),
    render: ({ content }) => `⌨︎ type "${content}"`
});

export const keyboardEnterAction = createAction({
    name: 'keyboard:enter',
    render: () => `⏎ press enter`
});

export const keyboardTabAction = createAction({
    name: 'keyboard:tab',
    render: () => `⇥ press tab`
});

export const keyboardBackspaceAction = createAction({
    name: 'keyboard:backspace',
    render: () => `⌫ press backspace`
});

export const keyboardSelectAllAction = createAction({
    name: 'keyboard:select_all',
    description: "Select all content in the active text area (CTRL+A)",
    render: () => `⬚ select all`
});

export const scrollCoordAction = createAction({
    name: 'mouse:scroll',
    description: "Hover mouse over target and scroll",
    schema: z.object({
        x: z.number().int(),
        y: z.number().int(),
        deltaX: z.number().int().describe("Pixels to scroll horizontally"),
        deltaY: z.number().int().describe("Pixels to scroll vertically"),
    }),
    render: ({ x, y, deltaX, deltaY }) => `↕ scroll (${deltaX}px, ${deltaY}px)`
});

export const switchTabAction = createAction({
    name: 'browser:tab:switch',
    description: "Switch to a tab that is already open",
    schema: z.object({
        index: z.number().int().describe("Index of tab to switch to"),
    }),
    render: ({ index }) => `⧉ switch to tab ${index}`
});

export const newTabAction = createAction({
    name: 'browser:tab:new',
    description: "Open and switch to a new tab",
    schema: z.object({}),
    render: () => `⊞ open new tab`
});

export const navigateAction = createAction({
    name: 'browser:nav',
    description: "Navigate to a URL directly",
    schema: z.object({
        url: z.string().describe('URL to navigate to'),
    }),
    render: ({ url }) => `⛓︎ navigate to ${url}`
});

export const goBackAction = createAction({
    name: 'browser:nav:back',
    description: "Go back",
    schema: z.object({}),
    render: () => `← navigate back`
});

export const waitAction = createAction({
    name: 'wait',
    description: "Actions include smart waiting automatically - so only use this when a significant additional wait is clearly required.",
    schema: z.object({
        seconds: z.number()
    }),
    render: ({ seconds }) => `◴ wait for ${seconds}s`
});

export const webActions = [
    clickCoordAction,
    mouseDoubleClickAction,
    mouseRightClickAction,
    scrollCoordAction,
    mouseDragAction,
    newTabAction,
    switchTabAction,
    navigateAction,
    typeAction,
    keyboardEnterAction,
    keyboardTabAction,
    keyboardBackspaceAction,
    keyboardSelectAllAction,
    waitAction,
] as const;
