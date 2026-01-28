import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { AdminShell } from '@/components/admin-shell';

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    const userLabel = (user.user_metadata?.name || user.email) as string;

    return (
        <AdminShell userLabel={userLabel}>
            {children}
        </AdminShell>
    );
}