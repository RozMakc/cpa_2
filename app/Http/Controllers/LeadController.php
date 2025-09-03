<?php

namespace App\Http\Controllers;

use App\Models\Lead;
use App\Models\Offer;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LeadController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $leads = Lead::with(['offer', 'user', 'link'])
            ->latest()
            ->paginate(50);

        return Inertia::render('Leads/Index', [
            'leads' => $leads,
            'filters' => $request->all(),
            'stats' => [
                'total' => Lead::count(),
                'new' => Lead::new()->count(),
                'hold' => Lead::hold()->count(),
                'completed' => Lead::completed()->count(),
            ]
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $offers = Offer::with('links')->where('is_active', 1)->get();
        return Inertia::render('Leads/Create', [
            'offers' => $offers,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'offer_id' => 'required|exists:offers,id',
            'offer_link_id' => 'nullable|exists:offer_links,id',
            'name' => 'required|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:20',
            'custom_fields' => 'nullable|array',
        ]);

        $offer = Offer::findOrFail($request->offer_id);
        $price = $offer->prices()->first();

        $lead = Lead::create(array_merge($validated, [
            'user_id' => auth()->id(),
            'price' => $price->price
        ]));

        return redirect()->route('leads.index')
            ->with('success', 'leads created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Lead $lead)
    {
        $lead->load(['offer', 'user', 'link']);

        return Inertia::render('Leads/Show', [
            'lead' => $lead
        ]);
    }

    public function updateStatus(Lead $lead, Request $request)
    {
        $request->validate([
            'status' => 'required|in:new,hold,completed,canceled'
        ]);

        $lead->update(['status' => $request->status]);

        return redirect()->back()->with('success', 'Статус обновлен');
    }
    
    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Lead $lead)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Lead $lead)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Lead $lead)
    {
        //
    }
}
