"""
Regression tests for notice publication-date extraction.

Run from the repo root:   npm run test:scrapers
or directly:              python3 -m unittest discover -s scrapers/tests -v

The listing-page tests use saved excerpts of the real TU portal pages (see
fixtures/) so nothing here needs the network or a database. Expected dates were
read off the pages independently of the code under test; expected titles and URLs
are what the scraper returned *before* date extraction was improved, so a passing
run means: same notices, same titles, now with dates.
"""

import sys
import unittest
from datetime import date
from pathlib import Path
from unittest import mock

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent))

from bs4 import BeautifulSoup  # noqa: E402

import base_scraper  # noqa: E402
from base_scraper import BaseScraper  # noqa: E402
from notice_dates import find_notice_date, parse_notice_date  # noqa: E402
from tu_notices import TUNoticesScraper  # noqa: E402

TODAY = date(2026, 9, 24)


def iso(day: str) -> str:
    return f"{day}T00:00:00"


def soup(html: str):
    return BeautifulSoup(html, "lxml")


def first_anchor(html: str, needle: str):
    return soup(html).find("a", href=lambda h: h and needle in h)


class ParseNoticeDate(unittest.TestCase):
    def test_iso_dates(self):
        self.assertEqual(parse_notice_date("2026-09-21", TODAY), iso("2026-09-21"))
        self.assertEqual(parse_notice_date("2026/09/21", TODAY), iso("2026-09-21"))

    def test_ordinal_day_month_names(self):
        # The shape tuiost.edu.np uses; the shared parser rejected every one of these.
        for text, expected in [
            ("26th Jul, 2023", "2023-07-26"), ("1st Jan, 2024", "2024-01-01"),
            ("2nd Aug, 2023", "2023-08-02"), ("3rd Sept 2023", "2023-09-03"),
            ("22nd September 2023", "2023-09-22"), ("11th Nov, 2023", "2023-11-11"),
        ]:
            with self.subTest(text=text):
                self.assertEqual(parse_notice_date(text, TODAY), iso(expected))

    def test_other_readable_shapes(self):
        self.assertEqual(parse_notice_date("Jul 26, 2023", TODAY), iso("2023-07-26"))
        self.assertEqual(parse_notice_date("Published: 2026-09-21", TODAY), iso("2026-09-21"))
        self.assertEqual(parse_notice_date("2026-09-21T10:30:00Z", TODAY), iso("2026-09-21"))
        self.assertEqual(parse_notice_date("2026-09-21 10:30", TODAY), iso("2026-09-21"))

    def test_shapes_the_shared_parser_already_read_are_unchanged(self):
        for text in ["2026-09-21", "05-06-2026", "05/06/2026", "July 26, 2023", "26 July 2023", "26 Jul 2023"]:
            with self.subTest(text=text):
                self.assertEqual(
                    parse_notice_date(text, TODAY),
                    BaseScraper.parse_date(text, fallback_to_today=False),
                )
                self.assertIsNotNone(parse_notice_date(text, TODAY))

    def test_unreadable_or_absent_stays_none_never_today(self):
        for text in [None, "", "   ", "Notice", "26th", "Jul 2023", "31 Feb 2026", "32nd Jul, 2023", "abc 5, 2026", "2026-13-01"]:
            with self.subTest(text=text):
                self.assertIsNone(parse_notice_date(text, TODAY))

    def test_bikram_sambat_is_not_converted_or_guessed(self):
        for text in ["2083-05-26", "2083.05.30", "2083-5-22", "26th Bhadra, 2083"]:
            with self.subTest(text=text):
                self.assertIsNone(parse_notice_date(text, TODAY))

    def test_implausible_publication_dates_are_rejected(self):
        self.assertIsNone(parse_notice_date("5th Oct, 2026", TODAY))  # 11 days ahead: an event, not a publish date
        # The plausibility floor guards the newly readable shapes; shapes the shared
        # parser already accepted (plain ISO, d-m-Y, ...) behave exactly as they did.
        self.assertIsNone(parse_notice_date("1st Jan, 1899", TODAY))
        self.assertEqual(parse_notice_date("26th Sep, 2026", TODAY), iso("2026-09-26"))  # within the 2-day timezone allowance


ROW = """
<div class="row-a"><div class="date"><span class="nep_date">2026-09-21</span></div>
<div class="detail"><a href="/n/1"><h5>Form Fill Up Notice for MA 4th Semester</h5></a></div></div>
"""


