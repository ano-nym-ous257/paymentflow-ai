import { AppShell } from '@/components/AppShell';
import { WorkspaceGuard } from '@/providers/auth-route-guards';

export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  return (
    <WorkspaceGuard>
      <AppShell>{children}</AppShell>
    </WorkspaceGuard>
  );
}
