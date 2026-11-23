@extends('layouts.app')

@section('title', $config['label'].' · SIGA')
@section('page-title', 'Cadastro')
@section('page-description', 'Gestão organizada das entidades operacionais e administrativas do sistema.')

@section('content')

    <div class="domain-layout">
        <nav class="domain-menu" aria-label="Entidades cadastráveis">
            @foreach ($entities as $slug => $item)
                <a class="{{ $slug === $entity ? 'active' : '' }}" href="{{ route('siga.domain.index', ['entity' => $slug]) }}">
                    {{ $item['label'] }}
                </a>
            @endforeach
        </nav>

        <section class="domain-panel">
            @if (session('success'))
                <div class="domain-alert">{{ session('success') }}</div>
            @endif

            <h1 style="font-size:20px;margin:0 0 16px">{{ $config['label'] }}</h1>

            @if ($canManage)
            <form id="domain-create-form" method="POST" action="{{ route('siga.domain.store', ['entity' => $entity]) }}" class="domain-form">
                @csrf
                @foreach ($fields as [$name, $label, $type, $required])
                    <div class="domain-field">
                        <label for="create-{{ $name }}">{{ $label }}</label>
                        @if (str_starts_with($type, 'select:'))
                            @php
                                [, $targetEntity] = explode(':', $type);
                            @endphp
                            <select id="create-{{ $name }}" name="{{ $name }}" @required($required)>
                                <option value="">Selecione...</option>
                                @foreach (($selectOptions[$targetEntity] ?? []) as $value => $text)
                                    <option value="{{ $value }}">{{ $text }}</option>
                                @endforeach
                            </select>
                        @else
                            <input id="create-{{ $name }}" name="{{ $name }}" type="{{ $type }}" value="{{ old($name) }}" @required($required)>
                        @endif
                    </div>
                @endforeach
                <div class="domain-actions">
                    <button class="domain-button domain-primary" type="submit">Adicionar</button>
                </div>
            </form>
            @endif

            @if ($errors->any())
                <div class="domain-alert" style="background:#fef2f2;color:#991b1b;border-color:#fecaca">
                    {{ $errors->first() }}
                </div>
            @endif

            <div class="domain-table-wrap">
                <table class="domain-table">
                    <thead>
                        <tr>
                            @foreach ($fields as [, $label])
                                <th>{{ $label }}</th>
                            @endforeach
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        @forelse ($records as $record)
                            <tr>
                                @foreach ($fields as [$name, $label, $type])
                                    <td>
                                        @if ($type === 'password')
                                            ••••••••
                                        @elseif ($name === 'permissoes')
                                            {{ is_array($record->{$name}) ? implode(', ', $record->{$name}) : $record->{$name} }}
                                        @elseif (str_starts_with($type, 'datetime'))
                                            {{ optional($record->{$name})->format('d/m/Y H:i') }}
                                        @elseif ($type === 'date')
                                            {{ optional($record->{$name})->format('d/m/Y') }}
                                        @else
                                            {{ $record->{$name} }}
                                        @endif
                                    </td>
                                @endforeach
                                @if ($canManage)
                                <td>
                                    <div class="domain-row-actions">
                                        <button
                                            type="button"
                                            class="domain-button domain-primary"
                                            onclick='openDomainEdit(@json($record), @json($entity), @json($config["key"]), @json(route("siga.domain.update", ["entity" => $entity, "id" => "__ID__"])))'
                                        >Editar</button>
                                        <form method="POST" action="{{ route('siga.domain.destroy', ['entity' => $entity, 'id' => $record->{$config['key']}]) }}" onsubmit="return confirm('Deseja remover este registro?')">
                                            @csrf
                                            @method('DELETE')
                                            <button type="submit" class="domain-button domain-danger">Excluir</button>
                                        </form>
                                    </div>
                                </td>
                                @else
                                <td><span style="color:#64748b">Somente consulta</span></td>
                                @endif
                            </tr>
                        @empty
                            <tr><td colspan="{{ count($fields) + 1 }}">Nenhum registro cadastrado.</td></tr>
                        @endforelse
                    </tbody>
                </table>
            </div>

            <div style="margin-top:16px">{{ $records->links() }}</div>
        </section>
    </div>

    <dialog id="domain-edit-dialog" style="border:1px solid #cbd5e1;border-radius:12px;width:min(760px,calc(100vw - 30px));padding:20px">
        <form id="domain-edit-form" method="POST" class="domain-form">
            @csrf
            @method('PUT')
            @foreach ($fields as [$name, $label, $type, $required])
                <div class="domain-field">
                    <label for="edit-{{ $name }}">{{ $label }}</label>
                    @if (str_starts_with($type, 'select:'))
                        @php
                            [, $targetEntity] = explode(':', $type);
                        @endphp
                        <select id="edit-{{ $name }}" name="{{ $name }}" @required($required)>
                            <option value="">Selecione...</option>
                            @foreach (($selectOptions[$targetEntity] ?? []) as $value => $text)
                                <option value="{{ $value }}">{{ $text }}</option>
                            @endforeach
                        </select>
                    @else
                        <input id="edit-{{ $name }}" name="{{ $name }}" type="{{ $type }}" @required($required)>
                    @endif
                </div>
            @endforeach
            <div class="domain-actions">
                <button type="button" class="domain-button" onclick="document.getElementById('domain-edit-dialog').close()">Cancelar</button>
                <button type="submit" class="domain-button domain-primary">Salvar</button>
            </div>
        </form>
    </dialog>

    <script>
        function openDomainEdit(record, entity, key, updateTemplate) {
            const dialog = document.getElementById('domain-edit-dialog');
            const form = document.getElementById('domain-edit-form');
            form.action = updateTemplate.replace('__ID__', record[key]);

            @foreach ($fields as [$name, $label, $type])
                const edit{{ $name }} = document.getElementById('edit-{{ $name }}');
                if (edit{{ $name }}) {
                    edit{{ $name }}.value = record['{{ $name }}'] ?? '';
                    if (edit{{ $name }}.type === 'password') edit{{ $name }}.value = '';
                    @if ($name === 'permissoes')
                    if (Array.isArray(record['permissoes'])) {
                        edit{{ $name }}.value = record['permissoes'].join(', ');
                    }
                    @endif
                }
            @endforeach

            dialog.showModal();
        }
    </script>
@endsection
