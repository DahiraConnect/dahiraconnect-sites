#!/usr/bin/env python3
"""
Illustrations du quiz (ablutions et prière), style naturel et islamique :
personnages en boubou blanc et kufi, teint brun, sans visage ; tapis de prière et
niche de mihrab pour la prière ; bouilloire (satala) et bassine pour les ablutions.
La partie concernée est entourée d'un halo doré.

Sortie : src/assets/quiz/*.svg — Usage : python3 scripts/quiz-illustrations.py (aucune dépendance)
"""
from pathlib import Path

OUT = Path(__file__).resolve().parent.parent / 'src' / 'assets' / 'quiz'

IVORY = '#F4EFE3'
NICHE = '#EADFC3'
NICHE_LINE = '#D9B24C'
RUG = '#0F5C27'
RUG_BORDER = '#D9B24C'
CLOTH = '#FFFFFF'
CLOTH_EDGE = '#D3C7A9'
SKIN = '#8D5A3B'
SKIN_DARK = '#6F4329'
WATER = '#3E9AD6'
WATER_LIGHT = '#A9D6F2'
KETTLE = '#1F8A55'
KETTLE_LIGHT = '#3FB277'
BASIN = '#C9B37E'
BASIN_DARK = '#A8925E'
GLOW = '#E2B743'


def svg(body: str, title: str) -> str:
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240" role="img" aria-label="{title}">'
        f'<title>{title}</title>'
        f'<defs><radialGradient id="g"><stop offset="0" stop-color="{GLOW}" stop-opacity=".75"/>'
        f'<stop offset="1" stop-color="{GLOW}" stop-opacity="0"/></radialGradient>'
        f'<linearGradient id="w" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="{WATER_LIGHT}"/>'
        f'<stop offset="1" stop-color="{WATER}"/></linearGradient></defs>'
        f'<rect width="240" height="240" rx="32" fill="{IVORY}"/>{body}</svg>\n'
    )


def path(points):
    return 'M' + ' L'.join(f'{x} {y}' for x, y in points)


def cloth(points, w):
    """Partie de vêtement : tube blanc avec un liseré (style aplat)."""
    d = path(points)
    return (f'<path d="{d}" fill="none" stroke="{CLOTH_EDGE}" stroke-width="{w + 3}" stroke-linecap="round" stroke-linejoin="round"/>'
            f'<path d="{d}" fill="none" stroke="{CLOTH}" stroke-width="{w}" stroke-linecap="round" stroke-linejoin="round"/>')


def skin(points, w, color=SKIN):
    return (f'<path d="{path(points)}" fill="none" stroke="{color}" stroke-width="{w}" '
            f'stroke-linecap="round" stroke-linejoin="round"/>')


def glow(x, y, r):
    return f'<circle cx="{x}" cy="{y}" r="{r}" fill="url(#g)"/>'


def head(x, y, rx=14, ry=16, kufi=True, tilt=0):
    """Tête sans visage, avec kufi blanc."""
    cap = (f'<path d="M{x - rx} {y - 3} Q{x} {y - ry - 12} {x + rx} {y - 3} Z" fill="{CLOTH}" stroke="{CLOTH_EDGE}" stroke-width="2"/>'
           if kufi else '')
    return f'<g transform="rotate({tilt} {x} {y})"><ellipse cx="{x}" cy="{y}" rx="{rx}" ry="{ry}" fill="{SKIN}"/>{cap}</g>'


def niche():
    """Niche de mihrab en fond."""
    return (f'<path d="M48 214 V104 Q48 44 120 36 Q192 44 192 104 V214 Z" fill="{NICHE}"/>'
            f'<path d="M58 214 V106 Q58 54 120 46 Q182 54 182 106 V214" fill="none" stroke="{NICHE_LINE}" stroke-width="2" opacity=".6"/>')


