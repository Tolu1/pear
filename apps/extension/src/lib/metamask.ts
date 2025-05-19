import {
  createExternalExtensionProvider,
  eip6963AnnounceProvider,
} from "@metamask/providers";

const METAMASK_EXTENSION_IDS = {
  CHROME: "nkbihfbeogaeaoehlefnkodbefgpgknn",
  FIREFOX: "webextension@metamask.io",
};

function getMetaMaskExtensionId(): string {
  return navigator.userAgent.includes("Firefox")
    ? METAMASK_EXTENSION_IDS.FIREFOX
    : METAMASK_EXTENSION_IDS.CHROME;
}

export async function setupMetaMaskProvider() {
  try {
    const provider = createExternalExtensionProvider(getMetaMaskExtensionId());

    eip6963AnnounceProvider({
      provider,
      info: {
        name: "MetaMask",
        uuid: crypto.randomUUID(),
        icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"/>',
        rdns: "eth.pear.metamask",
      },
    });

    return { success: true, provider };
  } catch (error) {
    console.error("MetaMask provider setup failed:", error);
    return { success: false, error };
  }
}
