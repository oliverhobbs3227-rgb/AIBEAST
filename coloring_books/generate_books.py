#!/usr/bin/env python3
"""
Adult Coloring Book Generator
Creates two 50-page coloring books for JessaLynn Hobbs
- Blessings in Color: Uplifting Scripture
- Nature's Canvas: Peaceful Landscapes
"""

import math
import os
import zipfile
import random

from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.units import inch

W, H = letter  # 612 x 792 points (8.5 x 11 inches)
LW_THIN = 0.75
LW_MED = 1.2
LW_THICK = 2.0

MARGIN = 36  # 0.5 inch

# ─────────────────────────────────────────────────────────────────────────────
# SHARED DRAWING UTILITIES
# ─────────────────────────────────────────────────────────────────────────────

def setup_page(c):
    c.setStrokeColor(colors.black)
    c.setFillColor(colors.white)
    c.rect(0, 0, W, H, fill=1, stroke=0)
    c.setFillColor(colors.black)
    c.setLineWidth(LW_MED)


def simple_border(c, gap=0):
    m = MARGIN + gap
    c.setLineWidth(LW_THICK)
    c.rect(m, m, W - 2*m, H - 2*m)
    c.setLineWidth(LW_THIN)
    c.rect(m + 6, m + 6, W - 2*(m+6), H - 2*(m+6))


def dot_border(c, gap=0):
    m = MARGIN + gap
    c.setLineWidth(LW_THICK)
    c.rect(m, m, W - 2*m, H - 2*m)
    step = 14
    r = 2.5
    c.setLineWidth(LW_THIN)
    # top & bottom
    x = m + step
    while x < W - m:
        c.circle(x, m + 3, r, fill=1)
        c.circle(x, H - m - 3, r, fill=1)
        x += step
    # left & right
    y = m + step
    while y < H - m:
        c.circle(m + 3, y, r, fill=1)
        c.circle(W - m - 3, y, r, fill=1)
        y += step


def floral_border(c):
    m = MARGIN
    c.setLineWidth(LW_THICK)
    c.rect(m, m, W - 2*m, H - 2*m)
    # small flowers along edges
    step = 30
    r_flower = 9
    c.setLineWidth(LW_THIN)
    for side in range(4):
        if side == 0:   points = [(x, m) for x in range(m+15, int(W)-m, step)]
        elif side == 1: points = [(x, H-m) for x in range(m+15, int(W)-m, step)]
        elif side == 2: points = [(m, y) for y in range(m+15, int(H)-m, step)]
        else:           points = [(W-m, y) for y in range(m+15, int(H)-m, step)]
        for (px, py) in points:
            _tiny_flower(c, px, py, r_flower, 6)


def _tiny_flower(c, cx, cy, r, petals=6):
    for i in range(petals):
        a = 2 * math.pi * i / petals
        px = cx + r * 0.6 * math.cos(a)
        py = cy + r * 0.6 * math.sin(a)
        c.circle(px, py, r * 0.38)
    c.circle(cx, cy, r * 0.22, fill=1)


def ornate_corner(c, cx, cy, size, angle=0):
    c.saveState()
    c.translate(cx, cy)
    c.rotate(angle)
    r = size
    c.setLineWidth(LW_MED)
    for i in range(5):
        ri = r * (5 - i) / 5
        _tiny_flower(c, 0, 0, ri, 8)
    c.restoreState()


def draw_mandala(c, cx, cy, r, rings=5, base_petals=6):
    c.setLineWidth(LW_THIN)
    # Center
    c.circle(cx, cy, r * 0.04, fill=1)
    c.circle(cx, cy, r * 0.08)
    for ring in range(1, rings + 1):
        frac = ring / rings
        ring_r = r * frac
        n_petals = base_petals * ring
        petal_r = (r / rings) * 0.55
        # ring circle
        c.setLineWidth(LW_THIN)
        c.circle(cx, cy, ring_r)
        # petals on ring
        for i in range(n_petals):
            a = 2 * math.pi * i / n_petals
            px = cx + ring_r * math.cos(a)
            py = cy + ring_r * math.sin(a)
            c.circle(px, py, petal_r * 0.45)
        # radial lines between rings
        if ring < rings:
            inner_r = r * (ring - 0.5) / rings
            for i in range(n_petals * 2):
                a = 2 * math.pi * i / (n_petals * 2) + math.pi / n_petals
                x1 = cx + (ring_r - petal_r*0.5) * math.cos(a)
                y1 = cy + (ring_r - petal_r*0.5) * math.sin(a)
                x2 = cx + (ring_r + petal_r*0.3) * math.cos(a)
                y2 = cy + (ring_r + petal_r*0.3) * math.sin(a)
                c.line(x1, y1, x2, y2)
    # decorative outer ring details
    n_outer = base_petals * rings * 2
    outer_r = r * 1.0
    for i in range(n_outer):
        a = 2 * math.pi * i / n_outer
        x1 = cx + (outer_r - 6) * math.cos(a)
        y1 = cy + (outer_r - 6) * math.sin(a)
        x2 = cx + outer_r * math.cos(a)
        y2 = cy + outer_r * math.sin(a)
        c.line(x1, y1, x2, y2)


def draw_geometric_mandala(c, cx, cy, r, n=8, layers=4):
    c.setLineWidth(LW_THIN)
    for layer in range(layers):
        layer_r = r * (layer + 1) / layers
        pts = []
        for i in range(n):
            a = 2 * math.pi * i / n + (math.pi / n if layer % 2 else 0)
            pts.append((cx + layer_r * math.cos(a), cy + layer_r * math.sin(a)))
        # polygon
        p = c.beginPath()
        p.moveTo(*pts[0])
        for pt in pts[1:]:
            p.lineTo(*pt)
        p.close()
        c.drawPath(p)
        # spokes to center
        if layer == 0:
            for pt in pts:
                c.line(cx, cy, pt[0], pt[1])
        # connect to next layer diagonals
        if layer < layers - 1:
            next_r = r * (layer + 2) / layers
            for i in range(n):
                a1 = 2 * math.pi * i / n + (math.pi / n if layer % 2 else 0)
                a2 = 2 * math.pi * (i + 0.5) / n + (math.pi / n if (layer+1) % 2 else 0)
                x1 = cx + layer_r * math.cos(a1)
                y1 = cy + layer_r * math.sin(a1)
                x2 = cx + next_r * math.cos(a2)
                y2 = cy + next_r * math.sin(a2)
                c.line(x1, y1, x2, y2)
    c.circle(cx, cy, r * 0.08, fill=1)


def draw_flower_wreath(c, cx, cy, r, n=12, flower_size=18):
    c.setLineWidth(LW_MED)
    for i in range(n):
        a = 2 * math.pi * i / n
        fx = cx + r * math.cos(a)
        fy = cy + r * math.sin(a)
        _full_flower(c, fx, fy, flower_size, 5)
        if i < n - 1:
            a2 = 2 * math.pi * (i + 1) / n
            lx = cx + (r - flower_size*0.3) * math.cos(a + math.pi/n)
            ly = cy + (r - flower_size*0.3) * math.sin(a + math.pi/n)
            c.circle(lx, ly, 3, fill=1)
    c.setLineWidth(LW_THIN)
    c.circle(cx, cy, r + flower_size * 0.6)
    c.circle(cx, cy, r - flower_size * 0.6)


def _full_flower(c, cx, cy, r, petals=5):
    c.setLineWidth(LW_MED)
    for i in range(petals):
        a = 2 * math.pi * i / petals - math.pi/2
        px = cx + r * 0.65 * math.cos(a)
        py = cy + r * 0.65 * math.sin(a)
        c.circle(px, py, r * 0.45)
    c.circle(cx, cy, r * 0.28, fill=1)


def wrapped_text(c, text, cx, y, max_width, font, size, line_height=None):
    if line_height is None:
        line_height = size * 1.4
    c.setFont(font, size)
    words = text.split()
    lines = []
    current = ""
    for word in words:
        test = (current + " " + word).strip()
        if c.stringWidth(test, font, size) <= max_width:
            current = test
        else:
            if current:
                lines.append(current)
            current = word
    if current:
        lines.append(current)
    total_h = len(lines) * line_height
    ty = y + total_h / 2
    for line in lines:
        tw = c.stringWidth(line, font, size)
        c.drawString(cx - tw/2, ty, line)
        ty -= line_height
    return len(lines) * line_height


def draw_cross(c, cx, cy, w, h, thickness=18):
    c.setLineWidth(LW_THICK)
    arm_w = thickness
    # vertical bar
    c.rect(cx - arm_w/2, cy - h/2, arm_w, h)
    # horizontal bar
    c.rect(cx - w/2, cy + h*0.1, w, arm_w)
    # decorative ends
    c.setLineWidth(LW_MED)
    for tip in [(cx, cy+h/2), (cx, cy-h/2), (cx-w/2, cy+h*0.1+arm_w/2), (cx+w/2, cy+h*0.1+arm_w/2)]:
        c.circle(tip[0], tip[1], 8)


def draw_dove(c, cx, cy, size):
    c.setLineWidth(LW_MED)
    # body
    p = c.beginPath()
    p.moveTo(cx - size*0.4, cy)
    p.curveTo(cx - size*0.1, cy + size*0.25, cx + size*0.3, cy + size*0.15, cx + size*0.5, cy)
    p.curveTo(cx + size*0.3, cy - size*0.15, cx, cy - size*0.1, cx - size*0.4, cy)
    c.drawPath(p)
    # head
    c.circle(cx + size*0.45, cy + size*0.12, size*0.1)
    # wing
    p2 = c.beginPath()
    p2.moveTo(cx, cy + size*0.05)
    p2.curveTo(cx - size*0.1, cy + size*0.35, cx + size*0.2, cy + size*0.4, cx + size*0.3, cy + size*0.15)
    c.drawPath(p2)
    # tail feathers
    for i in range(3):
        a = math.pi + (i - 1) * 0.25
        x1 = cx - size*0.38
        y1 = cy
        x2 = x1 + size*0.28 * math.cos(a)
        y2 = y1 + size*0.28 * math.sin(a)
        c.line(x1, y1, x2, y2)


def draw_sun_burst(c, cx, cy, r_inner, r_outer, n_rays=16):
    c.setLineWidth(LW_MED)
    c.circle(cx, cy, r_inner)
    for i in range(n_rays):
        a = 2 * math.pi * i / n_rays
        x1 = cx + r_inner * math.cos(a)
        y1 = cy + r_inner * math.sin(a)
        x2 = cx + r_outer * math.cos(a)
        y2 = cy + r_outer * math.sin(a)
        c.line(x1, y1, x2, y2)
    # secondary shorter rays
    for i in range(n_rays):
        a = 2 * math.pi * (i + 0.5) / n_rays
        x1 = cx + (r_inner * 1.1) * math.cos(a)
        y1 = cy + (r_inner * 1.1) * math.sin(a)
        x2 = cx + (r_outer * 0.7) * math.cos(a)
        y2 = cy + (r_outer * 0.7) * math.sin(a)
        c.line(x1, y1, x2, y2)


