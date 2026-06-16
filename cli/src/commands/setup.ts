import chalk from 'chalk';
import {BaseCommand} from '../lib/base-command.js';
import {formatBankLabel} from '../lib/banks.js';
import {fetchClientBanks} from '../lib/client-banks.js';
import {getApiKey, getAuth, isLoggedIn, markStepComplete} from '../lib/config.js';
import {SETUP_STEPS, type SetupStep} from '../lib/constants.js';
import {
  banner,
  createTable,
  info,
  kvLine,
  maskAccountNumber,
  maskLongString,
  statusBadge,
  stepLabel,
  success,
} from '../lib/formatters.js';
import {promptConfirm} from '../lib/prompts.js';

// Import command runners
import BanksAdd from './banks/add.js';
import KeysCreate from './keys/create.js';
import Login from './login.js';
import PayCreate from './pay/create.js';
import WebhooksAdd from './webhooks/add.js';

/**
 * `apipay setup` — Guided setup wizard.
 * Walks users through the complete setup flow every time:
 *   1. Login (skipped only if already authenticated)
 *   2. Generate / confirm API key  (always refetched from API)
 *   3. Add bank account            (always refetched from API)
 *   4. Register webhook            (always refetched from API)
 */
export default class Setup extends BaseCommand {
  static override description = 'Set up ApiPay interactively — login, generate API key, add bank, register webhook';

  static override examples = ['<%= config.bin %> setup'];

