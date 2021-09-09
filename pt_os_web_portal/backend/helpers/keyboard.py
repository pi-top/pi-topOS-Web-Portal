from fileinput import input as finput
from typing import Optional, Tuple

from pitop.common.command_runner import run_command
from pitop.common.logger import PTLogger

from .paths import default_keyboard_conf


def current_keyboard_layout() -> Tuple[str, Optional[str]]:
    PTLogger.info("Function: current_keyboard_layout()")
    layout_code = ""
    variant = None

    command = "setxkbmap -query"
    for line in run_command(command, timeout=2).split("\n"):
        if "layout:" in line:
            layout_code = line.split(":")[1].strip()
        elif "variant:" in line:
            variant = line.split(":")[1].strip()

    PTLogger.info(
        "Current keyboard layout: layout_code='%s', variant='%s'"
        % (layout_code, variant)
    )

    # ('us', None)
    # Layout code should never be None, but variant can be
    return layout_code, variant


def set_keyboard_layout(layout_code, variant):
    PTLogger.info(
        "Function: set_keyboard_layout(layout_code=%s, variant=%s)"
        % (layout_code, variant)
    )
    if variant is None:
        PTLogger.info("No keyboard variant detected")
        variant = ""

    layout_str = 'XKBLAYOUT="' + layout_code + '"'
    variant_str = 'XKBVARIANT="' + variant + '"'
    PTLogger.info(
        "Updating %s with %s and %s"
        % (default_keyboard_conf(), layout_str, variant_str)
    )
    for line in finput(default_keyboard_conf(), inplace=True):
        if "XKBLAYOUT" in line:
            print(layout_str)
        elif "XKBVARIANT" in line:
            print(variant_str)
        else:
            print(line.rstrip())

    # This command only takes layout code, but it reconfigures based on state of
    # default_keyboard_conf()
    command = "raspi-config nonint do_configure_keyboard %s" % layout_code
    return run_command(command, timeout=30, capture_output=False)


def list_keyboard_layout_codes() -> dict:
    PTLogger.info("Function: list_keyboard_layout_codes()")
    layouts = {
        "us": "United States",
        "ad": "Andorra",
        "af": "Afghanistan",
        "ara": "Arabic",
        "al": "Albania",
        "am": "Armenia",
        "az": "Azerbaijan",
        "by": "Belarus",
        "be": "Belgium",
        "bd": "Bangladesh",
        "in": "India",
        "ba": "Bosnia and Herzegovina",
        "br": "Brazil",
        "bg": "Bulgaria",
        "ma": "Morocco",
        "mm": "Myanmar",
        "ca": "Canada",
        "cd": "Congo, Democratic Republic of the",
        "cn": "China",
        "hr": "Croatia",
        "cz": "Czechia",
        "dk": "Denmark",
        "nl": "Netherlands",
        "bt": "Bhutan",
        "ee": "Estonia",
        "ir": "Iran",
        "iq": "Iraq",
        "fo": "Faroe Islands",
        "fi": "Finland",
        "fr": "France",
        "gh": "Ghana",
        "gn": "Guinea",
        "ge": "Georgia",
        "de": "Germany",
        "gr": "Greece",
        "hu": "Hungary",
        "is": "Iceland",
        "il": "Israel",
        "it": "Italy",
        "jp": "Japan",
        "kg": "Kyrgyzstan",
        "kh": "Cambodia",
        "kz": "Kazakhstan",
        "la": "Laos",
        "latam": "Latin American",
        "lt": "Lithuania",
        "lv": "Latvia",
        "mao": "Maori",
        "me": "Montenegro",
        "mk": "Macedonia",
        "mt": "Malta",
        "mn": "Mongolia",
        "no": "Norway",
        "pl": "Poland",
        "pt": "Portugal",
        "ro": "Romania",
        "ru": "Russia",
        "rs": "Serbia",
        "si": "Slovenia",
        "sk": "Slovakia",
        "es": "Spain",
        "se": "Sweden",
        "ch": "Switzerland",
        "sy": "Syria",
        "tj": "Tajikistan",
        "lk": "Sri Lanka",
        "th": "Thailand",
        "tr": "Turkey",
        "tw": "Taiwan",
        "ua": "Ukraine",
        "gb": "United Kingdom",
        "uz": "Uzbekistan",
        "vn": "Vietnam",
        "kr": "Korea, Republic of",
        "nec_vndr/jp": "Japan (PC-98xx Series)",
        "ie": "Ireland",
        "pk": "Pakistan",
        "mv": "Maldives",
        "za": "South Africa",
        "epo": "Esperanto",
        "np": "Nepal",
        "ng": "Nigeria",
        "et": "Ethiopia",
        "sn": "Senegal",
        "brai": "Braille",
        "tm": "Turkmenistan",
        "ml": "Mali",
        "tz": "Tanzania",
    }

    return layouts


