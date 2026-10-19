Create a HIGH-FIDELITY desktop web dashboard for a Brazilian IoT flood monitoring and urban drainage system called “SANEAS”.

CRITICAL INSTRUCTION:
The attached/reference screenshot is the SOURCE OF TRUTH.

DO NOT redesign, reinterpret, simplify, modernize, or creatively modify the reference.
DO NOT change the information architecture.
DO NOT move sections to different positions.
DO NOT replace the visual language with your own design system.

The goal is to reproduce the reference screenshot as closely as possible, almost pixel-for-pixel, while creating a clean and editable Figma design.

All visible UI text MUST remain in Brazilian Portuguese (pt-BR).

==================================================
1. TARGET / FRAME
==================================================

Create a desktop dashboard approximately:

Width: 1536px
Height: 1024px minimum

The page should visually match a 16:10 / large desktop dashboard.

Main structure:

- Fixed left sidebar: approximately 270–275px wide
- Main content occupies remaining width
- Top header: approximately 90–95px tall
- Very light gray/white overall background
- Main content padding: approximately 28–32px
- Consistent 20–24px gaps between major components

The interface must feel spacious, professional, lightweight and enterprise-oriented.

Do NOT make components excessively rounded.
Do NOT use dark cards.
Do NOT use glassmorphism.
Do NOT use gradients as main backgrounds.
Do NOT use oversized typography.

==================================================
2. DESIGN LANGUAGE
==================================================

Visual style:
- Modern SaaS / IoT monitoring dashboard
- White cards
- Thin cool-gray borders
- Very subtle shadows
- Rounded corners around 14–16px
- Strong blue primary color
- Green for healthy/online states
- Red only for critical alerts
- Amber/yellow for warning states
- Dark navy text
- Muted blue-gray secondary text

Suggested colors:

Primary blue:
#075ED1 / #0B63D8

Dark navy:
#071C3C / #0A2342

Green:
#13B866

Light green:
#E8F8EF

Critical red:
#FF3838

Light red:
#FFF4F4

Warning amber:
#F5A900

Main background:
#F8FAFC or #FAFBFD

Card background:
#FFFFFF

Border:
#E2E8F0

Secondary text:
#64748B

Main text:
#0F2747

Use a clean sans-serif font similar to:
Inter, Manrope, or Poppins.

Prefer Inter if available.

==================================================
3. LEFT SIDEBAR
==================================================

Sidebar dimensions:
~272px wide
Full viewport height
White background
Subtle right border #E5EAF0

At the top, place the SANEAS brand.

Logo composition:
- Water droplet icon on the left
- Inside/associated with the droplet, small city/building + water/environment imagery
- “SANEAS” text on the right
- “SAN” in green
- “EAS” in blue/teal if necessary to reproduce the reference
- Large enough to occupy approximately 210px horizontal space
- Top margin approximately 28–32px
- Left/right padding approximately 28px

If the exact SANEAS logo is available in the reference assets, USE IT.
Do not recreate it unnecessarily.

Below logo, leave approximately 38–45px vertical spacing.

Navigation menu:

1. Início
2. Mapa
3. Notificações
4. Dispositivos

Each navigation row:
- approx 225–235px width
- approx 54px height
- 12px border radius
- left aligned
- icon + label
- around 18px horizontal icon-to-text gap

ACTIVE ITEM:
“Início”

Active item:
- solid primary blue background
- white house icon
- white text
- subtle blue shadow

Inactive:
- transparent white background
- no heavy border
- dark navy label
- blue outline icons

Icons:
Início → house
Mapa → map pin
Notificações → bell
Dispositivos → microchip / CPU

Use Lucide icons, Material Symbols, or equivalent consistent outline icons.

After navigation, add a subtle horizontal divider.

==================================================
4. SIDEBAR USER PROFILE
==================================================

At the bottom of the sidebar, create a user profile card.

Position:
fixed visually near bottom, around 70px above bottom collapse control.

Card:
- white
- thin gray border
- 14px radius
- approximately 235px wide
- approximately 105px tall
- subtle shadow

Inside:
Circular dark-blue avatar approximately 48px.

