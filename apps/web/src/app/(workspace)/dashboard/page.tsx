import { Card, Button, Grid, Stack } from '@paymentflow/ui';
import { PageContainer } from '@/components/PageContainer';

const SUMMARY_CARDS = [
  { label: 'Total Balance', value: '$0.00' },
  { label: 'Pending Payments', value: '0' },
  { label: 'Monthly Volume', value: '$0.00' },
  { label: 'Active Wallets', value: '0' },
] as const;

export default function DashboardPage() {
  return (
    <PageContainer title="Dashboard">
      <Stack direction="vertical" gap="24px">
        <p className="dashboard__welcome">
          Welcome to PaymentFlow AI. Your financial operations hub.
        </p>

        <section aria-labelledby="summary-heading">
          <h2 id="summary-heading" className="dashboard__section-title">
            Summary
          </h2>
          <Grid columns={4} gap="16px" minChildWidth="200px">
            {SUMMARY_CARDS.map((card) => (
              <Card key={card.label}>
                <Stack direction="vertical" gap="4px">
                  <span className="dashboard__card-value">{card.value}</span>
                  <span className="dashboard__card-label">{card.label}</span>
                </Stack>
              </Card>
            ))}
          </Grid>
        </section>

        <section aria-labelledby="activity-heading">
          <h2 id="activity-heading" className="dashboard__section-title">
            Recent Activity
          </h2>
          <Card>
            <p className="dashboard__activity">No recent activity to display.</p>
          </Card>
        </section>

        <section aria-labelledby="actions-heading">
          <h2 id="actions-heading" className="dashboard__section-title">
            Quick Actions
          </h2>
          <div className="dashboard__actions">
            <Button variant="primary">Send Payment</Button>
            <Button variant="ghost">Add Wallet</Button>
            <Button variant="ghost">View Reports</Button>
          </div>
        </section>
      </Stack>
    </PageContainer>
  );
}