def list_keyboard_layout_variants() -> dict:
    PTLogger.info("Function: list_keyboard_layout_variants()")
    af_variants = {
        "olpc-fa": "OLPC Dari",
        "olpc-ps": "OLPC Pashto",
        "olpc-uz": "OLPC Southern Uzbek",
        "ps": "Pashto",
        "uz": "Southern Uzbek",
    }
    am_variants = {
        "eastern": "Eastern",
        "eastern-alt": "Alternative Eastern",
        "phonetic": "Phonetic",
        "phonetic-alt": "Alternative Phonetic",
        "western": "Western",
    }
    ara_variants = {
        "azerty": "azerty",
        "azerty_digits": "azerty/digits",
        "buckwalter": "Buckwalter",
        "digits": "digits",
        "qwerty": "qwerty",
        "qwerty_digits": "qwerty/digits",
    }
    az_variants = {"cyrillic": "Cyrillic"}
    ba_variants = {
        "alternatequotes": "Use guillemets for quotes",
        "unicode": "Use Bosnian digraphs",
        "unicodeus": "US keyboard with Bosnian digraphs",
        "us": "US keyboard with Bosnian letters",
    }
    bd_variants = {"probhat": "Probhat"}
    be_variants = {
        "iso-alternate": "ISO Alternate",
        "nodeadkeys": "Eliminate dead keys",
        "oss": "Alternative",
        "oss_latin9": "Alternative, latin-9 only",
        "oss_sundeadkeys": "Alternative, Sun dead keys",
        "sundeadkeys": "Sun dead keys",
        "wang": "Wang model 724 azerty",
    }
    bg_variants = {"bas_phonetic": "New phonetic", "phonetic": "Traditional phonetic"}
    br_variants = {
        "dvorak": "Dvorak",
        "nativo": "Nativo",
        "nativo-epo": "Nativo for Esperanto",
        "nativo-us": "Nativo for USA keyboards",
        "nodeadkeys": "Eliminate dead keys",
    }
    brai_variants = {"left_hand": "Left hand", "right_hand": "Right hand"}
    by_variants = {"latin": "Latin", "legacy": "Legacy"}
    ca_variants = {
        "eng": "English",
        "fr-dvorak": "French Dvorak",
        "fr-legacy": "French (legacy)",
        "ike": "Inuktitut",
        "kut": "Ktunaxa",
        "multi": "Multilingual, first part",
        "multi-2gr": "Multilingual, second part",
        "multix": "Multilingual",
        "shs": "Secwepemctsin",
    }
    ch_variants = {
        "de_mac": "German (Macintosh)",
        "de_nodeadkeys": "German, eliminate dead keys",
        "de_sundeadkeys": "German, Sun dead keys",
        "fr": "French",
        "fr_mac": "French (Macintosh)",
        "fr_nodeadkeys": "French, eliminate dead keys",
        "fr_sundeadkeys": "French, Sun dead keys",
        "legacy": "Legacy",
    }
    cn_variants = {"tib": "Tibetan", "tib_asciinum": "Tibetan (with ASCII numerals)"}
    cz_variants = {
        "bksl": "With <|> key",
        "dvorak-ucw": "US Dvorak with CZ UCW support",
        "qwerty": "qwerty",
        "qwerty_bksl": "qwerty, extended Backslash",
        "ucw": "UCW layout (accented letters only)",
    }
    de_variants = {
        "deadacute": "Dead acute",
        "deadgraveacute": "Dead grave acute",
        "dsb": "Lower Sorbian",
        "dsb_qwertz": "Lower Sorbian (qwertz)",
        "dvorak": "Dvorak",
        "mac": "Macintosh",
        "mac_nodeadkeys": "Macintosh, eliminate dead keys",
        "neo": "Neo 2",
        "nodeadkeys": "Eliminate dead keys",
        "qwerty": "qwerty",
        "ro": "Romanian keyboard with German letters",
        "ro_nodeadkeys": "Romanian keyboard with German letters, eliminate dead keys",
        "sundeadkeys": "Sun dead keys",
    }
    dk_variants = {
        "dvorak": "Dvorak",
        "mac": "Macintosh",
        "mac_nodeadkeys": "Macintosh, eliminate dead keys",
        "nodeadkeys": "Eliminate dead keys",
    }
    ee_variants = {
        "dvorak": "Dvorak",
        "nodeadkeys": "Eliminate dead keys",
        "us": "US keyboard with Estonian letters",
    }
    epo_variants = {"legacy": "displaced semicolon and quote (obsolete)"}
    es_variants = {
        "ast": "Asturian variant with bottom-dot H and bottom-dot L",
        "cat": "Catalan variant with middle-dot L",
        "deadtilde": "Include dead tilde",
        "dvorak": "Dvorak",
        "mac": "Macintosh",
        "nodeadkeys": "Eliminate dead keys",
        "sundeadkeys": "Sun dead keys",
    }
    fi_variants = {
        "classic": "Classic",
        "mac": "Macintosh",
        "nodeadkeys": "Eliminate dead keys",
        "smi": "Northern Saami",
    }
    fo_variants = {"nodeadkeys": "Eliminate dead keys"}
    fr_variants = {
        "bepo": "Bepo, ergonomic, Dvorak way",
        "bepo_latin9": "Bepo, ergonomic, Dvorak way, latin-9 only",
        "bre": "Breton",
        "dvorak": "Dvorak",
        "geo": "Georgian AZERTY Tskapo",
        "latin9": "(Legacy) Alternative",
        "latin9_nodeadkeys": "(Legacy) Alternative, eliminate dead keys",
        "latin9_sundeadkeys": "(Legacy) Alternative, Sun dead keys",
        "mac": "Macintosh",
        "nodeadkeys": "Eliminate dead keys",
        "oci": "Occitan",
        "oss": "Alternative",
        "oss_latin9": "Alternative, latin-9 only",
        "oss_nodeadkeys": "Alternative, eliminate dead keys",
        "oss_sundeadkeys": "Alternative, Sun dead keys",
        "sundeadkeys": "Sun dead keys",
    }
    gb_variants = {
        "colemak": "Colemak",
        "dvorak": "Dvorak",
        "dvorakukp": "Dvorak (UK Punctuation)",
        "extd": "Extended - Winkeys",
        "intl": "International (with dead keys)",
        "mac": "Macintosh",
    }
    ge_variants = {
        "ergonomic": "Ergonomic",
        "mess": "MESS",
        "os": "Ossetian",
        "ru": "Russian",
    }
    gh_variants = {
        "akan": "Akan",
        "ewe": "Ewe",
        "fula": "Fula",
        "ga": "Ga",
        "generic": "Multilingual",
        "hausa": "Hausa",
    }
    gr_variants = {
        "extended": "Extended",
        "nodeadkeys": "Eliminate dead keys",
        "polytonic": "Polytonic",
        "simple": "Simple",
    }
    hr_variants = {
        "alternatequotes": "Use guillemets for quotes",
        "unicode": "Use Croatian digraphs",
        "unicodeus": "US keyboard with Croatian digraphs",
        "us": "US keyboard with Croatian letters",
    }
    hu_variants = {
        "101_qwerty_comma_dead": "101/qwerty/comma/Dead keys",
        "101_qwerty_comma_nodead": "101/qwerty/comma/Eliminate dead keys",
        "101_qwerty_dot_dead": "101/qwerty/dot/Dead keys",
        "101_qwerty_dot_nodead": "101/qwerty/dot/Eliminate dead keys",
        "101_qwertz_comma_dead": "101/qwertz/comma/Dead keys",
        "101_qwertz_comma_nodead": "101/qwertz/comma/Eliminate dead keys",
        "101_qwertz_dot_dead": "101/qwertz/dot/Dead keys",
        "101_qwertz_dot_nodead": "101/qwertz/dot/Eliminate dead keys",
        "102_qwerty_comma_dead": "102/qwerty/comma/Dead keys",
        "102_qwerty_comma_nodead": "102/qwerty/comma/Eliminate dead keys",
        "102_qwerty_dot_dead": "102/qwerty/dot/Dead keys",
        "102_qwerty_dot_nodead": "102/qwerty/dot/Eliminate dead keys",
        "102_qwertz_comma_dead": "102/qwertz/comma/Dead keys",
        "102_qwertz_comma_nodead": "102/qwertz/comma/Eliminate dead keys",
        "102_qwertz_dot_dead": "102/qwertz/dot/Dead keys",
        "102_qwertz_dot_nodead": "102/qwertz/dot/Eliminate dead keys",
        "nodeadkeys": "Eliminate dead keys",
        "qwerty": "qwerty",
        "standard": "Standard",
    }
    ie_variants = {
        "CloGaelach": "CloGaelach",
        "UnicodeExpert": "UnicodeExpert",
        "ogam": "Ogham",
        "ogam_is434": "Ogham IS434",
    }
    il_variants = {
        "biblical": "Biblical Hebrew (Tiro)",
        "lyx": "lyx",
        "phonetic": "Phonetic",
    }
    in_variants = {
        "ben": "Bengali",
        "ben_probhat": "Bengali Probhat",
        "bolnagri": "Hindi Bolnagri",
        "guj": "Gujarati",
        "guru": "Gurmukhi",
        "hin-wx": "Hindi Wx",
        "jhelum": "Gurmukhi Jhelum",
        "kan": "Kannada",
        "mal": "Malayalam",
        "mal_lalitha": "Malayalam Lalitha",
        "ori": "Oriya",
        "tam": "Tamil",
        "tam_TAB": "Tamil TAB Typewriter",
        "tam_TSCII": "Tamil TSCII Typewriter",
        "tam_keyboard_with_numerals": "Tamil Keyboard with Numerals",
        "tam_unicode": "Tamil Unicode",
        "tel": "Telugu",
        "urd-phonetic": "Urdu, Phonetic",
        "urd-phonetic3": "Urdu, Alternative phonetic",
        "urd-winkeys": "Urdu, Winkeys",
    }
    iq_variants = {
        "ku": "Kurdish, Latin Q",
        "ku_alt": "Kurdish, Latin Alt-Q",
        "ku_ara": "Kurdish, Arabic-Latin",
        "ku_f": "Kurdish, (F)",
    }
    ir_variants = {
        "ku": "Kurdish, Latin Q",
        "ku_alt": "Kurdish, Latin Alt-Q",
        "ku_ara": "Kurdish, Arabic-Latin",
        "ku_f": "Kurdish, (F)",
        "pes_keypad": "Persian, with Persian Keypad",
    }
    is_variants = {
        "Sundeadkeys": "Sun dead keys",
        "dvorak": "Dvorak",
        "mac": "Macintosh",
        "nodeadkeys": "Eliminate dead keys",
    }
    it_variants = {
        "geo": "Georgian",
        "mac": "Macintosh",
        "nodeadkeys": "Eliminate dead keys",
        "us": "US keyboard with Italian letters",
    }
    jp_variants = {"OADG109A": "OADG 109A", "kana": "Kana", "mac": "Macintosh"}
    kg_variants = {"phonetic": "Phonetic"}
    kr_variants = {"kr104": "101/104 key Compatible"}
    kz_variants = {"kazrus": "Kazakh with Russian", "ruskaz": "Russian with Kazakh"}
    la_variants = {"basic": "Laos", "stea": "Laos - STEA (proposed standard layout)"}
    latam_variants = {
        "deadtilde": "Include dead tilde",
        "nodeadkeys": "Eliminate dead keys",
        "sundeadkeys": "Sun dead keys",
    }
    lk_variants = {"tam_TAB": "Tamil TAB Typewriter", "tam_unicode": "Tamil Unicode"}
    lt_variants = {
        "ibm": "IBM (LST 1205-92)",
        "lekp": "LEKP",
        "lekpa": "LEKPa",
        "std": "Standard",
        "us": "US keyboard with Lithuanian letters",
    }
    lv_variants = {
        "apostrophe": "Apostrophe (') variant",
        "fkey": "F-letter (F) variant",
        "tilde": "Tilde (~) variant",
    }
    ma_variants = {
        "french": "French",
        "tifinagh": "Tifinagh",
        "tifinagh-alt": "Tifinagh Alternative",
        "tifinagh-alt-phonetic": "Tifinagh Alternative Phonetic",
        "tifinagh-extended": "Tifinagh Extended",
        "tifinagh-extended-phonetic": "Tifinagh Extended Phonetic",
        "tifinagh-phonetic": "Tifinagh Phonetic",
    }
    me_variants = {
        "cyrillic": "Cyrillic",
        "cyrillicalternatequotes": "Cyrillic with guillemets",
        "cyrillicyz": "Cyrillic, Z and ZHE swapped",
        "latinalternatequotes": "Latin with guillemets",
        "latinunicode": "Latin unicode",
        "latinunicodeyz": "Latin unicode qwerty",
        "latinyz": "Latin qwerty",
    }
    mk_variants = {"nodeadkeys": "Eliminate dead keys"}
    ml_variants = {
        "fr-oss": "Français (France Alternative)",
        "us-intl": "English (USA International)",
        "us-mac": "English (USA Macintosh)",
    }
    mt_variants = {"us": "Maltese keyboard with US layout"}
    ng_variants = {"hausa": "Hausa", "igbo": "Igbo", "yoruba": "Yoruba"}
    nl_variants = {
        "mac": "Macintosh",
        "std": "Standard",
        "sundeadkeys": "Sun dead keys",
    }
    no_variants = {
        "dvorak": "Dvorak",
        "mac": "Macintosh",
        "mac_nodeadkeys": "Macintosh, eliminate dead keys",
        "nodeadkeys": "Eliminate dead keys",
        "smi": "Northern Saami",
        "smi_nodeadkeys": "Northern Saami, eliminate dead keys",
    }
    pk_variants = {"ara": "Arabic", "urd-crulp": "CRULP", "urd-nla": "NLA"}
    pl_variants = {
        "csb": "Kashubian",
        "dvorak": "Dvorak",
        "dvorak_altquotes": "Dvorak, Polish quotes on key 1",
        "dvorak_quotes": "Dvorak, Polish quotes on quotemark key",
        "dvp": "Programmer Dvorak",
        "qwertz": "qwertz",
        "ru_phonetic_dvorak": "Russian phonetic Dvorak",
    }
    pt_variants = {
        "mac": "Macintosh",
        "mac_nodeadkeys": "Macintosh, eliminate dead keys",
        "mac_sundeadkeys": "Macintosh, Sun dead keys",
        "nativo": "Nativo",
        "nativo-epo": "Nativo for Esperanto",
        "nativo-us": "Nativo for USA keyboards",
        "nodeadkeys": "Eliminate dead keys",
        "sundeadkeys": "Sun dead keys",
    }
    ro_variants = {
        "cedilla": "Cedilla",
        "crh_alt": "Crimean Tatar (Turkish Alt-Q)",
        "crh_dobruca1": "Crimean Tatar (Dobruca-1 Q)",
        "crh_dobruca2": "Crimean Tatar (Dobruca-2 Q)",
        "crh_f": "Crimean Tatar (Turkish F)",
        "std": "Standard",
        "std_cedilla": "Standard (Cedilla)",
        "winkeys": "Winkeys",
    }
    rs_variants = {
        "alternatequotes": "With guillemets",
        "latin": "Latin",
        "latinalternatequotes": "Latin with guillemets",
        "latinunicode": "Latin Unicode",
        "latinunicodeyz": "Latin Unicode qwerty",
        "latinyz": "Latin qwerty",
        "yz": "Z and ZHE swapped",
    }
    ru_variants = {
        "bak": "Bashkirian",
        "cv": "Chuvash",
        "cv_latin": "Chuvash Latin",
        "dos": "DOS",
        "kom": "Komi",
        "legacy": "Legacy",
        "os_legacy": "Ossetian, legacy",
        "os_winkeys": "Ossetian, Winkeys",
        "phonetic": "Phonetic",
        "phonetic_winkeys": "Phonetic Winkeys",
        "sah": "Yakut",
        "srp": "Serbian",
        "tt": "Tatar",
        "typewriter": "Typewriter",
        "typewriter-legacy": "Typewriter, legacy",
        "udm": "Udmurt",
        "xal": "Kalmyk",
    }
    se_variants = {
        "dvorak": "Dvorak",
        "mac": "Macintosh",
        "nodeadkeys": "Eliminate dead keys",
        "rus": "Russian phonetic",
        "rus_nodeadkeys": "Russian phonetic, eliminate dead keys",
        "smi": "Northern Saami",
        "svdvorak": "Svdvorak",
    }
    si_variants = {
        "alternatequotes": "Use guillemets for quotes",
        "us": "US keyboard with Slovenian letters",
    }
    sk_variants = {
        "bksl": "Extended Backslash",
        "qwerty": "qwerty",
        "qwerty_bksl": "qwerty, extended Backslash",
    }
    sy_variants = {
        "ku": "Kurdish, Latin Q",
        "ku_alt": "Kurdish, Latin Alt-Q",
        "ku_f": "Kurdish, (F)",
        "syc": "Syriac",
        "syc_phonetic": "Syriac phonetic",
    }
    th_variants = {"pat": "Pattachote", "tis": "TIS-820.2538"}
    tj_variants = {"legacy": "Legacy"}
    tm_variants = {"alt": "Alt-Q"}
    tr_variants = {
        "alt": "Alt-Q",
        "crh": "Crimean Tatar (Turkish Q)",
        "crh_alt": "Crimean Tatar (Turkish Alt-Q)",
        "crh_f": "Crimean Tatar (Turkish F)",
        "f": "(F)",
        "intl": "International (with dead keys)",
        "ku": "Kurdish, Latin Q",
        "ku_alt": "Kurdish, Latin Alt-Q",
        "ku_f": "Kurdish, (F)",
        "sundeadkeys": "Sun dead keys",
    }
    tw_variants = {"indigenous": "Indigenous", "saisiyat": "Saisiyat"}
    ua_variants = {
        "crh": "Crimean Tatar (Turkish Q)",
        "crh_alt": "Crimean Tatar (Turkish Alt-Q)",
        "crh_f": "Crimean Tatar (Turkish F)",
        "homophonic": "Homophonic",
        "legacy": "Legacy",
        "phonetic": "Phonetic",
        "rstu": "Standard RSTU",
        "rstu_ru": "Standard RSTU on Russian layout",
        "typewriter": "Typewriter",
        "winkeys": "Winkeys",
    }
    us_variants = {
        "alt-intl": "Alternative international (former us_intl)",
        "altgr-intl": "International (AltGr dead keys)",
        "chr": "Cherokee",
        "colemak": "Colemak",
        "dvorak": "Dvorak",
        "dvorak-classic": "Classic Dvorak",
        "dvorak-intl": "Dvorak international",
        "dvorak-l": "Left handed Dvorak",
        "dvorak-r": "Right handed Dvorak",
        "dvp": "Programmer Dvorak",
        "euro": "With EuroSign on 5",
        "intl": "International (with dead keys)",
        "mac": "Macintosh",
        "olpc2": "Group toggle on multiply/divide key",
        "rus": "Russian phonetic",
        "srp": "Serbian",
    }
    uz_variants = {
        "crh": "Crimean Tatar (Turkish Q)",
        "crh_alt": "Crimean Tatar (Turkish Alt-Q)",
        "crh_f": "Crimean Tatar (Turkish F)",
        "latin": "Latin",
    }

    variants = {
        "af": af_variants,
        "am": am_variants,
        "ara": ara_variants,
        "az": az_variants,
        "ba": ba_variants,
        "bd": bd_variants,
        "be": be_variants,
        "bg": bg_variants,
        "br": br_variants,
        "brai": brai_variants,
        "by": by_variants,
        "ca": ca_variants,
        "ch": ch_variants,
        "cn": cn_variants,
        "cz": cz_variants,
        "de": de_variants,
        "dk": dk_variants,
        "ee": ee_variants,
        "epo": epo_variants,
        "es": es_variants,
        "fi": fi_variants,
        "fo": fo_variants,
        "fr": fr_variants,
        "gb": gb_variants,
        "ge": ge_variants,
        "gh": gh_variants,
        "gr": gr_variants,
        "hr": hr_variants,
        "hu": hu_variants,
        "ie": ie_variants,
        "il": il_variants,
        "in": in_variants,
        "iq": iq_variants,
        "ir": ir_variants,
        "is": is_variants,
        "it": it_variants,
        "jp": jp_variants,
        "kg": kg_variants,
        "kr": kr_variants,
        "kz": kz_variants,
        "la": la_variants,
        "latam": latam_variants,
        "lk": lk_variants,
        "lt": lt_variants,
        "lv": lv_variants,
        "ma": ma_variants,
        "me": me_variants,
        "mk": mk_variants,
        "ml": ml_variants,
        "mt": mt_variants,
        "ng": ng_variants,
        "nl": nl_variants,
        "no": no_variants,
        "pk": pk_variants,
        "pl": pl_variants,
        "pt": pt_variants,
        "ro": ro_variants,
        "rs": rs_variants,
        "ru": ru_variants,
        "se": se_variants,
        "si": si_variants,
        "sk": sk_variants,
        "sy": sy_variants,
        "th": th_variants,
        "tj": tj_variants,
        "tm": tm_variants,
        "tr": tr_variants,
        "tw": tw_variants,
        "ua": ua_variants,
        "us": us_variants,
        "uz": uz_variants,
    }

    return variants
