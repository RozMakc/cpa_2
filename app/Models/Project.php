<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Project extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'start_date',
        'visible_fields',
        'user_id',
        'client_id',
        'integration_id',
        'integrations',
        'parsing_sources',
        'inviting_sources',
        'use_own_groups',
        'mailing_groups',
        'mailing_phones',
        'mailing_usernames',
        'mailing_text',
        'image_path',
        'external_id',
        'sync_status',
        'sync_error',
        'synced_at',
        'status',
        'is_private',
    ];

    protected $casts = [
        'start_date' => 'date',
        'visible_fields' => 'array',
        'integrations' => 'array',
        'inviting_sources' => 'array',
        'use_own_groups' => 'boolean',
        'is_private' => 'boolean',
        'synced_at' => 'datetime',
    ];

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function integration(): BelongsTo
    {
        return $this->belongsTo(Integration::class);
    }

    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    public function managers(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'project_manager');
    }

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'project_user');
    }

    public function leads(): HasMany
    {
        return $this->hasMany(Lead::class);
    }

    public function getIntegration(): ?Integration
    {
        if (!$this->integration_id) {
            return null;
        }

        return $this->relationLoaded('integration')
            ? $this->integration
            : $this->integration()->first();
    }

    public function hasIntegration(): bool
    {
        return $this->getIntegration() !== null;
    }

    public function getIntegrationFieldMappings(): array
    {
        $integration = $this->getIntegration();

        return $integration ? ($integration->field_mappings ?? []) : [];
    }

    public function getFilteredLeads()
    {
        return $this->leads()
            ->where('created_at', '>=', $this->start_date)
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function hasAccess(User $user): bool
    {
        return $this->user_id === $user->id
            || $this->managers->contains($user->id)
            || $this->users->contains($user->id)
            || $user->isAdmin();
    }

    public function getOrderedVisibleFields(): array
    {
        $fields = $this->visible_fields ?? [];

        uasort($fields, fn($a, $b) => ($a['order'] ?? 999) <=> ($b['order'] ?? 999));

        return $fields;
    }

    public function updateFieldOrder(array $fieldOrder): void
    {
        $visibleFields = $this->visible_fields ?? [];

        foreach ($fieldOrder as $index => $fieldName) {
            $visibleFields[$fieldName] = array_merge($visibleFields[$fieldName] ?? [], [
                'visible' => $visibleFields[$fieldName]['visible'] ?? true,
                'order' => $index,
            ]);
        }

        $this->update(['visible_fields' => $visibleFields]);
    }

    public function toggleFieldVisibility(string $fieldName, bool $visible): void
    {
        $visibleFields = $this->visible_fields ?? [];

        $visibleFields[$fieldName] = array_merge($visibleFields[$fieldName] ?? [], [
            'visible' => $visible,
            'order' => $visibleFields[$fieldName]['order'] ?? count($visibleFields),
        ]);

        $this->update(['visible_fields' => $visibleFields]);
    }
}
