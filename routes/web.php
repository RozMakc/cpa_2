<?php

use App\Http\Controllers\ExportController;
use App\Http\Controllers\LeadController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\LinkController;
use App\Http\Controllers\OfferController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\UserController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;


Route::middleware('auth')->group(function () {
    Route::get('/', [HomeController::class, 'dashboard']);
    Route::get('/dashboard', [HomeController::class, 'dashboard'])->name('dashboard');

    Route::resource('offer', OfferController::class);
    Route::resource('users', UserController::class);


    Route::get('/link', [LinkController::class, 'index'])->name('link.index');
    Route::get('/link/offer/{offer}', [LinkController::class, 'create'])->name('offer.link.create');
    Route::get('/link/create', [LinkController::class, 'create'])->name('link.create');
    Route::get('/link/show/{link}', [LinkController::class, 'show'])->name('link.show');
    Route::post('/link/store', [LinkController::class, 'store'])->name('link.store');
    Route::post('/link/update/{link}', [LinkController::class, 'update'])->name('link.update');
    Route::delete('/link/destroy/{link}', [LinkController::class, 'destroy'])->name('link.destroy');
    Route::get('/goto/{uuid}', [LinkController::class, 'redirect'])->name('link.redirect');

    Route::patch('/offers/{offer}/toggle', [OfferController::class, 'toggle'])->name('offer.toggle');
    
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');

    Route::post('/profile/apikey', [ProfileController::class, 'generateNewToken'])->name('profile.apikey');

    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::middleware('role:admin')->group(function () {
        Route::get('/users', [UserController::class, 'index'])->name('users.index');
        Route::get('/leads/export-large', [ExportController::class, 'exportLargeLeadsToCsv'])->name('leads.export.large');
        Route::get('/leads/export', [ExportController::class, 'exportLeadsToCsv'])->name('leads.export');
    
    });
    
    
    Route::get('/leads', [LeadController::class, 'index'])->name('leads.index');
    Route::get('/leads/create', [LeadController::class, 'create'])->middleware('role:admin')->name('leads.create');
    Route::post('/leads', [LeadController::class, 'store'])->middleware('role:admin')->name('leads.store');
    Route::get('/leads/{lead}', [LeadController::class, 'show'])->name('leads.show');
    Route::patch('/leads/{lead}/status', [LeadController::class, 'updateStatus'])->middleware('role:admin')->name('leads.status');
    Route::delete('/leads/{lead}', [LeadController::class, 'destroy'])->middleware('role:admin')->name('leads.destroy');

    



});

require __DIR__.'/auth.php';