def rug(y=200):
    """Tapis de prière vu de profil (bande) avec bordure dorée."""
    diamonds = ''.join(f'<path d="M{x} {y + 9} l5 -4 l5 4 l-5 4 z" fill="{RUG_BORDER}" opacity=".8"/>' for x in range(44, 196, 22))
    return (f'<rect x="28" y="{y}" width="184" height="18" rx="4" fill="{RUG}"/>'
            f'<rect x="32" y="{y + 3}" width="176" height="12" rx="3" fill="none" stroke="{RUG_BORDER}" stroke-width="1.5"/>{diamonds}')


# ——— Prière ———

def stage(figure):
    """Mihrab + tapis, personnage agrandi de 15 % (pieds posés sur le tapis)."""
    return (niche() + rug()
            + '<g transform="translate(120 200) scale(1.15) translate(-120 -200)">' + ''.join(figure) + '</g>')


def priere_debout():
    """Debout (qiyâm), bras le long du corps, de profil."""
    return stage([
        f'<path d="M108 82 Q100 140 98 198 L150 198 Q146 140 138 82 Z" fill="{CLOTH}" stroke="{CLOTH_EDGE}" stroke-width="2"/>',
        skin([(146, 199), (160, 199)], 8),                       # pied
        cloth([(124, 88), (128, 146)], 15),                       # manche
        f'<circle cx="129" cy="152" r="6.5" fill="{SKIN}"/>',      # main
        skin([(123, 64), (123, 80)], 11),                          # cou
        head(124, 54),
    ])


def priere_takbir():
    """Takbîr d'entrée, de face : mains levées à hauteur des oreilles."""
    return stage([
        glow(88, 58, 26), glow(152, 58, 26),
        f'<path d="M100 86 L140 86 Q152 140 156 198 L84 198 Q88 140 100 86 Z" fill="{CLOTH}" stroke="{CLOTH_EDGE}" stroke-width="2"/>',
        skin([(104, 200), (112, 200)], 7), skin([(128, 200), (136, 200)], 7),
        cloth([(102, 92), (82, 108), (88, 70)], 14),
        cloth([(138, 92), (158, 108), (152, 70)], 14),
        f'<ellipse cx="88" cy="60" rx="6.5" ry="10" fill="{SKIN}"/>',
        f'<ellipse cx="152" cy="60" rx="6.5" ry="10" fill="{SKIN}"/>',
        skin([(120, 70), (120, 84)], 11),
        head(120, 58),
    ])


def priere_roukou():
    """Inclinaison (roukou') : dos à l'horizontale, mains sur les genoux."""
    return stage([
        glow(132, 122, 40),
        cloth([(110, 196), (106, 132)], 30),                      # jambes (boubou)
        skin([(116, 199), (130, 199)], 8),                        # pied
        cloth([(104, 124), (162, 120)], 30),                      # dos horizontal
        cloth([(156, 128), (120, 158)], 13),                      # bras vers le genou
        f'<circle cx="117" cy="161" r="6.5" fill="{SKIN}"/>',
        skin([(170, 121), (180, 122)], 11),
        head(190, 124, 13, 15, tilt=90),
    ])


def priere_soujoud():
    """Prosternation (soujoud) : front, nez, paumes, genoux et orteils au sol."""
    return stage([
        glow(186, 194, 22),
        skin([(70, 198), (78, 198)], 7),                          # orteils
        cloth([(80, 194), (116, 194)], 18),                       # tibias au sol
        cloth([(116, 188), (104, 150)], 26),                      # cuisses
        cloth([(104, 148), (160, 178)], 30),                      # dos
        cloth([(152, 176), (164, 194)], 12),                      # avant-bras
        f'<ellipse cx="166" cy="197" rx="9" ry="3.5" fill="{SKIN}"/>',  # paume
        head(184, 186, 13, 15, tilt=118),
    ])


