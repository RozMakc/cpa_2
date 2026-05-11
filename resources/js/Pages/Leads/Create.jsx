import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import PrimaryButton from '@/Components/PrimaryButton';

export default function Create({ offers: projects = [] }) {
  const { data, setData, post, processing, errors } = useForm({
    project_id: '',
    name: '',
    phone: '',
    email: '',
  });

  const submit = (e) => {
    e.preventDefault();
    post(route('leads.store'));
  };

  return (
    <AuthenticatedLayout pageTitle="Добавить лид">
      <Head title="Добавить лид" />
      <form onSubmit={submit} className="rounded-xl border border-gray-200 bg-white p-5 dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="mb-5 flex justify-between">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Добавить лид</h3>
          <Link href={route('leads.index')} className="text-sm text-brand-500">Назад</Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-sm text-gray-500">Проект</span>
            <select value={data.project_id} onChange={(e) => setData('project_id', e.target.value)} className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm dark:border-gray-700 dark:text-white">
              <option value="">Без проекта</option>
              {projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}
            </select>
            {errors.project_id && <p className="mt-1 text-sm text-red-500">{errors.project_id}</p>}
          </label>
          <label className="block">
            <span className="mb-1 block text-sm text-gray-500">Имя</span>
            <input value={data.name} onChange={(e) => setData('name', e.target.value)} className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm dark:border-gray-700 dark:text-white" />
            {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
          </label>
          <label className="block">
            <span className="mb-1 block text-sm text-gray-500">Телефон</span>
            <input value={data.phone} onChange={(e) => setData('phone', e.target.value)} className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm dark:border-gray-700 dark:text-white" />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm text-gray-500">Email</span>
            <input value={data.email} onChange={(e) => setData('email', e.target.value)} className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm dark:border-gray-700 dark:text-white" />
          </label>
        </div>
        <div className="mt-5 flex justify-end">
          <PrimaryButton disabled={processing}>Сохранить</PrimaryButton>
        </div>
      </form>
    </AuthenticatedLayout>
  );
}
