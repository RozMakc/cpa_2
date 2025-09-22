import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router, usePage } from '@inertiajs/react';
import { Eye, Edit, Trash2, ReplyIcon, RefreshCcw, CheckCheckIcon, CircleCheck } from 'lucide-react';
import Badge from '@/Components/ui/badge/badge';

import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
  } from "@/Components/ui/table"

import PrimaryButton from '@/Components/PrimaryButton';
import { useState } from 'react';
import { useRoles } from '@/hooks/useRoles';

export default function Index({projects}) {
  const [processing, setProcessing] = useState(null);
  const { hasRole, hasAnyRole } = useRoles()
  const deleteItem = (item_id) => {
      if (!confirm('Вы уверены, что хотите удалить?')) {
          return;
      }

      setProcessing(item_id);
      router.delete(route('projects.destroy', item_id), {
          onFinish: () => setProcessing(null),
          preserveScroll: true
      });
  };
  const statusConfig = {
      active: { color: 'success', text: 'Активен' },
      paused: { color: 'secondary', text: 'Не активен' },
      completed: { color: 'primary', text: 'Завершен' }
  };
  const getStatusText = (status) => {
    const params = statusConfig[status] || { color: 'light', text: status };
    return (
      <Badge
          size="sm"
          color={params.color}
      >
          {params.text}
      </Badge>
    )
  }
  return (
    <AuthenticatedLayout
        pageTitle="Проекты"
    >
        <Head title="Проекты" />

    <div className="rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="flex flex-col justify-between gap-5 border-b border-gray-200 px-5 py-4 sm:flex-row sm:items-center dark:border-gray-800">
            <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Проекты</h3>
            </div>
            {hasRole('admin') && (
            <div class="flex gap-3">
                <Link 
                    className="bg-brand-500 shadow-sm hover inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-600 keychainify-checked" 
                    href={route('projects.create')} data-discover="true">
                        Добавить Проект
                </Link>
            </div>
            )}
        </div>
      
      <div className="max-w-full overflow-x-auto">
        <Table>
          {/* Table Header */}
          <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
            <TableRow>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Name
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Клиент
              </TableCell>
              {hasRole('admin') && (
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Менеджеры
              </TableCell>
              )}
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400"
              >
                Статус
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400"
              >
                Приватный
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Действия
              </TableCell>
            </TableRow>
          </TableHeader>

          {/* Table Body */}
          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {projects.length > 0 ? 
            projects.map((project) => (
              <TableRow key={project.id}>
                <TableCell className="px-5 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  {project.name}
                </TableCell>
                <TableCell className="px-5 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  {project.client.name || '-'}
                </TableCell>
                {hasRole('admin') && (
                <TableCell className="px-5 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  {project.managers.length > 0 ? 
                    project.managers.map((manager) => (
                        <div>{manager.name} ({manager.email})</div>
                    )) : ('-')
                  }
                </TableCell>
                )}
                <TableCell className="px-5 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">
                  {getStatusText(project.status)}
                </TableCell>
                <TableCell className="px-5 py-3 text-center text-gray-500 text-theme-sm dark:text-gray-400">
                  {project.is_private ? <CircleCheck className='text-amber-500 size-5 mx-auto' /> : 'НЕТ'}
                </TableCell>
                <TableCell className="px-5 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                <div className="flex gap-2">
                  <Link href={route('projects.show', project.id)}>
                      <PrimaryButton className='!py-2 !px-3'>
                          <Eye className="size-4" />
                      </PrimaryButton>
                  </Link>
                  <Link href={route('projects.edit', project.id)}>
                      <PrimaryButton className='!py-2 !px-3'>
                          <Edit className="size-4" />
                      </PrimaryButton>
                  </Link>
                  <div>
                  <PrimaryButton
                      onClick={() => deleteItem(project.id)}
                      disabled={processing === project.id}
                      className='w-fit !py-2 !px-3 bg-red-500 hover:bg-red-600'
                  >
                      {processing === project.id ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                          <Trash2 className="size-4" />
                      )}
                  </PrimaryButton>
                  </div>
                </div>
                </TableCell>
              </TableRow>
            )): (
              <TableRow>
                <TableCell className="px-5 py-3 text-center text-gray-500 text-theme-sm dark:text-gray-400" colspan={6}>
                  Not found
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