class FindNoticeDate(unittest.TestCase):
    def test_date_in_a_sibling_of_the_title(self):
        self.assertEqual(find_notice_date(first_anchor(ROW, "/n/1")), "2026-09-21")

    def test_date_inside_the_link_itself(self):
        html = '<div class="wrap"><a href="/n/2"><h5>Notice about the entrance examination</h5><div class="badge"><span class="nep_date">2026-09-17</span></div></a></div>'
        self.assertEqual(find_notice_date(first_anchor(html, "/n/2")), "2026-09-17")

    def test_plain_small_tag_with_ordinal_date(self):
        html = '<div class="mt-3"><a href="/n/3"><b>Exam schedule for semester four</b></a> <small class="text-muted">26th Jul, 2023</small></div>'
        self.assertEqual(find_notice_date(first_anchor(html, "/n/3")), "26th Jul, 2023")

    def test_time_element_wins(self):
        html = '<li><a href="/n/4">Admission notice for the new session</a><time datetime="2026-09-01">1 Sep</time></li>'
        self.assertEqual(find_notice_date(first_anchor(html, "/n/4")), "2026-09-01")

    def test_icon_link_and_title_link_to_the_same_page_still_count_as_one_notice(self):
        html = '<div><a href="/n/5"><i class="icon"></i></a><a href="/n/5">Result of the final examination</a><span class="date">2026-09-10</span></div>'
        self.assertEqual(find_notice_date(first_anchor(html, "/n/5")), "2026-09-10")

    def test_never_borrows_a_neighbours_date(self):
        # Two notices share one container and there is a single date: whose is it? Unknown.
        html = '<ul><li><a href="/n/6">First notice about admissions</a></li><li><a href="/n/7">Second notice about results</a></li></ul><span class="date">2026-09-01</span>'
        self.assertEqual(find_notice_date(first_anchor(html, "/n/6")), "")
        self.assertEqual(find_notice_date(first_anchor(html, "/n/7")), "")
        # A tighter row inside a shared list still resolves to its own date only.
        html2 = '<ul><li><a href="/n/8">First notice about admissions</a><span class="date">2026-09-02</span></li><li><a href="/n/9">Second notice about results</a></li></ul>'
        self.assertEqual(find_notice_date(first_anchor(html2, "/n/8")), "2026-09-02")
        self.assertEqual(find_notice_date(first_anchor(html2, "/n/9")), "")

    def test_two_different_dates_in_one_notice_is_ambiguous(self):
        html = '<div><a href="/n/10">Application call for scholarship</a><span class="date">2026-09-01</span><span class="date">2026-09-30</span></div>'
        self.assertEqual(find_notice_date(first_anchor(html, "/n/10")), "")

    def test_a_date_like_title_is_not_a_date(self):
        html = '<div><a href="/n/11">Result of 2026-09-01 exam schedule notice</a></div>'
        self.assertEqual(find_notice_date(first_anchor(html, "/n/11")), "")

    def test_no_date_anywhere_gives_empty(self):
        self.assertEqual(find_notice_date(first_anchor('<div><a href="/n/12">A notice with no date at all</a></div>', "/n/12")), "")

    def test_date_too_far_away_is_not_used(self):
        html = '<div class="a"><div class="b"><div class="c"><div class="d"><div class="e"><a href="/n/13">Notice far from its date text</a></div></div></div></div><span class="date">2026-09-01</span></div>'
        self.assertEqual(find_notice_date(first_anchor(html, "/n/13")), "")


def scraper():
    with mock.patch.object(base_scraper.BaseScraper, "_connect", lambda self: None):
        return TUNoticesScraper()


def load(name: str) -> str:
    return (HERE / "fixtures" / name).read_text(encoding="utf-8")


EXPECTED_FOHSS = [
    ('https://fohss.tu.edu.np/notices/15495', 'Physical Form Fill Up Notice for MA 4th Semester Make Up Exam (B2023)', '2026-09-21'),
    ('https://fohss.tu.edu.np/notices/15494', 'Form Fill Up Notice For BCA II Semester (B2025) and BCA IV Semester (B2024)', '2026-09-21'),
    ('https://fohss.tu.edu.np/notices/15487', 'दर्शनाचार्य-विद्यावारिधि तहको तेस्रो सेमेस्टरको शोध-प्रबन्धको अनलाइन फाराम भर्ने सम्बन्धमा जरुरी सूचना ।', '2026-09-18'),
    ('https://fohss.tu.edu.np/notices/15464', 'BCA Re-entrance Result 2026 Batch', '2026-09-19'),
    ('https://fohss.tu.edu.np/notices/15369', 'Notice for BCA Re-Entrance', '2026-09-17'),
    ('https://fohss.tu.edu.np/notices/15305', 'स्नातकोत्तर तह तेस्रो सेमेस्टर परीक्षा तालिकामा स\u200cसोधन गरीएको सम्बन्धमा ।', '2026-09-15'),
]

EXPECTED_IOE = [
    ('https://ioe.tu.edu.np/notices/15537', 'पुनः  सिलबन्दी दरभाउपत्र आह्वान सम्बन्धी सूचना', '2026-09-23'),
    ('https://ioe.tu.edu.np/notices/15148', 'NOTICE: Additional Model Questions Update', '2026-09-07'),
    ('https://ioe.tu.edu.np/notices/14760', 'NOTICE: Model Questions Update', '2026-08-25'),
    ('https://ioe.tu.edu.np/notices/14417', 'सिलबन्दी दरभाउ पत्र आह्वान सम्बन्धी सूचना', '2026-08-12'),
    ('https://ioe.tu.edu.np/notices/14224', 'BE-Admission Document for Foreign Applicants Notice 2083', '2026-08-05'),
    ('https://ioe.tu.edu.np/notices/14223', 'स्नातक कार्यक्रमहरुमा कोटाको लागि आवेदन दिँदा चाहिने आवश्यक कागजातहरु सम्बन्धी सूचना 2083', '2026-08-05'),
]

