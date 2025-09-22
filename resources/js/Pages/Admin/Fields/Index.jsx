import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router, usePage } from '@inertiajs/react';
import { Eye, Edit, Trash2, ReplyIcon, RefreshCcw } from 'lucide-react';
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

export default function Index({fields}) {
  const [processing, setProcessing] = useState(null);

  const deleteItem = (item_id) => {
      if (!confirm('Вы уверены, что хотите удалить?')) {
          return;
      }

      setProcessing(item_id);
      router.delete(route('fields.destroy', item_id), {
          onFinish: () => setProcessing(null),
          preserveScroll: true
      });
  };

  return (
    <AuthenticatedLayout
        pageTitle="Поля"
    >
        <Head title="Поля" />

    <div className="rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div class="flex flex-col justify-between gap-5 border-b border-gray-200 px-5 py-4 sm:flex-row sm:items-center dark:border-gray-800">
            <div>
                <h3 class="text-lg font-semibold text-gray-800 dark:text-white/90">Поля</h3>
            </div>
            <div class="flex gap-3">
                <Link 
                    class="bg-brand-500 shadow-sm hover inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-600 keychainify-checked" 
                    href={route('fields.create')} data-discover="true">
                        Добавить поле
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
                Title RU
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
                Type
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
            {fields.length > 0 ? 
            fields.map((field) => (
              <TableRow key={field.id}>
                <TableCell className="px-5 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  {field.title}
                </TableCell>
                <TableCell className="px-5 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  {field.name}
                </TableCell>
                <TableCell className="px-5 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  {field.type}
                </TableCell>
                <TableCell className="px-5 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                <div className="flex gap-2">
                  <Link href={route('fields.edit', field.id)}>
                      <PrimaryButton className='!py-2 !px-3'>
                          <Edit className="size-4" />
                      </PrimaryButton>
                  </Link>
                  <div>
                  <PrimaryButton
                      onClick={() => deleteItem(field.id)}
                      disabled={processing === field.id}
                      className='w-fit !py-2 !px-3 bg-red-500 hover:bg-red-600'
                  >
                      {processing === field.id ? (
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
                <TableCell className="px-5 py-3 text-center text-gray-500 text-theme-sm dark:text-gray-400" colspan={3}>
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