import { router, useForm } from '@inertiajs/react';
import { useState } from 'react';

export default function LeadStatusSelect({ lead }) {
    const [isUpdating, setIsUpdating] = useState(false);
    
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

    const handleStatusChange = async (newStatus) => {
        setIsUpdating(true);
        
        try {
            const endpoint = `/leadsUpdateData/${lead.id}/status`;
            const response = await fetch(endpoint, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                },
                body: JSON.stringify({ status: newStatus })
            });

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.message);
            }

        } catch (error) {
            console.error('Error saving field:', error);
            alert('Ошибка сохранения: ' + error.message);
        } finally {
            setIsUpdating(false)
        }
        
    };

    return (
        <div>
            <div className="relative">
                <select 
                    value={lead.status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    disabled={isUpdating}
                    className="h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-11 text-sm shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800 disabled:opacity-50"
                >
                    {statusOptions.map(option => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
                <svg className="absolute text-gray-700 dark:text-gray-400 right-3 top-1/2 -translate-y-1/2 pointer-events-none" width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M4.79175 8.02075L10.0001 13.2291L15.2084 8.02075" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </div>
            
            {isUpdating && (
                <div className="mt-2 text-sm text-gray-500">
                    Обновление...
                </div>
            )}
        </div>
    );
}