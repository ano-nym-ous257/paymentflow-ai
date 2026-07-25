import { Button, Card, Stack, Input } from '@paymentflow/ui';

export default function LoginPage() {
  return (
    <div className="auth-page">
      <Card className="auth-card">
        <Stack direction="vertical" gap="24px">
          <div className="auth-header">
            <h1 className="auth-title">Sign in to PaymentFlow</h1>
            <p className="auth-subtitle">Enter your credentials to access your account</p>
          </div>

          <form className="auth-form">
            <Stack direction="vertical" gap="16px">
              <Input label="Email" type="email" placeholder="you@company.com" />
              <Input label="Password" type="password" placeholder="Enter your password" />

              {/* Location 1: Auth submit — primary + stretch interaction */}
              <Button variant="primary" size="lg" interaction="stretch" fullWidth type="submit">
                Sign In
              </Button>
            </Stack>
          </form>

          <div className="auth-footer">
            <Button variant="ghost" size="sm">
              Forgot password?
            </Button>
          </div>
        </Stack>
      </Card>
    </div>
  );
}
