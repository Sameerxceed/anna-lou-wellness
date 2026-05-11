"""Extract Vol2 blog articles to JSON.

Reads ALW BLOG Vol2 FINAL Sameer.docx, segments paragraphs into articles split by
the divider line "— ✦ —", and emits the 26 requested articles with title/body/excerpt/category.
"""
import sys, io, json, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
import docx

DOC = r'e:/Xceed/Code/Clients/anna-lou-wellness/Docs/ALW BLOG Vol2 FINAL Sameer.docx'
OUT = r'e:/Xceed/Code/Clients/anna-lou-wellness/cms/scripts/vol2-articles.json'

d = docx.Document(DOC)
paras = [p.text for p in d.paragraphs]

DIV = '— ✦ —'

# Split into article blocks by divider
blocks = []
cur = []
for t in paras:
    if t.strip() == DIV:
        if cur:
            blocks.append(cur)
            cur = []
    else:
        cur.append(t)
if cur:
    blocks.append(cur)

SECTION_PREFIXES = ('LIFESTYLE ', 'COACHING ', 'FOUNDERS', 'WORKSHOPS', 'MEDIA ', 'COMMUNITY')

def is_section_header(s):
    s = s.strip()
    if not s: return False
    if s.startswith(SECTION_PREFIXES): return True
    # bare-URL line
    if s.startswith('annalouwellness.com/'): return True
    return False

def parse_block(block):
    # Strip blanks
    lines = [l for l in block if l.strip()]
    if not lines:
        return None
    # Skip leading section-header / URL lines until we hit the actual article title
    i = 0
    while i < len(lines) and is_section_header(lines[i]):
        i += 1
    if i >= len(lines):
        return None
    title = lines[i].strip()
    rest = lines[i+1:]
    # Drop the section breadcrumb line (e.g. "SPIRITUAL HYGIENE  ·  annalouwellness.com")
    if rest and 'annalouwellness.com' in rest[0] and '·' in rest[0]:
        rest = rest[1:]
    # Strip trailing "Love and healing. Anna Lou x"
    body_lines = []
    for l in rest:
        ls = l.strip()
        if ls.startswith('Love and healing'):
            continue
        # Drop CTAs (lines starting with action verbs ending in →)
        if '→' in ls and 'annalouwellness.com' in ls:
            continue
        # Drop short trailing breadcrumb-style "annalouwellness.com/..."
        if ls.startswith('annalouwellness.com/'):
            continue
        body_lines.append(ls)
    body = '\n\n'.join([l for l in body_lines if l])
    return title, body

# Map titles -> required article index, with category
WANTED = [
    ("Building a daily practice", "spiritual-hygiene"),
    ("Energy clearing for the sceptics", "spiritual-hygiene"),
    ("The meaning behind the jewellery", "style-and-beauty"),
    ("The crystal guide", "rituals-and-energy"),
    ("The digital declutter", "decluttering"),
    ("The emotional declutter", "decluttering"),
    ("The relationship audit", "decluttering"),
    ("Trauma and the body", "burnout-and-nervous-system"),
    ("Recovering from narcissistic abuse", "breakups-and-reset"),
    ("Why I trained in trauma-informed coaching", "educational"),
    ("The attachment pattern that was running my relationships", "dating-and-patterns"),
    ("Dating after something hard", "dating-and-patterns"),
    ("The Heart-Led Business Day", "founder-reset"),
    ("Visibility anxiety", "founder-reset"),
    ("What a pendulum session actually involves", "spiritual-hygiene"),
    ("What spiritual coaching is", "spiritual-hygiene"),
    ("Breathwork", "burnout-and-nervous-system"),
    ("The body always speaks first", "burnout-and-nervous-system"),
    ("Surrendering and Raising Your Vibration", "rituals-and-energy"),
    ("Corporate nervous system wellbeing", "burnout-and-nervous-system"),
    ("Why I started making videos", "signal-vs-noise"),
    ("Why Amina and I started a podcast", "signal-vs-noise"),
    ("The episode that got the most responses", "signal-vs-noise"),
    ("Everything you want to know before your first Returning Circle", "friendship"),
    ("Why retreat days are not a luxury", "houseboat-life"),
    ("Why I kept the circle donation-based", "self-worth-and-identity"),
]

parsed = []
for b in blocks:
    p = parse_block(b)
    if p:
        parsed.append(p)

def find(prefix):
    for t, body in parsed:
        if t.lower().startswith(prefix.lower()):
            return t, body
    # fallback: contains
    for t, body in parsed:
        if prefix.lower() in t.lower():
            return t, body
    return None

def excerpt(body):
    # First 1-2 sentences
    text = body.replace('\n', ' ')
    parts = re.split(r'(?<=[\.\!\?])\s+', text)
    return ' '.join(parts[:2]).strip()

out = []
missing = []
for prefix, cat in WANTED:
    found = find(prefix)
    if not found:
        missing.append(prefix)
        continue
    title, body = found
    out.append({
        "title": title,
        "body": body,
        "excerpt": excerpt(body),
        "suggested_category_slug": cat,
    })

with open(OUT, 'w', encoding='utf-8') as f:
    json.dump(out, f, indent=2, ensure_ascii=False)

# Report
total_words = sum(len(a['body'].split()) for a in out)
cats = {}
for a in out:
    cats[a['suggested_category_slug']] = cats.get(a['suggested_category_slug'], 0) + 1

print(f"Articles found: {len(out)} / {len(WANTED)}")
print(f"Total word count (bodies): {total_words}")
print("Category distribution:")
for c, n in sorted(cats.items(), key=lambda x: -x[1]):
    print(f"  {c}: {n}")
if missing:
    print("Missing:")
    for m in missing:
        print(f"  - {m}")
