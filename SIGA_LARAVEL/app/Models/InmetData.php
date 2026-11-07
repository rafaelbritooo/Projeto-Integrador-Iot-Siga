<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class InmetData extends Model
{
    protected $table = 'weather_data';

    protected $fillable = [
        'data',
        'hora',
        'temp_instantanea',
        'temp_max',
        'temp_min',
        'umi_instantanea',
        'umi_max',
        'umi_min',
        'pto_orvalho_instantaneo',
        'pto_orvalho_max',
        'pto_orvalho_min',
        'pressao_instantanea',
        'pressao_max',
        'pressao_min',
        'vel_vento',
        'dir_vento',
        'raj_vento',
        'radiacao',
        'chuva'
    ];

    protected $casts = [
        'data' => 'date',
        'hora' => 'string',
        'temp_instantanea' => 'float',
        'temp_max' => 'float',
        'temp_min' => 'float',
        'umi_instantanea' => 'float',
        'umi_max' => 'float',
        'umi_min' => 'float',
        'pto_orvalho_instantaneo' => 'float',
        'pto_orvalho_max' => 'float',
        'pto_orvalho_min' => 'float',
        'pressao_instantanea' => 'float',
        'pressao_max' => 'float',
        'pressao_min' => 'float',
        'vel_vento' => 'float',
        'dir_vento' => 'float',
        'raj_vento' => 'float',
        'radiacao' => 'float',
        'chuva' => 'float'
    ];

    public $timestamps = false; // tabela não tem created_at/updated_at
}
