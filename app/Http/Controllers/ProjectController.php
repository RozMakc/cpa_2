<?php

namespace App\Http\Controllers;

use App\Models\Client;
use App\Models\Field;
use App\Models\Lead;
use App\Models\Offer;
use App\Models\Project;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProjectController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $projects = Project::with(['managers', 'users', 'client'])->get();
        return Inertia::render('Projects/Index', [
            'projects' => $projects
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $managers = User::role('manager')->get();
        $users = User::role('user')->get();
        $clients = Client::all();
        $offers = Offer::all();
        $availableFields = $this->getAvailableFields();
        return Inertia::render('Projects/Create', [
            'managers' => $managers,
            'users' => $users,
            'clients' => $clients,
            'offers' => $offers,
            'availableFields' => $availableFields['all'],
            'standartFields' => $availableFields['standart'],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'start_date' => 'required|date',
            'client_id' => 'nullable|exists:clients,id',
            'offer_id' => 'nullable|exists:offers,id',
            'managers' => 'array',
            'users' => 'array',
            'users.*' => 'exists:users,id',
            'managers.*' => 'exists:users,id',
            'visible_fields' => 'array',
            'is_active' => 'boolean',
            'is_private' => 'boolean',
        ]);

        if (isset($validated['visible_fields'])) {
            $visibleFields = collect($validated['visible_fields'])
                ->filter(fn($settings) => $settings['visible'] ?? false)
                ->sortBy('order')
                ->mapWithKeys(function ($settings, $fieldName) use ($validated) {
                    $settings['order'] = $settings['order'] ?? 0;
                    return [$fieldName => $settings];
                })
                ->toArray();
    
            $validated['visible_fields'] = $visibleFields;
        }

        $validated['status'] = $validated['is_active'] ? 'active' : 'paused';

        $project = Project::create($validated);

        if (isset($validated['managers'])) {
            $project->managers()->sync($validated['managers']);
        }
        if (isset($validated['users'])) {
            $project->users()->sync($validated['users']);
        }

        return redirect()->route('projects.index')->with('success', 'Проект создан успешно');
    }

    public function getStats(Project $project)
    {
        $startDate = $project->start_date ?: now()->subYear(); // если нет даты, берем год назад

        $stats = $project->leads()
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

        return $stats;
    }

    public function show(Project $project, Request $request)
    {
        $perPage = $request->get('perPage', 10);

        $startDate = $project->start_date ?: now()->subYear(); // если нет даты, берем год назад

        $leadsAll = $project->leads()->with('user')->where('created_at', '>=', $startDate);
        $leads = $leadsAll->orderBy('created_at', 'desc')->paginate($perPage);

        $stats = $this->getStats($project);

        $availableFields = $this->getAvailableFields();

        $fieldMappings = $project->getIntegrationFieldMappings();

        return Inertia::render('Projects/Show', [
            'project' => $project,
            'leads' => $leads,
            'stats' => $stats,
            'availableFields' => $availableFields['all'],
            'fieldMappings' => $fieldMappings,
            'perPage' => $perPage,
        ]);
    }

    public function edit(Project $project)
    {
        $managers = User::role('manager')->get();
        $users = User::role('user')->get();
        $clients = Client::all();
        $offers = Offer::all();
        $availableFields = $this->getAvailableFields();
        
        $project->load(['managers', 'users']);
        
        return Inertia::render('Projects/Edit', [
            'project' => $project,
            'managers' => $managers,
            'users' => $users,
            'clients' => $clients,
            'offers' => $offers,
            'availableFields' => $availableFields['all'],
            'standartFields' => $availableFields['standart'],
        ]);
    }

    public function update(Request $request, Project $project)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'start_date' => 'required|date',
            'client_id' => 'nullable|exists:clients,id',
            'offer_id' => 'nullable|exists:offers,id',
            'managers' => 'array',
            'managers.*' => 'exists:users,id',
            'users' => 'array',
            'users.*' => 'exists:users,id',
            'visible_fields' => 'array',
            'is_active' => 'boolean',
            'is_private' => 'boolean',
        ]);

        $validated['status'] = $validated['is_active'] ? 'active' : 'paused';

        if (isset($validated['visible_fields'])) {
            $visibleFields = collect($validated['visible_fields'])
                ->filter(fn($settings) => $settings['visible'] ?? false)
                ->sortBy('order')
                ->mapWithKeys(function ($settings, $fieldName) use ($validated) {
                    $settings['order'] = $settings['order'] ?? 0;
                    return [$fieldName => $settings];
                })
                ->toArray();
    
            $validated['visible_fields'] = $visibleFields;
        }

        $project->update($validated);

        if (isset($validated['managers'])) {
            $project->managers()->sync($validated['managers']);
        }
        if (isset($validated['users'])) {
            $project->users()->sync($validated['users']);
        }
        return redirect()->route('projects.index')->with('success', 'Проект обновлен успешно');
    }

    public function destroy(Project $project)
    {
        $project->delete();
    
        return back();
    }

    public function updateFieldOrder(Request $request, Project $project)
    {
        $request->validate([
            'field_order' => 'required|array',
        ]);

        $project->updateFieldOrder($request->field_order);

        return response()->json(['success' => true]);
    }

    public function toggleFieldVisibility(Request $request, Project $project)
    {
        $request->validate([
            'field_name' => 'required|string',
            'visible' => 'required|boolean',
        ]);

        $project->toggleFieldVisibility($request->field_name, $request->visible);

        return response()->json(['success' => true]);
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
        
        // Кастомные поля из базы данных
        $customFields = Field::all()->mapWithKeys(function ($field) {
            return [$field->name => $field->title];
        })->toArray();
    
        return [
            'all' => array_merge($standardFields, $customFields),
            'standart' => $standardFields,
            'custom' => $customFields
        ];
    }
}
