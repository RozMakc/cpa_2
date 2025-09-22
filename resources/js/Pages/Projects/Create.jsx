import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import Select from '@/Components/Select';
import Checkbox from '@/Components/Checkbox';
import { useState, useMemo, useEffect } from 'react';

import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    } from '@dnd-kit/core';
import {
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
    arrayMove
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Eye, EyeOff } from 'lucide-react';

// Sortable Item Component
function SortableFieldItem({ fieldName, fieldTitle, isVisible, onToggle, isDragging }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: fieldName });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 ${
                isDragging ? 'shadow-lg z-10' : ''
            }`}
        >
            <div className="flex items-center flex-1 gap-3">
                {/* Handle for dragging */}
                <div
                    {...attributes}
                    {...listeners}
                    className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                    <GripVertical size={16} />
                </div>

                <Checkbox
                    checked={isVisible}
                    onChange={(e) => onToggle(fieldName, e.target.checked)}
                    className=""
                />
                
                <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {fieldTitle}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                        {fieldName}
                    </div>
                </div>
            </div>

            <button
                type="button"
                onClick={() => onToggle(fieldName, !isVisible)}
                className="ml-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                title={isVisible ? 'Скрыть поле' : 'Показать поле'}
            >
                {isVisible ? <Eye size={16} /> : <EyeOff size={16} />}
            </button>
        </div>
    );
}


export default function Create({ managers, users, clients, offers, availableFields, standartFields }) {
    
    const createDefaultVisibleFields = () => {
        const defaultFields = {};
        
        // Проходим по всем стандартным полям и добавляем их как видимые
        Object.keys(standartFields || {}).forEach((fieldName, index) => {
            if (availableFields[fieldName]) {
                defaultFields[fieldName] = {
                    visible: true,
                    order: index,
                    title: availableFields[fieldName] || standartFields[fieldName] || fieldName
                };
            }
        });
        
        return defaultFields;
    };
    
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        start_date: new Date().toISOString().split('T')[0],
        client_id: '',
        offer_id: '',
        managers: [],
        users: [],
        visible_fields: createDefaultVisibleFields(),
        is_active: true,
        is_private: false,
    });

    const [fieldSearch, setFieldSearch] = useState('');

    // Инициализация полей по умолчанию при загрузке
    useEffect(() => {
        // Убедимся что все стандартные поля есть в availableFields
        const initializedVisibleFields = createDefaultVisibleFields();
        setData('visible_fields', initializedVisibleFields);
    }, [availableFields, standartFields]);

    // Фильтрация полей по поиску
    const filteredFields = useMemo(() => {
        return Object.entries(availableFields)
            .filter(([fieldName, fieldTitle]) => 
                fieldName.toLowerCase().includes(fieldSearch.toLowerCase()) ||
                fieldTitle.toLowerCase().includes(fieldSearch.toLowerCase())
            )
            .reduce((acc, [key, value]) => {
                acc[key] = value;
                return acc;
            }, {});
    }, [availableFields, fieldSearch]);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleFieldToggle = (fieldName, isVisible) => {
        setData('visible_fields', {
            ...data.visible_fields,
            [fieldName]: {
                visible: isVisible,
                order: Object.keys(data.visible_fields).length,
                title: availableFields[fieldName]
            }
        });
    };
    const visibleFieldsInOrder = useMemo(() => {
        return Object.entries(data.visible_fields)
            .filter(([_, settings]) => settings.visible)
            .sort(([_, a], [__, b]) => (a.order || 0) - (b.order || 0))
            .map(([fieldName]) => fieldName);
    }, [data.visible_fields]);
    const handleDragEnd = (event) => {
        const { active, over } = event;

        if (active.id !== over?.id) {
            const oldIndex = visibleFieldsInOrder.indexOf(active.id);
            const newIndex = visibleFieldsInOrder.indexOf(over.id);

            if (oldIndex !== -1 && newIndex !== -1) {
                const reorderedFields = arrayMove(visibleFieldsInOrder, oldIndex, newIndex);
                
                // Update order in visible_fields
                const updatedVisibleFields = { ...data.visible_fields };
                reorderedFields.forEach((fieldName, index) => {
                    if (updatedVisibleFields[fieldName]) {
                        updatedVisibleFields[fieldName].order = index;
                    }
                });

                setData('visible_fields', updatedVisibleFields);
            }
        }
    };

    // Get hidden fields
    const hiddenFields = useMemo(() => {
        return Object.entries(availableFields)
            .filter(([fieldName]) => !data.visible_fields[fieldName]?.visible)
            .filter(([fieldName, fieldTitle]) => 
                fieldName.toLowerCase().includes(fieldSearch.toLowerCase()) ||
                fieldTitle.toLowerCase().includes(fieldSearch.toLowerCase())
            );
    }, [availableFields, data.visible_fields, fieldSearch]);

    const handleFieldOrderChange = (fieldName, newOrder) => {
        const updatedFields = { ...data.visible_fields };
        
        // Обновляем порядок всех полей
        Object.entries(updatedFields).forEach(([name, settings]) => {
            if (name === fieldName) {
                updatedFields[name].order = newOrder;
            } else if (updatedFields[name].order >= newOrder) {
                updatedFields[name].order += 1;
            }
        });

        setData('visible_fields', updatedFields);
    };

    const submit = (e) => {
        console.log('sub,it')
        e.preventDefault();
        post(route('projects.store'));
    };

    return (
        <AuthenticatedLayout
            pageTitle="Создание проекта"
        >
        <Head title="Создание проекта" />
            <form onSubmit={submit} className="space-y-6">
                <div className="space-y-6">
                    <div className="mb-5 rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
                        <div class="flex flex-col justify-between gap-5 border-b border-gray-200 px-5 py-4 sm:flex-row sm:items-center dark:border-gray-800">
                            <h3 class="text-lg font-semibold text-gray-800 dark:text-white/90">
                                Создание проекта
                            </h3>
                            <Link
                                href={route('projects.index')}
                                class="bg-brand-500 shadow-sm hover inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-600 keychainify-checked" 
                            >
                                Назад
                            </Link>
                        </div>
            
                        {/* Основная информация */}
                        <div className="p-4 sm:p-6 dark:border-gray-800">
                            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                                Основная информация
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <InputLabel htmlFor="name" value="Название проекта *" />
                                    <TextInput
                                        id="name"
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        className="mt-1 block w-full"
                                        required
                                    />
                                    {errors.name && (
                                        <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                                    )}
                                </div>

                                <div>
                                    <InputLabel htmlFor="start_date" value="Дата начала *" />
                                    <TextInput
                                        id="start_date"
                                        type="date"
                                        value={data.start_date}
                                        onChange={(e) => setData('start_date', e.target.value)}
                                        className="mt-1 block w-full"
                                        required
                                    />
                                    {errors.start_date && (
                                        <p className="text-red-500 text-sm mt-1">{errors.start_date}</p>
                                    )}
                                </div>

                                <div>
                                    <InputLabel htmlFor="client_id" value="Клиент" />
                                    <Select
                                        id="client_id"
                                        value={data.client_id}
                                        onChange={(e) => setData('client_id', e.target.value)}
                                        className="mt-1 block w-full"
                                    >
                                        <option value="">Выберите клиента</option>
                                        {clients.map(client => (
                                            <option key={client.id} value={client.id}>
                                                {client.name}
                                            </option>
                                        ))}
                                    </Select>
                                </div>

                                <div>
                                    <InputLabel htmlFor="offer_id" value="Оффер" />
                                    <Select
                                        id="offer_id"
                                        value={data.offer_id}
                                        onChange={(e) => setData('offer_id', e.target.value)}
                                        className="mt-1 block w-full"
                                        required
                                    >
                                        <option value="">Выберите оффер</option>
                                        {offers.map(offer => (
                                            <option key={offer.id} value={offer.id}>
                                                {offer.name}
                                            </option>
                                        ))}
                                    </Select>
                                </div>

                                <div className=''>
                                    <div className="flex items-center mb-3">
                                        <Checkbox
                                            id="is_active"
                                            checked={data.is_active}
                                            onChange={(e) => setData('is_active', e.target.checked)}
                                        />
                                        <InputLabel htmlFor="is_active" value="Активный проект" className="ml-2 !mb-0" />
                                    </div>


                                    <div className="flex items-center">
                                        <Checkbox
                                            id="is_private"
                                            checked={data.is_private}
                                            onChange={(e) => setData('is_private', e.target.checked)}
                                        />
                                        <InputLabel htmlFor="is_private" value="Приватный проект" className="ml-2 !mb-0" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
                            <div className="p-4 sm:p-6 dark:border-gray-800">
                                <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                                    Менеджеры проекта
                                </h2>

                                <div className="space-y-3">
                                    {managers.map(manager => (
                                        <label key={manager.id} className="flex items-center">
                                            <Checkbox
                                                checked={data.managers.includes(manager.id)}
                                                onChange={(e) => {
                                                    const updatedManagers = e.target.checked
                                                        ? [...data.managers, manager.id]
                                                        : data.managers.filter(id => id !== manager.id);
                                                    setData('managers', updatedManagers);
                                                }}
                                            />
                                            <span className="ml-2 text-gray-700 dark:text-gray-300">
                                                {manager.name} ({manager.email})
                                            </span>
                                        </label>
                                    ))}
                                </div>
                                {errors.managers && (
                                    <p className="text-red-500 text-sm mt-2">{errors.managers}</p>
                                )}
                            </div>
                        </div>

                        <div className={(data.is_private ? '' : 'hidden') + " rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]"}>
                            <div className="p-4 sm:p-6 dark:border-gray-800">
                                <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                                    Пользователи проекта
                                </h2>

                                <div className="space-y-3">
                                    {users.map(user => (
                                        <label key={user.id} className="flex items-center">
                                            <Checkbox
                                                checked={data.users.includes(user.id)}
                                                onChange={(e) => {
                                                    const updatedUsers = e.target.checked
                                                        ? [...data.users, user.id]
                                                        : data.users.filter(id => id !== user.id);
                                                    setData('users', updatedUsers);
                                                }}
                                            />
                                            <span className="ml-2 text-gray-700 dark:text-gray-300">
                                                {user.name} ({user.email})
                                            </span>
                                        </label>
                                    ))}
                                </div>
                                {errors.users && (
                                    <p className="text-red-500 text-sm mt-2">{errors.users}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Настройка полей */}
                    <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
                        <div className="p-4 sm:p-6 dark:border-gray-800">
                                {visibleFieldsInOrder.length > 0 && (
                                    <div className="mb-6">
                                        <h3 className="text-md font-medium text-gray-900 dark:text-white mb-3">
                                            Видимые поля ({visibleFieldsInOrder.length})
                                        </h3>
                                        <DndContext
                                            sensors={sensors}
                                            collisionDetection={closestCenter}
                                            onDragEnd={handleDragEnd}
                                        >
                                            <SortableContext items={visibleFieldsInOrder} strategy={verticalListSortingStrategy}>
                                                <div className="space-y-2">
                                                    {visibleFieldsInOrder.map(fieldName => (
                                                        <SortableFieldItem
                                                            key={fieldName}
                                                            fieldName={fieldName}
                                                            fieldTitle={availableFields[fieldName]}
                                                            isVisible={true}
                                                            onToggle={handleFieldToggle}
                                                        />
                                                    ))}
                                                </div>
                                            </SortableContext>
                                        </DndContext>
                                    </div>
                                )}

                                {/* Скрытые поля */}
                                {hiddenFields.length > 0 && (
                                    <div>
                                        <h3 className="text-md font-medium text-gray-900 dark:text-white mb-3">
                                            Скрытые поля ({hiddenFields.length})
                                        </h3>
                                        <div className="space-y-2">
                                            {hiddenFields.map(([fieldName, fieldTitle]) => (
                                                <div
                                                    key={fieldName}
                                                    className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-200 dark:bg-gray-900"
                                                >
                                                    <div className="flex items-center flex-1 gap-3">
                                                        <Checkbox
                                                            checked={false}
                                                            onChange={(e) => handleFieldToggle(fieldName, e.target.checked)}
                                                            className=""
                                                        />
                                                        
                                                        <div className="flex-1">
                                                            <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                                                {fieldTitle}
                                                            </div>
                                                            <div className="text-sm text-gray-500 dark:text-gray-500">
                                                                {fieldName}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <button
                                                        type="button"
                                                        onClick={() => handleFieldToggle(fieldName, true)}
                                                        className="ml-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                                                        title="Показать поле"
                                                    >
                                                        <EyeOff size={16} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {Object.keys(availableFields).length === 0 && (
                                    <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                                        Поля не найдены
                                    </p>
                                )}
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                        <div>
                        <PrimaryButton disabled={processing}>
                        {processing ? 'Сохранение...' : 'Сохранить'}
                        </PrimaryButton>
                        </div>
                    </div>
                
                
                </div>
            </form>
        </AuthenticatedLayout>
    );
}