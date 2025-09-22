import { router, usePage } from "@inertiajs/react";
import { ChevronRight, ChevronLeft, ChevronsLeft, ChevronsRight } from "lucide-react";

export const Paginate = ({ items, perPage = 10 }) => {
    const { url } = usePage();

    const goToPage = (page) => {
        router.get(url, { page, perPage }, {
            preserveState: true,
            replace: true
        });
    };

    return (
        items.last_page > 1 && (
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 px-5 py-4 border-t border-gray-200 dark:border-gray-700">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                    Страница {items.current_page} из {items.last_page}
                </div>

                <div className="flex items-center gap-1">
                    {/* Первая страница */}
                    <button
                        onClick={() => goToPage(1)}
                        disabled={items.current_page === 1}
                        className="p-2 rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800"
                    >
                        <ChevronsLeft size={16} />
                    </button>

                    {/* Предыдущая страница */}
                    <button
                        onClick={() => goToPage(items.current_page - 1)}
                        disabled={items.current_page === 1}
                        className="p-2 rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800"
                    >
                        <ChevronLeft size={16} />
                    </button>

                    {/* Номера страниц */}
                    {Array.from({ length: Math.min(5, items.last_page) }, (_, i) => {
                        const page = Math.max(1, Math.min(
                            items.current_page - 2,
                            items.last_page - 4
                        )) + i;
                        
                        if (page > items.last_page) return null;

                        return (
                            <button
                                key={page}
                                onClick={() => goToPage(page)}
                                className={`w-8 h-8 rounded-md border text-sm ${
                                    items.current_page === page
                                        ? 'bg-blue-500 text-white border-blue-500'
                                        : 'border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800'
                                }`}
                            >
                                {page}
                            </button>
                        );
                    })}

                    {/* Следующая страница */}
                    <button
                        onClick={() => goToPage(items.current_page + 1)}
                        disabled={items.current_page === items.last_page}
                        className="p-2 rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800"
                    >
                        <ChevronRight size={16} />
                    </button>

                    {/* Последняя страница */}
                    <button
                        onClick={() => goToPage(items.last_page)}
                        disabled={items.current_page === items.last_page}
                        className="p-2 rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800"
                    >
                        <ChevronsRight size={16} />
                    </button>
                </div>
            </div>
        )
    )
}