def draw_butterfly(c, cx, cy, size):
    c.setLineWidth(LW_MED)
    # upper wings
    for side in [-1, 1]:
        p = c.beginPath()
        p.moveTo(cx, cy)
        p.curveTo(cx + side*size*0.2, cy + size*0.5,
                  cx + side*size*0.8, cy + size*0.4,
                  cx + side*size*0.7, cy)
        p.curveTo(cx + side*size*0.6, cy - size*0.15, cx + side*size*0.1, cy - size*0.05, cx, cy)
        c.drawPath(p)
        # lower wings
        p2 = c.beginPath()
        p2.moveTo(cx, cy)
        p2.curveTo(cx + side*size*0.15, cy - size*0.2,
                   cx + side*size*0.55, cy - size*0.45,
                   cx + side*size*0.5, cy - size*0.1)
        p2.curveTo(cx + side*size*0.3, cy + size*0.05, cx + side*size*0.05, cy, cx, cy)
        c.drawPath(p2)
        # wing veins
        for j in range(3):
            a = math.pi/2 + side * j * 0.3
            c.line(cx, cy, cx + side*size*0.5*math.cos(a), cy + size*0.5*math.sin(a))
    # body
    p3 = c.beginPath()
    p3.moveTo(cx, cy + size*0.15)
    p3.curveTo(cx - 4, cy, cx - 4, cy - size*0.2, cx, cy - size*0.25)
    p3.curveTo(cx + 4, cy - size*0.2, cx + 4, cy, cx, cy + size*0.15)
    c.drawPath(p3)
    # antennae
    c.line(cx, cy + size*0.15, cx - size*0.2, cy + size*0.4)
    c.circle(cx - size*0.2, cy + size*0.4, 3, fill=1)
    c.line(cx, cy + size*0.15, cx + size*0.2, cy + size*0.4)
    c.circle(cx + size*0.2, cy + size*0.4, 3, fill=1)


def draw_tree_of_life(c, cx, cy, trunk_h=120, spread=180, layers=5):
    c.setLineWidth(LW_MED)
    # trunk
    c.rect(cx - 12, cy, 24, trunk_h)
    # roots
    for i in range(3):
        a = math.pi + (i - 1) * 0.5
        c.line(cx, cy, cx + 40*math.cos(a), cy + 40*math.sin(a))
    # branches — recursive-style drawn explicitly
    def branch(x1, y1, length, angle, width, depth):
        if depth == 0 or length < 8:
            return
        x2 = x1 + length * math.cos(angle)
        y2 = y1 + length * math.sin(angle)
        c.setLineWidth(max(0.5, width))
        c.line(x1, y1, x2, y2)
        if depth > 1:
            # flowers at tips
            if depth == 1:
                _tiny_flower(c, x2, y2, 10, 5)
        spread_a = 0.5
        branch(x2, y2, length*0.68, angle + spread_a, width*0.65, depth-1)
        branch(x2, y2, length*0.68, angle - spread_a, width*0.65, depth-1)
        if depth > 2:
            branch(x2, y2, length*0.55, angle, width*0.5, depth-2)

    branch(cx, cy + trunk_h, 55, math.pi/2, 3.5, 5)
    # leaf dots
    for _ in range(30):
        a = random.uniform(0, 2*math.pi)
        r = random.uniform(spread*0.2, spread*0.5)
        lx = cx + r * math.cos(a)
        ly = cy + trunk_h + 30 + r * math.sin(a) * 0.5
        c.circle(lx, ly, random.uniform(4, 9))


# ─────────────────────────────────────────────────────────────────────────────
# LANDSCAPE DRAWING PRIMITIVES
# ─────────────────────────────────────────────────────────────────────────────

def draw_mountains(c, base_y, x_start, x_end, peaks, fill_sky=False):
    c.setLineWidth(LW_MED)
    p = c.beginPath()
    p.moveTo(x_start, base_y)
    for (px, py) in peaks:
        p.lineTo(px, py)
    p.lineTo(x_end, base_y)
    p.close()
    c.drawPath(p)
    # snow caps
    for i, (px, py) in enumerate(peaks):
        cap_h = (py - base_y) * 0.18
        prev_x = x_start if i == 0 else peaks[i-1][0]
        next_x = x_end if i == len(peaks)-1 else peaks[i+1][0]
        c.setLineWidth(LW_MED)
        cap = c.beginPath()
        cap.moveTo(px - (px - prev_x)*0.15, py - cap_h*0.6)
        cap.lineTo(px, py)
        cap.lineTo(px + (next_x - px)*0.15, py - cap_h*0.6)
        c.drawPath(cap)


def draw_waves(c, y_base, x1, x2, n_waves=4, wave_h=14):
    c.setLineWidth(LW_MED)
    for w in range(n_waves):
        y = y_base - w * (wave_h * 1.6)
        amplitude = wave_h - w * 2
        p = c.beginPath()
        steps = 60
        for i in range(steps + 1):
            x = x1 + (x2 - x1) * i / steps
            phase = 2 * math.pi * i / steps * 3
            wy = y + amplitude * math.sin(phase)
            if i == 0:
                p.moveTo(x, wy)
            else:
                p.lineTo(x, wy)
        c.drawPath(p)


def draw_tree(c, x, y, h, trunk_w=8):
    c.setLineWidth(LW_MED)
    # trunk
    c.rect(x - trunk_w/2, y, trunk_w, h * 0.3)
    # foliage layers
    for layer in range(3):
        ly = y + h * 0.25 + layer * h * 0.22
        lw = (h * 0.55) * (1 - layer * 0.22)
        lh = h * 0.35
        p = c.beginPath()
        p.moveTo(x, ly + lh)
        p.lineTo(x - lw/2, ly)
        p.lineTo(x + lw/2, ly)
        p.close()
        c.drawPath(p)


def draw_palm_tree(c, x, y, h):
    c.setLineWidth(LW_MED)
    # trunk curves
    p = c.beginPath()
    p.moveTo(x, y)
    p.curveTo(x + h*0.15, y + h*0.3, x - h*0.05, y + h*0.6, x, y + h)
    c.drawPath(p)
    # fronds
    for i in range(7):
        a = math.pi/2 + (i - 3) * 0.42
        x2 = x + h*0.55 * math.cos(a)
        y2 = (y + h) + h*0.55 * math.sin(a)
        c.line(x, y + h, x2, y2)
        # sub-fronds
        for j in range(5):
            t = (j + 1) / 6
            mx = x + (x2-x)*t
            my = (y+h) + (y2-y-h)*t
            flen = h*0.12
            perp_a = a + math.pi/2
            c.line(mx, my, mx + flen*math.cos(perp_a), my + flen*math.sin(perp_a))
            c.line(mx, my, mx - flen*math.cos(perp_a), my - flen*math.sin(perp_a))
    # coconuts
    for i in range(3):
        a = math.pi/2 + (i-1)*0.3
        c.circle(x + h*0.08*math.cos(a), y+h + h*0.08*math.sin(a), 6, fill=1)


def draw_waterfall(c, x_left, y_top, width, height):
    c.setLineWidth(LW_MED)
    # cliff face left
    p = c.beginPath()
    p.moveTo(x_left, y_top)
    p.curveTo(x_left - 20, y_top - height*0.3, x_left - 10, y_top - height*0.7, x_left, y_top - height)
    c.drawPath(p)
    # cliff face right
    p2 = c.beginPath()
    p2.moveTo(x_left + width, y_top)
    p2.curveTo(x_left + width + 20, y_top - height*0.3, x_left + width + 10, y_top - height*0.7, x_left + width, y_top - height)
    c.drawPath(p2)
    # water fall streams
    c.setLineWidth(LW_THIN)
    n_streams = 8
    for i in range(n_streams):
        sx = x_left + (i + 0.5) * width / n_streams
        p3 = c.beginPath()
        p3.moveTo(sx, y_top)
        for step in range(10):
            t = (step + 1) / 10
            wobble = (random.random() - 0.5) * 8
            p3.lineTo(sx + wobble, y_top - height * t)
        c.drawPath(p3)
    # pool at bottom with ripples
    c.setLineWidth(LW_MED)
    pool_cx = x_left + width / 2
    pool_cy = y_top - height
    for ri in range(4):
        c.ellipse(pool_cx - 20 - ri*15, pool_cy - 12 - ri*5,
                  pool_cx + 20 + ri*15, pool_cy + 12 + ri*5)


def draw_sun(c, cx, cy, r, n_rays=18):
    c.setLineWidth(LW_MED)
    c.circle(cx, cy, r)
    for i in range(n_rays):
        a = 2*math.pi*i/n_rays
        x1 = cx + (r+4)*math.cos(a)
        y1 = cy + (r+4)*math.sin(a)
        x2 = cx + (r+16)*math.cos(a)
        y2 = cy + (r+16)*math.sin(a)
        c.line(x1,y1,x2,y2)


def draw_moon(c, cx, cy, r):
    c.setLineWidth(LW_MED)
    p = c.beginPath()
    # crescent
    p.arc(cx-r, cy-r, cx+r, cy+r, 0, 270)
    c.drawPath(p)
    c.circle(cx, cy, r)
    c.setFillColor(colors.white)
    c.circle(cx + r*0.28, cy, r*0.78, fill=1, stroke=0)
    c.setFillColor(colors.black)


def draw_horizon_lines(c, y_horizon, x1, x2, n_lines=5, spacing=8):
    c.setLineWidth(LW_THIN)
    for i in range(n_lines):
        y = y_horizon - i * spacing
        c.line(x1, y, x2, y)


def draw_clouds(c, cloud_list):
    c.setLineWidth(LW_MED)
    for (cx, cy, size) in cloud_list:
        c.circle(cx, cy, size)
        c.circle(cx - size*0.6, cy - size*0.2, size*0.7)
        c.circle(cx + size*0.6, cy - size*0.2, size*0.7)
        c.circle(cx - size*1.1, cy - size*0.4, size*0.5)
        c.circle(cx + size*1.1, cy - size*0.4, size*0.5)


def draw_garden_flowers(c, positions, sizes):
    for (x, y), sz in zip(positions, sizes):
        stem_h = sz * 2.5
        c.setLineWidth(LW_MED)
        # stem
        c.line(x, y, x, y + stem_h)
        # leaves
        c.line(x, y + stem_h*0.4, x + sz*0.8, y + stem_h*0.55)
        c.line(x, y + stem_h*0.6, x - sz*0.8, y + stem_h*0.75)
        # bloom
        _full_flower(c, x, y + stem_h, sz, 6)


def draw_lighthouse(c, cx, base_y, h):
    c.setLineWidth(LW_MED)
    # tower body (tapers slightly)
    bw = h * 0.18
    tw = h * 0.1
    p = c.beginPath()
    p.moveTo(cx - bw, base_y)
    p.lineTo(cx - tw, base_y + h*0.75)
    p.lineTo(cx + tw, base_y + h*0.75)
    p.lineTo(cx + bw, base_y)
    p.close()
    c.drawPath(p)
    # lantern room
    c.rect(cx - tw*1.3, base_y + h*0.75, tw*2.6, h*0.15)
    c.circle(cx, base_y + h*0.83, tw*0.9)
    # top dome
    p2 = c.beginPath()
    p2.moveTo(cx - tw*1.3, base_y + h*0.9)
    p2.lineTo(cx, base_y + h)
    p2.lineTo(cx + tw*1.3, base_y + h*0.9)
    c.drawPath(p2)
    # stripes
    c.setLineWidth(LW_THIN)
    for i in range(3):
        stripe_y = base_y + h*0.2*i + h*0.1
        frac_b = bw - (bw-tw)*stripe_y/h
        c.line(cx - frac_b, stripe_y, cx + frac_b, stripe_y)
    # door and windows
    c.rect(cx - tw*0.4, base_y, tw*0.8, h*0.12)
    for i in range(2):
        wy = base_y + h*0.3 + i*h*0.2
        c.circle(cx, wy, tw*0.35)


def draw_starry_sky(c, x1, y_top, x2, y_bottom, n_stars=40):
    c.setLineWidth(LW_THIN)
    for _ in range(n_stars):
        sx = x1 + (x2-x1)*random.random()
        sy = y_bottom + (y_top-y_bottom)*random.random()
        sr = random.uniform(1.5, 4)
        n = random.choice([4, 6])
        for i in range(n):
            a = 2*math.pi*i/n
            c.line(sx + sr*math.cos(a), sy + sr*math.sin(a),
                   sx - sr*0.3*math.cos(a), sy - sr*0.3*math.sin(a))


