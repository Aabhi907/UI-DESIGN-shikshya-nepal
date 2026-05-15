"""
TU Notices Scraper — Multi-Portal
Scrapes notices from tribhuvan-university.edu.np AND all TU faculty subdomains.
Each portal is tried independently; a failure never stops the others.
"""

from base_scraper import BaseScraper

# ── Portal registry ────────────────────────────────────────────────────────
# (label, urls_to_try, base_url, faculty_tag | None)
TU_NOTICE_PORTALS = [
    (
        "TU Main (tribhuvan-university.edu.np)",
        [
            "https://tribhuvan-university.edu.np/notices",
            "https://tribhuvan-university.edu.np/notice",
            "https://tribhuvan-university.edu.np/",
        ],
        "https://tribhuvan-university.edu.np",
        None,
    ),
    (
        "TU Humanities & Social Sciences (tufohss.edu.np)",
        ["https://tufohss.edu.np/notices", "https://tufohss.edu.np/"],
        "https://tufohss.edu.np",
        "Humanities",
    ),
    (
        "TU Science & Technology (tuiost.edu.np)",
        ["https://tuiost.edu.np/notices", "https://tuiost.edu.np/"],
        "https://tuiost.edu.np",
        "Science & Technology",
    ),
    (
        "TU Management (management.tu.edu.np)",
        [
            "https://management.tu.edu.np/notices",
            "https://management.tu.edu.np/notice",
            "https://management.tu.edu.np/",
        ],
        "https://management.tu.edu.np",
        "Management",
    ),
    (
        "TU Education (education.tu.edu.np)",
        ["https://education.tu.edu.np/notices", "https://education.tu.edu.np/"],
        "https://education.tu.edu.np",
        "Education",
    ),
    (
        "TU Engineering (doep.tu.edu.np)",
        [
            "https://doep.tu.edu.np/notices",
            "https://doep.tu.edu.np/notice",
            "https://doep.tu.edu.np/",
        ],
        "https://doep.tu.edu.np",
        "Engineering",
    ),
    (
        "TU Forestry (forestry.tu.edu.np)",
        ["https://forestry.tu.edu.np/notices", "https://forestry.tu.edu.np/"],
        "https://forestry.tu.edu.np",
        "Forestry",
    ),
    (
        "TU Agriculture / IAAS (iaas.edu.np)",
        ["https://iaas.edu.np/notices", "https://iaas.edu.np/notice", "https://iaas.edu.np/"],
        "https://iaas.edu.np",
        "Agriculture",
    ),
]

NOTICE_KEYWORDS = [
    "notice", "exam", "admission", "result", "schedule",
    "form", "scholarship", "application", "announcement",
    "सूचना", "परीक्षा", "भर्ना",
]


class TUNoticesScraper(BaseScraper):
    def __init__(self):
        super().__init__("TUNotices")

    # ── Parsing ────────────────────────────────────────────────────────────

    def parse_notices(self, soup, base_url: str) -> list[dict]:
        items: list[dict] = []
        seen:  set[str]   = set()

        # Strategy 1: table rows / list items with links
        for row in soup.select("table tr, .notice-list li, .announcement-list li"):
            link_tag = row.find("a", href=True)
            if not link_tag:
                continue
            title = link_tag.get_text(strip=True)
            if not title or len(title) < 8 or title in seen:
                continue
            seen.add(title)
            href = link_tag["href"]
            if href.startswith("/"):
                href = base_url + href
            elif not href.startswith("http"):
                href = base_url + "/" + href.lstrip("/")
            date_raw = ""
            parent = link_tag.parent
            for tag in (parent, row):
                for span in tag.find_all(["td", "span", "small", "div"]):
                    text = span.get_text(strip=True)
                    if any(c.isdigit() for c in text) and len(text) < 20:
                        date_raw = text
                        break
                if date_raw:
                    break
            items.append({"title": title, "notice_url": href, "date_raw": date_raw})

        # Strategy 2: div/article containers
        if not items:
            for div in soup.select(
                ".notice, .notice-item, .news-item, "
                "article, .post, .content-item"
            ):
                link_tag = div.find("a", href=True)
                if not link_tag:
                    continue
                title = link_tag.get_text(strip=True)
                if not title or len(title) < 8 or title in seen:
                    continue
                seen.add(title)
                href = link_tag["href"]
                if href.startswith("/"):
                    href = base_url + href
                elif not href.startswith("http"):
                    href = base_url + "/" + href.lstrip("/")
                date_tag = div.find(["time", "span"], class_=lambda c: c and "date" in c)
                date_raw = date_tag.get_text(strip=True) if date_tag else ""
                items.append({"title": title, "notice_url": href, "date_raw": date_raw})

        # Strategy 3: broad anchor scan filtered by notice keywords
        if not items:
            for anchor in soup.find_all("a", href=True):
                title = anchor.get_text(strip=True)
                if len(title) < 10 or title in seen:
                    continue
                if any(kw in title.lower() for kw in NOTICE_KEYWORDS):
                    seen.add(title)
                    href = anchor["href"]
                    if href.startswith("/"):
                        href = base_url + href
                    elif not href.startswith("http"):
                        href = base_url + "/" + href.lstrip("/")
                    items.append({"title": title, "notice_url": href, "date_raw": ""})

        return items

    # ── Insert helpers ─────────────────────────────────────────────────────

    def process_items(
        self,
        items: list[dict],
        university_id: str,
        faculty_tag: str | None,
    ) -> None:
        for item in items:
            raw_title = item["title"].strip()
            if not raw_title:
                continue

            if faculty_tag and faculty_tag.lower() not in raw_title.lower():
                title = f"[{faculty_tag}] {raw_title}"
            else:
                title = raw_title

            date_str = self.parse_date(item["date_raw"]) if item.get("date_raw") else None
            slug     = self.slugify_with_date(title, item.get("date_raw", ""))

            record = {
                "title":          title,
                "slug":           slug,
                "university_id":  university_id,
                "notice_url":     item.get("notice_url"),
                "published_date": date_str,
            }

            if self.insert_record("notices", record):
                self.send_notification(
                    title="New Notice 📋",
                    message=title,
                    url=f"https://sikshyanepal.vercel.app/notices/{record['slug']}",
                )

    # ── Main entry point ───────────────────────────────────────────────────

    def scrape(self) -> dict:
        university_id = self.get_university_id("TU")
        if not university_id:
            self.logger.error("TU university_id not found — aborting")
            return self.summary()

        portal_stats: list[tuple[str, int]] = []

        for label, urls, base_url, faculty_tag in TU_NOTICE_PORTALS:
            self.logger.info(f"── Portal: {label}")
            try:
                soup  = None
                items = []
                for url in urls:
                    soup = self.fetch_page(url)
                    if not soup:
                        continue
                    items = self.parse_notices(soup, base_url)
                    if items:
                        self.logger.info(f"   Got {len(items)} items from {url}")
                        break

                before = self.inserted
                self.process_items(items, university_id, faculty_tag)
                portal_stats.append((label, self.inserted - before))

            except Exception as e:
                self.logger.error(f"   Portal crashed: {e}")
                portal_stats.append((label, -1))

        self.logger.info("── Portal summary:")
        for label, count in portal_stats:
            status = f"{count} new" if count >= 0 else "FAILED"
            self.logger.info(f"   {status:>8}  {label}")

        return self.summary()


if __name__ == "__main__":
    scraper = TUNoticesScraper()
    print(scraper.scrape())
