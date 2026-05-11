<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Integration extends Model
{
    protected $fillable = [
        'name',
        'field_mappings',
        'api_fields',
        'settings'
    ];

    protected $casts = [
        'field_mappings' => 'array',
        'api_fields' => 'array',
        'settings' => 'array',
    ];

    public static function getForProject(Project $project): ?Integration
    {
        return $project->getIntegration();
    }

    /**
     * Получить доступные поля для интеграции
     */
    public function getAvailableFields(): array
    {
        return [
            'name' => ['title' => 'Имя', 'type' => 'string'],
            'email' => ['title' => 'Email', 'type' => 'string'],
            'phone' => ['title' => 'Телефон', 'type' => 'string'],
            'status' => ['title' => 'Статус', 'type' => 'string'],
            'created_at' => ['title' => 'Дата создания', 'type' => 'datetime'],
            'source' => ['title' => 'Источник', 'type' => 'string'],
        ];
    }

    /**
     * Преобразовать данные из API в формат системы
     */
    public function mapApiData(array $apiData): array
    {
        $mappedData = [];
        $mappings = $this->field_mappings ?? [];
        
        $leadModel = new Lead();
        $fillableFields = $leadModel->getFillable();
    
        foreach ($mappings as $localField => $apiField) {
            if (empty($apiField) || !isset($apiData[$apiField])) {
                continue;
            }
    
            if (in_array($localField, $fillableFields)) {
                $mappedData[$localField] = $this->castFieldValue(
                    $apiData[$apiField],
                    $this->getApiFieldType($apiField)
                );
            }
        }
    
        return $mappedData;
    }

    /**
     * Получить тип поля API
     */
    protected function getApiFieldType(string $apiFieldName): string
    {
        $apiFields = $this->api_fields ?? [];
        
        foreach ($apiFields as $field) {
            if ($field['name'] === $apiFieldName) {
                return $field['type'] ?? 'string';
            }
        }
        
        return 'string';
    }

    /**
     * Привести значение к правильному типу
     */
    protected function castFieldValue($value, string $type)
    {
        return match ($type) {
            'number' => (float) $value,
            'datetime' => is_numeric($value) ? date('Y-m-d H:i:s', $value) : $value,
            'boolean' => (bool) $value,
            default => (string) $value,
        };
    }
}
