<?php

namespace App\Http\Controllers;

use App\Models\Country;
use App\Models\Integration;
use App\Models\Offer;
use App\Models\OfferCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class OfferController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $offers = Offer::with('prices')->get();
        return Inertia::render('Offers/Index', [
            'offers' => $offers
        ]);
    }

    
    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $categories = OfferCategory::where('is_active', 1)->get();
        $integrations = Integration::where('is_active', 1)->get();
        $countries = Country::all();
        return Inertia::render('Admin/Offers/Create', [
            'categories' => $categories,
            'integrations' => $integrations,
            'countries' => $countries,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'description' => 'required|string',
            'category_id' => 'required|exists:offer_categories,id',
            'integration_id' => 'required|exists:integrations,id',
            'links' => 'required|array',
            'links.*' => 'required|url',
            'prices' => 'required|array',
            'prices.*.country_id' => 'sometimes|nullable|exists:countries,id',
            'prices.*.price' => 'required|numeric|min:0',
            'image' => 'sometimes|nullable|mimes:jpg,jpeg,png,svg'
        ]);

        DB::transaction(function () use ($validated, $request) {
            
            $offer = Offer::create([
                'name' => $validated['name'],
                'description' => $validated['description'],
                'category_id' => $validated['category_id'],
            ]);
    
            $pricesData = collect($validated['prices'])->map(function ($price) {
                return [
                    'country_id' => $price['country_id'] ?: null,
                    'price' => $price['price'],
                    'created_at' => now(),
                    'updated_at' => now()
                ];
            })->toArray();
    
            $offer->prices()->createMany($pricesData);

            $linksData = collect($validated['links'])->map(function ($link) {
                return [
                    'url' => $link,
                    'created_at' => now(),
                    'updated_at' => now()
                ];
            })->toArray();
            $offer->links()->createMany($linksData);
            
            if (array_key_exists('integration_id', $validated)) {
                $offer->syncIntegration($validated['integration_id']);
            }
            if ($request->hasFile('image')) {
                $imagePath = $request->file('image')->store('offers', 'public');
                $offer->update(['image_path' => $imagePath]);
            }
        });


        return redirect()->route('offer.index')
            ->with('success', 'Offer created successfully.');
    }

    public function toggle(Offer $offer)
    {
        $offer->update([
            'is_active' => !$offer->is_active
        ]);

        return back();
    }

    /**
     * Display the specified resource.
     */
    public function show(Offer $offer)
    {
        $offer->load(['prices', 'prices.country', 'links', 'category', 'integration']);
        
        if(Auth::user()->hasRole('admin')){
            $categories = OfferCategory::where('is_active', 1)->get();
            $countries = Country::all();
            $integrations = Integration::where('is_active', 1)->get();
            return Inertia::render('Admin/Offers/Edit', [
                'offer' => $offer,
                'categories' => $categories,
                'countries' => $countries,
                'integrations' => $integrations,
            ]);
        }

        return Inertia::render('Offers/Show', [
            'offer' => $offer,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Offer $offer)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Offer $offer)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'category_id' => 'required|exists:offer_categories,id',
            'integration_id' => 'required|exists:integrations,id',
            'prices' => 'required|array',
            'prices.*.country_id' => 'sometimes|nullable|exists:countries,id',
            'prices.*.price' => 'required|numeric|min:0',
            'links' => 'required|array',
            'links.*' => 'required|url',
            'image' => 'nullable|image|max:2048'
        ]);

        DB::transaction(function () use ($validated, $request, $offer) {
            // Обновляем оффер
            $offer->update([
                'name' => $validated['name'],
                'description' => $validated['description'],
                'category_id' => $validated['category_id'],
            ]);

            // Удаляем старые цены и создаем новые
            $offer->prices()->delete();
            $pricesData = collect($validated['prices'])->map(function ($price) {
                return [
                    'country_id' => $price['country_id'] ?: null,
                    'price' => $price['price'],
                    'created_at' => now(),
                    'updated_at' => now()
                ];
            })->toArray();
            $offer->prices()->createMany($pricesData);

            if (array_key_exists('integration_id', $validated)) {
                $offer->syncIntegration($validated['integration_id']);
            }

            $existingLinks = $offer->links;
            $newLinks = $validated['links'];

            foreach ($existingLinks as $index => $link) {
                if (isset($newLinks[$index])) {
                    $link->update(['url' => $newLinks[$index]]);
                    unset($newLinks[$index]);
                } else {
                    $link->delete();
                }
            }
            
            foreach ($newLinks as $linkUrl) {
                $offer->links()->create(['url' => $linkUrl]);
            }

            // Обновляем изображение если загружено новое
            if ($request->hasFile('image')) {
                // Удаляем старое изображение если есть
                if ($offer->image_path) {
                    Storage::disk('public')->delete($offer->image_path);
                }
                
                $imagePath = $request->file('image')->store('offers', 'public');
                $offer->update(['image_path' => $imagePath]);
            }
        });

        return redirect()->route('offer.index')
            ->with('success', 'Оффер успешно обновлен.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Offer $offer)
    {
        $offer->delete();
    
        return back();
    }
}
