import { formatFieldValue, getLeadFieldValue } from "@/utils/fieldUtils";
import { Link } from "@inertiajs/react";

export const FieldRenderer = ({ lead, fieldName, fieldTitle }) => {
    const value = getLeadFieldValue(lead, fieldName);
    const formattedValue = formatFieldValue(value, fieldName);

    const renderContent = () => {
        switch (fieldName) {
            case 'user':
                return value ? (
                    <Link 
                        href={route('users.edit', value.id)}
                        className="text-blue-600 hover:text-blue-800"
                    >
                        {value.name}
                    </Link>
                ) : '-';

            case 'offer':
                return value ? (
                    <Link href={route('offer.show', value.id)}>
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 overflow-hidden rounded-md">
                                <img
                                    src={value.image_path ? `/storage/${value.image_path}` : `/storage/offers/no-photo.png`}
                                    alt={value.name}
                                    className="object-cover w-full h-full"
                                />
                            </div>
                            <span>{value.name}</span>
                        </div>
                    </Link>
                ) : 'Нет';

            case 'status':
                return <StatusBadge status={value} />;

            default:
                return (
                    <span className="text-gray-600 dark:text-gray-400">
                        {formattedValue}
                    </span>
                );
        }
    };

    return (
        <div className="flex flex-col">
            <span className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                {fieldTitle}
            </span>
            <div className="text-sm">
                {renderContent()}
            </div>
        </div>
    );
};