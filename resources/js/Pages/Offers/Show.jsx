import PrimaryButton from '@/Components/PrimaryButton';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { Eye, Pause, Edit, Trash2 } from 'lucide-react';

export default function Show({ offer }) {
    const prevPage = {
        title: "Офферы",
        link: route('offer.index')
    }
    return (
        <AuthenticatedLayout pageTitle={`Оффер "${offer.name}"`} prevPage={prevPage}>
            <Head title={`${offer.name}`} />

            
                <div className="space-y-6">
                <div className="grid gap-5 grid-cols-1 md:grid-cols-2">
                    <div className="rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
                        <div class="flex flex-col justify-between gap-5 border-b border-gray-200 px-5 py-4 sm:flex-row sm:items-center dark:border-gray-800">
                            <div>
                                <h3 class="text-lg font-semibold text-gray-800 dark:text-white/90">Общая информация</h3>
                            </div>
                        </div>
                        <div className="p-4 sm:p-6">
                            <div className="flex gap-5 justify-between">
                                <div className="flex-grow space-y-3">
                                    <div>Категория: {offer.category.name}</div>
                                    <div>Описание:<br/>{offer.description}</div>
                                </div>
                                <div className="w-1/3">
                                    <img
                                        src={offer.image_path ? `/storage/${offer.image_path}` : `/storage/offers/no-photo.png`}
                                        alt={offer.name}
                                    />
                                </div>
                            </div>

                            <div className="mt-5">
                                <Link href={route('offer.link.create', offer.id)}>
                                    <PrimaryButton>Создать ссылку</PrimaryButton>
                                </Link>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
                        <div class="flex flex-col justify-between gap-5 border-b border-gray-200 px-5 py-4 sm:flex-row sm:items-center dark:border-gray-800">
                            <div>
                                <h3 class="text-lg font-semibold text-gray-800 dark:text-white/90">Выплаты:</h3>
                            </div>
                        </div>
                        <div className="p-4 sm:p-6 space-y-3">
                            {offer.prices.length > 0 ? offer.prices.map(price => (
                                <div className="flex gap-5 justify-between">
                                    <div className="flex gap-3 items-center">
                                        {price.country && (
                                            <img
                                                width={"30px"}
                                                src={`/images/country/${price.country.iso_name}.png`}
                                                alt={price.country.iso_name}
                                            />
                                        )}
                                        
                                        {price.country?.ru_name || 'Все'}
                                    </div>
                                    <div className="">{price.price || '0'} руб.</div>
                                </div>
                            )) : (
                                <div className="">Нет цен!</div>
                            )}
                        </div>
                    </div>

                    <div className="col-span-full rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
                        <div class="flex flex-col justify-between gap-5 border-b border-gray-200 px-5 py-4 sm:flex-row sm:items-center dark:border-gray-800">
                            <div>
                                <h3 class="text-lg font-semibold text-gray-800 dark:text-white/90">Лендинги:</h3>
                            </div>
                        </div>
                        <div className="p-4 sm:p-6">
                            
                            {offer.links.length > 0 ? offer.links.map(link => (
                                <div className="flex gap-5">
                                    <div className="">Лендинг #{link.id}</div>
                                    <div className="">
                                        <a 
                                            target="_blank" 
                                            className="text-blue-500 hover:text-blue-600" 
                                            href={link.url}>
                                                {link.url}
                                        </a>
                                    </div>
                                </div>
                            )) : (
                                <div className="">Нет лендингов</div>
                            )}

                        </div>
                    </div>
                </div>


                </div>
            
        </AuthenticatedLayout>
    );
}