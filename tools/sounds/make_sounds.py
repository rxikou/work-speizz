"""Synthesizes several original notification sounds as 16-bit mono WAVs into a folder."""
import math
import os
import random
import struct
import sys
import wave

RATE = 44100
out_dir = sys.argv[1]


def blank(seconds):
    return [0.0] * int(RATE * seconds)


def add(buf, start, seconds, fn):
    s0 = int(start * RATE)
    for i in range(s0, min(len(buf), s0 + int(seconds * RATE))):
        buf[i] += fn((i - s0) / RATE)


def attack(t, a=0.004):
    return min(1.0, t / a)


def sine(f, t):
    return math.sin(2 * math.pi * f * t)


def write(name, buf, peak=0.8):
    m = max(abs(s) for s in buf) or 1
    with wave.open(os.path.join(out_dir, name + ".wav"), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(RATE)
        w.writeframes(b"".join(struct.pack("<h", int(s / m * peak * 32767)) for s in buf))


# 1. chime: two rising notes (the current sound)
b = blank(0.9)
for f, st in [(659.25, 0.0), (880.0, 0.12)]:
    add(b, st, 0.9, lambda t, f=f: attack(t) * math.exp(-t * 5.5) * (sine(f, t) + 0.25 * sine(2 * f, t)))
write("chime", b)

# 2. bell: one bright bell strike with inharmonic partials
b = blank(1.6)
partials = [(1.0, 1.0, 2.2), (2.76, 0.5, 3.5), (5.4, 0.25, 5.0), (8.9, 0.12, 7.0)]
add(b, 0, 1.6, lambda t: attack(t, 0.002) * sum(a * math.exp(-t * d) * sine(784 * r, t) for r, a, d in partials))
write("bell", b)

# 3. arpeggio: quick major triad going up
b = blank(1.0)
for f, st in [(523.25, 0.0), (659.25, 0.08), (783.99, 0.16), (1046.5, 0.24)]:
    add(b, st, 0.7, lambda t, f=f: attack(t) * math.exp(-t * 6) * (sine(f, t) + 0.2 * sine(3 * f, t)))
write("arpeggio", b)

# 4. pop: a short soft bubble pop (upward pitch sweep)
b = blank(0.25)
add(b, 0, 0.25, lambda t: attack(t, 0.002) * math.exp(-t * 28) * math.sin(2 * math.pi * (300 * t + 2400 * t * t)))
write("pop", b)

# 5. marimba: woody two-note fall
b = blank(0.8)
for f, st in [(698.46, 0.0), (523.25, 0.14)]:
    add(b, st, 0.6, lambda t, f=f: attack(t, 0.002) * (math.exp(-t * 9) * sine(f, t) + 0.35 * math.exp(-t * 30) * sine(4 * f, t)))
write("marimba", b)

# 6. retro: 8-bit square-wave "level clear" blips
b = blank(0.5)
for f, st in [(987.77, 0.0), (1318.5, 0.07)]:
    add(b, st, 0.35 if st else 0.07, lambda t, f=f: (1 if sine(f, t) >= 0 else -1) * 0.5 * math.exp(-t * 6))
write("retro", b, peak=0.45)

# 7. whoosh-ding: soft air swell then a gentle ding
random.seed(7)
b = blank(1.2)
add(b, 0, 0.3, lambda t: random.uniform(-1, 1) * 0.15 * math.sin(math.pi * t / 0.3))
add(b, 0.25, 0.95, lambda t: attack(t) * math.exp(-t * 4) * (sine(1174.7, t) + 0.3 * sine(2349.3, t)))
write("whoosh-ding", b)
