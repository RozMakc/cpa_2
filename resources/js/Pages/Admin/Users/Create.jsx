import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import ImageUpload from '@/Components/ImageUpload';

import TextInput from '@/Components/TextInput';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';

import {
    TrashBinIcon,
    PlusIcon
} from '@/icons'

export default function Create({roles}) {

    
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        phone: '',
        email: '',
        password: '',
        role: 'user'
    });
    const submit = (e) => {
        e.preventDefault();

        post(route('users.store'), {
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
        pageTitle="Пользователи"
    >
        <Head title="Пользователи" />


        <form onSubmit={submit}>
        <div className="space-y-6">
            <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
                <div class="flex flex-col justify-between gap-5 border-b border-gray-200 px-5 py-4 sm:flex-row sm:items-center dark:border-gray-800">
                    <div>
                        <h3 class="text-lg font-semibold text-gray-800 dark:text-white/90">Создание пользователя</h3>
                    </div>
                    <div class="flex gap-3">
                        <Link 
                            class="bg-brand-500 shadow-sm hover inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-600 keychainify-checked" 
                            href={route('users.index')} data-discover="true">
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

                    <div className="grid grid-cols-1 md:grid-cols-2 mb-3">
                        <div>
                            <InputLabel>
                                Телефон <span className="text-error-500">*</span>{" "}
                            </InputLabel>
                            <TextInput
                                    id="phone"
                                    type="text"
                                    name="phone"
                                    value={data.phone}
                                    className="mt-1 block w-full"
                                    isFocused={true}
                                    onChange={(e) => setData('phone', e.target.value)}
                                />
                            {errors[`phone`] && (
                                <p className="text-red-500 text-sm mt-1">Необходимо указать phone</p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 mb-3">
                        <div>
                            <InputLabel>
                                Email <span className="text-error-500">*</span>{" "}
                            </InputLabel>
                            <TextInput
                                    id="email"
                                    type="text"
                                    name="email"
                                    value={data.email}
                                    className="mt-1 block w-full"
                                    isFocused={true}
                                    onChange={(e) => setData('email', e.target.value)}
                                />
                            {errors[`email`] && (
                                <p className="text-red-500 text-sm mt-1">Необходимо указать email</p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 mb-3">
                        <div>
                            <InputLabel>
                                Пароль <span className="text-error-500">*</span>{" "}
                            </InputLabel>
                            <TextInput
                                    id="password"
                                    type="text"
                                    name="password"
                                    value={data.password}
                                    className="mt-1 block w-full"
                                    isFocused={true}
                                    onChange={(e) => setData('password', e.target.value)}
                                />
                            {errors[`password`] && (
                                <p className="text-red-500 text-sm mt-1">Необходимо указать password</p>
                            )}
                        </div>
                    </div>
                
                    <div className="grid grid-cols-1 md:grid-cols-2 mb-3">
                        <div>
                            <InputLabel>
                                Роль <span className="text-error-500">*</span>{" "}
                            </InputLabel>
                           
                            <select 
                                value={data.role}
                                onChange={(e) => {
                                    setData('role', e.target.value);
                                }}
                                className="h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-11 text-sm shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
                                disabled={processing}
                            >
                                {['user','admin'].map((role, index) => (
                                    <option key={index} value={role}>
                                        {role}
                                    </option>
                                ))}
                            </select>
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