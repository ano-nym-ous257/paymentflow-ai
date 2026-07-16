import { Button, Card } from '@paymentflow/ui';

export default function Page() {
  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-2xl)',
        gap: 'var(--space-xl)',
      }}
    >
      <h1
        style={{
          fontSize: '2.5rem',
          fontWeight: 700,
          letterSpacing: '-0.025em',
          color: 'var(--color-brand-white)',
        }}
      >
        PaymentFlow <span style={{ color: 'var(--color-brand-cyan)' }}>AI</span>
      </h1>

      <p
        style={{
          color: 'var(--color-text-secondary)',
          maxWidth: '32rem',
          textAlign: 'center',
        }}
      >
        AI-powered cross-border payments, multi-currency wallets, and intelligent financial
        operations.
      </p>

      <Card>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Shared UI Components</h2>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
            Button and Card imported from <code>@paymentflow/ui</code>
          </p>
          <div style={{ display: 'flex', gap: 'var(--space-sm)', flexWrap: 'wrap' }}>
            <Button variant="primary">Primary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="danger">Danger</Button>
          </div>
        </div>
      </Card>
    </main>
  );
}
