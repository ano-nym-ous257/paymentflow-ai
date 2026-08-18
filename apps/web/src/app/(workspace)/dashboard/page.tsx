'use client';

import { useEffect, useState } from 'react';
import { Card, Grid, Stack, Badge, Divider, Button } from '@paymentflow/ui';
import {
  dashboardSummary,
  dashboardWallets,
  transactions,
  exchangeRates,
  pendingPayments,
  notifications,
} from '@paymentflow/mock-data';
import { PageContainer } from '@/components/PageContainer';
import { useAuth } from '@/providers/auth-provider';
import { useProfile } from '@/providers/profile-provider';
import { getIdentityDisplayName } from '@/lib/profile/presentation';
import { formatLocalDate, getGreetingForHour } from '@/lib/date-time';

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

function trendModifier(trend: 'up' | 'down' | 'stable'): string {
  if (trend === 'up') return 'dashboard__metric-trend--up';
  if (trend === 'down') return 'dashboard__metric-trend--down';
  return 'dashboard__metric-trend--neutral';
}

const QUICK_ACTIONS = [
  { icon: '↗', label: 'Send Money' },
  { icon: '↙', label: 'Receive' },
  { icon: '⇄', label: 'Exchange' },
  { icon: '+', label: 'Create Wallet' },
] as const;