Avatar initials:
“JA”
white text

Right side:

João Augusto
Administrador

Below:
small green status dot + “Online”

Typography:
Name → medium/semi-bold
Role → small gray text
Online → small green/dark text

At the very bottom center/right area of sidebar:
small double-chevron-left icon to collapse sidebar.

==================================================
5. TOP HEADER
==================================================

Main content starts immediately to the right of sidebar.

Header height:
~92px

White background.
Bottom border #E5EAF0.

Left section:

Hamburger/menu icon

Then:

Title:
“Visão Geral”

Font:
~21–23px
700 weight
dark navy

Subtitle:
“Monitoramento em tempo real das condições de alagamento.”

~13px
muted gray-blue

Right section aligned horizontally:

LOCATION SELECTOR
White outlined dropdown card:
- map pin blue icon
- “Lagoa Seca”
- chevron down
- approximately 175px × 45px
- 9px radius

Then notification bell:
- outline dark navy
- small BLUE circular badge
- badge text “3”
- badge positioned at upper-right of bell

Then moon/dark mode icon.

Then user:
- circular dark-blue avatar
- initials JA
- “João Augusto”
- downward chevron

Maintain generous spacing.

==================================================
6. MAIN CONTENT
==================================================

Main dashboard content:
padding around 28px–30px.

The first section must be FOUR KPI CARDS arranged horizontally in one row.

Equal width.
Gap around 22px.

Each card:
height ~118px
white background
border
16px radius
subtle shadow
horizontal internal layout

==================================================
7. KPI CARD 1 — DISPOSITIVOS REGISTRADOS
==================================================

Left:
large circular light-blue icon container.

Inside:
blue cloud/device-style icon.

Right:

Dispositivos
Registrados

large number:
12

subtitle:
Total de sensores

Use dark navy text.

==================================================
8. KPI CARD 2 — DISPOSITIVOS ATIVOS
==================================================

Very subtle green-tinted card/background.

Left:
light-green circle

Green wireless/Wi-Fi icon.

Text:

Dispositivos
Ativos

10

Then:
green dot + “Online agora”

==================================================
9. KPI CARD 3 — ALERTAS HOJE
==================================================

Very subtle light-red tint.

Left:
light red/pink circular icon container.

Red warning triangle.

Text:

Alertas
Hoje

2

Bottom:
“Requer atenção”

in red.

==================================================
10. KPI CARD 4 — ÁREAS MONITORADAS
==================================================

Very subtle lavender/purple tint.

Left:
light-purple circle.

Purple folded-map icon.

Text:

Áreas
Monitoradas

4

Subtitle:
Regiões cobertas

==================================================
11. SECOND ROW LAYOUT
==================================================

Create a two-column layout.

LEFT:
approximately 58% width

RIGHT:
approximately 42% width

Left column contains:
1. rainfall chart
2. monitoring map

Right column contains:
Recent Alerts card

All cards aligned perfectly.

==================================================
12. RAINFALL CHART CARD
==================================================

White card.
16px radius.
Thin gray border.
Subtle shadow.

Height approximately 280px.

Header:

Left:
“Índice de Chuvas por Mês”

Next to title:
small info icon.

Right:
dropdown:
“Últimos 12 meses”

Then:
vertical three-dot menu.

Chart:

BAR CHART.

Y-axis:
0
150
300
450
600

Unit:
“mm”

X-axis:
Jan
Fev
Mar
Abr
Mai
Jun
Jul
Ago
Set
Out
Nov
Dez

Approximate bar values:

Jan: 170
Fev: 260
Mar: 210
Abr: 135
Mai: 0
Jun: 0
Jul: 0
Ago: 0
Set: 50
Out: 15
Nov: 280
Dez: 360

Bars:
blue #0B63D8
medium width
slightly rounded top corners if supported

Grid:
very light dashed or dotted horizontal grid lines.

Legend centered under chart:
small blue dot
“Índice de Chuva (mm)”

IMPORTANT:
Do NOT use cyan chart background.
Chart plot area must remain white like the reference redesign.

==================================================
13. ALERTAS RECENTES CARD
==================================================

Right-side large white card.

