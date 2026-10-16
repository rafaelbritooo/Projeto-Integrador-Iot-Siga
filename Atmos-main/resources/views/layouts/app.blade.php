<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🌤 Estação Meteorológica</title>

    <!-- Bootstrap -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">

    <!-- ApexCharts -->
    <script src="https://cdn.jsdelivr.net/npm/apexcharts"></script>

    <!-- Chart.js -->
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>

    <!-- jQuery -->
    <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>

    <style>
        /* === Cloudinha === */
        .cloudinha-btn {
            position: fixed;
            top: 80px;
            right: 25px;
            font-size: 30px;
            border-radius: 50%;
            width: 60px;
            height: 60px;
            background: #ffffff;
            color: #3a7bd5;
            box-shadow: 0 4px 10px rgba(0,0,0,0.15);
            border: none;
            transition: all 0.3s ease;
            z-index: 1055;
            cursor: grab;
        }
        .cloudinha-btn:active {
            cursor: grabbing;
        }
        .chat-bubble {
            word-wrap: break-word;
            max-width: 80%;
            padding: 12px 16px;
            border-radius: 20px;
            margin-bottom: 10px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }
        .user {
            margin-left: auto;
            background: #0d6efd;
            color: #fff;
        }
        .aura {
            background: #ffffff;
            border: 1px solid #d1d9e6;
        }
    </style>
</head>
<body class="bg-light">

<!-- Navbar -->
<nav class="navbar navbar-expand-lg navbar-dark" style="background-color:#3983ce; box-shadow:0 2px 6px rgba(0,0,0,0.2);">
    <div class="container">
        <a class="navbar-brand fw-bold" href="{{ route('sensor.dashboard') }}">🌤 Atmostech</a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span class="navbar-toggler-icon"></span>
        </button>

        <div class="collapse navbar-collapse" id="navbarNav">
            <ul class="navbar-nav ms-auto">
                 <li class="nav-item"><a class="nav-link" href="{{ route('sensor.sobre') }}">💡Sobre Nós</a></li>
            <li class="nav-item"><a class="nav-link" href="{{ route('sensor.gauges') }}">📊 Gauges</a></li>
            <li class="nav-item"><a class="nav-link" href="{{ route('sensor.historico') }}">📈 Histórico</a></li>
            <li class="nav-item"><a class="nav-link" href="{{ route('sensor.tabela') }}">🗂 Tabela</a></li>
            <li class="nav-item"><a class="nav-link" href="{{ route('weather.news') }}">📰 Notícias do Clima</a></li>
            <li class="nav-item"><a class="nav-link" href="{{ route('weather.map') }}">🗺️ Mapa Interativo</a></li>
            <li class="nav-item"><a class="nav-link" href="{{ route('compare.index') }}">📋 Comparar Leituras</a></li>
            <li class="nav-item"><a class="nav-link" href="{{ route('IA.cloudinha') }}">✨Cloudinha IA</a></li>
        </ul>
        </div>
    </div>
</nav>

<!-- Conteúdo -->
<main class="container py-4">
    @yield('content')
</main>

<!-- === Botão flutuante da Cloudinha === -->
<button type="button" class="cloudinha-btn" data-bs-toggle="modal" data-bs-target="#cloudinhaModal">
    ☁️
</button>

<!-- === Modal da Cloudinha === -->
<div class="modal fade" id="cloudinhaModal" tabindex="-1" aria-labelledby="cloudinhaModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content border-0 rounded-4 shadow">
            <div class="modal-header bg-primary text-white rounded-top">
                <h5 class="modal-title" id="cloudinhaModalLabel">🌤️ Chat com Cloudinha</h5>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Fechar"></button>
            </div>
            <div class="modal-body p-0">
                <div class="p-3" id="chat-box" style="height:400px; overflow-y:auto;">
                    <div class="chat-bubble aura p-3 mb-2 rounded-3 bg-light">
                        Oi! Eu sou a Cloudinha ☁️. Pergunte algo sobre o clima, tempo ou curiosidades!
                    </div>
                </div>
            </div>
            <div class="modal-footer d-flex">
                <input id="prompt" type="text" placeholder="Pergunte algo à Cloudinha..." class="form-control me-2">
                <button id="send" class="btn btn-primary">Enviar</button>
            </div>
        </div>
    </div>
