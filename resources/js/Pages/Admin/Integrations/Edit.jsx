import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';

import TextInput from '@/Components/TextInput';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useEffect, useState } from 'react';

export default function Edit({integration, fields}) {
    const [apiFields, setApiFields] = useState(integration.api_fields || []);
    const [newApiField, setNewApiField] = useState({ name: '', title: '', type: 'string' });

    const { data, setData, put, processing, errors, reset } = useForm({
        name: integration.name,
        field_mappings: integration.field_mappings || {},
        api_fields: apiFields,
    });

    const fieldsArray = Object.entries(fields || {}).map(([name, title]) => ({
        name,
        title
    }));

    useEffect(() => {
        setData('api_fields', apiFields);
    }, [apiFields]);

    const handleFieldMappingChange = (localField, apiFieldName) => {
        setData('field_mappings', {
            ...data.field_mappings,
            [localField]: apiFieldName
        });
    };

    const addApiField = () => {
        if (newApiField.name.trim()) {
            setApiFields(prev => [...prev, {
                name: newApiField.name.trim(),
                title: newApiField.title.trim() || newApiField.name.trim(),
                type: newApiField.type
            }]);
            setNewApiField({ name: '', title: '', type: 'string' });
        }
    };

    const removeApiField = (index) => {
        setApiFields(prev => prev.filter((_, i) => i !== index));
        
        // Удаляем маппинги для удаленного поля
        const updatedMappings = { ...data.field_mappings };
        Object.keys(updatedMappings).forEach(localField => {
            if (updatedMappings[localField] === apiFields[index].name) {
                delete updatedMappings[localField];
            }
        });
        setData('field_mappings', updatedMappings);
    };

    const submit = (e) => {
        e.preventDefault();

        put(route('integration.update', integration.id), {
            onSuccess: () => {
                // Обработка успешного сохранения
            },
            onError: (errors) => {
                // Обработка ошибок
            }
        });
    };

  return (
    <AuthenticatedLayout
        pageTitle="Интеграции"
    >
        <Head title="Интеграции" />


        <form onSubmit={submit}>
        <div className="space-y-6">
            <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
                <div class="flex flex-col justify-between gap-5 border-b border-gray-200 px-5 py-4 sm:flex-row sm:items-center dark:border-gray-800">
                    <div>
                        <h3 class="text-lg font-semibold text-gray-800 dark:text-white/90">Интеграция с {integration.name}</h3>
                    </div>
                    <div class="flex gap-3">
                        <Link 
                            class="bg-brand-500 shadow-sm hover inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-600 keychainify-checked" 
                            href={route('integration.index')} data-discover="true">
                                Назад
                        </Link>
                    </div>
                </div>
                <div className="p-4 sm:p-6 dark:border-gray-800">
                
                    <div className="grid grid-cols-2 md:grid-cols-2 mb-3">
                        <div>
                            <InputLabel>
                                Name <span className="text-error-500">*</span>{" "}
                            </InputLabel>
                            <TextInput
                                id="name"
                                type="text"
                                name="name"
                                value={data.name}
                                className="mt-1 block w-full"
                                isFocused={true}
                                onChange={(e) => setData('name', e.target.value)}
                            />
                            {errors[`name`] && (
                                <p className="text-red-500 text-sm mt-1">Необходимо указать name</p>
                            )}
                        </div>
                    </div>

                    <div className="mb-3 mt-7">
                        <InputLabel>
                            Поля
                        </InputLabel>

                        
                            {/* Добавление полей API */}
                            <div className="mb-6">
                                <InputLabel>Добавить поле API</InputLabel>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-2">
                                    <div>
                                        <TextInput
                                            placeholder="Название поля (key)"
                                            value={newApiField.name}
                                            onChange={(e) => setNewApiField(prev => ({
                                                ...prev,
                                                name: e.target.value
                                            }))}
                                            className="w-full"
                                        />
                                    </div>
                                    <div>
                                        <TextInput
                                            placeholder="Отображаемое название"
                                            value={newApiField.title}
                                            onChange={(e) => setNewApiField(prev => ({
                                                ...prev,
                                                title: e.target.value
                                            }))}
                                            className="w-full"
                                        />
                                    </div>
                                    <div>
                                        <select
                                            value={newApiField.type}
                                            onChange={(e) => setNewApiField(prev => ({
                                                ...prev,
                                                type: e.target.value
                                            }))}
                                            className="h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-11 text-sm shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
                                        >
                                            <option value="string">Текст</option>
                                            <option value="number">Число</option>
                                            <option value="datetime">Дата/время</option>
                                            <option value="boolean">Да/Нет</option>
                                        </select>
                                    </div>
                                    <div>
                                        <button
                                            type="button"
                                            onClick={addApiField}
                                            className="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg transition"
                                        >
                                            Добавить поле
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Список полей API */}
                            {apiFields.length > 0 && (
                                <div className="mb-6">
                                    <InputLabel>Поля API</InputLabel>
                                    <div className="bg-gray-50 rounded-lg p-4 mt-2 dark:bg-gray-800">
                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-2 font-semibold">
                                            <div>Название поля</div>
                                            <div>Отображаемое название</div>
                                            <div>Тип</div>
                                            <div>Действие</div>
                                        </div>
                                        
                                        {apiFields.map((apiField, index) => (
                                            <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3 items-center py-2 border-b border-gray-200 dark:border-gray-700">
                                                <div className="font-mono text-sm">{apiField.name}</div>
                                                <div>{apiField.title}</div>
                                                <div>
                                                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full dark:bg-blue-900 dark:text-blue-200">
                                                        {apiField.type}
                                                    </span>
                                                </div>
                                                <div>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeApiField(index)}
                                                        className="text-red-500 hover:text-red-700 text-sm"
                                                    >
                                                        Удалить
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Сопоставление полей */}
                            <div className="mb-6">
                                <InputLabel>Сопоставление полей</InputLabel>
                                
                                <div className="bg-gray-50 rounded-lg p-4 mt-2 dark:bg-gray-800">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2 font-semibold">
                                        <div>Локальное поле</div>
                                        <div>→</div>
                                        <div>Поле API</div>
                                    </div>
                                    
                                    {fieldsArray.length > 0 ? (
                                        fieldsArray.map((field) => (
                                            <div key={field} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3 items-center py-2 border-b border-gray-200 dark:border-gray-700">
                                                <div className="font-medium text-gray-700 dark:text-gray-300">
                                                    {field.title}
                                                    <span className="text-xs text-gray-500 ml-2">({field.name})</span>
                                                </div>
                                                
                                                <div className="text-center text-gray-400">→</div>
                                                
                                                <div>
                                                    <select
                                                        value={data.field_mappings[field.name] || ''}
                                                        onChange={(e) => handleFieldMappingChange(field.name, e.target.value)}
                                                        className="h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-11 text-sm shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
                                                    >
                                                        <option value="">-- Не сопоставлять --</option>
                                                        {apiFields.map(apiField => (
                                                            <option key={apiField.name} value={apiField.name}>
                                                                {apiField.title} ({apiField.name})
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-gray-500">Поля не найдены</div>
                                    )}
                                </div>
                            </div>
                    </div>


                    <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-start">
                        <div>
                        <PrimaryButton disabled={processing}>
                        {processing ? 'Сохранение...' : 'Сохранить'}
                        </PrimaryButton>
                        </div>
                    </div>
                </div>
            </div>
            

            

        </div>
        </form>
    </AuthenticatedLayout>
  );
}