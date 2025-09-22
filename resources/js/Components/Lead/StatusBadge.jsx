import Badge from '@/Components/ui/badge/badge';

export default function StatusBadge({ status }) {
    const statusConfig = {
        new: { color: 'primary', text: 'Новый' },
        invited: { color: 'info', text: 'Приглашен' },
        accepted: { color: 'success', text: 'Принят' },
        no_answer: { color: 'warning', text: 'Недозвон' },
        self_rejected: { color: 'error', text: 'Самоотказ' },
        rejected: { color: 'error', text: 'Отказ' },
        other: { color: 'neutral', text: 'Прочее' },
        invalid_number: { color: 'warning', text: 'Некорректный номер' },
        duplicate: { color: 'neutral', text: 'Дубль' },
        test: { color: 'neutral', text: 'Тест' }
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