"""
Regression tests for the newsroom auto-publish kill switch (Wave 2, Stream 2).

The only path that can put a page live with no human check is the college
newsroom's "low-risk, high-confidence, source-backed" auto-publish. Two
independent things must both hold:
  1. no scraper config file sets auto_publish_low_risk to True;
  2. the base-scraper gate itself refuses to publish unless the
     SCRAPER_AUTO_PUBLISH=1 environment variable is set, regardless of what a
     source config says — so a config typo or a copy-pasted row can't turn
     auto-publish back on by itself.

Run from the repo root:   npm run test:scrapers
or directly:              python3 -m unittest discover -s scrapers/tests -v
"""

import os
import re
import sys
import unittest
from pathlib import Path
from unittest import mock

HERE = Path(__file__).resolve().parent
SCRAPERS_DIR = HERE.parent
sys.path.insert(0, str(SCRAPERS_DIR))

import base_scraper  # noqa: E402
from base_scraper import BaseScraper  # noqa: E402

AUTO_PUBLISH_TRUE = re.compile(r"""["']auto_publish_low_risk["']\s*:\s*True\b""")


def scraper_source_files():
    # Every .py file directly under scrapers/, not scrapers/tests/.
    return sorted(p for p in SCRAPERS_DIR.glob("*.py"))


class NoScraperConfigAutoPublishes(unittest.TestCase):
    def test_no_scraper_file_sets_auto_publish_low_risk_true(self):
        offenders = []
        for path in scraper_source_files():
            text = path.read_text(encoding="utf-8")
            if AUTO_PUBLISH_TRUE.search(text):
                offenders.append(path.name)
        self.assertEqual(offenders, [], f"auto_publish_low_risk: True found in: {offenders}")

    def test_the_pattern_itself_is_still_detectable(self):
        # A control for the check above: prove the regex actually catches the
        # shape it is meant to catch, so a passing test above isn't just a
        # pattern that never matches anything.
        self.assertIsNotNone(AUTO_PUBLISH_TRUE.search('"auto_publish_low_risk": True'))
        self.assertIsNotNone(AUTO_PUBLISH_TRUE.search("'auto_publish_low_risk': True"))
        self.assertIsNone(AUTO_PUBLISH_TRUE.search('"auto_publish_low_risk": False'))


def make_scraper():
    # Bypass BaseScraper.__init__ (it opens a real Supabase connection) —
    # this test only exercises _auto_publish_news, with a stubbed database.
    scraper = BaseScraper.__new__(BaseScraper)
    scraper.logger = base_scraper.logging.getLogger("test-no-auto-publish")
    scraper.supabase = mock.MagicMock()
    scraper.published = 0
    return scraper


def eligible_queue_row():
    # Satisfies every condition _auto_publish_news checks *except* the
    # environment-variable gate under test.
    return {
        "claim_risk": "low",
        "confidence_score": 95,
        "college_id": "college-1",
        "source_id": "source-1",
        "content_category": "college_news",
        "source_url": "https://example.edu.np/news/1",
        "fingerprint": "fp-1",
        "payload": {
            "title": "Example announcement",
            "slug": "example-announcement",
            "content": "x" * 200,
        },
    }