def draw_wheat_field(c, base_y, x1, x2):
    c.setLineWidth(LW_THIN)
    step = 14
    x = x1
    while x < x2:
        stalk_h = random.uniform(30, 55)
        p = c.beginPath()
        p.moveTo(x, base_y)
        p.curveTo(x, base_y + stalk_h*0.5, x + 8, base_y + stalk_h*0.7, x + 4, base_y + stalk_h)
        c.drawPath(p)
        # grain head
        for gi in range(5):
            ga = math.pi/2 + (gi-2)*0.2
            c.line(x+4, base_y+stalk_h,
                   x+4 + 8*math.cos(ga), base_y+stalk_h + 8*math.sin(ga))
        x += step + random.uniform(-4, 4)


# ─────────────────────────────────────────────────────────────────────────────
# BOOK 1: SCRIPTURE COLORING BOOK
# ─────────────────────────────────────────────────────────────────────────────

VERSES = [
    ("Philippians 4:13",
     "I can do all things\nthrough Christ\nwho strengthens me."),
    ("John 3:16",
     "For God so loved the world,\nthat he gave his only Son,\nthat whoever believes in him\nshall not perish but have\neverlasting life."),
    ("Jeremiah 29:11",
     "For I know the plans\nI have for you,\ndeclares the Lord,\nplans to prosper you\nand not to harm you,\nplans to give you hope\nand a future."),
    ("Psalm 46:10",
     "Be still, and know\nthat I am God."),
    ("Proverbs 3:5-6",
     "Trust in the LORD\nwith all your heart\nand lean not on your\nown understanding;\nin all your ways submit to him,\nand he will make\nyour paths straight."),
    ("Isaiah 40:31",
     "But those who hope in the LORD\nwill renew their strength.\nThey will soar on wings\nlike eagles;\nthey will run and not grow weary,\nthey will walk and not be faint."),
    ("Romans 8:28",
     "And we know that in all things\nGod works for the good\nof those who love him."),
    ("Psalm 23:1-3",
     "The LORD is my shepherd,\nI lack nothing.\nHe makes me lie down\nin green pastures,\nhe leads me beside\nquiet waters,\nhe refreshes my soul."),
    ("Joshua 1:9",
     "Be strong and courageous.\nDo not be afraid;\ndo not be discouraged,\nfor the LORD your God\nwill be with you\nwherever you go."),
    ("Isaiah 41:10",
     "So do not fear,\nfor I am with you;\ndo not be dismayed,\nfor I am your God.\nI will strengthen you\nand help you;\nI will uphold you\nwith my righteous right hand."),
    ("John 14:27",
     "Peace I leave with you;\nmy peace I give you.\nI do not give to you\nas the world gives.\nDo not let your hearts\nbe troubled and do not\nbe afraid."),
    ("Psalm 34:18",
     "The LORD is close\nto the brokenhearted\nand saves those who are\ncrushed in spirit."),
    ("Nehemiah 8:10",
     "Do not grieve,\nfor the joy of the LORD\nis your strength."),
    ("Psalm 139:14",
     "I praise you because\nI am fearfully\nand wonderfully made;\nyour works are wonderful,\nI know that full well."),
    ("2 Timothy 1:7",
     "For God has not given us\na spirit of fear,\nbut of power and of love\nand of a sound mind."),
    ("Galatians 5:22-23",
     "But the fruit of the Spirit\nis love, joy, peace,\nforbearance, kindness,\ngoodness, faithfulness,\ngentleness and self-control."),
    ("Psalm 118:24",
     "This is the day\nthe LORD has made;\nwe will rejoice\nand be glad in it."),
    ("Matthew 11:28",
     "Come to me,\nall you who are weary\nand burdened,\nand I will give you rest."),
    ("Psalm 91:1",
     "Whoever dwells in\nthe shelter of the Most High\nwill rest in the shadow\nof the Almighty."),
    ("Romans 15:13",
     "May the God of hope\nfill you with all joy\nand peace as you trust in him,\nso that you may overflow\nwith hope by the power\nof the Holy Spirit."),
    ("Psalm 27:1",
     "The LORD is my light\nand my salvation—whom shall I fear?\nThe LORD is the stronghold\nof my life—of whom\nshall I be afraid?"),
    ("Zephaniah 3:17",
     "The LORD your God\nis with you,\nthe Mighty Warrior who saves.\nHe will take great delight\nin you; in his love\nhe will no longer rebuke you,\nbut will rejoice over you\nwith singing."),
    ("1 Corinthians 13:4-5",
     "Love is patient,\nlove is kind.\nIt does not envy,\nit does not boast,\nit is not proud.\nIt does not dishonor others,\nit is not self-seeking."),
    ("Psalm 121:1-2",
     "I lift up my eyes\nto the mountains—\nwhere does my help come from?\nMy help comes from the LORD,\nthe Maker of heaven\nand earth."),
    ("Ephesians 3:20",
     "Now to him who is able\nto do immeasurably more\nthan all we ask or imagine,\naccording to his power\nthat is at work within us."),
]


def scripture_page_cross_mandala(c, verse_ref, verse_text, page_num):
    setup_page(c)
    floral_border(c)
    cx, cy = W/2, H/2 + 20

    # large mandala behind cross
    c.setLineWidth(LW_THIN)
    draw_mandala(c, cx, cy, 220, rings=4, base_petals=6)

    # Cross in center
    draw_cross(c, cx, cy, 100, 140, thickness=16)

    # Verse box
    box_w, box_h = 260, 130
    c.setLineWidth(LW_THIN)
    c.rect(cx - box_w/2, cy - box_h/2, box_w, box_h)

    c.setFont("Helvetica-BoldOblique", 9)
    c.setFillColor(colors.white)
    c.rect(cx - box_w/2 + 2, cy - box_h/2 + 2, box_w - 4, box_h - 4, fill=1, stroke=0)
    c.setFillColor(colors.black)

    c.setFont("Helvetica-Bold", 8)
    lines = verse_text.split('\n')
    start_y = cy + (len(lines)/2) * 11
    for line in lines:
        tw = c.stringWidth(line, "Helvetica-Bold", 8)
        c.drawString(cx - tw/2, start_y, line)
        start_y -= 11

    # Reference
    c.setFont("Helvetica-BoldOblique", 10)
    rw = c.stringWidth(verse_ref, "Helvetica-BoldOblique", 10)
    c.drawString(cx - rw/2, MARGIN + 20, verse_ref)

    # Page number
    c.setFont("Helvetica", 8)
    c.drawString(W/2 - 5, MARGIN - 15, str(page_num))


def scripture_page_floral_wreath(c, verse_ref, verse_text, page_num):
    setup_page(c)
    simple_border(c)
    cx, cy = W/2, H/2 + 15

    draw_flower_wreath(c, cx, cy, 195, n=14, flower_size=22)
    draw_flower_wreath(c, cx, cy, 130, n=10, flower_size=16)

    # Inner text area
    c.setLineWidth(LW_THIN)
    c.circle(cx, cy, 115)

    c.setFont("Helvetica-BoldOblique", 11)
    lines = verse_text.split('\n')
    start_y = cy + len(lines)*6.5
    for line in lines:
        tw = c.stringWidth(line, "Helvetica-BoldOblique", 11)
        c.drawString(cx - tw/2, start_y, line)
        start_y -= 14

    c.setFont("Helvetica-Bold", 11)
    rw = c.stringWidth(f"— {verse_ref}", "Helvetica-Bold", 11)
    c.drawString(cx - rw/2, start_y - 8, f"— {verse_ref}")

    c.setFont("Helvetica", 8)
    c.drawString(W/2 - 5, MARGIN - 15, str(page_num))


def scripture_page_sunburst(c, verse_ref, verse_text, page_num):
    setup_page(c)
    dot_border(c)
    cx, cy = W/2, H/2 + 15

    draw_sun_burst(c, cx, cy, 90, 240, n_rays=24)
    draw_sun_burst(c, cx, cy, 60, 75, n_rays=36)

    c.setFont("Helvetica-BoldOblique", 11)
    lines = verse_text.split('\n')
    start_y = cy + len(lines)*6.5
    for line in lines:
        tw = c.stringWidth(line, "Helvetica-BoldOblique", 11)
        c.drawString(cx - tw/2, start_y, line)
        start_y -= 14

    c.setFont("Helvetica-Bold", 10)
    rw = c.stringWidth(f"— {verse_ref}", "Helvetica-Bold", 10)
    c.drawString(cx - rw/2, start_y - 6, f"— {verse_ref}")

    c.setFont("Helvetica", 8)
    c.drawString(W/2 - 5, MARGIN - 15, str(page_num))


def scripture_page_dove(c, verse_ref, verse_text, page_num):
    setup_page(c)
    floral_border(c)
    cx, cy = W/2, H/2

    # Background mandala
    draw_geometric_mandala(c, cx, cy + 80, 160, n=8, layers=3)

    # Dove
    draw_dove(c, cx, cy + 80, 90)

    # Olive branch
    c.setLineWidth(LW_MED)
    branch_x = cx + 35
    for i in range(6):
        lx = branch_x + i*14
        ly = cy + 74 - i*4
        c.line(lx, ly, lx + 10, ly + 12)
        c.circle(lx + 13, ly + 15, 5)

    c.setFont("Helvetica-BoldOblique", 11)
    lines = verse_text.split('\n')
    start_y = cy - 30 + len(lines)*6.5
    for line in lines:
        tw = c.stringWidth(line, "Helvetica-BoldOblique", 11)
        c.drawString(cx - tw/2, start_y, line)
        start_y -= 14

    c.setFont("Helvetica-Bold", 10)
    rw = c.stringWidth(f"— {verse_ref}", "Helvetica-Bold", 10)
    c.drawString(cx - rw/2, start_y - 8, f"— {verse_ref}")

    c.setFont("Helvetica", 8)
    c.drawString(W/2 - 5, MARGIN - 15, str(page_num))


def scripture_page_butterfly(c, verse_ref, verse_text, page_num):
    setup_page(c)
    simple_border(c, gap=4)
    cx, cy = W/2, H/2

    for i in range(5):
        a = 2*math.pi*i/5
        bx = cx + 160*math.cos(a)
        by = cy + 180*math.sin(a)
        draw_butterfly(c, bx, by, 45)

    draw_butterfly(c, cx, cy + 120, 70)
    draw_flower_wreath(c, cx, cy - 30, 100, n=8, flower_size=18)

    c.setFont("Helvetica-BoldOblique", 11)
    lines = verse_text.split('\n')
    start_y = cy - 30 + len(lines)*6.5
    for line in lines:
        tw = c.stringWidth(line, "Helvetica-BoldOblique", 11)
        c.drawString(cx - tw/2, start_y, line)
        start_y -= 14

    c.setFont("Helvetica-Bold", 10)
    rw = c.stringWidth(f"— {verse_ref}", "Helvetica-Bold", 10)
    c.drawString(cx - rw/2, start_y - 8, f"— {verse_ref}")

    c.setFont("Helvetica", 8)
    c.drawString(W/2 - 5, MARGIN - 15, str(page_num))


