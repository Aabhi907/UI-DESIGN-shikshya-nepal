"""
TU Results Scraper — Multi-Portal
Scrapes exam results from tuexam.edu.np AND all major TU faculty portals.
Each portal is tried independently; a failure in one never stops the others.
"""

import re
from base_scraper import BaseScraper

# ── Portal registry ────────────────────────────────────────────────────────
# Each entry: (label, url, base_url, faculty_tag | None)
# faculty_tag is prefixed to the title when the title doesn't already name
# the faculty — keeps results identifiable when shown in one unified list.
TU_RESULT_PORTALS = [
    (
        "TU Main Exam (tuexam.edu.np)",
        "https://tuexam.edu.np/",
        "https://tuexam.edu.np",
        None,               # titles already mention faculty
    ),
    (
        "TU Humanities & Social Sciences (tufohss.edu.np)",
        "https://tufohss.edu.np/notices",
        "https://tufohss.edu.np",
        "Humanities",
    ),
    (
        "TU Science & Technology (tuiost.edu.np)",
        "https://tuiost.edu.np/notices",
        "https://tuiost.edu.np",
        "Science & Technology",
    ),
    (
        "TU Management (management.tu.edu.np)",
        "https://management.tu.edu.np/notices",
        "https://management.tu.edu.np",
        "Management",
    ),
    (
        "TU Education (education.tu.edu.np)",
        "https://education.tu.edu.np/notices",
        "https://education.tu.edu.np",
        "Education",
    ),
    (
        "TU Engineering (doep.tu.edu.np)",
        "https://doep.tu.edu.np/",
        "https://doep.tu.edu.np",
        "Engineering",
    ),
    (
        "TU Forestry (forestry.tu.edu.np)",
        "https://forestry.tu.edu.np/notices",
        "https://forestry.tu.edu.np",
        "Forestry",
    ),
    (
        "TU Agriculture / IAAS (iaas.edu.np)",
        "https://iaas.edu.np/notices",
        "https://iaas.edu.np",
        "Agriculture",
    ),
]

RESULT_KEYWORDS = [
    "result", "exam", "semester", "annual", "schedule",
    "परीक्षाफल", "नतिजा",
]

PROGRAM_MAP = [
    "bsc csit", "bca", "bba", "bbs", "be", "b.e",
    "ba", "bsc", "mbbs", "mba", "mbs", "ma", "msc",
]

SEM_MAP = ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th"]


