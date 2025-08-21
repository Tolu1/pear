const { chromium } = require("playwright");

async function testPushDownStrategy() {
  console.log("Testing push content down strategy...");

  const browser = await chromium.launch({ headless: true });

  try {
    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 },
    });
    const page = await context.newPage();

    await page.setContent(`
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { margin: 0; padding: 0; }
          .payment-form { background: #f0f0f0; padding: 20px; margin: 20px; border: 1px solid #ccc; }
          .button { background: blue; color: white; padding: 10px 20px; border: none; }
        </style>
      </head>
      <body>
        <h1 style="margin: 20px;">Payment Page Content</h1>
        <div class="payment-form">
          <h2>Payment Details</h2>
          <input type="text" placeholder="Card Number" style="display: block; margin: 5px 0; padding: 8px;" />
          <input type="text" placeholder="CVV" style="display: block; margin: 5px 0; padding: 8px;" />
          <button class="button">Pay Now</button>
        </div>
        <p style="margin: 20px;">More content here that should be hidden from user but visible to AI</p>
      </body>
      </html>
    `);

    console.log("1. Original page screenshot");
    await page.screenshot({ path: "1-original.png" });

    console.log("2. Implementing push-down strategy");
    await page.evaluate(() => {
      // Get viewport dimensions dynamically
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      // Disable scrolling
      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";

      // Wrap all existing content in a container
      const originalContent = document.body.innerHTML;
      document.body.innerHTML = "";

      // Create overlay that takes up the viewport space
      const overlay = document.createElement("div");
      overlay.id = "pear-overlay";
      overlay.innerHTML = `
        <div style="text-align: center; color: white;">
          <h2>🍐 Processing Payment...</h2>
          <div style="border: 4px solid white; border-top: 4px solid transparent; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin: 20px auto;"></div>
        </div>
      `;
      overlay.style.cssText = `
        width: ${viewportWidth}px;
        height: ${viewportHeight}px;
        background: rgba(0, 0, 0, 0.9);
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        z-index: 1;
      `;

      // Create content container that is EXACTLY viewport sized
      const contentContainer = document.createElement("div");
      contentContainer.id = "hidden-content";
      contentContainer.innerHTML = originalContent;
      contentContainer.style.cssText = `
        width: ${viewportWidth}px;
        height: ${viewportHeight}px;
        background: white;
        overflow: auto;
        position: relative;
        box-sizing: border-box;
      `;

      // Add spinner animation
      const style = document.createElement("style");
      style.textContent =
        "@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }";
      document.head.appendChild(style);

      // Add both: overlay first (visible), then content container (hidden below)
      document.body.appendChild(overlay);
      document.body.appendChild(contentContainer);
    });

    console.log("3. User view (what they see in viewport)");
    await page.screenshot({ path: "2-user-view.png" });

    console.log(
      "4. Full page screenshot (should show overlay + content below)",
    );
    await page.screenshot({
      path: "3-full-page.png",
      fullPage: true,
    });

    console.log(
      "5. Get page dimensions and screenshot the hidden content area",
    );
    const { viewportWidth, viewportHeight, bodyHeight } = await page.evaluate(
      () => ({
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
        bodyHeight: document.body.scrollHeight,
      }),
    );

    console.log(`Viewport: ${viewportWidth}x${viewportHeight}`);
    console.log(`Total body height: ${bodyHeight}px`);
    console.log(`Content should start at: ${viewportHeight}px`);

    if (bodyHeight > viewportHeight) {
      const contentHeight = bodyHeight - viewportHeight;
      console.log(`Hidden content height: ${contentHeight}px`);

      // Use fullPage: true and then clip from the full page
      await page.screenshot({
        path: "4-ai-view.png",
        fullPage: true,
        clip: {
          x: 0,
          y: viewportHeight,
          width: viewportWidth,
          height: viewportHeight,
        }, // Use viewport height for AI
      });
    } else {
      console.log(
        "Warning: No content below viewport - overlay might not have pushed content down properly",
      );
      // Take a full page screenshot instead
      await page.screenshot({
        path: "4-ai-view.png",
        fullPage: true,
      });
    }

    console.log("6. Testing if we can interact with hidden content");
    const inputExists = await page
      .locator('#hidden-content input[placeholder="Card Number"]')
      .isVisible();
    console.log("Hidden input accessible:", inputExists);

    // Try to fill the hidden input
    await page.fill(
      '#hidden-content input[placeholder="Card Number"]',
      "4111 1111 1111 1111",
    );
    console.log("Successfully filled hidden input");

    console.log(
      "7. Screenshot after interaction (AI should see the filled form)",
    );
    const { newViewportWidth, newViewportHeight, newBodyHeight } =
      await page.evaluate(() => ({
        newViewportWidth: window.innerWidth,
        newViewportHeight: window.innerHeight,
        newBodyHeight: document.body.scrollHeight,
      }));

    if (newBodyHeight > newViewportHeight) {
      await page.screenshot({
        path: "5-ai-view-after-fill.png",
        fullPage: true,
        clip: {
          x: 0,
          y: newViewportHeight,
          width: newViewportWidth,
          height: newViewportHeight,
        },
      });
    } else {
      await page.screenshot({
        path: "5-ai-view-after-fill.png",
        fullPage: true,
      });
    }

    console.log("8. Test summary");
    console.log(`Final body height: ${newBodyHeight}px`);

    console.log("\nStrategy Results:");
    console.log("- 2-user-view.png: What user sees (just overlay)");
    console.log("- 4-ai-view.png: What AI sees (clean content)");
    console.log("- 5-ai-view-after-fill.png: AI sees form interactions");
    console.log("- Content is accessible for automation but hidden from user!");
  } catch (error) {
    console.error("Error:", error);
  }

  await browser.close();
}

testPushDownStrategy();