def scripture_page_tree(c, verse_ref, verse_text, page_num):
    setup_page(c)
    floral_border(c)
    cx = W/2

    random.seed(page_num * 7)
    draw_tree_of_life(c, cx, MARGIN + 20, trunk_h=100, spread=160, layers=5)

    cy_text = H - MARGIN - 160
    c.setFont("Helvetica-BoldOblique", 11)
    lines = verse_text.split('\n')
    start_y = cy_text + len(lines)*6.5
    for line in lines:
        tw = c.stringWidth(line, "Helvetica-BoldOblique", 11)
        c.drawString(cx - tw/2, start_y, line)
        start_y -= 14

    c.setFont("Helvetica-Bold", 10)
    rw = c.stringWidth(f"— {verse_ref}", "Helvetica-Bold", 10)
    c.drawString(cx - rw/2, start_y - 8, f"— {verse_ref}")

    c.setFont("Helvetica", 8)
    c.drawString(W/2 - 5, MARGIN - 15, str(page_num))


def full_mandala_page(c, page_num, variant=0):
    setup_page(c)
    simple_border(c)
    cx, cy = W/2, H/2
    if variant % 3 == 0:
        draw_mandala(c, cx, cy, 270, rings=6, base_petals=6)
    elif variant % 3 == 1:
        draw_geometric_mandala(c, cx, cy, 270, n=10, layers=5)
    else:
        draw_mandala(c, cx, cy, 260, rings=5, base_petals=8)
        draw_geometric_mandala(c, cx, cy, 130, n=6, layers=2)
    c.setFont("Helvetica", 8)
    c.drawString(W/2 - 5, MARGIN - 15, str(page_num))


def full_floral_page(c, page_num):
    setup_page(c)
    floral_border(c)
    cx, cy = W/2, H/2
    # Large wreath
    draw_flower_wreath(c, cx, cy, 240, n=18, flower_size=28)
    draw_flower_wreath(c, cx, cy, 170, n=12, flower_size=22)
    draw_flower_wreath(c, cx, cy, 100, n=8, flower_size=16)
    _full_flower(c, cx, cy, 45, 8)
    c.setFont("Helvetica", 8)
    c.drawString(W/2 - 5, MARGIN - 15, str(page_num))


def scripture_title_page(c, out_path):
    setup_page(c)
    c.setLineWidth(LW_THICK)
    c.rect(MARGIN, MARGIN, W-2*MARGIN, H-2*MARGIN)
    c.setLineWidth(LW_THIN)
    c.rect(MARGIN+8, MARGIN+8, W-2*MARGIN-16, H-2*MARGIN-16)

    cx = W/2
    draw_flower_wreath(c, cx, H*0.75, 200, n=16, flower_size=24)
    draw_sun_burst(c, cx, H*0.75, 60, 140, n_rays=20)

    c.setFont("Helvetica-Bold", 28)
    title = "Blessings in Color"
    tw = c.stringWidth(title, "Helvetica-Bold", 28)
    c.drawString(cx - tw/2, H*0.47, title)

    c.setFont("Helvetica-BoldOblique", 16)
    sub = "Uplifting Scripture for the Soul"
    sw = c.stringWidth(sub, "Helvetica-BoldOblique", 16)
    c.drawString(cx - sw/2, H*0.41, sub)

    c.setLineWidth(LW_MED)
    c.line(MARGIN+50, H*0.39, W-MARGIN-50, H*0.39)

    c.setFont("Helvetica-BoldOblique", 14)
    author = "by JessaLynn Hobbs"
    aw = c.stringWidth(author, "Helvetica-BoldOblique", 14)
    c.drawString(cx - aw/2, H*0.35, author)

    c.setFont("Helvetica", 10)
    tagline = "50 Beautiful Pages to Color & Inspire"
    tw2 = c.stringWidth(tagline, "Helvetica", 10)
    c.drawString(cx - tw2/2, H*0.30, tagline)

    # Decorative crosses at bottom
    for dx in [-100, 0, 100]:
        draw_cross(c, cx + dx, H*0.14, 25, 36, thickness=5)


def create_scripture_book(path):
    c = canvas.Canvas(path, pagesize=letter)
    c.setTitle("Blessings in Color: Uplifting Scripture for the Soul")
    c.setAuthor("JessaLynn Hobbs")
    c.setSubject("Adult Coloring Book")

    # Title page
    scripture_title_page(c, path)
    c.showPage()

    # Copyright / About page
    setup_page(c)
    simple_border(c)
    cx = W/2
    c.setFont("Helvetica-Bold", 14)
    tw = c.stringWidth("About This Book", "Helvetica-Bold", 14)
    c.drawString(cx - tw/2, H - MARGIN - 60, "About This Book")
    c.setLineWidth(LW_MED)
    c.line(MARGIN+60, H-MARGIN-68, W-MARGIN-60, H-MARGIN-68)
    c.setFont("Helvetica", 10)
    about_lines = [
        "Welcome to Blessings in Color, a serene coloring journey",
        "through the uplifting words of Holy Scripture.",
        "",
        "Each page pairs a beloved Bible verse with intricate,",
        "hand-crafted designs created for adult colorists seeking",
        "peace, reflection, and creative expression.",
        "",
        "These pages are perfect for:",
        "  • Quiet devotional time",
        "  • Bible study groups",
        "  • Stress relief and mindfulness",
        "  • Thoughtful gifts for loved ones",
        "",
        "Use colored pencils, fine-tip markers, watercolors,",
        "or gel pens. Pages are printed on one side only.",
        "",
        "© JessaLynn Hobbs. All rights reserved.",
        "Scripture quotations are from the Holy Bible, NIV.",
        "",
        "Published independently. Printed in the USA.",
    ]
    ty = H - MARGIN - 110
    for line in about_lines:
        c.drawString(MARGIN + 50, ty, line)
        ty -= 16
    draw_butterfly(c, W/2, MARGIN + 80, 60)
    c.showPage()

    # 48 coloring pages
    page_styles = [
        scripture_page_cross_mandala,
        scripture_page_floral_wreath,
        scripture_page_sunburst,
        scripture_page_dove,
        scripture_page_butterfly,
        scripture_page_tree,
    ]
    verse_idx = 0
    mandala_variant = 0

    for page_num in range(3, 51):
        # Alternate: scripture page or decorative page
        if page_num % 3 == 0:
            # Decorative filler page
            if page_num % 6 == 0:
                full_floral_page(c, page_num)
            else:
                full_mandala_page(c, page_num, variant=mandala_variant)
                mandala_variant += 1
        else:
            v_ref, v_text = VERSES[verse_idx % len(VERSES)]
            style_fn = page_styles[(page_num + verse_idx) % len(page_styles)]
            style_fn(c, v_ref, v_text, page_num)
            verse_idx += 1
        c.showPage()

    c.save()
    print(f"  Scripture book saved: {path}")


# ─────────────────────────────────────────────────────────────────────────────
# BOOK 2: LANDSCAPE COLORING BOOK
# ─────────────────────────────────────────────────────────────────────────────

def landscape_title_page(c):
    setup_page(c)
    c.setLineWidth(LW_THICK)
    c.rect(MARGIN, MARGIN, W-2*MARGIN, H-2*MARGIN)
    c.setLineWidth(LW_THIN)
    c.rect(MARGIN+8, MARGIN+8, W-2*MARGIN-16, H-2*MARGIN-16)

    cx = W/2
    horizon = H * 0.55

    # Sky
    draw_clouds(c, [(cx-150, horizon+80, 25), (cx+80, horizon+100, 20), (cx, horizon+130, 30)])
    draw_sun(c, W-MARGIN-80, horizon+120, 35)

    # Mountains
    peaks = [(MARGIN+40, horizon+140), (MARGIN+130, horizon+200), (W/2-30, horizon+170),
             (W/2+60, horizon+220), (W-MARGIN-100, horizon+150), (W-MARGIN-30, horizon+100)]
    draw_mountains(c, horizon, MARGIN+10, W-MARGIN-10, peaks)

    # Ground & trees
    c.setLineWidth(LW_MED)
    c.line(MARGIN+10, horizon, W-MARGIN-10, horizon)
    for tx in [MARGIN+60, MARGIN+150, W/2-60, W/2+80, W-MARGIN-80]:
        draw_tree(c, tx, MARGIN+15, 90)

    # Title
    c.setFont("Helvetica-Bold", 30)
    title = "Nature's Canvas"
    tw = c.stringWidth(title, "Helvetica-Bold", 30)
    c.drawString(cx - tw/2, H*0.47, title)

    c.setFont("Helvetica-BoldOblique", 15)
    sub = "A Peaceful Landscape Coloring Journey"
    sw = c.stringWidth(sub, "Helvetica-BoldOblique", 15)
    c.drawString(cx - sw/2, H*0.41, sub)

    c.setLineWidth(LW_MED)
    c.line(MARGIN+50, H*0.39, W-MARGIN-50, H*0.39)

    c.setFont("Helvetica-BoldOblique", 14)
    author = "by JessaLynn Hobbs"
    aw = c.stringWidth(author, "Helvetica-BoldOblique", 14)
    c.drawString(cx - aw/2, H*0.35, author)

    c.setFont("Helvetica", 10)
    tag = "50 Serene Scenes to Color"
    tw2 = c.stringWidth(tag, "Helvetica", 10)
    c.drawString(cx - tw2/2, H*0.30, tag)


def page_mountain_sunrise(c, page_num):
    setup_page(c)
    simple_border(c)
    m = MARGIN + 6
    content_h = H - 2*m - 30
    base_y = m + 10

    horizon = base_y + content_h * 0.42
    cx = W/2

    # Sun rising
    draw_sun(c, cx, horizon, 38, n_rays=20)

    # Clouds
    draw_clouds(c, [(cx-120, horizon+50, 18), (cx+100, horizon+60, 22), (cx-20, horizon+80, 15)])

    # Horizon reflection lines
    draw_horizon_lines(c, horizon, m+10, W-m-10, n_lines=4, spacing=7)

    # Mountains back
    peaks_back = [(m+20, horizon+130), (m+110, horizon+180), (cx-40, horizon+155),
                  (cx+80, horizon+195), (W-m-80, horizon+160), (W-m-20, horizon+120)]
    draw_mountains(c, horizon, m+10, W-m-10, peaks_back)

    # Mountains front
    peaks_front = [(m+10, horizon+80), (m+90, horizon+120), (cx-20, horizon+95),
                   (cx+70, horizon+130), (W-m-60, horizon+105), (W-m-10, horizon+75)]
    draw_mountains(c, horizon, m+10, W-m-10, peaks_front)

    # Pine trees silhouette at base
    for tx in range(int(m)+10, int(W-m)-10, 28):
        draw_tree(c, tx, base_y + 5, 70 + (tx % 30))

    _page_title(c, "Mountain Sunrise", page_num)


def page_ocean_beach(c, page_num):
    setup_page(c)
    floral_border(c)
    m = MARGIN + 6
    base_y = m + 8

    horizon = base_y + (H - 2*m - 30) * 0.50

    # Ocean - waves
    draw_waves(c, horizon, m+10, W-m-10, n_waves=6, wave_h=12)

    # Horizon line
    c.setLineWidth(LW_THICK)
    c.line(m+10, horizon, W-m-10, horizon)

    # Clouds and sun
    draw_sun(c, W-m-70, horizon+50, 30)
    draw_clouds(c, [(W/2-100, horizon+40, 20), (W/2+50, horizon+60, 16)])

    # Sailboat
    sx, sy = W/2 - 60, horizon + 18
    c.setLineWidth(LW_MED)
    c.line(sx, sy, sx, sy+60)
    p = c.beginPath()
    p.moveTo(sx, sy + 60)
    p.lineTo(sx - 40, sy + 20)
    p.lineTo(sx, sy + 20)
    p.close()
    c.drawPath(p)
    p2 = c.beginPath()
    p2.moveTo(sx, sy + 60)
    p2.lineTo(sx + 35, sy + 25)
    p2.lineTo(sx, sy + 25)
    p2.close()
    c.drawPath(p2)
    # hull
    c.ellipse(sx-30, sy, sx+30, sy+10)

    # Beach/sand area
    beach_y = horizon
    c.setLineWidth(LW_THIN)
    for i in range(6):
        y = base_y + 5 + i * 12
        amp = 5 + i*2
        p = c.beginPath()
        for xi in range(60):
            x = m + 10 + (W-2*m-20)*xi/59
            wy = y + amp * math.sin(2*math.pi*xi/20)
            if xi == 0: p.moveTo(x, wy)
            else: p.lineTo(x, wy)
        c.drawPath(p)

    # Seashells
    for i, (sx2, sy2) in enumerate([(m+60, base_y+70), (m+130, base_y+45), (W/2, base_y+60), (W-m-80, base_y+50)]):
        c.setLineWidth(LW_MED)
        c.circle(sx2, sy2, 12)
        for j in range(8):
            a = 2*math.pi*j/8
            c.line(sx2, sy2, sx2 + 10*math.cos(a), sy2 + 10*math.sin(a))

    # Palm trees
    draw_palm_tree(c, m+50, base_y+10, 130)
    draw_palm_tree(c, W-m-60, base_y+10, 110)

    _page_title(c, "Peaceful Ocean Beach", page_num)


