import { useForm } from '@inertiajs/react';
import { useState } from 'react';

const ExportButton = () => {
    const [isExporting, setIsExporting] = useState(false);
    const { data, setData, get } = useForm({
        start_date: '',
        end_date: '',
        status: '',
        offer_id: ''
    });

    const handleExport = () => {
        setIsExporting(true);
        
        // Создаем URL с параметрами
        const params = new URLSearchParams();
        if (data.start_date) params.append('start_date', data.start_date);
        if (data.end_date) params.append('end_date', data.end_date);
        if (data.status) params.append('status', data.status);
        if (data.offer_id) params.append('offer_id', data.offer_id);

        // Открываем в новом окне для скачивания
        window.open(`/leads/export?${params.toString()}`, '_blank');
        
        setTimeout(() => setIsExporting(false), 2000);
    };

    return (
        <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Экспорт лидов</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Начальная дата</label>
                    <input
                        type="date"
                        value={data.start_date}
                        onChange={e => setData('start_date', e.target.value)}
                        className="w-full p-2 border rounded"
                    />
                </div>
                
                <div>
                    <label className="block text-sm font-medium mb-1">Конечная дата</label>
                    <input
                        type="date"
                        value={data.end_date}
                        onChange={e => setData('end_date', e.target.value)}
                        className="w-full p-2 border rounded"
                    />
                </div>
                
                <div>
                    <label className="block text-sm font-medium mb-1">Статус</label>
                    <select
                        value={data.status}
                        onChange={e => setData('status', e.target.value)}
                        className="w-full p-2 border rounded"
                    >
                        <option value="">Все статусы</option>
                        <option value="new">Новый</option>
                        <option value="hold">Холд</option>
                        <option value="completed">Завершен</option>
                        <option value="canceled">Отменен</option>
                    </select>
                </div>
                
                <div>
                    <label className="block text-sm font-medium mb-1">Оффер</label>
                    <select
                        value={data.offer_id}
                        onChange={e => setData('offer_id', e.target.value)}
                        className="w-full p-2 border rounded"
                    >
                        <option value="">Все офферы</option>
                        {props.offers?.map(offer => (
                            <option key={offer.id} value={offer.id}>{offer.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            <button
                onClick={handleExport}
                disabled={isExporting}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
            >
                {isExporting ? 'Экспорт...' : 'Экспорт в CSV'}
            </button>
        </div>
    );
};

export default ExportButton;