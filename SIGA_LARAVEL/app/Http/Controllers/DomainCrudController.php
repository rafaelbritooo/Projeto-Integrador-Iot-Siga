<?php

namespace App\Http\Controllers;

use App\Models\Acionamento;
use App\Models\Alerta;
use App\Models\Area;
use App\Models\Bomba;
use App\Models\Camera;
use App\Models\Device;
use App\Models\Leitura;
use App\Models\Manutencao;
use App\Models\Orgao;
use App\Models\Perfil;
use App\Models\Sensor;
use App\Models\TipoSensor;
use App\Models\Usuario;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\View\View;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;

class DomainCrudController extends Controller
{
    private function entities(): array
    {
        return [
            'orgaos' => ['label' => 'Órgãos', 'model' => Orgao::class, 'key' => 'id_orgaos'],
            'perfis' => ['label' => 'Perfis', 'model' => Perfil::class, 'key' => 'id_perfis'],
            'usuarios' => ['label' => 'Usuários', 'model' => Usuario::class, 'key' => 'id_usuarios'],
            'areas' => ['label' => 'Áreas', 'model' => Area::class, 'key' => 'id_areas'],
            'tipos-sensores' => ['label' => 'Tipos de sensores', 'model' => TipoSensor::class, 'key' => 'id_tipos_sensores'],
            'sensores' => ['label' => 'Sensores', 'model' => Sensor::class, 'key' => 'id_sensores'],
            'devices' => ['label' => 'Dispositivos', 'model' => Device::class, 'key' => 'id'],
            'cameras' => ['label' => 'Câmeras', 'model' => Camera::class, 'key' => 'id_cameras'],
            'bombas' => ['label' => 'Bombas', 'model' => Bomba::class, 'key' => 'id_bombas'],
            'leituras' => ['label' => 'Leituras', 'model' => Leitura::class, 'key' => 'id_leituras'],
            'alertas' => ['label' => 'Alertas', 'model' => Alerta::class, 'key' => 'id_alertas'],
            'acionamentos' => ['label' => 'Acionamentos', 'model' => Acionamento::class, 'key' => 'id_acionamentos'],
            'manutencoes' => ['label' => 'Manutenções', 'model' => Manutencao::class, 'key' => 'id_manutencoes'],
        ];
    }

