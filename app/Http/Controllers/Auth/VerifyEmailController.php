<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Auth\Events\Verified;
use Illuminate\Foundation\Auth\EmailVerificationRequest;
use Illuminate\Http\RedirectResponse;

class VerifyEmailController extends Controller
{
    /**
     * Mark the authenticated user's email address as verified.
     */
    public function __invoke(EmailVerificationRequest $request): RedirectResponse
    {
        if ($request->user()->hasVerifiedEmail()) {
            $user = $request->user();
            
            if ($user->hasRole('admin')) {
                return redirect()->intended(route('admin.dashboard').'?verified=1');
            } elseif ($user->hasRole('guru')) {
                return redirect()->intended(route('guru.dashboard').'?verified=1');
            } elseif ($user->hasRole('siswa')) {
                return redirect()->intended(route('siswa.dashboard').'?verified=1');
            }
            
            return redirect()->intended(route('dashboard').'?verified=1');
        }

        if ($request->user()->markEmailAsVerified()) {
            event(new Verified($request->user()));
        }

        $user = $request->user();
        
        if ($user->hasRole('admin')) {
            return redirect()->intended(route('admin.dashboard').'?verified=1');
        } elseif ($user->hasRole('guru')) {
            return redirect()->intended(route('guru.dashboard').'?verified=1');
        } elseif ($user->hasRole('siswa')) {
            return redirect()->intended(route('siswa.dashboard').'?verified=1');
        }
        
        return redirect()->intended(route('dashboard').'?verified=1');
    }
}
