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

export default function Create({offer = null, offers, landings = []}) {
    const [selectedOffer, setSelectedOffer] = useState(offer);
    const [availableLandings, setAvailableLandings] = useState(landings);

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        offer_id: offer?.id || null,
        landing_id: null,
        utm_source: '',
        utm_medium: '',
        utm_campaign: offer?.name || '',
        utm_term: '',
        utm_content: '',
        sub1: '',
        sub2: '',
        sub3: '',
        sub4: '',
        sub5: '',
        metadata: {}
    });

    useEffect(() => {
        if (data.offer_id) {
            console.log('new offer')
            const selected = offers.find(o => o.id == data.offer_id);
            setSelectedOffer(selected);
            setAvailableLandings(selected?.links || []);
            
            // Автоматически заполняем utm_campaign названием оффера
            if (selected && !data.utm_campaign) {
                setData('utm_campaign', selected.name);
            }
        } else {
            setSelectedOffer(null);
            setAvailableLandings([]);
        }
    }, [data.offer_id]);

    const submit = (e) => {
        e.preventDefault();

        post(route('link.store'), {
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
        pageTitle="Ссылки"
    >
        <Head title="Ссылки" />


        <form onSubmit={submit}>
        <div className="space-y-6">
            <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
                <div class="flex flex-col justify-between gap-5 border-b border-gray-200 px-5 py-4 sm:flex-row sm:items-center dark:border-gray-800">
                    <div>
                        <h3 class="text-lg font-semibold text-gray-800 dark:text-white/90">Создание ссылки</h3>
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
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 mb-5">
                    <div className=''>
                        <InputLabel>
                            Название
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
                    </div>
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 mb-3">
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

                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Лендинг</label>
                                <div className="relative">
                                        <select 
                                            id="landing_id"
                                            value={data.landing_id}
                                            onChange={(e) => setData('landing_id', e.target.value)}
                                            className="h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-11 text-sm shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
                                            disabled={processing || !data.offer_id}
                                        >
                                            <option value="">Выберите лендинг</option>
                                            {availableLandings.map(link => (
                                                <option key={link.id} value={link.id}>
                                                    {link.url}
                                                </option>
                                            ))}
                                        </select>
                                <svg className="absolute text-gray-700 dark:text-gray-400 right-3 top-1/2 -translate-y-1/2 pointer-events-none" width="20" height="20" viewBox="0 0 20 20" fill="none">
                                    <path d="M4.79175 8.02075L10.0001 13.2291L15.2084 8.02075" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                </div>
                                {errors.offer_id && (
                                    <p className="text-red-500 text-sm mt-1">Необходимо указать лендинг</p>
                                )}
                            </div>
                    </div>
                
                </div>
            </div>
            
            <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
            <div class="flex flex-col justify-between gap-5 border-b border-gray-200 px-5 py-4 sm:flex-row sm:items-center dark:border-gray-800">
                <div>
                    <h3 class="text-lg font-semibold text-gray-800 dark:text-white/90">UTM</h3>
                </div>

            </div>
            <div className="p-4 sm:p-6 dark:border-gray-800">
                <div className="grid mb-5 grid-cols-1 md:grid-cols-5 gap-3">
                    <div className=''>
                        <InputLabel>
                            Utm Campaign
                        </InputLabel>
                        <TextInput
                                id="utm_campaign"
                                type="text"
                                name="utm_campaign"
                                value={data.utm_campaign}
                                className="mt-1 block w-full"
                                isFocused={true}
                                onChange={(e) => setData('utm_campaign', e.target.value)}
                            />
                    </div>
                    <div className=''>
                        <InputLabel>
                            Utm Medium
                        </InputLabel>
                        <TextInput
                                id="utm_medium"
                                type="text"
                                name="utm_medium"
                                value={data.utm_medium}
                                className="mt-1 block w-full"
                                isFocused={true}
                                onChange={(e) => setData('utm_medium', e.target.value)}
                            />
                    </div>
                    <div className=''>
                        <InputLabel>
                            Utm Source
                        </InputLabel>
                        <TextInput
                                id="utm_source"
                                type="text"
                                name="utm_source"
                                value={data.utm_source}
                                className="mt-1 block w-full"
                                isFocused={true}
                                onChange={(e) => setData('utm_source', e.target.value)}
                            />
                    </div>
                    <div className=''>
                        <InputLabel>
                            Utm Content
                        </InputLabel>
                        <TextInput
                                id="utm_content"
                                type="text"
                                name="utm_content"
                                value={data.utm_content}
                                className="mt-1 block w-full"
                                isFocused={true}
                                onChange={(e) => setData('utm_content', e.target.value)}
                            />
                    </div>
                    <div className=''>
                        <InputLabel>
                            Utm Term
                        </InputLabel>
                        <TextInput
                                id="utm_term"
                                type="text"
                                name="utm_term"
                                value={data.utm_term}
                                className="mt-1 block w-full"
                                isFocused={true}
                                onChange={(e) => setData('utm_term', e.target.value)}
                            />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                    <div className=''>
                        <InputLabel>
                        Sub ID 1
                        </InputLabel>
                        <TextInput
                                id="sub1"
                                type="text"
                                name="sub1"
                                value={data.sub1}
                                className="mt-1 block w-full"
                                isFocused={true}
                                onChange={(e) => setData('sub1', e.target.value)}
                            />
                    </div>
                    <div className=''>
                        <InputLabel>
                        Sub ID 2
                        </InputLabel>
                        <TextInput
                                id="sub2"
                                type="text"
                                name="sub2"
                                value={data.sub2}
                                className="mt-1 block w-full"
                                isFocused={true}
                                onChange={(e) => setData('sub2', e.target.value)}
                            />
                    </div>
                    <div className=''>
                        <InputLabel>
                        Sub ID 3
                        </InputLabel>
                        <TextInput
                                id="sub3"
                                type="text"
                                name="sub3"
                                value={data.sub3}
                                className="mt-1 block w-full"
                                isFocused={true}
                                onChange={(e) => setData('sub3', e.target.value)}
                            />
                    </div>
                    <div className=''>
                        <InputLabel>
                        Sub ID 4
                        </InputLabel>
                        <TextInput
                                id="sub4"
                                type="text"
                                name="sub4"
                                value={data.sub4}
                                className="mt-1 block w-full"
                                isFocused={true}
                                onChange={(e) => setData('sub4', e.target.value)}
                            />
                    </div>
                    <div className=''>
                        <InputLabel>
                            Sub ID 5
                        </InputLabel>
                        <TextInput
                                id="sub5"
                                type="text"
                                name="sub5"
                                value={data.sub5}
                                className="mt-1 block w-full"
                                isFocused={true}
                                onChange={(e) => setData('sub5', e.target.value)}
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