import { Link } from "@inertiajs/react";
import Badge from "../ui/badge/Badge";
import LeadTable from "../Lead/LeadTable";

const tableData = [
  {
    id: 1,
    name: "MacBook Pro 13”",
    variants: "2 Variants",
    category: "Laptop",
    price: "$2399.00",
    status: "Delivered",
    image: "/images/product/product-01.jpg",
  },
  // ... остальные данные
];

export default function RecentOrders({leads}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
      <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
          Последние лиды
        </h3>
        <div className="flex items-center gap-3">
          <Link href={route('leads.index')}>
          <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700">
            Смотреть все
          </button>
          </Link>
        </div>
      </div>
      
      <LeadTable leads={leads} />

    </div>
  );
}