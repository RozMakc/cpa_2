import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import StatusBadge from '@/Components/Lead/StatusBadge';

export default function Show({ lead }) {
  const prevPage = {
    title: 'Лиды',
    link: route('leads.index'),
  };

  return (
    <AuthenticatedLayout pageTitle={`Лид #${lead.id}`} prevPage={prevPage}>
      <Head title={`Лид #${lead.id}`} />

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
          <div className="flex flex-col justify-between gap-5 border-b border-gray-200 px-5 py-4 sm:flex-row sm:items-center dark:border-gray-800">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Лид #{lead.id}</h3>
            <div className="text-sm text-gray-500">{new Date(lead.created_at).toLocaleString()}</div>
          </div>
          <div className="space-y-3 p-4 text-sm text-gray-700 dark:text-gray-300 sm:p-6">
            <div>ID: {lead.id}</div>
            <div>Пользователь: {lead.user ? `${lead.user.name} (#${lead.user.id})` : '-'}</div>
            <div>Проект: {lead.project ? <Link href={route('projects.show', lead.project.id)} className="text-blue-500 hover:text-blue-600">{lead.project.name}</Link> : '-'}</div>
            <div>Статус: <StatusBadge status={lead.status} /></div>
            <div>TG ID: {lead.tg_id || '-'}</div>
            <div>TG username: {lead.tg_username || '-'}</div>
            <div>TG канал: {lead.is_our_channel ? '-' : (lead.tg_channel || '-')}</div>
            <div>Телефон: {lead.phone || '-'}</div>
            <div>Email: {lead.email || '-'}</div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
          <div className="border-b border-gray-200 px-5 py-4 dark:border-gray-800">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Сообщение</h3>
          </div>
          <div className="space-y-4 p-4 text-sm text-gray-700 dark:text-gray-300 sm:p-6">
            <div className="whitespace-pre-wrap">{lead.message || '-'}</div>
            <div>
              <div className="mb-1 font-medium">Комментарий</div>
              <div className="whitespace-pre-wrap">{lead.comment || '-'}</div>
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
