import { useForm } from '@inertiajs/react';
import { useState } from 'react';

const ExportButton = ({ projects = [] }) => {
  const [isExporting, setIsExporting] = useState(false);
  const { data, setData } = useForm({
    start_date: '',
    end_date: '',
    status: '',
    project_id: '',
  });

  const handleExport = () => {
    setIsExporting(true);

    const params = new URLSearchParams();
    if (data.start_date) params.append('start_date', data.start_date);
    if (data.end_date) params.append('end_date', data.end_date);
    if (data.status) params.append('status', data.status);
    if (data.project_id) params.append('project_id', data.project_id);

    window.open(`/leads/export?${params.toString()}`, '_blank');
    setTimeout(() => setIsExporting(false), 2000);
  };

  return (
    <div className="rounded-lg bg-white p-4 shadow dark:bg-white/[0.03]">
      <h3 className="mb-4 text-lg font-semibold">Экспорт лидов</h3>
      <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
        <input type="date" value={data.start_date} onChange={(e) => setData('start_date', e.target.value)} className="w-full rounded border p-2" />
        <input type="date" value={data.end_date} onChange={(e) => setData('end_date', e.target.value)} className="w-full rounded border p-2" />
        <select value={data.status} onChange={(e) => setData('status', e.target.value)} className="w-full rounded border p-2">
          <option value="">Все статусы</option>
          <option value="new">Новый</option>
          <option value="invited">Приглашен</option>
          <option value="accepted">Принят</option>
          <option value="rejected">Отказ</option>
        </select>
        <select value={data.project_id} onChange={(e) => setData('project_id', e.target.value)} className="w-full rounded border p-2">
          <option value="">Все проекты</option>
          {projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}
        </select>
      </div>
      <button onClick={handleExport} disabled={isExporting} className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:opacity-50">
        {isExporting ? 'Экспорт...' : 'Экспорт в CSV'}
      </button>
    </div>
  );
};

export default ExportButton;
