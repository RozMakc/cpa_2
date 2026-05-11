<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Lead extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'uuid',
        'user_id',
        'project_id',
        'integration_id',
        'tg_id',
        'tg_username',
        'tg_channel',
        'is_our_channel',
        'message',
        'name',
        'firstname',
        'lastname',
        'email',
        'phone',
        'comment',
        'status',
        'is_counted',
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
        'additional_data',
        'ip_address',
        'user_agent',
        'created_at',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'custom_fields' => 'array',
        'additional_data' => 'array',
        'is_our_channel' => 'boolean',
        'is_counted' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function getSafeFillable(): array
    {
        return $this->fillable;
    }

    public function getAllDataAttribute(): array
    {
        return array_merge([
            'id' => $this->id,
            'name' => $this->name,
            'firstname' => $this->firstname,
            'lastname' => $this->lastname,
            'email' => $this->email,
            'phone' => $this->phone,
            'user_id' => $this->user_id,
            'project_id' => $this->project_id,
            'integration_id' => $this->integration_id,
            'tg_id' => $this->tg_id,
            'tg_username' => $this->tg_username,
            'tg_channel' => $this->tg_channel,
            'is_our_channel' => $this->is_our_channel,
            'message' => $this->message,
            'price' => $this->price,
            'status' => $this->status,
            'ip_address' => $this->ip_address,
            'user_agent' => $this->user_agent,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ], $this->additional_data ?? []);
    }

    public function getAdditionalDataValue(string $key, $default = null)
    {
        return $this->additional_data[$key] ?? $default;
    }

    public function __get($key)
    {
        if (in_array($key, $this->fillable, true) || in_array($key, ['id', 'count', 'date'], true)) {
            return parent::__get($key);
        }

        return $this->getAdditionalDataValue($key);
    }

    public function hasField(string $key): bool
    {
        return in_array($key, $this->fillable, true)
            || isset($this->additional_data[$key])
            || $key === 'id';
    }

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (empty($model->uuid)) {
                do {
                    $uuid = Str::random(10);
                } while (self::where('uuid', $uuid)->exists());

                $model->uuid = $uuid;
            }

            $model->ip_address ??= request()->ip();
            $model->user_agent ??= request()->userAgent();
            $model->status ??= 'new';
            $model->is_counted ??= true;
        });
    }

    public function integration(): BelongsTo
    {
        return $this->belongsTo(Integration::class);
    }

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function scopeForExport($query, $filters = [])
    {
        return $query->with(['project', 'user'])
            ->when($filters['start_date'] ?? null, fn($query, $startDate) => $query->whereDate('created_at', '>=', $startDate))
            ->when($filters['end_date'] ?? null, fn($query, $endDate) => $query->whereDate('created_at', '<=', $endDate))
            ->when($filters['status'] ?? null, fn($query, $status) => $query->where('status', $status))
            ->when($filters['project_id'] ?? null, fn($query, $projectId) => $query->where('project_id', $projectId))
            ->orderBy('created_at', 'desc');
    }
}
