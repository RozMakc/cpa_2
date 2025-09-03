<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserDocument extends Model
{
    protected $fillable = [
        'user_id',
        'pasport_series',
        'pasport_number',
        'pasport_who',
        'pasport_when',
        'pasport_code',
        'pasport_birthplace',
        'inn',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