Height should visually align with BOTH rainfall chart and monitoring map combined.

Header:

Left:
“Alertas Recentes”

Right:
“Ver todos”
blue clickable text.

Inside top:
critical alert panel.

Panel:
- white / extremely pale red
- 1px red border
- 14px radius
- approx 24px padding

Left:
red circular icon container
white flood/water-wave warning icon

Main content:

Title:
“Alteração no Nível de Água”

At the top-right:
red pill badge:

“Risco de Alagamento”

Description:

“Houve a detecção de variações relacionadas ao aumento
no fluxo da água no bairro: Lagoa Seca.”

Bottom metadata row:

clock icon
“há 5 minutos”

vertical divider

“Sensor: DELTA”

Below the alert panel:
MAP PREVIEW.

Map preview:
- rounded rectangle
- approx 100% width
- approximately 240px high
- real street map if technically possible
- centered on Lagoa Seca / Cidade Universitária area in Juazeiro do Norte, Ceará, Brazil
- one prominent RED alert marker
- red outer glow / ring
- map should look like OpenStreetMap/Mapbox style

DO NOT create random fictional streets if real map integration is available.

==================================================
14. REAL MAP REQUIREMENTS
==================================================

IMPORTANT:

Whenever technically possible, implement the maps using:

OpenStreetMap + Leaflet

or

Mapbox

instead of a static fake illustration.

Preferred:
OpenStreetMap + Leaflet because it does not require a proprietary visual style.

Target region:

Lagoa Seca,
Juazeiro do Norte,
Ceará,
Brazil.

Approximate map center may be determined using real geocoding instead of hardcoding an inaccurate location.

Use REAL MAP TILES.

The map should show actual streets and labels around Lagoa Seca and Cidade Universitária.

For the alert preview:
center around the monitored location.

Add one RED sensor marker.

Marker design:
- red center circle
- white ring
- translucent red outer glow

==================================================
15. MAPA DE MONITORAMENTO
==================================================

Below rainfall chart, in LEFT column.

Card:
white
16px radius
border
subtle shadow
height ~230px.

Header:
Left:
“Mapa de Monitoramento”

Right:
legend:

green dot “Normal”
yellow/amber dot “Atenção”
red dot “Risco”

Below:
REAL interactive map if possible.

Use OpenStreetMap + Leaflet.

Center around:
Lagoa Seca / Cidade Universitária,
Juazeiro do Norte - CE,
Brazil.

Map should show nearby streets and neighborhoods.

Place multiple sensor markers:

GREEN:
healthy / normal sensors

YELLOW:
attention

RED:
critical flood risk

Example distribution:
- 2–3 green markers
- 1 amber marker
- 1 red marker

The RED marker should be visually strongest and near Lagoa Seca.

Markers:
small colored center
white border/ring
soft matching translucent glow.

Map controls on LEFT:
+ zoom
- zoom
location/recenter icon

Use actual map interactions if code generation supports them.

Do not replace the map with a generic blue rectangle.

==================================================
16. REGISTERED DEVICES TABLE
==================================================

Below the chart/map/alerts section:
full-width card.

White background.
16px radius.
Border.
Subtle shadow.

Header:

Left:
“Dispositivos Registrados”

Right:
“Ver todos”

blue link.

Table header columns:

NOME
TIPO
STATUS
LOCALIDADE
ÚLTIMA LEITURA
NÍVEL ATUAL
IDENTIFICADOR
AÇÕES

Use small uppercase or medium-gray table labels.

One device row:

NOME:
small circular light-blue device icon
DELTA
DELTA should be semi-bold

TIPO:
Sensor de Alagamento

STATUS:
green dot
Ativo

LOCALIDADE:
Lagoa Seca

ÚLTIMA LEITURA:
há 12 segundos
31/05/2026 14:32

NÍVEL ATUAL:
72%

Below 72%:
thin horizontal progress bar
green filled section around 72%
remaining section light gray

IDENTIFICADOR:
2026IOT

AÇÕES:
vertical three-dot menu

Row height around 70–75px.

Add subtle row separators.

==================================================
17. TABLE PAGINATION
==================================================

At bottom of table:

