// utils/fieldUtils.js
export const getVisibleFields = (project) => {
    const visibleFields = project.visible_fields || {};
    
    return Object.entries(visibleFields)
        .filter(([_, settings]) => settings?.visible)
        .sort(([_, a], [__, b]) => (a?.order || 0) - (b?.order || 0))
        .map(([fieldName, settings]) => ({
            name: fieldName,
            title: settings?.title || fieldName,
            order: settings?.order || 0
        }));
};

export const getLeadFieldValue = (lead, fieldName) => {
    // Стандартные поля
    const standardFields = {
        'id': lead.id,
        'name': lead.name,
        'email': lead.email,
        'phone': lead.phone,
        'tg_id': lead.tg_id,
        'tg_username': lead.tg_username,
        'tg_channel': lead.is_our_channel ? '-' : lead.tg_channel,
        'message': lead.message,
        'status': lead.status,
        'price': lead.price,
        'currency': lead.currency,
        'created_at': lead.created_at,
        'updated_at': lead.updated_at,
        'user_id': lead.user_id,
        'project_id': lead.project_id,
        'user': lead.user,
        'project': lead.project,
    };

    // Проверяем стандартные поля
    if (standardFields[fieldName] !== undefined) {
        return standardFields[fieldName];
    }

    // Проверяем additional_data
    if (lead.additional_data && lead.additional_data[fieldName] !== undefined) {
        return lead.additional_data[fieldName];
    }

    // Проверяем прямое свойство
    if (lead[fieldName] !== undefined) {
        return lead[fieldName];
    }

    return null;
};

export const formatFieldValue = (value, fieldName) => {
    if (value === null || value === undefined) {
        return '-';
    }

    // Форматирование в зависимости от типа поля
    switch (fieldName) {
        case 'created_at':
        case 'updated_at':
            return new Date(value).toLocaleString();
            
        case 'price':
            return typeof value === 'number' ? value.toFixed(2) : value;
            
        case 'status':
            return value;
            
        default:
            return value.toString();
    }
};
