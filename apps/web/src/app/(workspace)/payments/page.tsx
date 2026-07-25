'use client';

import { Button, Card, Stack } from '@paymentflow/ui';
import { PageContainer } from '@/components/PageContainer';

export default function PaymentsPage() {
  return (
    <PageContainer title="Payments">
      <Stack direction="vertical" gap="24px">
        <Card>
          <Stack direction="vertical" gap="16px">
            <h2 className="payments__section-title">Cancel Pending Payment</h2>
            <p className="payments__section-description">
              This action will cancel the scheduled wire transfer of $12,500.00 USD to Acme Corp.
              This cannot be undone once confirmed.
            </p>

            {/* Location 5: Destructive / financial confirmation — destructive + press interaction */}
            <Stack direction="horizontal" gap="12px">
              <Button variant="destructive" interaction="press">
                Cancel Payment
              </Button>
              <Button variant="secondary">Keep Payment</Button>
            </Stack>
          </Stack>
        </Card>

        <Card>
          <p className="placeholder-text">Payment initiation and tracking coming soon.</p>
        </Card>
      </Stack>
    </PageContainer>
  );
}
