<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Lead;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class LeadController extends Controller
{
    private const SERVICE_FIELDS = ['apikey', 'api_key', '_token'];

    public function index(Request $request)
    {
        $leads = Lead::with(['user', 'project'])->latest()->paginate($request->get('per_page', 20));

        return response()->json([
            'data' => $leads->items(),
            'meta' => [
                'current_page' => $leads->currentPage(),
                'total' => $leads->total(),
                'per_page' => $leads->perPage(),
            ],
        ]);
    }

    public function externalStore(Request $request)
    {
        $this->normalizeAliases($request);

        [$apiKey, $apiKeySource] = $this->resolveExternalApiKey($request);
        $expectedApiKey = trim((string) config('services.external_leads.key'));

        if (!$expectedApiKey || !$apiKey || !hash_equals($expectedApiKey, $apiKey)) {
            Log::warning('External lead API key mismatch', [
                'source' => $apiKeySource,
                'received_length' => $apiKey ? strlen($apiKey) : 0,
                'expected_configured' => $expectedApiKey !== '',
            ]);

            return response()->json([
                'error' => 'Unauthorized',
                'message' => 'Wrong ApiKey',
            ], 401);
        }

        return $this->createLead($request);
    }

    public function postback(Request $request, ?string $resource = null)
    {
        return $this->externalStore($request);
    }

    public function store(Request $request)
    {
        return $this->createLead($request);
    }

    public function show(Lead $lead)
    {
        $lead->load(['user', 'project']);

        return response()->json(['data' => $lead]);
    }

    public function update(Request $request, Lead $lead)
    {
        $validator = Validator::make($request->all(), [
            'status' => 'sometimes|string|max:255',
            'comment' => 'nullable|string',
            'custom_fields' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Validation failed',
                'messages' => $validator->errors(),
            ], 422);
        }

        $lead->update($validator->validated());

        return response()->json([
            'data' => $lead,
            'message' => 'Lead updated successfully',
        ]);
    }

    public function destroy(Lead $lead)
    {
        $lead->delete();

        return response()->json(['message' => 'Lead deleted successfully']);
    }

    public function stats()
    {
        $stats = Lead::selectRaw('
            COUNT(*) as total,
            SUM(CASE WHEN status = "new" THEN 1 ELSE 0 END) as new,
            SUM(CASE WHEN status = "invited" THEN 1 ELSE 0 END) as invited,
            SUM(CASE WHEN status = "accepted" THEN 1 ELSE 0 END) as accepted,
            SUM(CASE WHEN status = "rejected" THEN 1 ELSE 0 END) as rejected
        ')->first();

        return response()->json(['data' => $stats]);
    }

    private function createLead(Request $request)
    {
        $this->normalizeAliases($request);

        $validator = Validator::make($request->all(), [
            'user_id' => 'required|exists:users,id',
            'project_id' => 'nullable|exists:projects,id',
            'tg_id' => 'nullable|string|max:255',
            'tg_username' => 'nullable|string|max:255',
            'tg_channel' => 'nullable|string|max:255',
            'is_our_channel' => 'nullable|boolean',
            'message' => 'nullable|string',
            'firstname' => 'nullable|string|max:255',
            'lastname' => 'nullable|string|max:255',
            'name' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:50',
            'comment' => 'nullable|string',
            'status' => 'nullable|string|max:255',
            'is_counted' => 'nullable|boolean',
            'type' => 'nullable|string|max:255',
            'price' => 'nullable|numeric',
            'currency' => 'nullable|string|size:3',
            'products' => 'nullable|string',
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
        $additionalData = $validated['additional_data'] ?? [];

        foreach ($request->all() as $key => $value) {
            if (in_array($key, self::SERVICE_FIELDS, true) || array_key_exists($key, $validated)) {
                continue;
            }

            $additionalData[$key] = $value;
        }

        unset($validated['additional_data']);

        try {
            $lead = Lead::create(array_merge($validated, [
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'price' => $validated['price'] ?? 0,
                'currency' => $validated['currency'] ?? 'RUB',
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

    private function normalizeAliases(Request $request): void
    {
        $aliases = [
            'tg_id' => ['telegram_id', 'tg_user_id', 'tg id лида'],
            'tg_username' => ['telegram_username', 'username', 'tg_username лида', 'tg username лида'],
            'tg_channel' => ['telegram_channel', 'tg', 'ТГ канал'],
            'project_id' => ['activity_id', 'деятельность_id', 'ид деятельности', 'id деятельности'],
        ];

        foreach ($aliases as $target => $keys) {
            if ($request->filled($target)) {
                continue;
            }

            foreach ($keys as $key) {
                if ($request->filled($key)) {
                    $request->merge([$target => $request->input($key)]);
                    break;
                }
            }
        }

        if (!$request->has('is_our_channel')) {
            foreach (['our_channel', 'is_own_channel', 'own_channel', 'наш канал', 'Наш канал'] as $key) {
                if ($request->has($key)) {
                    $request->merge(['is_our_channel' => $request->boolean($key)]);
                    break;
                }
            }
        }
    }

    private function resolveExternalApiKey(Request $request): array
    {
        $sources = [
            'Authorization: Bearer' => $request->bearerToken(),
            'X-Api-Key' => $request->header('X-Api-Key'),
            'x-api-key' => $request->header('x-api-key'),
            'Api-Key' => $request->header('Api-Key'),
            'apikey' => $request->input('apikey'),
            'api_key' => $request->input('api_key'),
        ];

        foreach ($sources as $source => $value) {
            $value = trim((string) $value);

            if ($value !== '') {
                return [$value, $source];
            }
        }

        return [null, 'none'];
    }
}
