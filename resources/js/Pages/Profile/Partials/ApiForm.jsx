import DangerButton from '@/Components/DangerButton';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import { useForm, usePage } from '@inertiajs/react';
import { useRef, useState } from 'react';

export default function ApiForm({ className = '' }) {
    const [confirmingNewKey, setConfirmingNewKey] = useState(false);
    const apikey = usePage().props.auth.user.apikey;

    const {
        data,
        setData,
        post,
        processing,
        reset,
        errors,
        clearErrors,
    } = useForm();

    const confirmNewKey = () => {
        setConfirmingNewKey(true);
    };

    const submit = (e) => {
        e.preventDefault();

        post(route('profile.apikey'));
    };

    const closeModal = () => {
        setConfirmingNewKey(false);
        clearErrors();
    };

    return (
        <>
            <div class="flex flex-col justify-between gap-5 border-b border-gray-200 px-5 py-4 sm:flex-row sm:items-center dark:border-gray-800">
                <div>
                    <h3 class="text-lg font-semibold text-gray-800 dark:text-white/90">API</h3>
                </div>

            </div>
            <div className="p-4 sm:p-6 dark:border-gray-800">

                <form onSubmit={submit} className="space-y-6">
                    <div>
                        <InputLabel htmlFor="apikey" value="Api key" />

                        <div className="flex justify-between gap-3">
                            <div className="flex-grow">
                                <TextInput
                                    id="apikey"
                                    type="text"
                                    className="block w-full"
                                    value={apikey}
                                    readonly
                                />
                            </div>
                            <div className="flex items-center gap-4">
                                <PrimaryButton disabled={processing}>{apikey ? 'Обновить' : 'Получить'}</PrimaryButton>
                            </div>
                        </div>
                        
                    </div>
                </form>

            </div>
        </>
    );
}
