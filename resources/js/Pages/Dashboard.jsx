import EcommerceMetrics from '@/Components/dashboard/EcommerceMetrics';
import MonthlySalesChart from '@/Components/dashboard/MonthlySalesChart';
import RecentOrders from '@/Components/dashboard/RecentOrders';
import StatisticsChart from '@/Components/dashboard/StatisticsChart';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';


export default function Home({leads, users_count = 0, offers_count, clicks_count, leads_count}) {
  return (
    <AuthenticatedLayout
        pageTitle="Главная"
    >
        <Head title="Главная" />

        <div className="grid grid-cols-12 gap-4 md:gap-6">
            <div className="col-span-12">
                <EcommerceMetrics users_count={users_count} offers_count={offers_count} clicks_count={clicks_count} leads_count={leads_count}/>
            </div>

            <div className="col-span-12">
              <StatisticsChart />
            </div>

            <div className="col-span-12">
              <RecentOrders leads={leads}/>
            </div>
        </div>
    </AuthenticatedLayout>
  );
}