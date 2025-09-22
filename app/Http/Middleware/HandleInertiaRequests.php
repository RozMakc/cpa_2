<?php

namespace App\Http\Middleware;

use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $projects = [];
        if(Auth::check()){
            $projects = Auth::user()->getAllProjects();
        }
        return [
            ...parent::share($request),
            'app' => [
                'url' => config('app.url'),
                'env' => config('app.env'),
                'name' => config('app.name'),
            ],
            'auth' => [
                'user' => $request->user(),
                'roles' => $request->user() ? $request->user()->getRoleNames() : null,
            ],
            'projects' => $projects
        ];
    }
}
