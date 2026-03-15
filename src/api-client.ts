/**
 * Lightspark Grid API Client
 * Base URL: https://api.lightspark.com/grid/2025-10-13
 * Auth: HTTP Basic Auth (client_id:client_secret)
 */

const DEFAULT_BASE_URL = 'https://api.lightspark.com/grid/2025-10-13';

export class GridClient {
  private clientId: string;
  private clientSecret: string;
  private baseUrl: string;

  constructor(clientId: string, clientSecret: string, baseUrl?: string) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.baseUrl = baseUrl || DEFAULT_BASE_URL;
  }

  private getAuthHeader(): string {
    const credentials = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
    return `Basic ${credentials}`;
  }

  private async request<T>(
    endpoint: string,
    options: {
      method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
      params?: Record<string, string | number | boolean | undefined>;
      body?: unknown;
      headers?: Record<string, string>;
    } = {}
  ): Promise<T> {
    const { method = 'GET', params, body, headers = {} } = options;

    const url = new URL(`${this.baseUrl}${endpoint}`);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    const requestHeaders: Record<string, string> = {
      'Authorization': this.getAuthHeader(),
      'Accept': 'application/json',
      ...headers,
    };

    if (body) {
      requestHeaders['Content-Type'] = 'application/json';
    }

    const response = await fetch(url.toString(), {
      method,
      headers: requestHeaders,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (response.status === 204) {
      return {} as T;
    }

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`API Error ${response.status}: ${text}`);
    }

    return response.json();
  }

  // ===== Tokens =====

  async createToken(name: string, permissions: string[]) {
    return this.request<any>('/tokens', {
      method: 'POST',
      body: { name, permissions },
    });
  }

  async listTokens(params?: {
    name?: string;
    createdAfter?: string;
    createdBefore?: string;
    limit?: number;
    cursor?: string;
  }) {
    return this.request<any>('/tokens', { params });
  }

  async getToken(tokenId: string) {
    return this.request<any>(`/tokens/${encodeURIComponent(tokenId)}`);
  }

  async deleteToken(tokenId: string) {
    return this.request<any>(`/tokens/${encodeURIComponent(tokenId)}`, {
      method: 'DELETE',
    });
  }

  // ===== Customers =====

  async createCustomer(data: Record<string, any>) {
    return this.request<any>('/customers', {
      method: 'POST',
      body: data,
    });
  }

  async listCustomers(params?: {
    platformCustomerId?: string;
    customerType?: string;
    umaAddress?: string;
    isIncludingDeleted?: boolean;
    createdAfter?: string;
    createdBefore?: string;
    limit?: number;
    cursor?: string;
  }) {
    return this.request<any>('/customers', { params });
  }

  async getCustomer(customerId: string) {
    return this.request<any>(`/customers/${encodeURIComponent(customerId)}`);
  }

  async updateCustomer(customerId: string, data: Record<string, any>) {
    return this.request<any>(`/customers/${encodeURIComponent(customerId)}`, {
      method: 'PATCH',
      body: data,
    });
  }

  async deleteCustomer(customerId: string) {
    return this.request<any>(`/customers/${encodeURIComponent(customerId)}`, {
      method: 'DELETE',
    });
  }

  async getKycLink(platformCustomerId: string, redirectUri?: string) {
    return this.request<any>('/customers/kyc-link', {
      params: { platformCustomerId, redirectUri },
    });
  }

  async bulkCsvUpload(csvContent: string) {
    const url = new URL(`${this.baseUrl}/customers/bulk/csv`);
    const boundary = `----FormBoundary${Date.now()}`;
    const body = `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="customers.csv"\r\nContent-Type: text/csv\r\n\r\n${csvContent}\r\n--${boundary}--`;

    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        'Authorization': this.getAuthHeader(),
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Accept': 'application/json',
      },
      body,
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`API Error ${response.status}: ${text}`);
    }
    return response.json();
  }

  async getBulkJobStatus(jobId: string) {
    return this.request<any>(`/customers/bulk/jobs/${encodeURIComponent(jobId)}`);
  }

  // ===== External Accounts =====

  async createCustomerExternalAccount(data: Record<string, any>) {
    return this.request<any>('/customers/external-accounts', {
      method: 'POST',
      body: data,
    });
  }

  async listCustomerExternalAccounts(params?: {
    currency?: string;
    customerId?: string;
    limit?: number;
    cursor?: string;
  }) {
    return this.request<any>('/customers/external-accounts', { params });
  }

  async createPlatformExternalAccount(data: Record<string, any>) {
    return this.request<any>('/platform/external-accounts', {
      method: 'POST',
      body: data,
    });
  }

  async listPlatformExternalAccounts(params?: {
    currency?: string;
    limit?: number;
    cursor?: string;
  }) {
    return this.request<any>('/platform/external-accounts', { params });
  }

  // ===== Plaid =====

  async createPlaidLinkToken(customerId: string) {
    return this.request<any>('/plaid/link-tokens', {
      method: 'POST',
      body: { customerId },
    });
  }

  async plaidCallback(plaidLinkToken: string, data?: Record<string, any>) {
    return this.request<any>(`/plaid/callback/${encodeURIComponent(plaidLinkToken)}`, {
      method: 'POST',
      body: data,
    });
  }

  // ===== Internal Accounts =====

  async listCustomerInternalAccounts(params?: {
    currency?: string;
    customerId?: string;
    limit?: number;
    cursor?: string;
  }) {
    return this.request<any>('/customers/internal-accounts', { params });
  }

  async listPlatformInternalAccounts(params?: {
    currency?: string;
    limit?: number;
    cursor?: string;
  }) {
    return this.request<any>('/platform/internal-accounts', { params });
  }

  // ===== Quotes (Cross-Currency Transfers) =====

  async createQuote(data: Record<string, any>) {
    return this.request<any>('/quotes', {
      method: 'POST',
      body: data,
    });
  }

  async listQuotes(params?: {
    customerId?: string;
    sendingAccountId?: string;
    receivingAccountId?: string;
    sendingUmaAddress?: string;
    receivingUmaAddress?: string;
    status?: string;
    createdAfter?: string;
    createdBefore?: string;
    limit?: number;
    cursor?: string;
  }) {
    return this.request<any>('/quotes', { params });
  }

  async getQuote(quoteId: string) {
    return this.request<any>(`/quotes/${encodeURIComponent(quoteId)}`);
  }

  async executeQuote(quoteId: string) {
    return this.request<any>(`/quotes/${encodeURIComponent(quoteId)}/execute`, {
      method: 'POST',
    });
  }

  async lookupUma(receiverUmaAddress: string, params?: {
    senderUmaAddress?: string;
    customerId?: string;
  }) {
    return this.request<any>(`/receiver/uma/${encodeURIComponent(receiverUmaAddress)}`, { params });
  }

  async lookupExternalAccount(accountId: string, params?: {
    senderUmaAddress?: string;
    customerId?: string;
  }) {
    return this.request<any>(`/receiver/external-account/${encodeURIComponent(accountId)}`, { params });
  }

  // ===== Same-Currency Transfers =====

  async transferIn(data: {
    source: { accountId: string };
    destination: { accountId: string };
    amount?: number;
  }, idempotencyKey?: string) {
    const headers: Record<string, string> = {};
    if (idempotencyKey) headers['Idempotency-Key'] = idempotencyKey;
    return this.request<any>('/transfer-in', {
      method: 'POST',
      body: data,
      headers,
    });
  }

  async transferOut(data: {
    source: { accountId: string };
    destination: { accountId: string };
    amount?: number;
  }, idempotencyKey?: string) {
    const headers: Record<string, string> = {};
    if (idempotencyKey) headers['Idempotency-Key'] = idempotencyKey;
    return this.request<any>('/transfer-out', {
      method: 'POST',
      body: data,
      headers,
    });
  }

  // ===== Transactions =====

  async listTransactions(params?: {
    customerId?: string;
    platformCustomerId?: string;
    senderAccountIdentifier?: string;
    receiverAccountIdentifier?: string;
    status?: string;
    type?: string;
    reference?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
    cursor?: string;
    sortOrder?: string;
  }) {
    return this.request<any>('/transactions', { params });
  }

  async getTransaction(transactionId: string) {
    return this.request<any>(`/transactions/${encodeURIComponent(transactionId)}`);
  }

  async approveTransaction(transactionId: string, receiverCustomerInfo?: Record<string, any>) {
    return this.request<any>(`/transactions/${encodeURIComponent(transactionId)}/approve`, {
      method: 'POST',
      body: receiverCustomerInfo ? { receiverCustomerInfo } : undefined,
    });
  }

  async rejectTransaction(transactionId: string, reason?: string) {
    return this.request<any>(`/transactions/${encodeURIComponent(transactionId)}/reject`, {
      method: 'POST',
      body: reason ? { reason } : undefined,
    });
  }

  // ===== UMA Invitations =====

  async listInvitations(params?: {
    status?: string;
    limit?: number;
    cursor?: string;
  }) {
    return this.request<any>('/invitations', { params });
  }

  async createInvitation(data: {
    inviterUma: string;
    firstName?: string;
    amountToSend?: number;
    expiresAt?: string;
  }) {
    return this.request<any>('/invitations', {
      method: 'POST',
      body: data,
    });
  }

  async getInvitation(invitationCode: string) {
    return this.request<any>(`/invitations/${encodeURIComponent(invitationCode)}`);
  }

  async claimInvitation(invitationCode: string, inviteeUma: string) {
    return this.request<any>(`/invitations/${encodeURIComponent(invitationCode)}/claim`, {
      method: 'POST',
      body: { inviteeUma },
    });
  }

  async cancelInvitation(invitationCode: string) {
    return this.request<any>(`/invitations/${encodeURIComponent(invitationCode)}/cancel`, {
      method: 'POST',
    });
  }

  // ===== Exchange Rates =====

  async getExchangeRates(params?: {
    sourceCurrency?: string;
    destinationCurrency?: string[];
    sendingAmount?: number;
  }) {
    const queryParams: Record<string, string | number | boolean | undefined> = {};
    if (params?.sourceCurrency) queryParams.sourceCurrency = params.sourceCurrency;
    if (params?.sendingAmount) queryParams.sendingAmount = params.sendingAmount;
    if (params?.destinationCurrency?.length) {
      queryParams.destinationCurrency = params.destinationCurrency.join(',');
    }
    return this.request<any>('/exchange-rates', { params: queryParams });
  }

  // ===== Platform Config =====

  async getConfig() {
    return this.request<any>('/config');
  }

  async updateConfig(data: Record<string, any>) {
    return this.request<any>('/config', {
      method: 'PATCH',
      body: data,
    });
  }

  // ===== UMA Providers =====

  async listUmaProviders(params?: {
    countryCode?: string;
    currencyCode?: string;
    hasBlockedProviders?: boolean;
    limit?: number;
    cursor?: string;
    sortOrder?: string;
  }) {
    return this.request<any>('/uma-providers', { params });
  }

  // ===== Sandbox =====

  async sandboxFund(accountId: string, amount: number) {
    return this.request<any>(`/sandbox/internal-accounts/${encodeURIComponent(accountId)}/fund`, {
      method: 'POST',
      body: { amount },
    });
  }

  async sandboxReceive(data: {
    senderUmaAddress: string;
    receivingCurrencyCode: string;
    receivingCurrencyAmount?: number;
    receiverUmaAddress?: string;
    customerId?: string;
  }) {
    return this.request<any>('/sandbox/uma/receive', {
      method: 'POST',
      body: data,
    });
  }

  async sandboxSend(data: {
    quoteId: string;
    currencyCode: string;
    currencyAmount?: number;
  }) {
    return this.request<any>('/sandbox/send', {
      method: 'POST',
      body: data,
    });
  }

  // ===== Webhooks =====

  async testWebhook() {
    return this.request<any>('/webhooks/test', {
      method: 'POST',
    });
  }
}
