<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orgaos', function (Blueprint $table) {
            $table->increments('id_orgaos');
            $table->string('nome', 45);
            $table->string('email_institucional', 45);
            $table->string('telefone', 45)->nullable();
            $table->string('endereco', 45)->nullable();
        });

        Schema::create('perfis', function (Blueprint $table) {
            $table->increments('id_perfis');
            $table->string('nome', 45);
            $table->string('descricao', 45)->nullable();
        });

        Schema::create('usuarios', function (Blueprint $table) {
            $table->increments('id_usuarios');
            $table->string('nome', 45);
            $table->string('status', 45)->default('ativo');
            $table->string('email', 45)->unique();
            $table->string('telefone', 45)->nullable();
            $table->string('senha', 255);
            $table->unsignedInteger('orgao_id')->nullable();
            $table->unsignedInteger('perfil_id')->nullable();

            $table->foreign('orgao_id')->references('id_orgaos')->on('orgaos')->nullOnDelete();
            $table->foreign('perfil_id')->references('id_perfis')->on('perfis')->nullOnDelete();
        });

        Schema::create('areas', function (Blueprint $table) {
            $table->increments('id_areas');
            $table->string('localizacao', 45);
            $table->string('descricao', 45)->nullable();
        });

        Schema::create('tipos_sensores', function (Blueprint $table) {
            $table->increments('id_tipos_sensores');
            $table->string('nome_tipo', 45);
            $table->string('descricao', 45)->nullable();
        });

        Schema::create('sensores', function (Blueprint $table) {
            $table->increments('id_sensores');
            $table->string('nome_tipo', 45);
            $table->string('descricao', 45)->nullable();
            $table->string('status', 45)->default('ativo');
            $table->unsignedInteger('tipo_sensor_id')->nullable();

            $table->foreign('tipo_sensor_id')
                ->references('id_tipos_sensores')
                ->on('tipos_sensores')
                ->nullOnDelete();
        });

        Schema::create('cameras', function (Blueprint $table) {
            $table->increments('id_cameras');
            $table->dateTime('data_instalacao')->nullable();
            $table->string('status', 45)->default('ativo');
            $table->string('localizacao', 45)->nullable();
            $table->string('nome_camara', 45)->nullable();
            $table->unsignedInteger('area_id')->nullable();

            $table->foreign('area_id')->references('id_areas')->on('areas')->nullOnDelete();
        });

        Schema::create('bombas', function (Blueprint $table) {
            $table->increments('id_bombas');
            $table->dateTime('data_instalacao')->nullable();
            $table->string('status', 45)->default('ativo');
            $table->string('modelo', 45)->nullable();
            $table->unsignedInteger('area_id')->nullable();

            $table->foreign('area_id')->references('id_areas')->on('areas')->nullOnDelete();
        });

        Schema::create('leituras', function (Blueprint $table) {
            $table->increments('id_leituras');
            $table->dateTime('data_leitura');
            $table->decimal('valor', 10, 2);
            $table->string('status', 45)->nullable();
            $table->unsignedInteger('sensor_id');

            $table->foreign('sensor_id')
                ->references('id_sensores')
                ->on('sensores')
                ->cascadeOnDelete();
            $table->index(['sensor_id', 'data_leitura']);
        });

        Schema::create('alertas', function (Blueprint $table) {
            $table->increments('id_alertas');
            $table->string('tipo', 45);
            $table->string('status', 45)->default('novo');
            $table->string('descricao', 45)->nullable();
            $table->unsignedInteger('sensor_id')->nullable();
            $table->unsignedInteger('bomba_id')->nullable();

            $table->foreign('sensor_id')->references('id_sensores')->on('sensores')->nullOnDelete();
            $table->foreign('bomba_id')->references('id_bombas')->on('bombas')->nullOnDelete();
            $table->index(['status', 'tipo']);
        });

        Schema::create('acionamentos', function (Blueprint $table) {
            $table->increments('id_acionamentos');
            $table->dateTime('data_hora');
            $table->string('status', 45);
            $table->unsignedInteger('bomba_id');

            $table->foreign('bomba_id')
                ->references('id_bombas')
                ->on('bombas')
                ->cascadeOnDelete();
            $table->index(['bomba_id', 'data_hora']);
        });

        Schema::create('manutencoes', function (Blueprint $table) {
            $table->increments('id_manutencoes');
            $table->date('data_manutencao');
            $table->string('descricao', 45)->nullable();
            $table->string('resposta', 45)->nullable();
            $table->unsignedInteger('sensor_id');

            $table->foreign('sensor_id')
                ->references('id_sensores')
                ->on('sensores')
                ->cascadeOnDelete();
            $table->index(['sensor_id', 'data_manutencao']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('manutencoes');
        Schema::dropIfExists('acionamentos');
        Schema::dropIfExists('alertas');
        Schema::dropIfExists('leituras');
        Schema::dropIfExists('bombas');
        Schema::dropIfExists('cameras');
        Schema::dropIfExists('sensores');
        Schema::dropIfExists('tipos_sensores');
        Schema::dropIfExists('areas');
        Schema::dropIfExists('usuarios');
        Schema::dropIfExists('perfis');
        Schema::dropIfExists('orgaos');
    }
};
