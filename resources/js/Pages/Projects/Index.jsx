import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { CircleCheck, Edit, Eye, Trash2 } from 'lucide-react';
import Badge from '@/Components/ui/badge/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from '@/Components/ui/table';
import PrimaryButton from '@/Components/PrimaryButton';
import { useState } from 'react';
import { useRoles } from '@/hooks/useRoles';

export default function Index({ projects }) {
  const [processing, setProcessing] = useState(null);
  const { hasRole } = useRoles();

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

  const statusConfig = {
    active: { color: 'success', text: 'Активен' },
    paused: { color: 'light', text: 'Не активен' },
    completed: { color: 'primary', text: 'Завершен' },
  };

  const syncStatusConfig = {
    queued: { color: 'warning', text: 'В очереди' },
    running: { color: 'info', text: 'Запущен' },
    sent: { color: 'success', text: 'Отправлен' },
    error: { color: 'error', text: 'Ошибка' },
  };

  const getStatusBadge = (status) => {
    const params = statusConfig[status] || { color: 'light', text: status || '-' };

    return (
      <Badge size="sm" color={params.color}>
        {params.text}
      </Badge>
    );
  };

  const getSyncStatusBadge = (project) => {
    const params = syncStatusConfig[project.sync_status] || {
      color: 'light',
      text: project.sync_status || '-',
    };

    return (
      <div className="flex flex-col items-center gap-1">
        <Badge size="sm" color={params.color}>
          {params.text}
        </Badge>
        {project.sync_status === 'error' && project.sync_error && (
          <span className="max-w-48 truncate text-xs text-red-500" title={project.sync_error}>
            {project.sync_error}
          </span>
        )}
      </div>
    );
  };

  return (
    <AuthenticatedLayout pageTitle="Проекты">
      <Head title="Проекты" />

      <div className="rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="flex flex-col justify-between gap-5 border-b border-gray-200 px-5 py-4 sm:flex-row sm:items-center dark:border-gray-800">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Проекты
            </h3>
          </div>
          <div className="flex gap-3">
            <Link
              className="bg-brand-500 shadow-sm hover inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-600 keychainify-checked"
              href={route('projects.create')}
              data-discover="true"
            >
              Добавить проект
            </Link>
          </div>
        </div>

        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Название
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Клиент
                </TableCell>
                {hasRole('admin') && (
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Менеджеры
                  </TableCell>
                )}
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400">
                  Статус
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400">
                  Синхронизация
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400">
                  Приватный
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Действия
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {projects.length > 0 ? (
                projects.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell className="px-5 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {project.name}
                    </TableCell>
                    <TableCell className="px-5 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {project.client?.name || '-'}
                    </TableCell>
                    {hasRole('admin') && (
                      <TableCell className="px-5 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {project.managers.length > 0
                          ? project.managers.map((manager) => (
                            <div key={manager.id}>{manager.name} ({manager.email})</div>
                          ))
                          : '-'}
                      </TableCell>
                    )}
                    <TableCell className="px-5 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">
                      {getStatusBadge(project.status)}
                    </TableCell>
                    <TableCell className="px-5 py-3 text-center text-gray-500 text-theme-sm dark:text-gray-400">
                      {getSyncStatusBadge(project)}
                    </TableCell>
                    <TableCell className="px-5 py-3 text-center text-gray-500 text-theme-sm dark:text-gray-400">
                      {project.is_private ? <CircleCheck className="mx-auto size-5 text-amber-500" /> : 'Нет'}
                    </TableCell>
                    <TableCell className="px-5 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      <div className="flex gap-2">
                        <Link href={route('projects.show', project.id)}>
                          <PrimaryButton className="!px-3 !py-2">
                            <Eye className="size-4" />
                          </PrimaryButton>
                        </Link>
                        <Link href={route('projects.edit', project.id)}>
                          <PrimaryButton className="!px-3 !py-2">
                            <Edit className="size-4" />
                          </PrimaryButton>
                        </Link>
                        <PrimaryButton
                          onClick={() => deleteItem(project.id)}
                          disabled={processing === project.id}
                          className="w-fit bg-red-500 !px-3 !py-2 hover:bg-red-600"
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
                ))
              ) : (
                <TableRow>
                  <TableCell className="px-5 py-3 text-center text-gray-500 text-theme-sm dark:text-gray-400" colSpan={hasRole('admin') ? 7 : 6}>
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
