
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sensor_data', function (Blueprint $table) {
            $table->id();

            // Sensor ultrassônico
            $table->float('water_level_cm')->nullable();

            // Sensor de chuva: leitura digital 0 ou 1
            $table->unsignedTinyInteger('rain_sensor_raw')->nullable();

            // Situação identificada pelo sistema
            $table->string('water_status')->nullable();

            // Estado da bomba controlada pelo relé
            $table->boolean('pump_on')->default(false);

            // Identifica leituras simuladas
            $table->boolean('simulation')->default(false);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sensor_data');
    }
};
