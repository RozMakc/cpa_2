import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import LeadTable from '@/Components/Lead/LeadTable';
import StatsCards from '@/Components/Lead/StatsCards';
import QuickExportButton from '@/Components/Lead/QuickExportButton';
import { useRoles } from '@/hooks/useRoles';

export default function Index({ leads, filters, stats }) {
    const { hasRole, hasAnyRole } = useRoles()
    return (
        <AuthenticatedLayout
            pageTitle="Лиды"
        >
        <Head title="Лиды" />

        <StatsCards stats={stats} />

        <div className="mt-5 rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div class="flex flex-col justify-between gap-5 border-b border-gray-200 px-5 py-4 sm:flex-row sm:items-center dark:border-gray-800">
                <div>
                    <h3 class="text-lg font-semibold text-gray-800 dark:text-white/90">Список лидов</h3>
                </div>
                <div class="flex gap-3">
                    {hasRole('admin') ? (
                        <>
                            <QuickExportButton />

                            <Link 
                                class="bg-brand-500 shadow-sm hover inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-600 keychainify-checked" 
                                href={route('leads.create')} data-discover="true">
                                    Добавить лид
                            </Link>
                        </>
                    ) : (
                        <></>
                    )}

                </div>
            </div>

            <LeadTable leads={leads} filters={filters} />
            
        </div>
        </AuthenticatedLayout>
    );
}