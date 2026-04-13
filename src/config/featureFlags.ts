/**
 * Feature flag — habilita reprodução real de áudio via Spotify Web Playback SDK.
 *
 * false (padrão): Modo Portfólio
 *   - Solicita apenas scopes de leitura
 *   - PlayerBar oculto
 *   - Botões de play ocultos em todas as páginas
 *   - PlayerPage exibe a última música tocada (somente leitura)
 *
 * true: Modo Real
 *   - Solicita scopes de controle (streaming + user-modify-playback-state)
 *   - Todos os controles de playback habilitados
 *
 * Configurar via variável de ambiente: VITE_ENABLE_REAL_AUDIO=true
 */
export const ENABLE_REAL_AUDIO = import.meta.env.VITE_ENABLE_REAL_AUDIO === 'true';
