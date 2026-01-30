import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { SellerShell } from '@/components/seller-shell'

export default async function SellerLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const { data: userData } = await supabase
        .from('User')
        .select('*')
        .eq('id', user.id)
        .single()

    // Optional: Check role here if strictly needed, though middleware should handle routing
    // if (userData.role !== 'SELLER') redirect('/dashboard')

    return (
        <SellerShell userLabel={userData?.name || user.email || 'Vendedor'}>
            {children}
        </SellerShell>
    )
}
