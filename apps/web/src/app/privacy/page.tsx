import type { Metadata } from "next";
import Wave from "@/components/wave";

export const metadata: Metadata = {
  title: "Pear | Privacy Policy",
  description:
    "Learn about Pear's commitment to user privacy and data protection. Our Privacy Policy outlines how we collect, use, and safeguard your information when you use our browser extension.",
};

export default function Page() {
  return (
    <main className="flex flex-1 flex-col items-center justify-between rounded-t-[24px] border-x-1 border-t-1 border-black bg-white bg-linear-to-b from-[#BE910B]/20 to-[#FFF8D4]/20 pt-6">
      <article className="flex w-full max-w-[616px] flex-col">
        <header className="flex flex-col items-center gap-2 pt-[64px] pb-[40px] text-center md:pt-[80px] md:pb-[48px]">
          <h1
            className="font-melody text-[40px] leading-[40px] tracking-[-0.02em] text-[#0E140E] md:text-[64px] md:leading-[64px]"
            style={{ WebkitTextStroke: "0.5px #0E140E" }}
          >
            PRIVACY POLICY
          </h1>
          <div className="flex flex-col items-center gap-3 md:gap-4">
            <p className="leading-[18px] tracking-[-0.08em] text-black/50">
              Last updated April 12, 2026
            </p>
            <div className="flex w-6 justify-between">
              <div className="h-1 w-1 rounded-full bg-[#0E140E]/45" />
              <div className="h-1 w-1 rounded-full bg-[#0E140E]/45" />
              <div className="h-1 w-1 rounded-full bg-[#0E140E]/45" />
            </div>
          </div>
        </header>

        <div className="flex w-full flex-col gap-12 px-6 md:px-0">
          <p className="text-[22px] leading-[22px] tracking-[-0.04em] text-black">
            Pear provides a browser extension that completes online purchases
            using stablecoins from your connected crypto wallet. This Privacy
            Policy explains how we collect, use, and protect information when
            you use the Pear browser extension.
          </p>

          <section className="flex flex-col gap-2">
            <h2
              className="pb-2 text-[24px] leading-[24px] tracking-[-0.04em] text-[#0E140E] md:text-[32px] md:leading-[32px]"
              style={{ WebkitTextStroke: "0.5px #0E140E" }}
            >
              1. What We Collect and How We Use It
            </h2>
            <p className="text-[22px] leading-[22px] tracking-[-0.04em] text-black">
              We collect data only when you actively interact with the Extension
              on a supported checkout page. This includes a screenshot of the
              visible browser tab, the HTML content and viewport dimensions of
              the active tab, and the URL of the page where you initiated the
              Extension.
            </p>
            <p className="text-[22px] leading-[22px] tracking-[-0.04em] text-black">
              This data is sent to Pear&apos;s servers solely to detect payment
              forms and generate the actions needed to complete your purchase.
              Data is processed in real time during your active session. We do
              not collect data passively, in the background, or on pages where
              you have not activated the Extension.
            </p>
            <p className="text-[22px] leading-[22px] tracking-[-0.04em] text-black">
              We do not use your data for advertising, profiling, analytics, or
              any purpose other than powering the checkout experience.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2
              className="pb-2 text-[24px] leading-[24px] tracking-[-0.04em] text-[#0E140E] md:text-[32px] md:leading-[32px]"
              style={{ WebkitTextStroke: "0.5px #0E140E" }}
            >
              2. Information We Do Not Collect
            </h2>
            <p className="text-[22px] leading-[22px] tracking-[-0.04em] text-black">
              We do not collect, access, or store personally identifiable
              information (name, email, physical address), financial or payment
              information (credit card numbers, bank account details), wallet
              private keys, seed phrases, or authentication credentials. We also
              do not collect browsing history beyond the current active tab,
              location or geolocation data, or keystrokes, mouse movements, or
              other input behavior.
            </p>
            <p className="text-[22px] leading-[22px] tracking-[-0.04em] text-black">
              The Extension is not directed at children under the age of 13. We
              do not knowingly collect information from children.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2
              className="pb-2 text-[24px] leading-[24px] tracking-[-0.04em] text-[#0E140E] md:text-[32px] md:leading-[32px]"
              style={{ WebkitTextStroke: "0.5px #0E140E" }}
            >
              3. Data Retention and Security
            </h2>
            <p className="text-[22px] leading-[22px] tracking-[-0.04em] text-black">
              We do not persistently store screenshots, page content, or URLs.
              All session data is discarded once your checkout session ends. We
              do not maintain databases of user activity or browsing behavior.
              We do not sell, rent, trade, or otherwise transfer your data to
              third parties, advertisers, data brokers, or analytics providers.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2
              className="pb-2 text-[24px] leading-[24px] tracking-[-0.04em] text-[#0E140E] md:text-[32px] md:leading-[32px]"
              style={{ WebkitTextStroke: "0.5px #0E140E" }}
            >
              4. Rights
            </h2>
            <p className="text-[22px] leading-[22px] tracking-[-0.04em] text-black">
              Depending on your jurisdiction, you may have the right to request
              information about or deletion of data related to your use of the
              Extension. Because we do not retain session data or maintain user
              accounts, there is generally no stored data to access or delete.
            </p>
            <p className="text-[22px] leading-[22px] tracking-[-0.04em] text-black">
              We may update this Privacy Policy as the Extension evolves.
              Changes will be reflected by updating the &quot;Last updated&quot;
              date at the top of this page. Continued use of the Extension after
              changes constitutes acceptance of the revised policy.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2
              className="pb-2 text-[24px] leading-[24px] tracking-[-0.04em] text-[#0E140E] md:text-[32px] md:leading-[32px]"
              style={{ WebkitTextStroke: "0.5px #0E140E" }}
            >
              5. Contact Us
            </h2>
            <p className="text-[22px] leading-[22px] tracking-[-0.04em] text-black">
              If you have questions or concerns about this Privacy Policy,
              contact us at{" "}
              <a href="mailto:founders@pearextension.com">
                founders@pearextension.com
              </a>
              .
            </p>
          </section>
        </div>
      </article>
      <div className="pt-24" />
      <Wave />
    </main>
  );
}
