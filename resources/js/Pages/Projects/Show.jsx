import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import LeadTable from '@/Components/Lead/LeadTable';
import StatsCards from '@/Components/Lead/StatsCards';
import QuickExportButton from '@/Components/Lead/QuickExportButton';
import { useRoles } from '@/hooks/useRoles';
import ProjectLeadTable from '@/Components/Lead/ProjectLeadTable';
import { useState } from 'react';
import { Paginate } from '@/Components/Paginate';
import BulkActions from '@/Components/Lead/BulkActions';

export default function Show({ leads, project, stats: initialStat, fieldMappings = {}, perPage = 10  }) {
    const { hasRole, hasAnyRole } = useRoles()
    const [stats, setStats] = useState(initialStat);
    const [localPerPage, setLocalPerPage] = useState(perPage);
    const [selectedLeads, setSelectedLeads] = useState([]);

    const { url } = usePage();
    const perPageOptions = [10, 25, 50, 100];

    const handleSelectedLeadsChange = (leads) => {
        setSelectedLeads(leads);
    };

    const handlePerPageChange = (e) => {
        const newPerPage = parseInt(e.target.value);
        setLocalPerPage(newPerPage);

        const url = new URL(window.location.href);
        url.searchParams.set('perPage', newPerPage);
        url.searchParams.set('page', 1);

        router.get(url.toString(), {}, {
            preserveState: true,
            replace: true,
            only: ['leads', 'stats']
        });
    };


    return (
        <AuthenticatedLayout
            pageTitle="Лиды"
        >
        <Head title="Лиды" />

        <div className="mb-5 px-5 py-4 rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className="flex justify-between flex-col gap-3 md:flex-row">
                <div>
                    <div>{project.name}</div>
                    <div>c {new Date(project.start_date).toLocaleDateString()}</div>
                </div>
                <QuickExportButton />
            </div>    

        </div>


        <StatsCards stats={stats} />

        <div className="mt-5 rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div class="flex flex-col justify-between gap-3 border-b border-gray-200 px-3 py-4 dark:border-gray-800">
                <div>
                    <h3 class="text-lg font-semibold text-gray-800 dark:text-white/90">Список лидов</h3>
                </div>
                <div className="flex gap-3 mt-3">
                    {hasRole('admin') && selectedLeads.length > 0 && (
                        <BulkActions 
                            selectedLeads={selectedLeads} 

                            onSuccess={() => {                                
                                // Сбрасываем выбранные лиды
                                
                            }}
                        />
                    )}
                </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 my-4 px-5">
                {/* Селект количества строк */}
                <div className="flex items-center gap-2">
                    <label htmlFor="perPage" className="text-sm text-gray-600 dark:text-gray-400">
                        Строк на странице:
                    </label>
                    <select
                        id="perPage"
                        value={localPerPage}
                        onChange={handlePerPageChange}
                        className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                    >
                        {perPageOptions.map(option => (
                            <option key={option} value={option}>
                                {option}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Информация о странице */}
                <div className="text-sm text-gray-600 dark:text-gray-400">
                    Показано {leads.from} - {leads.to} из {leads.total} записей
                    {selectedLeads.length > 0 && (
                        <span className="ml-2 text-blue-600 font-medium">
                            Выбрано: {selectedLeads.length}
                        </span>
                    )}
                </div>
            </div>

            <ProjectLeadTable 
                leads={leads} 
                setStats={setStats} 
                project={project} 
                fieldMappings={fieldMappings}
                selectedLeads={selectedLeads}
                onSelectedLeadsChange={handleSelectedLeadsChange}
            />
            <Paginate items={leads} perPage={perPage} />
        </div>
        </AuthenticatedLayout>
    );
}