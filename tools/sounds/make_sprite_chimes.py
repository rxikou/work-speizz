"""Four soft, pixel-style three-note chimes ("a sprite talking to you"), 16-bit mono WAV.

Ear-safe by design: fundamentals stay between ~390 and ~880 Hz, edges are
softened by a gentle low-pass filter, every note has a short fade-in, and the
peak level is kept well under full scale.
"""
import math
import os
import struct
import sys
import wave

RATE = 44100
out_dir = sys.argv[1]


def tri(phase):
    p = phase % 1.0
    return 4 * p - 1 if p < 0.5 else 3 - 4 * p


def pulse(phase, duty):
    return 1.0 if (phase % 1.0) < duty else -1.0


def note(buf, start, dur, freq, wave_fn, decay=6.0, att=0.008, bend=0.0, vib=0.0):
    """Adds one note; bend = semitones of glide over the note, vib = vibrato depth in semitones."""
    s0 = int(start * RATE)
    phase = 0.0
    att = max(att, 0.02)  # softer: slower fade-in, no "tick" at note start
    freq *= 2 ** (-3 / 12)  # softer: three semitones lower
    for i in range(s0, min(len(buf), s0 + int(dur * RATE))):
        t = (i - s0) / RATE
        semis = bend * (t / dur) + vib * math.sin(2 * math.pi * 6 * t)
        f = freq * 2 ** (semis / 12)
        phase += f / RATE
        env = min(1.0, t / att) * math.exp(-t * decay)
        tail = min(1.0, (dur - t) / 0.02)  # no click at the end
        buf[i] += wave_fn(phase) * env * tail


def lowpass(buf, cutoff):
    a = 1 - math.exp(-2 * math.pi * cutoff / RATE)
    y, out = 0.0, []
    for x in buf:
        y += a * (x - y)
        out.append(y)
    return out


def crush(buf, hold, levels):
    """Sample-and-hold plus amplitude quantization: the 'pixelated' grit."""
    out, held = [], 0.0
    for i, x in enumerate(buf):
        if i % hold == 0:
            held = round(x * levels) / levels
        out.append(held)
    return out


def write(name, buf, peak=0.42):
    buf = lowpass(lowpass(buf, 1400), 1400)  # softer: round off the remaining brightness
    peak *= 0.6  # softer: quieter overall
    m = max(abs(s) for s in buf) or 1
    with wave.open(os.path.join(out_dir, name + ".wav"), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(RATE)
        w.writeframes(b"".join(struct.pack("<h", int(s / m * peak * 32767)) for s in buf))


def blank(sec):
    return [0.0] * int(RATE * sec)


# 1. "Hello there": rounded triangle notes rising C5-E5-G5, like a friendly greeting.
b = blank(0.85)
for k, f in enumerate([523.25, 659.25, 783.99]):
    note(b, k * 0.13, 0.5 if k == 2 else 0.16, f, tri, decay=5 if k == 2 else 9)
write("sprite-1", lowpass(b, 3200))

# 2. "Chatter": RPG dialogue blips, quick narrow-pulse talk sounds G4-B4-A4 with a little wobble.
b = blank(0.6)
for k, f in enumerate([392.0, 493.88, 440.0]):
    note(b, k * 0.11, 0.09 if k < 2 else 0.3, f, lambda p: pulse(p, 0.25), decay=10 if k < 2 else 7, att=0.006, vib=0.15)
write("sprite-2", lowpass(b, 2200), peak=0.36)

# 3. "Pixel lullaby": crunchy 4-bit triangle, E5-C5-G5 with longer tails, the most retro of the four.
b = blank(1.0)
for k, f in enumerate([659.25, 523.25, 783.99]):
    note(b, k * 0.15, 0.6, f, tri, decay=6)
write("sprite-3", lowpass(crush(b, hold=4, levels=8), 2800))

# 4. "Hm?": soft square D5-F#5-A5, the last note glides up a touch like a curious little question.
b = blank(0.8)
for k, f in enumerate([587.33, 739.99, 880.0]):
    last = k == 2
    note(b, k * 0.12, 0.42 if last else 0.12, f, lambda p: pulse(p, 0.5), decay=6 if last else 11, bend=1.0 if last else 0.0)
write("sprite-4", lowpass(b, 1800), peak=0.34)
