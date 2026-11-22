#!/usr/bin/env python3
"""
Pictogrammes du quiz (ablutions et prière) : silhouettes simples, sans visage,
partie concernée surlignée en or. Sortie : src/assets/quiz/*.svg

Usage : python3 scripts/quiz-illustrations.py   (aucune dépendance)
"""
from pathlib import Path

OUT = Path(__file__).resolve().parent.parent / 'src' / 'assets' / 'quiz'
INK = '#0A3A1B'      # silhouette (vert profond)
GOLD = '#E2B743'     # partie concernée
GROUND = '#D8CDB2'   # sol
BG = '#F4EFE3'       # fond ivoire
W = 14               # épaisseur des membres


def svg(body: str, title: str) -> str:
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240" role="img" aria-label="{title}">'
        f'<title>{title}</title><rect width="240" height="240" rx="32" fill="{BG}"/>{body}</svg>\n'
    )


def line(points, color=INK, width=W):
    d = 'M' + ' L'.join(f'{x} {y}' for x, y in points)
    return (f'<path d="{d}" fill="none" stroke="{color}" stroke-width="{width}" '
            f'stroke-linecap="round" stroke-linejoin="round"/>')


def head(x, y, r=17, color=INK):
    return f'<circle cx="{x}" cy="{y}" r="{r}" fill="{color}"/>'


def ground(y=212):
    return f'<line x1="24" y1="{y}" x2="216" y2="{y}" stroke="{GROUND}" stroke-width="4" stroke-linecap="round"/>'


# ——— Silhouette debout, de face (ablutions) ———
SH_L, SH_R = (98, 80), (142, 80)
EL_L, EL_R = (84, 122), (156, 122)
WR_L, WR_R = (80, 158), (160, 158)
HA_L, HA_R = (79, 170), (161, 170)
HIP_L, HIP_R = (108, 150), (132, 150)
KN_L, KN_R = (104, 186), (136, 186)
AN_L, AN_R = (102, 214), (138, 214)
TO_L, TO_R = (88, 220), (152, 220)


def standing(highlight=(), face=False):
    parts = [
        line([SH_L, SH_R]),
        line([(120, 80), (120, 150)], width=22),        # buste
        line([HIP_L, KN_L, AN_L]), line([HIP_R, KN_R, AN_R]),
        line([AN_L, TO_L]), line([AN_R, TO_R]),
        line([SH_L, EL_L, WR_L]), line([SH_R, EL_R, WR_R]),
        line([WR_L, HA_L]), line([WR_R, HA_R]),
        head(120, 50, 20, GOLD if face else INK),
    ]
    for seg in highlight:
        parts.append(line(seg, GOLD, W - 2))
    return ''.join(parts)


# ——— Tête de face, grand format (bouche, nez, oreilles) ———
def big_head(feature):
    g = lambda f: GOLD if feature == f else INK
    return ''.join([
        f'<ellipse cx="120" cy="118" rx="58" ry="70" fill="{INK}"/>',
        f'<ellipse cx="60" cy="122" rx="12" ry="20" fill="{g("ears")}"/>',
        f'<ellipse cx="180" cy="122" rx="12" ry="20" fill="{g("ears")}"/>',
        f'<path d="M120 104 L112 136 L124 136" fill="none" stroke="{g("nose") if feature == "nose" else BG}" '
        f'stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>',
        f'<path d="M100 158 Q120 172 140 158" fill="none" stroke="{GOLD if feature == "mouth" else BG}" '
        f'stroke-width="8" stroke-linecap="round"/>',
        line([(120, 188), (120, 214)], width=26),
        line([(70, 222), (170, 222)], width=18),
        # gouttes d'eau près de la partie concernée
        drops({'mouth': (152, 168), 'nose': (140, 128), 'ears': (198, 96)}[feature]),
    ])


def drops(at):
    x, y = at
    return ''.join(
        f'<path d="M{x + dx} {y + dy} q6 10 0 14 q-6 -4 0 -14z" fill="#4FA3D9"/>'
        for dx, dy in ((0, 0), (12, 10))
    )


# ——— Prière (de profil) ———
def stand_side(arms='down', hl=None):
    body = [ground(), line([(118, 150), (114, 212)]), line([(126, 150), (132, 212)]),
            line([(120, 80), (122, 150)], width=22), head(121, 52, 19)]
    if arms == 'down':
        body.append(line([(120, 86), (126, 128), (128, 150)]))
    elif arms == 'takbir':  # mains levées à hauteur des oreilles
        c = GOLD if hl == 'arms' else INK
        body.append(line([(114, 88), (88, 104), (86, 58)], c))    # main gauche à hauteur de l'oreille
        body.append(line([(128, 88), (154, 104), (156, 58)], c))  # main droite
    elif arms == 'chest':
        body.append(line([(120, 86), (134, 112), (124, 120)]))
    return ''.join(body)


