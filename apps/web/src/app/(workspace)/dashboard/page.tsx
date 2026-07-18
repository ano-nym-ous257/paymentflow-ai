import { Card, Grid, Stack, Badge, Divider } from '@paymentflow/ui';
import {
  dashboardSummary,
  dashboardWallets,
  transactions,
  exchangeRates,
  pendingPayments,
  notifications,
} from '@paymentflow/mock-data';
import { PageContainer } from '@/components/PageContainer';

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  NGN: '₦',
  KES: 'KSh',
  GHS: '₵',
};

function formatCurrency(amount: string, currency: string): string {
  const symbol = CURRENCY_SYMBOLS[currency] ?? currency;
  const num = Number(amount);
  if (num >= 1_000_000) {
    return `${symbol}${(num / 1_000_000).toFixed(2)}M`;
  }
  return `${symbol}${Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatTime(iso: string): string {
  const date = new Date(iso);
  const now = new Date('2026-07-16T09:00:00Z');
  const diffMs = now.getTime() - date.getTime();
  const diffHrs = Math.floor(diffMs / 3_600_000);
  if (diffHrs < 1) return 'Just now';
  if (diffHrs < 24) return `${diffHrs}h ago`;
  const diffDays = Math.floor(diffHrs / 24);
  return `${diffDays}d ago`;
}

function statusVariant(status: string): 'success' | 'warning' | 'danger' | 'info' | 'default' {
  switch (status) {
    case 'completed':
    case 'fraud_approved':
      return 'success';
    case 'processing':
    case 'pending_fraud_check':
      return 'warning';
    case 'failed':
    case 'fraud_declined':
    case 'cancelled':
      return 'danger';
    default:
      return 'info';
  }
}

function statusLabel(status: string): string {
  return status
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function trendArrow(trend: 'up' | 'down' | 'stable'): string {
  if (trend === 'up') return '↑';
  if (trend === 'down') return '↓';
  return '→';
}

export default function DashboardPage() {
  const recentTransactions = transactions.slice(0, 5);
  const topRates = exchangeRates.slice(0, 4);
  const upcomingPayments = pendingPayments.slice(0, 4);
  const unreadNotifications = notifications.filter((n) => !n.read);

  return (
    <PageContainer>
      <Stack direction="vertical" gap="32px">
        {/* Hero Section */}
        <section aria-labelledby="hero-heading">
          <Stack direction="vertical" gap="8px">
            <h1 id="hero-heading" className="dashboard__heading">
              Good morning, Michael
            </h1>
            <p className="dashboard__subheading">
              Wednesday, July 16, 2026 — {dashboardSummary.pendingPayments} pending payments require
              attention
            </p>
          </Stack>
        </section>

        {/* Summary Metrics */}
        <section aria-labelledby="metrics-heading">
          <h2 id="metrics-heading" className="sr-only">
            Account Metrics
          </h2>
          <Grid columns={4} gap="16px" minChildWidth="220px">
            <Card>
              <Stack direction="vertical" gap="4px">
                <span className="dashboard__metric-label">Total Balance (USD eq.)</span>
                <span className="dashboard__metric-value">${dashboardSummary.totalBalanceUsd}</span>
              </Stack>
            </Card>
            <Card>
              <Stack direction="vertical" gap="4px">
                <span className="dashboard__metric-label">Monthly Volume</span>
                <span className="dashboard__metric-value">${dashboardSummary.monthlyVolume}</span>
              </Stack>
            </Card>
            <Card>
              <Stack direction="vertical" gap="4px">
                <span className="dashboard__metric-label">Active Wallets</span>
                <span className="dashboard__metric-value">{dashboardSummary.activeWallets}</span>
              </Stack>
            </Card>
            <Card>
              <Stack direction="vertical" gap="4px">
                <span className="dashboard__metric-label">Compliance Score</span>
                <span className="dashboard__metric-value">{dashboardSummary.complianceScore}%</span>
              </Stack>
            </Card>
          </Grid>
        </section>

        {/* Wallet Overview */}
        <section aria-labelledby="wallets-heading">
          <Stack direction="vertical" gap="16px">
            <h2 id="wallets-heading" className="dashboard__section-title">
              Wallet Overview
            </h2>
            <Grid columns={3} gap="16px" minChildWidth="280px">
              {dashboardWallets.map((wallet) => (
                <Card key={wallet.id}>
                  <Stack direction="vertical" gap="12px">
                    <Stack direction="horizontal" gap="8px" align="center" justify="space-between">
                      <span className="dashboard__wallet-name">{wallet.name}</span>
                      <Badge variant={wallet.trend === 'down' ? 'danger' : 'success'}>
                        {trendArrow(wallet.trend)} {wallet.trendPercent}%
                      </Badge>
                    </Stack>
                    <span className="dashboard__wallet-balance">
                      {formatCurrency(wallet.balance.amount, wallet.currency)}
                    </span>
                    {wallet.pendingBalance.amount !== '0.00' && (
                      <span className="dashboard__wallet-pending">
                        {formatCurrency(wallet.pendingBalance.amount, wallet.currency)} pending
                      </span>
                    )}
                  </Stack>
                </Card>
              ))}
            </Grid>
          </Stack>
        </section>

        {/* Two-column: Recent Activity + Exchange Rates */}
        <div className="dashboard__columns">
          {/* Recent Activity */}
          <section aria-labelledby="activity-heading" className="dashboard__column-main">
            <Stack direction="vertical" gap="16px">
              <h2 id="activity-heading" className="dashboard__section-title">
                Recent Activity
              </h2>
              <Card>
                <Stack direction="vertical" gap="0px">
                  {recentTransactions.map((tx, idx) => (
                    <div key={tx.id}>
                      {idx > 0 && <Divider />}
                      <div className="dashboard__tx-row">
                        <Stack direction="vertical" gap="2px">
                          <span className="dashboard__tx-description">{tx.description}</span>
                          <span className="dashboard__tx-meta">
                            {tx.counterparty} · {formatTime(tx.createdAt)}
                          </span>
                        </Stack>
                        <Stack direction="vertical" gap="2px" align="flex-end">
                          <span
                            className={`dashboard__tx-amount ${tx.direction === 'inbound' ? 'dashboard__tx-amount--credit' : ''}`}
                          >
                            {tx.direction === 'inbound' ? '+' : '−'}
                            {formatCurrency(tx.amount.amount, tx.amount.currency)}
                          </span>
                          <Badge variant={statusVariant(tx.status)}>{statusLabel(tx.status)}</Badge>
                        </Stack>
                      </div>
                    </div>
                  ))}
                </Stack>
              </Card>
            </Stack>
          </section>

          {/* Exchange Rates */}
          <aside aria-labelledby="rates-heading" className="dashboard__column-aside">
            <Stack direction="vertical" gap="16px">
              <Stack direction="horizontal" gap="8px" align="center">
                <h2 id="rates-heading" className="dashboard__section-title">
                  Exchange Rates
                </h2>
                <span className="dashboard__live-indicator" aria-label="Live rates">
                  ●
                </span>
              </Stack>
              <Card>
                <Stack direction="vertical" gap="0px">
                  {topRates.map((rate, idx) => (
                    <div key={rate.id}>
                      {idx > 0 && <Divider />}
                      <div className="dashboard__rate-row">
                        <span className="dashboard__rate-pair">
                          {rate.baseCurrency}/{rate.quoteCurrency}
                        </span>
                        <Stack direction="horizontal" gap="8px" align="center">
                          <span className="dashboard__rate-value">{rate.rate}</span>
                          <span
                            className={`dashboard__rate-change ${rate.trend === 'down' ? 'dashboard__rate-change--down' : 'dashboard__rate-change--up'}`}
                          >
                            {trendArrow(rate.trend)} {rate.changePercent}%
                          </span>
                        </Stack>
                      </div>
                    </div>
                  ))}
                </Stack>
              </Card>
            </Stack>
          </aside>
        </div>

        {/* Pending Payments */}
        <section aria-labelledby="payments-heading">
          <Stack direction="vertical" gap="16px">
            <h2 id="payments-heading" className="dashboard__section-title">
              Upcoming Payments
            </h2>
            <Grid columns={2} gap="16px" minChildWidth="320px">
              {upcomingPayments.map((payment) => (
                <Card key={payment.id}>
                  <Stack direction="vertical" gap="8px">
                    <Stack direction="horizontal" gap="8px" align="center" justify="space-between">
                      <span className="dashboard__payment-desc">{payment.description}</span>
                      <Badge variant={statusVariant(payment.status)}>
                        {statusLabel(payment.status)}
                      </Badge>
                    </Stack>
                    <span className="dashboard__payment-amount">
                      {formatCurrency(payment.amount.amount, payment.amount.currency)}
                    </span>
                    <span className="dashboard__payment-meta">
                      To: {payment.beneficiary} · {payment.method.replace('_', ' ')}
                    </span>
                  </Stack>
                </Card>
              ))}
            </Grid>
          </Stack>
        </section>

        {/* Two-column: Notifications + Quick Actions */}
        <div className="dashboard__columns">
          {/* Notifications */}
          <section aria-labelledby="notifications-heading" className="dashboard__column-main">
            <Stack direction="vertical" gap="16px">
              <h2 id="notifications-heading" className="dashboard__section-title">
                Notifications
                {unreadNotifications.length > 0 && (
                  <span className="dashboard__notification-count">
                    {unreadNotifications.length}
                  </span>
                )}
              </h2>
              <Card>
                <Stack direction="vertical" gap="0px">
                  {notifications.slice(0, 5).map((notif, idx) => (
                    <div key={notif.id}>
                      {idx > 0 && <Divider />}
                      <div
                        className={`dashboard__notif-row ${!notif.read ? 'dashboard__notif-row--unread' : ''}`}
                      >
                        <Stack direction="vertical" gap="2px">
                          <span className="dashboard__notif-title">{notif.title}</span>
                          <span className="dashboard__notif-message">{notif.message}</span>
                        </Stack>
                        <span className="dashboard__notif-time">{formatTime(notif.createdAt)}</span>
                      </div>
                    </div>
                  ))}
                </Stack>
              </Card>
            </Stack>
          </section>

          {/* Quick Actions */}
          <aside aria-labelledby="actions-heading" className="dashboard__column-aside">
            <Stack direction="vertical" gap="16px">
              <h2 id="actions-heading" className="dashboard__section-title">
                Quick Actions
              </h2>
              <Grid columns={2} gap="12px">
                <Card>
                  <Stack direction="vertical" gap="8px" align="center">
                    <span className="dashboard__action-icon" aria-hidden="true">
                      ↗
                    </span>
                    <span className="dashboard__action-label">Send Money</span>
                  </Stack>
                </Card>
                <Card>
                  <Stack direction="vertical" gap="8px" align="center">
                    <span className="dashboard__action-icon" aria-hidden="true">
                      ↙
                    </span>
                    <span className="dashboard__action-label">Receive</span>
                  </Stack>
                </Card>
                <Card>
                  <Stack direction="vertical" gap="8px" align="center">
                    <span className="dashboard__action-icon" aria-hidden="true">
                      ⇄
                    </span>
                    <span className="dashboard__action-label">Exchange</span>
                  </Stack>
                </Card>
                <Card>
                  <Stack direction="vertical" gap="8px" align="center">
                    <span className="dashboard__action-icon" aria-hidden="true">
                      +
                    </span>
                    <span className="dashboard__action-label">Create Wallet</span>
                  </Stack>
                </Card>
              </Grid>
            </Stack>
          </aside>
        </div>
      </Stack>
    </PageContainer>
  );
}