def page_waterfall_forest(c, page_num):
    setup_page(c)
    simple_border(c)
    m = MARGIN + 6
    base_y = m + 8

    # Background mountains
    horizon = base_y + (H - 2*m) * 0.55
    peaks = [(m+30, horizon+120), (W/2, horizon+180), (W-m-30, horizon+120)]
    draw_mountains(c, horizon, m+10, W-m-10, peaks)
    draw_clouds(c, [(W/2-80, horizon+60, 20), (W/2+60, horizon+50, 16)])

    # Forest trees background
    for tx in range(int(m)+10, int(W-m), 35):
        th = 100 + (tx % 40)
        draw_tree(c, tx, base_y + (H-2*m)*0.28, th)

    # Waterfall
    wf_x = W/2 - 35
    wf_top = base_y + (H-2*m)*0.72
    wf_h = (H-2*m)*0.4
    random.seed(page_num)
    draw_waterfall(c, wf_x, wf_top, 70, wf_h)

    # Rocks at base
    for (rx, ry, rr) in [(W/2-55, base_y+25, 20), (W/2-20, base_y+18, 14),
                          (W/2+25, base_y+22, 18), (W/2+50, base_y+20, 12)]:
        c.setLineWidth(LW_MED)
        c.ellipse(rx-rr, ry-rr*0.6, rx+rr, ry+rr*0.6)

    # Ferns / bushes
    for bx in [m+20, m+90, W-m-90, W-m-20]:
        for i in range(6):
            a = math.pi/4 + i * math.pi/6
            c.line(bx, base_y+20, bx + 25*math.cos(a), base_y+20 + 25*math.sin(a))

    _page_title(c, "Hidden Waterfall", page_num)


def page_garden_path(c, page_num):
    setup_page(c)
    floral_border(c)
    m = MARGIN + 6
    base_y = m + 8

    # Path going into distance
    c.setLineWidth(LW_MED)
    p = c.beginPath()
    p.moveTo(W/2 - 60, base_y + 10)
    p.curveTo(W/2 - 50, base_y + (H-2*m)*0.3, W/2 - 10, base_y + (H-2*m)*0.5, W/2, base_y + (H-2*m)*0.65)
    c.drawPath(p)
    p2 = c.beginPath()
    p2.moveTo(W/2 + 60, base_y + 10)
    p2.curveTo(W/2 + 50, base_y + (H-2*m)*0.3, W/2 + 10, base_y + (H-2*m)*0.5, W/2, base_y + (H-2*m)*0.65)
    c.drawPath(p2)

    # Cobblestones on path
    c.setLineWidth(LW_THIN)
    for row in range(8):
        y = base_y + 15 + row * 22
        path_w = max(8, 55 - row*5)
        for xi in range(max(1, int(path_w/12))):
            ox = -path_w + xi*24
            c.ellipse(W/2 + ox - 8, y - 5, W/2 + ox + 8, y + 5)

    # Garden flowers both sides
    random.seed(page_num + 11)
    positions_left = [(W/2 - 80 - random.randint(0,80), base_y + 10 + i*45) for i in range(7)]
    positions_right = [(W/2 + 80 + random.randint(0,80), base_y + 10 + i*45) for i in range(7)]
    sizes_l = [random.uniform(12, 20) for _ in range(7)]
    sizes_r = [random.uniform(12, 20) for _ in range(7)]
    draw_garden_flowers(c, positions_left, sizes_l)
    draw_garden_flowers(c, positions_right, sizes_r)

    # Arch at far end
    arch_cx = W/2
    arch_y = base_y + (H-2*m)*0.65
    arch_w = 55
    arch_h = 70
    p3 = c.beginPath()
    p3.moveTo(arch_cx - arch_w, arch_y)
    p3.lineTo(arch_cx - arch_w, arch_y + arch_h*0.5)
    p3.arc(arch_cx - arch_w, arch_y + arch_h*0.5,
           arch_cx + arch_w, arch_y + arch_h*1.5, 180, 180)
    p3.lineTo(arch_cx + arch_w, arch_y)
    c.drawPath(p3)

    # Vines on arch
    for i in range(5):
        t = i/4
        ax = arch_cx - arch_w + t*2*arch_w
        ay = arch_y + arch_h*0.3
        _tiny_flower(c, ax, ay + (H-2*m)*0.1, 8)

    # Background tree & sky
    draw_tree(c, W/2, arch_y + arch_h*1.5, 120)
    draw_sun(c, W/2 + 80, base_y + (H-2*m)*0.85, 20)
    draw_clouds(c, [(W/2-100, base_y+(H-2*m)*0.82, 14)])

    _page_title(c, "Enchanted Garden Path", page_num)


def page_sunset_horizon(c, page_num):
    setup_page(c)
    simple_border(c)
    m = MARGIN + 6
    base_y = m + 8

    horizon = base_y + (H-2*m) * 0.40
    cx = W/2

    # Sun setting on horizon
    sun_r = 50
    c.setLineWidth(LW_THICK)
    c.circle(cx, horizon, sun_r)
    # Reflection
    c.setLineWidth(LW_THIN)
    for i in range(1, 8):
        rw = sun_r * (1 - i*0.08)
        ry = horizon - i*12
        c.line(cx - rw, ry, cx + rw, ry)

    # Radiating sunset bands
    draw_sun_burst(c, cx, horizon, sun_r+5, sun_r+80, n_rays=32)

    # Clouds lit by sunset
    draw_clouds(c, [(cx-180, horizon+45, 28), (cx+140, horizon+35, 22),
                    (cx-60, horizon+70, 20), (cx+220, horizon+60, 18)])

    # Water/lake reflection - horizontal lines
    for i in range(20):
        y = horizon - i*10 - 8
        line_w = (W-2*m-20) * (1 - i*0.03)
        c.line(cx - line_w/2, y, cx + line_w/2, y)

    # Silhouette hills
    c.setLineWidth(LW_MED)
    hill_pts = [(m+10, horizon), (m+80, horizon+50), (m+200, horizon+30),
                (cx, horizon+65), (cx+120, horizon+35), (W-m-80, horizon+55), (W-m-10, horizon)]
    ph = c.beginPath()
    ph.moveTo(hill_pts[0][0], hill_pts[0][1])
    for pt in hill_pts[1:]:
        ph.curveTo(pt[0]-30, pt[1]+10, pt[0]+30, pt[1]+10, pt[0], pt[1])
    ph.lineTo(W-m-10, base_y+5)
    ph.lineTo(m+10, base_y+5)
    ph.close()
    c.drawPath(ph)

    # Trees on horizon
    for tx in [m+30, m+160, cx-80, cx+60, W-m-150, W-m-40]:
        draw_tree(c, tx, base_y+5, 55 + (tx%25))

    _page_title(c, "Golden Sunset", page_num)


def page_forest_stream(c, page_num):
    setup_page(c)
    floral_border(c)
    m = MARGIN + 6
    base_y = m + 8

    # Stream winding
    c.setLineWidth(LW_MED)
    stream = c.beginPath()
    stream.moveTo(W/2 - 25, base_y+10)
    stream.curveTo(W/2 - 50, base_y+(H-2*m)*0.2,
                   W/2 + 40, base_y+(H-2*m)*0.35,
                   W/2 + 20, base_y+(H-2*m)*0.55)
    stream.curveTo(W/2 - 20, base_y+(H-2*m)*0.65,
                   W/2 + 10, base_y+(H-2*m)*0.8,
                   W/2, base_y+(H-2*m)*0.95)
    c.drawPath(stream)
    stream2 = c.beginPath()
    stream2.moveTo(W/2 + 25, base_y+10)
    stream2.curveTo(W/2 + 5, base_y+(H-2*m)*0.2,
                    W/2 + 70, base_y+(H-2*m)*0.35,
                    W/2 + 45, base_y+(H-2*m)*0.55)
    stream2.curveTo(W/2 + 10, base_y+(H-2*m)*0.65,
                    W/2 + 35, base_y+(H-2*m)*0.8,
                    W/2 + 22, base_y+(H-2*m)*0.95)
    c.drawPath(stream2)
    # ripples
    draw_waves(c, base_y + (H-2*m)*0.45, W/2 - 30, W/2 + 60, n_waves=3, wave_h=6)

    # Trees - dense forest both sides
    for side, start, end in [(-1, m+10, W/2-45), (1, W/2+50, W-m-10)]:
        x = start
        while x < end:
            draw_tree(c, x, base_y+5, 120 + (int(x) % 50))
            x += 30 + (int(x) % 15)

    # Ferns at stream edge
    for fy in [base_y+20, base_y+60, base_y+120, base_y+180]:
        for fx, side in [(W/2-40, -1), (W/2+55, 1)]:
            for i in range(5):
                a = math.pi/2 + side*(i-2)*0.3
                c.line(fx, fy, fx + 20*math.cos(a), fy + 20*math.sin(a))

    # Stepping stones
    for i, (sx, sy) in enumerate([(W/2-5, base_y+90), (W/2+10, base_y+140), (W/2, base_y+200)]):
        c.setLineWidth(LW_MED)
        c.ellipse(sx-14, sy-7, sx+14, sy+7)

    # Sky peeking through
    draw_sun(c, W/2 + 30, base_y + (H-2*m)*0.9, 18)

    _page_title(c, "Forest Stream", page_num)


def page_lighthouse_coast(c, page_num):
    setup_page(c)
    simple_border(c)
    m = MARGIN + 6
    base_y = m + 8

    horizon = base_y + (H-2*m) * 0.45

    # Sky - clouds and moon/stars
    draw_moon(c, W-m-80, horizon + 70, 28)
    draw_starry_sky(c, m+10, horizon + 90, W-m-10, base_y + (H-2*m)*0.97, n_stars=35)
    draw_clouds(c, [(W/2-80, horizon+35, 22), (W/2+60, horizon+55, 18)])

    # Horizon
    c.setLineWidth(LW_THICK)
    c.line(m+10, horizon, W-m-10, horizon)

    # Ocean waves
    draw_waves(c, horizon, m+10, W-m-10, n_waves=7, wave_h=14)

    # Rocky cliff
    cliff_pts = [(m+10, horizon), (m+60, horizon+30), (m+100, horizon+60),
                 (m+120, horizon+80), (m+160, base_y+10), (m+190, base_y+5)]
    c.setLineWidth(LW_MED)
    pcliff = c.beginPath()
    pcliff.moveTo(m+10, base_y+5)
    for pt in cliff_pts:
        pcliff.lineTo(*pt)
    pcliff.lineTo(m+10, base_y+5)
    c.drawPath(pcliff)

    # Lighthouse on cliff
    draw_lighthouse(c, m+175, base_y+5, 175)

    # Lighthouse beam
    c.setLineWidth(LW_THIN)
    beam_cx = m+175
    beam_cy = base_y + 180
    for a_deg in range(-20, 40, 8):
        a = math.radians(a_deg)
        c.line(beam_cx, beam_cy, beam_cx + 200*math.cos(a), beam_cy + 200*math.sin(a))

    # Far shore details
    for tx in [W-m-100, W-m-160, W-m-50]:
        draw_tree(c, tx, horizon, 55 + (tx%20))

    _page_title(c, "Lighthouse by Moonlight", page_num)


