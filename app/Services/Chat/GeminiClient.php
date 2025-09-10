<?php

namespace App\Services\Chat;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use App\Models\ChatConfig;

class GeminiClient
{
    private $apiKey;
    private $baseUrl;
    private $model;
    private $maxTokens;
    private $temperature;

    public function __construct()
    {
        $this->apiKey = env('GEMINI_API_KEY');
        $this->baseUrl = 'https://generativelanguage.googleapis.com/v1beta';
        $this->model = 'gemini-pro';
        $this->maxTokens = ChatConfig::getValue('gemini.max_tokens', 1000);
        $this->temperature = ChatConfig::getValue('gemini.temperature', 0.7);
        
        if (!$this->apiKey) {
            throw new \Exception('GEMINI_API_KEY tidak ditemukan di environment variables');
        }
    }

    public function sendMessage($message, $context = '', $history = [])
    {
        try {
            $url = "{$this->baseUrl}/models/{$this->model}:generateContent";
            
            // Build the request payload
            $contents = [];
            
            // Add system context as first message if provided
            if (!empty($context)) {
                $contents[] = [
                    'role' => 'user',
                    'parts' => [['text' => "SYSTEM CONTEXT: {$context}\n\nMohon ikuti konteks ini dalam semua respons Anda."]]
                ];
                $contents[] = [
                    'role' => 'model',
                    'parts' => [['text' => 'Saya memahami konteks yang diberikan dan akan mengikutinya dalam respons saya.']]
                ];
            }
            
            // Add conversation history
            foreach ($history as $historyItem) {
                $contents[] = $historyItem;
            }
            
            // Add current message
            $contents[] = [
                'role' => 'user',
                'parts' => [['text' => $message]]
            ];

            $payload = [
                'contents' => $contents,
                'generationConfig' => [
                    'temperature' => $this->temperature,
                    'maxOutputTokens' => $this->maxTokens,
                    'topP' => 0.8,
                    'topK' => 40
                ],
                'safetySettings' => [
                    [
                        'category' => 'HARM_CATEGORY_HARASSMENT',
                        'threshold' => 'BLOCK_MEDIUM_AND_ABOVE'
                    ],
                    [
                        'category' => 'HARM_CATEGORY_HATE_SPEECH',
                        'threshold' => 'BLOCK_MEDIUM_AND_ABOVE'
                    ],
                    [
                        'category' => 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
                        'threshold' => 'BLOCK_MEDIUM_AND_ABOVE'
                    ],
                    [
                        'category' => 'HARM_CATEGORY_DANGEROUS_CONTENT',
                        'threshold' => 'BLOCK_MEDIUM_AND_ABOVE'
                    ]
                ]
            ];

            $response = Http::timeout(30)
                ->withHeaders([
                    'Content-Type' => 'application/json',
                ])
                ->post($url, $payload + ['key' => $this->apiKey]);

            if (!$response->successful()) {
                Log::error('Gemini API Error', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                    'payload' => $payload
                ]);
                
                throw new \Exception('Gagal mendapatkan respons dari Gemini API: ' . $response->body());
            }

            $data = $response->json();
            
            if (!isset($data['candidates'][0]['content']['parts'][0]['text'])) {
                Log::error('Unexpected Gemini response format', ['response' => $data]);
                throw new \Exception('Format respons Gemini tidak sesuai');
            }

            return $data['candidates'][0]['content']['parts'][0]['text'];
            
        } catch (\Exception $e) {
            Log::error('GeminiClient error: ' . $e->getMessage(), [
                'message' => $message,
                'context' => $context
            ]);
            
            // Return fallback response
            return $this->getFallbackResponse();
        }
    }

    public function testConnection()
    {
        try {
            $response = $this->sendMessage(
                'Halo, ini adalah tes koneksi. Mohon balas dengan "Koneksi berhasil".',
                'Anda adalah asisten AI untuk SIMS. Jawab dengan singkat dan jelas.'
            );
            
            return [
                'success' => true,
                'message' => 'Koneksi ke Gemini API berhasil',
                'response' => $response
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => 'Koneksi ke Gemini API gagal: ' . $e->getMessage()
            ];
        }
    }

    public function generateRubric($subject, $assignmentType, $criteria = [])
    {
        $prompt = "Buatkan rubrik penilaian untuk tugas {$assignmentType} mata pelajaran {$subject}.";
        
        if (!empty($criteria)) {
            $prompt .= " Kriteria yang harus dinilai: " . implode(', ', $criteria) . ".";
        }
        
        $prompt .= " Format rubrik dengan 4 level: Sangat Baik (90-100), Baik (80-89), Cukup (70-79), Kurang (0-69). Berikan deskripsi untuk setiap level dan kriteria.";
        
        $context = "Anda adalah asisten AI untuk guru. Buatkan rubrik penilaian yang komprehensif dan mudah dipahami.";
        
        return $this->sendMessage($prompt, $context);
    }

    public function summarizeContent($content, $maxLength = 200)
    {
        $prompt = "Ringkas konten berikut dalam maksimal {$maxLength} kata:\n\n{$content}";
        $context = "Anda adalah asisten AI yang membantu meringkas materi pembelajaran. Buat ringkasan yang informatif dan mudah dipahami.";
        
        return $this->sendMessage($prompt, $context);
    }

    public function generateAnnouncement($topic, $target, $tone = 'formal')
    {
        $prompt = "Buatkan pengumuman tentang '{$topic}' untuk {$target} dengan nada {$tone}. Pengumuman harus jelas, informatif, dan sesuai dengan konteks sekolah.";
        $context = "Anda adalah asisten AI untuk membuat pengumuman sekolah. Gunakan bahasa Indonesia yang baik dan benar.";
        
        return $this->sendMessage($prompt, $context);
    }

    private function getFallbackResponse()
    {
        $fallbackResponses = [
            'Maaf, saya sedang mengalami gangguan. Silakan coba lagi dalam beberapa saat.',
            'Sistem chatbot sedang dalam pemeliharaan. Mohon hubungi admin untuk bantuan lebih lanjut.',
            'Terjadi kesalahan teknis. Silakan refresh halaman dan coba lagi.',
        ];
        
        return $fallbackResponses[array_rand($fallbackResponses)];
    }

    public function updateConfig($config)
    {
        if (isset($config['max_tokens'])) {
            $this->maxTokens = $config['max_tokens'];
            ChatConfig::setValue('gemini.max_tokens', $config['max_tokens']);
        }
        
        if (isset($config['temperature'])) {
            $this->temperature = $config['temperature'];
            ChatConfig::setValue('gemini.temperature', $config['temperature']);
        }
        
        return true;
    }

    public function getConfig()
    {
        return [
            'model' => $this->model,
            'max_tokens' => $this->maxTokens,
            'temperature' => $this->temperature,
            'api_key_configured' => !empty($this->apiKey)
        ];
    }
}