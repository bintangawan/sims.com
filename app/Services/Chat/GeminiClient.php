<?php

namespace App\Services\Chat;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GeminiClient
{
    private string $apiKey;
    private string $baseUrl;
    private string $model;
    private int $maxTokens;
    private float $temperature;
    private float $topP;
    private int $topK;

    public function __construct()
    {
        // Semua config dari .env (boleh juga via config/services.php jika kamu mau)
        $this->apiKey      = (string) env('GEMINI_API_KEY', '');
        $this->baseUrl     = rtrim((string) env('GEMINI_BASE_URL', 'https://generativelanguage.googleapis.com/v1beta'), '/');
        $this->model       = (string) env('GEMINI_MODEL', 'gemini-pro');
        $this->maxTokens   = (int) env('GEMINI_MAX_TOKENS', 1000);
        $this->temperature = (float) env('GEMINI_TEMPERATURE', 0.7);
        $this->topP        = (float) env('GEMINI_TOP_P', 0.8);
        $this->topK        = (int) env('GEMINI_TOP_K', 40);

        if (!$this->apiKey) {
            throw new \Exception('GEMINI_API_KEY tidak ditemukan di environment variables');
        }
    }

    /**
     * Backward-compat helper: kirim single prompt tanpa tools.
     * Tetap gunakan generate() di bawahnya.
     */
    public function sendMessage(string $message, string $context = '', array $history = []): string
    {
        try {
            $contents = $this->buildContents($message, $context, $history);

            $resp = $this->generate(
                contents: $contents,
                tools: [],
                toolConfig: [],
                generationConfig: [] // pakai default dari env
            );

            $text = $this->extractText($resp);
            if ($text !== null) return $text;

            Log::warning('GeminiClient sendMessage: no text in response', ['response' => $resp]);
            return $this->getFallbackResponse();

        } catch (\Exception $e) {
            Log::error('GeminiClient sendMessage error: ' . $e->getMessage(), [
                'message' => $message,
                'context' => $context,
            ]);
            return $this->getFallbackResponse();
        }
    }

    /**
     * API utama untuk ChatController (fase 1).
     * - Menerima contents (array role/parts)
     * - Opsional tools & toolConfig untuk function-calling
     * - Opsional override generationConfig
     * - Mengembalikan array response mentah dari Gemini
     */
    public function generate(
        array $contents,
        array $tools = [],
        array $toolConfig = [],
        array $generationConfig = []
    ): array {
        $url = "{$this->baseUrl}/models/{$this->model}:generateContent?key={$this->apiKey}";

        $payload = [
            'contents'          => $contents,
            'generationConfig'  => $this->mergeGenerationConfig($generationConfig),
            'safetySettings'    => $this->defaultSafetySettings(),
        ];

        if (!empty($tools)) {
            $payload['tools'] = $tools;
        }
        if (!empty($toolConfig)) {
            $payload['toolConfig'] = $toolConfig;
        }

        $response = Http::timeout(45)
            ->withHeaders(['Content-Type' => 'application/json'])
            ->post($url, $payload);

        if (!$response->successful()) {
            Log::error('Gemini API Error (generate)', [
                'status'  => $response->status(),
                'body'    => $response->body(),
                'payload' => $payload,
            ]);
            throw new \Exception('Gagal mendapatkan respons dari Gemini API (generate)');
        }

        return (array) $response->json();
    }

    /**
     * API utama untuk ChatController (fase 2).
     * - Mengirim ulang contents + blok toolResponses (hasil eksekusi fungsi)
     * - Mengembalikan array response mentah dari Gemini
     */
    public function generateWithToolResponse(
        array $contents,
        array $toolResponses,
        array $generationConfig = []
    ): array {
        $url = "{$this->baseUrl}/models/{$this->model}:generateContent?key={$this->apiKey}";

        $payload = [
            'contents'         => $contents,
            'toolResponses'    => $toolResponses,
            'generationConfig' => $this->mergeGenerationConfig($generationConfig),
            'safetySettings'   => $this->defaultSafetySettings(),
        ];

        $response = Http::timeout(45)
            ->withHeaders(['Content-Type' => 'application/json'])
            ->post($url, $payload);

        if (!$response->successful()) {
            Log::error('Gemini API Error (generateWithToolResponse)', [
                'status'  => $response->status(),
                'body'    => $response->body(),
                'payload' => $payload,
            ]);
            throw new \Exception('Gagal mendapatkan respons dari Gemini API (generateWithToolResponse)');
        }

        return (array) $response->json();
    }

