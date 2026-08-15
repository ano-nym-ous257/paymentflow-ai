import Link from 'next/link';
import { PasswordRecoveryForm } from '@/features/auth/PasswordRecoveryForm';

export default function UpdatePasswordPage() {
  return (
    <main className="password-recovery-page">
      <section className="password-recovery-card" aria-labelledby="password-recovery-brand">
        <Link href="/login" className="password-recovery__brand" id="password-recovery-brand">
          PaymentFlow AI
        </Link>
        <PasswordRecoveryForm />
      </section>
    </main>
  );
}
