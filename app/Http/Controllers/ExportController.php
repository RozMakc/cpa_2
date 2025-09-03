<?php

namespace App\Http\Controllers;

use App\Models\Lead;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\DB;

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
                'Дата создания',
                'Имя',
                'Email',
                'Телефон',
                'Оффер',
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
                    $lead->created_at->format('Y-m-d H:i:s'),
                    $lead->name,
                    $lead->email,
                    $lead->phone,
                    $lead->offer->name ?? 'N/A',
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
}