def priere_assis(salam=False):
    """Assis pour le tachahhoud (index levé), ou salam (tête tournée)."""
    parts = [
        cloth([(86, 194), (142, 194)], 18),                       # jambes repliées
        cloth([(100, 184), (144, 186)], 24),                      # cuisses
        f'<path d="M84 192 Q90 150 98 112 L124 112 Q130 150 134 186 Z" fill="{CLOTH}" stroke="{CLOTH_EDGE}" stroke-width="2"/>',
        cloth([(112, 122), (132, 160), (148, 176)], 13),          # bras sur la cuisse
        f'<circle cx="150" cy="178" r="6.5" fill="{SKIN}"/>',
        skin([(111, 96), (111, 110)], 11),
    ]
    if salam:
        parts += [head(116, 86, tilt=12),
                  f'<path d="M140 70 q22 6 20 30" fill="none" stroke="{GLOW}" stroke-width="6" stroke-linecap="round"/>',
                  f'<path d="M152 96 l8 7 l5 -10" fill="none" stroke="{GLOW}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>']
    else:
        parts += [glow(156, 168, 20), skin([(152, 175), (160, 163)], 4.5), head(112, 86)]
    return stage(parts)


# ——— Ablutions ———

def kettle(x=34, y=44, target=(150, 132)):
    """Bouilloire (satala) qui verse un filet d'eau vers la cible."""
    tx, ty = target
    sx, sy = x + 82, y + 34                                   # bout du bec
    return ''.join([
        f'<path d="M{x + 8} {y + 12} Q{x + 34} {y - 22} {x + 60} {y + 12}" fill="none" stroke="{KETTLE}" stroke-width="5"/>',  # anse
        f'<path d="M{x} {y + 28} Q{x} {y + 6} {x + 34} {y + 6} Q{x + 68} {y + 6} {x + 68} {y + 28} Q{x + 68} {y + 56} {x + 34} {y + 56} Q{x} {y + 56} {x} {y + 28} Z" fill="{KETTLE}"/>',
        f'<ellipse cx="{x + 22}" cy="{y + 22}" rx="10" ry="6" fill="{KETTLE_LIGHT}" opacity=".7"/>',
        f'<path d="M{x + 62} {y + 32} L{sx} {sy - 6} L{sx + 2} {sy} L{x + 64} {y + 44} Z" fill="{KETTLE}"/>',  # bec
        f'<path d="M{sx + 1} {sy} Q{sx + 10} {(sy + ty) / 2} {tx} {ty}" fill="none" stroke="url(#w)" stroke-width="6" stroke-linecap="round"/>',
        f'<circle cx="{tx - 10}" cy="{ty + 10}" r="3" fill="{WATER}"/><circle cx="{tx + 12}" cy="{ty + 6}" r="2.5" fill="{WATER}"/>',
    ])


def basin():
    return (f'<ellipse cx="120" cy="214" rx="80" ry="14" fill="{BASIN_DARK}"/>'
            f'<ellipse cx="120" cy="210" rx="74" ry="10" fill="{BASIN}"/>'
            f'<ellipse cx="120" cy="210" rx="56" ry="6" fill="{WATER_LIGHT}" opacity=".7"/>')


def arm(bare_from_x, glow_from_x, glow_to_x=200):
    """Bras de profil au-dessus de la bassine : manche jusqu'à `bare_from_x`, peau ensuite."""
    return ''.join([
        basin(),
        glow((glow_from_x + glow_to_x) / 2, 150, (glow_to_x - glow_from_x) / 2 + 18),
        cloth([(14, 150), (bare_from_x, 150)], 30),
        skin([(bare_from_x - 4, 150), (176, 150)], 21),                # bras nu
        f'<circle cx="{max(bare_from_x, 92)}" cy="152" r="3" fill="{SKIN_DARK}" opacity=".5"/>' if bare_from_x < 92 else '',
        f'<path d="M170 140 Q196 140 200 150 Q196 162 170 160 Z" fill="{SKIN}"/>',  # main
        skin([(176, 140), (184, 132)], 8),                              # pouce
        kettle(target=(150, 140)),
    ])


