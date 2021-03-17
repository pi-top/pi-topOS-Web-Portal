keyboard_code_list = {
    'us': 'United States',
    'ad': 'Andorra',
    'af': 'Afghanistan',
    'ara': 'Arabic',
    'al': 'Albania',
    'am': 'Armenia',
    'az': 'Azerbaijan',
    'by': 'Belarus',
    'be': 'Belgium',
    'bd': 'Bangladesh',
    'in': 'India',
    'ba': 'Bosnia and Herzegovina',
    'br': 'Brazil',
    'bg': 'Bulgaria',
    'ma': 'Morocco',
    'mm': 'Myanmar',
    'ca': 'Canada',
    'cd': 'Congo, Democratic Republic of the',
    'cn': 'China',
    'hr': 'Croatia',
    'cz': 'Czechia',
    'dk': 'Denmark',
    'nl': 'Netherlands',
    'bt': 'Bhutan',
    'ee': 'Estonia',
    'ir': 'Iran',
    'iq': 'Iraq',
    'fo': 'Faroe Islands',
    'fi': 'Finland',
    'fr': 'France',
    'gh': 'Ghana',
    'gn': 'Guinea',
    'ge': 'Georgia',
    'de': 'Germany',
    'gr': 'Greece',
    'hu': 'Hungary',
    'is': 'Iceland',
    'il': 'Israel',
    'it': 'Italy',
    'jp': 'Japan',
    'kg': 'Kyrgyzstan',
    'kh': 'Cambodia',
    'kz': 'Kazakhstan',
    'la': 'Laos',
    'latam': 'Latin American',
    'lt': 'Lithuania',
    'lv': 'Latvia',
    'mao': 'Maori',
    'me': 'Montenegro',
    'mk': 'Macedonia',
    'mt': 'Malta',
    'mn': 'Mongolia',
    'no': 'Norway',
    'pl': 'Poland',
    'pt': 'Portugal',
    'ro': 'Romania',
    'ru': 'Russia',
    'rs': 'Serbia',
    'si': 'Slovenia',
    'sk': 'Slovakia',
    'es': 'Spain',
    'se': 'Sweden',
    'ch': 'Switzerland',
    'sy': 'Syria',
    'tj': 'Tajikistan',
    'lk': 'Sri Lanka',
    'th': 'Thailand',
    'tr': 'Turkey',
    'tw': 'Taiwan',
    'ua': 'Ukraine',
    'gb': 'United Kingdom',
    'uz': 'Uzbekistan',
    'vn': 'Vietnam',
    'kr': 'Korea, Republic of',
    'nec_vndr/jp': 'Japan (PC-98xx Series)',
    'ie': 'Ireland',
    'pk': 'Pakistan',
    'mv': 'Maldives',
    'za': 'South Africa',
    'epo': 'Esperanto',
    'np': 'Nepal',
    'ng': 'Nigeria',
    'et': 'Ethiopia',
    'sn': 'Senegal',
    'brai': 'Braille',
    'tm': 'Turkmenistan',
    'ml': 'Mali',
    'tz': 'Tanzania'
}


