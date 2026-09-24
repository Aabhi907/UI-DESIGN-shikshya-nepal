"""
Notice publication-date extraction.

Two jobs, both pure (no network, no database) so they can be tested against saved HTML:

  parse_notice_date(raw)   -> ISO string or None
  find_notice_date(anchor) -> the raw date text that belongs to one notice, or ""

Rules, same as every scraper here: a date that is missing, ambiguous or not
readable stays None. Never today's date, never created_at, never a neighbouring
notice's date, and Bikram Sambat dates are not converted (a wrong calendar table
would be a fabricated date).
"""

import re
from datetime import date, datetime, timedelta

from base_scraper import BaseScraper

# A published date this far ahead of today is almost certainly an event or a
# deadline mentioned nearby, or a Bikram Sambat year, not a publication date.
# Two days covers Nepal (UTC+5:45) being ahead of the machine running the scraper.
MAX_FUTURE_DAYS = 2
MIN_YEAR = 2000
MAX_CLIMB = 4

_MONTHS = {
    "jan": 1, "january": 1, "feb": 2, "february": 2, "mar": 3, "march": 3,
    "apr": 4, "april": 4, "may": 5, "jun": 6, "june": 6, "jul": 7, "july": 7,
    "aug": 8, "august": 8, "sep": 9, "sept": 9, "september": 9,
    "oct": 10, "october": 10, "nov": 11, "november": 11, "dec": 12, "december": 12,
}
_LABEL = re.compile(r"^(?:published|posted|date|on)\b[\s:.-]*", re.I)
_ORDINAL = re.compile(r"(?<=\d)(?:st|nd|rd|th)\b", re.I)
_ISO = re.compile(
    r"^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})"
    r"(?:[T\s]\d{1,2}:\d{2}(?::\d{2})?(?:\.\d+)?(?:Z|[+-]\d{2}:?\d{2})?)?$"
)
_DAY_MONTH_YEAR = re.compile(r"^(\d{1,2})\s+([A-Za-z]{3,9})\s+(\d{4})$")
_MONTH_DAY_YEAR = re.compile(r"^([A-Za-z]{3,9})\s+(\d{1,2})\s+(\d{4})$")

_SHORT_TEXT_TAGS = {"small", "span", "td", "div", "p", "b", "i", "em", "li", "strong", "label"}
_DATE_CLASS = re.compile(r"date", re.I)


def _normalize(text: str) -> str:
    text = " ".join(text.split())
    text = _LABEL.sub("", text)
    text = _ORDINAL.sub("", text)
    return " ".join(text.replace(",", " ").split())


def _to_date(year: int, month: int, day: int) -> date | None:
    try:
        return date(year, month, day)
    except ValueError:
        return None


def _month(token: str) -> int | None:
    return _MONTHS.get(token.lower())


def parse_notice_date(raw, today: date | None = None) -> str | None:
    """
    ISO 8601 datetime string for a Gregorian date, or None.

    Anything the shared parser already understood keeps parsing exactly as before.
    On top of that: ordinal days ("26th Jul, 2023"), "Sept", an optional
    "Published:" style label, and ISO dates with a time. Those extra shapes are
    also required to look like a plausible publication date.
    """
    if not raw:
        return None
    text = " ".join(str(raw).split())
    if not text:
        return None

    legacy = BaseScraper.parse_date(text, fallback_to_today=False)
    if legacy:
        return legacy

    normalized = _normalize(text)
    parsed: date | None = None
    if (m := _ISO.match(normalized)):
        parsed = _to_date(int(m[1]), int(m[2]), int(m[3]))
    elif (m := _DAY_MONTH_YEAR.match(normalized)):
        month = _month(m[2])
        parsed = _to_date(int(m[3]), month, int(m[1])) if month else None
    elif (m := _MONTH_DAY_YEAR.match(normalized)):
        month = _month(m[1])
        parsed = _to_date(int(m[3]), month, int(m[2])) if month else None
    if parsed is None:
        return None

    today = today or date.today()
    if parsed.year < MIN_YEAR or parsed > today + timedelta(days=MAX_FUTURE_DAYS):
        return None
    return datetime(parsed.year, parsed.month, parsed.day).isoformat()


def _href_key(href: str) -> str:
    return href.strip().split("#", 1)[0].rstrip("/").lower()


def _is_notice_link(tag) -> bool:
    href = (tag.get("href") or "").strip()
    if not href or href.startswith(("#", "javascript:", "mailto:", "tel:")):
        return False
    return len(tag.get_text(strip=True)) >= 10


def _holds_other_notice(container, anchor) -> bool:
    own = _href_key(anchor.get("href", ""))
    return any(
        link is not anchor and _is_notice_link(link) and _href_key(link["href"]) != own
        for link in container.find_all("a", href=True)
    )


def _candidates(container) -> dict[int, list[str]]:
    """Date-only elements inside container, grouped by how explicitly they are dates."""
    found: dict[int, list[str]] = {0: [], 1: [], 2: []}
    for el in container.find_all(True):
        classes = " ".join(el.get("class") or [])
        text = el.get_text(" ", strip=True)
        if el.name == "time":
            raw = el.get("datetime") or text
            if parse_notice_date(raw):
                found[0].append(raw)
        elif _DATE_CLASS.search(classes):
            if parse_notice_date(text):
                found[1].append(text)
        elif el.name in _SHORT_TEXT_TAGS and 0 < len(text) <= 40:
            if parse_notice_date(text):
                found[2].append(text)
    return found


def find_notice_date(anchor, max_climb: int = MAX_CLIMB) -> str:
    """
    Raw date text belonging to the notice behind `anchor`, or "".

    Climbs from the link to the smallest enclosing element that holds only this
    one notice, and accepts a date only from there. It gives up, returning "",
    if that container also holds another notice (the date could be theirs) or
    holds two different dates (which one is the publication date?).
    """
    node = anchor
    for _ in range(max_climb):
        node = node.parent
        if node is None or node.name in ("body", "html", "[document]"):
            break
        if _holds_other_notice(node, anchor):
            return ""
        groups = _candidates(node)
        for priority in (0, 1, 2):
            raws = groups[priority]
            if not raws:
                continue
            if len({parse_notice_date(r) for r in raws}) == 1:
                return raws[0]
            return ""
    return ""
