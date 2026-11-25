#!/usr/bin/env python3
"""Turn SVG path data into TikZ \\fill lines for a report logo.

Usage:
  python3 -I svg2tikz.py mark.svg            # every <path d="..."> in the file
  python3 -I svg2tikz.py --d "M12 1.5H18..."  # one or more path strings (repeat --d)
Options: --color ink (TikZ colour name), --height 24 (viewBox height; default from the SVG or 24).

Why: TikZ's svg.path library draws arcs the wrong way round under scaling and flipping, so this
script converts arcs to cubic Beziers and flips y itself (SVG is y-down, TikZ is y-up).
Supports M L H V C S Q A Z, absolute and relative, no transforms.
Use the output inside: \\begin{tikzpicture}[x=1pt, y=1pt, scale=<height pt>/<viewBox height>, baseline={...}]
"""
import argparse, math, re, sys


def arc_to_beziers(x1, y1, rx, ry, phi, fa, fs, x2, y2):
    if rx == 0 or ry == 0:
        return [((x1, y1), (x2, y2), (x2, y2))]
    rx, ry = abs(rx), abs(ry)
    cp, sp = math.cos(math.radians(phi)), math.sin(math.radians(phi))
    dx, dy = (x1 - x2) / 2, (y1 - y2) / 2
    x1p, y1p = cp * dx + sp * dy, -sp * dx + cp * dy
    lam = x1p ** 2 / rx ** 2 + y1p ** 2 / ry ** 2
    if lam > 1:
        rx, ry = rx * math.sqrt(lam), ry * math.sqrt(lam)
    num = rx * rx * ry * ry - rx * rx * y1p * y1p - ry * ry * x1p * x1p
    den = rx * rx * y1p * y1p + ry * ry * x1p * x1p
    c = math.sqrt(max(0, num / den)) * (-1 if fa == fs else 1)
    cxp, cyp = c * rx * y1p / ry, -c * ry * x1p / rx
    cx = cp * cxp - sp * cyp + (x1 + x2) / 2
    cy = sp * cxp + cp * cyp + (y1 + y2) / 2

    def ang(ux, uy, vx, vy):
        return math.atan2(ux * vy - uy * vx, ux * vx + uy * vy)

    t1 = ang(1, 0, (x1p - cxp) / rx, (y1p - cyp) / ry)
    dt = ang((x1p - cxp) / rx, (y1p - cyp) / ry, (-x1p - cxp) / rx, (-y1p - cyp) / ry)
    if not fs and dt > 0:
        dt -= 2 * math.pi
    if fs and dt < 0:
        dt += 2 * math.pi
    n = max(1, math.ceil(abs(dt) / (math.pi / 2) - 1e-9))
    d = dt / n
    k = 4 / 3 * math.tan(d / 4)

    def pt(t, ex, ey):  # point on the ellipse plus a tangent offset, rotated by phi
        px, py = rx * (math.cos(t) + ex), ry * (math.sin(t) + ey)
        return (cx + cp * px - sp * py, cy + sp * px + cp * py)

    out = []
    for i in range(n):
        a, b = t1 + i * d, t1 + (i + 1) * d
        out.append((pt(a, -k * math.sin(a), k * math.cos(a)),
                    pt(b, k * math.sin(b), -k * math.cos(b)),
                    pt(b, 0, 0)))
    return out


def convert(d, height, color):
    toks = re.findall(r'[A-Za-z]|[-+]?(?:\d+\.?\d*|\.\d+)(?:[eE][-+]?\d+)?', d)
    i, x, y, sx, sy, cmd, parts = 0, 0.0, 0.0, 0.0, 0.0, None, []
    last_c = None  # last cubic control point, for S
    f = lambda p: "(%.3f,%.3f)" % (p[0], height - p[1])

    def num():
        nonlocal i
        v = float(toks[i]); i += 1
        return v

    while i < len(toks):
        if toks[i].isalpha():
            cmd = toks[i]; i += 1
            if cmd in 'zZ':
                parts.append('-- cycle'); x, y = sx, sy; last_c = None
                continue
        rel = cmd.islower(); C = cmd.upper()
        ox, oy = (x, y) if rel else (0.0, 0.0)
        if C == 'M':
            x, y = ox + num(), oy + num(); sx, sy = x, y
            parts.append(f((x, y))); cmd = 'l' if rel else 'L'; last_c = None
        elif C == 'L':
            x, y = ox + num(), oy + num(); parts.append('-- ' + f((x, y))); last_c = None
        elif C == 'H':
            x = (x if rel else 0) + num(); parts.append('-- ' + f((x, y))); last_c = None
        elif C == 'V':
            y = (y if rel else 0) + num(); parts.append('-- ' + f((x, y))); last_c = None
        elif C == 'C':
            p1 = (ox + num(), oy + num()); p2 = (ox + num(), oy + num()); p3 = (ox + num(), oy + num())
            parts.append('.. controls %s and %s .. %s' % (f(p1), f(p2), f(p3))); x, y = p3; last_c = p2
        elif C == 'S':
            p1 = (2 * x - last_c[0], 2 * y - last_c[1]) if last_c else (x, y)
            p2 = (ox + num(), oy + num()); p3 = (ox + num(), oy + num())
            parts.append('.. controls %s and %s .. %s' % (f(p1), f(p2), f(p3))); x, y = p3; last_c = p2
        elif C == 'Q':
            q = (ox + num(), oy + num()); p3 = (ox + num(), oy + num())
            p1 = (x + 2 / 3 * (q[0] - x), y + 2 / 3 * (q[1] - y))
            p2 = (p3[0] + 2 / 3 * (q[0] - p3[0]), p3[1] + 2 / 3 * (q[1] - p3[1]))
            parts.append('.. controls %s and %s .. %s' % (f(p1), f(p2), f(p3))); x, y = p3; last_c = None
        elif C == 'A':
            rx, ry, phi, fa, fs = num(), num(), num(), int(num()), int(num())
            ex, ey = ox + num(), oy + num()
            for p1, p2, p3 in arc_to_beziers(x, y, rx, ry, phi, fa, fs, ex, ey):
                parts.append('.. controls %s and %s .. %s' % (f(p1), f(p2), f(p3)))
            x, y = ex, ey; last_c = None
        else:
            sys.exit('unsupported path command: %s' % cmd)
    return '\\fill[%s] %s;' % (color, ' '.join(parts))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('svg', nargs='?')
    ap.add_argument('--d', action='append', default=[])
    ap.add_argument('--color', default='ink')
    ap.add_argument('--height', type=float)
    a = ap.parse_args()
    paths, height = list(a.d), a.height
    if a.svg:
        text = open(a.svg).read()
        paths += re.findall(r'<path[^>]*\sd="([^"]+)"', text)
        vb = re.search(r'viewBox="\s*[-\d.]+[\s,]+[-\d.]+[\s,]+[-\d.]+[\s,]+([-\d.]+)"', text)
        if height is None and vb:
            height = float(vb.group(1))
    if not paths:
        sys.exit('no path data found')
    for d in paths:
        print('  ' + convert(d, height or 24.0, a.color))


if __name__ == '__main__':
    main()