class BaseScraperAutoPublishGate(unittest.TestCase):
    def setUp(self):
        # Never let a real value of this leak in from the host environment.
        self._env_patch = mock.patch.dict(os.environ, {}, clear=False)
        self._env_patch.start()
        os.environ.pop("SCRAPER_AUTO_PUBLISH", None)
        self.addCleanup(self._env_patch.stop)

    def test_does_not_publish_without_the_env_var(self):
        scraper = make_scraper()
        # Even though the source config says yes, and the queue row is
        # otherwise fully eligible.
        scraper.supabase.table.return_value.select.return_value.eq.return_value.single.return_value.execute.return_value.data = {
            "name": "Example University", "auto_publish_low_risk": True, "is_active": True,
        }
        scraper._auto_publish_news(eligible_queue_row())
        # The gate must return before touching the database at all.
        scraper.supabase.table.assert_not_called()

    def test_reverse_check_publishes_with_the_env_var_and_config_both_set(self):
        os.environ["SCRAPER_AUTO_PUBLISH"] = "1"
        scraper = make_scraper()
        scraper.supabase.table.return_value.select.return_value.eq.return_value.single.return_value.execute.return_value.data = {
            "name": "Example University", "auto_publish_low_risk": True, "is_active": True,
        }
        scraper.supabase.table.return_value.upsert.return_value.execute.return_value.data = [{"id": "news-1"}]
        scraper.supabase.table.return_value.update.return_value.eq.return_value.execute.return_value.data = [{"id": "queue-1"}]
        scraper._auto_publish_news(eligible_queue_row())
        self.assertIn(mock.call("news"), scraper.supabase.table.call_args_list)

    def test_still_refuses_with_the_env_var_set_if_the_source_config_says_no(self):
        os.environ["SCRAPER_AUTO_PUBLISH"] = "1"
        scraper = make_scraper()
        scraper.supabase.table.return_value.select.return_value.eq.return_value.single.return_value.execute.return_value.data = {
            "name": "Example University", "auto_publish_low_risk": False, "is_active": True,
        }
        scraper._auto_publish_news(eligible_queue_row())
        self.assertNotIn(mock.call("news"), scraper.supabase.table.call_args_list)


SCRAPER_CLASS_NAMES = [
    "CollegeNewsroomScraper", "TUResultsScraper", "KUResultsScraper", "PUResultsScraper",
    "POUNoticesScraper", "CTEVTNoticesScraper", "TUNoticesScraper", "NEBNoticesScraper", "CollegeScraper",
]


def fake_scraper_class(*, crashes=False, result=None):
    class FakeScraper:
        def scrape(self):
            if crashes:
                raise RuntimeError("stubbed crash")
            return result or {"inserted": 1, "skipped": 0, "errors": 0}
    return FakeScraper


class RunAllExitCode(unittest.TestCase):
    """
    A broken scraper must turn the workflow red (exit 1), not silently pass
    (exit 0). run_all imports and instantiates real scraper classes inside
    run(), so each one is stubbed out at the module level rather than run for
    real — no scraper here ever touches the network or a database.
    """

    def setUp(self):
        import run_all
        self.run_all = run_all
        self._patches = [
            mock.patch.object(run_all, "trigger_vercel_deploy"),
            mock.patch.object(run_all, "post_to_facebook"),
        ]
        for patch in self._patches:
            patch.start()
            self.addCleanup(patch.stop)

    def _run_with(self, overrides):
        patches = {name: overrides.get(name, fake_scraper_class()) for name in SCRAPER_CLASS_NAMES}
        with mock.patch.multiple(self.run_all, **patches):
            return self.run_all.run()

    def test_all_scrapers_succeeding_exits_0(self):
        self.assertEqual(self._run_with({}), 0)

    def test_one_crashed_scraper_exits_1(self):
        exit_code = self._run_with({"TUResultsScraper": fake_scraper_class(crashes=True)})
        self.assertEqual(exit_code, 1)

    def test_one_scraper_fetching_nothing_with_errors_exits_1(self):
        # Ran, didn't crash, but got nothing and reported why — a source is
        # very likely down or its page layout changed.
        exit_code = self._run_with({
            "NEBNoticesScraper": fake_scraper_class(result={"inserted": 0, "skipped": 0, "errors": 1}),
        })
        self.assertEqual(exit_code, 1)

    def test_errors_alongside_real_inserts_or_skips_does_not_fail_the_run(self):
        # A few record-level errors in an otherwise-working scraper (e.g. one
        # malformed row) is not the same as a source that returned nothing.
        exit_code = self._run_with({
            "NEBNoticesScraper": fake_scraper_class(result={"inserted": 3, "skipped": 1, "errors": 1}),
        })
        self.assertEqual(exit_code, 0)


if __name__ == "__main__":
    unittest.main()
