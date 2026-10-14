// Área inicial de cada tipo de usuário.
export const HOME = { admin: '/admin', agronomo: '/agro', produtor: '/app' };
export const homeFor = (tipo) => HOME[tipo] || '/app';
