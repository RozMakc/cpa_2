
const StatCard = ({ title, value, icon: Icon, color = 'blue', className ='' }) => {
    const colorClasses = {
        blue: ' text-white bg-blue-400 ',
        green: ' text-white bg-green-500 ',
        yellow: ' text-white bg-yellow-500 ',
        red: ' text-white bg-red-600 ',
        red2: ' text-white bg-red-400 ',
        purple: ' text-purple-600 bg-purple-50 ',
        gray: ' text-white bg-gray-400 '
    };

    return (
        <div className={"rounded-2xl border border-gray-200 p-2 dark:border-gray-800 md:p-3 " + className + colorClasses[color]}>

            <div className="flex items-center text-center justify-center">
            <div>
                <span className="text-sm ">
                {title}
                </span>
                <h4 className="mt-2 font-bold  text-title-sm">
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
        newLeads = 0,
        invited = 0,
        accepted = 0,
        no_answer = 0,
        self_rejected = 0,
        rejected = 0,
        other = 0,
        invalid_number = 0,
        duplicate = 0,
        test = 0,
    } = stats;

    return (
        <div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-8 mb-3">
            <StatCard
                title="Все"
                value={total}
                color="gray"
            />

            <StatCard
                title="Новый"
                value={newLeads}
                color="blue"
            />

            <StatCard
                title="Приглашен"
                value={invited}
                color="green"
            />
            <StatCard
                title="Принят"
                value={accepted}
                color="green"
            />
            <StatCard
                title="Недозвон"
                value={no_answer}
                color="yellow"
            />
            <StatCard
                title="Самоотказ"
                value={self_rejected}
                color="red"
            />
            <StatCard
                title="Отказ"
                value={rejected}
                color="red2"
            />

            <StatCard
                title="Прочее"
                value={other}
                color="gray"
            />
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-8 mb-3">
            <StatCard
                title="Некорректный номер"
                value={invalid_number}
                color="gray"
                className={'col-span-2'}
            />
            <StatCard
                title="Дубль"
                value={duplicate}
                color="gray"
            />
            <StatCard
                title="Тест"
                value={test}
                color="gray"
            />
        </div>
        </div>
    );
}