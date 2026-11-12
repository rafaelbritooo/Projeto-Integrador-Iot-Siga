<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('devices', function (Blueprint $table) {
            $table->id();
            $table->string('code', 64)->unique();
            $table->string('name');
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->decimal('location_accuracy', 12, 2)->nullable();
            $table->string('location_status', 32)->default('pending');
            $table->timestamp('location_updated_at')->nullable();
            $table->timestamp('last_wifi_scan_at')->nullable();
            $table->char('last_wifi_fingerprint', 64)->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['is_active', 'location_status']);
        });

        Schema::table('sensor_data', function (Blueprint $table) {
            $table->foreignId('device_id')
                ->nullable()
                ->after('id')
                ->constrained()
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('sensor_data', function (Blueprint $table) {
            $table->dropConstrainedForeignId('device_id');
        });

        Schema::dropIfExists('devices');
    }
};
