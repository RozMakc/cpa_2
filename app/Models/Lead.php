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
        'email',
        'phone',
        'comment',
        'status',
        'type',
        'price',
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
        'user_agent'
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'custom_fields' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

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