keyboard_variants_list = {
    'af': {
        'olpc-fa': 'OLPC Dari',
        'olpc-ps': 'OLPC Pashto',
        'olpc-uz': 'OLPC Southern Uzbek',
        'ps': 'Pashto',
        'uz': 'Southern Uzbek'
    },
    'am': {
        'eastern': 'Eastern',
        'eastern-alt': 'Alternative Eastern',
        'phonetic': 'Phonetic',
        'phonetic-alt': 'Alternative Phonetic',
        'western': 'Western'
    },
    'ara': {
        'azerty': 'azerty',
        'azerty_digits': 'azerty/digits',
        'buckwalter': 'Buckwalter',
        'digits': 'digits',
        'qwerty': 'qwerty',
        'qwerty_digits': 'qwerty/digits'
    },
    'az': {
        'cyrillic': 'Cyrillic'
    },
    'ba': {
        'alternatequotes': 'Use guillemets for quotes',
        'unicode': 'Use Bosnian digraphs',
        'unicodeus': 'US keyboard with Bosnian digraphs',
        'us': 'US keyboard with Bosnian letters'
    },
    'bd': {
        'probhat': 'Probhat'
    },
    'be': {
        'iso-alternate': 'ISO Alternate',
        'nodeadkeys': 'Eliminate dead keys',
        'oss': 'Alternative',
        'oss_latin9': 'Alternative, latin-9 only',
        'oss_sundeadkeys': 'Alternative, Sun dead keys',
        'sundeadkeys': 'Sun dead keys',
        'wang': 'Wang model 724 azerty'
    },
    'bg': {
        'bas_phonetic': 'New phonetic',
        'phonetic': 'Traditional phonetic'
    },
    'br': {
        'dvorak': 'Dvorak',
        'nativo': 'Nativo',
        'nativo-epo': 'Nativo for Esperanto',
        'nativo-us': 'Nativo for USA keyboards',
        'nodeadkeys': 'Eliminate dead keys'
    },
    'brai': {
        'left_hand': 'Left hand',
        'right_hand': 'Right hand'
    },
    'by': {
        'latin': 'Latin',
        'legacy': 'Legacy'
    },
    'ca': {
        'eng': 'English',
        'fr-dvorak': 'French Dvorak',
        'fr-legacy': 'French (legacy)',
        'ike': 'Inuktitut',
        'kut': 'Ktunaxa',
        'multi': 'Multilingual, first part',
        'multi-2gr': 'Multilingual, second part',
        'multix': 'Multilingual',
        'shs': 'Secwepemctsin'
    },
    'ch': {
        'de_mac': 'German (Macintosh)',
        'de_nodeadkeys': 'German, eliminate dead keys',
        'de_sundeadkeys': 'German, Sun dead keys',
        'fr': 'French',
        'fr_mac': 'French (Macintosh)',
        'fr_nodeadkeys': 'French, eliminate dead keys',
        'fr_sundeadkeys': 'French, Sun dead keys',
        'legacy': 'Legacy'
    },
    'cn': {
        'tib': 'Tibetan',
        'tib_asciinum': 'Tibetan (with ASCII numerals)'
    },
    'cz': {
        'bksl': 'With <|> key',
        'dvorak-ucw': 'US Dvorak with CZ UCW support',
                'qwerty': 'qwerty',
                'qwerty_bksl': 'qwerty, extended Backslash',
                'ucw': 'UCW layout (accented letters only)'
    },
    'de': {
        'deadacute': 'Dead acute',
        'deadgraveacute': 'Dead grave acute',
        'dsb': 'Lower Sorbian',
        'dsb_qwertz': 'Lower Sorbian (qwertz)',
        'dvorak': 'Dvorak',
        'mac': 'Macintosh',
        'mac_nodeadkeys': 'Macintosh, eliminate dead keys',
        'neo': 'Neo 2',
        'nodeadkeys': 'Eliminate dead keys',
        'qwerty': 'qwerty',
        'ro': 'Romanian keyboard with German letters',
        'ro_nodeadkeys': 'Romanian keyboard with German letters, eliminate dead keys',
        'sundeadkeys': 'Sun dead keys'
    },
    'dk': {
        'dvorak': 'Dvorak',
        'mac': 'Macintosh',
        'mac_nodeadkeys': 'Macintosh, eliminate dead keys',
        'nodeadkeys': 'Eliminate dead keys'
    },
    'ee': {
        'dvorak': 'Dvorak',
        'nodeadkeys': 'Eliminate dead keys',
        'us': 'US keyboard with Estonian letters'
    },
    'epo': {
        'legacy': 'displaced semicolon and quote (obsolete)'
    },
    'es': {
        'ast': 'Asturian variant with bottom-dot H and bottom-dot L',
        'cat': 'Catalan variant with middle-dot L',
        'deadtilde': 'Include dead tilde',
        'dvorak': 'Dvorak',
        'mac': 'Macintosh',
        'nodeadkeys': 'Eliminate dead keys',
        'sundeadkeys': 'Sun dead keys'
    },
    'fi': {
        'classic': 'Classic',
        'mac': 'Macintosh',
        'nodeadkeys': 'Eliminate dead keys',
        'smi': 'Northern Saami'
    },
    'fo': {
        'nodeadkeys': 'Eliminate dead keys'
    },
    'fr': {
        'bepo': 'Bepo, ergonomic, Dvorak way',
        'bepo_latin9': 'Bepo, ergonomic, Dvorak way, latin-9 only',
                'bre': 'Breton',
                'dvorak': 'Dvorak',
                'geo': 'Georgian AZERTY Tskapo',
                'latin9': '(Legacy) Alternative',
                'latin9_nodeadkeys': '(Legacy) Alternative, eliminate dead keys',
                'latin9_sundeadkeys': '(Legacy) Alternative, Sun dead keys',
                'mac': 'Macintosh',
                'nodeadkeys': 'Eliminate dead keys',
                'oci': 'Occitan',
                'oss': 'Alternative',
                'oss_latin9': 'Alternative, latin-9 only',
                'oss_nodeadkeys': 'Alternative, eliminate dead keys',
                'oss_sundeadkeys': 'Alternative, Sun dead keys',
                'sundeadkeys': 'Sun dead keys'
    },
    'gb': {
        'colemak': 'Colemak',
        'dvorak': 'Dvorak',
        'dvorakukp': 'Dvorak (UK Punctuation)',
        'extd': 'Extended - Winkeys',
                'intl': 'International (with dead keys)',
                'mac': 'Macintosh'
    },
    'ge': {
        'ergonomic': 'Ergonomic',
        'mess': 'MESS',
                'os': 'Ossetian',
                'ru': 'Russian'
    },
    'gh': {
        'akan': 'Akan',
        'ewe': 'Ewe',
                'fula': 'Fula',
                'ga': 'Ga',
                'generic': 'Multilingual',
                'hausa': 'Hausa'
    },
    'gr': {
        'extended': 'Extended',
        'nodeadkeys': 'Eliminate dead keys',
        'polytonic': 'Polytonic',
        'simple': 'Simple'
    },
    'hr': {
        'alternatequotes': 'Use guillemets for quotes',
        'unicode': 'Use Croatian digraphs',
        'unicodeus': 'US keyboard with Croatian digraphs',
        'us': 'US keyboard with Croatian letters'
    },
    'hu': {
        '101_qwerty_comma_dead': '101/qwerty/comma/Dead keys',
        '101_qwerty_comma_nodead': '101/qwerty/comma/Eliminate dead keys',
        '101_qwerty_dot_dead': '101/qwerty/dot/Dead keys',
        '101_qwerty_dot_nodead': '101/qwerty/dot/Eliminate dead keys',
        '101_qwertz_comma_dead': '101/qwertz/comma/Dead keys',
        '101_qwertz_comma_nodead': '101/qwertz/comma/Eliminate dead keys',
        '101_qwertz_dot_dead': '101/qwertz/dot/Dead keys',
        '101_qwertz_dot_nodead': '101/qwertz/dot/Eliminate dead keys',
        '102_qwerty_comma_dead': '102/qwerty/comma/Dead keys',
        '102_qwerty_comma_nodead': '102/qwerty/comma/Eliminate dead keys',
        '102_qwerty_dot_dead': '102/qwerty/dot/Dead keys',
        '102_qwerty_dot_nodead': '102/qwerty/dot/Eliminate dead keys',
        '102_qwertz_comma_dead': '102/qwertz/comma/Dead keys',
        '102_qwertz_comma_nodead': '102/qwertz/comma/Eliminate dead keys',
        '102_qwertz_dot_dead': '102/qwertz/dot/Dead keys',
        '102_qwertz_dot_nodead': '102/qwertz/dot/Eliminate dead keys',
        'nodeadkeys': 'Eliminate dead keys',
        'qwerty': 'qwerty',
        'standard': 'Standard'
    },
    'ie': {
        'CloGaelach': 'CloGaelach',
        'UnicodeExpert': 'UnicodeExpert',
        'ogam': 'Ogham',
                'ogam_is434': 'Ogham IS434'
    },
    'il': {
        'biblical': 'Biblical Hebrew (Tiro)',
        'lyx': 'lyx',
        'phonetic': 'Phonetic'
    },
    'in': {
        'ben': 'Bengali',
        'ben_probhat': 'Bengali Probhat',
        'bolnagri': 'Hindi Bolnagri',
        'guj': 'Gujarati',
        'guru': 'Gurmukhi',
                'hin-wx': 'Hindi Wx',
                'jhelum': 'Gurmukhi Jhelum',
                'kan': 'Kannada',
                'mal': 'Malayalam',
                'mal_lalitha': 'Malayalam Lalitha',
                'ori': 'Oriya',
                'tam': 'Tamil',
                'tam_TAB': 'Tamil TAB Typewriter',
                'tam_TSCII': 'Tamil TSCII Typewriter',
                'tam_keyboard_with_numerals': 'Tamil Keyboard with Numerals',
                'tam_unicode': 'Tamil Unicode',
                'tel': 'Telugu',
                'urd-phonetic': 'Urdu, Phonetic',
                'urd-phonetic3': 'Urdu, Alternative phonetic',
                'urd-winkeys': 'Urdu, Winkeys'
    },
    'iq': {
        'ku': 'Kurdish, Latin Q',
        'ku_alt': 'Kurdish, Latin Alt-Q',
        'ku_ara': 'Kurdish, Arabic-Latin',
        'ku_f': 'Kurdish, (F)'
    },
    'ir': {
        'ku': 'Kurdish, Latin Q',
        'ku_alt': 'Kurdish, Latin Alt-Q',
        'ku_ara': 'Kurdish, Arabic-Latin',
        'ku_f': 'Kurdish, (F)',
                'pes_keypad': 'Persian, with Persian Keypad'
    },
    'is': {
        'Sundeadkeys': 'Sun dead keys',
        'dvorak': 'Dvorak',
        'mac': 'Macintosh',
        'nodeadkeys': 'Eliminate dead keys'
    },
    'it': {
        'geo': 'Georgian',
        'mac': 'Macintosh',
        'nodeadkeys': 'Eliminate dead keys',
        'us': 'US keyboard with Italian letters'
    },
    'jp': {
        'OADG109A': 'OADG 109A',
        'kana': 'Kana',
                'mac': 'Macintosh'
    },
    'kg': {
        'phonetic': 'Phonetic'
    },
    'kr': {
        'kr104': '101/104 key Compatible'
    },
    'kz': {
        'kazrus': 'Kazakh with Russian',
        'ruskaz': 'Russian with Kazakh'
    },
    'la': {
        'basic': 'Laos',
        'stea': 'Laos - STEA (proposed standard layout)'
    },
    'latam': {
        'deadtilde': 'Include dead tilde',
        'nodeadkeys': 'Eliminate dead keys',
        'sundeadkeys': 'Sun dead keys'
    },
    'lk': {
        'tam_TAB': 'Tamil TAB Typewriter',
        'tam_unicode': 'Tamil Unicode'
    },
    'lt': {
        'ibm': 'IBM (LST 1205-92)',
        'lekp': 'LEKP',
                'lekpa': 'LEKPa',
                'std': 'Standard',
                'us': 'US keyboard with Lithuanian letters'
    },
    'lv': {
        'apostrophe': "Apostrophe (') variant",
        'fkey': 'F-letter (F) variant',
                'tilde': 'Tilde (~) variant'
    },
    'ma': {
        'french': 'French',
        'tifinagh': 'Tifinagh',
        'tifinagh-alt': 'Tifinagh Alternative',
        'tifinagh-alt-phonetic': 'Tifinagh Alternative Phonetic',
        'tifinagh-extended': 'Tifinagh Extended',
        'tifinagh-extended-phonetic': 'Tifinagh Extended Phonetic',
        'tifinagh-phonetic': 'Tifinagh Phonetic'
    },
    'me': {
        'cyrillic': 'Cyrillic',
        'cyrillicalternatequotes': 'Cyrillic with guillemets',
        'cyrillicyz': 'Cyrillic, Z and ZHE swapped',
        'latinalternatequotes': 'Latin with guillemets',
        'latinunicode': 'Latin unicode',
        'latinunicodeyz': 'Latin unicode qwerty',
        'latinyz': 'Latin qwerty'
    },
    'mk': {
        'nodeadkeys': 'Eliminate dead keys'
    },
    'ml': {
        'fr-oss': 'Français (France Alternative)',
        'us-intl': 'English (USA International)',
        'us-mac': 'English (USA Macintosh)'
    },
    'mt': {
        'us': 'Maltese keyboard with US layout'
    },
    'ng': {
        'hausa': 'Hausa',
        'igbo': 'Igbo',
                'yoruba': 'Yoruba'
    },
    'nl': {
        'mac': 'Macintosh',
        'std': 'Standard',
        'sundeadkeys': 'Sun dead keys'
    },
    'no': {
        'dvorak': 'Dvorak',
        'mac': 'Macintosh',
        'mac_nodeadkeys': 'Macintosh, eliminate dead keys',
        'nodeadkeys': 'Eliminate dead keys',
        'smi': 'Northern Saami',
        'smi_nodeadkeys': 'Northern Saami, eliminate dead keys'
    },
    'pk': {
        'ara': 'Arabic',
        'urd-crulp': 'CRULP',
        'urd-nla': 'NLA'
    },
    'pl': {
        'csb': 'Kashubian',
        'dvorak': 'Dvorak',
        'dvorak_altquotes': 'Dvorak, Polish quotes on key 1',
        'dvorak_quotes': 'Dvorak, Polish quotes on quotemark key',
        'dvp': 'Programmer Dvorak',
        'qwertz': 'qwertz',
        'ru_phonetic_dvorak': 'Russian phonetic Dvorak'
    },
    'pt': {
        'mac': 'Macintosh',
        'mac_nodeadkeys': 'Macintosh, eliminate dead keys',
        'mac_sundeadkeys': 'Macintosh, Sun dead keys',
        'nativo': 'Nativo',
        'nativo-epo': 'Nativo for Esperanto',
        'nativo-us': 'Nativo for USA keyboards',
        'nodeadkeys': 'Eliminate dead keys',
        'sundeadkeys': 'Sun dead keys'
    },
    'ro': {
        'cedilla': 'Cedilla',
        'crh_alt': 'Crimean Tatar (Turkish Alt-Q)',
        'crh_dobruca1': 'Crimean Tatar (Dobruca-1 Q)',
        'crh_dobruca2': 'Crimean Tatar (Dobruca-2 Q)',
        'crh_f': 'Crimean Tatar (Turkish F)',
        'std': 'Standard',
        'std_cedilla': 'Standard (Cedilla)',
        'winkeys': 'Winkeys'
    },
    'rs': {
        'alternatequotes': 'With guillemets',
        'latin': 'Latin',
        'latinalternatequotes': 'Latin with guillemets',
        'latinunicode': 'Latin Unicode',
        'latinunicodeyz': 'Latin Unicode qwerty',
        'latinyz': 'Latin qwerty',
        'yz': 'Z and ZHE swapped'
    },
    'ru': {
        'bak': 'Bashkirian',
        'cv': 'Chuvash',
        'cv_latin': 'Chuvash Latin',
        'dos': 'DOS',
        'kom': 'Komi',
        'legacy': 'Legacy',
        'os_legacy': 'Ossetian, legacy',
        'os_winkeys': 'Ossetian, Winkeys',
        'phonetic': 'Phonetic',
        'phonetic_winkeys': 'Phonetic Winkeys',
        'sah': 'Yakut',
        'srp': 'Serbian',
        'tt': 'Tatar',
        'typewriter': 'Typewriter',
        'typewriter-legacy': 'Typewriter, legacy',
        'udm': 'Udmurt',
        'xal': 'Kalmyk'
    },
    'se': {
        'dvorak': 'Dvorak',
        'mac': 'Macintosh',
        'nodeadkeys': 'Eliminate dead keys',
        'rus': 'Russian phonetic',
        'rus_nodeadkeys': 'Russian phonetic, eliminate dead keys',
        'smi': 'Northern Saami',
        'svdvorak': 'Svdvorak'
    },
    'si': {
        'alternatequotes': 'Use guillemets for quotes',
        'us': 'US keyboard with Slovenian letters'
    },
    'sk': {
        'bksl': 'Extended Backslash',
        'qwerty': 'qwerty',
                'qwerty_bksl': 'qwerty, extended Backslash'
    },
    'sy': {
        'ku': 'Kurdish, Latin Q',
        'ku_alt': 'Kurdish, Latin Alt-Q',
        'ku_f': 'Kurdish, (F)',
                'syc': 'Syriac',
                'syc_phonetic': 'Syriac phonetic'
    },
    'th': {
        'pat': 'Pattachote',
        'tis': 'TIS-820.2538'
    },
    'tj': {
        'legacy': 'Legacy'
    },
    'tm': {
        'alt': 'Alt-Q'
    },
    'tr': {
        'alt': 'Alt-Q',
        'crh': 'Crimean Tatar (Turkish Q)',
        'crh_alt': 'Crimean Tatar (Turkish Alt-Q)',
        'crh_f': 'Crimean Tatar (Turkish F)',
        'f': '(F)',
        'intl': 'International (with dead keys)',
                'ku': 'Kurdish, Latin Q',
                'ku_alt': 'Kurdish, Latin Alt-Q',
                'ku_f': 'Kurdish, (F)',
                'sundeadkeys': 'Sun dead keys'
    },
    'tw': {
        'indigenous': 'Indigenous',
        'saisiyat': 'Saisiyat'
    },
    'ua': {
        'crh': 'Crimean Tatar (Turkish Q)',
        'crh_alt': 'Crimean Tatar (Turkish Alt-Q)',
        'crh_f': 'Crimean Tatar (Turkish F)',
        'homophonic': 'Homophonic',
        'legacy': 'Legacy',
        'phonetic': 'Phonetic',
        'rstu': 'Standard RSTU',
                'rstu_ru': 'Standard RSTU on Russian layout',
                'typewriter': 'Typewriter',
                'winkeys': 'Winkeys'
    },
    'us': {
        'alt-intl': 'Alternative international (former us_intl)',
        'altgr-intl': 'International (AltGr dead keys)',
        'chr': 'Cherokee',
        'colemak': 'Colemak',
        'dvorak': 'Dvorak',
        'dvorak-classic': 'Classic Dvorak',
        'dvorak-intl': 'Dvorak international',
        'dvorak-l': 'Left handed Dvorak',
        'dvorak-r': 'Right handed Dvorak',
        'dvp': 'Programmer Dvorak',
        'euro': 'With EuroSign on 5',
                'intl': 'International (with dead keys)',
                'mac': 'Macintosh',
                'olpc2': 'Group toggle on multiply/divide key',
                'rus': 'Russian phonetic',
                'srp': 'Serbian'
    },
    'uz': {
        'crh': 'Crimean Tatar (Turkish Q)',
        'crh_alt': 'Crimean Tatar (Turkish Alt-Q)',
        'crh_f': 'Crimean Tatar (Turkish F)',
        'latin': 'Latin'
    }
}

keyboard_query_data = b"""
rules:      evdev
model:      pc105
layout:     us,us
variant:    ,
"""

keyboard_current = {'layout': 'us,us', 'variant': ','}


keyboard_file_before = """
# KEYBOARD CONFIGURATION FILE

# Consult the keyboard(5) manual page.

XKBMODEL="pc105"
XKBLAYOUT="us"
XKBVARIANT=""
XKBOPTIONS=""

BACKSPACE="guess"
"""
