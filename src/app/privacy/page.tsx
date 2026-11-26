import type { Metadata } from "next";

import { LegalPage } from "@/components/legal-page";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: `Privacy Policy — ${site.name}`,
  description:
    "How VideoDrop handles your data: what we collect, how cookies and advertising work, and the choices you have.",
};

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1">
        <LegalPage
          title="Privacy Policy"
          intro={`This policy explains what information ${site.name} collects when you use the site, why we collect it, and the choices you have.`}
        >
          <h2>Information we collect</h2>
          <p>
            {site.name} does not require an account. We do not ask for your
            Instagram or Facebook password, and we never access private
            accounts.
          </p>
          <ul>
            <li>
              <strong>Post links you submit.</strong> The URL you paste is sent
              to our servers so we can fetch the public media. It is processed
              in memory and is not stored in a database.
            </li>
            <li>
              <strong>Technical data.</strong> Like most websites, our hosting
              provider may record standard request logs such as your IP address,
              browser type, referring page and timestamps for security and
              abuse prevention.
            </li>
            <li>
              <strong>Local storage.</strong> We may store small preferences,
              such as your light or dark theme choice, in your browser.
            </li>
          </ul>

          <h2>How we use information</h2>
          <ul>
            <li>To fetch and deliver the public media you request.</li>
            <li>To protect the service from abuse, spam and automated attacks.</li>
            <li>To understand aggregate usage so we can improve the site.</li>
          </ul>

          <h2>Cookies and advertising</h2>
          <p>
            We may display advertising to keep {site.name} free. When advertising
            is enabled, third-party vendors — including Google — may use cookies
            to serve ads based on your prior visits to this and other websites.
          </p>
          <ul>
            <li>
              Google&apos;s use of advertising cookies enables it and its
              partners to serve ads to you based on your visit to this site
              and/or other sites on the internet.
            </li>
            <li>
              You may opt out of personalised advertising by visiting{" "}
              <a
                href="https://www.google.com/settings/ads"
                target="_blank"
                rel="noopener noreferrer"
              >
                Google Ads Settings
              </a>
              .
            </li>
            <li>
              You can also opt out of third-party vendors&apos; use of cookies
              for personalised advertising at{" "}
              <a
                href="https://www.aboutads.info/choices/"
                target="_blank"
                rel="noopener noreferrer"
              >
                aboutads.info
              </a>
              .
            </li>
            <li>
              For more detail, see{" "}
              <a
                href="https://policies.google.com/technologies/partner-sites"
                target="_blank"
                rel="noopener noreferrer"
              >
                How Google uses information from sites that use its services
              </a>
              .
            </li>
          </ul>

          <h2>Reward ads</h2>
          <p>
            Downloads are unlocked by watching a short ad. The ad player may be
            provided by a third-party advertising network, which may set its own
            cookies and collect data under its own privacy policy. We do not
            receive your personal information from these partners.
          </p>

          <h2>Third-party content</h2>
          <p>
            Media you download is hosted by Instagram or Facebook. Your use of
            those platforms is governed by their own privacy policies.{" "}
            {site.name} is not affiliated with, endorsed by, or sponsored by
            Meta Platforms.
          </p>

          <h2>Data retention and security</h2>
          <p>
            We keep submitted links only for as long as needed to process your
            request. We use HTTPS and server-side safeguards, but no method of
            transmission over the internet is completely secure.
          </p>

          <h2>Children&apos;s privacy</h2>
          <p>
            {site.name} is not directed to children under 13, and we do not
            knowingly collect personal information from them.
          </p>

          <h2>Your rights</h2>
          <p>
            Depending on where you live, you may have the right to access,
            correct or delete personal data we hold about you, or to object to
            certain processing. To make a request, contact us at{" "}
            <a href={`mailto:${site.email}`}>{site.email}</a>.
          </p>

          <h2>Changes to this policy</h2>
          <p>
            We may update this policy from time to time. Material changes will be
            reflected in the &quot;last updated&quot; date above.
          </p>

          <h2>Contact</h2>
          <p>
            Questions about this policy? Email{" "}
            <a href={`mailto:${site.email}`}>{site.email}</a>.
          </p>
        </LegalPage>
      </main>

      <SiteFooter />
    </div>
  );
}
