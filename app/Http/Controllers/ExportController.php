<?php

namespace App\Http\Controllers;

use App\Models\Lead;
use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ExportController extends Controller
{
    public function exportLeadsToCsv(Request $request)
    {
        $request->validate([
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'status' => 'nullable|in:new,processing,completed,rejected,canceled',
            'offer_id' => 'nullable|exists:offers,id'
        ]);

        $user = Auth::user();

        $leads = Lead::with(['offer', 'user', 'link'])
            ->when($request->start_date, function ($query, $startDate) {
                return $query->whereDate('created_at', '>=', $startDate);
            })
            ->when($request->end_date, function ($query, $endDate) {
                return $query->whereDate('created_at', '<=', $endDate);
            })
            ->when($request->status, function ($query, $status) {
                return $query->where('status', $status);
            })
            ->when($request->offer_id, function ($query, $offerId) {
                return $query->where('offer_id', $offerId);
            })
            ->when(!$user->hasRole('admin'), function ($query, $user) {
                return $query->where('user_id', $user->id);
            })
            ->orderBy('created_at', 'desc')
            ->get();

        // Название файла с датой
        $fileName = 'leads_export_' . now()->format('Y-m-d_H-i') . '.csv';

        // Заголовки для CSV
        $headers = [
            'Content-Type' => 'text/csv; charset=utf-8',
            'Content-Disposition' => 'attachment; filename="' . $fileName . '"',
            'Pragma' => 'no-cache',
            'Cache-Control' => 'must-revalidate, post-check=0, pre-check=0',
            'Expires' => '0'
        ];

        // Колбек для генерации CSV
        $callback = function() use ($leads) {
            $file = fopen('php://output', 'w');
            
            // BOM для правильного отображения кириллицы в Excel
            fwrite($file, "\xEF\xBB\xBF");
            
            // Заголовки столбцов
            fputcsv($file, [
                'ID',
                'User ID',
                'Дата создания',
                'Имя',
                'Фамилия',
                'Пол',
                'Дата рождения',
                'Город',
                'Гражданство',
                'Email',
                'Телефон',
                'Оффер',
                'Оффер ID',
                'Статус',
                'Сумма',
                'UTM Source',
                'UTM Medium',
                'UTM Campaign',
                'UTM Term',
                'UTM Content',
                'Sub1',
                'Sub2',
                'Sub3',
                'Sub4',
                'Sub5',
                'IP адрес'
            ], ';');

            // Данные
            foreach ($leads as $lead) {
                fputcsv($file, [
                    $lead->id,
                    $lead->user_id,
                    $lead->created_at->format('Y-m-d H:i:s'),
                    $lead->firstname,
                    $lead->lastname,
                    $lead->gender,
                    $lead->birthday,
                    $lead->address,
                    $lead->citizenship,
                    $lead->email,
                    $lead->phone,
                    $lead->offer->name ?? 'N/A',
                    $lead->offer->id ?? 'N/A',
                    $this->getStatusText($lead->status),
                    $lead->price,
                    $lead->utm_source,
                    $lead->utm_medium,
                    $lead->utm_campaign,
                    $lead->utm_term,
                    $lead->utm_content,
                    $lead->sub1,
                    $lead->sub2,
                    $lead->sub3,
                    $lead->sub4,
                    $lead->sub5,
                    $lead->ip_address
                ], ';');
            }

            fclose($file);
        };

        return Response::stream($callback, 200, $headers);
    }

    private function getStatusText($status)
    {
        $statuses = [
            'new' => 'Новый',
            'hold' => 'Холд',
            'completed' => 'Завершен',
            'rejected' => 'Отклонен',
            'canceled' => 'Отменен'
        ];

        return $statuses[$status] ?? $status;
    }

    // Альтернативный метод с использованием chunk для больших данных
    public function exportLargeLeadsToCsv(Request $request)
    {
        $fileName = 'leads_export_' . now()->format('Y-m-d_H-i') . '.csv';

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $fileName . '"',
        ];

        return Response::stream(function() use ($request) {
            $file = fopen('php://output', 'w');
            fwrite($file, "\xEF\xBB\xBF");
            
            // Заголовки
            fputcsv($file, [
                'ID', 'Имя', 'Email', 'Телефон', 'Статус', 'Дата создания'
            ], ';');

            // Обрабатываем данные чанками
            Lead::when($request->start_date, function ($query, $startDate) {
                return $query->whereDate('created_at', '>=', $startDate);
            })
            ->when($request->end_date, function ($query, $endDate) {
                return $query->whereDate('created_at', '<=', $endDate);
            })
            ->chunk(1000, function ($leads) use ($file) {
                foreach ($leads as $lead) {
                    fputcsv($file, [
                        $lead->id,
                        $lead->name,
                        $lead->email,
                        $lead->phone,
                        $this->getStatusText($lead->status),
                        $lead->created_at->format('Y-m-d H:i:s')
                    ], ';');
                }
            });

            fclose($file);
        }, 200, $headers);
    }

    public function export(Request $request)
    {
        try {
            if (!Auth::check()) {
                return response()->json(['error' => 'Не авторизован'], 401);
            }

            $request->validate([
                'start_date' => 'required|date',
                'end_date' => 'required|date|after_or_equal:start_date',
                'fields' => 'required',
                'format' => 'required|in:csv,xlsx',
                'project_id' => 'required|exists:projects,id'
            ]);

            $project = Project::findOrFail($request->project_id);
            $startDate = $request->start_date;
            $endDate = $request->end_date;
            $fields = explode(',', $request->fields);
            $format = $request->format;

            // Получаем fieldMappings проекта (как в методе show)
            $fieldMappings = $project->getIntegrationFieldMappings();

            // Получаем лиды за указанный период
            $leads = Lead::where('project_id', $project->id)
                ->whereNotNull('created_at')
                ->whereBetween('created_at', [$startDate, $endDate])
                ->with(['user', 'offer'])
                ->get();

            if ($leads->isEmpty()) {
                return response()->json(['error' => 'Нет данных для выгрузки'], 404);
            }

            if ($format === 'csv') {
                return $this->exportToCsv($leads, $fields, $project, $fieldMappings, $startDate, $endDate);
            }

            return response()->json(['error' => 'Формат не поддерживается'], 400);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['error' => 'Ошибка валидации: ' . $e->getMessage()], 422);
        } catch (\Exception $e) {
            Log::error('Export error: ' . $e->getMessage());
            return response()->json(['error' => 'Ошибка при выгрузке данных: ' . $e->getMessage()], 500);
        }
    }


    private function exportToCsv($leads, $fields, $project, $fieldMappings, $startDate, $endDate)
    {
        $fileName = "lea2ds_{$project->name}_{$startDate}_{$endDate}.csv";
        
        $headers = [
            'Content-Type' => 'text/csv; charset=utf-8',
            'Content-Disposition' => "attachment; filename=\"{$fileName}\"",
            'Pragma' => 'no-cache',
            'Cache-Control' => 'must-revalidate, post-check=0, pre-check=0',
            'Expires' => '0'
        ];

        $callback = function() use ($leads, $fields, $fieldMappings) {
            $output = fopen('php://output', 'w');
            
            // Добавляем BOM для корректного отображения кириллицы в Excel
            fwrite($output, "\xEF\xBB\xBF");
            
            // Заголовки (используем оригинальные названия полей как в таблице)
            $headers = array_map(function($field) use ($fieldMappings) {
                return $this->getFieldLabel($field, $fieldMappings);
            }, $fields);
            
            fputcsv($output, $headers, ';');
            
            // Данные
            foreach ($leads as $lead) {
                $row = [];
                foreach ($fields as $field) {
                    try {
                        $row[] = $this->getLeadFieldValue($lead, $field, $fieldMappings);
                    } catch (\Exception $e) {
                        $row[] = '';
                        Log::warning("Error processing field {$field} for lead {$lead->id}: " . $e->getMessage());
                    }
                }
                fputcsv($output, $row, ';');
            }
            
            fclose($output);
        };

        return response()->stream($callback, 200, $headers);
    }

    /**
     * Точная копия логики из фронтенда getLeadFieldValue
     */
    private function getLeadFieldValue($lead, $fieldName, $fieldMappings)
    {
        // Проверяем есть ли маппинг для этого поля
        $mappedField = $fieldMappings[$fieldName] ?? null;

        // Если есть маппинг и поле начинается с "additional_data."
        if ($mappedField) {
            if (str_starts_with($mappedField, 'additional_data.')) {
                $additionalDataField = str_replace('additional_data.', '', $mappedField);
                return $lead->additional_data[$additionalDataField] ?? '-';
            }
            return $lead->{$mappedField} ?? '-';
        }

        // Стандартные поля (точно такие же как во фронтенде)
        $standardFields = [
            'id' => $lead->id ?? '-',
            'name' => $lead->name ?? '-',
            'email' => $lead->email ?? '-',
            'phone' => $lead->phone ?? '-',
            'tg_channel' => $lead->tg_channel ?? '-',
            'status' => $this->getStatusLabel($lead->status ?? 'new'),
            'price' => $lead->price ?? '-',
            'currency' => $lead->currency ?? '-',
            'created_at' => $lead->created_at ? $lead->created_at->format('d.m.Y H:i') : '----',
            'user' => $lead->user ? $lead->user->name . ' (#' . $lead->user->id . ')' : '-',
            'offer' => $lead->offer ? $lead->offer->name : 'Нет',
        ];

        if ($fieldName === 'created_at') {
            if ($lead->created_at) {
                return $lead->created_at->format('d.m.Y H:i');
            }
            // Если created_at null, попробуем использовать другую дату или текущее время
            return $lead->updated_at ? $lead->updated_at->format('d.m.Y H:i') : now()->format('d.m.Y H:i');
        }
        // Если поле стандартное
        if (array_key_exists($fieldName, $standardFields)) {
            return $standardFields[$fieldName];
        }

        // Если поле в additional_data (прямой доступ)
        if ($lead->additional_data && array_key_exists($fieldName, $lead->additional_data)) {
            return $lead->additional_data[$fieldName] ?? '-';
        }

        // Если поле есть непосредственно в lead
        if (isset($lead->{$fieldName})) {
            return $lead->{$fieldName};
        }

        return '-';
    }

    /**
     * Функция для получения читаемых названий полей для заголовков CSV
     */
    private function getFieldLabel($fieldName, $fieldMappings)
    {
        // Маппинг русских названий для стандартных полей
        $russianLabels = [
            'id' => 'ID',
            'name' => 'Имя',
            'email' => 'Email',
            'phone' => 'Телефон',
            'tg_channel' => 'ТГ канал',
            'status' => 'Статус',
            'price' => 'Цена',
            'currency' => 'Валюта',
            'created_at' => 'Дата создания',
            'user' => 'Менеджер',
            'offer' => 'Оффер',
            'is_counted' => 'Засчитан',
            'comment' => 'Комментарий',
        ];

        // Если есть маппинг, пытаемся получить название из visible_fields проекта
        if (isset($fieldMappings[$fieldName])) {
            // Здесь можно добавить логику получения названия из настроек проекта
            // Пока возвращаем оригинальное название поля
            return $russianLabels[$fieldName] ?? $fieldName;
        }

        return $russianLabels[$fieldName] ?? $fieldName;
    }

    private function getStatusLabel($status)
    {
        $statuses = [
            'new' => 'Новый',
            'invited' => 'Приглашен',
            'accepted' => 'Принят',
            'no_answer' => 'Недозвон',
            'self_rejected' => 'Самоотказ',
            'rejected' => 'Отказ',
            'other' => 'Прочее',
            'invalid_number' => 'Некорректный номер',
            'duplicate' => 'Дубль',
            'test' => 'Тест'
        ];
        
        return $statuses[$status] ?? $status;
    }

    private function exportToExcel($data, $fields, $project, $startDate, $endDate)
    {
        // Реализация экспорта в Excel с использованием библиотеки like Maatwebsite/Laravel-Excel
        // или простой реализации через PHPOffice
        return response()->json([
            'error' => 'Excel export not implemented yet'
        ], 501);
    }
}
