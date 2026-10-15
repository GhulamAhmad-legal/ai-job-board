import type { Metadata } from 'next';
import LegalPage from '../components/LegalPage';
import { siteConfig } from '../lib/siteConfig';

export const metadata: Metadata = {
  title: `Contact Us | ${siteConfig.name}`,
  description: `Get in touch with ${siteConfig.name} about listings, employer postings, corrections or privacy requests.`,
  alternates: { canonical: '/contact' },
};

export default function ContactPage() {
  return (
    <LegalPage title="Contact Us" showUpdated={false}>
      <p>
        We’re happy to hear from you. The fastest way to reach us is by email:
      </p>
      <p>
        <a href={`mailto:${siteConfig.contactEmail}`} className="text-[18px] font-bold">
          {siteConfig.contactEmail}
        </a>
      </p>
      <p>We aim to reply within a few business days.</p>

      <h2>What to contact us about</h2>
      <ul>
        <li>
          <strong>Posting a job.</strong> Questions about employer postings and pricing.
        </li>
        <li>
          <strong>Corrections or removals.</strong> If a listing is wrong, outdated or should be
          taken down, send us the job link and what needs to change.
        </li>
        <li>
          <strong>Privacy requests.</strong> To access, correct or delete personal information. See
          our <a href="/privacy">Privacy Policy</a>.
        </li>
        <li>
          <strong>Partnerships and feedback.</strong> Ideas for improving the site are welcome.
        </li>
      </ul>

      <h2>Before you write</h2>
      <p>
        We can’t help with individual job applications or the status of an application. Those are
        handled by the employer, so please contact them directly through the “Apply” link on the
        listing.
      </p>
    </LegalPage>
  );
}
