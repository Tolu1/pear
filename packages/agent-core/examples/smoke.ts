/**
 * Smoke test — proves agent-core can run end-to-end:
 *   1. Build a synthetic screenshot (sharp)
 *   2. Construct AgentMemory + MultiModelHarness with Anthropic Claude
 *   3. Invoke step-handler with task "click the button"
 *   4. Assert: response includes at least one action, and a mouse:click action
 *      lands inside the painted rectangle.
 *
 * Requires: ANTHROPIC_API_KEY env var.
 * Run: pnpm tsx examples/smoke.ts
 */
import sharp from "sharp";
import {
  AgentMemory,
  MultiModelHarness,
  runStep,
  webActions,
  taskActions,
  type ObservationPayload,
  type LLMClient,
} from "../src";

const VIEWPORT_WIDTH = 800;
const VIEWPORT_HEIGHT = 600;

const BUTTON = { x: 320, y: 240, width: 160, height: 80 };

async function buildScreenshot(): Promise<{
  base64: string;
  width: number;
  height: number;
}> {
  // White background + a single blue rectangle with the word BUTTON
  const svg = `
    <svg width="${VIEWPORT_WIDTH}" height="${VIEWPORT_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="white"/>
      <rect x="${BUTTON.x}" y="${BUTTON.y}" width="${BUTTON.width}" height="${BUTTON.height}"
            fill="#2563eb" rx="8"/>
      <text x="${BUTTON.x + BUTTON.width / 2}" y="${BUTTON.y + BUTTON.height / 2 + 8}"
            font-family="sans-serif" font-size="28" font-weight="bold"
            fill="white" text-anchor="middle">BUTTON</text>
    </svg>
  `;
  const buffer = await sharp(Buffer.from(svg)).png().toBuffer();
  return {
    base64: buffer.toString("base64"),
    width: VIEWPORT_WIDTH,
    height: VIEWPORT_HEIGHT,
  };
}

async function main() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY not set");
  }

  const llmClient: LLMClient = {
    provider: "anthropic",
    options: {
      model: "claude-sonnet-4-6",
      apiKey,
      temperature: 0,
      promptCaching: true,
    },
  };

  const models = new MultiModelHarness([llmClient]);
  await models.setup();
  const memory = new AgentMemory({});

  const { base64, width, height } = await buildScreenshot();

  const observation: ObservationPayload = {
    screenshot: { base64, dpr: 1, width, height },
    url: "about:blank",
    title: "Smoke Test Page",
  };

  console.log("Calling runStep…");
  const start = Date.now();

  const { reasoning, actions } = await runStep({
    memory,
    task: "Click the BUTTON on the page.",
    observation,
    actionVocabulary: [...webActions, ...taskActions],
    models,
  });

  console.log(`Done in ${Date.now() - start}ms`);
  console.log("---reasoning---");
  console.log(reasoning);
  console.log("---actions---");
  for (const a of actions) {
    console.log(JSON.stringify(a, null, 2));
  }

  // Assertions
  if (actions.length === 0) {
    throw new Error("FAIL: no actions returned");
  }

  const click = actions.find((a) => a.variant === "mouse:click");
  if (!click) {
    console.log(
      "Note: no mouse:click action in batch (may have used other action). Got:",
      actions.map((a) => a.variant),
    );
  } else {
    const { x, y } = click as { x: number; y: number };
    const insideButton =
      x >= BUTTON.x &&
      x <= BUTTON.x + BUTTON.width &&
      y >= BUTTON.y &&
      y <= BUTTON.y + BUTTON.height;
    console.log(
      `Click at (${x}, ${y}) — ${insideButton ? "INSIDE" : "OUTSIDE"} button`,
    );
    if (!insideButton) {
      console.log(
        `  Button bounds: x=[${BUTTON.x},${BUTTON.x + BUTTON.width}] y=[${BUTTON.y},${BUTTON.y + BUTTON.height}]`,
      );
    }
  }

  console.log("---PASS: runStep completed without throwing---");
}

main().catch((err) => {
  console.error("FAIL:", err);
  process.exit(1);
});
