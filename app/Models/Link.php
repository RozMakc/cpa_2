<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class Link extends Model
{
    protected $fillable = [
        'name',
        'uuid',
        'landing_id',
        'offer_id',
        'user_id',
        'base_url',
        'utm_source',
        'utm_medium',
        'utm_campaign',
        'utm_term',
        'utm_content',
        'sub1',
        'sub2',
        'sub3',
        'sub4',
        'sub5',
        'click_count',
        'conversion_count',
        'metadata'
    ];

    protected $casts = [
        'metadata' => 'array',
        'click_count' => 'integer',
        'conversion_count' => 'integer'
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (empty($model->uuid)) {
                do {
                    $uuid = Str::random(10); // 10 символов
                } while (self::where('uuid', $uuid)->exists());
                
                $model->uuid = $uuid;
            }
            if (empty($model->base_url)) {
                $model->base_url = env('APP_URL') . '/goto/' . $model->uuid;
            }
        });
    }

    public function offer(): BelongsTo
    {
        return $this->belongsTo(Offer::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function incrementClickCount(): void
    {
        $this->increment('click_count');
    }

    public function incrementConversionCount(): void
    {
        $this->increment('conversion_count');
    }

    public function getGeneratedUrlAttribute(): string
    {
        $offer = $this->offer;

        $landing_id = $this->landing_id;

        if(!$landing_id){
            $link = $offer->links()->first();
            $landing_id = $link->id;
        }
        $landing = OfferLink::findOrFail($landing_id);
        $url = $landing->url;
        $params = [];

        // Добавляем UTM-метки
        $utmParams = [
            'utm_source' => $this->utm_source,
            'utm_medium' => $this->utm_medium,
            'utm_campaign' => $this->utm_campaign,
            'utm_term' => $this->utm_term,
            'utm_content' => $this->utm_content,
        ];

        foreach ($utmParams as $key => $value) {
            if (!empty($value)) {
                $params[$key] = $value;
            }
        }

        // Добавляем sub-параметры
        $subParams = [
            'sub1' => $this->sub1,
            'sub2' => $this->sub2,
            'sub3' => $this->sub3,
            'sub4' => $this->sub4,
            'sub5' => $this->sub5,
        ];

        foreach ($subParams as $key => $value) {
            if (!empty($value)) {
                $params[$key] = $value;
            }
        }

        // Добавляем UUID для отслеживания
        $params['uuid'] = $this->uuid;

        if (!empty($params)) {
            $url .= (strpos($url, '?') === false) ? '?' : '&';
            $url .= http_build_query($params);
        }

        return $url;
    }
}
