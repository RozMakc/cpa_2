import { Link } from '@inertiajs/react';
import StatusBadge from '@/Components/Lead/StatusBadge';
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "../ui/table";
import { Eye } from 'lucide-react';
import { useRoles } from '@/hooks/useRoles';
import PrimaryButton from '../PrimaryButton';
import LeadStatusSelect from './LeadStatusSelect';
import { useEffect, useState } from 'react';
import Checkbox from '../Checkbox';

const rowStatusClass = (status) => ({
    new: 'bg-blue-50/70 dark:bg-blue-500/10',
    invited: 'bg-cyan-50/70 dark:bg-cyan-500/10',
    accepted: 'bg-green-50/70 dark:bg-green-500/10',
    no_answer: 'bg-yellow-50/70 dark:bg-yellow-500/10',
    self_rejected: 'bg-orange-50/70 dark:bg-orange-500/10',
    rejected: 'bg-red-50/70 dark:bg-red-500/10',
    invalid_number: 'bg-red-50/70 dark:bg-red-500/10',
    duplicate: 'bg-gray-100/80 dark:bg-white/5',
    test: 'bg-purple-50/70 dark:bg-purple-500/10',
    other: 'bg-slate-50 dark:bg-white/[0.03]',
}[status] || '');

export default function ProjectLeadTable({ 
    leads: initialLeads, 
    project, 
    availableFields, 
    fieldMappings = {}, 
    setStats,
    selectedLeads,
    onSelectedLeadsChange 
}) {
    const { hasRole, hasAnyRole } = useRoles();
    const [leads, setLeads] = useState(initialLeads);
    const [editingLeadId, setEditingLeadId] = useState(null);
    const [savingField, setSavingField] = useState(null);
    const [selectedAll, setSelectedAll] = useState(false);

    const toggleSelectAll = () => {
        if (selectedAll) {
            onSelectedLeadsChange([]);
        } else {
            const allLeadIds = leads.data.map(lead => lead.id);
            onSelectedLeadsChange(allLeadIds);
        }
        setSelectedAll(!selectedAll);
    };

    const toggleSelectLead = (leadId) => {
        const newSelectedLeads = selectedLeads.includes(leadId)
            ? selectedLeads.filter(id => id !== leadId)
            : [...selectedLeads, leadId];
        
        onSelectedLeadsChange(newSelectedLeads);
        
        // Проверяем, выбраны ли все лиды на странице
        setSelectedAll(newSelectedLeads.length === leads.data.length);
    };

    useEffect(() => {
        const handleLeadsBulkUpdated = (event) => {
            const { leadIds, actionType, status, isCounted } = event.detail;
            
            // Обновляем локальное состояние
            setLeads(prevLeads => ({
                ...prevLeads,
                data: prevLeads.data.map(lead => {
                    if (leadIds.includes(lead.id)) {
                        return {
                            ...lead,
                            ...({ status: status, is_counted: isCounted })
                        };
                    }
                    return lead;
                })
            }));
            
            // Обновляем статистику
            fetch(`/leadsGetStats/${project.id}`)
                .then(response => response.json())
                .then(data => setStats(data))
                .catch(error => console.error('Error fetching stats:', error));
        };

        window.addEventListener('leadsBulkUpdated', handleLeadsBulkUpdated);

        return () => {
            window.removeEventListener('leadsBulkUpdated', handleLeadsBulkUpdated);
        };
    }, [project.id, setStats]);

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

    const saveField = async (leadId, fieldName, value) => {
        setEditingLeadId(null);
        setSavingField({ leadId, fieldName });

        try {
            const endpoint = `/leadsUpdateData/${leadId}/${fieldName}`;
            const response = await fetch(endpoint, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                },
                body: JSON.stringify({ [fieldName]: value })
            });

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.message);
            }

            setLeads(prevLeads => ({
                ...prevLeads,
                data: prevLeads.data.map(lead => 
                    lead.id === leadId 
                        ? { ...lead, [fieldName]: value }
                        : lead
                )
            }));
            // Обновляем данные в реальном времени
            window.dispatchEvent(new CustomEvent('leadUpdated', {
                detail: { leadId, fieldName, value }
            }));

        } catch (error) {
            console.error('Error saving field:', error);
            alert('Ошибка сохранения: ' + error.message);
        } finally {
            setSavingField(null);
        }
    };

    const EditableComment = ({ lead }) => {
        const [comment, setComment] = useState(lead.comment || '');

        const handleBlur = () => {
            if (comment !== lead.comment) {
                saveField(lead.id, 'comment', comment);
            }
        };

        const handleKeyPress = (e) => {
            if (e.key === 'Enter') {
                e.target.blur();
            }
        };

        return (
            <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                onBlur={handleBlur}
                onKeyPress={handleKeyPress}
                placeholder="Комментарий..."
                className="min-w-fit px-2 py-1 text-sm border border-gray-300 rounded resize-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                rows={2}
                disabled={savingField?.leadId === lead.id && savingField?.fieldName === 'comment'}
            />
        );
    };

    const StatusSelect = ({ lead }) => {
        const [status, setStatus] = useState(lead.status || 'new');
        const handleChange = (e) => {
            const newStatus = e.target.value;
            setStatus(newStatus);
            saveField(lead.id, 'status', newStatus);
        };

        return (
            <select
                value={status}
                onChange={handleChange}
                className="w-fit px-2 text-sm text-center border border-gray-300 rounded-md py-2 bg-blue-500 text-white"
                disabled={savingField?.leadId === lead.id && savingField?.fieldName === 'status'}
            >
                {statusOptions.map(option => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        );
    };

    const CountedSelect = ({ lead }) => {
        const [isCounted, setIsCounted] = useState(lead.is_counted ?? true);

        const handleChange = (e) => {
            const counted = e.target.value;
            setIsCounted(counted);
            saveField(lead.id, 'is_counted', counted);
        };

        return (
            <select
                value={isCounted}
                onChange={handleChange}
                className={(isCounted == 1 ? 'bg-green-600' : 'bg-red-600') +" w-fit px-2 text-sm border rounded-md py-2 text-white"}
                disabled={savingField?.leadId === lead.id && savingField?.fieldName === 'counted'}
            >
                <option className='bg-green-600' value="1">Засчитан</option>
                <option className='bg-red-600' value="0">Не засчитан</option>
            </select>
        );
    };
    
    useEffect(() => {
        setLeads(initialLeads);
    }, [initialLeads]);

    useEffect(() => {
        const handleLeadUpdated = async (event) => {
            const { leadId, fieldName, value } = event.detail;
            
            // Находим lead в текущих данных и обновляем его
            const updatedLeads = leads.data.map(lead => {
                if (lead.id === leadId) {
                    return {
                        ...lead,
                        [fieldName]: value
                    };
                }
                return lead;
            });

            try {
                const endpoint = `/leadsGetStats/${project.id}`;
                const response = await fetch(endpoint, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                    }
                });
    
                const data = await response.json();
    
                if (!data) {
                    throw new Error(data.message);
                }
                setStats(data);
    
            } catch (error) {
                console.error('Error get stats:', error);
            }
    
        };
    
        window.addEventListener('leadUpdated', handleLeadUpdated);
    
        return () => {
            window.removeEventListener('leadUpdated', handleLeadUpdated);
        };
    }, [leads.data]);

    // Получаем видимые поля из настроек проекта
    const visibleFields = project.visible_fields || {};
    
    // Сортируем поля по порядку
    const sortedVisibleFields = Object.entries(visibleFields)
        .filter(([_, settings]) => settings?.visible)
        .sort(([_, a], [__, b]) => (a?.order || 0) - (b?.order || 0))
        .map(([fieldName]) => fieldName);

    // Функция для получения значения поля лида
    const getLeadFieldValue = (lead, fieldName) => {
        
        // Проверяем есть ли маппинг для этого поля
        const mappedField = fieldMappings[fieldName];

        // Если есть маппинг и поле начинается с "additional_data."
        if (mappedField) {
            if(mappedField.startsWith('additional_data.')){
                const additionalDataField = mappedField.replace('additional_data.', '');
                return lead.additional_data?.[additionalDataField] ?? '-';
            }
            return lead[mappedField]
        }

        // Стандартные поля
        const standardFields = {
            'id': lead.id,
            'name': lead.name,
            'email': lead.email,
            'phone': lead.phone,
            'tg_channel': lead.is_our_channel ? '-' : lead.tg_channel,
            'status': lead.status,
            'price': lead.price,
            'currency': lead.currency,
            'created_at': lead.created_at,
            'user': lead.user,
            'project': lead.project,
        };

        // Если поле стандартное
        if (standardFields[fieldName] !== undefined) {
            return standardFields[fieldName];
        }

        // Если поле в additional_data (прямой доступ)
        if (lead.additional_data && lead.additional_data[fieldName] !== undefined) {
            return lead.additional_data[fieldName];
        }

        // Если поле есть непосредственно в lead
        if (lead[fieldName] !== undefined) {
            return lead[fieldName];
        }

        return '-';
    };

    const calculateAge = (birthday) => {
        if (!birthday) return '-';

        try {
            const parts = birthday.split('.');
            const day = parseInt(parts[0], 10);
            const month = parseInt(parts[1], 10) - 1; // Месяцы в JS: 0-11
            const year = parseInt(parts[2], 10);

            const birthDate = new Date(year, month, day);
            if (isNaN(birthDate.getTime())) {
                return 'Неверная дата';
            }
            const today = new Date();
            let age = today.getFullYear() - birthDate.getFullYear();
            
            // Проверяем, был ли уже день рождения в этом году
            const monthDiff = today.getMonth() - birthDate.getMonth();
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }
            
            // Склонение лет
            const lastDigit = age % 10;
            const lastTwoDigits = age % 100;
            
            let yearsWord = 'лет';
            if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
                yearsWord = 'лет';
            } else if (lastDigit === 1) {
                yearsWord = 'год';
            } else if (lastDigit >= 2 && lastDigit <= 4) {
                yearsWord = 'года';
            }
            
            return age + ' ' + yearsWord;
            
        } catch (error) {
            return 'Неверная дата';
        }
    };
    // Функция для рендеринга значения поля
    const renderFieldValue = (lead, fieldName) => {
        const value = getLeadFieldValue(lead, fieldName);
        
        switch (fieldName) {
            case 'id':
                return (
                    <span className="text-gray-500 text-theme-sm dark:text-gray-400">
                        {value}
                    </span>
                );

            case 'user':
                return value ? (
                    <Link 
                        href={route('users.edit', value.id)}
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                        {value.name} (#{value.id})
                    </Link>
                ) : '-';
            case 'birthday':
                return (
                    <span className="text-gray-500 text-theme-sm dark:text-gray-400">
                        {value.toString()}<br/>
                        {calculateAge(value.toString())}
                    </span>
                );
            case 'offer':
                return value ? (
                    <Link href={route('projects.show', value.id)}>
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 overflow-hidden rounded-md">
                                <img
                                    width={32}
                                    height={32}
                                    src={value.image_path ? `/storage/${value.image_path}` : `/storage/offers/no-photo.png`}
                                    alt={value.name}
                                    className="object-cover w-full h-full"
                                />
                            </div>
                            <span className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                                {value.name}
                            </span>
                        </div>
                    </Link>
                ) : 'Нет';

            case 'price':
                return (
                    <span className="text-gray-500 text-center text-theme-sm dark:text-gray-400">
                        {value} {lead.currency}
                    </span>
                );

            case 'created_at':
                return (
                    <span className="text-gray-500 text-sm text-center dark:text-gray-400">
                        {new Date(value).toLocaleString()}
                    </span>
                );

            case 'status':
                return hasRole('admin') ? (
                    <LeadStatusSelect lead={lead} />
                ) : (
                    <StatusBadge status={value} />
                );

            default:
                // Для кастомных полей
                return (
                    <span className="text-gray-500 text-theme-sm dark:text-gray-400">
                        {value !== null && value !== undefined ? value.toString() : '-'}
                    </span>
                );
        }
    };


    // Функция для получения заголовка поля
    const getFieldTitle = (fieldName) => {
        const fieldSettings = visibleFields[fieldName];
        return fieldSettings?.title || fieldName;
    };

    return (
        <div className="max-w-full overflow-x-auto">


            <Table>
                {/* Table Header */}
                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                    <TableRow>
                        <TableCell
                            isHeader
                            className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400"
                        >
                            <Checkbox
                                id="select_all"
                                checked={selectedAll}
                                onChange={toggleSelectAll}
                            />
                        </TableCell>
                        
                        {sortedVisibleFields.map(fieldName => (
                            <TableCell
                                key={fieldName}
                                isHeader
                                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                            >
                                {getFieldTitle(fieldName)}
                            </TableCell>
                        ))}

                        <TableCell
                            isHeader
                            className="px-5 py-3 font-medium text-gray-500 text-center  text-theme-xs dark:text-gray-400"
                        >
                            Комментарий
                        </TableCell>
                        <TableCell
                            isHeader
                            className="px-5 py-3 font-medium text-gray-500 text-center  text-theme-xs dark:text-gray-400"
                        >
                            Статус
                        </TableCell>
                        <TableCell
                            isHeader
                            className="px-5 py-3 font-medium text-gray-500 text-center  text-theme-xs dark:text-gray-400"
                        >
                            Засчитан
                        </TableCell>
                    </TableRow>
                </TableHeader>

                {/* Table Body */}
                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                    {leads.data.length > 0 ? 
                    leads.data.map((lead) => (
                        <TableRow key={lead.id} className={rowStatusClass(lead.status)}>
                            <TableCell className="px-5 py-3 text-center">
                                <Checkbox
                                    id={`select_lead_${lead.id}`}
                                    checked={selectedLeads.includes(lead.id)}
                                    onChange={() => toggleSelectLead(lead.id)}
                                />
                            </TableCell>

                            {sortedVisibleFields.map(fieldName => (
                                <TableCell 
                                    key={fieldName} 
                                    className="px-5 py-3 text-start text-theme-sm"
                                >
                                    {renderFieldValue(lead, fieldName)}
                                </TableCell>
                            ))}
                            
                            <TableCell className="px-5 py-3 text-theme-sm text-center dark:text-gray-400">
                                <EditableComment lead={lead} />
                            </TableCell>
                            <TableCell className="px-5 py-3 text-theme-sm text-center dark:text-gray-400">
                                <StatusSelect lead={lead} />
                            </TableCell>
                            <TableCell className="px-5 py-3 text-theme-sm text-center dark:text-gray-400">
                                <CountedSelect lead={lead} />
                            </TableCell>
                        </TableRow>
                    )) : (
                        <TableRow>
                            <TableCell 
                                className="px-5 py-3 text-center text-gray-500 text-theme-sm dark:text-gray-400" 
                                colSpan={sortedVisibleFields.length + 1}
                            >
                                Лиды не найдены
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>


        </div>
    );
}
