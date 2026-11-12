<?php

namespace App\Http\Controllers;

use App\Services\WifiLocationDispatcher;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WifiGeolocationController extends Controller
{
    public function store(Request $request, WifiLocationDispatcher $dispatcher): JsonResponse
    {
        $validated = $request->validate([
            'device_code' => ['required', 'string', 'max:64', 'regex:/\A[A-Za-z0-9][A-Za-z0-9._-]{0,63}\z/'],
            'wifi_access_points' => ['required', 'array', 'max:15'],
            'wifi_access_points.*.macAddress' => [
                'required',
                'string',
                'max:17',
                'regex:/\A(?:[0-9A-Fa-f]{2}:){5}[0-9A-Fa-f]{2}\z/',
            ],
            'wifi_access_points.*.signalStrength' => ['required', 'integer', 'between:-127,0'],
            'wifi_access_points.*.channel' => ['sometimes', 'integer', 'between:1,196'],
        ]);

        $result = $dispatcher->enqueue($validated['device_code'], $validated['wifi_access_points']);
        $device = $result['device'];

        return response()->json([
            'message' => $result['queued']
                ? 'Solicitação de localização recebida para processamento.'
                : 'Solicitação ignorada pelo intervalo de segurança configurado.',
            'device_code' => $device->code,
            'location_status' => $device->location_status,
            'queued' => $result['queued'],
        ], 202);
    }
}
