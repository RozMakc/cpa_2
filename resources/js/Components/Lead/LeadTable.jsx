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

const rowStatusClass = (status) => ({
  new: 'bg-blue-50/70 dark:bg-blue-500/10',
  invited: 'bg-cyan-50/70 dark:bg-cyan-500/10',
  accepted: 'bg-green-50/70 dark:bg-green-500/10',
  no_answer: 'bg-yellow-50/70 dark:bg-yellow-500/10',
  self_rejected: 'bg-orange-50/70 dark:bg-orange-500/10',
  rejected: 'bg-red-50/70 dark:bg-red-500/10',
  invalid_number: 'bg-red-50/70 dark:bg-red-500/10',
  duplicate: 'bg-gray-100/80 dark:bg-white/5',
  test: 'bg-purple-50/70 dark:bg-purple-500/10',
  other: 'bg-slate-50 dark:bg-white/[0.03]',
}[status] || '');

export default function LeadTable({ leads: initialLeads }) {
  const { hasRole } = useRoles();
  const [leads, setLeads] = useState(initialLeads);

  useEffect(() => {
    setLeads(initialLeads);
  }, [initialLeads]);

  return (
    <div className="max-w-full overflow-x-auto">
      <Table>
        <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
          <TableRow>
            <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">ID</TableCell>
            {hasRole('admin') && (
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Пользователь</TableCell>
            )}
            <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Проект</TableCell>
            <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">TG ID</TableCell>
            <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Username</TableCell>
            <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">TG канал</TableCell>
            <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Сообщение</TableCell>
            <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400">Дата</TableCell>
            <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400">Статус</TableCell>
            <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400" />
          </TableRow>
        </TableHeader>

        <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
          {leads.total > 0 ? leads.data.map((lead) => (
            <TableRow key={lead.id} className={rowStatusClass(lead.status)}>
              <TableCell className="px-5 py-3 text-gray-600 text-theme-sm dark:text-gray-300">{lead.id}</TableCell>
              {hasRole('admin') && (
                <TableCell className="px-5 py-3 text-gray-600 text-theme-sm dark:text-gray-300">
                  {lead.user ? <Link href={route('users.edit', lead.user.id)}>{lead.user.name} (#{lead.user.id})</Link> : '-'}
                </TableCell>
              )}
              <TableCell className="px-5 py-3 text-gray-600 text-theme-sm dark:text-gray-300">
                {lead.project ? <Link href={route('projects.show', lead.project.id)}>{lead.project.name}</Link> : '-'}
              </TableCell>
              <TableCell className="px-5 py-3 text-gray-600 text-theme-sm dark:text-gray-300">{lead.tg_id || '-'}</TableCell>
              <TableCell className="px-5 py-3 text-gray-600 text-theme-sm dark:text-gray-300">{lead.tg_username || '-'}</TableCell>
              <TableCell className="px-5 py-3 text-gray-600 text-theme-sm dark:text-gray-300">{lead.is_our_channel ? '-' : (lead.tg_channel || '-')}</TableCell>
              <TableCell className="max-w-72 truncate px-5 py-3 text-gray-600 text-theme-sm dark:text-gray-300" title={lead.message || ''}>{lead.message || '-'}</TableCell>
              <TableCell className="px-5 py-3 text-center text-sm text-gray-600 dark:text-gray-300">{new Date(lead.created_at).toLocaleString()}</TableCell>
              <TableCell className="px-5 py-3 text-center text-theme-sm">
                {hasRole('admin') ? <LeadStatusSelect lead={lead} /> : <StatusBadge status={lead.status} />}
              </TableCell>
              <TableCell className="px-5 py-3 text-theme-sm">
                <Link href={route('leads.show', lead.id)}>
                  <PrimaryButton className="!px-3 !py-2">
                    <Eye className="size-4" />
                  </PrimaryButton>
                </Link>
              </TableCell>
            </TableRow>
          )) : (
            <TableRow>
              <TableCell className="px-5 py-3 text-center text-gray-500 text-theme-sm dark:text-gray-400" colSpan={hasRole('admin') ? 10 : 9}>
                Not found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
