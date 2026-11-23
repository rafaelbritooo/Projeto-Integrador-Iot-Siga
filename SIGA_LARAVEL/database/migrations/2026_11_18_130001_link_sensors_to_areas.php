<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('sensores', 'area_id')) {
            Schema::table('sensores', function (Blueprint $table) {
                $table->unsignedInteger('area_id')->nullable()->after('tipo_sensor_id');
                $table->foreign('area_id')
                    ->references('id_areas')
                    ->on('areas')
                    ->nullOnDelete();
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('sensores', 'area_id')) {
            Schema::table('sensores', function (Blueprint $table) {
                $table->dropForeign(['area_id']);
                $table->dropColumn('area_id');
            });
        }
    }
};
