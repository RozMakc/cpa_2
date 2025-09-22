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
import DatePicker from '@/Components/DatePicker';

export default function Create({user, roles}) {

    
    const { data, setData, patch, processing, errors, reset } = useForm({
        name: user.name || '',
        fullname: user.fullname || '',
        balance: user.balance || 0,
        birthdate: user.birthdate,
        phone: user.phone || '',
        email: user.email || '',
        password: '',
        role: user.roles[0].name || 'user',
        is_active: user.is_active,
        is_stopped: user.is_stopped,
        documents: {
            inn: user.documents?.inn || '',
            pasport_birthplace: user.documents?.pasport_birthplace || '',
            pasport_series: user.documents?.pasport_series || '',
            pasport_number: user.documents?.pasport_number || '',
            pasport_who: user.documents?.pasport_who || '',
            pasport_when: user.documents?.pasport_when || '',
            pasport_code: user.documents?.pasport_code || ''
        },
        payment_method: {
            bank_name: user.paymethods?.bank_name || '',
            bank_bik: user.paymethods?.bank_bik || '',
            bank_rs: user.paymethods?.bank_rs || '',
        }
    });
    const submit = (e) => {
        e.preventDefault();

        patch(route('users.update', user.id), {
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
                        <h3 class="text-lg font-semibold text-gray-800 dark:text-white/90">Юзер #{user.id} ({user.name})</h3>
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
                
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 mb-3">
                        <div className="space-y-3">
                            <div>
                                <InputLabel>
                                    Логин <span className="text-error-500">*</span>{" "}
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
                                    ФИО
                                </InputLabel>
                                <TextInput
                                        id="fullname"
                                        type="text"
                                        name="fullname"
                                        value={data.fullname}
                                        className="mt-1 block w-full"
                                        isFocused={true}
                                        onChange={(e) => setData('fullname', e.target.value)}
                                    />
                                {errors[`fullname`] && (
                                    <p className="text-red-500 text-sm mt-1">Необходимо указать fullname</p>
                                )}
                            </div>

                            <div>
                                <DatePicker
                                    id="birthdate"
                                    label="Дата рождения"
                                    placeholder="Выберите дату рождения"
                                    required
                                    defaultDate={data.birthdate}
                                    onChange={(e) => setData('birthdate', e[0])}
                                />
                                {errors[`birthdate`] && (
                                    <p className="text-red-500 text-sm mt-1">Необходимо указать дату рождения</p>
                                )}
                            </div>

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

                        <div className="space-y-3">
                        <div>
                                <InputLabel>
                                    Баланс
                                </InputLabel>
                                <TextInput
                                        id="balance"
                                        type="text"
                                        name="balance"
                                        value={data.balance}
                                        className="mt-1 block w-full"
                                        isFocused={true}
                                        onChange={(e) => setData('balance', e.target.value)}
                                    />
                                {errors[`balance`] && (
                                    <p className="text-red-500 text-sm mt-1">Необходимо указать balance</p>
                                )}
                            </div>
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
                                    {roles.map((role) => (
                                    <option key={role.id} value={role.name}>
                                        {role.name}
                                    </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <InputLabel>
                                    Активен
                                </InputLabel>
                            
                                <select 
                                    value={data.is_active}
                                    onChange={(e) => {
                                        setData('is_active', e.target.value);
                                    }}
                                    className="h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-11 text-sm shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
                                    disabled={processing}
                                >
                                    <option  value={1}>Активен</option>
                                    <option  value={0}>Ожидает активации</option>
                                </select>
                            </div>

                            <div>
                                <InputLabel>
                                    Трафик
                                </InputLabel>
                            
                                <select 
                                    value={data.is_stopped}
                                    onChange={(e) => {
                                        setData('is_stopped', e.target.value);
                                    }}
                                    className="h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-11 text-sm shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
                                    disabled={processing}
                                >
                                    <option  value={0}>Активен</option>
                                    <option  value={1}>Остановлен</option>
                                </select>
                            </div>

                        </div>

                    </div>

                </div>
            </div>
            
            <div className="flex flex-col gap-3 lg:flex-row">
                <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] w-full">
                    <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-800">
                        <h2 className="text-lg font-medium text-gray-800 dark:text-white">Документы</h2>
                    </div>
                    <div className="space-y-5 p-4 sm:p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 ">    
                            <div className="space-y-3">
                                <p>Паспорт</p>
                                <div className="grid grid-cols-3 gap-3">
                                        <div className="">
                                            <InputLabel>Серия</InputLabel>
                                            <TextInput
                                                id="pasport_series"
                                                type="text"
                                                name="pasport_series"
                                                value={data.documents.pasport_series}
                                                className="mt-1 block w-full"
                                                isFocused={true}
                                                onChange={(e) => setData('documents.pasport_series', e.target.value)}
                                            />
                                        </div>
                                        <div className="col-span-2">
                                            <InputLabel>Номер</InputLabel>
                                            <TextInput
                                                id="pasport_number"
                                                type="text"
                                                name="pasport_number"
                                                value={data.documents.pasport_number}
                                                className="mt-1 block w-full"
                                                isFocused={true}
                                                onChange={(e) => setData('documents.pasport_number', e.target.value)}
                                            />
                                        </div>
                                    </div>

                                <div>
                                    <InputLabel>Место рождения</InputLabel>
                                    <TextInput
                                        id="pasport_birthplace"
                                        type="text"
                                        name="pasport_birthplace"
                                        value={data.documents.pasport_birthplace}
                                        className="mt-1 block w-full"
                                        isFocused={true}
                                        onChange={(e) => setData('documents.pasport_birthplace', e.target.value)}
                                    />
                                </div>

                                <div>
                                    <InputLabel>Кем выдан</InputLabel>
                                    <TextInput
                                        id="pasport_who"
                                        type="text"
                                        name="pasport_who"
                                        value={data.documents.pasport_who}
                                        className="mt-1 block w-full"
                                        isFocused={true}
                                        onChange={(e) => setData('documents.pasport_who', e.target.value)}
                                    />
                                </div>

                                <div>
                                    <InputLabel>Дата выдачи</InputLabel>
                                    <TextInput
                                        id="pasport_when"
                                        type="text"
                                        name="pasport_when"
                                        value={data.documents.pasport_when}
                                        className="mt-1 block w-full"
                                        isFocused={true}
                                        onChange={(e) => setData('documents.pasport_when', e.target.value)}
                                    />
                                </div>

                                <div>
                                    <InputLabel>Код подразделения</InputLabel>
                                    <TextInput
                                        id="pasport_code"
                                        type="text"
                                        name="pasport_code"
                                        value={data.documents.pasport_code}
                                        className="mt-1 block w-full"
                                        isFocused={true}
                                        onChange={(e) => setData('documents.pasport_code', e.target.value)}
                                    />
                                </div>
                            </div>                            

                            <div className="space-y-3">
                            <p>ИНН</p>
                            <div className="">
                                
                                            <InputLabel>Номер</InputLabel>
                                            <TextInput
                                                id="inn"
                                                type="text"
                                                name="inn"
                                                value={data.documents.inn}
                                                className="mt-1 block w-full"
                                                isFocused={true}
                                                onChange={(e) => setData('documents.inn', e.target.value)}
                                            />
                                        </div>

                                        <div>
                                    <InputLabel>Банк</InputLabel>
                                    <TextInput
                                        id="bank_name"
                                        type="text"
                                        name="bank_name"
                                        value={data.payment_method.bank_name}
                                        className="mt-1 block w-full"
                                        isFocused={true}
                                        onChange={(e) => setData('payment_method.bank_name', e.target.value)}
                                    />
                                    {errors[`payment_method.bank_name`] && (
                                    <p className="text-red-500 text-sm mt-1">Необходимо указать Место рождения</p>
                                    )}
                                </div>

                                <div>
                                    <InputLabel>БИК Банка</InputLabel>
                                    <TextInput
                                        id="bank_bik"
                                        type="text"
                                        name="bank_bik"
                                        value={data.payment_method.bank_bik}
                                        className="mt-1 block w-full"
                                        isFocused={true}
                                        onChange={(e) => setData('payment_method.bank_bik', e.target.value)}
                                    />
                                    {errors[`payment_method.bank_bik`] && (
                                    <p className="text-red-500 text-sm mt-1">Необходимо указать bank_bik</p>
                                    )}
                                </div>

                                <div>
                                    <InputLabel>Расчетный счет</InputLabel>
                                    <TextInput
                                        id="bank_rs"
                                        type="text"
                                        name="bank_rs"
                                        value={data.payment_method.bank_rs}
                                        className="mt-1 block w-full"
                                        isFocused={true}
                                        onChange={(e) => setData('payment_method.bank_rs', e.target.value)}
                                    />
                                    {errors[`payment_method.bank_rs`] && (
                                    <p className="text-red-500 text-sm mt-1">Необходимо указать bank_rs</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            


            <div className="mt-5 flex flex-col gap-3 sm:flex-row justify-end">
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