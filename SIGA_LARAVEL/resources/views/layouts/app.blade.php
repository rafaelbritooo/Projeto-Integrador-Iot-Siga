
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title>@yield('title', 'SIGA - Monitoramento Inteligente')</title>

    <link rel="stylesheet" href="{{ asset('css/siga.css') }}">

    <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
    />
    @stack('styles')
</head>

<body>

    <div class="siga-layout">

        @include('components.sidebar')

        <main class="siga-main">

            @include('components.header')

            <section class="siga-content">
                @yield('content')
            </section>

        </main>

    </div>

    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <script src="{{ asset('js/siga-navigation.js') }}"></script>
    <script src="{{ asset('js/siga.js') }}"></script>
    <script src="{{ asset('js/siga-pages.js') }}"></script>
    @stack('scripts')

</body>
</html>
