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
import { useEffect, useState } from 'react';

export default function Create({offers}) {

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        phone: '',
        email: '',
        offer_id: null,
        metadata: {}
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('leads.store'), {
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
        pageTitle="Лиды"
    >
        <Head title="Лиды" />


        <form onSubmit={submit}>
        <div className="space-y-6">
            <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
                <div class="flex flex-col justify-between gap-5 border-b border-gray-200 px-5 py-4 sm:flex-row sm:items-center dark:border-gray-800">
                    <div>
                        <h3 class="text-lg font-semibold text-gray-800 dark:text-white/90">Добавление Лида</h3>
                    </div>
                    <div class="flex gap-3">
                        <Link 
                            class="bg-brand-500 shadow-sm hover inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-600 keychainify-checked" 
                            href={route('link.index')} data-discover="true">
                                Назад
                        </Link>
                    </div>
                </div>
                <div className="p-4 sm:p-6 dark:border-gray-800">

                <div className="grid mb-5 grid-cols-1 gap-5 md:grid-cols-3 mb-3">
                    <div>
                                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Оффер</label>
                                <div className="relative">
                                <select onChange={(e) => setData('offer_id', e.target.value)} className="h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-11 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 text-gray-400 dark:text-gray-400">
                                    <option value="" selected className="text-gray-700 dark:bg-gray-900 dark:text-gray-400">Выберите оффер</option>
                                    {offers.length && offers.map(item => (
                                        <option selected={item.id == data.offer_id} value={item.id} className="text-gray-700 dark:bg-gray-900 dark:text-gray-400">{item.name}</option>
                                    ))}
                                </select>
                                <svg className="absolute text-gray-700 dark:text-gray-400 right-3 top-1/2 -translate-y-1/2 pointer-events-none" width="20" height="20" viewBox="0 0 20 20" fill="none">
                                    <path d="M4.79175 8.02075L10.0001 13.2291L15.2084 8.02075" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                </div>
                                {errors.offer_id && (
                                    <p className="text-red-500 text-sm mt-1">Необходимо указать оффер</p>
                                )}
                            </div>


                    </div>


                    <div className="grid grid-cols-1 gap-5 md:grid-cols-3 mb-5">
                        <div className=''>
                            <InputLabel>
                                Имя
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
                        </div>
                        <div className=''>
                            <InputLabel>
                                Телефон
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
                        </div>
                        <div className=''>
                            <InputLabel>
                                Email
                            </InputLabel>
                            <TextInput
                                    id="email"
                                    type="email"
                                    name="email"
                                    value={data.email}
                                    className="mt-1 block w-full"
                                    isFocused={true}
                                    onChange={(e) => setData('email', e.target.value)}
                                />
                        </div>
                    </div>

                
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