Centered text:
“Mostrando 1 de 1 dispositivo”

Then pagination controls:

left arrow
active blue button “1”
right arrow

Keep it subtle and compact.

==================================================
18. SPACING SYSTEM
==================================================

This is extremely important.

Use consistent spacing based on approximately:
4 / 8 / 12 / 16 / 20 / 24 / 32px.

Dashboard page padding:
~28px.

Card padding:
16–20px.

Gap between KPI cards:
20–24px.

Gap between major rows:
20px.

Do NOT leave huge empty areas.

Do NOT make cards touch each other.

All left/right edges should align cleanly.

==================================================
19. BORDER + SHADOW
==================================================

Cards:

border:
1px solid #E2E8F0

shadow:
very subtle.

Example visual equivalent:

0px 2px 8px rgba(15, 39, 71, 0.05)

or similar.

Avoid strong Material Design shadows.

==================================================
20. TYPOGRAPHY
==================================================

Use consistent typography.

Dashboard title:
22px / 700

Card titles:
16–17px / 600–700

KPI labels:
13–14px / 500

KPI values:
30–32px / 700

Body:
13–14px

Small metadata:
12–13px

Navigation:
15–16px

No oversized headings.

==================================================
21. ICON STYLE
==================================================

Use a single icon family consistently.

Preferred:
Lucide

Alternative:
Material Symbols Rounded.

Icons should mostly be OUTLINED.

Only status illustrations inside KPI circles may use thicker/filled visual treatment.

==================================================
22. RESPONSIVE BEHAVIOR
==================================================

Primary goal is desktop fidelity.

At widths >= 1280px:
preserve exact dashboard composition.

Do not stack the main cards on the target desktop frame.

If responsive behavior is generated:

Tablet:
2 KPI cards per row.

Mobile:
collapsed sidebar + single-column layout.

But DO NOT sacrifice desktop fidelity for responsive design.

==================================================
23. COMPONENT STRUCTURE
==================================================

Build reusable components:

Sidebar
SidebarItem
UserProfileCard
Header
LocationSelector
KpiCard
RainfallChart
AlertCard
MonitoringMap
MapMarker
DeviceTable
StatusBadge
ProgressBar
Pagination

If generating React/code, keep components clean and reusable.

==================================================
24. MAP IMPLEMENTATION — IF CODE IS GENERATED
==================================================

If the output includes React/code:

Use Leaflet + OpenStreetMap for real maps.

Use:

react-leaflet
leaflet

Use standard OpenStreetMap tiles.

Do not require a paid API.

Geographic center should represent Lagoa Seca,
Juazeiro do Norte, Ceará, Brazil.

If geocoding is possible:
geocode the neighborhood/place instead of guessing coordinates.

Ensure Leaflet CSS is imported.

Ensure the map fills its parent card correctly.

Use border-radius and overflow:hidden on map containers.

Prevent map tiles from rendering outside the card.

==================================================
25. CHART IMPLEMENTATION — IF CODE IS GENERATED
==================================================

If code is generated, use a proper chart library such as:

Recharts

Preferred component:
BarChart

Include:
CartesianGrid
XAxis
YAxis
Tooltip
Bar
Legend

Remove unnecessary chart borders.

Tooltip should match dashboard style:
white
thin border
subtle shadow
small radius.

==================================================
26. MICRO-INTERACTIONS
==================================================

Keep interactions subtle.

Sidebar item:
slight background transition.

Buttons:
subtle hover.

Map markers:
optional subtle pulse ONLY for critical red marker.

Notification bell:
no excessive animation.

Cards:
DO NOT scale dramatically on hover.

==================================================
27. ACCESSIBILITY
==================================================

Maintain sufficient contrast.

Status must not depend ONLY on color.

Critical alert includes:
red + icon + text “Risco de Alagamento”.

Active device includes:
green + dot + text “Ativo”.

==================================================
28. EXACT TEXT CONTENT
==================================================

Use these texts exactly:

Visão Geral

Monitoramento em tempo real das condições de alagamento.

Lagoa Seca

Início
Mapa
Notificações
Dispositivos

Dispositivos Registrados
12
Total de sensores

