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

    const {
        data: { session },
    } = await supabase.auth.getSession();

    if (!user || !session?.access_token) {
        redirect('/login');
    }

    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL?.replace(/\/$/, '');
    if (!baseUrl) throw new Error('NEXT_PUBLIC_BACKEND_URL is not set');

    const meRes = await fetch(`${baseUrl}/auth/me`, {
        headers: {
            Authorization: `Bearer ${session.access_token}`,
        },
        cache: 'no-store',
    });

    if (!meRes.ok) {
        redirect('/login');
    }

    const me = (await meRes.json()) as { role?: string };
    const role = me?.role;

    if (role !== 'ADMIN' && role !== 'SUPER_ADMIN') {
        redirect('/pos');
    }

    const userLabel = (user.user_metadata?.name || user.email) as string;

    return (
        <AdminShell userLabel={userLabel}>
            {children}
        </AdminShell>
    );
}