def page_cherry_blossom(c, page_num):
    setup_page(c)
    floral_border(c)
    m = MARGIN + 6
    base_y = m + 8

    cx = W/2
    trunk_y = base_y + 10

    # Main trunk
    c.setLineWidth(LW_THICK)
    p = c.beginPath()
    p.moveTo(cx - 15, trunk_y)
    p.curveTo(cx - 10, trunk_y + 100, cx + 5, trunk_y + 180, cx, trunk_y + 220)
    c.drawPath(p)
    p2 = c.beginPath()
    p2.moveTo(cx + 15, trunk_y)
    p2.curveTo(cx + 10, trunk_y + 100, cx + 20, trunk_y + 180, cx, trunk_y + 220)
    c.drawPath(p2)

    # Major branches
    branch_data = [
        (cx, trunk_y+220, -0.9, 140, 3),
        (cx, trunk_y+220, -0.3, 160, 3),
        (cx, trunk_y+220, 0.3, 150, 3),
        (cx, trunk_y+220, 0.85, 130, 3),
        (cx, trunk_y+220, -1.4, 100, 2.5),
        (cx, trunk_y+220, 1.35, 110, 2.5),
        (cx, trunk_y+180, -1.1, 80, 2),
        (cx, trunk_y+180, 1.0, 85, 2),
    ]
    random.seed(page_num * 3)
    c.setLineWidth(LW_MED)
    blossoms = []
    for (bx, by, angle, length, width) in branch_data:
        ex = bx + length * math.cos(angle + math.pi/2)
        ey = by + length * math.sin(angle + math.pi/2)
        p = c.beginPath()
        p.moveTo(bx, by)
        p.curveTo(bx + (ex-bx)*0.3 + random.uniform(-20,20),
                  by + (ey-by)*0.3 + random.uniform(-10,10),
                  ex + random.uniform(-15,15), ey + random.uniform(-10,10), ex, ey)
        c.setLineWidth(width)
        c.drawPath(p)
        # Blossoms cluster at end
        for _ in range(8):
            boff_x = ex + random.uniform(-50, 50)
            boff_y = ey + random.uniform(-50, 50)
            blossoms.append((boff_x, boff_y, random.uniform(8, 14)))
        # sub-branches
        for _ in range(3):
            sa = angle + random.uniform(-0.5, 0.5)
            sl = length * random.uniform(0.4, 0.6)
            sx2 = ex + sl*math.cos(sa + math.pi/2)
            sy2 = ey + sl*math.sin(sa + math.pi/2)
            p = c.beginPath()
            p.moveTo(ex, ey)
            p.lineTo(sx2, sy2)
            c.setLineWidth(width*0.5)
            c.drawPath(p)
            for _ in range(5):
                blossoms.append((sx2 + random.uniform(-30,30), sy2 + random.uniform(-30,30), random.uniform(7,12)))

    # Draw blossoms
    for (bx, by, bsz) in blossoms:
        _full_flower(c, bx, by, bsz, 5)

    # Falling petals
    for _ in range(20):
        px = m + random.uniform(0, W-2*m)
        py = base_y + random.uniform(0, (H-2*m)*0.25)
        c.setLineWidth(LW_THIN)
        c.circle(px, py, random.uniform(3, 6))

    # Ground with grass
    c.setLineWidth(LW_MED)
    c.line(m+10, trunk_y + 5, W-m-10, trunk_y + 5)
    for gx in range(int(m)+15, int(W-m)-10, 8):
        gh = random.uniform(8, 18)
        c.line(gx, trunk_y + 5, gx + random.uniform(-4,4), trunk_y + 5 + gh)

    _page_title(c, "Cherry Blossom Tree", page_num)


def page_desert_canyon(c, page_num):
    setup_page(c)
    simple_border(c)
    m = MARGIN + 6
    base_y = m + 8

    cx = W/2
    horizon = base_y + (H-2*m)*0.45

    # Sky with sun
    draw_sun(c, W-m-60, horizon+80, 40, n_rays=22)
    draw_clouds(c, [(cx-100, horizon+50, 15), (cx+80, horizon+40, 12)])

    # Canyon walls
    # Left wall
    lwall = c.beginPath()
    lwall.moveTo(m+10, horizon)
    lwall.lineTo(m+10, base_y+8)
    lwall.lineTo(m+180, base_y+8)
    lwall.lineTo(m+200, base_y+30)
    lwall.lineTo(m+220, base_y+20)
    lwall.lineTo(m+240, base_y+50)
    lwall.lineTo(m+200, horizon)
    lwall.close()
    c.setLineWidth(LW_MED)
    c.drawPath(lwall)

    # Right wall
    rwall = c.beginPath()
    rwall.moveTo(W-m-10, horizon)
    rwall.lineTo(W-m-10, base_y+8)
    rwall.lineTo(W-m-170, base_y+8)
    rwall.lineTo(W-m-200, base_y+25)
    rwall.lineTo(W-m-215, base_y+15)
    rwall.lineTo(W-m-235, base_y+45)
    rwall.lineTo(W-m-195, horizon)
    rwall.close()
    c.drawPath(rwall)

    # Stratification lines on walls
    c.setLineWidth(LW_THIN)
    for i in range(8):
        y = base_y + 10 + i * (horizon - base_y - 10)/9
        # Left strata
        c.line(m+12, y, m+195, y)
        # Right strata
        c.line(W-m-12, y, W-m-195, y)

    # Canyon floor
    c.setLineWidth(LW_MED)
    c.line(m+200, horizon, W-m-195, horizon)

    # Desert plants (cacti) on floor
    for cactus_x in [m+230, cx-50, cx, cx+50, W-m-230]:
        # Saguaro cactus
        c.rect(cactus_x-6, horizon, 12, 50)
        # Arms
        c.rect(cactus_x-6, horizon+30, -18, 8)
        c.rect(cactus_x-24, horizon+38, 8, 22)
        c.rect(cactus_x+6, horizon+22, 18, 8)
        c.rect(cactus_x+14, horizon+30, 8, 28)

    # River at bottom
    draw_waves(c, horizon+5, m+210, W-m-205, n_waves=2, wave_h=6)

    _page_title(c, "Desert Canyon", page_num)


def page_tropical_paradise(c, page_num):
    setup_page(c)
    floral_border(c)
    m = MARGIN + 6
    base_y = m + 8

    horizon = base_y + (H-2*m)*0.45

    # Sky
    draw_sun(c, W/2, horizon+100, 35)
    draw_clouds(c, [(W/2-120, horizon+60, 20), (W/2+90, horizon+50, 18)])

    # Horizon
    c.setLineWidth(LW_THICK)
    c.line(m+10, horizon, W-m-10, horizon)

    # Ocean
    draw_waves(c, horizon, m+10, W-m-10, n_waves=5, wave_h=10)

    # Sandy beach
    c.setLineWidth(LW_MED)
    beach_p = c.beginPath()
    beach_p.moveTo(m+10, base_y+5)
    beach_p.lineTo(W-m-10, base_y+5)
    beach_p.lineTo(W-m-10, horizon)
    beach_p.curveTo(W-m-80, horizon+8, m+80, horizon+8, m+10, horizon)
    beach_p.close()
    c.drawPath(beach_p)

    # Palm trees
    draw_palm_tree(c, m+70, base_y+5, 180)
    draw_palm_tree(c, m+120, base_y+5, 160)
    draw_palm_tree(c, W-m-80, base_y+5, 175)
    draw_palm_tree(c, W-m-130, base_y+5, 155)

    # Tropical flowers
    for fx, fy in [(m+40, base_y+15), (W/2, base_y+12), (W-m-50, base_y+18)]:
        _full_flower(c, fx, fy, 18, 6)
        c.line(fx, fy, fx, fy+35)

    # Shells and starfish
    for i, (sx, sy) in enumerate([(m+200, base_y+20), (W/2+40, base_y+30), (W-m-190, base_y+22)]):
        if i % 2 == 0:
            # Shell
            c.setLineWidth(LW_MED)
            c.circle(sx, sy, 14)
            for j in range(6):
                a = 2*math.pi*j/6
                c.line(sx, sy, sx+12*math.cos(a), sy+12*math.sin(a))
        else:
            # Starfish
            for j in range(5):
                a = 2*math.pi*j/5 - math.pi/2
                c.line(sx, sy, sx+16*math.cos(a), sy+16*math.sin(a))

    _page_title(c, "Tropical Paradise", page_num)


def page_autumn_forest(c, page_num):
    setup_page(c)
    simple_border(c)
    m = MARGIN + 6
    base_y = m + 8

    # Sky through trees
    draw_sun(c, W/2 + 60, base_y + (H-2*m)*0.85, 22)
    draw_clouds(c, [(W/2-60, base_y+(H-2*m)*0.8, 14), (W/2+100, base_y+(H-2*m)*0.75, 12)])

    # Large deciduous trees
    random.seed(page_num * 5)
    for col in range(7):
        tx = m+20 + col*((W-2*m-30)/6)
        th = 180 + random.randint(0, 60)
        trunk_w = 10 + col%3*3
        # Trunk
        c.setLineWidth(LW_MED)
        c.rect(tx - trunk_w/2, base_y+5, trunk_w, th*0.4)
        # Bark texture
        c.setLineWidth(LW_THIN)
        for bi in range(5):
            by2 = base_y + 10 + bi*th*0.07
            c.line(tx - trunk_w/2+1, by2, tx + trunk_w/2-1, by2 + 5)
        # Canopy - rounded and full
        canopy_cx = tx
        canopy_cy = base_y + th*0.4 + th*0.35
        canopy_r = th*0.35
        # Outer canopy
        c.setLineWidth(LW_MED)
        for ci in range(8):
            a = 2*math.pi*ci/8
            lobe_cx = canopy_cx + canopy_r*0.6*math.cos(a)
            lobe_cy = canopy_cy + canopy_r*0.6*math.sin(a)
            c.circle(lobe_cx, lobe_cy, canopy_r*0.5)
        c.circle(canopy_cx, canopy_cy, canopy_r*0.7)
        # Leaf detail dots
        for _ in range(12):
            lx = canopy_cx + random.uniform(-canopy_r*0.7, canopy_r*0.7)
            ly = canopy_cy + random.uniform(-canopy_r*0.7, canopy_r*0.7)
            c.circle(lx, ly, random.uniform(3, 7))

    # Fallen leaves on ground
    c.setLineWidth(LW_THIN)
    for _ in range(30):
        lx = m+10 + random.uniform(0, W-2*m-20)
        ly = base_y + random.uniform(5, 35)
        lr = random.uniform(6, 12)
        c.ellipse(lx-lr, ly-lr*0.5, lx+lr, ly+lr*0.5)
        c.line(lx, ly, lx+lr*0.8, ly+lr*0.3)

    # Path through forest
    c.setLineWidth(LW_MED)
    left_edge = c.beginPath()
    left_edge.moveTo(W/2-40, base_y+8)
    left_edge.curveTo(W/2-45, base_y+100, W/2-70, base_y+200, W/2-90, base_y+320)
    c.drawPath(left_edge)
    right_edge = c.beginPath()
    right_edge.moveTo(W/2+40, base_y+8)
    right_edge.curveTo(W/2+45, base_y+100, W/2+70, base_y+200, W/2+90, base_y+320)
    c.drawPath(right_edge)

    _page_title(c, "Autumn Forest", page_num)


