export interface Instruction {
  type: "click" | "fill";
  selector: string;
  value?: string;
}

export interface ExecutionResult {
  success: boolean;
  error?: string;
}

export class DOMExecutor {
  async execute(instruction: Instruction): Promise<ExecutionResult> {
    try {
      console.log("Executing instruction:", instruction);
      console.log("Document ", document);

      const selector = "#cc-number";
      const element = document.querySelector(selector);
      console.log("element ", element);
      if (!element) {
        throw new Error(`Element not found: ${selector}`);
      }

      // switch (instruction.type) {
      //   case "click": {
      //     const element = document.querySelector(
      //       instruction.selector
      //     ) as HTMLElement;
      //     if (!element) {
      //       throw new Error(`Element not found: ${instruction.selector}`);
      //     }
      //     element.click();
      //     break;
      //   }
      //   case "fill": {
      //     const element = document.querySelector("#number") as
      //       | HTMLInputElement
      //       | HTMLSelectElement;
      //     if (!element) {
      //       throw new Error(`Element not found: ${instruction.selector}`);
      //     }
      //     element.value = instruction.value!;
      //     element.dispatchEvent(new Event("change", { bubbles: true }));
      //     break;
      //   }
      //   default:
      //     throw new Error(`Unknown instruction type: ${instruction.type}`);
      // }

      return { success: true };
    } catch (error) {
      console.error("Instruction execution failed:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
}

// class DebuggerExecutor {
//   async execute(instruction: Instruction) {
//     // Attach debugger
//     await chrome.debugger.attach({ tabId }, "1.3");

//     // Send actual mouse/keyboard events
//     if (instruction.type === "click") {
//       await chrome.debugger.sendCommand({ tabId }, "Input.dispatchMouseEvent", {
//         type: "mousePressed",
//         x: elementX,
//         y: elementY,
//         button: "left",
//       });
//     }

//     if (instruction.type === "fill") {
//       await chrome.debugger.sendCommand({ tabId }, "Input.dispatchKeyEvent", {
//         type: "keyDown",
//         text: instruction.value,
//       });
//     }
//   }
// }
