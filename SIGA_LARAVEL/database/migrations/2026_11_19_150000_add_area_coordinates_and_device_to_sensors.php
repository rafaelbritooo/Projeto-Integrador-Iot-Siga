<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('areas', 'latitude')) {
            Schema::table('areas', function (Blueprint $table) {
                $table->decimal('latitude', 10, 7)->nullable()->after('localizacao');
                $table->decimal('longitude', 10, 7)->nullable()->after('latitude');
            });
        }

        if (! Schema::hasColumn('sensores', 'device_id')) {
            Schema::table('sensores', function (Blueprint $table) {
                $table->foreignId('device_id')
                    ->nullable()
                    ->after('area_id')
                    ->constrained('devices')
                    ->nullOnDelete();
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('sensores', 'device_id')) {
            Schema::table('sensores', function (Blueprint $table) {
                $table->dropConstrainedForeignId('device_id');
            });
        }

        if (Schema::hasColumn('areas', 'latitude')) {
            Schema::table('areas', function (Blueprint $table) {
                $table->dropColumn(['latitude', 'longitude']);
            });
        }
    }
};