class TUResultsScraper(BaseScraper):
    def __init__(self):
        super().__init__("TUResults")

    # ── Parsing ────────────────────────────────────────────────────────────

    def parse_results(self, soup, base_url: str) -> list[dict]:
        items: list[dict] = []
        seen:  set[str]   = set()

        # Strategy 1: tuexam card layout (.col-md-4 with <b> + btn-primary link)
        for card in soup.select(".col-md-7 .col-md-4, .col-md-4"):
            b_tag    = card.find("b")
            link_tag = (
                card.find("a", class_="btn-primary")
                or card.find("a", href=lambda h: h and "view-notice" in h)
            )
            if not b_tag or not link_tag:
                continue
            title = b_tag.get_text(strip=True)
            if not title or len(title) < 5 or title in seen:
                continue
            seen.add(title)
            href = link_tag["href"]
            if not href.startswith("http"):
                href = base_url + "/" + href.lstrip("/")
            date_m = re.search(
                r"[\(\[]*(?:Published Date|Date):\s*([\d/\-]+)", title, re.IGNORECASE
            )
            items.append({
                "title":      title,
                "result_url": href,
                "date_raw":   date_m.group(1) if date_m else "",
            })

        # Strategy 2: table rows
        if not items:
            for row in soup.select("table tr"):
                cells    = row.find_all("td")
                link_tag = row.find("a", href=True)
                if not link_tag or len(cells) < 1:
                    continue
                title = link_tag.get_text(strip=True)
                if not title or len(title) < 5 or title in seen:
                    continue
                seen.add(title)
                href = link_tag["href"]
                if not href.startswith("http"):
                    href = base_url + "/" + href.lstrip("/")
                date_raw = ""
                for cell in cells:
                    text = cell.get_text(strip=True)
                    if any(c.isdigit() for c in text) and ("-" in text or "/" in text):
                        date_raw = text
                        break
                items.append({"title": title, "result_url": href, "date_raw": date_raw})

        # Strategy 3: div/article containers
        if not items:
            for container in soup.select(
                ".notice-item, .result-item, article, "
                ".news-item, .post-item, li.item"
            ):
                link_tag = container.find("a", href=True)
                if not link_tag:
                    continue
                title = link_tag.get_text(strip=True)
                if not title or len(title) < 5 or title in seen:
                    continue
                if not any(kw in title.lower() for kw in RESULT_KEYWORDS):
                    continue
                seen.add(title)
                href = link_tag["href"]
                if not href.startswith("http"):
                    href = base_url + "/" + href.lstrip("/")
                items.append({"title": title, "result_url": href, "date_raw": ""})

        # Strategy 4: broad anchor scan
        if not items:
            for anchor in soup.find_all("a", href=True):
                title = anchor.get_text(strip=True)
                if len(title) < 8 or title in seen:
                    continue
                if any(kw in title.lower() for kw in RESULT_KEYWORDS):
                    seen.add(title)
                    href = anchor["href"]
                    if not href.startswith("http"):
                        href = base_url + "/" + href.lstrip("/")
                    items.append({"title": title, "result_url": href, "date_raw": ""})

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

            # Prefix faculty tag if the portal has one and it's not in the title
            if faculty_tag and faculty_tag.lower() not in raw_title.lower():
                title = f"[{faculty_tag}] {raw_title}"
            else:
                title = raw_title

            date_str = self.parse_date(item["date_raw"]) if item.get("date_raw") else None
            slug     = self.slugify_with_date(title, item.get("date_raw", ""))

            record: dict = {
                "title":          title,
                "slug":           slug,
                "university_id":  university_id,
                "result_url":     item.get("result_url"),
                "published_date": date_str,
            }

            title_lower = title.lower()
            for prog in PROGRAM_MAP:
                if prog in title_lower:
                    record["program"] = prog.upper().replace("B.E", "BE")
                    break
            for sem in SEM_MAP:
                if sem in title_lower:
                    record["semester"] = f"{sem} Semester"
                    break

            if self.insert_record("results", record):
                self.send_notification(
                    title="New Result Published 📢",
                    message=f"{title} is now available",
                    url=f"https://sikshyanepal.vercel.app/results/{record['slug']}",
                )

    # ── Main entry point ───────────────────────────────────────────────────

    def scrape(self) -> dict:
        university_id = self.get_university_id("TU")
        if not university_id:
            self.logger.error("TU university_id not found — aborting")
            return self.summary()

        portal_stats: list[tuple[str, int]] = []

        for label, url, base_url, faculty_tag in TU_RESULT_PORTALS:
            self.logger.info(f"── Portal: {label}")
            try:
                soup = self.fetch_page(url)
                if not soup:
                    portal_stats.append((label, 0))
                    continue

                items = self.parse_results(soup, base_url)
                self.logger.info(f"   Found {len(items)} entries")
                before = self.inserted
                self.process_items(items, university_id, faculty_tag)
                new_count = self.inserted - before
                portal_stats.append((label, new_count))

            except Exception as e:
                self.logger.error(f"   Portal crashed: {e}")
                portal_stats.append((label, -1))

        self.logger.info("── Portal summary:")
        for label, count in portal_stats:
            status = f"{count} new" if count >= 0 else "FAILED"
            self.logger.info(f"   {status:>8}  {label}")

        return self.summary()


if __name__ == "__main__":
    scraper = TUResultsScraper()
    print(scraper.scrape())
