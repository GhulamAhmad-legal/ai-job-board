import type { Metadata } from 'next';
import LegalPage from '../components/LegalPage';
import { siteConfig } from '../lib/siteConfig';

export const metadata: Metadata = {
  title: `Privacy Policy | ${siteConfig.name}`,
  description: `How ${siteConfig.name} collects, uses and protects information when you use our job board.`,
  alternates: { canonical: '/privacy' },
};

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy">
      <p>
        This Privacy Policy explains what information {siteConfig.name} (“we”, “us”) collects when
        you use this website, how we use it, and the choices you have. {siteConfig.name} is operated
        by {siteConfig.ownerName}. You can reach us at{' '}
        <a href={`mailto:${siteConfig.contactEmail}`}>{siteConfig.contactEmail}</a>.
      </p>

      <h2>What this website does</h2>
      <p>
        {siteConfig.name} is a job board. We collect publicly available job listings from employers’
        career pages and show them in one place. When you click “Apply”, you leave our website and
        apply directly with the employer. We do not collect or process job applications.
      </p>

      <h2>Information we collect</h2>
      <ul>
        <li>
          <strong>Usage data.</strong> We use Vercel Web Analytics to understand how the site is used
          (for example, pages viewed, referring website, browser and device type, and approximate
          country). It is designed to measure traffic without following you across other websites.
        </li>
        <li>
          <strong>Server logs.</strong> Our hosting provider may automatically record technical data
          such as your IP address, browser type and the pages requested, for security and reliability.
        </li>
        <li>
          <strong>Messages you send us.</strong> If you email us, we receive your email address and
          whatever you include in your message.
        </li>
        <li>
          <strong>Email alerts (if offered).</strong> If we offer job alert emails, we will collect
          your email address only to send the alerts you request, and you will be able to unsubscribe.
        </li>
      </ul>
      <p>We do not ask you to create an account to browse jobs.</p>

      <h2>How we use information</h2>
      <ul>
        <li>To operate, maintain and improve the website.</li>
        <li>To understand which features and listings are useful.</li>
        <li>To respond to your messages and requests.</li>
        <li>To keep the site secure and prevent abuse.</li>
        <li>To show advertising, where we use it (see below).</li>
      </ul>

      <h2>Cookies and advertising</h2>
      <p>
        We may display ads on this website through Google AdSense or similar advertising services.
        Third-party vendors, including Google, use cookies to serve ads based on your previous visits
        to this and other websites. Google’s use of advertising cookies enables it and its partners
        to serve ads to you based on your visit to our site and other sites on the internet.
      </p>
      <p>
        You can opt out of personalized advertising by visiting{' '}
        <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer">
          Google Ads Settings
        </a>{' '}
        or{' '}
        <a href="https://www.aboutads.info" target="_blank" rel="noopener noreferrer">
          aboutads.info
        </a>
        . You can learn more about how Google uses information from sites that use its services at{' '}
        <a
          href="https://policies.google.com/technologies/partner-sites"
          target="_blank"
          rel="noopener noreferrer"
        >
          policies.google.com/technologies/partner-sites
        </a>
        . Where the law requires it (for example in the European Economic Area and the United
        Kingdom), we will ask for your consent before showing ads that use cookies or similar
        technologies. You can also control cookies through your browser settings.
      </p>

      <h2>Third-party websites</h2>
      <p>
        Job listings link to employers’ own websites. Those sites have their own privacy practices,
        and we are not responsible for them. Please read their policies before submitting personal
        information.
      </p>

      <h2>Who we share information with</h2>
      <p>We do not sell your personal information. We use service providers who process data for us:</p>
      <ul>
        <li>Hosting and analytics (Vercel).</li>
        <li>Database services (Supabase), which store the job listings shown on the site.</li>
        <li>Advertising partners (such as Google), where ads are shown.</li>
      </ul>
      <p>
        We may also disclose information if required by law or to protect the rights, safety and
        security of our users or the site.
      </p>

      <h2>How long we keep information</h2>
      <p>
        We keep analytics and log data only as long as needed for the purposes above. Emails you send
        us are kept as long as necessary to handle your request and for our records.
      </p>

      <h2>Your rights</h2>
      <p>
        Depending on where you live, you may have the right to access, correct or delete personal
        information we hold about you, to object to or restrict certain processing, and to withdraw
        consent. To make a request, email{' '}
        <a href={`mailto:${siteConfig.contactEmail}`}>{siteConfig.contactEmail}</a>. We will respond
        within a reasonable time.
      </p>

      <h2>Children</h2>
      <p>
        This website is not directed to children under 16, and we do not knowingly collect personal
        information from them.
      </p>

      <h2>Security</h2>
      <p>
        We take reasonable steps to protect information, but no method of transmission or storage is
        completely secure.
      </p>

      <h2>Changes to this policy</h2>
      <p>
        We may update this policy from time to time. The “Last updated” date at the top shows when it
        was last changed.
      </p>
      <h2>Job alerts</h2>
<p>
  If you create a job alert, we collect your email address and the keywords, location and
  remote-only preference you choose. We use them only to send you the alerts you asked for.
  We email a confirmation link first, and we send alerts only after you click it. Every alert
  email has a link to stop that alert, which deletes it and your email address for it. Alert
  emails are delivered for us by our email provider, Resend. To have your data removed, use
  the unsubscribe link or write to{' '}
  <a href={`mailto:${siteConfig.contactEmail}`}>{siteConfig.contactEmail}</a>.
</p>

      <h2>Contact us</h2>
      <p>
        Questions about this policy? Email{' '}
        <a href={`mailto:${siteConfig.contactEmail}`}>{siteConfig.contactEmail}</a>.
      </p>
    </LegalPage>
  );
}
