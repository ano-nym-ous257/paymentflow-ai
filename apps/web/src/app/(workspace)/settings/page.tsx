'use client';

import { Button, Card, Stack } from '@paymentflow/ui';
import { PageContainer } from '@/components/PageContainer';

export default function SettingsPage() {
  return (
    <PageContainer title="Settings">
      <Stack direction="vertical" gap="24px">
        <Card>
          <Stack direction="vertical" gap="16px">
            <h2 className="settings__section-title">AI Copilot</h2>
            <p className="settings__section-description">
              Let the AI assistant analyze your transaction patterns and suggest optimizations for
              your payment routing and currency conversion strategy.
            </p>

            {/* Location 3: AI-agent action trigger — agent + glow interaction */}
            <Button variant="agent" interaction="glow" iconLeft={<span>&#x2728;</span>}>
              Analyze My Transactions
            </Button>
          </Stack>
        </Card>

        <Card>
          <p className="placeholder-text">Profile and preference management coming soon.</p>
        </Card>
      </Stack>
    </PageContainer>
  );
}
