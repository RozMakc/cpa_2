import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import ImageUpload from '@/Components/ImageUpload';
import TextInput from '@/Components/TextInput';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { TrashBinIcon, PlusIcon } from '@/icons';

export default function Edit({ offer, categories, countries,integrations }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        _method: 'PUT',
        name: offer.name || '',
        description: offer.description || '',
        category_id: offer.category_id || null,
        integration_id: offer.integration?.id || null,
        prices: offer.prices?.length > 0 ? offer.prices : [{ country_id: '', price: '' }],
        links: offer.links?.length > 0 ? offer.links.map(link => link.url) : [''],
        image: null
    });
    
    const submit = (e) => {
        e.preventDefault();
        post(route('offer.update', offer.id));
    };

    return (
        <AuthenticatedLayout pageTitle="Редактирование оффера">
            <Head title="Редактирование оффера" />

            <form onSubmit={submit}>
                <div className="space-y-6">
                    <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
                        <div className="flex flex-col justify-between gap-5 border-b border-gray-200 px-5 py-4 sm:flex-row sm:items-center dark:border-gray-800">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Редактирование оффера</h3>
                            </div>
                            <div className="flex gap-3">
                                <Link 
                                    className="bg-gray-500 inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-600" 
                                    href={route('offer.index')}
                                >
                                    Назад
                                </Link>
                            </div>
                        </div>
                        <div className="p-4 sm:p-6 dark:border-gray-800">
                            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                <div className="space-y-3">
                                    <div>
                                        <InputLabel>
                                            Название <span className="text-error-500">*</span>
                                        </InputLabel>
                                        <TextInput
                                            id="name"
                                            type="text"
                                            value={data.name}
                                            className="mt-1 block w-full"
                                            isFocused={true}
                                            onChange={(e) => setData('name', e.target.value)}
                                            disabled={processing}
                                        />
                                        {errors.name && (
                                            <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                                        )}
                                    </div>

                                    <div>
                                        <InputLabel>
                                            Категория <span className="text-error-500">*</span>
                                        </InputLabel>
                                        <div className="relative">
                                            <select 
                                                value={data.category_id}
                                                onChange={(e) => setData('category_id', e.target.value)}
                                                className="h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-11 text-sm shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
                                                disabled={processing}
                                            >
                                                <option value="">Выберите категорию</option>
                                                {categories.map(category => (
                                                    <option key={category.id} value={category.id}>
                                                        {category.name}
                                                    </option>
                                                ))}
                                            </select>
                                            <svg className="absolute text-gray-700 dark:text-gray-400 right-3 top-1/2 -translate-y-1/2 pointer-events-none" width="20" height="20" viewBox="0 0 20 20" fill="none">
                                                <path d="M4.79175 8.02075L10.0001 13.2291L15.2084 8.02075" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </div>
                                        {errors.category_id && (
                                            <p className="text-red-500 text-sm mt-1">{errors.category_id}</p>
                                        )}
                                    </div>

                                    <div className="col-span-full">
                                        <InputLabel>
                                            Описание <span className="text-error-500">*</span>
                                        </InputLabel>
                                        <textarea 
                                            value={data.description}
                                            onChange={(e) => setData('description', e.target.value)}
                                            rows="6" 
                                            className="w-full rounded-lg border px-4 py-2.5 text-sm shadow-theme-xs focus:outline-hidden bg-transparent text-gray-900 dark:text-gray-300 border-gray-300 focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
                                            disabled={processing}
                                        />
                                        {errors.description && (
                                            <p className="text-red-500 text-sm mt-1">{errors.description}</p>
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

                                <div>
                                    <ImageUpload 
                                        setData={(file) => setData('image', file)}
                                        currentImage={offer.image_path ? `/storage/${offer.image_path}` : null}
                                    />
                                    {errors.image && (
                                        <p className="text-red-500 text-sm mt-1">{errors.image}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 lg:flex-row">
                        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] w-full">
                            <div className="flex justify-between items-center border-b border-gray-200 px-6 py-4 dark:border-gray-800">
                                <h2 className="text-lg font-medium text-gray-800 dark:text-white">Цены</h2>
                                <div className="">
                                <PrimaryButton
                                    type="button"
                                    onClick={() => {
                                        setData('prices', [...data.prices, { country_id: '', price: '' }]);
                                    }}
                                    disabled={processing}
                                >
                                    <PlusIcon />
                                </PrimaryButton>
                                </div>
                            </div>
                            <div className="space-y-5 p-4 sm:p-6">
                                {data.prices.map((price, index) => (
                                    <div key={index} className="grid grid-cols-1 md:flex gap-5 items-end justify-between">
                                        <div className='min-w-fit flex-1'>
                                            <InputLabel>Страна</InputLabel>
                                            <select 
                                                value={price.country_id}
                                                onChange={(e) => {
                                                    const newPrices = [...data.prices];
                                                    newPrices[index].country_id = e.target.value;
                                                    setData('prices', newPrices);
                                                }}
                                                className="h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-11 text-sm shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
                                                disabled={processing}
                                            >
                                                <option value="">Все страны</option>
                                                {countries.map(country => (
                                                    <option key={country.id} value={country.id}>
                                                        {country.ru_name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        
                                        <div className='min-w-fit flex-1'>
                                            <InputLabel>Цена</InputLabel>
                                            <TextInput
                                                type="number"
                                                value={price.price}
                                                className="mt-1 block w-full"
                                                onChange={(e) => {
                                                    const newPrices = [...data.prices];
                                                    newPrices[index].price = e.target.value;
                                                    setData('prices', newPrices);
                                                }}
                                                disabled={processing}
                                            />
                                        </div>
                                        
                                        <div className="md:w-16">
                                            {data.prices.length > 1 && (
                                                <PrimaryButton 
                                                    type="button"
                                                    className='w-full bg-red-500 hover:bg-red-600 !py-3.5'
                                                    onClick={() => {
                                                        const newPrices = data.prices.filter((_, i) => i !== index);
                                                        setData('prices', newPrices);
                                                    }}
                                                    disabled={processing}
                                                >
                                                    <TrashBinIcon className="size-4"/>
                                                </PrimaryButton>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                {errors.prices && (
                                    <p className="text-red-500 text-sm mt-1">{errors.prices}</p>
                                )}
                            </div>
                        </div>

                        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] w-full">
                            <div className="flex justify-between items-center border-b border-gray-200 px-6 py-4 dark:border-gray-800">
                                <h2 className="text-lg font-medium text-gray-800 dark:text-white">Ссылки</h2>
                                <div className="">
                                <PrimaryButton
                                    type="button"
                                    onClick={() => {
                                        setData('links', [...data.links, '']);
                                    }}
                                    disabled={processing}
                                >
                                    <PlusIcon />
                                </PrimaryButton>
                                </div>
                            </div>
                            <div className="space-y-5 p-4 sm:p-6">
                                {data.links.map((link, index) => (
                                    <div key={index} className="grid grid-cols-1 md:flex gap-5 items-end justify-between">
                                        <div className='flex-grow'>
                                            <InputLabel>Ссылка {index + 1}</InputLabel>
                                            <TextInput
                                                type="url"
                                                value={link}
                                                className="mt-1 block w-full"
                                                onChange={(e) => {
                                                    const newLinks = [...data.links];
                                                    newLinks[index] = e.target.value;
                                                    setData('links', newLinks);
                                                }}
                                                placeholder="https://example.com"
                                                disabled={processing}
                                            />
                                        </div>
                                        
                                        <div className="md:w-16">
                                            {data.links.length > 1 && (
                                                <PrimaryButton 
                                                    type="button"
                                                    className='w-full bg-red-500 hover:bg-red-600 !py-3.5'
                                                    onClick={() => {
                                                        const newLinks = data.links.filter((_, i) => i !== index);
                                                        setData('links', newLinks);
                                                    }}
                                                    disabled={processing}
                                                >
                                                    <TrashBinIcon className="size-4"/>
                                                </PrimaryButton>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                {errors.links && (
                                    <p className="text-red-500 text-sm mt-1">{errors.links}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex  gap-3 items-end justify-end">
                        <PrimaryButton 
                            type="submit" 
                            disabled={processing}
                            className="!w-fit items-center justify-center gap-2 px-5 py-3.5 text-sm"
                        >
                            {processing ? 'Сохранение...' : 'Сохранить'}
                        </PrimaryButton>
                    </div>
                </div>
            </form>
        </AuthenticatedLayout>
    );
}