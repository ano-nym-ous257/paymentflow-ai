import { Button, Card, Stack, Grid } from '@paymentflow/ui';
import { PageContainer } from '@/components/PageContainer';

export default function WalletsPage() {
  return (
    <PageContainer title="Wallets">
      <Stack direction="vertical" gap="24px">
        <Card>
          <Stack direction="vertical" gap="16px">
            <h2 className="wallets__section-title">Your Wallets</h2>
            <p className="placeholder-text">Multi-currency wallet management coming soon.</p>

            {/* Location 4: Secondary action — secondary + lift interaction */}
            <Stack direction="horizontal" gap="12px">
              <Button variant="secondary" interaction="lift" iconLeft={<span>+</span>}>
                Add New Wallet
              </Button>
              <Button variant="quiet">View All Currencies</Button>
            </Stack>
          </Stack>
        </Card>
      </Stack>
    </PageContainer>
  );
}