# tuiost links are storage paths; matched on the file name.
EXPECTED_TUIOST = [
    ('festivalphd-secondannouncementprint-1806.pdf', 'Ph.D. Festival 2080 – Second Announcement', '2023-07-18'),
    ('bsccsit-7-result686.pdf', 'B.Sc.CSIT VII Semester-2075 Exam Result', '2023-07-15'),
    ('bsccsit-3-form-fillup679.pdf', 'B.Sc. CSIT III Semester-2078 Form Fill Up Notice', '2023-07-14'),
    ('bit-form-fillup356.pdf', 'Bachelor in Information Technology (BIT) III Semester-2078 and VI Semester-2076 Form Fill Up Notice', '2023-07-14'),
    ('bmath-retotalling293.pdf', 'Re-totaling Result of Bachelor in Mathematical Science I Semester-2079', '2023-07-14'),
    ('math-retotaling827.pdf', 'Re-totaling Result of M.Sc. Mathematics IV Semester-2076', '2023-07-14'),
    ('bt-retotaling417.pdf', 'Re-totaling Result of M.Sc. Biotechnology Partial Exam', '2023-07-14'),
    ('abstractsubmission07172023922.pdf', 'Abstract Submission सम्बन्धी सूचना', '2023-07-09'),
    ('retot-compressed-1423.pdf', 'Re-totaling Result of B.Sc.CSIT III Semester - 2077', '2023-07-07'),
    ('camscanner-07-07-2023-1351-compressed2.pdf', 'Bachelor in Mathematical Science III Semester - 2078 Exam Result', '2023-07-07'),
    ('retotaling-compressed977.pdf', 'Re-Totaling Result of BIT III Semester-2077 Exam', '2023-07-04'),
    ('csit6-compressed695.pdf', 'B.Sc.CSIT VI Semester - 2076 Exam Schedule', '2023-07-04'),
    ('makeup-compressed439.pdf', 'M.Sc. IV Semester Make Up - 2076 Exam Schedule', '2023-07-04'),
    ('mds-compressed688.pdf', 'Masters in Data Science IV Semester - 2077 Exam Schedule', '2023-07-04'),
    ('bmath-compressed230.pdf', 'Bachelor of Mathematical Science V Semester - 2077 and VII Semester -2076 Exam Schedule', '2023-07-04'),
    ('msc1-compressed453.pdf', 'M.Sc. I Semester - 2079 Exam Schedule', '2023-07-04'),
    ('result-compressed516.pdf', 'B.Sc.CSIT प्रथम वर्ष प्रथम शत्र देखि चौथो वर्ष आठौं शत्र सम्मको मौका परीक्षाको परीक्षाफल', '2023-06-30'),
]


class SavedListingPages(unittest.TestCase):
    """The scraper's own parse_notices on saved copies of the live pages."""

    def check(self, fixture: str, base_url: str, expected, key):
        items = scraper().parse_notices(soup(load(fixture)), base_url)
        # Same notices, same titles, same order as before the change.
        self.assertEqual([(key(i["notice_url"]), i["title"]) for i in items], [(u, t) for u, t, _ in expected])
        # And now every one has its real published date.
        got = {key(i["notice_url"]): parse_notice_date(i["published_raw"], TODAY) for i in items}
        self.assertEqual(got, {u: iso(d) for u, _, d in expected})
        # The slug's date input is untouched, so slugs do not change with better extraction.
        self.assertTrue(all(i["date_raw"] == "" for i in items))

    def test_fohss_humanities(self):
        self.check("fohss_notices.html", "https://fohss.tu.edu.np", EXPECTED_FOHSS, lambda u: u)

    def test_ioe_engineering(self):
        self.check("ioe_notices.html", "https://ioe.tu.edu.np", EXPECTED_IOE, lambda u: u)

    def test_tuiost_science_and_technology(self):
        self.check("tuiost_notices.html", "https://tuiost.edu.np", EXPECTED_TUIOST, lambda u: u.rsplit("/", 1)[-1])

    def test_nothing_is_dated_when_the_page_has_no_dates(self):
        html = "<html><body>" + "".join(
            f'<div class="x"><a href="/notices/{n}">Notice number {n} about examinations</a></div>' for n in range(3)
        ) + "</body></html>"
        items = scraper().parse_notices(soup(html), "https://example.test")
        self.assertEqual(len(items), 3)
        self.assertTrue(all(parse_notice_date(i["published_raw"], TODAY) is None for i in items))


if __name__ == "__main__":
    unittest.main()
