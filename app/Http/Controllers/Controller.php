<?php

namespace App\Http\Controllers;

use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Foundation\Validation\ValidatesRequests;
use Illuminate\Routing\Controller as BaseController;
use Illuminate\Support\Facades\Auth;

abstract class Controller extends BaseController
{
    use AuthorizesRequests, ValidatesRequests;
    
    /**
     * Get current authenticated user
     */
    protected function getCurrentUser()
    {
        return Auth::user();
    }
    
    /**
     * Get current user role
     */
    protected function getCurrentUserRole()
    {
        $user = $this->getCurrentUser();
        return $user ? $user->roles->first()->name ?? null : null;
    }
    
    /**
     * Check if current user has specific role
     */
    protected function hasRole($role)
    {
        $user = $this->getCurrentUser();
        return $user ? $user->hasRole($role) : false;
    }
    
    /**
     * Get current active term
     */
    protected function getCurrentTerm()
    {
        return \App\Models\Term::where('aktif', true)->first();
    }
    
    /**
     * Format response for API endpoints
     */
    protected function apiResponse($data = null, $message = 'Success', $status = 200)
    {
        return response()->json([
            'success' => $status >= 200 && $status < 300,
            'message' => $message,
            'data' => $data
        ], $status);
    }
    
    /**
     * Format error response for API endpoints
     */
    protected function apiError($message = 'Error', $status = 400, $errors = null)
    {
        $response = [
            'success' => false,
            'message' => $message
        ];
        
        if ($errors) {
            $response['errors'] = $errors;
        }
        
        return response()->json($response, $status);
    }
}