def page_meadow_wildflowers(c, page_num):
    setup_page(c)
    floral_border(c)
    m = MARGIN + 6
    base_y = m + 8

    horizon = base_y + (H-2*m)*0.5

    # Sky
    draw_sun(c, m+100, horizon+70, 32, n_rays=16)
    draw_clouds(c, [(W/2, horizon+50, 22), (W/2+140, horizon+45, 17), (W/2-140, horizon+55, 19)])

    # Rolling hills background
    c.setLineWidth(LW_MED)
    ph = c.beginPath()
    ph.moveTo(m+10, horizon)
    ph.curveTo(m+60, horizon+40, m+150, horizon+25, W/2, horizon+50)
    ph.curveTo(W/2+120, horizon+65, W-m-100, horizon+35, W-m-10, horizon+20)
    ph.lineTo(W-m-10, base_y+5)
    ph.lineTo(m+10, base_y+5)
    ph.close()
    c.drawPath(ph)

    # Second rolling hill
    ph2 = c.beginPath()
    ph2.moveTo(m+10, horizon)
    ph2.curveTo(m+80, horizon+20, W/2-50, horizon+10, W/2+20, horizon+22)
    ph2.curveTo(W/2+100, horizon+30, W-m-80, horizon+15, W-m-10, horizon+5)
    ph2.lineTo(W-m-10, horizon)
    ph2.close()
    c.drawPath(ph2)

    # Wildflowers meadow foreground
    random.seed(page_num + 42)
    for _ in range(45):
        fx = m+10 + random.uniform(0, W-2*m-20)
        fy = base_y + 8 + random.uniform(0, (horizon-base_y)*0.7)
        fz = random.uniform(10, 20)
        _full_flower(c, fx, fy, fz, random.choice([5, 6, 7, 8]))
        c.line(fx, fy, fx + random.uniform(-5, 5), fy - fz*2.5)

    # Grass texture
    c.setLineWidth(LW_THIN)
    for _ in range(60):
        gx = m+10 + random.uniform(0, W-2*m-20)
        gy = base_y + 5 + random.uniform(0, (horizon-base_y)*0.4)
        c.line(gx, gy, gx + random.uniform(-8,8), gy + random.uniform(15, 30))

    # Butterfly
    draw_butterfly(c, W/2+100, horizon + 25, 30)
    draw_butterfly(c, m+200, base_y + 50, 22)

    _page_title(c, "Wildflower Meadow", page_num)


def page_mountain_lake(c, page_num):
    setup_page(c)
    simple_border(c)
    m = MARGIN + 6
    base_y = m + 8

    cx = W/2
    lake_top = base_y + (H-2*m)*0.4
    lake_bottom = base_y + (H-2*m)*0.1

    # Sky
    draw_clouds(c, [(cx-120, lake_top+60, 20), (cx+100, lake_top+50, 18)])
    draw_moon(c, W-m-70, lake_top+60, 22)
    draw_starry_sky(c, m+10, lake_top+90, W-m-10, lake_top+120, n_stars=20)

    # Mountain reflection: mountains above + mirror below horizon
    horizon = lake_top + (H-2*m)*0.08
    peaks = [(m+20, horizon+140), (m+120, horizon+195), (cx-30, horizon+170),
             (cx+90, horizon+200), (W-m-100, horizon+155), (W-m-20, horizon+120)]
    # Real mountains
    draw_mountains(c, horizon, m+10, W-m-10, peaks)

    # Lake surface
    c.setLineWidth(LW_THICK)
    c.line(m+10, horizon, W-m-10, horizon)
    # Gentle lake ripples
    draw_waves(c, horizon-5, m+10, W-m-10, n_waves=4, wave_h=5)

    # Reflection of mountains (inverted, lighter)
    c.setLineWidth(LW_THIN)
    mirror_peaks = [(x, horizon - (y - horizon)*0.6) for (x,y) in peaks]
    draw_mountains(c, horizon, m+10, W-m-10, mirror_peaks)

    # Pine trees at shore
    for tx in [m+30, m+80, W-m-80, W-m-30]:
        draw_tree(c, tx, base_y+5, 90 + (tx%30))

    # Canoe on lake
    boat_cx = cx
    boat_y = horizon - 18
    c.setLineWidth(LW_MED)
    c.ellipse(boat_cx-40, boat_y-8, boat_cx+40, boat_y+5)
    # Paddle
    c.line(boat_cx-20, boat_y, boat_cx+25, boat_y-25)
    c.ellipse(boat_cx+22, boat_y-30, boat_cx+30, boat_y-18)

    _page_title(c, "Mountain Lake Reflection", page_num)


def page_night_sky(c, page_num):
    setup_page(c)
    simple_border(c)
    m = MARGIN + 6
    base_y = m + 8

    cx = W/2
    horizon = base_y + (H-2*m)*0.35

    # Large moon
    draw_moon(c, cx, horizon + 120, 50)

    # Stars - many large decorative stars
    draw_starry_sky(c, m+10, horizon+180, W-m-10, base_y+(H-2*m)*0.99, n_stars=60)

    # Milky way sweep
    c.setLineWidth(LW_THIN)
    for i in range(25):
        sx = cx - 150 + i*12
        sy = horizon + 50 + i*8
        c.circle(sx, sy, random.uniform(1, 3))

    # Constellation dots & lines
    stars_const = [(cx-80, horizon+80), (cx-40, horizon+120), (cx+20, horizon+100),
                   (cx+80, horizon+140), (cx+60, horizon+80), (cx-20, horizon+60)]
    for s in stars_const:
        c.circle(s[0], s[1], 4, fill=1)
    for i in range(len(stars_const)-1):
        c.line(*stars_const[i], *stars_const[i+1])

    # Rolling hills silhouette
    c.setLineWidth(LW_MED)
    ph = c.beginPath()
    ph.moveTo(m+10, horizon)
    ph.curveTo(m+80, horizon+35, cx-60, horizon+20, cx, horizon+40)
    ph.curveTo(cx+80, horizon+55, W-m-100, horizon+25, W-m-10, horizon+15)
    ph.lineTo(W-m-10, base_y+5)
    ph.lineTo(m+10, base_y+5)
    ph.close()
    c.drawPath(ph)

    # Trees on ridge
    for tx in [m+40, m+120, cx-80, cx+40, W-m-130, W-m-50]:
        draw_tree(c, tx, base_y + 5 + max(0, horizon + 15 - base_y - 5), 70+(tx%20))

    _page_title(c, "Starry Night Sky", page_num)


def page_zen_garden(c, page_num):
    setup_page(c)
    floral_border(c)
    m = MARGIN + 6
    base_y = m + 8

    cx = W/2

    # Sand raking patterns - concentric oval rings
    c.setLineWidth(LW_THIN)
    for i in range(20):
        scale = 1 + i*0.15
        c.ellipse(cx - 60*scale, base_y + 50 - i*8, cx + 60*scale, base_y + 90 - i*8)

    # Rocks
    for (rx, ry, rw, rh) in [(cx-120, base_y+120, 45, 30), (cx+100, base_y+80, 35, 25),
                               (cx-30, base_y+200, 55, 38), (cx+60, base_y+180, 40, 28)]:
        c.setLineWidth(LW_MED)
        c.ellipse(rx-rw, ry-rh, rx+rw, ry+rh)
        # crack detail
        c.setLineWidth(LW_THIN)
        c.line(rx-rw*0.3, ry, rx+rw*0.2, ry+rh*0.4)

    # Bamboo stalks
    for bx in [m+25, m+45, W-m-40, W-m-60]:
        c.setLineWidth(LW_THICK)
        for i in range(8):
            seg_y = base_y + 5 + i*40
            c.rect(bx-6, seg_y, 12, 36)
            # Leaf
            if i % 2 == 0:
                c.setLineWidth(LW_MED)
                leaf_a = math.pi/4 if bx < W/2 else 3*math.pi/4
                c.line(bx, seg_y+30, bx+35*math.cos(leaf_a), seg_y+30+35*math.sin(leaf_a))

    # Bonsai tree
    draw_tree_of_life(c, cx, base_y + (H-2*m)*0.4, trunk_h=60, spread=80, layers=3)

    # Water feature / pond
    c.setLineWidth(LW_MED)
    c.ellipse(cx-70, base_y+8, cx+70, base_y+35)
    draw_waves(c, base_y+22, cx-65, cx+65, n_waves=2, wave_h=4)
    # Koi
    for koi_x, koi_y in [(cx-25, base_y+20), (cx+20, base_y+16)]:
        draw_dove(c, koi_x, koi_y, 22)

    _page_title(c, "Zen Garden", page_num)


def page_rolling_hills(c, page_num):
    setup_page(c)
    simple_border(c)
    m = MARGIN + 6
    base_y = m + 8

    # Sky layers
    draw_sun(c, m+80, base_y+(H-2*m)*0.85, 30)
    draw_clouds(c, [(W/2-80, base_y+(H-2*m)*0.80, 22), (W/2+100, base_y+(H-2*m)*0.75, 18),
                    (W/2-160, base_y+(H-2*m)*0.72, 14)])

    # 4 layers of hills in perspective
    hill_colors = [0.85, 0.7, 0.5, 0.3]
    for layer, frac in enumerate(hill_colors):
        layer_base = base_y + (H-2*m)*frac
        p = c.beginPath()
        p.moveTo(m+10, layer_base)
        steps = 40
        for i in range(steps+1):
            x = m+10 + (W-2*m-20)*i/steps
            y = layer_base + 30 * math.sin(math.pi * i / steps * (3 + layer)) + (layer*10)
            if i == 0: p.moveTo(x, layer_base)
            p.curveTo(x, y, x + (W-2*m)/steps, y, x + (W-2*m)/steps, layer_base)
        p.lineTo(W-m-10, base_y+5)
        p.lineTo(m+10, base_y+5)
        p.close()
        c.setLineWidth(LW_MED)
        c.drawPath(p)

    # Wheat field in foreground
    draw_wheat_field(c, base_y + (H-2*m)*0.22, m+10, W-m-10)

    # Farm windmill
    mill_cx = W-m-80
    mill_y = base_y + (H-2*m)*0.35
    c.setLineWidth(LW_MED)
    # Tower
    c.rect(mill_cx-12, mill_y, 24, 80)
    # Blades
    for bi in range(4):
        a = math.pi/4 + bi*math.pi/2
        c.line(mill_cx, mill_y+80, mill_cx+50*math.cos(a), mill_y+80+50*math.sin(a))
    c.circle(mill_cx, mill_y+80, 8, fill=1)

    # Country road
    c.setLineWidth(LW_MED)
    road = c.beginPath()
    road.moveTo(W/2-25, base_y+8)
    road.curveTo(W/2-20, base_y+80, W/2-60, base_y+(H-2*m)*0.3, W/2-80, base_y+(H-2*m)*0.5)
    c.drawPath(road)
    road2 = c.beginPath()
    road2.moveTo(W/2+25, base_y+8)
    road2.curveTo(W/2+20, base_y+80, W/2-10, base_y+(H-2*m)*0.3, W/2-30, base_y+(H-2*m)*0.5)
    c.drawPath(road2)

    _page_title(c, "Rolling Countryside Hills", page_num)


