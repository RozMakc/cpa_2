<?php

namespace App\Http\Controllers;

use App\Models\Lead;
use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Response;

class ExportController extends Controller
{
    public function exportLargeLeadsToCsv(Request $request)
    {
        return $this->exportLeadsToCsv($request);
    }

    public function exportLeadsToCsv(Request $request)
    {
        $request->validate([
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'status' => 'nullable|string',
            'project_id' => 'nullable|exists:projects,id',
        ]);

        $leads = $this->leadQuery($request)->get();

        return $this->streamCsv($leads, 'leads_export_' . now()->format('Y-m-d_H-i') . '.csv');
    }

    public function export(Request $request)
    {
        try {
            if (!Auth::check()) {
                return response()->json(['error' => 'Unauthorized'], 401);
            }

            $request->validate([
                'start_date' => 'required|date',
                'end_date' => 'required|date|after_or_equal:start_date',
                'fields' => 'required',
                'format' => 'required|in:csv,xlsx',
                'project_id' => 'required|exists:projects,id',
            ]);

            $project = Project::findOrFail($request->project_id);
            $leads = $this->leadQuery($request)
                ->where('project_id', $project->id)
                ->get();

            if ($leads->isEmpty()) {
                return response()->json(['error' => 'Нет данных для выгрузки'], 404);
            }

            if ($request->format !== 'csv') {
                return response()->json(['error' => 'Формат пока не поддерживается'], 400);
            }

            return $this->streamCsv($leads, "leads_{$project->id}_{$request->start_date}_{$request->end_date}.csv", explode(',', $request->fields));
        } catch (\Exception $e) {
            Log::error('Export error: ' . $e->getMessage());

            return response()->json(['error' => 'Ошибка при выгрузке: ' . $e->getMessage()], 500);
        }
    }

    private function leadQuery(Request $request)
    {
        $user = Auth::user();

        return Lead::with(['user', 'project'])
            ->when($request->start_date, fn($query, $startDate) => $query->whereDate('created_at', '>=', $startDate))
            ->when($request->end_date, fn($query, $endDate) => $query->whereDate('created_at', '<=', $endDate))
            ->when($request->status, fn($query, $status) => $query->where('status', $status))
            ->when($request->project_id, fn($query, $projectId) => $query->where('project_id', $projectId))
            ->when($user && !$user->hasRole('admin'), fn($query) => $query->where('user_id', $user->id))
            ->orderBy('created_at', 'desc');
    }

    private function streamCsv($leads, string $fileName, ?array $fields = null)
    {
        $fields ??= ['id', 'user_id', 'project', 'tg_id', 'tg_username', 'tg_channel', 'message', 'status', 'created_at'];

        return Response::stream(function () use ($leads, $fields) {
            $file = fopen('php://output', 'w');
            fwrite($file, "\xEF\xBB\xBF");
            fputcsv($file, array_map(fn($field) => $this->fieldLabel($field), $fields), ';');

            foreach ($leads as $lead) {
                fputcsv($file, array_map(fn($field) => $this->fieldValue($lead, $field), $fields), ';');
            }

            fclose($file);
        }, 200, [
            'Content-Type' => 'text/csv; charset=utf-8',
            'Content-Disposition' => 'attachment; filename="' . $fileName . '"',
        ]);
    }

    private function fieldLabel(string $field): string
    {
        return [
            'id' => 'ID',
            'user_id' => 'User ID',
            'project' => 'Проект',
            'tg_id' => 'TG ID',
            'tg_username' => 'TG username',
            'tg_channel' => 'TG канал',
            'message' => 'Сообщение',
            'status' => 'Статус',
            'created_at' => 'Дата',
        ][$field] ?? $field;
    }

    private function fieldValue(Lead $lead, string $field): string
    {
        return match ($field) {
            'project' => (string) ($lead->project?->name ?? ''),
            'user' => (string) ($lead->user?->name ?? ''),
            'created_at' => (string) ($lead->created_at?->format('Y-m-d H:i:s') ?? ''),
            'tg_channel' => $lead->is_our_channel ? '' : (string) ($lead->tg_channel ?? ''),
            default => (string) data_get($lead, $field, ''),
        };
    }
}
