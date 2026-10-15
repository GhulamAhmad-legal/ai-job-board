import type { Metadata } from 'next';
import LegalPage from '../components/LegalPage';
import { siteConfig } from '../lib/siteConfig';

export const metadata: Metadata = {
  title: `Terms of Service | ${siteConfig.name}`,
  description: `The terms that apply when you use ${siteConfig.name}, including job listings and employer postings.`,
  alternates: { canonical: '/terms' },
};

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service">
      <p>
        These Terms of Service (“Terms”) govern your use of {siteConfig.name}, operated by{' '}
        {siteConfig.ownerName}. By using the website you agree to these Terms. If you do not agree,
        please do not use the site.
      </p>

      <h2>What we provide</h2>
      <p>
        {siteConfig.name} is a job board that gathers publicly available job listings from employers’
        career pages and presents them in one place. We are not an employer, recruiter or staffing
        agency, and we do not take part in hiring decisions.
      </p>

      <h2>Applying for jobs</h2>
      <p>
        When you click “Apply”, you are taken to the employer’s own website. Your application is
        between you and that employer. We do not receive, review or store applications and we make no
        promise that any application will lead to an interview or offer.
      </p>

      <h2>Accuracy of listings</h2>
      <p>
        Listings, including titles, locations, salary ranges and descriptions, come from employers and
        may be incomplete, outdated or changed after we publish them. Jobs may be filled or closed at
        any time. Always confirm the details on the employer’s website before you rely on them.
      </p>

      <h2>Content and trademarks</h2>
      <p>
        Job descriptions, company names and logos belong to the respective employers and are shown to
        help people find open roles. If you represent an employer and want a listing corrected or
        removed, email{' '}
        <a href={`mailto:${siteConfig.contactEmail}`}>{siteConfig.contactEmail}</a> with the job link
        and we will review it promptly.
      </p>

      <h2>Acceptable use</h2>
      <p>You agree not to:</p>
      <ul>
        <li>Use the site for any unlawful, misleading or harmful purpose.</li>
        <li>Interfere with or overload the site, or try to bypass its security.</li>
        <li>
          Copy or republish our compiled listings in bulk, or use automated tools to harvest the site,
          without our written permission.
        </li>
        <li>Post or submit false, discriminatory or fraudulent job information.</li>
      </ul>

      <h2>Employers and paid job postings</h2>
      <p>
        Employers may be able to pay to post or feature a job. Pricing and any additional terms will
        be shown before purchase. Paid postings must be genuine, accurate and lawful. They must not
        ask applicants to pay fees or share sensitive financial details. We may decline or remove a
        posting that breaks these rules. Refund eligibility, if any, will be described at checkout.
      </p>

      <h2>Third-party links</h2>
      <p>
        The site contains links to websites we do not control. We are not responsible for their
        content, security or privacy practices.
      </p>

      <h2>Disclaimer</h2>
      <p>
        The website and its content are provided “as is” and “as available”, without warranties of any
        kind, whether express or implied. We do not guarantee that the site will be uninterrupted,
        error-free or that listings are accurate or current.
      </p>

      <h2>Limitation of liability</h2>
      <p>
        To the fullest extent permitted by law, {siteConfig.ownerName} will not be liable for any
        indirect, incidental or consequential damages, or for any loss arising from your use of the
        site or from reliance on any listing or third-party website.
      </p>

      <h2>Governing law</h2>
      <p>These Terms are governed by the laws of {siteConfig.country}.</p>

      <h2>Changes to these Terms</h2>
      <p>
        We may update these Terms from time to time. Continuing to use the site after a change means
        you accept the updated Terms.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about these Terms? Email{' '}
        <a href={`mailto:${siteConfig.contactEmail}`}>{siteConfig.contactEmail}</a>.
      </p>
    </LegalPage>
  );
}