def ruku(hl=False):
    c = GOLD if hl else INK
    return ''.join([
        ground(),
        line([(84, 212), (90, 150)]), line([(96, 212), (100, 150)]),    # jambes
        line([(96, 148), (168, 140)], c, 22),                             # dos à l'horizontale
        head(188, 140, 18, c),
        line([(160, 142), (110, 176)], c),                                # bras vers les genoux
    ])


def sujud(hl=False):
    c = GOLD if hl else INK
    return ''.join([
        ground(),
        line([(60, 212), (70, 212)]),                                     # orteils
        line([(70, 212), (100, 212)]),                                    # tibias au sol
        line([(100, 212), (106, 160)]),                                   # cuisses
        line([(106, 158), (164, 186)], width=22),                         # dos incliné
        line([(160, 184), (176, 212)]),                                   # bras, paumes au sol
        head(186, 196, 17, c),                                            # front au sol
        f'<circle cx="198" cy="210" r="6" fill="{GOLD}"/>' if hl else '',
    ])


def sitting(finger=False, salam=False):
    parts = [
        ground(),
        line([(70, 212), (138, 212)]),                                    # jambes repliées
        line([(112, 206), (114, 132)], width=22),                         # buste droit
        head(115 if not salam else 122, 104, 19),
        line([(114, 140), (140, 172), (152, 200)]),                       # bras sur la cuisse
    ]
    if finger:
        parts.append(line([(152, 200), (166, 186)], GOLD, 7))            # index levé
    if salam:
        parts.append('<path d="M150 92 q20 8 18 28" fill="none" stroke="#E2B743" stroke-width="6" '
                     'stroke-linecap="round"/><path d="M160 116 l8 6 l4 -10" fill="none" stroke="#E2B743" '
                     'stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>')
    return ''.join(parts)


ARM_L_FOREARM = [EL_L, WR_L, HA_L]
ARM_R_FOREARM = [EL_R, WR_R, HA_R]
FILES = {
    # Ablutions
    'ablution-visage': (standing(face=True), 'Laver le visage'),
    'ablution-bras-coudes': (standing([ARM_L_FOREARM, ARM_R_FOREARM]), 'Bras lavés jusqu’aux coudes'),
    'ablution-mains-poignets': (standing([[WR_L, HA_L], [WR_R, HA_R]]), 'Mains lavées jusqu’aux poignets'),
    'ablution-bras-epaules': (standing([[SH_L, EL_L, WR_L, HA_L], [SH_R, EL_R, WR_R, HA_R]]), 'Bras lavés jusqu’aux épaules'),
    'ablution-pieds-chevilles': (standing([[AN_L, TO_L], [AN_R, TO_R]]), 'Pieds lavés jusqu’aux chevilles'),
    'ablution-pieds-genoux': (standing([[KN_L, AN_L, TO_L], [KN_R, AN_R, TO_R]]), 'Jambes lavées jusqu’aux genoux'),
    'ablution-orteils': (standing([[(92, 219), TO_L], [(148, 219), TO_R]]), 'Seulement les orteils'),
    'ablution-tete': (
        ''.join([standing(face=False).replace(line([SH_L, EL_L, WR_L]), '').replace(line([SH_R, EL_R, WR_R]), '')
                 .replace(line([WR_L, HA_L]), '').replace(line([WR_R, HA_R]), ''),
                 line([SH_L, (78, 60), (104, 34)]), line([SH_R, (162, 60), (136, 34)]),
                 f'<path d="M100 40 Q120 18 140 40" fill="none" stroke="{GOLD}" stroke-width="10" stroke-linecap="round"/>']),
        'Passer les mains mouillées sur la tête'),
    'ablution-bouche': (big_head('mouth'), 'Se rincer la bouche'),
    'ablution-nez': (big_head('nose'), 'Aspirer l’eau par le nez'),
    'ablution-oreilles': (big_head('ears'), 'Essuyer les oreilles'),
    # Prière
    'priere-debout': (stand_side('chest'), 'Debout dans la prière'),
    'priere-takbir': (stand_side('takbir', 'arms'), 'Takbîr d’entrée : mains levées'),
    'priere-roukou': (ruku(True), 'Inclinaison (roukou’)'),
    'priere-soujoud': (sujud(True), 'Prosternation, le front au sol'),
    'priere-assis': (sitting(finger=True), 'Assis pour le tachahhoud'),
    'priere-salam': (sitting(salam=True), 'Salam en fin de prière'),
}

OUT.mkdir(parents=True, exist_ok=True)
for name, (body, title) in FILES.items():
    (OUT / f'{name}.svg').write_text(svg(body, title), encoding='utf-8')
print(f'{len(FILES)} illustrations → {OUT}')
