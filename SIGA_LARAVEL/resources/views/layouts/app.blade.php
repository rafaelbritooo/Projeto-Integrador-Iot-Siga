
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title>@yield('title', 'SIGA - Monitoramento Inteligente')</title>

    <link rel="stylesheet" href="{{ asset('css/siga.css') }}">

    <!-- Leaflet -->
    <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
    />

    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>

    <!-- Chart.js -->
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
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

    <script src="{{ asset('js/siga.js') }}"></script>

    @stack('scripts')

</body>
</html>
