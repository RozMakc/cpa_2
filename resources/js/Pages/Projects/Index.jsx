import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Edit, Eye, Play, Square, Trash2 } from 'lucide-react';
import Badge from '@/Components/ui/badge/badge';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/Components/ui/table';
import PrimaryButton from '@/Components/PrimaryButton';
import { useState } from 'react';
import { useRoles } from '@/hooks/useRoles';

export default function Index({ projects }) {
  const [processing, setProcessing] = useState(null);
  const { hasRole } = useRoles();
  const isAdmin = hasRole('admin');

  const deleteItem = (itemId) => {
    if (!confirm('Вы уверены, что хотите удалить?')) {
      return;
    }

    setProcessing(itemId);
    router.delete(route('projects.destroy', itemId), {
      onFinish: () => setProcessing(null),
      preserveScroll: true,
    });
  };

  const toggleStatus = (project) => {
    setProcessing(project.id);
    router.patch(route('projects.toggle-status', project.id), {}, {
      onFinish: () => setProcessing(null),
      preserveScroll: true,
    });
  };

  const statusConfig = {
    active: { color: 'success', text: 'Включен' },
    paused: { color: 'light', text: 'Выключен' },
    completed: { color: 'primary', text: 'Завершен' },
  };

  const statusBadge = (status) => {
    const params = statusConfig[status] || { color: 'light', text: status || '-' };

    return <Badge size="sm" color={params.color}>{params.text}</Badge>;
  };

  return (
    <AuthenticatedLayout pageTitle="Проекты">
      <Head title="Проекты" />

      <div className="rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="flex flex-col justify-between gap-5 border-b border-gray-200 px-5 py-4 sm:flex-row sm:items-center dark:border-gray-800">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Проекты</h3>
          <Link
            className="inline-flex items-center justify-center rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-600"
            href={route('projects.create')}
          >
            Добавить проект
          </Link>
        </div>

        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">ID</TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Название</TableCell>
                {isAdmin && (
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Юзер</TableCell>
                )}
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400">Лиды</TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400">Статус</TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Действия</TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {projects.length > 0 ? projects.map((project) => (
                <TableRow key={project.id}>
                  <TableCell className="px-5 py-3 text-gray-500 text-theme-sm dark:text-gray-400">{project.id}</TableCell>
                  <TableCell className="px-5 py-3 text-gray-800 text-theme-sm dark:text-white/90">{project.name}</TableCell>
                  {isAdmin && (
                    <TableCell className="px-5 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      {project.owner ? (
                        <Link href={route('users.edit', project.owner.id)} className="text-blue-600 hover:text-blue-800 dark:text-blue-400">
                          {project.owner.name} (#{project.owner.id})
                        </Link>
                      ) : '-'}
                    </TableCell>
                  )}
                  <TableCell className="px-5 py-3 text-center text-gray-500 text-theme-sm dark:text-gray-400">
                    {project.leads_count ?? 0}
                  </TableCell>
                  <TableCell className="px-5 py-3 text-center text-gray-500 text-theme-sm dark:text-gray-400">
                    {statusBadge(project.status)}
                  </TableCell>
                  <TableCell className="px-5 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    <div className="flex gap-2">
                      <PrimaryButton
                        onClick={() => toggleStatus(project)}
                        disabled={processing === project.id}
                        className={`!px-3 !py-2 ${project.status === 'active' ? 'bg-amber-500 hover:bg-amber-600' : 'bg-green-500 hover:bg-green-600'}`}
                      >
                        {project.status === 'active' ? <Square className="size-4" /> : <Play className="size-4" />}
                      </PrimaryButton>
                      <Link href={route('projects.show', project.id)}>
                        <PrimaryButton className="!px-3 !py-2"><Eye className="size-4" /></PrimaryButton>
                      </Link>
                      <Link href={route('projects.edit', project.id)}>
                        <PrimaryButton className="!px-3 !py-2"><Edit className="size-4" /></PrimaryButton>
                      </Link>
                      <PrimaryButton
                        onClick={() => deleteItem(project.id)}
                        disabled={processing === project.id}
                        className="bg-red-500 !px-3 !py-2 hover:bg-red-600"
                      >
                        {processing === project.id ? (
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        ) : (
                          <Trash2 className="size-4" />
                        )}
                      </PrimaryButton>
                    </div>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell className="px-5 py-3 text-center text-gray-500 text-theme-sm dark:text-gray-400" colSpan={isAdmin ? 6 : 5}>
                    Не найдено
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
