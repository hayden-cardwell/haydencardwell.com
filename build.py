"""Build the static website using Python's standard library only."""
from datetime import date
from html import escape
import json
from pathlib import Path
import re
import shutil

ROOT = Path(__file__).resolve().parent
PUBLIC = ROOT / "public"
TEMPLATES = ROOT / "templates"
DESCRIPTION = "Cloud & Endpoint Security. Hayden Cardwell's personal website, resume, certifications, and writing."


def template(name, **values):
    text = (TEMPLATES / name).read_text(encoding="utf-8")
    return re.sub(r"\{\{([A-Z_]+)\}\}", lambda match: values[match[1]], text)


def page(title, path, main, description=DESCRIPTION, article=False):
    return template(
        "base.html", TITLE=escape(title), DESCRIPTION=escape(description, quote=True),
        PATH=escape(path, quote=True), MAIN=main,
        TYPE="article" if article else "website",
    )


def formatted_date(value):
    parsed = date.fromisoformat(value)
    return f"{parsed.strftime('%B')} {parsed.day}, {parsed.year}"


def post_list(posts):
    if not posts:
        return '<p class="empty-state">No posts yet.</p>'
    entries = []
    for post in posts:
        entries.append(
            f'<li><a href="/writing/{post["slug"]}.html">'
            f'<span class="post-list-title">{escape(post["title"])}</span>'
            f'<time datetime="{post["date"]}">{formatted_date(post["date"])}</time></a></li>'
        )
    return '<ul class="post-list">' + "".join(entries) + "</ul>"


def build():
    records = json.loads((ROOT / "content/posts.json").read_text(encoding="utf-8"))
    if not isinstance(records, list):
        raise ValueError("content/posts.json must contain a list")
    posts = []
    seen = set()
    for record in records:
        slug = record["slug"]
        if not re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*", slug) or slug in seen:
            raise ValueError(f"Invalid or duplicate post slug: {slug}")
        seen.add(slug)
        if not record["title"].strip():
            raise ValueError(f"Post needs a title: {slug}")
        formatted_date(record["date"])
        body = (ROOT / "content/posts" / f"{slug}.html").read_text(encoding="utf-8")
        if not body.strip():
            raise ValueError(f"Post needs a body: {slug}")
        posts.append({**record, "body": body})
    posts.sort(key=lambda post: post["date"], reverse=True)
    # Replace generated pages only; documents and article sources remain intact.
    writing = PUBLIC / "writing"
    if writing.exists():
        shutil.rmtree(writing)
    writing.mkdir(parents=True)
    (PUBLIC / "index.html").write_text(
        page("Hayden Cardwell", "/", template("home.html", POSTS=post_list(posts[:2]))), encoding="utf-8"
    )
    (PUBLIC / "writing.html").write_text(
        page("Writing — Hayden Cardwell", "/writing.html", template("writing.html", POSTS=post_list(posts))), encoding="utf-8"
    )
    for post in posts:
        main = template(
            "post.html", DATE_ISO=post["date"], DATE=formatted_date(post["date"]),
            POST_TITLE=escape(post["title"]), BODY=post["body"],
        )
        (writing / (post["slug"] + ".html")).write_text(
            page(post["title"] + " — Hayden Cardwell", f'/writing/{post["slug"]}.html', main,
                 description=post.get("description", DESCRIPTION), article=True), encoding="utf-8"
        )
    (PUBLIC / "robots.txt").write_text("User-agent: *\nAllow: /\nSitemap: https://haydencardwell.com/sitemap.xml\n", encoding="utf-8")
    paths = ["/", "/writing.html"] + [f'/writing/{post["slug"]}.html' for post in posts]
    sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    sitemap += "".join(f"  <url><loc>https://haydencardwell.com{path}</loc></url>\n" for path in paths)
    sitemap += "</urlset>\n"
    (PUBLIC / "sitemap.xml").write_text(sitemap, encoding="utf-8")
    print(f"Built homepage, writing index, and {len(posts)} posts in {PUBLIC}")


if __name__ == "__main__":
    build()