    private function fields(string $entity): array
    {
        return match ($entity) {
            'orgaos' => [
                ['nome', 'Nome', 'text', true],
                ['email_institucional', 'E-mail institucional', 'email', true],
                ['telefone', 'Telefone', 'text', false],
                ['endereco', 'Endereço', 'text', false],
            ],
            'perfis' => [
                ['nome', 'Nome', 'text', true],
                ['slug', 'Identificador técnico', 'text', true],
                ['descricao', 'Descrição', 'text', false],
                ['permissoes', 'Permissões', 'text', false],
            ],
            'usuarios' => [
                ['nome', 'Nome', 'text', true],
                ['email', 'E-mail', 'email', true],
                ['senha', 'Senha', 'password', true],
                ['telefone', 'Telefone', 'text', false],
                ['status', 'Status', 'text', true],
                ['orgao_id', 'Órgão', 'select:orgaos:id_orgaos:nome', false],
                ['perfil_id', 'Perfil', 'select:perfis:id_perfis:nome', false],
            ],
            'areas' => [
                ['orgao_id', 'Órgão', 'select:orgaos:id_orgaos:nome', false],
                ['localizacao', 'Endereço da área', 'text', true],
                ['descricao', 'Descrição', 'text', false],
                ['latitude', 'Latitude', 'number', false],
                ['longitude', 'Longitude', 'number', false],
            ],
            'tipos-sensores' => [
                ['nome_tipo', 'Nome do tipo', 'text', true],
                ['descricao', 'Descrição', 'text', false],
            ],
            'sensores' => [
                ['nome_tipo', 'Nome', 'text', true],
                ['descricao', 'Descrição', 'text', false],
                ['status', 'Status', 'text', true],
                ['tipo_sensor_id', 'Tipo', 'select:tipos-sensores:id_tipos_sensores:nome_tipo', false],
                ['area_id', 'Área', 'select:areas:id_areas:localizacao', false],
                ['device_id', 'Dispositivo', 'select:devices:id:code', false],
            ],
            'devices' => [
                ['code', 'Código do dispositivo', 'text', true],
                ['name', 'Nome', 'text', true],
                ['is_active', 'Ativo', 'checkbox', true],
            ],
            'cameras' => [
                ['nome_camara', 'Nome', 'text', false],
                ['localizacao', 'Localização', 'text', false],
                ['status', 'Status', 'text', true],
                ['data_instalacao', 'Instalada em', 'datetime-local', false],
                ['area_id', 'Área', 'select:areas:id_areas:localizacao', false],
            ],
            'bombas' => [
                ['modelo', 'Modelo', 'text', false],
                ['status', 'Status', 'text', true],
                ['data_instalacao', 'Instalada em', 'datetime-local', false],
                ['area_id', 'Área', 'select:areas:id_areas:localizacao', false],
            ],
            'leituras' => [
                ['valor', 'Valor', 'number', true],
                ['status', 'Status', 'text', false],
                ['data_leitura', 'Data da leitura', 'datetime-local', true],
                ['sensor_id', 'Sensor', 'select:sensores:id_sensores:nome_tipo', true],
            ],
            'alertas' => [
                ['tipo', 'Tipo', 'text', true],
                ['status', 'Status', 'text', true],
                ['descricao', 'Descrição', 'text', false],
                ['sensor_id', 'Sensor', 'select:sensores:id_sensores:nome_tipo', false],
                ['bomba_id', 'Bomba', 'select:bombas:id_bombas:modelo', false],
            ],
            'acionamentos' => [
                ['data_hora', 'Data e hora', 'datetime-local', true],
                ['status', 'Status', 'text', true],
                ['bomba_id', 'Bomba', 'select:bombas:id_bombas:modelo', true],
            ],
            'manutencoes' => [
                ['data_manutencao', 'Data', 'date', true],
                ['descricao', 'Descrição', 'text', false],
                ['resposta', 'Resposta', 'text', false],
                ['sensor_id', 'Sensor', 'select:sensores:id_sensores:nome_tipo', true],
            ],
        };
    }

    private function resolveEntity(string $entity): array
    {
        abort_unless(isset($this->entities()[$entity]), 404);

        return $this->entities()[$entity];
    }

    private function rules(string $entity, bool $creating): array
    {
        $rules = [];

        foreach ($this->fields($entity) as [$name, , $type, $required]) {
            $items = [];
            $items[] = ($required && ! ($type === 'password' && ! $creating)) ? 'required' : 'nullable';

            if ($type === 'email') {
                $items[] = 'email';
            } elseif ($type === 'checkbox') {
                $items[] = 'boolean';
            } elseif ($type === 'number') {
                $items[] = 'numeric';
            } elseif (str_starts_with($type, 'datetime')) {
                $items[] = 'date';
            } elseif ($type === 'date') {
                $items[] = 'date';
            } elseif ($type === 'password') {
                $items[] = 'string';
                $items[] = 'min:6';
            } elseif (str_starts_with($type, 'select:')) {
                $items[] = 'integer';
            } else {
                $items[] = 'string';
            }

            $rules[$name] = $items;
        }

        return $rules;
    }

    private function selectOptions(string $entity): array
    {
        $options = [];

        foreach ($this->fields($entity) as [, , $type]) {
            if (! str_starts_with($type, 'select:')) {
                continue;
            }

            [, $targetEntity, $key, $label] = explode(':', $type);
            $target = $this->resolveEntity($targetEntity);
            $options[$targetEntity] = ($target['model'])::query()
                ->orderBy($label)
                ->get([$key, $label])
                ->mapWithKeys(fn (Model $row) => [
                    $row->{$key} => $row->{$label},
                ])
                ->all();
        }

        return $options;
    }

