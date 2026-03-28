#!/usr/bin/env python3
"""Fetch pwn.college profile and write resume/pwn-data.json."""

import json
import urllib.request
from html.parser import HTMLParser
from datetime import datetime, timezone

URL = "https://pwn.college/hacker/zach15james"
OUT = "resume/pwn-data.json"


class PwnParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.dojos = []
        self._cur_dojo = None
        self._cur_mod = None
        self._in_dojo_link = False
        self._in_dojo_h2 = False
        self._in_dojo_h4 = False
        self._in_mod_header = False
        self._in_mod_h4 = False
        self._in_mod_stats = False
        self._in_td = False
        self._td_buf = ""
        self._tag_stack = []

    # ---- helpers ----
    def _has_class(self, attrs, *names):
        classes = dict(attrs).get("class", "")
        return any(n in classes.split() for n in names)

    # ---- handlers ----
    def handle_starttag(self, tag, attrs):
        self._tag_stack.append(tag)
        d = dict(attrs)

        # Dojo link: <a class="text-decoration-none" href="...">
        if tag == "a" and "text-decoration-none" in d.get("class", ""):
            href = d.get("href", "")
            url = href if href.startswith("http") else "https://pwn.college" + href
            self._cur_dojo = {"name": "", "url": url, "solves": "", "rank": "", "modules": []}
            self._in_dojo_link = True
            self._in_dojo_h2 = False
            self._in_dojo_h4 = False

        if self._in_dojo_link:
            if tag == "h2":
                self._in_dojo_h2 = True
            if tag == "h4":
                self._in_dojo_h4 = True

        # Module accordion header
        if tag == "div" and "accordion-item-header" in d.get("class", ""):
            if self._cur_dojo is not None:
                self._cur_mod = {"name": "", "solves": "", "rank": ""}
                self._in_mod_header = True

        if self._in_mod_header:
            if tag == "h4" and "accordion-item-name" in d.get("class", ""):
                self._in_mod_h4 = True
            if tag == "span" and "challenge-header-right" in d.get("class", ""):
                self._in_mod_stats = True

        if (self._in_dojo_h4 or self._in_mod_stats) and tag == "td":
            self._in_td = True
            self._td_buf = ""

    def handle_endtag(self, tag):
        if self._tag_stack:
            self._tag_stack.pop()

        if tag == "a" and self._in_dojo_link:
            if self._cur_dojo and self._cur_dojo["name"]:
                self.dojos.append(self._cur_dojo)
            self._in_dojo_link = False
            self._in_dojo_h2 = False
            self._in_dojo_h4 = False

        if tag == "h2" and self._in_dojo_link:
            self._in_dojo_h2 = False
        if tag == "h4" and self._in_dojo_link:
            self._in_dojo_h4 = False

        if tag == "h4" and self._in_mod_h4:
            self._in_mod_h4 = False
        if tag == "span" and self._in_mod_stats:
            self._in_mod_stats = False
            if self._cur_mod and self._cur_dojo:
                self._cur_dojo["modules"].append(self._cur_mod)
                self._cur_mod = None
            self._in_mod_header = False

        if tag == "td" and self._in_td:
            self._in_td = False
            val = self._td_buf.strip()
            if self._in_dojo_h4 and self._cur_dojo:
                if not self._cur_dojo["solves"]:
                    self._cur_dojo["solves"] = val
                else:
                    self._cur_dojo["rank"] = val
            elif self._in_mod_stats and self._cur_mod:
                if not self._cur_mod["solves"]:
                    self._cur_mod["solves"] = val
                else:
                    self._cur_mod["rank"] = val

    def handle_data(self, data):
        if self._in_dojo_h2 and self._cur_dojo:
            self._cur_dojo["name"] += data
        if self._in_mod_h4 and self._cur_mod:
            self._cur_mod["name"] += data
        if self._in_td:
            self._td_buf += data


def main():
    req = urllib.request.Request(URL, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req) as r:
        html = r.read().decode("utf-8")

    parser = PwnParser()
    parser.feed(html)

    # Clean up names
    for d in parser.dojos:
        d["name"] = d["name"].strip()
        for m in d["modules"]:
            m["name"] = m["name"].strip()

    data = {
        "updated": datetime.now(timezone.utc).isoformat(),
        "profile": URL,
        "dojos": parser.dojos,
    }

    with open(OUT, "w") as f:
        json.dump(data, f, indent=2)

    print(f"Wrote {len(parser.dojos)} dojos to {OUT}")
    for d in parser.dojos:
        print(f"  {d['name']}  ({len(d['modules'])} modules)")


if __name__ == "__main__":
    main()
