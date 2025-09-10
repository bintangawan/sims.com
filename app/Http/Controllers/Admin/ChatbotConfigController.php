<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ChatConfig;
use App\Services\Chat\GeminiClient;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class ChatbotConfigController extends Controller
{
    public function index()
    {
        $configs = [
            'api_key' => ChatConfig::getValue('gemini_api_key', ''),
            'model' => ChatConfig::getValue('gemini_model', 'gemini-pro'),
            'temperature' => ChatConfig::getValue('temperature', 0.7),
            'max_tokens' => ChatConfig::getValue('max_tokens', 1000),
            'system_prompt' => ChatConfig::getValue('system_prompt', 'Anda adalah asisten AI untuk Sistem Informasi Manajemen Sekolah (SIMS).'),
            'grounding_docs' => ChatConfig::getValue('grounding_docs', []),
            'faq_data' => ChatConfig::getValue('faq_data', []),
            'enabled' => ChatConfig::getValue('chatbot_enabled', true),
        ];

        return Inertia::render('Admin/ChatbotConfig', [
            'configs' => $configs,
            'status' => session('status'),
        ]);
    }

    public function update(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'api_key' => 'required|string|min:10',
            'model' => 'required|string|in:gemini-pro,gemini-pro-vision',
            'temperature' => 'required|numeric|min:0|max:2',
            'max_tokens' => 'required|integer|min:100|max:4000',
            'system_prompt' => 'required|string|min:10',
            'grounding_docs' => 'nullable|array',
            'grounding_docs.*' => 'string',
            'faq_data' => 'nullable|array',
            'faq_data.*.question' => 'required_with:faq_data|string',
            'faq_data.*.answer' => 'required_with:faq_data|string',
            'enabled' => 'required|boolean',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        try {
            // Save configurations
            ChatConfig::setValue('gemini_api_key', $request->api_key);
            ChatConfig::setValue('gemini_model', $request->model);
            ChatConfig::setValue('temperature', $request->temperature);
            ChatConfig::setValue('max_tokens', $request->max_tokens);
            ChatConfig::setValue('system_prompt', $request->system_prompt);
            ChatConfig::setValue('grounding_docs', $request->grounding_docs ?? []);
            ChatConfig::setValue('faq_data', $request->faq_data ?? []);
            ChatConfig::setValue('chatbot_enabled', $request->enabled);

            return back()->with('status', 'Konfigurasi chatbot berhasil diperbarui.');
        } catch (\Exception $e) {
            Log::error('Error updating chatbot config: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Gagal memperbarui konfigurasi.']);
        }
    }

    public function test(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'message' => 'required|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Pesan test diperlukan.',
            ], 422);
        }

        try {
            $geminiClient = new GeminiClient();
            $response = $geminiClient->sendMessage($request->message, 'admin');

            return response()->json([
                'success' => true,
                'response' => $response,
                'message' => 'Test berhasil! Chatbot merespons dengan baik.',
            ]);
        } catch (\Exception $e) {
            Log::error('Chatbot test failed: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Test gagal: ' . $e->getMessage(),
            ], 500);
        }
    }
}