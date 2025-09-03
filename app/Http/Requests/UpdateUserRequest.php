<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules;
use Illuminate\Validation\Rule;

class UpdateUserRequest extends FormRequest
{
    public function authorize()
    {
        return auth()->user()->hasRole('admin');
    }

    public function rules()
    {
        return [
            'name' => 'required|string|max:255',
            'fullname' => 'required|string|max:255',
            'phone' => 'sometimes|nullable|string|max:255',
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique('users')->ignore($this->user->id)
            ],
            'password' => ['nullable', 'confirmed', Rules\Password::defaults()],
            'role' => 'string|exists:roles,name',
            'is_active' => 'bool',
            'is_stopped' => 'bool',
            'balance' => 'numeric',
            'birthdate' => 'date',
            'documents' => 'array',
            'documents.inn' => 'nullable|string|max:20',
            'documents.pasport_birthplace' => 'nullable|string|max:255',
            'documents.pasport_series' => 'nullable|string|max:10',
            'documents.pasport_number' => 'nullable|string|max:20',
            'documents.pasport_who' => 'nullable|string|max:255',
            'documents.pasport_when' => 'nullable|date',
            'documents.pasport_code' => 'nullable|string|max:10'
        ];
    }
}