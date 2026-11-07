<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AuthenticateSensor
{
    public function handle(Request $request, Closure $next): Response
    {
        $configuredToken = (string) config('services.sensor.token');
        $providedToken = (string) $request->header('X-Device-Token');

        if ($configuredToken === '') {
            return response()->json([
                'message' => 'Sensor authentication is not configured.',
            ], 503);
        }

        if ($providedToken === '' || ! hash_equals($configuredToken, $providedToken)) {
            return response()->json([
                'message' => 'Unauthenticated sensor request.',
            ], 401);
        }

        return $next($request);
    }
}
