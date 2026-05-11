<?php

namespace App\Http\Controllers;

use App\Models\Lead;
use App\Models\Project;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class HomeController extends Controller
{
    public function activation(){
        return Inertia::render('Activation');
    }

    public function offerta(){
        return Inertia::render('Offerta');
    }

    public function dashboard(){
        $users_count = 0;
        $offers_count = Project::count();
        $thirtyDaysAgo = now()->subDays(30);

        if(Auth::user()->hasRole('admin')){
            $users_count = User::withoutRole('admin')->count();
            $leads = Lead::with(['project', 'user'])->orderBy('created_at', 'desc')->paginate(10);
            
            $clicks_count = 0;
            $leads_count = Lead::count();

            $conversionsData = Lead::where('created_at', '>=', $thirtyDaysAgo)
            ->selectRaw('DATE(created_at) as date, COUNT(*) as count')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

            $clicksData = collect();

        }else{
            
            $leads = Lead::with(['project'])->orderBy('created_at', 'desc')
            ->where('user_id', Auth::user()->id)
            ->paginate(10);
            $clicks_count = 0;
            $leads_count = Lead::where('user_id', Auth::user()->id)->count();

            $conversionsData = Lead::where('created_at', '>=', $thirtyDaysAgo)
            ->where('user_id', Auth::user()->id)
            ->selectRaw('DATE(created_at) as date, COUNT(*) as count')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

            $clicksData = collect();

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
