import Badge from '@/Components/ui/badge/badge';

export default function StatusBadge({ status }) {
    const statusConfig = {
        new: { color: 'primary', text: 'Новый' },
        hold: { color: 'warning', text: 'Холд' },
        completed: { color: 'success', text: 'Завершен' },
        canceled: { color: 'error', text: 'Отменен' }
    };

    const config = statusConfig[status] || { color: 'light', text: status };

    return (
        <Badge
            size="sm"
            color={config.color}
        >
            {config.text}
        </Badge>
    );
}