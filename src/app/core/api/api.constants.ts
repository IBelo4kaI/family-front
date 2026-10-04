// Без явного порта (80/443) фронт открыт на сервере: API проксируется на тот же домен.
// С портом (ng serve, локальная раздача) бэкенд ищется на :8080 того же хоста.
export const API_URL = location.port
  ? `${location.protocol}//${location.hostname}:8080/v1`
  : `${location.origin}/v1`;
