import { formatFieldValue, getLeadFieldValue } from "@/utils/fieldUtils";
import { Link } from "@inertiajs/react";
import StatusBadge from "./StatusBadge";

export const FieldRenderer = ({ lead, fieldName, fieldTitle }) => {
  const value = getLeadFieldValue(lead, fieldName);
  const formattedValue = formatFieldValue(value, fieldName);

  const renderContent = () => {
    switch (fieldName) {
      case 'user':
        return value ? <Link href={route('users.edit', value.id)} className="text-blue-600 hover:text-blue-800">{value.name}</Link> : '-';
      case 'project':
        return value ? <Link href={route('projects.show', value.id)} className="text-blue-600 hover:text-blue-800">{value.name}</Link> : '-';
      case 'status':
        return <StatusBadge status={value} />;
      default:
        return <span className="text-gray-600 dark:text-gray-400">{formattedValue}</span>;
    }
  };

  return (
    <div className="flex flex-col">
      <span className="mb-1 text-xs text-gray-500 dark:text-gray-400">{fieldTitle}</span>
      <div className="text-sm">{renderContent()}</div>
    </div>
  );
};
