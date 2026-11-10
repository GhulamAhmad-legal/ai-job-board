// "Common questions" answered from each page's own listings. Plain visible text, so people, search
// engines and AI assistants can all quote it. Every number is calculated; nothing is typed by hand.

import { siteConfig } from './siteConfig';
import { joinList, landingNoun } from './landingPages';
import type { LandingData } from './landingData';
import type { ListingSummary } from './listingStats';

export type QA = { q: string; a: string };

const num = (x: number) => x.toLocaleString('en-US');

// "November 12, 2026". These pages are rebuilt every hour, so this is the date the figures were calculated.
export function todayLabel(): string {
  return new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
}

const withCount = (rows: { name: string; count: number }[]) =>
  joinList(rows.map((r) => `${r.name} (${num(r.count)})`));

export function landingQuestions(data: LandingData, asOf: string): QA[] {
  const { page, count, companyCount, topCompanies, pay, stats } = data;
  if (count === 0) return [];
  const noun = landingNoun(page);
  const out: QA[] = [];

  out.push({
    q: `How many ${noun} are open right now?`,
    a: `As of ${asOf}, there are ${num(count)} open ${noun} across ${num(companyCount)} ${
      companyCount === 1 ? 'company' : 'companies'
    } on ${siteConfig.name}.`,
  });

  if (topCompanies.length > 0) {
    out.push({
      q: `Which companies have the most ${noun}?`,
      a: `${withCount(topCompanies.slice(0, 5))}.`,
    });
  }

  if (pay) {
    out.push({
      q: `How much do ${noun} pay?`,
      a: `${num(pay.listings)} of these listings state pay. The median posted range is $${pay.minMedian}K – $${pay.maxMedian}K per year.`,
    });
  } else if (stats.payPct > 0) {
    out.push({
      q: `Do these listings show pay?`,
      a: `${stats.payPct}% of them state a pay range. When an employer publishes pay, it is shown on the listing.`,
    });
  }

  if (page.kind !== 'location' && stats.topPlaces.length > 0) {
    out.push({
      q: `Where are the most ${noun}?`,
      a: `The cities with the most on-site and hybrid openings are ${withCount(stats.topPlaces)}. Fully remote roles are counted separately.`,
    });
  }

  if (!(page.kind === 'remote' || page.remote)) {
    out.push({
      q: `How many of these ${noun} are fully remote?`,
      a:
        stats.remotePct > 0
          ? `${stats.remotePct}% are marked fully remote by the employer.`
          : 'None are currently marked fully remote by the employer.',
    });
  }

  if (page.kind !== 'role' && stats.topRoles.length > 0) {
    out.push({
      q: `Which job titles are the most common?`,
      a: `${withCount(stats.topRoles)}, with seniority words such as Senior or Staff left out when counting.`,
    });
  }

  return out;
}

export function companyQuestions(company: string, s: ListingSummary, asOf: string): QA[] {
  if (s.roles === 0) return [];
  const out: QA[] = [];

  out.push({
    q: `Is ${company} hiring?`,
    a:
      `Yes. As of ${asOf}, ${company} has ${num(s.roles)} open ${s.roles === 1 ? 'role' : 'roles'} listed on ${siteConfig.name}.` +
      (s.topTitles.length > 0 ? ` The most common titles are ${withCount(s.topTitles)}.` : ''),
  });

  if (s.topPlaces.length > 0 || s.remotePct > 0) {
    const parts: string[] = [];
    if (s.topPlaces.length > 0) {
      parts.push(`The cities with the most on-site and hybrid openings are ${withCount(s.topPlaces)}.`);
    }
    if (s.remotePct > 0) parts.push(`${s.remotePct}% of the roles are marked fully remote.`);
    out.push({ q: `Where is ${company} hiring?`, a: parts.join(' ') });
  }

  out.push({
    q: `How much does ${company} pay?`,
    a:
      s.payPct === 0
        ? `None of ${company}'s current listings state a pay range.`
        : s.usPay
        ? `${s.payPct}% of ${company}'s listings state a pay range. For US roles the median posted range is $${s.usPay.minMedian}K – $${s.usPay.maxMedian}K per year (from ${num(s.usPay.listings)} listings).`
        : `${s.payPct}% of ${company}'s listings state a pay range. When it is published, the amount is shown on the listing.`,
  });

  out.push({
    q: `How do I apply to ${company}?`,
    a: `Open a role and choose Apply. You go straight to ${company}'s own application page. ${siteConfig.name} does not collect applications.`,
  });

  return out;
}