export default function DashboardPage() {
  const [localNow, setLocalNow] = useState<Date | null>(null);
  const { user } = useAuth();
  const { profile } = useProfile();
  const displayName = getIdentityDisplayName(profile, user);
  const recentTransactions = transactions.slice(0, 5);
  const topRates = exchangeRates.slice(0, 4);
  const upcomingPayments = pendingPayments.slice(0, 4);
  const unreadNotifications = notifications.filter((n) => !n.read);

  useEffect(() => {
    setLocalNow(new Date());
  }, []);

  const greeting = localNow ? getGreetingForHour(localNow.getHours()) : 'Welcome';
  const formattedDate = localNow ? formatLocalDate(localNow) : null;

  return (
    <PageContainer>
      <Stack direction="vertical" gap="32px">
        {/* Hero Section */}
        <section aria-labelledby="hero-heading">
          <div className="dashboard__hero">
            <div className="dashboard__hero-content">
              <h1 id="hero-heading" className="dashboard__heading">
                {greeting}, {displayName}
              </h1>
              <p className="dashboard__subheading">
                {formattedDate ? `${formattedDate} — ` : ''}
                {dashboardSummary.pendingPayments} pending payments require attention
              </p>
            </div>
            <div className="dashboard__hero-summary">
              <span className="dashboard__portfolio-label">Total Portfolio (USD eq.)</span>
              <span className="dashboard__portfolio-value">
                ${dashboardSummary.totalBalanceUsd}
              </span>
            </div>
          </div>
        </section>

        {/* Summary Metrics */}
        <section aria-labelledby="metrics-heading">
          <h2 id="metrics-heading" className="sr-only">
            Account Metrics
          </h2>
          <Grid columns={4} gap="16px" minChildWidth="220px">
            <Card className="dashboard__metric-card">
              <Stack direction="vertical" gap="12px">
                <div className="dashboard__metric-header">
                  <span className="dashboard__metric-label">Total Balance (USD eq.)</span>
                  <span className="dashboard__metric-icon" aria-hidden="true">
                    $
                  </span>
                </div>
                <span className="dashboard__metric-value">${dashboardSummary.totalBalanceUsd}</span>
              </Stack>
            </Card>
            <Card className="dashboard__metric-card">
              <Stack direction="vertical" gap="12px">
                <div className="dashboard__metric-header">
                  <span className="dashboard__metric-label">Monthly Volume</span>
                  <span className="dashboard__metric-icon" aria-hidden="true">
                    ⇄
                  </span>
                </div>
                <span className="dashboard__metric-value">${dashboardSummary.monthlyVolume}</span>
              </Stack>
            </Card>
            <Card className="dashboard__metric-card">
              <Stack direction="vertical" gap="12px">
                <div className="dashboard__metric-header">
                  <span className="dashboard__metric-label">Active Wallets</span>
                  <span className="dashboard__metric-icon" aria-hidden="true">
                    ◇
                  </span>
                </div>
                <span className="dashboard__metric-value">{dashboardSummary.activeWallets}</span>
              </Stack>
            </Card>
            <Card className="dashboard__metric-card">
              <Stack direction="vertical" gap="12px">
                <div className="dashboard__metric-header">
                  <span className="dashboard__metric-label">Compliance Score</span>
                  <span className="dashboard__metric-icon" aria-hidden="true">
                    ✓
                  </span>
                </div>
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
                    <div className="dashboard__wallet-header">
                      <Stack direction="horizontal" gap="8px" align="center">
                        <span className="dashboard__wallet-currency" aria-hidden="true">
                          {wallet.currency}
                        </span>
                        <span className="dashboard__wallet-name">{wallet.name}</span>
                      </Stack>
                      <span className={`dashboard__metric-trend ${trendModifier(wallet.trend)}`}>
                        {trendArrow(wallet.trend)} {wallet.trendPercent}%
                      </span>
                    </div>
                    <span className="dashboard__wallet-balance">
                      {formatCurrency(wallet.balance.amount, wallet.currency)}
                    </span>
                    {wallet.pendingBalance.amount !== '0.00' && (
                      <div className="dashboard__wallet-footer">
                        <span className="dashboard__wallet-pending">
                          {formatCurrency(wallet.pendingBalance.amount, wallet.currency)} pending
                        </span>
                      </div>
                    )}
                  </Stack>
                </Card>
              ))}
            </Grid>
          </Stack>
        </section>

        {/* Two-column: Recent Activity + Module Column (Exchange Rates, Quick Actions) */}
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
                        <Stack direction="horizontal" gap="12px" align="center">
                          <span
                            className={`dashboard__tx-icon ${
                              tx.direction === 'inbound'
                                ? 'dashboard__tx-icon--inbound'
                                : 'dashboard__tx-icon--outbound'
                            }`}
                            aria-hidden="true"
                          >
                            {tx.direction === 'inbound' ? '↙' : '↗'}
                          </span>
                          <Stack direction="vertical" gap="2px">
                            <span className="dashboard__tx-description">{tx.description}</span>
                            <span className="dashboard__tx-meta">
                              {tx.counterparty} · {formatTime(tx.createdAt)}
                            </span>
                          </Stack>
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

          {/* Module Column — stackable modules for the aside */}
          <div className="dashboard__column-aside dashboard__module-column">
            {/* Exchange Rates */}
            <aside aria-labelledby="rates-heading">
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
                          <div className="dashboard__rate-value">
                            <span>{rate.rate}</span>
                            <span
                              className={`dashboard__rate-change ${rate.trend === 'down' ? 'dashboard__rate-change--down' : 'dashboard__rate-change--up'}`}
                            >
                              {trendArrow(rate.trend)} {rate.changePercent}%
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </Stack>
                </Card>
              </Stack>
            </aside>

            {/* Quick Actions */}
            <section aria-labelledby="actions-heading">
              <Stack direction="vertical" gap="16px">
                <h2 id="actions-heading" className="dashboard__section-title">
                  Quick Actions
                </h2>
                <div className="dashboard__actions">
                  {QUICK_ACTIONS.map((action) => (
                    <Button
                      key={action.label}
                      variant="secondary"
                      interaction="magnetic"
                      className="dashboard__action-card"
                      aria-label={action.label}
                      iconLeft={<span>{action.icon}</span>}
                    >
                      {action.label}
                    </Button>
                  ))}
                </div>
              </Stack>
            </section>
          </div>
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

        {/* Notifications */}
        <section aria-labelledby="notifications-heading">
          <Stack direction="vertical" gap="16px">
            <h2 id="notifications-heading" className="dashboard__section-title">
              Notifications
              {unreadNotifications.length > 0 && (
                <span className="dashboard__notification-count">{unreadNotifications.length}</span>
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
                      {!notif.read && (
                        <>
                          <span className="dashboard__notif-dot" aria-hidden="true" />
                          <span className="sr-only">Unread</span>
                        </>
                      )}
                      <div className="dashboard__notif-content">
                        <span className="dashboard__notif-title">{notif.title}</span>
                        <span className="dashboard__notif-message">{notif.message}</span>
                      </div>
                      <span className="dashboard__notif-time">{formatTime(notif.createdAt)}</span>
                    </div>
                  </div>
                ))}
              </Stack>
            </Card>
          </Stack>
        </section>
      </Stack>
    </PageContainer>
  );
}
