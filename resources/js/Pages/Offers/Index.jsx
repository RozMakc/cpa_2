import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { Play, Pause, Edit, Trash2 } from 'lucide-react';

import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
  } from "../../Components/ui/table";

import {
    TrashBinIcon,
    PlusIcon
} from '@/icons'


import Badge from '@/Components/ui/badge/badge';
import PrimaryButton from '@/Components/PrimaryButton';
import { useState } from 'react';
import { useRoles } from '@/hooks/useRoles';
import OfferDropdown from '@/Components/OfferDropdown';

export default function Index({auth, offers}) {
  const { hasRole, hasAnyRole } = useRoles()

  const [processing, setProcessing] = useState(null);

  const toggleStatus = (offer) => {
      setProcessing(offer.id);
      router.patch(route('offer.toggle', offer.id), {
          is_active: !offer.is_active
      }, {
          onFinish: () => setProcessing(null),
          preserveScroll: true
      });
  };

  const deleteOffer = (offer) => {
      if (!confirm('Вы уверены, что хотите удалить этот оффер?')) {
          return;
      }

      setProcessing(offer.id);
      router.delete(route('offer.destroy', offer.id), {
          onFinish: () => setProcessing(null),
          preserveScroll: true
      });
  };

  return (
    <AuthenticatedLayout
        pageTitle="Офферы"
    >
        <Head title="Офферы" />

    <div className="rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div class="flex flex-col justify-between gap-5 border-b border-gray-200 px-5 py-4 sm:flex-row sm:items-center dark:border-gray-800">
            <div>
                <h3 class="text-lg font-semibold text-gray-800 dark:text-white/90">Список офферов</h3>
            </div>
            <div class="flex gap-3">
              {hasRole('admin') && (
                <Link 
                    class="bg-brand-500 shadow-sm hover inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-600 keychainify-checked" 
                    href={route('offer.create')} data-discover="true">
                        Добавить Оффер
                </Link>
              )}

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
                Оффер
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Статистика
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Выплаты
              </TableCell>
              <TableCell
                isHeader
                className=" px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400"
              >
                Стутус
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
            {offers.length > 0 ? 
            offers.map((offer) => (
              <TableRow key={offer.id}>
                <TableCell className="px-5 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  {offer.id}
                </TableCell>
                <TableCell className="px-5 py-4 sm:px-6 ">
                  <Link href={route('offer.show', offer.id)}>
                  <div className="flex flex-col">
                    <div className="w-10 h-10 overflow-hidden rounded-md">
                      <img
                        width={40}
                        height={40}
                        src={offer.image_path ? `/storage/${offer.image_path}` : `/storage/offers/no-photo.png`}
                        alt={offer.name}
                      />
                    </div>
                    <div>
                      <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                        {offer.name}
                      </span>
                    </div>
                  </div>
                  </Link>
                </TableCell>
                <TableCell className="px-5 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  <div className="space-y-2">
                    <div className="">CR: 101.74</div>
                    <div className="">EPC: 1000</div>
                  </div>
                </TableCell>
                <TableCell className="px-5 py-3 text-gray-500 text-sm dark:text-gray-400">
                  
                  { offer.prices && offer.prices.length > 0 ? (
                    <span>
                      до <span className="font-semibold text-md">{Math.max(...offer.prices.map(p => p.price))}</span> RUB
                    </span>
                  ) : (
                      'Нет цен'
                  )}
                </TableCell>
                <TableCell className="px-5 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">
                  <Badge
                    size="sm"
                    color={
                      offer.is_active
                        ? "success"
                        : "error"
                    }
                  >
                    {offer.is_active ? 'Активен' : 'Выключен'}
                  </Badge>
                </TableCell>
                <TableCell className="px-5 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    

                  {hasRole('admin') ? (
                      <div className="flex gap-2">
                          <div>
                          <PrimaryButton
                              onClick={() => toggleStatus(offer)}
                              disabled={processing === offer.id}
                              className={` !py-2 !px-3 ${
                                  offer.is_active 
                                      ? 'bg-yellow-500 hover:bg-yellow-600' 
                                      : 'bg-green-500 hover:bg-green-600'
                              }`}
                          >
                              {processing === offer.id ? (
                                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              ) : offer.is_active ? (
                                  <Pause className="size-4" />
                              ) : (
                                  <Play className="size-4" />
                              )}
                          </PrimaryButton>
                          </div>
                          <Link href={route('offer.show', offer.id)}>
                              <PrimaryButton className='!py-2 !px-3'>
                                  <Edit className="size-4" />
                              </PrimaryButton>
                          </Link>
                          <div>
                          <PrimaryButton
                              onClick={() => deleteOffer(offer)}
                              disabled={processing === offer.id}
                              className='w-fit !py-2 !px-3 bg-red-500 hover:bg-red-600'
                          >
                              {processing === offer.id ? (
                                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              ) : (
                                  <Trash2 className="size-4" />
                              )}
                          </PrimaryButton>
                          </div>
                        </div>
                    ) : (
                        <div>
                          <OfferDropdown offer_id={offer.id}/>
                        </div>
                    )}
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