def foot(robe_to_y, glow_from_y, toes_only=False):
    """Jambe et pied de profil, eau versée sur le pied."""
    g = glow(170, 196, 22) if toes_only else glow(140, (glow_from_y + 200) / 2, (200 - glow_from_y) / 2 + 22)
    return ''.join([
        basin(), g,
        cloth([(120, 20), (120, robe_to_y)], 38),
        skin([(120, robe_to_y - 4), (122, 186)], 22),                   # jambe nue
        f'<path d="M110 180 Q112 202 130 204 L178 204 Q186 196 172 188 Q146 184 134 176 Z" fill="{SKIN}"/>',  # pied
        kettle_right(target=(160, 186)),
    ])


def kettle_right(target):
    """Bouilloire à droite (verse vers la gauche)."""
    tx, ty = target
    return (f'<g transform="translate(228 30) scale(-1 1)">{kettle(x=0, y=0, target=(228 - tx, ty - 30))}</g>')


def face(highlight):
    """Tête de face, mains en coupe qui apportent l'eau au visage."""
    return ''.join([
        glow(120, 112, 70) if highlight else '',
        f'<path d="M64 240 Q70 186 120 182 Q170 186 176 240 Z" fill="{CLOTH}" stroke="{CLOTH_EDGE}" stroke-width="2"/>',
        skin([(120, 156), (120, 184)], 26),
        f'<ellipse cx="120" cy="112" rx="44" ry="54" fill="{SKIN}"/>',
        f'<ellipse cx="76" cy="116" rx="8" ry="14" fill="{SKIN_DARK}"/><ellipse cx="164" cy="116" rx="8" ry="14" fill="{SKIN_DARK}"/>',
        f'<path d="M78 92 Q120 34 162 92 Q120 70 78 92 Z" fill="{CLOTH}" stroke="{CLOTH_EDGE}" stroke-width="2"/>',  # kufi
        f'<path d="M92 176 Q120 196 148 176 Q140 158 120 160 Q100 158 92 176 Z" fill="{SKIN_DARK}"/>',  # mains en coupe
        f'<path d="M100 170 Q120 182 140 170" fill="none" stroke="{WATER_LIGHT}" stroke-width="5" stroke-linecap="round"/>',
        f'<circle cx="104" cy="132" r="3" fill="{WATER}"/><circle cx="138" cy="120" r="3" fill="{WATER}"/><circle cx="126" cy="146" r="2.5" fill="{WATER}"/>',
    ])


def tete_massah():
    """Massah : mains mouillées passées sur la tête, de l'avant vers l'arrière."""
    return ''.join([
        glow(120, 76, 60),
        f'<path d="M64 240 Q70 186 120 182 Q170 186 176 240 Z" fill="{CLOTH}" stroke="{CLOTH_EDGE}" stroke-width="2"/>',
        skin([(120, 156), (120, 184)], 26),
        f'<ellipse cx="120" cy="116" rx="44" ry="54" fill="{SKIN}"/>',
        f'<path d="M78 98 Q120 46 162 98 Q150 70 120 66 Q90 70 78 98 Z" fill="#2B1B12"/>',   # cheveux courts
        cloth([(40, 210), (60, 120), (92, 76)], 16), cloth([(200, 210), (180, 120), (148, 76)], 16),
        f'<ellipse cx="102" cy="70" rx="16" ry="9" fill="{SKIN_DARK}" transform="rotate(-20 102 70)"/>',
        f'<ellipse cx="138" cy="70" rx="16" ry="9" fill="{SKIN_DARK}" transform="rotate(20 138 70)"/>',
        f'<path d="M96 46 Q120 30 144 46" fill="none" stroke="{GLOW}" stroke-width="6" stroke-linecap="round"/>',
        f'<path d="M138 38 l8 8 l-10 4" fill="none" stroke="{GLOW}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>',
    ])


