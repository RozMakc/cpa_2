<?php

namespace App\Http\Controllers;

use App\Jobs\SyncProjectToExternalService;
use App\Models\Field;
use App\Models\Integration;
use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ProjectController extends Controller
{
    public function index()
    {
        $projects = Project::with(['owner'])
            ->withCount('leads')
            ->when(!auth()->user()->hasRole('admin'), function ($query) {
                $query->where('user_id', auth()->id())
                    ->orWhereHas('managers', fn($managerQuery) => $managerQuery->where('users.id', auth()->id()))
                    ->orWhereHas('users', fn($userQuery) => $userQuery->where('users.id', auth()->id()));
            })
            ->latest()
            ->get();

        return Inertia::render('Projects/Index', [
            'projects' => $projects,
        ]);
    }

    public function create()
    {
        return Inertia::render('Projects/Create', [
            'integrations' => Integration::where('is_active', true)->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $this->validateProject($request);
        $projectData = $this->prepareProjectData($validated);
        $projectData['user_id'] = auth()->id();

        if ($request->hasFile('image')) {
            $projectData['image_path'] = $request->file('image')->store('projects', 'public');
        }

        $projectData['status'] = 'paused';
        $projectData['sync_status'] = 'queued';
        $projectData['sync_error'] = null;

        $project = Project::create($projectData);
        SyncProjectToExternalService::dispatch($project->id, 'create')->afterCommit();

        return redirect()->route('projects.index')->with('success', 'Проект создан успешно');
    }

    public function getStats(Project $project)
    {
        $this->authorizeProjectView($project);

        $startDate = $project->start_date ?: now()->subYear();

        return $project->leads()
            ->where('created_at', '>=', $startDate)
            ->selectRaw('
                COUNT(*) as total_all,
                SUM(CASE WHEN is_counted = 1 THEN 1 ELSE 0 END) as total,
                SUM(CASE WHEN is_counted = 0 THEN 1 ELSE 0 END) as not_counted,
                SUM(CASE WHEN status = "new" AND is_counted = 1 THEN 1 ELSE 0 END) as newLeads,
                SUM(CASE WHEN status = "invited" AND is_counted = 1 THEN 1 ELSE 0 END) as invited,
                SUM(CASE WHEN status = "accepted" AND is_counted = 1 THEN 1 ELSE 0 END) as accepted,
                SUM(CASE WHEN status = "no_answer" AND is_counted = 1 THEN 1 ELSE 0 END) as no_answer,
                SUM(CASE WHEN status = "self_rejected" AND is_counted = 1 THEN 1 ELSE 0 END) as self_rejected,
                SUM(CASE WHEN status = "rejected" AND is_counted = 1 THEN 1 ELSE 0 END) as rejected,
                SUM(CASE WHEN status = "other" AND is_counted = 1 THEN 1 ELSE 0 END) as other,
                SUM(CASE WHEN status = "invalid_number" AND is_counted = 1 THEN 1 ELSE 0 END) as invalid_number,
                SUM(CASE WHEN status = "duplicate" AND is_counted = 1 THEN 1 ELSE 0 END) as duplicate,
                SUM(CASE WHEN status = "test" AND is_counted = 1 THEN 1 ELSE 0 END) as test
            ')
            ->first()
            ->toArray();
    }

    public function show(Project $project, Request $request)
    {
        $this->authorizeProjectView($project);

        $perPage = $request->get('perPage', 10);
        $startDate = $project->start_date ?: now()->subYear();

        $leads = $project->leads()
            ->with('user')
            ->where('created_at', '>=', $startDate)
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);

        $availableFields = $this->getAvailableFields();

        return Inertia::render('Projects/Show', [
            'project' => $project,
            'leads' => $leads,
            'stats' => $this->getStats($project),
            'availableFields' => $availableFields['all'],
            'fieldMappings' => $project->getIntegrationFieldMappings(),
            'perPage' => $perPage,
        ]);
    }

    public function edit(Project $project)
    {
        $this->authorizeProjectMutation($project);

        return Inertia::render('Projects/Edit', [
            'project' => $project,
            'integrations' => Integration::where('is_active', true)->get(),
        ]);
    }

    public function update(Request $request, Project $project)
    {
        $this->authorizeProjectMutation($project);

        $validated = $this->validateProject($request);
        $projectData = $this->prepareProjectData($validated, $project->visible_fields ?? null);

        if ($request->hasFile('image')) {
            if ($project->image_path) {
                Storage::disk('public')->delete($project->image_path);
            }

            $projectData['image_path'] = $request->file('image')->store('projects', 'public');
        }

        $projectData['sync_status'] = 'queued';
        $projectData['sync_error'] = null;

        $project->update($projectData);
        SyncProjectToExternalService::dispatch($project->id, 'update')->afterCommit();

        return redirect()->route('projects.index')->with('success', 'Проект обновлен успешно');
    }

    public function destroy(Project $project)
    {
        $this->authorizeProjectMutation($project);

        $deletePayload = $this->projectDeletePayload($project);
        SyncProjectToExternalService::dispatch($project->id, 'delete', $deletePayload)->afterCommit();

        if ($project->image_path) {
            Storage::disk('public')->delete($project->image_path);
        }

        $project->delete();

        return back();
    }

    public function toggleStatus(Project $project)
    {
        $this->authorizeProjectMutation($project);

        $project->update([
            'status' => $project->status === 'active' ? 'paused' : 'active',
            'sync_status' => 'queued',
            'sync_error' => null,
        ]);

        SyncProjectToExternalService::dispatch($project->id, 'status')->afterCommit();

        return back();
    }

    public function updateFieldOrder(Request $request, Project $project)
    {
        $this->authorizeProjectMutation($project);

        $request->validate([
            'field_order' => 'required|array',
        ]);

        $project->updateFieldOrder($request->field_order);

        return response()->json(['success' => true]);
    }

    public function toggleFieldVisibility(Request $request, Project $project)
    {
        $this->authorizeProjectMutation($project);

        $request->validate([
            'field_name' => 'required|string',
            'visible' => 'required|boolean',
        ]);

        $project->toggleFieldVisibility($request->field_name, $request->visible);

        return response()->json(['success' => true]);
    }

    protected function validateProject(Request $request): array
    {
        return $request->validate([
            'name' => 'required|string|max:255',
            'start_date' => 'nullable|date',
            'client_id' => 'nullable|exists:clients,id',
            'integration_id' => 'nullable|exists:integrations,id',
            'integrations' => 'nullable|array',
            'integrations.*' => 'in:whatsapp,telegram,max',
            'parsing_sources' => 'nullable|string',
            'inviting_sources' => 'nullable|array',
            'inviting_sources.*.group' => 'nullable|string|max:1000',
            'inviting_sources.*.channel' => 'nullable|string|max:1000',
            'use_own_groups' => 'nullable|boolean',
            'mailing_groups' => 'nullable|string',
            'mailing_phones' => 'nullable|string',
            'mailing_usernames' => 'nullable|string',
            'mailing_text' => 'nullable|string',
            'image' => 'nullable|image|max:4096',
        ]);
    }

    protected function prepareProjectData(array $validated, ?array $visibleFields = null): array
    {
        unset($validated['image']);

        $validated['start_date'] = $validated['start_date'] ?? now()->toDateString();
        $validated['status'] = $validated['status'] ?? 'paused';
        $validated['is_private'] = false;
        $validated['integrations'] = array_values($validated['integrations'] ?? []);
        $validated['inviting_sources'] = collect($validated['inviting_sources'] ?? [])
            ->filter(fn($source) => filled($source['group'] ?? null) || filled($source['channel'] ?? null))
            ->values()
            ->toArray();
        $validated['use_own_groups'] = (bool) ($validated['use_own_groups'] ?? false);
        if ($validated['use_own_groups']) {
            $validated['mailing_groups'] = null;
        }
        $validated['visible_fields'] = $visibleFields ?: $this->getDefaultVisibleFields();

        return $validated;
    }

    protected function getDefaultVisibleFields(): array
    {
        $order = 0;

        return collect($this->getAvailableFields()['standart'])
            ->mapWithKeys(function ($title, $fieldName) use (&$order) {
                return [
                    $fieldName => [
                        'visible' => true,
                        'order' => $order++,
                        'title' => $title,
                    ],
                ];
            })
            ->toArray();
    }

    protected function getAvailableFields(): array
    {
        $standardFields = [
            'id' => 'ID',
            'user' => 'Юзер',
            'vacancy' => 'Вакансия',
            'vacancy_location' => 'Локация вакансии',
            'phone' => 'Номер телефона',
            'tg_channel' => 'ТГ канал',
            'birthday' => 'Дата рождения',
            'gender' => 'Пол',
            'created_at' => 'Дата',
            'price' => 'Цена',
            'status' => 'Статус',
            'is_counted' => 'Засчитан',
        ];

        $customFields = Field::all()->mapWithKeys(function ($field) {
            return [$field->name => $field->title];
        })->toArray();

        return [
            'all' => array_merge($standardFields, $customFields),
            'standart' => $standardFields,
            'custom' => $customFields,
        ];
    }

    protected function authorizeProjectView(Project $project): void
    {
        abort_unless(
            auth()->user()->hasRole('admin')
            || $project->user_id === auth()->id()
            || $project->managers()->where('users.id', auth()->id())->exists()
            || $project->users()->where('users.id', auth()->id())->exists(),
            403
        );
    }

    protected function authorizeProjectMutation(Project $project): void
    {
        abort_unless(auth()->user()->hasRole('admin') || $project->user_id === auth()->id(), 403);
    }

    protected function projectDeletePayload(Project $project): array
    {
        return [
            'action' => 'delete',
            'id' => $project->id,
            'project_id' => $project->id,
            'external_id' => $project->external_id,
            'user_id' => $project->user_id,
            'status' => $project->status,
        ];
    }
}
