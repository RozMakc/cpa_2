import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { Eye, Edit, Trash2 } from 'lucide-react';
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

export default function Index({users}) {
  const [processing, setProcessing] = useState(null);
  const { hasRole, hasAnyRole } = useRoles()

  const deleteUser = (user_id) => {
      if (!confirm('Вы уверены, что хотите удалить пользователя?')) {
          return;
      }

      setProcessing(user_id);
      router.delete(route('users.destroy', user_id), {
          onFinish: () => setProcessing(null),
          preserveScroll: true
      });
  };

  return (
    <AuthenticatedLayout
        pageTitle="Пользователи"
    >
        <Head title="Пользователи" />

    <div className="rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div class="flex flex-col justify-between gap-5 border-b border-gray-200 px-5 py-4 sm:flex-row sm:items-center dark:border-gray-800">
            <div>
                <h3 class="text-lg font-semibold text-gray-800 dark:text-white/90">Пользователи</h3>
            </div>
            <div class="flex gap-3">
                <Link 
                    class="bg-brand-500 shadow-sm hover inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-600 keychainify-checked" 
                    href={route('users.create')} data-discover="true">
                        Добавить Пользователя
                </Link>
            </div>
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
                ID
              </TableCell>
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
                Phone
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Email
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Роль
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Активен
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Трафик
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
            {users.length > 0 ? 
            users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="px-5 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  {user.id}
                </TableCell>
                <TableCell className="px-5 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  {user.name}
                </TableCell>
                <TableCell className="px-5 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  {user.phone}
                </TableCell>
                <TableCell className="px-5 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  {user.email}
                </TableCell>
                <TableCell className="px-5 py-3 text-gray-500 text-sm dark:text-gray-400">
                  {user.roles[0].name}
                </TableCell>

                <TableCell className="px-5 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  <Badge
                    size="sm"
                    color={
                      user.is_active
                        ? "success"
                        : "error"
                    }
                  >
                    {user.is_active ? 'Активен' : 'Ожидает активации'}
                  </Badge>
                </TableCell>

                <TableCell className="px-5 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                <Badge
                    size="sm"
                    color={
                      user.is_stopped
                        ? "success"
                        : "error"
                    }
                  >
                    {user.is_stopped ? 'Активен' : 'Остановлен'}
                  </Badge>
                </TableCell>


                <TableCell className="px-5 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                <div className="flex gap-2">
                          <Link href={route('users.edit', user.id)}>
                              <PrimaryButton className='!py-2 !px-3'>
                                  <Edit className="size-4" />
                              </PrimaryButton>
                          </Link>
                          <div>
                          <PrimaryButton
                              onClick={() => deleteUser(user.id)}
                              disabled={processing === user.id}
                              className='w-fit !py-2 !px-3 bg-red-500 hover:bg-red-600'
                          >
                              {processing === user.id ? (
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