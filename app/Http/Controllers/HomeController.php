<?php

namespace App\Http\Controllers;

use App\Models\Lead;
use App\Models\Link;
use App\Models\Offer;
use App\Models\Traffic;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class HomeController extends Controller
{
    public function dashboard(){
        $users_count = 0;
        $offers_count = Offer::count();
        $thirtyDaysAgo = now()->subDays(30);

        if(Auth::user()->hasRole('admin')){
            $users_count = User::withoutRole('admin')->count();
            $leads = Lead::with(['offer', 'user', 'link'])->orderBy('created_at', 'desc')->paginate(10);
            
            $clicks_count = Traffic::count();
            $leads_count = Lead::count();

            $conversionsData = Lead::where('created_at', '>=', $thirtyDaysAgo)
            ->selectRaw('DATE(created_at) as date, COUNT(*) as count')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

            $clicksData = Traffic::where('created_at', '>=', $thirtyDaysAgo)
            ->selectRaw('DATE(created_at) as date, COUNT(*) as count')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        }else{
            $leads = Lead::with(['offer', 'link'])->orderBy('created_at', 'desc')
            ->where('user_id', Auth::user()->id)
            ->paginate(10);
            $clicks_count = Traffic::where('user_id', Auth::user()->id)->count();
            $leads_count = Lead::where('user_id', Auth::user()->id)->count();

            $conversionsData = Lead::where('created_at', '>=', $thirtyDaysAgo)
            ->where('user_id', Auth::user()->id)
            ->selectRaw('DATE(created_at) as date, COUNT(*) as count')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

            $clicksData = Traffic::where('created_at', '>=', $thirtyDaysAgo)
            ->where('user_id', Auth::user()->id)
            ->selectRaw('DATE(created_at) as date, COUNT(*) as count')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        }
    
        $chartData = $this->prepareChartData($clicksData, $conversionsData);

        return Inertia::render('Dashboard', [
            'leads' => $leads,
            'users_count' => $users_count,
            'offers_count' => $offers_count,
            'clicks_count' => $clicks_count,
            'leads_count' => $leads_count,
            'chartData' => $chartData,
        ]);
    }

    private function prepareChartData($clicksData, $conversionsData)
    {
        $dates = [];
        $clicks = [];
        $conversions = [];

        for ($i = 29; $i >= 0; $i--) {
            $date = now()->subDays($i)->format('Y-m-d');
            $formattedDate = now()->subDays($i)->format('d M');
            
            $dates[] = $formattedDate;
            $clicks[] = $clicksData->firstWhere('date', $date)->count ?? 0;
            $conversions[] = $conversionsData->firstWhere('date', $date)->count ?? 0;
        }

        return [
            'dates' => $dates,
            'clicks' => $clicks,
            'conversions' => $conversions
        ];
    }
}
