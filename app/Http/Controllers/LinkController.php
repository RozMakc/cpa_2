<?php

namespace App\Http\Controllers;

use App\Models\Link;
use App\Models\Offer;
use App\Models\Traffic;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class LinkController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $user = Auth::user();

        $links = $user->links()->with('offer')
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return Inertia::render('User/Links/Index', [
            'links' => $links
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(Offer $offer)
    {
        $offers = Offer::with('links')->where('is_active', 1)->get();
        return Inertia::render('User/Links/Create', [
            'offer' => $offer,
            'offers' => $offers,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'nullable|string|max:100',
            'offer_id' => 'required|exists:offers,id',
            'landing_id' => 'required|exists:offer_links,id',
            'utm_source' => 'nullable|string|max:100',
            'utm_medium' => 'nullable|string|max:100',
            'utm_campaign' => 'nullable|string|max:100',
            'utm_term' => 'nullable|string|max:100',
            'utm_content' => 'nullable|string|max:100',
            'sub1' => 'nullable|string|max:100',
            'sub2' => 'nullable|string|max:100',
            'sub3' => 'nullable|string|max:100',
            'sub4' => 'nullable|string|max:100',
            'sub5' => 'nullable|string|max:100',
            'metadata' => 'nullable|array'
        ]);

        $offer = Offer::where('id', $request->offer_id)->firstOrFail();
        
        $link = Link::create([
            'name' => $request->name,
            'offer_id' => $offer->id,
            'landing_id' => $request->landing_id,
            'user_id' => auth()->id(),
            'utm_source' => $request->utm_source,
            'utm_medium' => $request->utm_medium,
            'utm_campaign' => $request->utm_campaign,
            'utm_term' => $request->utm_term,
            'utm_content' => $request->utm_content,
            'sub1' => $request->sub1,
            'sub2' => $request->sub2,
            'sub3' => $request->sub3,
            'sub4' => $request->sub4,
            'sub5' => $request->sub5,
            'metadata' => $request->metadata,
        ]);

        return redirect()->route('link.index')
            ->with('success', 'Link created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Link $link)
    {
        $link->load(['offer', 'offer.links']);
        $offers = Offer::with('links')->where('is_active', 1)->get();
        return Inertia::render('User/Links/Show', [
            'link' => $link,
            'offers' => $offers,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Link $link)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Link $link)
    {
        if($link->user_id != auth()->id()){
            return back();
        }
        $validated = $request->validate([
            'name' => 'nullable|string|max:100',
            'offer_id' => 'required|exists:offers,id',
            'landing_id' => 'required|exists:offer_links,id',
            'utm_source' => 'nullable|string|max:100',
            'utm_medium' => 'nullable|string|max:100',
            'utm_campaign' => 'nullable|string|max:100',
            'utm_term' => 'nullable|string|max:100',
            'utm_content' => 'nullable|string|max:100',
            'sub1' => 'nullable|string|max:100',
            'sub2' => 'nullable|string|max:100',
            'sub3' => 'nullable|string|max:100',
            'sub4' => 'nullable|string|max:100',
            'sub5' => 'nullable|string|max:100',
            'metadata' => 'nullable|array'
        ]);

        $link->update($request->only([
            'name','offer_id','landing_id','utm_source', 'utm_medium', 'utm_campaign',
            'utm_term', 'utm_content', 'sub1', 'sub2', 'sub3',
            'sub4', 'sub5', 'metadata'
        ]));

        return back();
    }

    public function redirect($uuid)
    {
        $link = Link::where('uuid', $uuid)->firstOrFail();
        $link->incrementClickCount();

        $traffic = new Traffic();
        $traffic->link_id = $link->id;
        $traffic->user_id = $link->user_id;
        $traffic->offer_id = $link->offer_id;
        if($link->landing_id){
            $traffic->offer_link_id = $link->landing_id;
        }
        $traffic->save();
        
        return redirect()->away($link->generated_url);
    }

    public function stats($uuid)
    {

        $link = Link::where('uuid', $uuid)
            ->with('offer')
            ->firstOrFail();

    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Link $link)
    {
        if($link->user_id == auth()->id()){
            $link->delete();
        }
        return back();
    }
}
