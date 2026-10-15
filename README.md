# Every checkout on the internet now accepts stablecoins.

Pear turns any checkout, in every nook and cranny of the internet, into one that takes USDC. You pay from your wallet, and Pear's agent completes the purchase. The merchant never has to integrate anything.

Backed by [Forbes Family Group](https://forbesfamilygroup.com) and [Cornerstone VC](https://www.cornerstonevc.co).

**[Watch the demo](https://youtu.be/sAAxdKbe9n8)** · [pearextension.com](https://pearextension.com)

## How it works

1. You land on a checkout or payment page, and open Pear.
2. Pear quotes the total in USDC and you approve one transfer from your wallet.
3. Pear verifies the transfer on chain and funds a one-time card for exactly that purchase.
4. Pear's agent fills in the card and billing details and places the order.

## Pear on Arc

**USDC on Arc can now be spent anywhere on the internet.**

Every website that takes cards, from a donation page to an online store, becomes a place to spend Arc USDC, and the merchant never has to know Arc exists. Each purchase is a real USDC payment on Arc mainnet, [like this one](https://explorer.arc.io/tx/0x0bf649cf82cbc3c29ebc1a673c1d3f9261da7003baa359d129007c25da188170) from the demo.

## Try it

You need Chrome and $1 of USDC on Arc. Don't have it? [Request $1 here](https://forms.gle/4YmdCJ5kjQWbDb7Q9).

1. [Download Pear](https://pear-extension-downloads.s3.eu-central-1.amazonaws.com/pear-extension-v0.2.0-beta.zip) and unzip it.
2. Open `chrome://extensions`, turn on **Developer mode**, click **Load unpacked** and pick the folder.
3. Open the [Mozilla Foundation donate page](https://www.mozillafoundation.org/en/donate/), enter $1 and continue to the card details.
4. Open Pear, connect your wallet, click **Refresh**, then **Pay**.
5. Approve the transfer in your wallet. Pear's agent fills in the card and completes the donation.

## Architecture

| Path | What it does |
| --- | --- |
| `apps/extension` | Chrome extension, wallet and payment |
| `apps/backend` | Payments, verification and cards |
| `apps/ai` | Agent server that completes checkout |
| `packages/agent-core` | Shared browser agent library |
| `apps/web` | pearextension.com |
