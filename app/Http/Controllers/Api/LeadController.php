<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Country;
use App\Models\Integration;
use App\Models\Lead;
use App\Models\Link;
use App\Models\Offer;
use App\Models\OfferLink;
use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class LeadController extends Controller
{
    private const SERVICE_FIELDS = ['apikey', '_token'];

    public function index(Request $request)
    {
        $leads = Lead::latest()->paginate($request->get('per_page', 20));

        return response()->json([
            'data' => $leads->items(),
            'meta' => [
                'current_page' => $leads->currentPage(),
                'total' => $leads->total(),
                'per_page' => $leads->perPage(),
            ]
        ]);
    }

    public function postback(Request $request, $resource)
    {
        Log::info("Postback received for resource: {$resource}");
        Log::info('Request data:', $request->all());
    
        // Ищем интеграцию по имени и API ключу
        $integration = Integration::where('name', $resource)
            ->where('apikey', $request->apikey)
            ->where('is_active', true)
            ->first();
    
        if (!$integration) {
            Log::warning("Integration not found or inactive: {$resource}");
            return response()->json(['status' => 'error', 'message' => 'Wrong ApiKey or integration inactive!']);
        }
    
        try {
            $allRequestData = $request->all();
            // Преобразуем данные из API в формат системы используя маппинг
            $mappedData = $integration->mapApiData($allRequestData);

            $leadData = $this->prepareLeadData($mappedData, $allRequestData, $request, $integration);

            $lead = Lead::create($leadData);
    
            if (isset($leadData['project_id'])) {
                $lead->project_id = $leadData['project_id'];
                $lead->save();
            }
    
            Log::info("Lead created successfully: {$lead->id}");
    
            return response()->json([
                'status' => 'success',
                'data' => $lead,
                'message' => 'Lead created successfully'
            ], 201);
    
        } catch (\Exception $e) {
            Log::error("Failed to create lead: " . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to create lead: ' . $e->getMessage()
            ], 500);
        }
    }
    
    protected function prepareLeadData(array $mappedData, array $allRequestData, Request $request, Integration $integration): array
    {
        // Основные данные
        $leadData = array_merge($mappedData, [
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'integration_id' => $integration->id,
        ]);

        // Обрабатываем UTM параметры
        $projectData = $this->processUtmParameters($request, $integration);
        $leadData = array_merge($leadData, $projectData);

        // Определяем цену
        $leadData['price'] = $this->determinePrice($request, $projectData['offer_id'] ?? null);

        // Все остальные данные, которые не попали в основные поля
        $additionalData = [];
        $fillableFields = (new Lead())->getFillable();

        foreach ($allRequestData as $key => $value) {
            // Пропускаем служебные поля
            if (in_array($key, ['apikey', '_token'])) {
                continue;
            }

            // Если поле не fillable и не обработано ранее - добавляем в дополнительные
            if (!in_array($key, $fillableFields) && !array_key_exists($key, $leadData)) {
                $additionalData[$key] = $value;
            }
        }

        // Добавляем дополнительные данные
        if (!empty($additionalData)) {
            $leadData['additional_data'] = $additionalData;
        }

        return $leadData;
    }

    /**
     * Обработка UTM параметров и определение проекта/оффера
     */
    protected function processUtmParameters(Request $request, Integration $integration): array
    {
        $result = [
            'user_id' => null,
            'offer_id' => null,
            'project_id' => null,
            'sub1' => null,
            'sub2' => null,
            'sub3' => null,
            'sub4' => null,
            'sub5' => null,
        ];
    
        $utmCampaign = $request->utm_campaign;
        
        if (!$utmCampaign) {
            return $result;
        }
    
        $data = explode(':', $utmCampaign);
        
        $userId = $data[0] ?? null;
        $offerId = $data[1] ?? null;
        $linkId = $data[2] ?? null;
    
        if ($linkId && $userId) {
            $link = Link::where('user_id', $userId)
                ->where('id', $linkId)
                ->first();
    
            if ($link) {
                $result['user_id'] = $userId;
                $result['offer_id'] = $link->offer_id;
                $result['sub1'] = $link->sub1;
                $result['sub2'] = $link->sub2;
                $result['sub3'] = $link->sub3;
                $result['sub4'] = $link->sub4;
                $result['sub5'] = $link->sub5;
    
                $project = Project::where('status', 'active')
                ->where(function ($query) {
                    $query->where('start_date', '<=', now())
                          ->orWhereNull('start_date'); // Если start_date может быть null
                })
                ->where('offer_id', $link->offer_id)
                ->first();
    
                if ($project) {
                    $result['project_id'] = $project->id;
                }
            }
        }
        // Если линка нет, но есть оффер
        elseif ($offerId) {
            $result['offer_id'] = $offerId;
            $result['user_id'] = $userId;
    
            $project = Project::where('status', 'active')
            ->where(function ($query) {
                $query->where('start_date', '<=', now())
                      ->orWhereNull('start_date'); // Если start_date может быть null
            })
            ->where('offer_id', $offerId)
            ->first();
    
            if ($project) {
                $result['project_id'] = $project->id;
            }
        }
    
        $utmFields = [
            'utm_source' => $request->utm_source,
            'utm_medium' => $request->utm_medium,
            'utm_campaign' => $request->utm_campaign,
            'utm_term' => $request->utm_term,
            'utm_content' => $request->utm_content,
        ];
    
        return array_merge($result, $utmFields);
    }
    
    /**
     * Определение цены лида
     */
    protected function determinePrice(Request $request, ?int $offerId): float
    {
        if (!$offerId) {
            return 0;
        }
    
        $offer = Offer::find($offerId);
        if (!$offer) {
            return 0;
        }
    
        // Определяем страну из запроса
        $countryReq = $request->citizenship == 'РФ' ? 'RU' : $request->citizenship;
        $country = Country::where('iso_name', $countryReq)->first();
    
        // Ищем цену для страны
        if ($country) {
            $price = $offer->prices()->where('country_id', $country->id)->first();
            if ($price) {
                return $price->price;
            }
        }
    
        // Пробуем цену для России
        $price = $offer->prices()->where('country_id', 'RU')->first();
        if ($price) {
            return $price->price;
        }
    
        // Берем первую доступную цену
        $price = $offer->prices()->first();
        return $price ? $price->price : 0;
    }

    public function store(Request $request)
    {
        $this->normalizeTgChannel($request);

        $validator = Validator::make($request->all(), [
            'offer_id' => 'required|exists:offers,id',
            'offer_link_id' => 'nullable|exists:offer_links,id',
            'country_iso' => 'nullable|string',
            'firstname' => 'nullable|string|max:255',
            'lastname' => 'nullable|string|max:255',
            'gender' => 'nullable|string|max:255',
            'birthday' => 'nullable|string|max:255',
            'address' => 'nullable|string|max:255',
            'citizenship' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:20',
            'comment' => 'nullable|string',
            'tg_channel' => 'nullable|string|max:255',
            'currency' => 'nullable|string|size:3',
            'utm_source' => 'nullable|string|max:100',
            'utm_medium' => 'nullable|string|max:100',
            'utm_campaign' => 'nullable|string|max:100',
            'utm_term' => 'nullable|string|max:100',
            'utm_content' => 'nullable|string|max:100',
            'sub1' => 'nullable|string|max:100',
            'sub2' => 'nullable|string|max:100',
            'sub3' => 'nullable|string|max:100',
            'sub4' => 'nullable|string|max:100',
            'sub5' => 'nullable|string|max:100',
            'custom_fields' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Validation failed',
                'messages' => $validator->errors()
            ], 422);
        }

        $offer = Offer::findOrFail($request->offer_id);
        $price = $this->findOfferPrice($offer, $request->country_iso);

        try {
            $lead = Lead::create(array_merge($validator->validated(), [
                'user_id' => auth()->id(),
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'price' => $price,
            ]));

            return response()->json([
                'data' => $lead,
                'message' => 'Lead created successfully'
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to create lead',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function externalStore(Request $request)
    {
        $this->normalizeTgChannel($request);

        $apiKey = $request->bearerToken() ?: $request->header('X-Api-Key') ?: $request->input('apikey');
        $expectedApiKey = config('services.external_leads.key');

        if (!$expectedApiKey || !$apiKey || !hash_equals($expectedApiKey, $apiKey)) {
            return response()->json([
                'error' => 'Unauthorized',
                'message' => 'Wrong ApiKey',
            ], 401);
        }

        $validator = Validator::make($request->all(), [
            'user_id' => 'required|exists:users,id',
            'offer_id' => 'required|exists:offers,id',
            'offer_link_id' => 'nullable|exists:offer_links,id',
            'link_id' => 'nullable|exists:links,id',
            'project_id' => 'nullable|exists:projects,id',
            'country_iso' => 'nullable|string|max:2',
            'firstname' => 'nullable|string|max:255',
            'lastname' => 'nullable|string|max:255',
            'gender' => 'nullable|string|max:255',
            'birthday' => 'nullable|string|max:255',
            'address' => 'nullable|string|max:255',
            'citizenship' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:50',
            'comment' => 'nullable|string',
            'tg_channel' => 'nullable|string|max:255',
            'status' => 'nullable|string|max:255',
            'is_counted' => 'nullable|boolean',
            'type' => 'nullable|string|max:255',
            'price' => 'nullable|numeric',
            'currency' => 'nullable|string|size:3',
            'products' => 'nullable|string',
            'utm_source' => 'nullable|string|max:255',
            'utm_medium' => 'nullable|string|max:255',
            'utm_campaign' => 'nullable|string|max:255',
            'utm_term' => 'nullable|string|max:255',
            'utm_content' => 'nullable|string|max:255',
            'sub1' => 'nullable|string|max:255',
            'sub2' => 'nullable|string|max:255',
            'sub3' => 'nullable|string|max:255',
            'sub4' => 'nullable|string|max:255',
            'sub5' => 'nullable|string|max:255',
            'custom_fields' => 'nullable|array',
            'additional_data' => 'nullable|array',
            'created_at' => 'nullable|date',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Validation failed',
                'messages' => $validator->errors(),
            ], 422);
        }

        $validated = $validator->validated();
        $offer = Offer::findOrFail($validated['offer_id']);
        $additionalData = $validated['additional_data'] ?? [];

        foreach ($request->all() as $key => $value) {
            if (in_array($key, self::SERVICE_FIELDS, true) || array_key_exists($key, $validated)) {
                continue;
            }

            $additionalData[$key] = $value;
        }

        unset($validated['country_iso'], $validated['additional_data']);

        try {
            $lead = Lead::create(array_merge($validated, [
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'price' => $validated['price'] ?? $this->findOfferPrice($offer, $request->country_iso),
                'additional_data' => $additionalData ?: null,
            ]));

            return response()->json([
                'data' => $lead,
                'message' => 'Lead created successfully',
            ], 201);
        } catch (\Exception $e) {
            Log::error('Failed to create external lead: ' . $e->getMessage(), [
                'user_id' => $validated['user_id'] ?? null,
                'payload' => $request->except(self::SERVICE_FIELDS),
            ]);

            return response()->json([
                'error' => 'Failed to create lead',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    public function show(Lead $lead)
    {
        $lead->load(['offer', 'user', 'link']);

        return response()->json([
            'data' => $lead
        ]);
    }

    public function update(Request $request, Lead $lead)
    {
        $validator = Validator::make($request->all(), [
            'status' => 'sometimes|in:new,processing,completed,rejected,canceled',
            'comment' => 'nullable|string',
            'custom_fields' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Validation failed',
                'messages' => $validator->errors()
            ], 422);
        }

        $lead->update($validator->validated());

        return response()->json([
            'data' => $lead,
            'message' => 'Lead updated successfully'
        ]);
    }

    public function destroy(Lead $lead)
    {
        $lead->delete();

        return response()->json([
            'message' => 'Lead deleted successfully'
        ]);
    }

    public function stats(Request $request)
    {
        $stats = Lead::selectRaw('
            COUNT(*) as total,
            SUM(CASE WHEN status = "new" THEN 1 ELSE 0 END) as new,
            SUM(CASE WHEN status = "processing" THEN 1 ELSE 0 END) as processing,
            SUM(CASE WHEN status = "completed" THEN 1 ELSE 0 END) as completed,
            SUM(CASE WHEN status = "rejected" THEN 1 ELSE 0 END) as rejected,
            SUM(CASE WHEN status = "canceled" THEN 1 ELSE 0 END) as canceled
        ')->first();

        return response()->json([
            'data' => $stats
        ]);
    }

    private function normalizeTgChannel(Request $request): void
    {
        if ($request->filled('tg_channel')) {
            return;
        }

        foreach (['telegram_channel', 'tg', 'ТГ канал'] as $alias) {
            if ($request->filled($alias)) {
                $request->merge(['tg_channel' => $request->input($alias)]);
                return;
            }
        }
    }

    private function findOfferPrice(Offer $offer, ?string $countryIso = null): float
    {
        if ($countryIso) {
            $country = Country::where('iso_name', $countryIso)->first();

            if ($country) {
                $price = $offer->prices()->where('country_id', $country->id)->first();

                if ($price) {
                    return (float) $price->price;
                }
            }
        }

        $price = $offer->prices()->whereNull('country_id')->first()
            ?: $offer->prices()->first();

        return $price ? (float) $price->price : 0;
    }
}
