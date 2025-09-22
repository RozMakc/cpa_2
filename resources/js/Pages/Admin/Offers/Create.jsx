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

export default function Create({categories, countries, integrations}) {

    
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        description: '',
        category_id: null,
        integration_id: null,
        prices: [{country_id: 1, price: 1000}],
        links: [''],
        image: null
    });
    const submit = (e) => {
        e.preventDefault();

        post(route('offer.store'), {
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
        pageTitle="Офферы"
    >
        <Head title="Офферы" />


        <form onSubmit={submit}>
        <div className="space-y-6">
            <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
                <div class="flex flex-col justify-between gap-5 border-b border-gray-200 px-5 py-4 sm:flex-row sm:items-center dark:border-gray-800">
                    <div>
                        <h3 class="text-lg font-semibold text-gray-800 dark:text-white/90">Создание оффера</h3>
                    </div>
                    <div class="flex gap-3">
                        <Link 
                            class="bg-brand-500 shadow-sm hover inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-600 keychainify-checked" 
                            href={route('offer.index')} data-discover="true">
                                Назад
                        </Link>
                    </div>
                </div>
                <div className="p-4 sm:p-6 dark:border-gray-800">
                
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                        <div className="space-y-3">
                            <div>
                                <InputLabel>
                                    Название <span className="text-error-500">*</span>{" "}
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
                                    <p className="text-red-500 text-sm mt-1">Необходимо указать название</p>
                                )}
                            </div>

                            
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Категория</label>
                                <div className="relative">
                                <select onChange={(e) => setData('category_id', e.target.value)} className="h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-11 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 text-gray-400 dark:text-gray-400">
                                    <option value="" selected className="text-gray-700 dark:bg-gray-900 dark:text-gray-400">Select a category</option>
                                    {categories.length && categories.map(category => (
                                        <option selected={category.id == data.category_id} value={category.id} className="text-gray-700 dark:bg-gray-900 dark:text-gray-400">{category.name}</option>
                                    ))}
                                </select>
                                <svg className="absolute text-gray-700 dark:text-gray-400 right-3 top-1/2 -translate-y-1/2 pointer-events-none" width="20" height="20" viewBox="0 0 20 20" fill="none">
                                    <path d="M4.79175 8.02075L10.0001 13.2291L15.2084 8.02075" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                </div>
                                {errors[`name`] && (
                                    <p className="text-red-500 text-sm mt-1">Необходимо указать категорию</p>
                                )}
                            </div>

                            <div className="col-span-full">
                                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Описание</label>
                                    <div className="relative">
                                    <textarea 
                                        onChange={(e) => setData('description', e.target.value)}
                                        value={data.description}
                                        rows="6" 
                                        className="w-full rounded-lg border px-4 py-2.5 text-sm shadow-theme-xs focus:outline-hidden bg-transparent text-gray-900 dark:text-gray-300 border-gray-300 focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
                                    ></textarea>
                                    </div>
                                    {errors[`name`] && (
                                    <p className="text-red-500 text-sm mt-1">Необходимо указать описание</p>
                                )}
                            </div>

                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Интеграция</label>
                                <div className="relative">
                                <select onChange={(e) => setData('integration_id', e.target.value)} className="h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-11 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 text-gray-400 dark:text-gray-400">
                                    <option value="" selected className="text-gray-700 dark:bg-gray-900 dark:text-gray-400">Select a integration</option>
                                    {integrations.length && integrations.map(integration => (
                                        <option selected={integration.id == data.integration_id} value={integration.id} className="text-gray-700 dark:bg-gray-900 dark:text-gray-400">{integration.name}</option>
                                    ))}
                                </select>
                                <svg className="absolute text-gray-700 dark:text-gray-400 right-3 top-1/2 -translate-y-1/2 pointer-events-none" width="20" height="20" viewBox="0 0 20 20" fill="none">
                                    <path d="M4.79175 8.02075L10.0001 13.2291L15.2084 8.02075" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                </div>
                            </div>
                        </div>

                        <div className="">
                            <ImageUpload setData={(file) => setData('image' , file)}/>
                            {errors[`image`] && (
                                <p className="text-red-500 text-sm mt-1">Загружать можно только изображения!</p>
                            )}
                        </div>

                    </div>
                
                </div>
            </div>
            


            
            <div className="flex gap-3">
            <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] w-full">
                <div className="flex  justify-between items-center border-b border-gray-200 px-6 py-4 dark:border-gray-800">
                    <h2 className="text-lg font-medium text-gray-800 dark:text-white">Цены</h2>
                    <div className="">
                        <PrimaryButton
                            type="button"
                            onClick={() => {
                                setData('prices', [...data.prices, { country_id: '', price: 0 }]);
                            }}
                        ><PlusIcon /></PrimaryButton>
                    </div>
                    
                </div>
                <div className="space-y-5 p-4 sm:p-6">
                
                    {data.prices.map((price, index) => (
                        <div key={index} className="grid grid-cols-1 md:flex gap-5 items-end justify-between">
                            
                            <div className='min-w-fit'>
                                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Страна</label>
                                <div className="relative">
                                    <select 
                                        className="h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-11 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 text-gray-400 dark:text-gray-400"
                                        value={price.country_id}
                                        onChange={(e) => {
                                            const newPrices = [...data.prices];
                                            newPrices[index].country_id = e.target.value;
                                            setData('prices', newPrices);
                                        }}
                                    >
                                        <option value="" className="text-gray-700 dark:bg-gray-900 dark:text-gray-400">Все</option>
                                        {countries.length > 0 && countries.map(country => (
                                            <option key={country.id} value={country.id} className="text-gray-700 dark:bg-gray-900 dark:text-gray-400">
                                                {country.ru_name}
                                            </option>
                                        ))}
                                    </select>
                                    <svg className="absolute text-gray-700 dark:text-gray-400 right-3 top-1/2 -translate-y-1/2 pointer-events-none" width="20" height="20" viewBox="0 0 20 20" fill="none">
                                        <path d="M4.79175 8.02075L10.0001 13.2291L15.2084 8.02075" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                            </div>
                            
                            <div className='min-w-fit flex-grow'>
                                <InputLabel>
                                    Цена
                                </InputLabel>
                                <TextInput
                                    type="text"
                                    value={price.price}
                                    className="mt-1 block w-full"
                                    isFocused={true}
                                    onChange={(e) => {
                                        const newPrices = [...data.prices];
                                        newPrices[index].price = e.target.value;
                                        setData('prices', newPrices);
                                    }}
                                />
                            </div>
                            
                            <div className="">
                                {data.prices.length > 0 && (
                                <PrimaryButton 
                                    type="button"
                                    className='w-fit bg-red-500 hover:bg-red-600 !py-3.5'
                                    onClick={() => {
                                        const newPrices = data.prices.filter((_, i) => i !== index);
                                        setData('prices', newPrices);
                                    }}
                                >
                                    <TrashBinIcon className="size-4"/>
                                </PrimaryButton>
                                )}

                            </div>

                        </div>
                    ))}

                </div>
            </div>
            


            <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] w-full">
                <div className="flex  justify-between items-center border-b border-gray-200 px-6 py-4 dark:border-gray-800">
                    <h2 className="text-lg font-medium text-gray-800 dark:text-white">Ссылки</h2>
                    <div className="">
                        <PrimaryButton
                            type="button"
                            onClick={() => {
                                setData('links', [...data.links, '']);
                            }}
                        ><PlusIcon /></PrimaryButton>
                    </div>
                    
                </div>
                <div className="space-y-5 p-4 sm:p-6">
                
                    {data.links.map((link, index) => (
                        <div key={index} className="grid grid-cols-1 md:flex gap-5 items-end justify-between">
                            

                            
                            <div className='flex-grow'>
                                <InputLabel>
                                Ссылка {index + 1}
                                </InputLabel>
                                <TextInput
                                    type="text"
                                    value={link}
                                    className="mt-1 block w-full error"
                                    onChange={(e) => {
                                        const newLinks = [...data.links];
                                        newLinks[index] = e.target.value;
                                        setData('links', newLinks);
                                    }}
                                />
                                {errors[`links.${index}`] && (
                                    <p className="text-red-500 text-sm mt-1">Необходимо добавить минимум 1 ссылку</p>
                                )}
                            </div>
                            
                            <div className="">
                                {data.links.length > 1 && (
                                <PrimaryButton 
                                    type="button"
                                    className='w-fit bg-red-500 hover:bg-red-600 !py-3.5'
                                    onClick={() => {
                                        const newLinks = data.links.filter((_, i) => i !== index);
                                        setData('links', newLinks);
                                    }}
                                >
                                    <TrashBinIcon className="size-4"/>
                                </PrimaryButton>
                                )}

                            </div>

                        </div>
                    ))}

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