
const StatCard = ({ title, value, icon: Icon, color = 'blue' }) => {
    const colorClasses = {
        blue: 'text-blue-600 bg-blue-50',
        green: 'text-green-600 bg-green-50',
        yellow: 'text-yellow-600 bg-yellow-50',
        red: 'text-red-600 bg-red-50',
        purple: 'text-purple-600 bg-purple-50'
    };

    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">

            <div className="flex items-end justify-between">
            <div>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                {title}
                </span>
                <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
                {value}
                </h4>
            </div>
            </div>
        </div>
    );
};

export default function StatsCards({ stats }) {
    const {
        total = 0,
        new: newLeads = 0,
        hold = 0,
        completed = 0,
        canceled = 0
    } = stats;

    const conversionRate = total > 0 ? ((completed / total) * 100).toFixed(1) : 0;

    return (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
            <StatCard
                title="Всего"
                value={total}
                color="blue"
            />

            <StatCard
                title="Новые"
                value={newLeads}
                color="blue"
            />

            <StatCard
                title="Холд"
                value={hold}
                color="yellow"
            />

            <StatCard
                title="Завершено"
                value={completed}
                color="green"
            />

            <StatCard
                title="Отклонено"
                value={canceled}
                color="red"
            />
        </div>
    );
}