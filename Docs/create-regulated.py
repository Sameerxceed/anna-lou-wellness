"""
Create the REGULATED programme entry in Strapi from Anna's sales-page copy.

Reuses the existing Work · Programme template — no new schema, no new
frontend route. Lives at /the-work/regulated.

Sections mapped:
- Hero (title + tagline)
- Intro (opening narrative + 'The Truth')
- 'What You Actually Need' (approach)
- 'You Will Learn' (5 bullets)
- 'A Final Word' (outcomes)
- 'Pay what you feel' (pricing)
- Bottom CTA

Idempotent — if a 'regulated' programme already exists, this updates it
rather than creating a duplicate.
"""

import os
import sys
import urllib.parse
import urllib.request
import json

STRAPI_URL = os.environ.get('STRAPI_URL', 'https://cms.annalouwellness.com').rstrip('/')
TOKEN = os.environ.get('STRAPI_TOKEN', '').strip()
if not TOKEN:
    print('ERROR: set STRAPI_TOKEN env var')
    sys.exit(1)

H = {'Authorization': f'Bearer {TOKEN}', 'Content-Type': 'application/json'}


def api(method, path, body=None):
    url = f'{STRAPI_URL}/api{path}'
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(url, data=data, method=method, headers=H)
    with urllib.request.urlopen(req) as r:
        return json.loads(r.read())


# Content from Anna's ALW_2_REGULATED doc
PAYLOAD = {
    'title': 'REGULATED.',
    'slug': 'regulated',
    'tagline': 'The somatic art of staying anchored, open, and yourself in a dysregulating world.',
    'accentColour': '#6E3A5A',
    'intro': (
        "A few weeks back, I sat with a client on the boat. Late afternoon light, soft on the water, and she was crying. Not because anything in particular had happened. Because everything had.\n\n"
        "The news. The group chat. The school WhatsApp. The Instagram comments. The friend who keeps spiralling. The mother in law. The headlines.\n\n"
        "\"How do you do it, Anna?\" she asked. \"How do you stay regulated when the world is this loud?\"\n\n"
        "I have been getting some version of that question a lot lately. How do you protect yourself from all of it? How do you stay informed without falling apart? How do you care about the world without drowning in it? How do you keep your nervous system yours when everything is trying to pull it out of your body?\n\n"
        "Good questions. All of them. The world is loud right now. Louder than most of us have nervous systems trained to handle. And the world needs you. It really does. It needs you grounded. It needs you in your work, your community, your family, your friendships, your activism, your art. It needs your voice. It needs your gifts.\n\n"
        "This is not the moment to disappear. But here is the thing nobody tells you. There is a skill to this.\n\n"
        "A skill to staying engaged as a citizen without your cortisol running the show. A skill to caring deeply without dissolving into other people's pain. A skill to being present with your children, your partner, your clients, your colleagues, without coming home empty. A skill to scrolling and not internalising. To witnessing and not absorbing. To holding your own ground when everything around you is shaking.\n\n"
        "**The Truth.** You are not just tired. You are not too sensitive. You are not weak. You are not dramatic. You are absorbing a tremendous amount of energy that was never yours to carry.\n\n"
        "Through the news. Through the algorithm. Through the people in your life who do not know how to regulate themselves and have made you, somewhere along the way, their regulation strategy.\n\n"
        "Your nervous system has been picking up signal that does not belong to you. And until you learn how to clear it, ground it, and become unavailable to it, you will keep paying for it. With your sleep. With your patience. With your peace. With your capacity to actually show up for the things that matter."
    ),
    'approachLabel': 'What You Actually Need',
    'approachBody': (
        "You need somatic skills, not just self help quotes.\n\n"
        "You need clean boundaries, both spoken and unspoken.\n\n"
        "You need to know what is yours to feel and what is simply atmosphere.\n\n"
        "You need to be able to stay open without becoming porous, and engaged without becoming entangled.\n\n"
        "You need a practice that brings you back to your own body, your own breath, your own signal, when the noise is at full volume."
    ),
    'whatsIncludedLabel': 'You Will Learn',
    'whatsIncludedItems': (
        "What somatic protection actually is, and how to use it in real time when the chaos arrives. A set of nervous system practices you can begin using today, on the bus, in the meeting, in bed at 3am.\n"
        "How to create clean boundaries, the kind that come from your body before they come from your mouth. With trolls, with mean girls, with in laws, with the well meaning people in your life who are projecting, leaking, taking, and asking you to carry what is not yours.\n"
        "How to engage with the world online and offline from a regulated, sovereign, grounded place, without losing access to your softness.\n"
        "How to stay informed and awake to what is happening, both close to home and globally, without your nervous system going into freeze, fawn, or flood. (You are allowed to be furious. You are also allowed to be regulated. Both. At the same time.)\n"
        "How to cultivate that deep, embodied knowing of 'I am safe in myself, I am rooted, I am not for sale,' and become genuinely unavailable for what was never yours to carry."
    ),
    'outcomesLabel': 'A Final Word',
    'outcomesBody': (
        "There is an art to staying engaged with the world while being completely unavailable for projection, chaos, and the things that were never yours to fix.\n\n"
        "If you have been feeling overstimulated, overextended, quietly exhausted, reactive in ways you do not love, or like you are leaking energy you cannot afford to lose, this course was made for you.\n\n"
        "Come home to your nervous system. Come back to your body. Come back to yourself.\n\n"
        "This is not about going numb. It is not about checking out. It is not about pretending you do not care. This is about learning to stop unconsciously absorbing other people's fear, projections, opinions, and chaos, and returning, gently and consistently, to the safety that lives inside your own body.\n\n"
        "I am, genuinely, mostly unaware of what people say about me online. There are about a million things I care about more. Starting with the people on my boat and ending with the work I am here to do. You get to be that woman too. Anchored. Clear. Sovereign. Yours."
    ),
    'pricingLabel': 'Pay what you feel',
    'pricingBody': (
        "REGULATED is a pay-what-you-feel offering, from £5. You choose what feels right for you. Full details on the checkout page.\n\n"
        "Once you are inside, you will also get a first look at The Reset Room, the membership space where this work goes deeper, week after week."
    ),
    'ctaLabel': 'Step inside REGULATED',
    'ctaUrl': '/contact',
    'displayOrder': 50,
    'pricePence': 500,
    'currency': 'gbp',
    'isRecurring': False,
    'mailchimpTag': 'REGULATED',
    'grantsResetRoomAccess': False,
    'seoTitle': 'REGULATED — Pay-What-You-Feel Somatic Course on Nervous System Sovereignty',
    'seoDescription': "A grounded, practical, somatic course on nervous system sovereignty, clean boundaries, and staying yourself in a loud world. From £5. By Anna Lou Wellness.",
}


def main():
    # Check for existing entry
    q = urllib.parse.urlencode({'filters[slug][$eq]': 'regulated', 'pagination[pageSize]': 1})
    existing = api('GET', f'/programmes?{q}')
    if existing.get('data'):
        entry = existing['data'][0]
        doc_id = entry.get('documentId') or entry.get('id')
        print(f"Found existing 'regulated' programme (documentId={doc_id}). Updating...")
        result = api('PUT', f'/programmes/{doc_id}', {'data': PAYLOAD})
        print(f"  Updated: {result['data'].get('title')} at /the-work/regulated")
    else:
        print("No existing 'regulated' programme. Creating...")
        result = api('POST', '/programmes', {'data': PAYLOAD})
        print(f"  Created: {result['data'].get('title')} at /the-work/regulated (id={result['data'].get('id')})")


if __name__ == '__main__':
    main()
