<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Lead extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'uuid',
        'offer_id',
        'user_id',
        'link_id',
        'offer_link_id',
        'name',
        'firstname',
        'lastname',
        'gender',
        'birthday',
        'address',
        'citizenship',
        'email',
        'phone',
        'comment',
        'tg_channel',
        'is_our_channel',
        'status',
        'is_counted',
        'type',
        'price',
        'comment',
        'currency',
        'products',
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
        'custom_fields',
        'ip_address',
        'user_agent',
        'project_id',
        'integration_id',
        'additional_data',
        'created_at',
    ];

    public function getSafeFillable(): array
    {
        return $this->fillable;
    }

    protected $casts = [
        'price' => 'decimal:2',
        'custom_fields' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'additional_data' => 'array',
        'is_our_channel' => 'boolean',
    ];

    public function getAllDataAttribute(): array
    {
        $mainData = [
            'id' => $this->id,
            'name' => $this->name,
            'firstname' => $this->firstname,
            'lastname' => $this->lastname,
            'email' => $this->email,
            'phone' => $this->phone,
            'user_id' => $this->user_id,
            'offer_id' => $this->offer_id,
            'project_id' => $this->project_id,
            'integration_id' => $this->integration_id,
            'price' => $this->price,
            'status' => $this->status,
            'tg_channel' => $this->tg_channel,
            'is_our_channel' => $this->is_our_channel,
            'ip_address' => $this->ip_address,
            'user_agent' => $this->user_agent,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];

        $additionalData = $this->additional_data ?? [];

        return array_merge($mainData, $additionalData);
    }

    public function getAdditionalDataValue(string $key, $default = null)
    {
        return $this->additional_data[$key] ?? $default;
    }

    public function __get($key)
    {

        if (in_array($key, $this->fillable) || $key === 'id' || $key === 'count' || $key === 'date') {
            return parent::__get($key);
        }

        // Иначе ищем в additional_data
        return $this->getAdditionalDataValue($key);
    }

    public function hasField(string $key): bool
    {
        return in_array($key, $this->fillable) || 
               isset($this->additional_data[$key]) ||
               $key === 'id';
    }


    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (empty($model->uuid)) {
                do {
                    $uuid = \Illuminate\Support\Str::random(10);
                } while (self::where('uuid', $uuid)->exists());
                
                $model->uuid = $uuid;
            }

            if (empty($model->ip_address)) {
                $model->ip_address = request()->ip();
            }

            if (empty($model->user_agent)) {
                $model->user_agent = request()->userAgent();
            }
        });
    }
    
    public function integration()
    {
        return $this->belongsTo(Integration::class);
    }
    
    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    public function offer(): BelongsTo
    {
        return $this->belongsTo(Offer::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function landing(): BelongsTo
    {
        return $this->belongsTo(OfferLink::class, 'offer_link_id');
    }

    public function link(): BelongsTo
    {
        return $this->belongsTo(Link::class, 'link_id');
    }

    // Scopes
    public function scopeNew($query)
    {
        return $query->where('status', 'new');
    }

    public function scopeHold($query)
    {
        return $query->where('status', 'hold');
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    public function scopeCanceled($query)
    {
        return $query->where('status', 'canceled');
    }

    public function scopeToday($query)
    {
        return $query->whereDate('created_at', today());
    }

    public function scopeForOffer($query, $offerId)
    {
        return $query->where('offer_id', $offerId);
    }

    // Helpers
    public function isNew(): bool
    {
        return $this->status === 'new';
    }

    public function markAsProcessing()
    {
        $this->update(['status' => 'processing']);
    }

    public function markAsCompleted()
    {
        $this->update(['status' => 'completed']);
    }

    public function markAsRejected()
    {
        $this->update(['status' => 'rejected']);
    }

    public function getCustomField($key, $default = null)
    {
        return $this->custom_fields[$key] ?? $default;
    }

    public function scopeForExport($query, $filters = [])
    {
        return $query->with(['offer', 'user', 'link'])
            ->when($filters['start_date'] ?? null, function ($query, $startDate) {
                return $query->whereDate('created_at', '>=', $startDate);
            })
            ->when($filters['end_date'] ?? null, function ($query, $endDate) {
                return $query->whereDate('created_at', '<=', $endDate);
            })
            ->when($filters['status'] ?? null, function ($query, $status) {
                return $query->where('status', $status);
            })
            ->when($filters['offer_id'] ?? null, function ($query, $offerId) {
                return $query->where('offer_id', $offerId);
            })
            ->orderBy('created_at', 'desc');
    }
}
