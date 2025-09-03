import { usePage } from '@inertiajs/react'

export const useRoles = () => {
    const { props } = usePage()
    const userRoles = props.auth?.user?.roles || []
    const roleNames = userRoles.map(role => role.name)
    
    const hasRole = (role) => roleNames.includes(role)
    const hasAnyRole = (roles) => roles.some(role => roleNames.includes(role))
    const hasAllRoles = (roles) => roles.every(role => roleNames.includes(role))
    
    return {
        hasRole,
        hasAnyRole,
        hasAllRoles,
        roles: userRoles
    }
}