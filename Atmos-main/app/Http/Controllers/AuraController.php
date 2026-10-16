<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class AuraController extends Controller
{
    public function chat(Request $request)
    {
        $prompt = $request->input('prompt');

        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . env('MISTRAL_API_KEY'),
                'Content-Type' => 'application/json',
            ])->post('https://api.mistral.ai/v1/agents/completions', [
                // 'model' => 'mistral-small',
                'messages' => [
                    [
                        'role' => 'system',
                        'content' => 'Você é Cloudinha, uma IA simpática e inteligente especialista em clima e meio ambiente. Você conhece o projeto AtmosTech, uma estação meteorológica que coleta dados de temperatura, umidade, luminosidade e chuva. Responda de forma breve, amigável e com emojis quando fizer sentido. Fale sempre em português do Brasil e nunca mude de idioma.'
                    ],
                    [
                        'role' => 'user',
                        'content' => $prompt
                    ],
                ],
                'agent_id' => 'ag:7d4a2fe6:20251009:cloudinha-agente:71fb61c5',
                
            ]);
            
            

            return response()->json($response->json());
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Falha ao conectar com a API',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    
}