    /** =================== UTILITIES =================== */

    /**
     * Bangun contents dari context + history + current message.
     */
    private function buildContents(string $message, string $context = '', array $history = []): array
    {
        $contents = [];

        if (!empty($context)) {
            // Tidak ada role "system" di Gemini; kita masukkan ke user turn pertama
            $contents[] = [
                'role'  => 'user',
                'parts' => [[
                    'text' => "SYSTEM CONTEXT:\n{$context}\n\nIkuti konteks ini pada semua jawaban."
                ]]
            ];
            // (opsional) balasan model pseudo-ack; tidak wajib
            $contents[] = [
                'role'  => 'model',
                'parts' => [[
                    'text' => 'Dipahami.'
                ]]
            ];
        }

        foreach ($history as $item) {
            // Harus sudah dalam format: ['role'=>'user'|'model','parts'=>[['text'=>...]]]
            if (isset($item['role'], $item['parts'])) {
                $contents[] = $item;
            }
        }

        $contents[] = [
            'role'  => 'user',
            'parts' => [['text' => $message]]
        ];

        return $contents;
    }

    /**
     * Gabungkan config bawaan (env) dengan override.
     */
    private function mergeGenerationConfig(array $override): array
    {
        $base = [
            'temperature'     => $this->temperature,
            'maxOutputTokens' => $this->maxTokens,
            'topP'            => $this->topP,
            'topK'            => $this->topK,
        ];

        // Filter null agar tidak override dengan null
        $override = array_filter($override, fn ($v) => $v !== null);

        return array_merge($base, $override);
    }

    /**
     * Safety settings default (boleh kamu sesuaikan bila perlu).
     */
    private function defaultSafetySettings(): array
    {
        return [
            [
                'category'  => 'HARM_CATEGORY_HARASSMENT',
                'threshold' => 'BLOCK_MEDIUM_AND_ABOVE',
            ],
            [
                'category'  => 'HARM_CATEGORY_HATE_SPEECH',
                'threshold' => 'BLOCK_MEDIUM_AND_ABOVE',
            ],
            [
                'category'  => 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
                'threshold' => 'BLOCK_MEDIUM_AND_ABOVE',
            ],
            [
                'category'  => 'HARM_CATEGORY_DANGEROUS_CONTENT',
                'threshold' => 'BLOCK_MEDIUM_AND_ABOVE',
            ],
        ];
    }

    /**
     * Ambil text pertama dari response (kalau ada).
     */
    private function extractText(array $resp): ?string
    {
        foreach (($resp['candidates'] ?? []) as $cand) {
            $parts = data_get($cand, 'content.parts', []);
            foreach ($parts as $p) {
                if (isset($p['text'])) {
                    return $p['text'];
                }
            }
        }
        return null;
    }

    private function getFallbackResponse(): string
    {
        $fallbackResponses = [
            'Maaf, saya sedang mengalami gangguan. Silakan coba lagi dalam beberapa saat.',
            'Sistem chatbot sedang dalam pemeliharaan. Mohon hubungi admin untuk bantuan lebih lanjut.',
            'Terjadi kesalahan teknis. Silakan refresh halaman dan coba lagi.',
        ];

        return $fallbackResponses[array_rand($fallbackResponses)];
    }

    /** =================== UTIL (opsional) =================== */

    public function testConnection(): array
    {
        try {
            $resp = $this->generate(
                contents: [[
                    'role'  => 'user',
                    'parts' => [[ 'text' => 'Halo! Balas dengan: "Koneksi berhasil".' ]]
                ]]
            );

            return [
                'success'  => true,
                'response' => $this->extractText($resp),
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'error'   => $e->getMessage(),
            ];
        }
    }

    public function getConfig(): array
    {
        return [
            'model'       => $this->model,
            'max_tokens'  => $this->maxTokens,
            'temperature' => $this->temperature,
            'top_p'       => $this->topP,
            'top_k'       => $this->topK,
            'base_url'    => $this->baseUrl,
            'api_key_set' => !empty($this->apiKey),
        ];
    }
}