Dispositivos Ativos
10
Online agora

Alertas Hoje
2
Requer atenção

Áreas Monitoradas
4
Regiões cobertas

Índice de Chuvas por Mês
Últimos 12 meses
Índice de Chuva (mm)

Alertas Recentes
Ver todos

Alteração no Nível de Água
Risco de Alagamento

Houve a detecção de variações relacionadas ao aumento no fluxo da água no bairro: Lagoa Seca.

há 5 minutos
Sensor: DELTA

Mapa de Monitoramento
Normal
Atenção
Risco

Dispositivos Registrados

NOME
TIPO
STATUS
LOCALIDADE
ÚLTIMA LEITURA
NÍVEL ATUAL
IDENTIFICADOR
AÇÕES

DELTA
Sensor de Alagamento
Ativo
Lagoa Seca
há 12 segundos
31/05/2026 14:32
72%
2026IOT

Mostrando 1 de 1 dispositivo

João Augusto
Administrador
Online

==================================================
29. PRIORITY ORDER
==================================================

If there is any conflict, prioritize:

1. Visual fidelity to the provided reference screenshot
2. Exact layout and proportions
3. Exact content hierarchy
4. Exact colors and spacing
5. Real OpenStreetMap integration
6. Correct typography
7. Interactivity
8. Responsiveness

The desktop screenshot fidelity is MORE IMPORTANT than adding extra features.

==================================================
30. DO NOT DO THESE THINGS
==================================================

DO NOT:
- add extra cards
- change sidebar navigation
- change the logo
- add a search bar
- add unnecessary filters
- use a dark dashboard
- use glassmorphism
- use large gradients
- use neon colors
- replace the map with abstract graphics
- replace the rainfall bar chart with a line chart
- use fake random streets when a real map can be loaded
- change DELTA to another sensor
- change João Augusto
- remove the sidebar profile
- change the number of KPI cards
- put alerts above the KPI cards
- use huge rounded corners
- make the design overly colorful
- change the language to English
- invent additional dashboard information
- use generic stock illustrations

==================================================
31. FINAL VALIDATION
==================================================

Before finishing, visually compare the generated interface against the reference screenshot.

Check:

[ ] Sidebar width and position match
[ ] SANEAS logo size matches
[ ] Header height matches
[ ] Four KPI cards are in one row
[ ] Rainfall chart is left
[ ] Recent Alerts is right
[ ] Monitoring map is below rainfall chart
[ ] Alerts card spans the height beside chart + map
[ ] Device table spans the bottom width
[ ] All Portuguese text is correct
[ ] DELTA device information is preserved
[ ] Blue/green visual identity is preserved
[ ] Critical alert uses red appropriately
[ ] Cards use thin borders and subtle shadows
[ ] Spacing is consistent
[ ] Real map is centered around Lagoa Seca / Juazeiro do Norte
[ ] Desktop layout visually resembles the reference as closely as possible

Do a final visual refinement pass specifically focused on matching the provided reference rather than introducing new design ideas.
Now focus specifically on correcting the maps.

Do NOT use an AI-generated map image.

Use a REAL interactive OpenStreetMap implementation with Leaflet.

The geographic area must be Lagoa Seca, Juazeiro do Norte, Ceará, Brazil.

The map must display actual OpenStreetMap street geometry, street names and neighborhood information from this region.

There are TWO map instances:

1. “Mapa de Monitoramento”
- Larger map
- Located below the rainfall chart
- Show multiple IoT sensor markers
- Green = Normal
- Amber = Atenção
- Red = Risco
- Keep the critical red sensor around the Lagoa Seca monitored area
- Include zoom +/− controls

2. Map inside “Alertas Recentes”
- Smaller map
- Focused more closely on the critical sensor location
- Show ONE prominent red alert marker
- Use the exact same geographic region as the monitoring map
- The red marker should have a white ring and translucent red outer pulse

Use OpenStreetMap tiles and Leaflet.
Do not use a placeholder, illustration, generated road network, or fake map.

If coordinates are required, obtain the real coordinates for Lagoa Seca, Juazeiro do Norte rather than inventing coordinates.
