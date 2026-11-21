/**
 * Generate llms.txt and llms-full.txt from MDX content.
 *
 * llms.txt / llms-vi.txt: index of docs with titles and descriptions
 * llms-full.txt: full English markdown content with JSX components stripped
 * <locale>/<page>.md: one plain-markdown file per docs page, served next to the page URL
 *
 * Usage: node scripts/generate-llms.mjs
 */

import fs from 'fs';
import path from 'path';
import {fileURLToPath} from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const CONTENT_ROOT = path.join(ROOT, 'src/content');
const CONTENT_DIR = path.join(CONTENT_ROOT, 'en');
const PUBLIC_DIR = path.join(ROOT, 'public');
const SITE_URL = 'https://docs.apipay.vn';
const BASE_URL = `${SITE_URL}/en`;

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
      {file: 'connect.mdx', label: 'ApiPay Connect'},
      {file: 'stores-staff.mdx', label: 'Stores and Staff'},
      {file: 'payment-speaker.mdx', label: 'Payment Speaker'},
      {file: 'commerce.mdx', label: 'Commerce'},
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
    title: 'AI Agent',
    items: [
      {file: 'ai-agent/index.mdx', label: 'AI Agent'},
      {file: 'ai-agent/skills.mdx', label: 'ApiPay Skills'},
    ],
  },
  {
    title: 'API Reference',
    items: [
      {file: 'api/authentication.mdx', label: 'Authentication'},
      {file: 'api/payment-requests.mdx', label: 'Payment Requests'},
      {file: 'api/commerce.mdx', label: 'Commerce'},
      {file: 'api/webhooks.mdx', label: 'Webhooks'},
      {file: 'api/banks.mdx', label: 'Banks'},
      {file: 'api/metrics.mdx', label: 'Metrics'},
      {file: 'api/account-lookup.mdx', label: 'Account Lookup'},
      {file: 'api/tax-lookup.mdx', label: 'Tax Code Lookup'},
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
const LLMS_HEADERS = {
  en: `# ApiPay Documentation

> ApiPay is a Vietnamese bank-transfer payment gateway API. This documentation covers integration, API reference, and guides. Add .md to any page URL for plain markdown.

`,
  vi: `# Tài liệu ApiPay

> ApiPay là API cổng thanh toán qua chuyển khoản ngân hàng tại Việt Nam. Tài liệu gồm hướng dẫn tích hợp, API reference và hướng dẫn sử dụng. Thêm .md vào cuối địa chỉ trang để lấy markdown thuần.

`,
};

function generateLlmsTxt(locale = 'en') {
  const contentDir = path.join(CONTENT_ROOT, locale);
  const baseUrl = `${SITE_URL}/${locale}`;
  let output = LLMS_HEADERS[locale];

  for (const section of SIDEBAR_SECTIONS) {
    output += `## ${section.title}\n\n`;

    for (const item of section.items) {
      const filePath = path.join(contentDir, item.file);
      if (!fs.existsSync(filePath)) continue;

      const content = fs.readFileSync(filePath, 'utf-8');
      const frontmatter = extractFrontmatter(content);
      const description = frontmatter.description || '';
      const label = locale === 'en' ? item.label : frontmatter.title || item.label;
      const url = `${baseUrl}/${fileToUrl(item.file)}`;

      output += `- [${label}](${url})`;
      if (description) {
        output += `: ${description}`;
      }
      output += '\n';
    }
    output += '\n';
  }

  output += `## Interactive API Reference

- [API Reference](${baseUrl}/api-reference): Interactive API documentation with try-it console

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

function listMdx(dir) {
  return fs.readdirSync(dir, {withFileTypes: true}).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return listMdx(full);
    return entry.name.endsWith('.mdx') ? [full] : [];
  });
}

// Writes public/<locale>/<route>.md, so /en/api/webhooks is also served as /en/api/webhooks.md
function generatePageMarkdown() {
  let count = 0;
  for (const locale of ['en', 'vi']) {
    const outDir = path.join(PUBLIC_DIR, locale);
    fs.rmSync(outDir, {recursive: true, force: true});
    const contentDir = path.join(CONTENT_ROOT, locale);

    for (const filePath of listMdx(contentDir)) {
      const rel = path.relative(contentDir, filePath).split(path.sep).join('/');
      const route = fileToUrl(rel) === 'index' ? '' : fileToUrl(rel);
      const content = fs.readFileSync(filePath, 'utf-8');
      const {title, description} = extractFrontmatter(content);
      const url = `${SITE_URL}/${locale}${route ? `/${route}` : ''}`;
      let body = stripJsx(content);
      if (title && !body.startsWith('# ')) body = `# ${title}\n\n${body}`;
      const header = [description && `> ${description}`, `Source: ${url}`].filter(Boolean).join('\n\n');

      const outFile = route ? path.join(outDir, `${route}.md`) : path.join(PUBLIC_DIR, `${locale}.md`);
      fs.mkdirSync(path.dirname(outFile), {recursive: true});
      fs.writeFileSync(outFile, `${header}\n\n${body}\n`);
      count++;
    }
  }
  return count;
}

// Main execution
console.log('Generating llms.txt, llms-vi.txt, llms-full.txt and per-page markdown...');

const llmsTxt = generateLlmsTxt('en');
const llmsViTxt = generateLlmsTxt('vi');
const llmsFullTxt = generateLlmsFullTxt();

fs.writeFileSync(path.join(PUBLIC_DIR, 'llms.txt'), llmsTxt);
fs.writeFileSync(path.join(PUBLIC_DIR, 'llms-vi.txt'), llmsViTxt);
fs.writeFileSync(path.join(PUBLIC_DIR, 'llms-full.txt'), llmsFullTxt);
const pageCount = generatePageMarkdown();

console.log(`✅ Generated public/llms.txt (${llmsTxt.length} chars)`);
console.log(`✅ Generated public/llms-vi.txt (${llmsViTxt.length} chars)`);
console.log(`✅ Generated public/llms-full.txt (${llmsFullTxt.length} chars)`);
console.log(`✅ Generated ${pageCount} per-page .md files in public/en, public/vi`);
