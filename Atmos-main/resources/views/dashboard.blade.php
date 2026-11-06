<!doctype html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>SIGA - Sistema Inteligente</title>
    @vite('resources/js/siga/main.tsx')
</head>
<body>
    <div id="root"></div>
</body>
</html>
