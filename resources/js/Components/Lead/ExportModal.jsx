// Components/Lead/ExportModal.jsx
import { useState, useEffect, useMemo } from 'react';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';

export default function ExportModal({ isOpen, onClose, project, fieldMappings = {} }) {
    const [exportSettings, setExportSettings] = useState({
        startDate: '',
        endDate: '',
        fields: [],
        format: 'csv'
    });
    const [isLoading, setIsLoading] = useState(false);

    // Используем useMemo для мемоизации вычислений (чтобы избежать лишних ререндеров)
    const { visibleFields, sortedVisibleFields, allFields, combinedFields, fieldsByCategory } = useMemo(() => {
        // Получаем видимые поля из настроек проекта
        const visibleFields = project.visible_fields || {};
        
        // Сортируем поля по порядку
        const sortedVisibleFields = Object.entries(visibleFields)
            .filter(([_, settings]) => settings?.visible)
            .sort(([_, a], [__, b]) => (a?.order || 0) - (b?.order || 0))
            .map(([fieldName]) => fieldName);

        // Функция для получения заголовка поля
        const getFieldTitle = (fieldName) => {
            const fieldSettings = visibleFields[fieldName];
            return fieldSettings?.title || fieldName;
        };

        // Функция для получения категории поля
        const getFieldCategory = (fieldName) => {
            if (['id', 'created_at', 'status', 'is_counted', 'comment'].includes(fieldName)) {
                return 'basic';
            }
            if (fieldName.includes('.') || ['user.name', 'project.name'].includes(fieldName)) {
                return 'relation';
            }
            if (fieldMappings[fieldName] && fieldMappings[fieldName].startsWith('additional_data.')) {
                return 'custom';
            }
            return 'project';
        };

        // Все возможные поля для выгрузки (на основе visible_fields проекта)
        const allFields = sortedVisibleFields.map(fieldName => ({
            key: fieldName,
            label: getFieldTitle(fieldName),
            category: getFieldCategory(fieldName)
        }));

        // Добавляем стандартные поля
        const standardFields = [
            { key: 'id', label: 'ID', category: 'basic' },
            { key: 'created_at', label: 'Дата создания', category: 'basic' },
            { key: 'status', label: 'Статус', category: 'basic' },
            { key: 'is_counted', label: 'Засчитан', category: 'basic' },
            { key: 'comment', label: 'Комментарий', category: 'basic' },
            { key: 'tg_channel', label: 'ТГ канал', category: 'basic' },
            { key: 'user.name', label: 'Менеджер', category: 'relation' },
            { key: 'offer.name', label: 'Оффер', category: 'relation' }
        ];

        // Объединяем поля
        const combinedFields = [
            ...allFields,
            ...standardFields.filter(stdField => 
                !allFields.some(field => field.key === stdField.key)
            )
        ];

        // Группировка полей по категориям
        const fieldsByCategory = combinedFields.reduce((acc, field) => {
            const category = field.category;
            if (!acc[category]) {
                acc[category] = [];
            }
            acc[category].push(field);
            return acc;
        }, {});

        return {
            visibleFields,
            sortedVisibleFields,
            allFields,
            combinedFields,
            fieldsByCategory
        };
    }, [project.visible_fields, fieldMappings]); // Зависимости только от props

    // Инициализация полей при открытии модального окна
    useEffect(() => {
        if (isOpen) {
            // Устанавливаем дату начала проекта как начальную дату по умолчанию
            const projectStartDate = project.start_date ? new Date(project.start_date).toISOString().split('T')[0] : '';
            const today = new Date().toISOString().split('T')[0];
            
            // Устанавливаем поля по умолчанию - те же, что отображаются в таблице
            const defaultFieldKeys = sortedVisibleFields.length > 0 
                ? sortedVisibleFields 
                : ['id', 'created_at', 'status'];

            setExportSettings({
                startDate: projectStartDate,
                endDate: today,
                fields: defaultFieldKeys,
                format: 'csv'
            });
        }
    }, [isOpen, project.start_date, sortedVisibleFields]); // sortedVisibleFields теперь мемоизирован

    // Обработчик изменения дат
    const handleDateChange = (field, value) => {
        setExportSettings(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // Обработчик изменения полей
    const handleFieldToggle = (fieldKey) => {
        setExportSettings(prev => ({
            ...prev,
            fields: prev.fields.includes(fieldKey)
                ? prev.fields.filter(f => f !== fieldKey)
                : [...prev.fields, fieldKey]
        }));
    };

    // Выбрать все поля в категории
    const selectAllInCategory = (category) => {
        const categoryFields = fieldsByCategory[category]?.map(f => f.key) || [];
        setExportSettings(prev => ({
            ...prev,
            fields: [...new Set([...prev.fields, ...categoryFields])]
        }));
    };

    // Снять выбор всех полей в категории
    const deselectAllInCategory = (category) => {
        const categoryFields = fieldsByCategory[category]?.map(f => f.key) || [];
        setExportSettings(prev => ({
            ...prev,
            fields: prev.fields.filter(f => !categoryFields.includes(f))
        }));
    };

    // Выбрать все поля
    const selectAllFields = () => {
        const allFieldKeys = combinedFields.map(f => f.key);
        setExportSettings(prev => ({
            ...prev,
            fields: allFieldKeys
        }));
    };

    // Снять выбор всех полей
    const deselectAllFields = () => {
        setExportSettings(prev => ({
            ...prev,
            fields: []
        }));
    };

    // Обработчик скачивания
    const handleExport = async () => {
        if (exportSettings.fields.length === 0) {
            alert('Выберите хотя бы одно поле для выгрузки');
            return;
        }

        setIsLoading(true);

        try {
            const params = new URLSearchParams({
                start_date: exportSettings.startDate,
                end_date: exportSettings.endDate,
                fields: exportSettings.fields.join(','),
                format: exportSettings.format,
                project_id: project.id
            });

            const response = await fetch(`/exportCsv?${params}`, {
                method: 'GET',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                    'X-Requested-With': 'XMLHttpRequest',
                    'Accept': 'application/json, text/csv, application/vnd.ms-excel',
                },
                credentials: 'include',
            });

            if (response.status === 302) {
                const redirectUrl = response.headers.get('Location');
                if (redirectUrl && redirectUrl.includes('/login')) {
                    window.location.href = redirectUrl;
                    return;
                }
            }

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const contentType = response.headers.get('content-type');
            
            if (contentType && contentType.includes('application/json')) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Unknown error');
            }

            const blob = await response.blob();
            
            if (blob.size === 0) {
                throw new Error('Получен пустой файл');
            }

            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `leads_${project.name}_${exportSettings.startDate}_${exportSettings.endDate}.${exportSettings.format}`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            onClose();
            
        } catch (error) {
            console.error('Export error:', error);
            alert('Ошибка при выгрузке: ' + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    // Функция для получения названия категории
    const getCategoryLabel = (category) => {
        const labels = {
            'project': 'Поля проекта',
            'basic': 'Основные поля',
            'relation': 'Связанные данные',
            'custom': 'Дополнительные поля'
        };
        return labels[category] || category;
    };

    return (
        <Modal show={isOpen} onClose={onClose} maxWidth="2xl">
            <div className="p-6">
                <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                    Настройки выгрузки лидов
                </h2>

                {/* Настройки дат */}
                <div className="mb-6">
                    <h3 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-3">
                        Период выгрузки
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Дата начала
                            </label>
                            <input
                                type="date"
                                value={exportSettings.startDate}
                                onChange={(e) => handleDateChange('startDate', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Дата окончания
                            </label>
                            <input
                                type="date"
                                value={exportSettings.endDate}
                                onChange={(e) => handleDateChange('endDate', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            />
                        </div>
                    </div>
                </div>

                {/* Настройки полей */}
                <div className="mb-6">
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="text-md font-medium text-gray-700 dark:text-gray-300">
                            Выбор полей для выгрузки
                        </h3>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={selectAllFields}
                                className="text-xs px-2 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-300"
                            >
                                Выбрать все
                            </button>
                            <button
                                type="button"
                                onClick={deselectAllFields}
                                className="text-xs px-2 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-300"
                            >
                                Снять все
                            </button>
                        </div>
                    </div>

                    <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-md p-3 dark:border-gray-600">
                        {Object.entries(fieldsByCategory).map(([category, fields]) => (
                            <div key={category} className="mb-4 last:mb-0">
                                <div className="flex justify-between items-center mb-2">
                                    <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                        {getCategoryLabel(category)}
                                    </h4>
                                    <div className="flex gap-1">
                                        <button
                                            type="button"
                                            onClick={() => selectAllInCategory(category)}
                                            className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400"
                                        >
                                            Все
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => deselectAllInCategory(category)}
                                            className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400"
                                        >
                                            Ничего
                                        </button>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    {fields.map(field => (
                                        <label key={field.key} className="flex items-center space-x-2">
                                            <input
                                                type="checkbox"
                                                checked={exportSettings.fields.includes(field.key)}
                                                onChange={() => handleFieldToggle(field.key)}
                                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                                            />
                                            <span className="text-sm text-gray-700 dark:text-gray-300">
                                                {field.label}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Формат выгрузки */}
                <div className="mb-6">
                    <h3 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-3">
                        Формат выгрузки
                    </h3>
                    <div className="flex gap-4">
                        <label className="flex items-center">
                            <input
                                type="radio"
                                value="csv"
                                checked={exportSettings.format === 'csv'}
                                onChange={(e) => setExportSettings(prev => ({ ...prev, format: e.target.value }))}
                                className="mr-2"
                            />
                            <span className="text-sm text-gray-700 dark:text-gray-300">CSV</span>
                        </label>
                        <label className="flex items-center">
                            <input
                                type="radio"
                                value="xlsx"
                                checked={exportSettings.format === 'xlsx'}
                                onChange={(e) => setExportSettings(prev => ({ ...prev, format: e.target.value }))}
                                className="mr-2"
                            />
                            <span className="text-sm text-gray-700 dark:text-gray-300">Excel</span>
                        </label>
                    </div>
                </div>

                {/* Кнопки действий */}
                <div className="flex justify-end gap-3">
                    <SecondaryButton onClick={onClose}>
                        Отмена
                    </SecondaryButton>
                    <PrimaryButton 
                        onClick={handleExport} 
                        disabled={isLoading || exportSettings.fields.length === 0}
                    >
                        {isLoading ? 'Выгрузка...' : 'Скачать'}
                    </PrimaryButton>
                </div>
            </div>
        </Modal>
    );
}
