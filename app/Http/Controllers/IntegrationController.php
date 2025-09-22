<?php

namespace App\Http\Controllers;

use App\Models\Field;
use App\Models\Integration;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;

class IntegrationController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $integrations = Integration::all();
        return Inertia::render('Admin/Integrations/Index', [
            'integrations' => $integrations,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Admin/Integrations/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string',
        ]);

        $integration = new Integration();
        $integration->name = $validated['name'];
        $integration->apikey = Str::random(25);
        $integration->save();

        
        return redirect()->route('integration.edit', $integration->id)
            ->with('success', 'Offer created successfully.');

    }

    /**
     * Display the specified resource.
     */
    public function show(Integration $integration)
    {

    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Integration $integration)
    {
        $fields = $this->getAvailableFields();

        return Inertia::render('Admin/Integrations/Edit', [
            'integration' => $integration,
            'fields' => $fields,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Integration $integration)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'api_fields' => 'array',
            'field_mappings' => 'array',
        ]);

        // Валидация полей API
        if (isset($validated['api_fields'])) {
            foreach ($validated['api_fields'] as $index => $field) {
                if (empty($field['name'])) {
                    return redirect()->back()->withErrors([
                        'api_fields' => "Поле API #" . ($index + 1) . " не имеет названия"
                    ]);
                }
            }
        }

        $integration->update($validated);

        return redirect()->back();
    }

    public function newkey(Request $request, Integration $integration)
    {
        $integration->apikey = Str::random(25);
        $integration->save();

        return redirect()->back();
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Integration $integration)
    {
        $integration->delete();
        return redirect()->back();
    }

    protected function getAvailableFields(): array
    {
        $standardFields = [
            'firstname' => 'Имя',
            'lastname' => 'Фамилия',
            'phone' => ' Номер телефона',
            'birthday' => 'Дата рождения',
            'gender' => 'Пол',
        ];
        // Кастомные поля из базы данных
        $customFields = Field::all()->mapWithKeys(function ($field) {
            return [$field->name => $field->title];
        })->toArray();

        // Объединяем стандартные и кастомные поля
        return array_merge($standardFields, $customFields);
    }
}
