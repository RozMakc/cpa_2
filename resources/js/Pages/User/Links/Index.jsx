import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { Eye, Edit, Trash2 } from 'lucide-react';

import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
  } from "@/Components/ui/table"

import {
    TrashBinIcon,
    PlusIcon
} from '@/icons'


import Badge from '@/Components/ui/badge/badge';
import PrimaryButton from '@/Components/PrimaryButton';
import { useState } from 'react';
import { useRoles } from '@/hooks/useRoles';

export default function Index({auth, links}) {
  const [processing, setProcessing] = useState(null);

  const deleteLink = (link) => {
      if (!confirm('Вы уверены, что хотите удалить ссылку?')) {
          return;
      }

      setProcessing(link.id);
      router.delete(route('link.destroy', link.id), {
          onFinish: () => setProcessing(null),
          preserveScroll: true
      });
  };

  return (
    <AuthenticatedLayout
        pageTitle="Ссылки"
    >
        <Head title="Ссылки" />

    <div className="rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div class="flex flex-col justify-between gap-5 border-b border-gray-200 px-5 py-4 sm:flex-row sm:items-center dark:border-gray-800">
            <div>
                <h3 class="text-lg font-semibold text-gray-800 dark:text-white/90">Ссылки</h3>
            </div>
            <div class="flex gap-3">
                <Link 
                    class="bg-brand-500 shadow-sm hover inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-600 keychainify-checked" 
                    href={route('link.create')} data-discover="true">
                        Добавить Ссылку
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
                Название
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Оффер
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Переходов
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Заказов
              </TableCell>
              <TableCell
                isHeader
                className=" px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400"
              >
                URL
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
            {links.total > 0 ? 
            links.data.map((link) => (
              <TableRow key={link.id}>
                <TableCell className="px-5 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  {link.name || '-'}
                </TableCell>
                <TableCell className="px-5 py-4 sm:px-6 ">
                  <div className="flex flex-col">
                    <div className="w-10 h-10 overflow-hidden rounded-md">
                      <img
                        width={40}
                        height={40}
                        src={link.offer.image_path ? `/storage/${link.offer.image_path}` : `/storage/offers/no-photo.png`}
                        alt={link.offer.name}
                      />
                    </div>
                    <div>
                      <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                        {link.offer.name}
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="px-5 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  {link.click_count}
                </TableCell>
                <TableCell className="px-5 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  {link.conversion_count}
                </TableCell>
                <TableCell className="px-5 py-3 text-gray-500 text-sm dark:text-gray-400">
                  {link.base_url}
                </TableCell>

                <TableCell className="px-5 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                  
                      <div className="flex gap-2">
                          <a target="_blank" href={route('link.redirect', link.uuid)}>
                          <PrimaryButton
                              className={` !py-2 !px-3`}
                          >
                              <Eye className="size-4" />
                          </PrimaryButton>
                          </a>
                          <Link href={route('link.show', link.id)}>
                              <PrimaryButton className='!py-2 !px-3'>
                                  <Edit className="size-4" />
                              </PrimaryButton>
                          </Link>
                          <div>
                          <PrimaryButton
                              onClick={() => deleteLink(link)}
                              disabled={processing === link.id}
                              className='w-fit !py-2 !px-3 bg-red-500 hover:bg-red-600'
                          >
                              {processing === link.id ? (
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