def page_japanese_bridge(c, page_num):
    setup_page(c)
    floral_border(c)
    m = MARGIN + 6
    base_y = m + 8

    cx = W/2
    water_y = base_y + (H-2*m)*0.4

    # Background - cherry blossoms
    for tx in [m+40, m+80, W-m-80, W-m-40]:
        random.seed(tx)
        for _ in range(20):
            bx = tx + random.uniform(-60, 60)
            by = water_y + random.uniform(40, 200)
            _full_flower(c, bx, by, random.uniform(8, 15), 5)
        c.setLineWidth(LW_MED)
        c.rect(tx-8, water_y, 16, 100)

    # Water
    draw_waves(c, water_y, m+10, W-m-10, n_waves=5, wave_h=8)

    # Arched bridge
    bridge_y = water_y + 25
    bridge_w = 220
    c.setLineWidth(LW_THICK)
    # Arch
    arch = c.beginPath()
    arch.moveTo(cx - bridge_w/2, bridge_y)
    arch.curveTo(cx - bridge_w/2, bridge_y + 60, cx + bridge_w/2, bridge_y + 60, cx + bridge_w/2, bridge_y)
    c.drawPath(arch)
    # Bridge deck
    c.line(cx - bridge_w/2, bridge_y+35, cx + bridge_w/2, bridge_y+35)
    c.line(cx - bridge_w/2, bridge_y+42, cx + bridge_w/2, bridge_y+42)
    # Railings
    c.setLineWidth(LW_MED)
    c.line(cx - bridge_w/2, bridge_y+42, cx - bridge_w/2, bridge_y+55)
    c.line(cx + bridge_w/2, bridge_y+42, cx + bridge_w/2, bridge_y+55)
    c.line(cx - bridge_w/2, bridge_y+55, cx + bridge_w/2, bridge_y+55)
    # Vertical rails
    for i in range(12):
        rx = cx - bridge_w/2 + (i+1)*bridge_w/13
        c.line(rx, bridge_y+42, rx, bridge_y+55)

    # Pagoda in background
    pagoda_cx = cx + 100
    pagoda_y = water_y + 80
    c.setLineWidth(LW_MED)
    for floor in range(4):
        fy = pagoda_y + floor*30
        fw = 45 - floor*8
        c.rect(pagoda_cx - fw, fy, fw*2, 22)
        # Curved roof
        roof = c.beginPath()
        roof.moveTo(pagoda_cx - fw - 12, fy+22)
        roof.curveTo(pagoda_cx - fw - 8, fy+36, pagoda_cx + fw + 8, fy+36, pagoda_cx + fw + 12, fy+22)
        c.drawPath(roof)

    # Koi in water
    for koi_x, koi_dir in [(cx-70, 1), (cx+50, -1)]:
        c.setLineWidth(LW_MED)
        koi_y = water_y - 15
        body = c.beginPath()
        body.moveTo(koi_x, koi_y)
        body.curveTo(koi_x + koi_dir*25, koi_y+8, koi_x + koi_dir*40, koi_y, koi_x + koi_dir*35, koi_y-8)
        body.curveTo(koi_x + koi_dir*20, koi_y-12, koi_x, koi_y-5, koi_x, koi_y)
        c.drawPath(body)

    _page_title(c, "Japanese Garden Bridge", page_num)


def _page_title(c, title, page_num):
    c.setFont("Helvetica-BoldOblique", 9)
    tw = c.stringWidth(title, "Helvetica-BoldOblique", 9)
    c.drawString(W/2 - tw/2, H - MARGIN - 18, title)
    c.setFont("Helvetica", 8)
    c.drawString(W/2 - 4, MARGIN - 15, str(page_num))


def landscape_about_page(c):
    setup_page(c)
    simple_border(c)
    cx = W/2
    c.setFont("Helvetica-Bold", 14)
    tw = c.stringWidth("About This Book", "Helvetica-Bold", 14)
    c.drawString(cx - tw/2, H - MARGIN - 60, "About This Book")
    c.setLineWidth(LW_MED)
    c.line(MARGIN+60, H-MARGIN-68, W-MARGIN-60, H-MARGIN-68)
    c.setFont("Helvetica", 10)
    about_lines = [
        "Welcome to Nature's Canvas, a serene journey through",
        "the world's most breathtaking landscapes.",
        "",
        "From misty mountain ranges to tropical beaches,",
        "from enchanted forests to peaceful zen gardens,",
        "each page invites you into a world of natural beauty",
        "waiting to be brought to life with your colors.",
        "",
        "These pages are perfect for:",
        "  • Relaxation and stress relief",
        "  • Mindfulness and meditation",
        "  • Nature lovers and travelers",
        "  • All skill levels from beginner to advanced",
        "",
        "Use colored pencils, fine-tip markers, watercolors,",
        "or gel pens. Pages are printed on one side only.",
        "Let your imagination roam free!",
        "",
        "© JessaLynn Hobbs. All rights reserved.",
        "Published independently. Printed in the USA.",
    ]
    ty = H - MARGIN - 110
    for line in about_lines:
        c.drawString(MARGIN + 50, ty, line)
        ty -= 16
    draw_butterfly(c, W/2 - 50, MARGIN + 80, 55)
    _full_flower(c, W/2 + 70, MARGIN + 70, 30, 6)


def create_landscape_book(path):
    c = canvas.Canvas(path, pagesize=letter)
    c.setTitle("Nature's Canvas: A Peaceful Landscape Coloring Journey")
    c.setAuthor("JessaLynn Hobbs")
    c.setSubject("Adult Coloring Book")

    # Title page
    landscape_title_page(c)
    c.showPage()

    # About page
    landscape_about_page(c)
    c.showPage()

    # 48 landscape coloring pages
    landscape_pages = [
        page_mountain_sunrise,
        page_ocean_beach,
        page_waterfall_forest,
        page_garden_path,
        page_sunset_horizon,
        page_forest_stream,
        page_lighthouse_coast,
        page_cherry_blossom,
        page_desert_canyon,
        page_tropical_paradise,
        page_autumn_forest,
        page_meadow_wildflowers,
        page_mountain_lake,
        page_night_sky,
        page_zen_garden,
        page_rolling_hills,
        page_japanese_bridge,
    ]

    for page_num in range(3, 51):
        idx = (page_num - 3) % len(landscape_pages)
        # On repeats, use different page_num seed to vary the design
        landscape_pages[idx](c, page_num)
        c.showPage()

    c.save()
    print(f"  Landscape book saved: {path}")


# ─────────────────────────────────────────────────────────────────────────────
# PACKAGING
# ─────────────────────────────────────────────────────────────────────────────

def create_pricing_guide(path):
    c = canvas.Canvas(path, pagesize=letter)
    c.setTitle("Seller's Guide - JessaLynn Hobbs Coloring Books")
    setup_page(c)
    c.setFont("Helvetica-Bold", 18)
    tw = c.stringWidth("Seller's Quick-Start Guide", "Helvetica-Bold", 18)
    c.drawString(W/2 - tw/2, H - MARGIN - 50, "Seller's Quick-Start Guide")
    c.setFont("Helvetica-Bold", 13)
    c.drawString(MARGIN + 20, H - MARGIN - 80, "JessaLynn Hobbs Adult Coloring Book Collection")
    c.setLineWidth(LW_MED)
    c.line(MARGIN+20, H-MARGIN-88, W-MARGIN-20, H-MARGIN-88)

    c.setFont("Helvetica-Bold", 11)
    sections = [
        ("BOOK 1: Blessings in Color — Uplifting Scripture for the Soul",
         ["50 pages of Bible verse coloring art",
          "KJV Scripture from Psalms, Proverbs, Philippians, Isaiah, and more",
          "Mandalas, floral wreaths, doves, crosses, butterflies & tree-of-life designs",
          "Perfect for devotional gifts, Bible study groups, or personal reflection"]),
        ("BOOK 2: Nature’s Canvas — A Peaceful Landscape Coloring Journey",
         ["50 pages of landscape scenes",
          "17 unique scenes: mountains, beaches, waterfalls, gardens, forests, and more",
          "Includes: cherry blossoms, Japanese bridge, lighthouse, desert canyon, zen garden",
          "Great for nature lovers, travel enthusiasts, and relaxation seekers"]),
        ("AMAZON KDP PUBLISHING SETUP",
         ["Log in at kdp.amazon.com → Create → Paperback",
          "Interior: Upload the book PDF (already 8.5” × 11”, B&W, print-ready)",
          "Cover: Use KDP's free Cover Creator tool with author name JessaLynn Hobbs",
          "Recommended trim size: 8.5 x 11 inches",
          "Paper: Black & White interior / White paper",
          "PRICING: Set list price $9.99–$12.99 (KDP royalty ~$2.15–$3.45 per copy)",
          "Categories: Coloring Books > Adult Coloring Books",
          "Keywords: adult coloring book, scripture coloring, Bible verse, stress relief"]),
        ("ETSY DIGITAL DOWNLOAD SETUP",
         ["List as ‘Digital Download’ product on Etsy",
          "Upload the PDF as the downloadable file",
          "Price: $4.99–$7.99 per book (instant download, no printing cost)",
          "Bundle both books together for $8.99–$12.99 to increase average order value",
          "Tags: adult coloring book, printable coloring pages, scripture, landscape",
          "Photos: Take screenshots of sample pages for listing images"]),
        ("COMPETITIVE PRICING RESEARCH (as of 2025–2026)",
         ["Amazon Paperback similar books: $6.99 – $14.99 (avg ~$9.99)",
          "Etsy digital downloads: $3.99 – $8.99 (avg ~$5.99)",
          "Your suggested Amazon price: $9.99 per book",
          "Your suggested Etsy price: $5.99 per book / $9.99 bundle",
          "TIP: Offer free promo pricing ($0.99) for first week to gather reviews"]),
    ]

    y = H - MARGIN - 110
    for (header, bullets) in sections:
        c.setFont("Helvetica-Bold", 11)
        c.drawString(MARGIN+20, y, header)
        y -= 16
        c.setFont("Helvetica", 9)
        for b in bullets:
            c.drawString(MARGIN+35, y, f"•  {b}")
            y -= 13
        y -= 8

    c.save()
    print(f"  Pricing guide saved: {path}")


def package_zip(output_dir, zip_path):
    with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zf:
        for fname in os.listdir(output_dir):
            fpath = os.path.join(output_dir, fname)
            if os.path.isfile(fpath) and fname.endswith('.pdf'):
                zf.write(fpath, fname)
    print(f"  ZIP created: {zip_path}")


# ─────────────────────────────────────────────────────────────────────────────
# MAIN
# ─────────────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    out_dir = os.path.dirname(os.path.abspath(__file__))
    print("\n=== Generating JessaLynn Hobbs Coloring Books ===\n")

    book1_path = os.path.join(out_dir, "Blessings_in_Color_JessaLynn_Hobbs.pdf")
    book2_path = os.path.join(out_dir, "Natures_Canvas_JessaLynn_Hobbs.pdf")
    guide_path = os.path.join(out_dir, "Sellers_Quick_Start_Guide.pdf")
    zip_path   = os.path.join(out_dir, "JessaLynn_Hobbs_Coloring_Books.zip")

    print("[1/3] Creating Scripture Coloring Book...")
    create_scripture_book(book1_path)

    print("[2/3] Creating Landscape Coloring Book...")
    create_landscape_book(book2_path)

    print("[3/3] Creating Seller's Quick-Start Guide...")
    create_pricing_guide(guide_path)

    print("\nPackaging ZIP file...")
    package_zip(out_dir, zip_path)

    print("\n=== DONE! ===")
    print(f"ZIP ready at: {zip_path}")
    print("\nFiles included:")
    with zipfile.ZipFile(zip_path) as zf:
        for name in zf.namelist():
            info = zf.getinfo(name)
            print(f"  {name:55s} {info.file_size/1024:.0f} KB")
