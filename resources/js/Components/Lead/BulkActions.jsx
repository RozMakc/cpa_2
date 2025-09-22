// Components/Lead/BulkActions.jsx
import { useState } from 'react';
import PrimaryButton from '../PrimaryButton';

const statusOptions = [
    { value: 'new', label: 'Новый' },
    { value: 'invited', label: 'Приглашен' },
    { value: 'accepted', label: 'Принят' },
    { value: 'no_answer', label: 'Недозвон' },
    { value: 'self_rejected', label: 'Самоотказ' },
    { value: 'rejected', label: 'Отказ' },
    { value: 'other', label: 'Прочее' },
    { value: 'invalid_number', label: 'Некорректный номер' },
    { value: 'duplicate', label: 'Дубль' },
    { value: 'test', label: 'Тест' }
];

export default function BulkActions({ selectedLeads, onSuccess }) {
    const [isLoading, setIsLoading] = useState(false);
    const [actionType, setActionType] = useState('status');
    const [status, setStatus] = useState(null);
    const [isCounted, setIsCounted] = useState(true);

    const handleBulkUpdate = async () => {
        if (selectedLeads.length === 0) return;

        setIsLoading(true);

        try {
            const payload = {
                lead_ids: selectedLeads,
                status: status,
                is_counted: isCounted,
            };

            const response = await fetch('/leadsUpdateData/bulk-update', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.message);
            }

            // Оповещаем о успешном обновлении
            window.dispatchEvent(new CustomEvent('leadsBulkUpdated', {
                detail: { leadIds: selectedLeads, status, isCounted }
            }));

            onSuccess();
            alert(`Успешно обновлено ${selectedLeads.length} лидов`);

        } catch (error) {
            console.error('Error bulk updating leads:', error);
            alert('Ошибка массового обновления: ' + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-gray-50 rounded-lg dark:bg-gray-800">
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Массовые действия (Выбрано {selectedLeads.length}):
            </div>
            <div className="flex items-center gap-3 mt-3 bg-gray-50 rounded-lg dark:bg-gray-800">

            <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
                <option>Сменить статус</option>
                {statusOptions.map(option => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>

            <select
                value={isCounted}
                onChange={(e) => setIsCounted(e.target.value)}
                className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
                <option value="1">Засчитан</option>
                <option value="0">Не засчитан</option>
            </select>

            <PrimaryButton 
                onClick={handleBulkUpdate}
                disabled={isLoading || selectedLeads.length === 0}
                className="px-4 py-2 text-sm"
            >
                {isLoading ? 'Обновление...' : 'Применить'}
            </PrimaryButton>
            </div>
        </div>
    );
}