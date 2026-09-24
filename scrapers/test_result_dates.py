"""Regression checks for result dates without touching live sources or Supabase."""

import unittest
from unittest.mock import Mock

from ku_results import KUResultsScraper
from pu_results import PUResultsScraper
from tu_results import TUResultsScraper


class ResultPublicationDateTests(unittest.TestCase):
    def test_real_and_unknown_dates_in_all_result_scrapers(self):
        cases = (
            ("2024-05-01", "2024-05-01T00:00:00"),
            ("", None),
            (None, None),
            ("date not available", None),
        )
        for scraper_class in (KUResultsScraper, PUResultsScraper, TUResultsScraper):
            for raw, expected in cases:
                with self.subTest(scraper=scraper_class.__name__, date_raw=raw):
                    scraper = object.__new__(scraper_class)
                    scraper.logger = Mock()
                    scraper.check_exists = Mock(return_value=False)
                    scraper.check_title_exists = Mock(return_value=False)
                    scraper.extract_content = Mock(return_value={"url": None, "type": "link"})
                    scraper.insert_record = Mock(return_value=True)
                    item = {
                        "title": "BCA Examination Result",
                        "result_url": "https://example.edu.np/result.pdf",
                    }
                    if raw is not None:
                        item["date_raw"] = raw

                    if scraper_class is KUResultsScraper:
                        scraper.get_university_id = Mock(return_value="university-id")
                        scraper.fetch_page = Mock(return_value=object())
                        scraper.parse_results = Mock(return_value=[item])
                        scraper.summary = Mock(return_value={})
                        scraper.scrape()
                    else:
                        scraper.process_items([item], "university-id", None)

                    record = scraper.insert_record.call_args.args[1]
                    self.assertEqual(record["published_date"], expected)


if __name__ == "__main__":
    unittest.main()
