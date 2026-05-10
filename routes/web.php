<?php

use App\Http\Controllers\ExportController;
use App\Http\Controllers\FieldController;
use App\Http\Controllers\LeadController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\IntegrationController;
use App\Http\Controllers\LinkController;
use App\Http\Controllers\OfferCategoryController;
use App\Http\Controllers\OfferController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\UserController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;


Route::get('/activation', [HomeController::class, 'activation'])->middleware('auth')->name('activation');
Route::get('/offerta', [HomeController::class, 'offerta'])->name('offerta');
Route::get('/goto/{uuid}', [LinkController::class, 'redirect'])->name('link.redirect');

Route::get('/exportCsv', [ExportController::class, 'export'])->name('leads.export');

Route::middleware(['auth', 'activated'])->group(function () {
    Route::get('/', [HomeController::class, 'dashboard']);
    Route::get('/dashboard', [HomeController::class, 'dashboard'])->name('dashboard');

    Route::resource('offer', OfferController::class);



    Route::get('/link', [LinkController::class, 'index'])->name('link.index');
    Route::get('/link/offer/{offer}', [LinkController::class, 'create'])->name('offer.link.create');
    Route::get('/link/create', [LinkController::class, 'create'])->name('link.create');
    Route::get('/link/show/{link}', [LinkController::class, 'show'])->name('link.show');
    Route::post('/link/store', [LinkController::class, 'store'])->name('link.store');
    Route::post('/link/update/{link}', [LinkController::class, 'update'])->name('link.update');
    Route::delete('/link/destroy/{link}', [LinkController::class, 'destroy'])->name('link.destroy');
    

    Route::patch('/offers/{offer}/toggle', [OfferController::class, 'toggle'])->name('offer.toggle');
    
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');

    Route::post('/profile/apikey', [ProfileController::class, 'generateNewToken'])->name('profile.apikey');
    Route::post('/profile/documents', [ProfileController::class, 'documents'])->name('profile.documents');
    Route::post('/profile/paymethod', [ProfileController::class, 'paymethod'])->name('profile.paymethod');

    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::get('/projects', [ProjectController::class, 'index'])->name('projects.index');
    Route::get('/projects/create', [ProjectController::class, 'create'])->name('projects.create');
    Route::post('/projects', [ProjectController::class, 'store'])->name('projects.store');
    Route::get('/projects/{project}', [ProjectController::class, 'show'])->name('projects.show');
    Route::get('/leadsGetStats/{project}', [ProjectController::class, 'getStats']);
    Route::get('/projects/{project}/edit', [ProjectController::class, 'edit'])->name('projects.edit');
    Route::put('/projects/{project}', [ProjectController::class, 'update'])->name('projects.update');
    Route::delete('/projects/{project}', [ProjectController::class, 'destroy'])->name('projects.destroy');

    
    Route::middleware('role:admin')->group(function () {
        Route::resource('users', UserController::class);
        Route::resource('users', UserController::class);

        

        Route::get('/leads/export-large', [ExportController::class, 'exportLargeLeadsToCsv'])->name('leads.export.large');

        Route::post('/integration/newkey/{integration}', [IntegrationController::class, 'newkey'])->name('integration.newkey');
        Route::resource('integration', IntegrationController::class);
        Route::resource('offerCategory', OfferCategoryController::class);
        Route::resource('fields', FieldController::class);
    });
    
    Route::middleware(['role:manager|admin'])->group(function () {
        Route::prefix('leadsUpdateData')->group(function () {
            Route::post('/bulk-update', [LeadController::class, 'bulkUpdate'])->name('leads.bulk-update');
            Route::patch('{lead}/comment', [LeadController::class, 'updateComment']);
            Route::patch('{lead}/status', [LeadController::class, 'updateStatus']);
            Route::patch('{lead}/is_counted', [LeadController::class, 'updateCounted']);
        });
    });



    
    Route::get('/leads', [LeadController::class, 'index'])->name('leads.index');
    Route::get('/leads/create', [LeadController::class, 'create'])->middleware('role:admin')->name('leads.create');
    Route::post('/leads', [LeadController::class, 'store'])->middleware('role:admin')->name('leads.store');
    Route::get('/leads/{lead}', [LeadController::class, 'show'])->name('leads.show');
    Route::patch('/leads/{lead}/status', [LeadController::class, 'updateStatus'])->middleware('role:admin')->name('leads.status');
    Route::delete('/leads/{lead}', [LeadController::class, 'destroy'])->middleware('role:admin')->name('leads.destroy');

});

require __DIR__.'/auth.php';