</div>

<!-- Bootstrap JS -->
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script>

<!-- === Script do Chat Cloudinha === -->
<script>
document.addEventListener('DOMContentLoaded', () => {
    const sendBtn = document.getElementById('send');
    const promptInput = document.getElementById('prompt');
    const chatBox = document.getElementById('chat-box');

    async function sendMessage() {
        const prompt = promptInput.value.trim();
        if (!prompt) return;

        const userMsg = document.createElement('div');
        userMsg.className = 'chat-bubble user p-3 mb-2 rounded-3 text-white bg-primary text-end';
        userMsg.textContent = prompt;
        chatBox.appendChild(userMsg);
        chatBox.scrollTop = chatBox.scrollHeight;
        promptInput.value = '';

        try {
            const response = await fetch('/cloudinha', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': '{{ csrf_token() }}'
                },
                body: JSON.stringify({ prompt })
            });

            const data = await response.json();
            const reply = data?.choices?.[0]?.message?.content ?? '⚠️ Erro ao obter resposta.';

            const auraMsg = document.createElement('div');
            auraMsg.className = 'chat-bubble aura p-3 mb-2 rounded-3 bg-light';
            auraMsg.textContent = reply;
            chatBox.appendChild(auraMsg);
            chatBox.scrollTop = chatBox.scrollHeight;
        } catch (err) {
            const auraMsg = document.createElement('div');
            auraMsg.className = 'chat-bubble aura p-3 mb-2 rounded-3 bg-light';
            auraMsg.textContent = '⚠️ Erro: ' + err.message;
            chatBox.appendChild(auraMsg);
        }
    }

    sendBtn.addEventListener('click', sendMessage);
    promptInput.addEventListener('keypress', e => {
        if (e.key === 'Enter') sendMessage();
    });

    // === Botão Cloudinha arrastável ===
    const cloudBtn = document.querySelector('.cloudinha-btn');
    let isDragging = false, offsetX = 0, offsetY = 0;

    cloudBtn.addEventListener('mousedown', e => {
        isDragging = true;
        offsetX = e.clientX - cloudBtn.offsetLeft;
        offsetY = e.clientY - cloudBtn.offsetTop;
        cloudBtn.style.transition = 'none';
    });
    document.addEventListener('mousemove', e => {
        if(!isDragging) return;
        let x = e.clientX - offsetX;
        let y = e.clientY - offsetY;
        x = Math.max(0, Math.min(window.innerWidth - cloudBtn.offsetWidth, x));
        y = Math.max(0, Math.min(window.innerHeight - cloudBtn.offsetHeight, y));
        cloudBtn.style.left = x + 'px';
        cloudBtn.style.top = y + 'px';
    });
    document.addEventListener('mouseup', () => {
        if(isDragging) {
            isDragging = false;
            cloudBtn.style.transition = 'all 0.3s ease';
        }
    });

    // touch devices
    cloudBtn.addEventListener('touchstart', e => {
        isDragging = true;
        const touch = e.touches[0];
        offsetX = touch.clientX - cloudBtn.offsetLeft;
        offsetY = touch.clientY - cloudBtn.offsetTop;
    });
    document.addEventListener('touchmove', e => {
        if(!isDragging) return;
        const touch = e.touches[0];
        let x = touch.clientX - offsetX;
        let y = touch.clientY - offsetY;
        x = Math.max(0, Math.min(window.innerWidth - cloudBtn.offsetWidth, x));
        y = Math.max(0, Math.min(window.innerHeight - cloudBtn.offsetHeight, y));
        cloudBtn.style.left = x + 'px';
        cloudBtn.style.top = y + 'px';
    });
    document.addEventListener('touchend', () => { isDragging = false; });
});
</script>

@yield('scripts')
</body>
</html>