def profile(feature):
    """Profil sans visage (tourné à droite) : bouche, nez ou oreilles."""
    spots = {'mouth': (160, 144), 'nose': (166, 118), 'ears': (104, 116)}
    gx, gy = spots[feature]
    hand = {
        'mouth': f'<path d="M150 170 Q176 176 184 150 Q170 146 156 152 Z" fill="{SKIN_DARK}"/>'
                 f'<path d="M158 160 Q170 162 178 152" stroke="{WATER_LIGHT}" stroke-width="4" fill="none" stroke-linecap="round"/>',
        'nose': f'<path d="M158 140 Q182 146 188 122 Q176 116 162 124 Z" fill="{SKIN_DARK}"/>'
                f'<circle cx="174" cy="128" r="3" fill="{WATER}"/>',
        'ears': skin([(70, 190), (88, 150), (104, 124)], 12, SKIN_DARK),
    }[feature]
    return ''.join([
        glow(gx, gy, 30),
        f'<path d="M60 240 Q66 190 112 184 Q160 190 168 240 Z" fill="{CLOTH}" stroke="{CLOTH_EDGE}" stroke-width="2"/>',
        skin([(112, 160), (114, 186)], 28),
        f'<path d="M72 112 Q72 58 120 56 Q160 58 164 100 L170 116 Q172 122 164 124 L162 140 Q160 160 136 164 Q96 166 80 146 Q72 132 72 112 Z" fill="{SKIN}"/>',
        f'<ellipse cx="104" cy="116" rx="9" ry="14" fill="{SKIN_DARK}"/>',                       # oreille
        f'<path d="M74 96 Q110 30 160 86 Q118 72 74 96 Z" fill="{CLOTH}" stroke="{CLOTH_EDGE}" stroke-width="2"/>',  # kufi
        hand,
    ])


FILES = {
    # Ablutions
    'ablution-visage': (face(True), 'Laver le visage'),
    'ablution-bras-coudes': (arm(bare_from_x=92, glow_from_x=92), 'Bras lavé jusqu’au coude'),
    'ablution-mains-poignets': (arm(bare_from_x=166, glow_from_x=166), 'Main lavée jusqu’au poignet'),
    'ablution-bras-epaules': (arm(bare_from_x=30, glow_from_x=30), 'Bras lavé jusqu’à l’épaule'),
    'ablution-pieds-chevilles': (foot(robe_to_y=150, glow_from_y=170), 'Pied lavé jusqu’à la cheville'),
    'ablution-pieds-genoux': (foot(robe_to_y=96, glow_from_y=104), 'Jambe lavée jusqu’au genou'),
    'ablution-orteils': (foot(robe_to_y=150, glow_from_y=170, toes_only=True), 'Seulement les orteils'),
    'ablution-tete': (tete_massah(), 'Passer les mains mouillées sur la tête'),
    'ablution-bouche': (profile('mouth'), 'Se rincer la bouche'),
    'ablution-nez': (profile('nose'), 'Aspirer l’eau par le nez'),
    'ablution-oreilles': (profile('ears'), 'Essuyer les oreilles'),
    # Prière
    'priere-debout': (priere_debout(), 'Debout dans la prière'),
    'priere-takbir': (priere_takbir(), 'Takbîr d’entrée : mains levées'),
    'priere-roukou': (priere_roukou(), 'Inclinaison (roukou’)'),
    'priere-soujoud': (priere_soujoud(), 'Prosternation, le front au sol'),
    'priere-assis': (priere_assis(), 'Assis pour le tachahhoud'),
    'priere-salam': (priere_assis(salam=True), 'Salam en fin de prière'),
}

OUT.mkdir(parents=True, exist_ok=True)
for name, (body, title) in FILES.items():
    (OUT / f'{name}.svg').write_text(svg(body, title), encoding='utf-8')
print(f'{len(FILES)} illustrations → {OUT}')
