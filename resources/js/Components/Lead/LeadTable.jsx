import { Link } from '@inertiajs/react';
import StatusBadge from '@/Components/Lead/StatusBadge';

import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
  } from "../ui/table";
  
import { Eye } from 'lucide-react';
import { useRoles } from '@/hooks/useRoles';
import PrimaryButton from '../PrimaryButton';
import LeadStatusSelect from './LeadStatusSelect';
import { useEffect, useState } from 'react';

export default function LeadTable({ leads: initialLeads,  }) {
    const { hasRole, hasAnyRole } = useRoles()
    const [leads, setLeads] = useState(initialLeads);
    const [savingField, setSavingField] = useState(null);
    const [editingLeadId, setEditingLeadId] = useState(null);

    useEffect(() => {
      setLeads(initialLeads);
    }, [initialLeads]);

    return (
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
              {hasRole('admin') && (
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Юзер
              </TableCell>
              )}
              {hasRole('admin') && (
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Клиент
              </TableCell>
              )}
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
                ТГ канал
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400"
              >
                Сумма
              </TableCell>
              <TableCell
                isHeader
                className=" px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400"
              >
                Дата
              </TableCell>
              <TableCell
                isHeader
                className=" px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400"
              >
                Статус
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                
              </TableCell>
            </TableRow>
          </TableHeader>

          {/* Table Body */}
          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {leads.total > 0 ? 
            leads.data.map((lead) => (
              <TableRow key={lead.id}>
                <TableCell className="px-5 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {lead.id}
                </TableCell>
                {hasRole('admin') && (
                <TableCell className="px-5 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  {lead.user ? (
                    <Link href={route('users.edit', lead.user.id)}>{lead.user.name} (#{lead.user.id})</Link>
                  ) : (
                    <>-</>
                  )}
                    
                </TableCell>
                )}
                {hasRole('admin') && (
                <TableCell className="px-5 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {lead.name}
                    
                </TableCell>
                )}
                <TableCell className="px-5 py-4 sm:px-6 ">
                  {lead.offer ? (
                  <Link href={route('offer.show', lead.offer.id)}>
                  <div className="flex flex-col">
                    <div className="w-10 h-10 overflow-hidden rounded-md">
                      <img
                        width={40}
                        height={40}
                        src={lead.offer.image_path ? `/storage/${lead.offer.image_path}` : `/storage/offers/no-photo.png`}
                        alt={lead.offer.name}
                      />
                    </div>
                    <div>
                      <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                        {lead.offer.name}
                      </span>
                    </div>
                  </div>
                  </Link>
                  )  : (
                    <>Нет</>
                  )}

                </TableCell>
                <TableCell className="px-5 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {lead.tg_channel || '-'}
                </TableCell>
                <TableCell className="px-5 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">
                    {lead.price} {lead.currency}
                </TableCell>
                <TableCell className="px-5 py-3 text-gray-500 text-sm text-center dark:text-gray-400">
                    {new Date(lead.created_at).toLocaleString()}
                </TableCell>
                <TableCell className="px-5 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">

                    {hasRole('admin') ? (
                        <LeadStatusSelect lead={lead} />
                    ) : (
                        <StatusBadge status={lead.status} />
                    )}
                  
                </TableCell>

                <TableCell className="px-5 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    <Link href={route('leads.show', lead.id)}>
                        <PrimaryButton className='!py-2 !px-3'>
                            <Eye className="size-4" />
                        </PrimaryButton>
                    </Link>
                </TableCell>
              </TableRow>
            )): (
              <TableRow>
                <TableCell className="px-5 py-3 text-center text-gray-500 text-theme-sm dark:text-gray-400" colspan={7}>
                  Not found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    );
}
