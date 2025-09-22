<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Project extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'start_date',
        'visible_fields',
        'client_id',
        'offer_id',
        'status',
        'is_private',
    ];

    protected $casts = [
        'start_date' => 'date',
        'visible_fields' => 'array',
    ];

    /**
     * Менеджеры проекта
     */
    public function managers(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'project_manager');
    }
    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'project_user');
    }
    public function getIntegration(): ?Integration
    {
        if (!$this->offer_id) {
            return null;
        }

        // Загружаем интеграцию если еще не загружена
        if (!$this->relationLoaded('offer.integration')) {
            $this->load('offer.integration');
        }

        return $this->offer?->integration;
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

    /**
     * Лиды проекта
     */
    public function leads()
    {
        return $this->hasMany(Lead::class);
    }

    /**
     * Офферы проекта
     */
    public function offer()
    {
        return $this->belongsTo(Offer::class);
    }

    public function client()
    {
        return $this->belongsTo(Client::class);
    }

    /**
     * Получить лиды начиная с даты начала проекта
     */
    public function getFilteredLeads()
    {
        return $this->leads()
            ->where('created_at', '>=', $this->start_date)
            ->orderBy('created_at', 'desc')
            ->get();
    }

    /**
     * Проверить, имеет ли пользователь доступ к проекту
     */
    public function hasAccess(User $user): bool
    {
        return $this->managers->contains($user->id) || $user->isAdmin();
    }

    /**
     * Получить отсортированные видимые поля
     */
    public function getOrderedVisibleFields(): array
    {
        $fields = $this->visible_fields ?? [];
        
        // Сортируем по порядку (если есть порядок)
        uasort($fields, function ($a, $b) {
            return ($a['order'] ?? 999) <=> ($b['order'] ?? 999);
        });

        return $fields;
    }

    /**
     * Обновить порядок полей
     */
    public function updateFieldOrder(array $fieldOrder): void
    {
        $visibleFields = $this->visible_fields ?? [];
        
        foreach ($fieldOrder as $index => $fieldName) {
            if (isset($visibleFields[$fieldName])) {
                $visibleFields[$fieldName]['order'] = $index;
            } else {
                $visibleFields[$fieldName] = [
                    'visible' => true,
                    'order' => $index
                ];
            }
        }

        $this->update(['visible_fields' => $visibleFields]);
    }

    /**
     * Обновить видимость поля
     */
    public function toggleFieldVisibility(string $fieldName, bool $visible): void
    {
        $visibleFields = $this->visible_fields ?? [];
        
        if (isset($visibleFields[$fieldName])) {
            $visibleFields[$fieldName]['visible'] = $visible;
        } else {
            $visibleFields[$fieldName] = [
                'visible' => $visible,
                'order' => count($visibleFields)
            ];
        }

        $this->update(['visible_fields' => $visibleFields]);
    }
}