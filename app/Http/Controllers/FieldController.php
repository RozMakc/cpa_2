<?php

namespace App\Http\Controllers;

use App\Models\Field;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FieldController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $fields = Field::all();
        return Inertia::render('Admin/Fields/Index', [
            'fields' => $fields
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Admin/Fields/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'title' => 'required|string',
            'type' => 'required|string',
        ]);

        $field = Field::create([
            'name' => $validated['name'],
            'title' => $validated['title'],
            'type' => $validated['type'],
        ]);

        return redirect()->route('fields.index')->with('success', 'Field created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Field $field)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Field $field)
    {
        return Inertia::render('Admin/Fields/Edit', [
            'field' => $field
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Field $field)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'title' => 'required|string',
            'type' => 'required|string',
        ]);

        $field->update([
            'name' => $validated['name'],
            'title' => $validated['title'],
            'type' => $validated['type'],
        ]);

        return redirect()->back();
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Field $field)
    {
        $field->delete();
    
        return back();
    }
}
