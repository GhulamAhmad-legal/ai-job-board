export interface CompanyInfo {
  name: string;
  domain: string;
  description: string;
  industry: string;
}

export const curatedCompanies: Record<string, CompanyInfo> = {
  'Databricks': {
    name: 'Databricks',
    domain: 'databricks.com',
    industry: 'Data & AI Infrastructure',
    description: 'Pioneers of the data lakehouse architecture, unifying data engineering, governance, business intelligence, and generative AI workloads at enterprise scale.'
  },
  'Anthropic': {
    name: 'Anthropic',
    domain: 'anthropic.com',
    industry: 'AI Safety & LLMs',
    description: 'AI safety and research laboratory creating reliable, interpretable, and steerable frontier systems like Claude, guided by constitutional AI principles.'
  },
  'Waymo': {
    name: 'Waymo',
    domain: 'waymo.com',
    industry: 'Autonomous Systems & Robotics',
    description: 'An autonomous driving technology company with a mission to make roads safer by commercializing fully autonomous ride-hailing and freight logistics.'
  },
  'Scale AI': {
    name: 'Scale AI',
    domain: 'scale.com',
    industry: 'Data Engine & RLHF',
    description: 'Provides critical data infrastructure and fine-tuning datasets that accelerate machine learning model training and enterprise AI deployment.'
  },
  'Figma': {
    name: 'Figma',
    domain: 'figma.com',
    industry: 'Design & Collaboration',
    description: 'Cloud-first collaborative interface design and prototyping platform enabling global product teams to build and iterate together in real time.'
  },
  'Reddit': {
    name: 'Reddit',
    domain: 'reddit.com',
    industry: 'Community & Social Platform',
    description: 'A global network of communities where millions explore conversations, share insights, and power large-scale cultural and linguistic data trends.'
  },
  'Vercel': {
    name: 'Vercel',
    domain: 'vercel.com',
    industry: 'Frontend Cloud & Hosting',
    description: 'The developers behind Next.js, providing serverless hosting, edge computing infrastructure, and developer workflow tools for the modern web.'
  },
  'Discord': {
    name: 'Discord',
    domain: 'discord.com',
    industry: 'Real-time Communications',
    description: 'Voice, video, and text communication platform serving gaming circles, open-source communities, and collaborative development teams worldwide.'
  },
  'OpenAI': {
    name: 'OpenAI',
    domain: 'openai.com',
    industry: 'Artificial General Intelligence',
    description: 'Leading frontier AI research institute behind GPT models, DALL-E, and ChatGPT, striving to make artificial general intelligence benefit all of humanity.'
  },
  'Stripe': {
    name: 'Stripe',
    domain: 'stripe.com',
    industry: 'Fintech & Payments',
    description: 'Financial infrastructure platform powering internet commerce, subscription billing, payout networks, and global payment compliance.'
  },
  'NVIDIA': {
    name: 'NVIDIA',
    domain: 'nvidia.com',
    industry: 'Semiconductors & Accelerated Compute',
    description: 'The hardware and software foundation of modern AI, designing high-throughput GPUs, CUDA architecture, and deep learning supercomputing platforms.'
  },
  'Notion': {
    name: 'Notion',
    domain: 'notion.so',
    industry: 'Productivity & Knowledge Management',
    description: 'Connected workspace combining notes, wikis, database management, and integrated generative AI assistants to streamline knowledge work.'
  },
  'Snowflake': {
    name: 'Snowflake',
    domain: 'snowflake.com',
    industry: 'Cloud Data Warehousing',
    description: 'Cloud data platform enabling unified data storage, analytics, processing, and multi-cloud collaboration with near-zero management overhead.'
  },
  'Cloudflare': {
    name: 'Cloudflare',
    domain: 'cloudflare.com',
    industry: 'Edge Computing & Security',
    description: 'Global cloud network providing DDoS mitigation, content delivery networks (CDNs), edge computing workers, and decentralized web infrastructure.'
  },
  'Linear': {
    name: 'Linear',
    domain: 'linear.app',
    industry: 'Project Management & Tooling',
    description: 'High-performance issue tracking and product development software built specifically for high-velocity software engineering and design teams.'
  },
  'Meta': {
    name: 'Meta',
    domain: 'meta.com',
    industry: 'Consumer Tech & Open Source AI',
    description: 'Social networking and metaverse leader pioneering major open-source AI advancements including the Llama family of frontier foundation models.'
  }
};

export function getCompanyMeta(companyName: string): CompanyInfo {
  const normalized = companyName.trim();
  if (curatedCompanies[normalized]) {
    return curatedCompanies[normalized];
  }
  
  // Generic fallback if a new company appears in the database
  return {
    name: normalized,
    domain: `${normalized.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
    industry: 'Technology & Engineering',
    description: `${normalized} is actively recruiting software engineering, product, and technical talent across remote and hybrid teams.`
  };
}