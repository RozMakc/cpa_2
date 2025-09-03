<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Offer extends Model
{
    protected $fillable = [
        'name', 'description', 'category_id', 'is_active', 'image_path'
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function prices(): HasMany
    {
        return $this->hasMany(OfferPrice::class);
    }

    public function links(): HasMany
    {
        return $this->hasMany(OfferLink::class);
    }

    public function category(): HasOne
    {
        return $this->hasOne(OfferCategory::class, 'id', 'category_id');
    }

    public function getMaxPriceAttribute()
    {
        return $this->prices()->max('price');
    }

    public function getPrice($countryCode = null, $deviceType = 'all')
    {
        $price = $this->prices()
            ->where('country_code', $countryCode)
            ->where('device_type', $deviceType)
            ->first();

        if (!$price && $countryCode) {
            $price = $this->prices()
                ->where('country_code', $countryCode)
                ->where('device_type', 'all')
                ->first();
        }

        if (!$price) {
            $price = $this->prices()
                ->whereNull('country_code')
                ->where('device_type', $deviceType)
                ->first();
        }

        if (!$price) {
            $price = $this->prices()
                ->whereNull('country_code')
                ->where('device_type', 'all')
                ->first();
        }

        if (!$price) {
            return [
                'price' => 0
            ];
        }

        return [
            'price' => $price->price,
        ];
    }
}
