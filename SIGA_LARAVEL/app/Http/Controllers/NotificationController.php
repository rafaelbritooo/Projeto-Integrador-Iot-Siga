<?php

namespace App\Http\Controllers;

use App\Models\SensorData;
use Illuminate\Contracts\View\View;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(Request $request): View
    {
        $filters = $request->validate([
            'period' => ['sometimes', 'in:24h,7d,30d,all'],
            'type' => ['sometimes', 'in:all,pump_on'],
        ]);

        $period = $filters['period'] ?? '24h';
        $type = $filters['type'] ?? 'all';
        $notifications = $this->notificationsQuery($period, $type)
            ->latest('created_at')
            ->paginate(15)
            ->withQueryString();

        return view('notifications.index', [
            'notifications' => $notifications,
            'notificationCount' => $notifications->total(),
            'period' => $period,
            'type' => $type,
        ]);
    }

    private function notificationsQuery(string $period, string $type): Builder
    {
        $query = SensorData::query()
            ->select([
                'id',
                'water_level_cm',
                'water_status',
                'pump_on',
                'simulation',
                'created_at',
            ])
            ->where('pump_on', true);

        $start = match ($period) {
            '24h' => now()->subDay(),
            '7d' => now()->subDays(7),
            '30d' => now()->subDays(30),
            default => null,
        };

        if ($start !== null) {
            $query->where('created_at', '>=', $start);
        }

        if ($type === 'pump_on') {
            $query->where('pump_on', true);
        }

        return $query;
    }
}
