import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';

import TextInput from '@/Components/TextInput';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Edit({field}) {

    
    const { data, setData, patch, processing, errors, reset } = useForm({
        name: field.name,
        title: field.title,
        type: field.type,
    });
    const submit = (e) => {
        e.preventDefault();

        patch(route('fields.update', field.id), {
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
        pageTitle="Поля"
    >
        <Head title="Поля" />


        <form onSubmit={submit}>
        <div className="space-y-6">
            <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
                <div class="flex flex-col justify-between gap-5 border-b border-gray-200 px-5 py-4 sm:flex-row sm:items-center dark:border-gray-800">
                    <div>
                        <h3 class="text-lg font-semibold text-gray-800 dark:text-white/90">Поле "{field.title}"</h3>
                    </div>
                    <div class="flex gap-3">
                        <Link 
                            class="bg-brand-500 shadow-sm hover inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-600 keychainify-checked" 
                            href={route('fields.index')} data-discover="true">
                                Назад
                        </Link>
                    </div>
                </div>
                <div className="p-4 sm:p-6 dark:border-gray-800">
                
                    <div className="grid grid-cols-1 md:grid-cols-3 mb-3 gap-3">
                    <div>
                            <InputLabel>
                                Title RU <span className="text-error-500">*</span>{" "}
                            </InputLabel>
                            <TextInput
                                    id="title"
                                    type="text"
                                    name="title"
                                    value={data.title}
                                    className="mt-1 block w-full"
                                    onChange={(e) => setData('title', e.target.value)}
                                />
                            {errors[`title`] && (
                                <p className="text-red-500 text-sm mt-1">Необходимо указать title</p>
                            )}
                        </div>
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
                        <div>
                            <InputLabel>
                                Type <span className="text-error-500">*</span>{" "}
                            </InputLabel>
                            <select
                                value={data.type}
                                onChange={(e) => setData('type', e.target.value)}
                                className="h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-11 text-sm shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
                            >
                                <option value="string">Текст</option>
                                <option value="number">Число</option>
                                <option value="datetime">Дата/время</option>
                                <option value="boolean">Да/Нет</option>
                            </select>
                            {errors[`type`] && (
                                <p className="text-red-500 text-sm mt-1">Необходимо указать type</p>
                            )}
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