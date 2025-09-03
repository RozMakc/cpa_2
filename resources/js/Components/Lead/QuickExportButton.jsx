import { useState } from "react";

export default function QuickExportButton () {
    const [isExporting, setIsExporting] = useState(false);

    const handleQuickExport = () => {
        setIsExporting(true);
        window.open('/leads/export', '_blank');
        setTimeout(() => setIsExporting(false), 1000);
    };

    return (
        <button
            onClick={handleQuickExport}
            disabled={isExporting}
            className="bg-brand-500 shadow-sm hover inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-600 keychainify-checked"
        >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
            </svg>
            {isExporting ? 'Экспорт...' : 'Экспорт CSV'}
        </button>
    );
};