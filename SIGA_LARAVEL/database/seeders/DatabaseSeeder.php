<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Orgao;
use App\Models\Perfil;
use App\Models\Usuario;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        User::updateOrCreate(
            ['email' => 'test@example.com'],
            [
                'name' => 'Test User',
                'password' => bcrypt('password'),
            ]
        );

        $adminProfile = Perfil::updateOrCreate(
            ['slug' => 'administrador'],
            [
                'nome' => 'Administrador',
                'descricao' => 'Gerencia usuários e recursos do sistema.',
                'permissoes' => ['domain.manage', 'dashboard.view', 'readings.manage', 'alerts.manage', 'maintenance.manage'],
            ]
        );

        $operadorProfile = Perfil::updateOrCreate(
            ['slug' => 'operador'],
            [
                'nome' => 'Operador',
                'descricao' => 'Opera sensores, bombas e alertas.',
                'permissoes' => ['dashboard.view', 'readings.manage', 'alerts.manage', 'maintenance.manage'],
            ]
        );

        $consultaProfile = Perfil::updateOrCreate(
            ['slug' => 'consulta'],
            [
                'nome' => 'Consulta',
                'descricao' => 'Visualiza informações sem alterar registros.',
                'permissoes' => ['dashboard.view'],
            ]
        );

        $orgao = Orgao::firstOrCreate(
            ['email_institucional' => 'defesa-civil@example.com'],
            [
                'nome' => 'Defesa Civil',
                'telefone' => '',
                'endereco' => '',
            ]
        );

        Usuario::updateOrCreate(
            ['email' => 'admin@siga.local'],
            [
                'nome' => 'Administrador SIGA',
                'status' => 'ativo',
                'telefone' => '',
                'senha' => Hash::make('siga123'),
                'orgao_id' => $orgao->id_orgaos,
                'perfil_id' => $adminProfile->id_perfis,
            ]
        );

        Usuario::updateOrCreate(
            ['email' => 'operador@siga.local'],
            [
                'nome' => 'Operador SIGA',
                'status' => 'ativo',
                'telefone' => '',
                'senha' => Hash::make('siga123'),
                'orgao_id' => $orgao->id_orgaos,
                'perfil_id' => $operadorProfile->id_perfis,
            ]
        );

        Usuario::updateOrCreate(
            ['email' => 'consulta@siga.local'],
            [
                'nome' => 'Consulta SIGA',
                'status' => 'ativo',
                'telefone' => '',
                'senha' => Hash::make('siga123'),
                'orgao_id' => $orgao->id_orgaos,
                'perfil_id' => $consultaProfile->id_perfis,
            ]
        );
    }
}
