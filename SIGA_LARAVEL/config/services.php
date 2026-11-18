<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'mistral' => [
        'api_key' => env('MISTRAL_API_KEY'),
    ],

    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],
    'inmet' => [
        'url' => env('INMET_API_URL'),
    ],
    'google_geolocation' => [
        'api_key' => env('GOOGLE_GEOLOCATION_API_KEY'),
        'url' => env('GOOGLE_GEOLOCATION_API_URL', 'https://www.googleapis.com/geolocation/v1/geolocate'),
        'timeout' => (int) env('GOOGLE_GEOLOCATION_TIMEOUT', 8),
        'minimum_interval_seconds' => (int) env('WIFI_GEOLOCATION_MINIMUM_INTERVAL', 300),
        'offline_after_minutes' => (int) env('DEVICE_OFFLINE_AFTER_MINUTES', 5),
        'approximate_accuracy_meters' => (int) env('WIFI_LOCATION_APPROXIMATE_ACCURACY_METERS', 100),
    ],

    'resend' => [
        'key' => env('RESEND_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],
];
