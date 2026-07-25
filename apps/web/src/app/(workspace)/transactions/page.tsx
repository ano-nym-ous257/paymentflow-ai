'use client';

import { Card } from '@paymentflow/ui';
import { PageContainer } from '@/components/PageContainer';

export default function TransactionsPage() {
  return (
    <PageContainer title="Transactions">
      <Card>
        <p className="placeholder-text">Transaction ledger and reporting coming soon.</p>
      </Card>
    </PageContainer>
  );
}
