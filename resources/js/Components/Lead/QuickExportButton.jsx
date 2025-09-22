// Components/Lead/QuickExportButton.jsx
import { useState } from 'react';
import PrimaryButton from '@/Components/PrimaryButton';
import ExportModal from './ExportModal';
import { usePage } from '@inertiajs/react';

export default function QuickExportButton() {
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const { props } = usePage();
    
    return (
        <>
            <button
                onClick={() => setIsExportModalOpen(true)}
                className="bg-brand-500 shadow-sm hover inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-600 keychainify-checked"
            >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                </svg>
                Скачать лиды
            </button>

            <ExportModal
                isOpen={isExportModalOpen}
                onClose={() => setIsExportModalOpen(false)}
                project={props.project}
                fieldMappings={props.fieldMappings || {}}
            />
        </>
    );
}