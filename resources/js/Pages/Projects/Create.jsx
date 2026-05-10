import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import Checkbox from '@/Components/Checkbox';
import { Plus, Trash2, Upload } from 'lucide-react';
import { useState } from 'react';

const fieldClass = 'mt-1 block w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-sm placeholder:text-gray-400 focus:border-blue-300 focus:outline-none focus:ring-3 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-blue-800';
const integrationOptions = ['whatsapp', 'telegram', 'max'];

function FieldError({ message }) {
    return message ? <p className="mt-1 text-sm text-red-500">{message}</p> : null;
}

export default function Create({ integrations = [] }) {
    const [previewUrl, setPreviewUrl] = useState(null);
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        integrations: [],
        parsing_sources: '',
        inviting_sources: [{ group: '', channel: '' }],
        mailing_groups: '',
        use_own_groups: false,
        mailing_phones: '',
        mailing_usernames: '',
        mailing_text: '',
        image: null,
    });

    const setInvite = (index, field, value) => {
        setData('inviting_sources', data.inviting_sources.map((item, itemIndex) => (
            itemIndex === index ? { ...item, [field]: value } : item
        )));
    };

    const addInvite = () => {
        setData('inviting_sources', [...data.inviting_sources, { group: '', channel: '' }]);
    };

    const removeInvite = (index) => {
        setData('inviting_sources', data.inviting_sources.filter((_, itemIndex) => itemIndex !== index));
    };

    const handleImage = (file) => {
        setData('image', file || null);
        setPreviewUrl(file ? URL.createObjectURL(file) : null);
    };

    const toggleIntegration = (integration) => {
        setData('integrations', data.integrations.includes(integration)
            ? data.integrations.filter(item => item !== integration)
            : [...data.integrations, integration]
        );
    };

    const setUseOwnGroups = (checked) => {
        setData({
            ...data,
            use_own_groups: checked,
            mailing_groups: checked ? '' : data.mailing_groups,
        });
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('projects.store'), { forceFormData: true });
    };

    return (
        <AuthenticatedLayout pageTitle="Создание проекта">
            <Head title="Создание проекта" />

            <form onSubmit={submit} className="rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
                <div className="flex flex-col justify-between gap-5 border-b border-gray-200 px-5 py-4 sm:flex-row sm:items-center dark:border-gray-800">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Создание проекта</h3>
                    <Link href={route('projects.index')} className="inline-flex items-center justify-center rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700">
                        Назад
                    </Link>
                </div>

                <div className="grid grid-cols-1 gap-6 p-5 xl:grid-cols-2">
                    <div className="space-y-5">
                        <div>
                            <InputLabel htmlFor="name" value="Название *" />
                            <TextInput id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} />
                            <FieldError message={errors.name} />
                        </div>

                        <div>
                            <InputLabel value="Интеграция" />
                            <div className="mt-2 flex flex-wrap gap-3">
                                {integrationOptions.map(integration => (
                                    <label key={integration} className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 dark:border-gray-700 dark:text-gray-300">
                                        <Checkbox checked={data.integrations.includes(integration)} onChange={() => toggleIntegration(integration)} />
                                        <span>{integration}</span>
                                    </label>
                                ))}
                            </div>
                            <FieldError message={errors.integrations} />
                        </div>

                        <div>
                            <InputLabel value="Инвайтинг" />
                            <div className="space-y-4">
                                {data.inviting_sources.map((source, index) => (
                                    <div key={index} className="grid grid-cols-[1fr_auto] gap-3 rounded-lg border border-gray-200 p-3 dark:border-gray-800">
                                        <div className="space-y-3">
                                            <div>
                                                <InputLabel value="Группа" />
                                                <TextInput value={source.group} onChange={(e) => setInvite(index, 'group', e.target.value)} placeholder="https://t.me/realtor_commercial" />
                                            </div>
                                            <div>
                                                <InputLabel value="Канал" />
                                                <TextInput value={source.channel} onChange={(e) => setInvite(index, 'channel', e.target.value)} placeholder="https://t.me/realtor_commercial_channel" />
                                            </div>
                                        </div>
                                        <button type="button" onClick={() => removeInvite(index)} className="mt-7 flex h-11 w-11 items-center justify-center rounded-lg bg-red-500 text-white hover:bg-red-600">
                                            <Trash2 className="size-4" />
                                        </button>
                                    </div>
                                ))}
                                <button type="button" onClick={addInvite} className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-brand-500 text-white hover:bg-brand-600">
                                    <Plus className="size-4" />
                                </button>
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between gap-3">
                                <InputLabel htmlFor="mailing_groups" value="Рассылка по группам" />
                                <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-400">
                                    <Checkbox checked={data.use_own_groups} onChange={(e) => setUseOwnGroups(e.target.checked)} />
                                    <span>Наши группы</span>
                                </label>
                            </div>
                            <textarea
                                id="mailing_groups"
                                rows={5}
                                className={`${fieldClass} ${data.use_own_groups ? 'opacity-50' : ''}`}
                                value={data.mailing_groups}
                                onChange={(e) => setData('mailing_groups', e.target.value)}
                                disabled={data.use_own_groups}
                            />
                        </div>

                        <div>
                            <InputLabel htmlFor="mailing_phones" value="Рассылка по номеру" />
                            <textarea id="mailing_phones" rows={5} className={fieldClass} value={data.mailing_phones} onChange={(e) => setData('mailing_phones', e.target.value)} />
                        </div>

                        <div>
                            <InputLabel htmlFor="mailing_usernames" value="Рассылка по user name" />
                            <textarea id="mailing_usernames" rows={5} className={fieldClass} value={data.mailing_usernames} onChange={(e) => setData('mailing_usernames', e.target.value)} />
                        </div>
                    </div>

                    <div className="space-y-5">
                        <div>
                            <InputLabel htmlFor="parsing_sources" value="Парсинг" />
                            <textarea id="parsing_sources" rows={6} className={fieldClass} value={data.parsing_sources} onChange={(e) => setData('parsing_sources', e.target.value)} />
                        </div>

                        <div>
                            <InputLabel htmlFor="mailing_text" value="Текст рассылки" />
                            <textarea id="mailing_text" rows={8} className={fieldClass} value={data.mailing_text} onChange={(e) => setData('mailing_text', e.target.value)} />
                        </div>

                        <div>
                            <InputLabel value="Изображение" />
                            <label className="mt-1 flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-brand-500 p-6 text-center transition hover:border-brand-600 dark:border-brand-500">
                                {previewUrl ? (
                                    <img src={previewUrl} alt="Preview" className="max-h-64 rounded-lg object-contain" />
                                ) : (
                                    <div className="flex flex-col items-center gap-3 text-gray-500 dark:text-gray-400">
                                        <Upload className="size-8" />
                                        <span className="text-sm font-medium">Добавить изображение</span>
                                    </div>
                                )}
                                <input className="hidden" type="file" accept="image/*" onChange={(e) => handleImage(e.target.files?.[0])} />
                            </label>
                            <FieldError message={errors.image} />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end border-t border-gray-200 p-5 dark:border-gray-800">
                    <PrimaryButton disabled={processing} className="w-auto px-6">
                        {processing ? 'Сохранение...' : 'Сохранить'}
                    </PrimaryButton>
                </div>
            </form>
        </AuthenticatedLayout>
    );
}
