import { siteConfig } from './siteConfig';
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
  },
  "xAI": {
    name: "xAI",
    domain: "x.ai",
    industry: "Frontier AI Models",
    description: "AI company founded by Elon Musk that builds the Grok family of language models and related products."
  },
  "Stability AI": {
    name: "Stability AI",
    domain: "stability.ai",
    industry: "Generative AI Media",
    description: "Develops open generative AI models for images, video, audio and language, best known for Stable Diffusion."
  },
  "Glean": {
    name: "Glean",
    domain: "glean.com",
    industry: "Enterprise AI Search",
    description: "Builds a work assistant and enterprise search platform that connects a company's apps and documents so employees can find answers and automate tasks."
  },
  "Together AI": {
    name: "Together AI",
    domain: "together.ai",
    industry: "AI Cloud & Inference",
    description: "Cloud platform for training, fine-tuning and running open-source and custom generative AI models."
  },
  "CoreWeave": {
    name: "CoreWeave",
    domain: "coreweave.com",
    industry: "AI Cloud Infrastructure",
    description: "Specialized cloud provider offering large-scale GPU computing for AI training and inference workloads."
  },
  "Dataiku": {
    name: "Dataiku",
    domain: "dataiku.com",
    industry: "Enterprise AI Platform",
    description: "Platform that helps organizations build, deploy and govern data science, machine learning and AI applications."
  },
  "Descript": {
    name: "Descript",
    domain: "descript.com",
    industry: "AI Audio & Video Editing",
    description: "Editing software that lets creators edit audio and video by editing a text transcript, with AI-assisted tools."
  },
  "Figure AI": {
    name: "Figure AI",
    domain: "figure.ai",
    industry: "Humanoid Robotics",
    description: "Robotics company developing general-purpose humanoid robots designed to perform useful work."
  },
  "Nuro": {
    name: "Nuro",
    domain: "nuro.ai",
    industry: "Autonomous Driving Technology",
    description: "Develops autonomous driving technology, building the software and hardware behind self-driving vehicles."
  },
  "Cohere": {
    name: "Cohere",
    domain: "cohere.com",
    industry: "Enterprise LLMs",
    description: "Builds large language models and tools for enterprises, with a focus on secure, private deployment of generative AI."
  },
  "Perplexity": {
    name: "Perplexity",
    domain: "perplexity.ai",
    industry: "AI Search",
    description: "AI-powered answer engine that responds to questions with sourced, conversational results."
  },
  "Pinecone": {
    name: "Pinecone",
    domain: "pinecone.io",
    industry: "Vector Databases",
    description: "Managed vector database used to store and search embeddings for AI applications such as retrieval-augmented generation."
  },
  "Replit": {
    name: "Replit",
    domain: "replit.com",
    industry: "Software Development Platform",
    description: "Browser-based development platform where people write, run and deploy software, with AI assistance for building apps."
  },
  "Sierra": {
    name: "Sierra",
    domain: "sierra.ai",
    industry: "Conversational AI Agents",
    description: "Builds AI agents that handle customer service conversations for companies across channels."
  },
  "Harvey": {
    name: "Harvey",
    domain: "harvey.ai",
    industry: "Legal AI",
    description: "AI platform for legal and professional services work, helping lawyers with research, drafting and document analysis."
  },
  "ElevenLabs": {
    name: "ElevenLabs",
    domain: "elevenlabs.io",
    industry: "Voice AI",
    description: "Develops AI voice technology for text-to-speech, voice cloning, dubbing and conversational voice agents."
  },
  "Cerebras": {
    name: "Cerebras",
    domain: "cerebras.ai",
    industry: "AI Hardware & Compute",
    description: "Builds wafer-scale AI chips and systems, and offers cloud access to fast AI model training and inference."
  },
  "Baseten": {
    name: "Baseten",
    domain: "baseten.co",
    industry: "ML Inference Platform",
    description: "Infrastructure for deploying and serving machine learning models in production at scale."
  },
  "Fireworks AI": {
    name: "Fireworks AI",
    domain: "fireworks.ai",
    industry: "AI Inference Platform",
    description: "Platform for running and fine-tuning open generative AI models with a focus on fast inference."
  },
  "LangChain": {
    name: "LangChain",
    domain: "langchain.com",
    industry: "LLM Application Tooling",
    description: "Open-source frameworks and tools for building, testing and monitoring applications and agents powered by large language models."
  },
  "LlamaIndex": {
    name: "LlamaIndex",
    domain: "llamaindex.ai",
    industry: "LLM Data Framework",
    description: "Framework and platform for connecting large language models to private data for retrieval and agent applications."
  },
  "Weaviate": {
    name: "Weaviate",
    domain: "weaviate.io",
    industry: "Vector Databases",
    description: "Open-source vector database for semantic search and AI applications."
  },
  "Abridge": {
    name: "Abridge",
    domain: "abridge.com",
    industry: "Healthcare AI",
    description: "Uses AI to turn clinical conversations into medical notes for clinicians."
  },
  "Synthesia": {
    name: "Synthesia",
    domain: "synthesia.io",
    industry: "AI Video",
    description: "Platform for creating videos with AI avatars and voiceovers generated from text."
  },
  "Midjourney": {
    name: "Midjourney",
    domain: "midjourney.com",
    industry: "Generative Imagery",
    description: "Independent research lab behind an AI image generation service."
  },
  "Ideogram": {
    name: "Ideogram",
    domain: "ideogram.ai",
    industry: "Generative Imagery",
    description: "AI image generation company known for rendering legible text within images."
  },
  "Poolside": {
    name: "Poolside",
    domain: "poolside.ai",
    industry: "AI for Software Development",
    description: "Builds foundation models focused on software engineering and code generation."
  },
  "Reka": {
    name: "Reka",
    domain: "reka.ai",
    industry: "Multimodal AI",
    description: "AI company building multimodal models that work with text, images, video and audio."
  },
  "Physical Intelligence": {
    name: "Physical Intelligence",
    domain: "physicalintelligence.company",
    industry: "Robot Foundation Models",
    description: "Develops general-purpose AI models intended to let robots perform a wide range of physical tasks."
  },
  "Wayve": {
    name: "Wayve",
    domain: "wayve.ai",
    industry: "Embodied AI for Driving",
    description: "UK-based company developing end-to-end AI software for autonomous driving."
  },
  "Character.AI": {
    name: "Character.AI",
    domain: "character.ai",
    industry: "Conversational AI",
    description: "Platform where people chat with AI characters."
  },
  "Lambda": {
    name: "Lambda",
    domain: "lambda.ai",
    industry: "AI Cloud & GPU Compute",
    description: "Provides GPU cloud and hardware for training and running AI models."
  },
  "Cursor": {
    name: "Cursor",
    domain: "cursor.com",
    industry: "AI Code Editor",
    description: "AI-powered code editor that helps developers write and edit software."
  },
  "Modal": {
    name: "Modal",
    domain: "modal.com",
    industry: "Serverless AI Infrastructure",
    description: "Serverless cloud platform for running AI, data and batch workloads."
  },
  "Writer": {
    name: "Writer",
    domain: "writer.com",
    industry: "Enterprise Generative AI",
    description: "Enterprise generative AI platform for building AI agents and writing assistance."
  },
  "Applied Intuition": {
    name: "Applied Intuition",
    domain: "appliedintuition.com",
    industry: "Autonomy Software",
    description: "Software and tools for developing, testing and deploying autonomous vehicles and other autonomous machines."
  },
  "Luma AI": {
    name: "Luma AI",
    domain: "lumalabs.ai",
    industry: "Generative Video & 3D",
    description: "AI company building generative models for video and 3D content, known for its Dream Machine video generator."
  },
  "Suno": {
    name: "Suno",
    domain: "suno.com",
    industry: "AI Music Generation",
    description: "Generative AI service that creates songs, with vocals and instruments, from text prompts."
  },
  "Cartesia": {
    name: "Cartesia",
    domain: "cartesia.ai",
    industry: "Voice AI",
    description: "Builds real-time voice AI models and APIs for speech generation and voice agents."
  },
  "Cognition": {
    name: "Cognition",
    domain: "cognition.ai",
    industry: "AI Software Engineering Agents",
    description: "Builds Devin, an AI software engineering agent, and related tools for automated coding."
  },
  "Anyscale": {
    name: "Anyscale",
    domain: "anyscale.com",
    industry: "Distributed AI Compute Platform",
    description: "Company behind Ray, the open-source framework for scaling AI and Python workloads, and a managed platform built on it."
  },
  "Snorkel AI": {
    name: "Snorkel AI",
    domain: "snorkel.ai",
    industry: "AI Data Development",
    description: "Platform for labeling, curating and evaluating the data used to build and adapt AI models."
  },
  "SambaNova": {
    name: "SambaNova",
    domain: "sambanova.ai",
    industry: "AI Chips & Inference Cloud",
    description: "Builds AI chips and full-stack systems, and offers cloud inference for large models."
  },
  "Etched": {
    name: "Etched",
    domain: "etched.com",
    industry: "AI Hardware",
    description: "Develops specialized chips designed to run transformer AI models."
  },
  "Crusoe": {
    name: "Crusoe",
    domain: "crusoe.ai",
    industry: "AI Cloud & Data Centers",
    description: "Builds AI data centers and offers GPU cloud computing for training and running AI models."
  },
  "Lightning AI": {
    name: "Lightning AI",
    domain: "lightning.ai",
    industry: "AI Cloud & Development Platform",
    description: "Maker of PyTorch Lightning, offering a platform and cloud GPUs for building, training and deploying AI models."
  },
  "Deepgram": {
    name: "Deepgram",
    domain: "deepgram.com",
    industry: "Voice AI",
    description: "Speech recognition and text-to-speech APIs for building voice applications and agents."
  },
  "AssemblyAI": {
    name: "AssemblyAI",
    domain: "assemblyai.com",
    industry: "Speech AI",
    description: "Speech-to-text and audio understanding APIs for developers."
  },
  "Labelbox": {
    name: "Labelbox",
    domain: "labelbox.com",
    industry: "AI Data Labeling",
    description: "Platform and services for creating labeled data and evaluation sets used to train AI models."
  },
  "Supabase": {
    name: "Supabase",
    domain: "supabase.com",
    industry: "Open-Source Database Platform",
    description: "Open-source Postgres development platform with a database, authentication, storage and vector search for building apps."
  },
  "Decagon": {
    name: "Decagon",
    domain: "decagon.ai",
    industry: "Customer Service AI Agents",
    description: "Builds AI agents that handle customer support conversations for companies."
  },
  "OpenEvidence": {
    name: "OpenEvidence",
    domain: "openevidence.com",
    industry: "Healthcare AI",
    description: "AI search and reference tool that answers clinical questions for medical professionals using published medical literature."
  },
  "Mercor": {
    name: "Mercor",
    domain: "mercor.com",
    industry: "AI Hiring Marketplace",
    description: "AI-powered hiring marketplace that matches professionals with companies, including work that trains AI models."
  },
  "Agility Robotics": {
    name: "Agility Robotics",
    domain: "agilityrobotics.com",
    industry: "Humanoid Robotics",
    description: "Builds Digit, a bipedal humanoid robot for moving totes and other work in warehouses and logistics."
  },
  "Apptronik": {
    name: "Apptronik",
    domain: "apptronik.com",
    industry: "Humanoid Robotics",
    description: "Builds general-purpose humanoid robots, including Apollo, for industrial and logistics work."
  },
  "1X": {
    name: "1X",
    domain: "1x.tech",
    industry: "Humanoid Robotics",
    description: "Robotics company building humanoid robots, including NEO, for use in homes."
  },
  "Skydio": {
    name: "Skydio",
    domain: "skydio.com",
    industry: "Autonomous Drones",
    description: "Makes autonomous drones with onboard AI for public safety, defense, inspection and other uses."
  },
  "Anduril": {
    name: "Anduril",
    domain: "anduril.com",
    industry: "Autonomous Defense Systems",
    description: "Defense technology company building autonomous systems, sensors and software for military customers."
  },
  "Shield AI": {
    name: "Shield AI",
    domain: "shield.ai",
    industry: "Autonomous Aircraft & AI Pilots",
    description: "Defense technology company building AI pilot software and autonomous aircraft."
  },
  "Chroma": {
    name: "Chroma",
    domain: "trychroma.com",
    industry: "Vector Databases",
    description: "Open-source search and retrieval database for AI applications."
  }
};

export function getCompanyMeta(companyName: string): CompanyInfo {
  const normalized = companyName.trim();
  if (curatedCompanies[normalized]) {
    return curatedCompanies[normalized];
  }
  
  // Fallback for a company that is not in the list above.
  // No made-up domain: pages fall back to the logo saved with the company's jobs.
  return {
    name: normalized,
    domain: '',
    industry: 'Technology',
    description: `${normalized} has open roles listed on ${siteConfig.name}.`
  };
}