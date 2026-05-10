<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasApiTokens, HasFactory, Notifiable, HasRoles;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'fullname',
        'balance',
        'email',
        'phone',
        'password',
        'phone',
        'ip_address',
        'user_agent',
        'referer',
        'fullname',
        'birthdate',
        'is_active',
        'is_stopped',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'birthdate' => 'date',
            'password' => 'hashed',
        ];
    }

    public function createApiToken()
    {
        return $this->createToken('api-token', ['*'])->plainTextToken;
    }

    public function links(): HasMany
    {
        return $this->hasMany(Link::class);
    }

    public function documents(): HasOne
    {
        return $this->hasOne(UserDocument::class);
    }

    public function paymethods(): HasOne
    {
        return $this->hasOne(PaymentMethod::class);
    }

    public function isActive(): bool
    {
        return $this->is_active;
    }

    public function isStopped(): bool
    {
        return $this->is_stopped;
    }

    public function managedProjects()
    {
        return $this->belongsToMany(Project::class, 'project_manager')
            ->withTimestamps();
    }

    public function projects(): HasMany
    {
        return $this->hasMany(Project::class);
    }

    /**
     * Получить все проекты, доступные пользователю
     */
    public function getAllProjects()
    {
        if ($this->hasRole('admin')) {
            return Project::with(['managers', 'client'])->get();
        }

        return Project::with(['managers', 'client'])
            ->where('user_id', $this->id)
            ->orWhereHas('managers', fn($query) => $query->where('users.id', $this->id))
            ->orWhereHas('users', fn($query) => $query->where('users.id', $this->id))
            ->get();
    }

    /**
     * Проверить, имеет ли пользователь доступ к проекту
     */
    public function canAccessProject(Project $project): bool
    {
        return $this->hasRole('admin')
            || $project->user_id === $this->id
            || $this->managedProjects->contains($project->id);
    }
}