  async run(): Promise<void> {
    banner();
    console.log(chalk.gray('Initializing ApiPay SDK...'));
    console.log('');

    const totalSteps = SETUP_STEPS.length;

    // Step 1: Login — skip only if token is valid (verified via /me)
    let tokenValid = false;
    if (isLoggedIn()) {
      try {
        this.spinner.start('Verifying session...');
        const data = await this.api.post('/auth/me', undefined, 'jwt');
        const user = data?.data ?? data;
        this.spinner.stop();
        const name = user?.name ?? user?.email ?? getAuth()?.email ?? 'there';
        info(`✓ Welcome back, ${chalk.cyan(name)}!`);
        console.log('');
        tokenValid = true;
      } catch {
        this.spinner.stop();
        info('Session expired. Please log in again.');
        console.log('');
      }
    }

    if (!tokenValid) {
      console.log(stepLabel(1, totalSteps, 'Authenticate with ApiPay'));
      console.log(chalk.gray('  Sign in to your account or create a new one at https://my.apipay.vn/sign-up \n'));
      await Login.run([]);
      console.log('');
    }

    // Step 2: API Key — always refetch and allow create/keep
    if (!isLoggedIn()) {
      this.error('Login is required before proceeding. Run `apipay login` first.', {exit: 1});
    }
    console.log(stepLabel(2, totalSteps, 'Generate API Key'));
    console.log(chalk.gray('  Create an API key to authenticate your integration.\n'));
    await KeysCreate.run([]);
    console.log('');

    // Step 3: Add Bank — always refetch from API
    if (!getApiKey()) {
      this.error('API key is required. Run `apipay keys:create` first.', {
        exit: 1,
      });
    }
    console.log(stepLabel(3, totalSteps, 'Add Bank Account'));
    console.log(chalk.gray('  Connect a bank account to start receiving payments.\n'));

    let existingBanks: any[] = [];
    try {
      this.spinner.start('Checking existing bank accounts...');
      existingBanks = await fetchClientBanks();
      this.spinner.stop();
    } catch (error: any) {
      this.spinner.stop();
      if (error?.statusCode === 401) {
        this.error('Authentication failed. Make sure you have entered your API key correctly.', {
          exit: 1,
        });
      }
      // Non-fatal: proceed to add flow if fetch fails
    }

    if (existingBanks.length > 0) {
      info(`You already have ${existingBanks.length} bank account(s):`);
      console.log('');
      for (const b of existingBanks) {
        kvLine(
          `${formatBankLabel(b)} ${maskAccountNumber(b.accountNumber ?? '')}`,
          statusBadge(b.status ?? 'UNKNOWN')
        );
      }
      console.log('');

      const addAnother = await promptConfirm('Would you like to add another bank account?', false);

      if (addAnother) {
        await BanksAdd.run([]);
      } else {
        markStepComplete('bank');
        success('Using existing bank account.');
      }
    } else {
      await BanksAdd.run([]);
    }
    console.log('');

    // Step 4: Add Webhook — always refetch from API
    if (!getApiKey()) {
      this.error('API key is required. Run `apipay keys:create` first.', {
        exit: 1,
      });
    }
    console.log(stepLabel(4, totalSteps, 'Register Webhook'));
    console.log(chalk.gray('  Set up a webhook to receive transaction notifications.\n'));

    let existingWebhooks: any[] = [];
    try {
      this.spinner.start('Checking existing webhooks...');
      const data = await this.api.get('/client/webhooks', 'apikey');
      existingWebhooks = Array.isArray(data) ? data : (data?.data ?? data ?? []);
      if (!Array.isArray(existingWebhooks)) existingWebhooks = [];
      this.spinner.stop();
    } catch (error: any) {
      this.spinner.stop();
      if (error?.statusCode === 401) {
        this.error('Authentication failed. Make sure you have entered your API key correctly.', {
          exit: 1,
        });
      }
      // Non-fatal: proceed to add flow if fetch fails
    }

    if (existingWebhooks.length > 0) {
      info(`You already have ${existingWebhooks.length} webhook(s):`);
      console.log('');
      const table = createTable(
        ['URL', 'Type', 'Status', 'Bank'],
        existingWebhooks.map((w: any) => [
          w.webhookUrl ? maskLongString(w.webhookUrl) : '—',
          w.type ?? '—',
          statusBadge(w.isActive ? 'ACTIVE' : 'INACTIVE'),
          w.bankAccount
            ? `${formatBankLabel(w.bankAccount)} ${maskAccountNumber(w.bankAccount.accountNumber ?? '')}`
            : '—',
        ])
      );
      console.log(table);
      console.log('');

      const addAnother = await promptConfirm('Would you like to add another webhook?', false);

      if (addAnother) {
        await WebhooksAdd.run([]);
      } else {
        markStepComplete('webhook');
        success('Using existing webhook.');
      }
    } else {
      await WebhooksAdd.run([]);
    }
    console.log('');

    await this.printFinalSummary();
  }

  private async printFinalSummary(): Promise<void> {
    console.log('');
    console.log(chalk.green.bold('  ╔══════════════════════════════════════╗'));
    console.log(chalk.green.bold('  ║    ✓  Setup Complete!               ║'));
    console.log(chalk.green.bold('  ╚══════════════════════════════════════╝'));
    console.log('');
    this.printChecklist();
    console.log('');
    info(`Dashboard: ${chalk.underline.cyan('https://my.apipay.vn')}`);
    info(`Docs:      ${chalk.underline.cyan('https://docs.apipay.vn')}`);
    info(`Status:    ${chalk.cyan('apipay status')}`);
    console.log('');

    await this.promptGenerateLink();
  }

  private async promptGenerateLink(): Promise<void> {
    const generateLink = await promptConfirm(
      'Setup is complete. Would you like to generate your first payment link now?',
      false
    );

    if (generateLink) {
      console.log('');
      await PayCreate.run([]);
    }
  }

  private printChecklist(): void {
    const labels: Record<SetupStep, string> = {
      login: 'Login',
      'api-key': 'API Key',
      bank: 'Bank account',
      webhook: 'Webhook',
    };

    for (const step of SETUP_STEPS) {
      const icon = chalk.green('✓');
      const label = chalk.white(labels[step]);
      console.log(`  ${icon} ${label}`);
    }
  }
}
