# ESTADO ITERACIÓN 1 — Setup y estructura base
**Fecha:** 06/06/2026
**Estado:** ✅ COMPLETADA

## Rutas activas confirmadas
| Ruta | Componente | Estado |
|------|-----------|--------|
| / | Inicio.jsx | ✅ Hero completo |
| /fundamentos | Fundamentos.jsx | ✅ Placeholder |
| /indicadores | Indicadores.jsx | ✅ Placeholder |
| /simulador | Simulador.jsx | ✅ Placeholder |

## Dependencias instaladas
| Paquete | Versión |
|---------|---------|
| react | 18.x |
| react-dom | 18.x |
| vite | 8.0.16 |
| react-router-dom | instalada |
| recharts | instalada |
| @tabler/icons-react | instalada |
| jspdf | instalada |
| html2canvas | instalada |
| xlsx | instalada |

## Archivos creados
- src/styles/variables.css — paleta completa, grid de fondo, fuente Inter
- src/main.jsx — BrowserRouter + variables.css
- src/App.jsx — Routes para 4 páginas
- src/components/Navbar.jsx + Navbar.css — fijo, links activos, badge IA
- src/components/Footer.jsx + Footer.css — Grupo 1, fuentes ASFI/Ley393/BCB
- src/pages/Inicio.jsx + Inicio.css — Hero completo
- src/pages/Fundamentos.jsx — placeholder
- src/pages/Indicadores.jsx — placeholder
- src/pages/Simulador.jsx — placeholder

## Problemas encontrados y soluciones
- main.jsx y App.jsx existían del scaffold de Vite → sobrescritos correctamente
- index.css de Vite no eliminado pero tampoco importado → sin conflicto

## Checklist de criterios de cierre
- [x] Proyecto React corre en localhost:5173 sin errores
- [x] Navegación entre 4 páginas funciona sin recarga
- [x] Paleta de colores aplicada (#0D0F14, #00E5FF, #C4A050)
- [x] Navbar fija con link activo resaltado en cian
- [x] Hero con tag UMSA, título bicolor, 3 stats, 3 tarjetas de descarga placeholder, separador, 3 nav cards
- [x] Footer con fuentes normativas
- [x] Grid de fondo sutil operativo
- [x] Glows radiales cian y dorado en hero

## Próxima iteración
Iteración 2 — Página Fundamentos (contenido teórico y normativo)
Ruta del proyecto: /mnt/d/UNI/7mo Semestre/7 FIN-709 Finanzas y Operaciones Bancarias/Expo final/Pagina web/cartera_web
