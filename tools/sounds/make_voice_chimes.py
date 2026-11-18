"""Turns five short voice lines into soft pixel 'sprite speech': one blip per syllable.

Each syllable is (pitch in semitones from C5, length in seconds, glide in semitones).
A pitch of None is a soft breathy consonant (the "Psst"). Same ear-safe treatment
as sprite-1: triangle tone, slow fade-ins, low-passed, quiet, a few semitones down.
"""
import math
import os
import random
import struct
import sys
import wave

RATE = 44100
C5 = 523.25
out_dir = sys.argv[1]
random.seed(3)

LINES = {
    # "Hey! All done here."
    "voice-1": [(7, 0.16, 2), "pause", (4, 0.09, 0), (5, 0.11, 0), (2, 0.34, -2)],
    # "Psst... your task is ready."
    "voice-2": [(None, 0.16, 0), "pause", (2, 0.08, 0), (4, 0.11, 0), (2, 0.07, 0), (7, 0.12, 0), (4, 0.3, -1)],
    # "Hello again! I finished that for you."
    "voice-3": [(4, 0.09, 0), (7, 0.17, 1), (2, 0.07, 0), (5, 0.16, 0), "pause",
                (4, 0.08, 0), (5, 0.08, 0), (4, 0.08, 0), (2, 0.09, 0), (0, 0.08, 0), (0, 0.34, -1)],
    # "Ta-da! Take a look when you're ready."
    "voice-4": [(0, 0.1, 0), (7, 0.26, 0), "pause", (5, 0.09, 0), (4, 0.06, 0), (7, 0.13, 0),
                (5, 0.07, 0), (4, 0.07, 0), (9, 0.11, 0), (7, 0.3, -2)],
    # "Back to you, partner!"
    "voice-5": [(4, 0.11, 0), (5, 0.07, 0), (9, 0.2, 1), "pause", (7, 0.12, 0), (12, 0.3, -1)],
    # "Happy Birthday to you!" sung on the melody's opening phrase (sol sol la sol do ti)
    "birthday": [(2, 0.16, 0), (2, 0.07, 0), (4, 0.24, 0), (2, 0.24, 0), (7, 0.24, 0), (6, 0.48, 0)],
    # "Should auld acquaintance be forgot, and never brought to mind" (Auld Lang Syne, New Year)
    "new-year": [(-3, 0.22, 0), (2, 0.33, 0), (2, 0.11, 0), (2, 0.22, 0), (6, 0.22, 0),
                 (4, 0.33, 0), (2, 0.11, 0), (4, 0.22, 0), (6, 0.22, 0),
                 (2, 0.33, 0), (2, 0.11, 0), (6, 0.22, 0), (9, 0.22, 0), (11, 0.55, 0)],
}


def tri(phase):
    p = phase % 1.0
    return 4 * p - 1 if p < 0.5 else 3 - 4 * p


def blip(buf, start, dur, semis, glide):
    s0 = int(start * RATE)
    base = C5 * 2 ** ((semis - 3) / 12)  # three semitones down, like the soft sprite-1
    phase = 0.0
    for i in range(s0, min(len(buf), s0 + int(dur * RATE))):
        t = (i - s0) / RATE
        f = base * 2 ** ((glide * t / dur + 0.08 * math.sin(2 * math.pi * 7 * t)) / 12)
        phase += f / RATE
        env = min(1.0, t / 0.02) * math.exp(-t * 4) * min(1.0, (dur - t) / 0.025)
        # mostly triangle with a hint of square: a "voice-ish" pixel vowel
        tone = 0.85 * tri(phase) + 0.15 * (1 if phase % 1 < 0.5 else -1)
        buf[i] += tone * env


def breath(buf, start, dur):
    s0 = int(start * RATE)
    for i in range(s0, min(len(buf), s0 + int(dur * RATE))):
        t = (i - s0) / RATE
        buf[i] += random.uniform(-1, 1) * 0.35 * math.sin(math.pi * t / dur)


def lowpass(buf, cutoff):
    a = 1 - math.exp(-2 * math.pi * cutoff / RATE)
    y, out = 0.0, []
    for x in buf:
        y += a * (x - y)
        out.append(y)
    return out


def render(name, sylls):
    total = sum(0.14 if s == "pause" else s[1] + 0.025 for s in sylls) + 0.2
    buf = [0.0] * int(RATE * total)
    t = 0.0
    for s in sylls:
        if s == "pause":
            t += 0.14
            continue
        semis, dur, glide = s
        if semis is None:
            breath(buf, t, dur)
        else:
            blip(buf, t, dur, semis, glide)
        t += dur + 0.025
    buf = lowpass(lowpass(lowpass(buf, 3000), 1400), 1400)
    m = max(abs(x) for x in buf) or 1
    with wave.open(os.path.join(out_dir, name + ".wav"), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(RATE)
        w.writeframes(b"".join(struct.pack("<h", int(x / m * 0.25 * 32767)) for x in buf))


for name, sylls in LINES.items():
    render(name, sylls)
