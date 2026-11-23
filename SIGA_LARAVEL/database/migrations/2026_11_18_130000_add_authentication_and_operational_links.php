<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('perfis', function (Blueprint $table) {
            $table->string('slug', 45)->nullable()->unique()->after('nome');
            $table->json('permissoes')->nullable()->after('descricao');
        });

        Schema::table('areas', function (Blueprint $table) {
            $table->unsignedInteger('orgao_id')->nullable()->after('id_areas');
            $table->foreign('orgao_id')
                ->references('id_orgaos')
                ->on('orgaos')
                ->nullOnDelete();
        });

        Schema::table('sensores', function (Blueprint $table) {
            $table->unsignedInteger('area_id')->nullable()->after('tipo_sensor_id');
            $table->foreign('area_id')
                ->references('id_areas')
                ->on('areas')
                ->nullOnDelete();
        });

        Schema::table('sensor_data', function (Blueprint $table) {
            $table->unsignedInteger('sensor_id')->nullable()->after('device_id');
            $table->foreign('sensor_id')
                ->references('id_sensores')
                ->on('sensores')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('sensores', function (Blueprint $table) {
            $table->dropForeign(['area_id']);
            $table->dropColumn('area_id');
        });
        Schema::table('sensor_data', function (Blueprint $table) {
            $table->dropForeign(['sensor_id']);
            $table->dropColumn('sensor_id');
        });

        Schema::table('areas', function (Blueprint $table) {
            $table->dropForeign(['orgao_id']);
            $table->dropColumn('orgao_id');
        });

        Schema::table('perfis', function (Blueprint $table) {
            $table->dropUnique(['slug']);
            $table->dropColumn(['slug', 'permissoes']);
        });
    }
};