    public function index(Request $request): View
    {
        $entity = $request->route('entity', 'orgaos');
        $config = $this->resolveEntity($entity);
        $records = ($config['model'])::query()->paginate(15)->withQueryString();
        $usuario = Usuario::query()
            ->with('perfil')
            ->find($request->session()->get('siga_usuario_id'));

        return view('domain.index', [
            'entities' => $this->entities(),
            'entity' => $entity,
            'config' => $config,
            'records' => $records,
            'fields' => $this->fields($entity),
            'selectOptions' => $this->selectOptions($entity),
            'canManage' => $usuario?->hasPermission('domain.manage') ?? false,
        ]);
    }

    public function store(Request $request, string $entity)
    {
        $config = $this->resolveEntity($entity);
        $validated = $request->validate($this->rules($entity, true));

        if ($entity === 'areas') {
            $validated = $this->geocodeAreaCoordinates($validated);
        }

        if (isset($validated['senha'])) {
            $validated['senha'] = Hash::make($validated['senha']);
        }

        if ($entity === 'perfis' && isset($validated['permissoes'])) {
            $validated['permissoes'] = array_filter(array_map(
                'trim',
                explode(',', $validated['permissoes'])
            ));
        }

        $record = ($config['model'])::create($validated);

        if ($request->expectsJson()) {
            return response()->json(['data' => $record], 201);
        }

        return redirect()
            ->route('siga.domain.index', ['entity' => $entity])
            ->with('success', 'Registro criado com sucesso.');
    }

    public function update(Request $request, string $entity, int $id)
    {
        $config = $this->resolveEntity($entity);
        $record = ($config['model'])::query()->findOrFail($id);
        $validated = $request->validate($this->rules($entity, false));

        if ($entity === 'areas') {
            $validated = $this->geocodeAreaCoordinates($validated, $record);
        }

        if (array_key_exists('senha', $validated) && filled($validated['senha'])) {
            $validated['senha'] = Hash::make($validated['senha']);
        } else {
            unset($validated['senha']);
        }

        if ($entity === 'perfis' && array_key_exists('permissoes', $validated)) {
            $validated['permissoes'] = array_filter(array_map(
                'trim',
                explode(',', $validated['permissoes'])
            ));
        }

        $record->update($validated);

        if ($request->expectsJson()) {
            return response()->json(['data' => $record->fresh()]);
        }

        return redirect()
            ->route('siga.domain.index', ['entity' => $entity])
            ->with('success', 'Registro atualizado com sucesso.');
    }

    private function geocodeAreaCoordinates(array $validated, ?Area $area = null): array
    {
        $latitude = $validated['latitude'] ?? $area?->latitude;
        $longitude = $validated['longitude'] ?? $area?->longitude;
        $address = $validated['localizacao'] ?? $area?->localizacao;

        if (
            (! is_numeric($latitude) || ! is_numeric($longitude))
            && is_string($address)
            && trim($address) !== ''
        ) {
            try {
                $response = Http::acceptJson()
                    ->withHeaders(['User-Agent' => 'SIGA-IoT/1.0'])
                    ->timeout(8)
                    ->get('https://nominatim.openstreetmap.org/search', [
                        'q' => $address,
                        'format' => 'json',
                        'limit' => 1,
                        'countrycodes' => 'br',
                    ]);

                if ($response->successful()) {
                    $result = $response->json('0');
                    if (is_array($result) && is_numeric($result['lat'] ?? null) && is_numeric($result['lon'] ?? null)) {
                        $validated['latitude'] = (float) $result['lat'];
                        $validated['longitude'] = (float) $result['lon'];
                    }
                }
            } catch (\Throwable) {
                // The address remains usable; coordinates can be informed manually later.
            }
        }

        return $validated;
    }

    public function destroy(Request $request, string $entity, int $id)
    {
        $config = $this->resolveEntity($entity);
        ($config['model'])::query()->findOrFail($id)->delete();

        if ($request->expectsJson()) {
            return response()->json(['message' => 'Registro removido com sucesso.']);
        }

        return redirect()
            ->route('siga.domain.index', ['entity' => $entity])
            ->with('success', 'Registro removido com sucesso.');
    }

    public function apiIndex(string $entity): JsonResponse
    {
        $config = $this->resolveEntity($entity);

        return response()->json([
            'data' => ($config['model'])::query()->paginate(15),
        ]);
    }
}
