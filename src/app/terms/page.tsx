import type { Metadata } from "next";

import { LegalPage } from "@/components/legal-page";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: `Terms & Conditions — ${site.name}`,
  description:
    "The rules for using VideoDrop, including acceptable use, intellectual property and limitations of liability.",
};

export default function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1">
        <LegalPage
          title="Terms & Conditions"
          intro={`By using ${site.name} you agree to these terms. If you do not agree, please do not use the site.`}
        >
          <h2>1. The service</h2>
          <p>
            {site.name} is a free tool that lets you save publicly available
            photos and videos from Instagram and Facebook. Downloads are unlocked
            by watching a short advertisement. We may add, change or remove
            features at any time.
          </p>

          <h2>2. Acceptable use</h2>
          <p>You agree to use {site.name} only for lawful purposes. You must not:</p>
          <ul>
            <li>
              Download content you do not own or do not have permission to use.
            </li>
            <li>
              Use the service to infringe copyright, trademarks or other rights.
            </li>
            <li>
              Attempt to bypass rate limits, advertisements or technical
              protections, or otherwise abuse the service.
            </li>
            <li>
              Use automated tools to scrape, overload or disrupt the service.
            </li>
            <li>
              Upload or submit links to illegal content, including content that
              exploits minors.
            </li>
          </ul>
          <p>
            You are solely responsible for how you use any file you download,
            including compliance with the terms of service of the platform it came
            from.
          </p>

          <h2>3. Intellectual property</h2>
          <p>
            Downloaded media belongs to its original owners. {site.name} does not
            claim ownership of any content you download and grants you no licence
            to use it. The site&apos;s own name, design and code are protected and
            may not be copied without permission.
          </p>

          <h2>4. Third-party platforms</h2>
          <p>
            {site.name} is independent and is not affiliated with, endorsed by or
            sponsored by Instagram, Facebook or Meta Platforms. Your use of those
            platforms is governed by their own terms.
          </p>

          <h2>5. Advertising</h2>
          <p>
            The service is supported by advertising. You agree to view the reward
            ad that unlocks a download. We are not responsible for the content of
            third-party advertisements or for the products and services they
            promote.
          </p>

          <h2>6. Availability</h2>
          <p>
            The service is provided on an &quot;as is&quot; and &quot;as
            available&quot; basis. We do not guarantee uptime, and we may suspend
            the service for maintenance or if a platform changes how its content
            is served.
          </p>

          <h2>7. Disclaimer of warranties</h2>
          <p>
            To the maximum extent permitted by law, we disclaim all warranties,
            express or implied, including fitness for a particular purpose and
            non-infringement. We do not warrant that the service will be
            error-free or that any download will succeed.
          </p>

          <h2>8. Limitation of liability</h2>
          <p>
            To the maximum extent permitted by law, {site.name} and its operators
            are not liable for any indirect, incidental, special or consequential
            damages, or for any loss of data, revenue or profits arising from your
            use of the service.
          </p>

          <h2>9. Indemnity</h2>
          <p>
            You agree to indemnify and hold harmless {site.name} and its operators
            from any claim arising out of your misuse of the service or your
            breach of these terms.
          </p>

          <h2>10. Changes to these terms</h2>
          <p>
            We may update these terms from time to time. Continued use of the site
            after changes are posted means you accept the revised terms.
          </p>

          <h2>11. Governing law</h2>
          <p>
            These terms are governed by the laws applicable in the operator&apos;s
            place of residence, without regard to conflict of law rules.
          </p>

          <h2>12. Contact</h2>
          <p>
            Questions about these terms? Email{" "}
            <a href={`mailto:${site.email}`}>{site.email}</a>.
          </p>
        </LegalPage>
      </main>

      <SiteFooter />
    </div>
  );
}
