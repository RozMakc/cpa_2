<?php

namespace App\Http\Controllers;

use App\Models\Lead;
use App\Models\Offer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class LeadController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        
        $leads = Lead::with(['offer', 'user', 'link'])
            ->when(!auth()->user()->hasRole('admin'), function($query) {
                $query->where('user_id', auth()->id());
            })
            ->latest()
            ->paginate(25);

        $stats = Lead::when(!auth()->user()->hasRole('admin'), function($query) {
                    $query->where('user_id', auth()->id());
                })
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

        return Inertia::render('Leads/Index', [
            'leads' => $leads,
            'filters' => $request->all(),
            'stats' => $stats
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
        $leadData = [
            'offer_id' => $validated['offer_id'],
            'offer_link_id' => $validated['offer_link_id'] ?? null,
            'firstname' => $validated['name'],
            'email' => $validated['email'] ?? null,
            'phone' => $validated['phone'] ?? null,
            'custom_fields' => $validated['custom_fields'] ?? null,
            'user_id' => auth()->id(),
            'price' => $price?->price ?? 0,
        ];

        $lead = Lead::create($leadData);

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

    public function updateComment(Request $request, Lead $lead)
    {
        $validated = $request->validate([
            'comment' => 'nullable|string|max:1000'
        ]);

        try {
            $lead->update($validated);
            
            return response()->json([
                'success' => true,
                'message' => 'Комментарий сохранен'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Ошибка сохранения'
            ], 500);
        }
    }

    public function updateStatus(Request $request, Lead $lead)
    {
        $validated = $request->validate([
            'status' => 'required|string|max:255'
        ]);

        

        try {
            $lead->update($validated);
            
            return response()->json([
                'success' => true,
                'message' => 'Статус обновлен'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Ошибка сохранения'
            ], 500);
        }
    }

    /**
     * Обновление поля is_counted на лету
     */
    public function updateCounted(Request $request, Lead $lead)
    {
        $validated = $request->validate([
            'is_counted' => 'required|boolean'
        ]);

        try {
            $lead->update($validated);
            
            return response()->json([
                'success' => true,
                'message' => 'Статус сохранен'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Ошибка сохранения'
            ], 500);
        }
    }
    
    public function bulkUpdate(Request $request)
    {
        $request->validate([
            'lead_ids' => 'required|array',
            'lead_ids.*' => 'exists:leads,id',
            'status' => 'sometimes|nullable|string',
            'is_counted' => 'sometimes|nullable|boolean'
        ]);

        try {
            $leadIds = $request->lead_ids;
            $updateData = [];

            if ($request->has('status') && $request->status != null) {
                $updateData['status'] = $request->status;
            }

            if ($request->has('is_counted')) {
                $updateData['is_counted'] = $request->is_counted;
            }

            if (empty($updateData)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Нет данных для обновления'
                ]);
            }

            Lead::whereIn('id', $leadIds)->update($updateData);

            return response()->json([
                'success' => true,
                'message' => 'Лиды успешно обновлены',
                'updated_count' => count($leadIds)
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Ошибка при обновлении лидов: ' . $e->getMessage()
            ], 500);
        }
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
