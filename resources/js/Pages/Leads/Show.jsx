import PrimaryButton from '@/Components/PrimaryButton';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { Eye, Pause, Edit, Trash2 } from 'lucide-react';

export default function Show({ lead }) {
    const prevPage = {
        title: "Лиды",
        link: route('leads.index')
    }
    return (
        <AuthenticatedLayout pageTitle={`Заказ #${lead.id}`} prevPage={prevPage}>
            <Head title={`Лид #${lead.id}`} />

            
                <div className="space-y-6">
                <div className="grid gap-5 grid-cols-1 md:grid-cols-2">
                    <div className="rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
                        <div class="flex flex-col justify-between gap-5 border-b border-gray-200 px-5 py-4 sm:flex-row sm:items-center dark:border-gray-800">
                            <div>
                                <h3 class="text-lg font-semibold text-gray-800 dark:text-white/90">
                                Лид #{lead.id}
                                </h3>
                            </div>
                            <div>{new Date(lead.created_at).toLocaleString()}</div>
                        </div>
                        <div className="p-4 sm:p-6">
                            <div className="flex gap-5 justify-between">
                                <div className="flex-grow space-y-3">
                                    <div>Клиент: {lead.name}</div>
                                    <div>Телефон: {lead.phone}</div>
                                    <div>Email: {lead.email}</div>
                                </div>

                            </div>

                        </div>
                    </div>
                    <div className="rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
                        <div class="flex flex-col justify-between gap-5 border-b border-gray-200 px-5 py-4 sm:flex-row sm:items-center dark:border-gray-800">
                            <div>
                                <h3 class="text-lg font-semibold text-gray-800 dark:text-white/90">Параметры</h3>
                            </div>
                        </div>
                        <div className="p-4 sm:p-6">
                            <div className="flex gap-5 justify-between">
                                <div className="flex-grow space-y-3">
                                    <div>Оффер <Link href={route('offer.show', lead.offer.id)} className='text-blue-500 hover:text-blue-600'>"{lead.offer.name}"</Link></div>
                                    <div>Ссылка: {lead.link ? <Link href={route('link.show', lead.link.id)} className='text-blue-500 hover:text-blue-600'>"{lead.link.name}"</Link> : '-'}</div>
                                    <div>Выплата: {lead.price} руб.</div>
                                    

                                    <div className="mt-5">
                                        <div>UTM Campaign: {lead.utm_campaign}</div>
                                        <div>UTM Medium: {lead.utm_medium}</div>
                                        <div>UTM Source: {lead.utm_source}</div>
                                        <div>UTM Content: {lead.utm_content}</div>
                                        <div>UTM Term: {lead.utm_term}</div>
                                    </div>
                                    
                                    <div className="mt-5">
                                        <div>SUB ID 1: {lead.sub1}</div>
                                        <div>SUB ID 2: {lead.sub2}</div>
                                        <div>SUB ID 3: {lead.sub3}</div>
                                        <div>SUB ID 4: {lead.sub4}</div>
                                        <div>SUB ID 5: {lead.sub5}</div>
                                    </div>
                                
                                </div>

                            </div>

                        </div>
                    </div>
                </div>


                </div>
            
        </AuthenticatedLayout>
    );
}