<?php

namespace App\Jobs;

use App\Models\Project;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;
use RuntimeException;
use Throwable;

class SyncProjectToExternalService implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;

    public int $backoff = 60;

    public function __construct(public int $projectId)
    {
    }

    public function handle(): void
    {
        $project = Project::find($this->projectId);

        if (!$project) {
            return;
        }

        $url = config('services.external_projects.url');
        $apiKey = config('services.external_projects.key');

        if (!$url) {
            $project->update([
                'sync_status' => 'error',
                'sync_error' => 'EXTERNAL_PROJECTS_API_URL is not configured',
            ]);

            return;
        }

        $project->update([
            'sync_status' => 'running',
            'sync_error' => null,
        ]);

        $response = Http::timeout(20)
            ->acceptJson()
            ->when($apiKey, fn($request) => $request->withHeader('X-Api-Key', $apiKey))
            ->post($url, $this->payload($project));

        if (!$response->successful()) {
            $message = trim($response->body()) ?: "HTTP {$response->status()}";

            throw new RuntimeException("External project sync failed: {$message}");
        }

        $responseData = $response->json();

        $project->update([
            'external_id' => data_get($responseData, 'id', data_get($responseData, 'external_id', $project->external_id)),
            'sync_status' => 'sent',
            'sync_error' => null,
            'synced_at' => now(),
        ]);
    }

    public function failed(?Throwable $exception): void
    {
        Project::whereKey($this->projectId)->update([
            'sync_status' => 'error',
            'sync_error' => $exception?->getMessage(),
        ]);
    }

    private function payload(Project $project): array
    {
        return [
            'id' => $project->id,
            'external_id' => $project->external_id,
            'name' => $project->name,
            'integrations' => $project->integrations ?? [],
            'parsing_sources' => $project->parsing_sources,
            'inviting_sources' => $project->inviting_sources ?? [],
            'use_own_groups' => (bool) $project->use_own_groups,
            'mailing_groups' => $project->use_own_groups ? null : $project->mailing_groups,
            'mailing_phones' => $project->mailing_phones,
            'mailing_usernames' => $project->mailing_usernames,
            'mailing_text' => $project->mailing_text,
            'image_url' => $project->image_path ? url("/storage/{$project->image_path}") : null,
            'created_at' => $project->created_at?->toISOString(),
            'updated_at' => $project->updated_at?->toISOString(),
        ];
    }
}
