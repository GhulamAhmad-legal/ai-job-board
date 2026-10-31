'use client';

import { useState } from 'react';
import LegalPage from '../components/LegalPage';
import { siteConfig } from '../lib/siteConfig';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [trap, setTrap] = useState(''); // spam trap: people never see or fill this

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, website: trap }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      setStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (err: any) {
      setStatus('error');
      setErrorMessage(err.message || 'Failed to send message');
    }
  };

  return (
    <LegalPage title="Contact Us" showUpdated={false}>
      <p>
        We’re happy to hear from you. You can reach us by email or by using the contact form below.
      </p>

      <p>
        <a
          href={`mailto:${siteConfig.contactEmail}`}
          className="text-[18px] font-bold text-blue-600 hover:underline"
        >
          {siteConfig.contactEmail}
        </a>
      </p>

      <p className="mb-8">We aim to reply within a few business days.</p>

      {/* Contact Form */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 md:p-8 mb-10">
        <h2 className="text-[20px] font-extrabold text-gray-900 mb-5 mt-0">
          Send us a message
        </h2>

        {status === 'success' ? (
          <div className="bg-green-50 border border-green-200 text-green-800 rounded-lg p-4 text-center font-medium">
            ✅ Thank you! Your message has been sent successfully. We’ll get back to you soon.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-1.5">
                Your Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                maxLength={100}
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                maxLength={254}
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="subject" className="block text-sm font-semibold text-gray-700 mb-1.5">
                Subject
              </label>
              <select
                id="subject"
                name="subject"
                required
                value={formData.subject}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white"
              >
                <option value="">Select a topic</option>
                <option value="Post a Job">Post a Job / Pricing</option>
                <option value="Correction or Removal">Correction or Removal</option>
                <option value="Privacy Request">Privacy Request</option>
                <option value="Partnership">Partnership / Feedback</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-1.5">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                required
                maxLength={5000}
                rows={5}
                value={formData.message}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition resize-y"
                placeholder="Write your message here..."
              />
            </div>

            {/* Spam trap: hidden from people, filled in by bots */}
            <input
              type="text"
              name="website"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              className="hidden"
              value={trap}
              onChange={(e) => setTrap(e.target.value)}
            />

            {status === 'error' && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">
                {errorMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold text-[15px] px-8 py-3 rounded-xl transition-all shadow-sm hover:-translate-y-0.5 disabled:cursor-not-allowed"
            >
              {status === 'loading' ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        )}
      </div>

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