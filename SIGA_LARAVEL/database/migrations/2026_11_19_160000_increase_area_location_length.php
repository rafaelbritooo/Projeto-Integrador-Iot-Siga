<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        if (DB::getDriverName() === 'mysql') {
            DB::statement('ALTER TABLE areas MODIFY localizacao VARCHAR(255) NOT NULL');
            DB::statement('ALTER TABLE sensores MODIFY descricao VARCHAR(255) NULL');
        }
    }

    public function down(): void
    {
        if (DB::getDriverName() === 'mysql') {
            DB::statement('ALTER TABLE areas MODIFY localizacao VARCHAR(45) NOT NULL');
            DB::statement('ALTER TABLE sensores MODIFY descricao VARCHAR(45) NULL');
        }
    }
};
