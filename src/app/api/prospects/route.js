import Anthropic from '@anthropic-ai/sdk';
import FirecrawlApp from '@mendable/firecrawl-js';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const firecrawl = new FirecrawlApp({ apiKey: process.env.FIRECRAWL_API_KEY });

// Apollo: search for people by query
async function searchApollo(query) {
  const res = await fetch('https://api.apollo.io/api/v1/mixed_people/search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Api-Key': process.env.APOLLO_API_KEY,
    },
    body: JSON.stringify({
      q_keywords: query,
      per_page: 10,
      page: 1,
    }),
  });
  if (!res.ok) throw new Error(`Apollo search failed: ${res.status}`);
  return res.json();
}

// Apollo: bulk enrich people for full contact + org data
async function enrichApollo(people) {
  const details = people.slice(0, 10).map((p) => ({
    first_name: p.first_name,
    last_name: p.last_name,
    organization_name: p.organization?.name,
    domain: p.organization?.website_url?.replace(/^https?:\/\//, '').split('/')[0],
  }));

  const res = await fetch('https://api.apollo.io/api/v1/people/bulk_match', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Api-Key': process.env.APOLLO_API_KEY,
    },
    body: JSON.stringify({ details, reveal_personal_emails: true, reveal_phone_number: true }),
  });
  if (!res.ok) throw new Error(`Apollo enrich failed: ${res.status}`);
  return res.json();
}

// Firecrawl: scrape a company website
async function scrapeWebsite(url) {
  try {
    const result = await firecrawl.scrapeUrl(url, { formats: ['markdown'] });
    return result?.markdown?.slice(0, 1500) ?? '';
  } catch {
    return '';
  }
}

// Build a prospect object from Apollo enriched person
function buildAgencyProspect(person) {
  const org = person.organization ?? {};
  return {
    name: `${person.first_name ?? ''} ${person.last_name ?? ''}`.trim(),
    title: person.title ?? '',
    email: person.email ?? '',
    phone: person.phone_numbers?.[0]?.raw_number ?? '',
    linkedin: person.linkedin_url ?? '',
    company: org.name ?? '',
    website: org.website_url ?? '',
    industry: org.industry ?? '',
    headcount: org.estimated_num_employees ?? null,
    revenue: org.annual_revenue_printed ?? '',
    techStack: org.technology_names ?? [],
    funding: org.latest_funding_stage ?? '',
    investors: org.top_investor_names ?? [],
    location: org.city ? `${org.city}, ${org.country}` : '',
    keywords: org.keywords ?? [],
  };
}

// Build a leaner prospect object from Apollo search result (no enrichment)
function buildBasicProspect(person) {
  const org = person.organization ?? {};
  return {
    name: `${person.first_name ?? ''} ${person.last_name ?? ''}`.trim(),
    title: person.title ?? '',
    email: person.email ?? '',
    company: org.name ?? '',
    website: org.website_url ?? '',
    industry: org.industry ?? '',
  };
}

// Anthropic: score and reason prospects using scraped content
async function analyzeProspects(prospects, scrapedMap, tier) {
  const prospectSummaries = prospects.map((p, i) => {
    const scraped = scrapedMap[p.website] ?? 'No website content available.';
    const extra =
      tier === 'agency'
        ? `Headcount: ${p.headcount ?? 'unknown'} | Revenue: ${p.revenue || 'unknown'} | ` +
          `Tech stack: ${p.techStack?.join(', ') || 'unknown'} | Funding: ${p.funding || 'unknown'} | ` +
          `Keywords: ${p.keywords?.join(', ') || 'none'}`
        : '';
    return `Prospect ${i + 1}: ${p.company} (${p.industry})\n${extra}\nWebsite content:\n${scraped}`;
  });

  const message = await anthropic.messages.create({
    model: 'claude-opus-4-7',
    max_tokens: 2048,
    thinking: { type: 'adaptive' },
    messages: [
      {
        role: 'user',
        content: `You are a sales analyst. Score each prospect as a potential client for a digital agency.
Return ONLY a valid JSON array with no markdown, no explanation — just the raw JSON array.
Each object must have: index (number, 1-based), fitScore (integer 1-10), fitReason (string, max 15 words).

Prospects to analyze:
${prospectSummaries.join('\n\n---\n\n')}`,
      },
    ],
  });

  const text = message.content.find((b) => b.type === 'text')?.text ?? '[]';
  try {
    return JSON.parse(text);
  } catch {
    return prospects.map((_, i) => ({ index: i + 1, fitScore: 5, fitReason: 'Analysis unavailable' }));
  }
}

export async function POST(request) {
  try {
    const { query, tier = 'free' } = await request.json();
    if (!query?.trim()) {
      return Response.json({ error: 'Query is required' }, { status: 400 });
    }

    let prospects = [];

    if (tier === 'agency') {
      // Full Apollo pipeline
      const searchData = await searchApollo(query);
      const people = searchData.people ?? [];
      const enrichData = await enrichApollo(people);
      const enriched = enrichData.matches ?? people;
      prospects = enriched.map(buildAgencyProspect).filter((p) => p.company);
    } else {
      // Firecrawl-only pipeline: search via Apollo (basic, no enrichment credits used)
      const searchData = await searchApollo(query);
      const people = searchData.people ?? [];
      prospects = people.slice(0, 5).map(buildBasicProspect).filter((p) => p.company);
    }

    if (prospects.length === 0) {
      return Response.json({ prospects: [] });
    }

    // Scrape company websites in parallel (cap at 5)
    const toScrape = prospects.slice(0, 5);
    const scrapedResults = await Promise.all(
      toScrape.map((p) => (p.website ? scrapeWebsite(p.website) : Promise.resolve('')))
    );
    const scrapedMap = {};
    toScrape.forEach((p, i) => { scrapedMap[p.website] = scrapedResults[i]; });

    // Anthropic analysis
    const scores = await analyzeProspects(prospects, scrapedMap, tier);

    // Merge scores into prospects
    const result = prospects.map((p, i) => {
      const score = scores.find((s) => s.index === i + 1) ?? {};
      return { ...p, fitScore: score.fitScore ?? null, fitReason: score.fitReason ?? '' };
    });

    return Response.json({ prospects: result });
  } catch (err) {
    console.error('[/api/prospects]', err);
    return Response.json({ error: 'Search failed. Check server logs.' }, { status: 500 });
  }
}
