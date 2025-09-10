<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class EmailVerificationNotificationController extends Controller
{
    /**
     * Send a new email verification notification.
     */
    public function store(Request $request): RedirectResponse
    {
        if ($request->user()->hasVerifiedEmail()) {
            $user = $request->user();
            
            if ($user->hasRole('admin')) {
                return redirect()->intended(route('admin.dashboard'));
            } elseif ($user->hasRole('guru')) {
                return redirect()->intended(route('guru.dashboard'));
            } elseif ($user->hasRole('siswa')) {
                return redirect()->intended(route('siswa.dashboard'));
            }
            
            return redirect()->intended(route('dashboard'));
        }

        $request->user()->sendEmailVerificationNotification();

        return back()->with('status', 'verification-link-sent');
    }
}
