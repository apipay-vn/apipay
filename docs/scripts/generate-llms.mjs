/**
 * Generate llms.txt and llms-full.txt from MDX content.
 *
 * llms.txt: index of docs with titles and descriptions
 * llms-full.txt: full markdown content with JSX components stripped
 *
 * Usage: node scripts/generate-llms.mjs
 */

import fs from 'fs';
import path from 'path';
import {fileURLToPath} from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const CONTENT_DIR = path.join(ROOT, 'src/content/en');
const PUBLIC_DIR = path.join(ROOT, 'public');
const BASE_URL = 'https://docs.apipay.vn/en';

// Sidebar structure for grouping
const SIDEBAR_SECTIONS = [
  {
    title: 'Getting Started',
    items: [
      {file: 'index.mdx', label: 'Introduction'},
      {file: 'quickstart.mdx', label: 'Quick Start'},
      {file: 'onboarding.mdx', label: 'Onboarding'},
      {file: 'subscription.mdx', label: 'Subscription & Billing'},
    ],
  },
  {
    title: 'Banking & Payments',
    items: [
      {file: 'banking.mdx', label: 'Bank Accounts'},
      {file: 'sandbox.mdx', label: 'Sandbox & Live Test'},
      {file: 'dashboard.mdx', label: 'Dashboard Guide'},
      {file: 'connect-banks.mdx', label: 'Connect Banks'},
      {file: 'payment-speaker.mdx', label: 'Payment Speaker'},
      {file: 'custom-domains.mdx', label: 'Custom Domains'},
      {file: 'passkeys.mdx', label: 'Passkeys'},
      {file: 'affiliates.mdx', label: 'Affiliates'},
    ],
  },
  {
    title: 'Integrations',
    items: [
      {file: 'integrations/webapp.mdx', label: 'Web App'},
      {file: 'integrations/woocommerce.mdx', label: 'WooCommerce'},
      {file: 'integrations/vibe-code.mdx', label: 'Vibe Code'},
      {file: 'integrations/mcp.mdx', label: 'MCP Server'},
      {file: 'integrations/whmcs.mdx', label: 'WHMCS'},
      {file: 'integrations/hostbill.mdx', label: 'HostBill'},
    ],
  },
  {
    title: 'API Reference',
    items: [
      {file: 'api/authentication.mdx', label: 'Authentication'},
      {file: 'api/payment-requests.mdx', label: 'Payment Requests'},
      {file: 'api/webhooks.mdx', label: 'Webhooks'},
      {file: 'api/banks.mdx', label: 'Banks'},
      {file: 'api/metrics.mdx', label: 'Metrics'},
    ],
  },
];

/**
 * Extract frontmatter from MDX content
 */
function extractFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};

  const frontmatter = {};
  const lines = match[1].split('\n');
  for (const line of lines) {
    const colonIndex = line.indexOf(':');
    if (colonIndex > 0) {
      const key = line.slice(0, colonIndex).trim();
      const value = line.slice(colonIndex + 1).trim().replace(/^["']|["']$/g, '');
      frontmatter[key] = value;
    }
  }
  return frontmatter;
}

/**
 * Strip JSX components from MDX content, leaving plain markdown
 */
function stripJsx(content) {
  // Remove frontmatter
  let result = content.replace(/^---\n[\s\S]*?\n---\n\n?/, '');

  // Remove JSX components like <Callout>, <CodeTabs>, etc.
  // Keep the content between opening and closing tags
  result = result.replace(/<Callout[^>]*>([\s\S]*?)<\/Callout>/g, '$1');
  result = result.replace(/<CodeTabs>([\s\S]*?)<\/CodeTabs>/g, '$1');
  result = result.replace(/<PricingTabs[^>]*\/>/g, '');
  result = result.replace(/<OnboardingPricingTable[^>]*\/>/g, '');

  // Remove self-closing JSX tags
  result = result.replace(/<[A-Z][a-zA-Z]*[^>]*\/>/g, '');

  // Remove remaining JSX tags but keep content
  result = result.replace(/<\/?[A-Z][a-zA-Z]*[^>]*>/g, '');

  // Clean up extra whitespace
  result = result.replace(/\n{3,}/g, '\n\n');
  result = result.trim();

  return result;
}

/**
 * Convert file path to URL path
 */
function fileToUrl(file) {
  return file.replace(/\.mdx$/, '').replace(/\/index$/, '');
}

/**
 * Generate llms.txt content
 */
function generateLlmsTxt() {
  let output = `# ApiPay Documentation

> ApiPay is a Vietnamese bank-transfer payment gateway API. This documentation covers integration, API reference, and guides.

`;

  for (const section of SIDEBAR_SECTIONS) {
    output += `## ${section.title}\n\n`;

    for (const item of section.items) {
      const filePath = path.join(CONTENT_DIR, item.file);
      if (!fs.existsSync(filePath)) continue;

      const content = fs.readFileSync(filePath, 'utf-8');
      const frontmatter = extractFrontmatter(content);
      const description = frontmatter.description || '';
      const url = `${BASE_URL}/${fileToUrl(item.file)}`;

      output += `- [${item.label}](${url})`;
      if (description) {
        output += `: ${description}`;
      }
      output += '\n';
    }
    output += '\n';
  }

  output += `## Interactive API Reference

- [API Reference](${BASE_URL}/api-reference): Interactive API documentation with try-it console

`;

  return output;
}

/**
 * Generate llms-full.txt content
 */
function generateLlmsFullTxt() {
  let output = `# ApiPay Documentation (Full Content)

> ApiPay is a Vietnamese bank-transfer payment gateway API. This is the full documentation content for AI agents.

`;

  for (const section of SIDEBAR_SECTIONS) {
    output += `---\n\n## ${section.title}\n\n`;

    for (const item of section.items) {
      const filePath = path.join(CONTENT_DIR, item.file);
      if (!fs.existsSync(filePath)) continue;

      const content = fs.readFileSync(filePath, 'utf-8');
      const frontmatter = extractFrontmatter(content);
      const title = frontmatter.title || item.label;
      const url = `${BASE_URL}/${fileToUrl(item.file)}`;

      output += `### ${title}\n\n`;
      output += `Source: ${url}\n\n`;
      output += stripJsx(content);
      output += '\n\n';
    }
  }

  return output;
}

// Main execution
console.log('Generating llms.txt and llms-full.txt...');

const llmsTxt = generateLlmsTxt();
const llmsFullTxt = generateLlmsFullTxt();

fs.writeFileSync(path.join(PUBLIC_DIR, 'llms.txt'), llmsTxt);
fs.writeFileSync(path.join(PUBLIC_DIR, 'llms-full.txt'), llmsFullTxt);

console.log(`✅ Generated public/llms.txt (${llmsTxt.length} chars)`);
console.log(`✅ Generated public/llms-full.txt (${llmsFullTxt.length} chars)`);
