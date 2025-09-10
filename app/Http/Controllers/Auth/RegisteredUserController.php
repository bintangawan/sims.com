<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\SiswaProfile;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rules;
use Spatie\Permission\Models\Role;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Show the registration page.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Register');
    }

    /**
     * Handle an incoming registration request.
     * Note: Default registration creates siswa role
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'nis' => 'nullable|string|max:30|unique:siswa_profiles',
            'angkatan' => 'nullable|integer|min:2020|max:2030',
        ]);

        DB::transaction(function () use ($request) {
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
            ]);

            // Assign default siswa role for public registration
            $user->assignRole('siswa');

            // Create siswa profile
            SiswaProfile::create([
                'user_id' => $user->id,
                'nis' => $request->nis ?? 'SIS' . str_pad($user->id, 6, '0', STR_PAD_LEFT),
                'angkatan' => $request->angkatan ?? date('Y'),
            ]);

            event(new Registered($user));

            Auth::login($user);
        });

        return redirect()->intended(route('siswa.dashboard'));
    }
}
