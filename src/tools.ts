import { z } from 'zod';
import { GridClient } from './api-client.js';

/**
 * Lightspark Grid MCP Tool Definitions
 *
 * DESCRIPTION GUIDELINES (for LLM token efficiency):
 * - Tool `description`: max 60 chars
 * - Parameter `.describe()`: max 15 chars
 */

export const tools = [
  // ===== Tokens =====

  {
    name: 'token_create',
    description: 'Create a new API token',
    inputSchema: z.object({
      name: z.string().describe('token name'),
      permissions: z.array(z.enum(['VIEW', 'TRANSACT', 'MANAGE'])).describe('permissions'),
    }),
    handler: async (client: GridClient, args: { name: string; permissions: string[] }) => {
      return await client.createToken(args.name, args.permissions);
    },
  },

  {
    name: 'tokens_list',
    description: 'List all API tokens',
    inputSchema: z.object({
      name: z.string().optional().describe('filter by name'),
      createdAfter: z.string().optional().describe('ISO date from'),
      createdBefore: z.string().optional().describe('ISO date to'),
      limit: z.number().optional().describe('max results'),
      cursor: z.string().optional().describe('pagination'),
    }),
    handler: async (client: GridClient, args: any) => {
      return await client.listTokens(args);
    },
  },

  {
    name: 'token_get',
    description: 'Get API token by ID',
    inputSchema: z.object({
      tokenId: z.string().describe('token ID'),
    }),
    handler: async (client: GridClient, args: { tokenId: string }) => {
      return await client.getToken(args.tokenId);
    },
  },

  {
    name: 'token_delete',
    description: 'Delete an API token',
    inputSchema: z.object({
      tokenId: z.string().describe('token ID'),
    }),
    handler: async (client: GridClient, args: { tokenId: string }) => {
      return await client.deleteToken(args.tokenId);
    },
  },

  // ===== Customers =====

  {
    name: 'customer_create',
    description: 'Add a new customer (individual or business)',
    inputSchema: z.object({
      customerType: z.enum(['INDIVIDUAL', 'BUSINESS']).describe('customer type'),
      platformCustomerId: z.string().describe('platform ID'),
      umaAddress: z.string().optional().describe('UMA address'),
      fullName: z.string().optional().describe('full name'),
      birthDate: z.string().optional().describe('YYYY-MM-DD'),
      nationality: z.string().optional().describe('ISO country'),
      addressLine1: z.string().optional().describe('street'),
      addressLine2: z.string().optional().describe('apt/suite'),
      city: z.string().optional().describe('city'),
      state: z.string().optional().describe('state'),
      postalCode: z.string().optional().describe('zip/postal'),
      country: z.string().optional().describe('ISO country'),
      businessLegalName: z.string().optional().describe('legal name'),
      businessRegNumber: z.string().optional().describe('reg number'),
      businessTaxId: z.string().optional().describe('tax ID'),
    }),
    handler: async (client: GridClient, args: any) => {
      const body: Record<string, any> = {
        customerType: args.customerType,
        platformCustomerId: args.platformCustomerId,
      };
      if (args.umaAddress) body.umaAddress = args.umaAddress;
      if (args.fullName) body.fullName = args.fullName;
      if (args.birthDate) body.birthDate = args.birthDate;
      if (args.nationality) body.nationality = args.nationality;
      if (args.addressLine1) {
        body.address = {
          line1: args.addressLine1,
          line2: args.addressLine2,
          city: args.city,
          state: args.state,
          postalCode: args.postalCode,
          country: args.country,
        };
      }
      if (args.customerType === 'BUSINESS') {
        if (args.businessLegalName) {
          body.businessInfo = {
            legalName: args.businessLegalName,
            registrationNumber: args.businessRegNumber,
            taxId: args.businessTaxId,
          };
        }
      }
      return await client.createCustomer(body);
    },
  },

  {
    name: 'customers_list',
    description: 'List customers with optional filters',
    inputSchema: z.object({
      platformCustomerId: z.string().optional().describe('platform ID'),
      customerType: z.enum(['INDIVIDUAL', 'BUSINESS']).optional().describe('type filter'),
      umaAddress: z.string().optional().describe('UMA filter'),
      isIncludingDeleted: z.boolean().optional().describe('include deleted'),
      createdAfter: z.string().optional().describe('ISO date from'),
      createdBefore: z.string().optional().describe('ISO date to'),
      limit: z.number().optional().describe('max results'),
      cursor: z.string().optional().describe('pagination'),
    }),
    handler: async (client: GridClient, args: any) => {
      return await client.listCustomers(args);
    },
  },

  {
    name: 'customer_get',
    description: 'Get customer by ID',
    inputSchema: z.object({
      customerId: z.string().describe('customer ID'),
    }),
    handler: async (client: GridClient, args: { customerId: string }) => {
      return await client.getCustomer(args.customerId);
    },
  },

  {
    name: 'customer_update',
    description: 'Update customer details',
    inputSchema: z.object({
      customerId: z.string().describe('customer ID'),
      customerType: z.enum(['INDIVIDUAL', 'BUSINESS']).describe('customer type'),
      fullName: z.string().optional().describe('full name'),
      umaAddress: z.string().optional().describe('UMA address'),
      birthDate: z.string().optional().describe('YYYY-MM-DD'),
      nationality: z.string().optional().describe('ISO country'),
      addressLine1: z.string().optional().describe('street'),
      postalCode: z.string().optional().describe('zip/postal'),
      country: z.string().optional().describe('ISO country'),
    }),
    handler: async (client: GridClient, args: any) => {
      const { customerId, ...rest } = args;
      const body: Record<string, any> = { customerType: rest.customerType };
      if (rest.fullName) body.fullName = rest.fullName;
      if (rest.umaAddress) body.umaAddress = rest.umaAddress;
      if (rest.birthDate) body.birthDate = rest.birthDate;
      if (rest.nationality) body.nationality = rest.nationality;
      if (rest.addressLine1) {
        body.address = {
          line1: rest.addressLine1,
          postalCode: rest.postalCode,
          country: rest.country,
        };
      }
      return await client.updateCustomer(customerId, body);
    },
  },

  {
    name: 'customer_delete',
    description: 'Delete a customer',
    inputSchema: z.object({
      customerId: z.string().describe('customer ID'),
    }),
    handler: async (client: GridClient, args: { customerId: string }) => {
      return await client.deleteCustomer(args.customerId);
    },
  },

  {
    name: 'customer_kyc_link',
    description: 'Get KYC onboarding link for customer',
    inputSchema: z.object({
      platformCustomerId: z.string().describe('platform ID'),
      redirectUri: z.string().optional().describe('redirect URL'),
    }),
    handler: async (client: GridClient, args: { platformCustomerId: string; redirectUri?: string }) => {
      return await client.getKycLink(args.platformCustomerId, args.redirectUri);
    },
  },

  {
    name: 'bulk_csv_upload',
    description: 'Bulk upload customers via CSV content',
    inputSchema: z.object({
      csvContent: z.string().describe('CSV file content'),
    }),
    handler: async (client: GridClient, args: { csvContent: string }) => {
      return await client.bulkCsvUpload(args.csvContent);
    },
  },

  {
    name: 'bulk_job_status',
    description: 'Get bulk customer import job status',
    inputSchema: z.object({
      jobId: z.string().describe('job ID'),
    }),
    handler: async (client: GridClient, args: { jobId: string }) => {
      return await client.getBulkJobStatus(args.jobId);
    },
  },

  // ===== External Accounts =====

  {
    name: 'external_account_create',
    description: 'Register external bank account for customer',
    inputSchema: z.object({
      customerId: z.string().optional().describe('customer ID'),
      currency: z.string().describe('ISO 4217'),
      platformAccountId: z.string().optional().describe('platform acct ID'),
      accountType: z.enum([
        'US_ACCOUNT', 'CLABE', 'PIX', 'IBAN', 'UPI',
        'NGN_ACCOUNT', 'CAD_ACCOUNT', 'GBP_ACCOUNT',
        'PHP_ACCOUNT', 'SGD_ACCOUNT', 'SPARK_WALLET',
        'LIGHTNING', 'SOLANA_WALLET', 'TRON_WALLET',
        'POLYGON_WALLET', 'BASE_WALLET',
      ]).describe('account type'),
      accountInfoJson: z.string().describe('account details JSON'),
    }),
    handler: async (client: GridClient, args: any) => {
      const accountInfo = JSON.parse(args.accountInfoJson);
      accountInfo.accountType = args.accountType;
      const body: Record<string, any> = {
        currency: args.currency,
        accountInfo,
      };
      if (args.customerId) body.customerId = args.customerId;
      if (args.platformAccountId) body.platformAccountId = args.platformAccountId;
      return await client.createCustomerExternalAccount(body);
    },
  },

  {
    name: 'external_accounts_list',
    description: 'List customer external accounts',
    inputSchema: z.object({
      customerId: z.string().optional().describe('customer ID'),
      currency: z.string().optional().describe('currency filter'),
      limit: z.number().optional().describe('max results'),
      cursor: z.string().optional().describe('pagination'),
    }),
    handler: async (client: GridClient, args: any) => {
      return await client.listCustomerExternalAccounts(args);
    },
  },

  {
    name: 'platform_external_account_create',
    description: 'Register platform-level external account',
    inputSchema: z.object({
      currency: z.string().describe('ISO 4217'),
      accountType: z.enum([
        'US_ACCOUNT', 'CLABE', 'PIX', 'IBAN', 'UPI',
        'NGN_ACCOUNT', 'CAD_ACCOUNT', 'GBP_ACCOUNT',
        'PHP_ACCOUNT', 'SGD_ACCOUNT', 'SPARK_WALLET',
        'LIGHTNING', 'SOLANA_WALLET', 'TRON_WALLET',
        'POLYGON_WALLET', 'BASE_WALLET',
      ]).describe('account type'),
      accountInfoJson: z.string().describe('account details JSON'),
    }),
    handler: async (client: GridClient, args: any) => {
      const accountInfo = JSON.parse(args.accountInfoJson);
      accountInfo.accountType = args.accountType;
      return await client.createPlatformExternalAccount({
        currency: args.currency,
        accountInfo,
      });
    },
  },

  {
    name: 'platform_external_accounts_list',
    description: 'List platform external accounts',
    inputSchema: z.object({
      currency: z.string().optional().describe('currency filter'),
      limit: z.number().optional().describe('max results'),
      cursor: z.string().optional().describe('pagination'),
    }),
    handler: async (client: GridClient, args: any) => {
      return await client.listPlatformExternalAccounts(args);
    },
  },

  // ===== Plaid =====

  {
    name: 'plaid_link_token',
    description: 'Get Plaid Link token for account linking',
    inputSchema: z.object({
      customerId: z.string().describe('customer ID'),
    }),
    handler: async (client: GridClient, args: { customerId: string }) => {
      return await client.createPlaidLinkToken(args.customerId);
    },
  },

  {
    name: 'plaid_callback',
    description: 'Plaid Link callback after bank linking',
    inputSchema: z.object({
      plaidLinkToken: z.string().describe('Plaid link token'),
      callbackDataJson: z.string().optional().describe('callback data JSON'),
    }),
    handler: async (client: GridClient, args: any) => {
      const data = args.callbackDataJson ? JSON.parse(args.callbackDataJson) : undefined;
      return await client.plaidCallback(args.plaidLinkToken, data);
    },
  },

  // ===== Internal Accounts =====

  {
    name: 'internal_accounts_list',
    description: 'List customer internal accounts',
    inputSchema: z.object({
      customerId: z.string().optional().describe('customer ID'),
      currency: z.string().optional().describe('currency filter'),
      limit: z.number().optional().describe('max results'),
      cursor: z.string().optional().describe('pagination'),
    }),
    handler: async (client: GridClient, args: any) => {
      return await client.listCustomerInternalAccounts(args);
    },
  },

  {
    name: 'platform_internal_accounts_list',
    description: 'List platform internal accounts',
    inputSchema: z.object({
      currency: z.string().optional().describe('currency filter'),
      limit: z.number().optional().describe('max results'),
      cursor: z.string().optional().describe('pagination'),
    }),
    handler: async (client: GridClient, args: any) => {
      return await client.listPlatformInternalAccounts(args);
    },
  },

  // ===== Quotes (Cross-Currency Transfers) =====

  {
    name: 'quote_create',
    description: 'Generate cross-currency transfer quote',
    inputSchema: z.object({
      sourceType: z.enum(['ACCOUNT', 'REALTIME_FUNDING']).describe('source type'),
      sourceAccountId: z.string().optional().describe('source acct ID'),
      sourceCustomerId: z.string().optional().describe('source customer'),
      sourceCurrency: z.string().optional().describe('source currency'),
      destinationType: z.enum(['ACCOUNT', 'UMA_ADDRESS', 'EXTERNAL_ACCOUNT_DETAILS']).describe('dest type'),
      destinationAccountId: z.string().optional().describe('dest acct ID'),
      destinationUmaAddress: z.string().optional().describe('dest UMA'),
      destinationCurrency: z.string().optional().describe('dest currency'),
      externalAccountDetailsJson: z.string().optional().describe('inline acct JSON'),
      lockedCurrencySide: z.enum(['SENDING', 'RECEIVING']).describe('lock side'),
      lockedCurrencyAmount: z.number().describe('amount (minor)'),
      lookupId: z.string().optional().describe('lookup ID'),
      immediatelyExecute: z.boolean().optional().describe('auto-execute'),
      description: z.string().optional().describe('description'),
    }),
    handler: async (client: GridClient, args: any) => {
      const source: Record<string, any> = { sourceType: args.sourceType };
      if (args.sourceAccountId) source.accountId = args.sourceAccountId;
      if (args.sourceCustomerId) source.customerId = args.sourceCustomerId;
      if (args.sourceCurrency) source.currency = args.sourceCurrency;

      const destination: Record<string, any> = { destinationType: args.destinationType };
      if (args.destinationAccountId) destination.accountId = args.destinationAccountId;
      if (args.destinationUmaAddress) destination.umaAddress = args.destinationUmaAddress;
      if (args.destinationCurrency) destination.currency = args.destinationCurrency;
      if (args.externalAccountDetailsJson) destination.externalAccountDetails = JSON.parse(args.externalAccountDetailsJson);

      const body: Record<string, any> = {
        source,
        destination,
        lockedCurrencySide: args.lockedCurrencySide,
        lockedCurrencyAmount: args.lockedCurrencyAmount,
      };
      if (args.lookupId) body.lookupId = args.lookupId;
      if (args.immediatelyExecute !== undefined) body.immediatelyExecute = args.immediatelyExecute;
      if (args.description) body.description = args.description;

      return await client.createQuote(body);
    },
  },

  {
    name: 'quotes_list',
    description: 'List transfer quotes with filters',
    inputSchema: z.object({
      customerId: z.string().optional().describe('customer ID'),
      sendingAccountId: z.string().optional().describe('sending acct'),
      receivingAccountId: z.string().optional().describe('receiving acct'),
      sendingUmaAddress: z.string().optional().describe('sender UMA'),
      receivingUmaAddress: z.string().optional().describe('receiver UMA'),
      status: z.enum(['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'EXPIRED']).optional().describe('status'),
      createdAfter: z.string().optional().describe('ISO date from'),
      createdBefore: z.string().optional().describe('ISO date to'),
      limit: z.number().optional().describe('max results'),
      cursor: z.string().optional().describe('pagination'),
    }),
    handler: async (client: GridClient, args: any) => {
      return await client.listQuotes(args);
    },
  },

  {
    name: 'quote_get',
    description: 'Get transfer quote by ID',
    inputSchema: z.object({
      quoteId: z.string().describe('quote ID'),
    }),
    handler: async (client: GridClient, args: { quoteId: string }) => {
      return await client.getQuote(args.quoteId);
    },
  },

  {
    name: 'quote_execute',
    description: 'Execute a transfer quote (irreversible)',
    inputSchema: z.object({
      quoteId: z.string().describe('quote ID'),
    }),
    handler: async (client: GridClient, args: { quoteId: string }) => {
      return await client.executeQuote(args.quoteId);
    },
  },

  {
    name: 'uma_lookup',
    description: 'Look up UMA address for payment support',
    inputSchema: z.object({
      receiverUmaAddress: z.string().describe('receiver UMA'),
      senderUmaAddress: z.string().optional().describe('sender UMA'),
      customerId: z.string().optional().describe('customer ID'),
    }),
    handler: async (client: GridClient, args: any) => {
      const { receiverUmaAddress, ...params } = args;
      return await client.lookupUma(receiverUmaAddress, params);
    },
  },

  {
    name: 'external_account_lookup',
    description: 'Look up external account payment support',
    inputSchema: z.object({
      accountId: z.string().describe('account ID'),
      senderUmaAddress: z.string().optional().describe('sender UMA'),
      customerId: z.string().optional().describe('customer ID'),
    }),
    handler: async (client: GridClient, args: any) => {
      const { accountId, ...params } = args;
      return await client.lookupExternalAccount(accountId, params);
    },
  },

  // ===== Same-Currency Transfers =====

  {
    name: 'transfer_in',
    description: 'Transfer from external to internal account',
    inputSchema: z.object({
      sourceAccountId: z.string().describe('external acct ID'),
      destinationAccountId: z.string().describe('internal acct ID'),
      amount: z.number().optional().describe('amount (minor)'),
      idempotencyKey: z.string().optional().describe('idempotency key'),
    }),
    handler: async (client: GridClient, args: any) => {
      return await client.transferIn(
        {
          source: { accountId: args.sourceAccountId },
          destination: { accountId: args.destinationAccountId },
          amount: args.amount,
        },
        args.idempotencyKey
      );
    },
  },

  {
    name: 'transfer_out',
    description: 'Transfer from internal to external account',
    inputSchema: z.object({
      sourceAccountId: z.string().describe('internal acct ID'),
      destinationAccountId: z.string().describe('external acct ID'),
      amount: z.number().optional().describe('amount (minor)'),
      idempotencyKey: z.string().optional().describe('idempotency key'),
    }),
    handler: async (client: GridClient, args: any) => {
      return await client.transferOut(
        {
          source: { accountId: args.sourceAccountId },
          destination: { accountId: args.destinationAccountId },
          amount: args.amount,
        },
        args.idempotencyKey
      );
    },
  },

  // ===== Transactions =====

  {
    name: 'transactions_list',
    description: 'List transactions with filters',
    inputSchema: z.object({
      customerId: z.string().optional().describe('customer ID'),
      platformCustomerId: z.string().optional().describe('platform cust ID'),
      senderAccountIdentifier: z.string().optional().describe('sender acct'),
      receiverAccountIdentifier: z.string().optional().describe('receiver acct'),
      status: z.enum(['CREATED', 'PENDING', 'PENDING_APPROVAL', 'PROCESSING', 'COMPLETED', 'REJECTED', 'FAILED', 'CANCELLED', 'REFUNDED', 'EXPIRED']).optional().describe('status'),
      type: z.enum(['INCOMING', 'OUTGOING']).optional().describe('tx type'),
      reference: z.string().optional().describe('tx reference'),
      startDate: z.string().optional().describe('start ISO date'),
      endDate: z.string().optional().describe('end ISO date'),
      limit: z.number().optional().describe('max results'),
      cursor: z.string().optional().describe('pagination'),
      sortOrder: z.enum(['asc', 'desc']).optional().describe('sort order'),
    }),
    handler: async (client: GridClient, args: any) => {
      return await client.listTransactions(args);
    },
  },

  {
    name: 'transaction_get',
    description: 'Get transaction by ID',
    inputSchema: z.object({
      transactionId: z.string().describe('transaction ID'),
    }),
    handler: async (client: GridClient, args: { transactionId: string }) => {
      return await client.getTransaction(args.transactionId);
    },
  },

  {
    name: 'transaction_approve',
    description: 'Approve a pending incoming payment',
    inputSchema: z.object({
      transactionId: z.string().describe('transaction ID'),
      receiverCustomerInfoJson: z.string().optional().describe('receiver info JSON'),
    }),
    handler: async (client: GridClient, args: any) => {
      const receiverInfo = args.receiverCustomerInfoJson ? JSON.parse(args.receiverCustomerInfoJson) : undefined;
      return await client.approveTransaction(args.transactionId, receiverInfo);
    },
  },

  {
    name: 'transaction_reject',
    description: 'Reject a pending incoming payment',
    inputSchema: z.object({
      transactionId: z.string().describe('transaction ID'),
      reason: z.string().optional().describe('reject reason'),
    }),
    handler: async (client: GridClient, args: { transactionId: string; reason?: string }) => {
      return await client.rejectTransaction(args.transactionId, args.reason);
    },
  },

  // ===== UMA Invitations =====

  {
    name: 'invitations_list',
    description: 'List UMA payment invitations',
    inputSchema: z.object({
      status: z.string().optional().describe('status filter'),
      limit: z.number().optional().describe('max results'),
      cursor: z.string().optional().describe('pagination'),
    }),
    handler: async (client: GridClient, args: any) => {
      return await client.listInvitations(args);
    },
  },

  {
    name: 'invitation_create',
    description: 'Create a UMA payment invitation',
    inputSchema: z.object({
      inviterUma: z.string().describe('inviter UMA'),
      firstName: z.string().optional().describe('recipient name'),
      amountToSend: z.number().optional().describe('amount (minor)'),
      expiresAt: z.string().optional().describe('expiry ISO date'),
    }),
    handler: async (client: GridClient, args: any) => {
      return await client.createInvitation(args);
    },
  },

  {
    name: 'invitation_get',
    description: 'Get invitation by code',
    inputSchema: z.object({
      invitationCode: z.string().describe('invitation code'),
    }),
    handler: async (client: GridClient, args: { invitationCode: string }) => {
      return await client.getInvitation(args.invitationCode);
    },
  },

  {
    name: 'invitation_claim',
    description: 'Claim an UMA invitation',
    inputSchema: z.object({
      invitationCode: z.string().describe('invitation code'),
      inviteeUma: z.string().describe('invitee UMA'),
    }),
    handler: async (client: GridClient, args: { invitationCode: string; inviteeUma: string }) => {
      return await client.claimInvitation(args.invitationCode, args.inviteeUma);
    },
  },

  {
    name: 'invitation_cancel',
    description: 'Cancel a pending invitation',
    inputSchema: z.object({
      invitationCode: z.string().describe('invitation code'),
    }),
    handler: async (client: GridClient, args: { invitationCode: string }) => {
      return await client.cancelInvitation(args.invitationCode);
    },
  },

  // ===== Exchange Rates =====

  {
    name: 'exchange_rates_get',
    description: 'Get exchange rates between currencies',
    inputSchema: z.object({
      source_currency: z.string().optional().describe('source currency code (e.g. USD)'),
      destination_currency: z.string().optional().describe('destination currency code(s), comma-separated'),
      sending_amount: z.number().optional().describe('sending amount in minor units (default 10000)'),
    }),
    handler: async (client: GridClient, args: { source_currency?: string; destination_currency?: string; sending_amount?: number }) => {
      const destCurrencies = args.destination_currency?.split(',').map(s => s.trim()).filter(Boolean);
      return await client.getExchangeRates({
        sourceCurrency: args.source_currency,
        destinationCurrency: destCurrencies,
        sendingAmount: args.sending_amount,
      });
    },
  },

  // ===== Platform Config =====

  {
    name: 'config_get',
    description: 'Get platform configuration',
    inputSchema: z.object({}),
    handler: async (client: GridClient) => {
      return await client.getConfig();
    },
  },

  {
    name: 'config_update',
    description: 'Update platform configuration',
    inputSchema: z.object({
      umaDomain: z.string().optional().describe('UMA domain'),
      webhookEndpoint: z.string().optional().describe('webhook URL'),
      configJson: z.string().optional().describe('full config JSON'),
    }),
    handler: async (client: GridClient, args: any) => {
      let body: Record<string, any> = {};
      if (args.configJson) {
        body = JSON.parse(args.configJson);
      } else {
        if (args.umaDomain) body.umaDomain = args.umaDomain;
        if (args.webhookEndpoint) body.webhookEndpoint = args.webhookEndpoint;
      }
      return await client.updateConfig(body);
    },
  },

  // ===== UMA Providers =====

  {
    name: 'uma_providers_list',
    description: 'List available counterparty providers',
    inputSchema: z.object({
      countryCode: z.string().optional().describe('ISO country'),
      currencyCode: z.string().optional().describe('ISO currency'),
      limit: z.number().optional().describe('max results'),
      cursor: z.string().optional().describe('pagination'),
    }),
    handler: async (client: GridClient, args: any) => {
      return await client.listUmaProviders(args);
    },
  },

  // ===== Sandbox =====

  {
    name: 'sandbox_fund',
    description: 'Sandbox: fund an internal account',
    inputSchema: z.object({
      accountId: z.string().describe('internal acct ID'),
      amount: z.number().describe('amount (minor)'),
    }),
    handler: async (client: GridClient, args: { accountId: string; amount: number }) => {
      return await client.sandboxFund(args.accountId, args.amount);
    },
  },

  {
    name: 'sandbox_receive',
    description: 'Sandbox: simulate incoming UMA payment',
    inputSchema: z.object({
      senderUmaAddress: z.string().describe('sender UMA'),
      receivingCurrencyCode: z.string().describe('currency code'),
      receivingCurrencyAmount: z.number().optional().describe('amount (minor)'),
      receiverUmaAddress: z.string().optional().describe('receiver UMA'),
      customerId: z.string().optional().describe('customer ID'),
    }),
    handler: async (client: GridClient, args: any) => {
      return await client.sandboxReceive(args);
    },
  },

  {
    name: 'sandbox_send',
    description: 'Sandbox: simulate outgoing payment',
    inputSchema: z.object({
      quoteId: z.string().describe('quote ID'),
      currencyCode: z.string().describe('currency code'),
      currencyAmount: z.number().optional().describe('amount (minor)'),
    }),
    handler: async (client: GridClient, args: any) => {
      return await client.sandboxSend(args);
    },
  },

  // ===== Webhooks =====

  {
    name: 'webhook_test',
    description: 'Send a test webhook to configured endpoint',
    inputSchema: z.object({}),
    handler: async (client: GridClient) => {
      return await client.testWebhook();
    },
  },
];

export type Tool = (typeof tools)[number];
