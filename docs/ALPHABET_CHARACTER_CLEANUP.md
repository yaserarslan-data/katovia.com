# Alphabet Lab Character-Only Cleanup

Alphabet Lab now uses a first-party static inventory of 194 character and symbol records across six existing profiles. The public interface shows the writing-system selector, character grid, short label, search, profile state, and accessible no-JS tables.

The former compiled Unicode dataset, source and provenance metadata, fingerprint generation, source download/cache build, and Alphabet-specific release report were removed. No external font, image, PDF, audio, API, or runtime dependency was added. The current source and generated site contain no Alphabet-specific source links, SHA/fingerprint fields, license panel, or imported source document.

The repository's unrelated notices, legacy artifacts, CNAME, app-ads.txt, and other tools remain outside this cleanup. Historical rollback commits retain the former dataset together with its notice so that rollback remains legally coherent; they are not part of the current product bundle.

## Current inventory

| Profile | Records |
| --- | ---: |
| Modern Greek | 24 |
| Russian Cyrillic | 33 |
| Hiragana | 46 |
| International Morse | 36 |
| Turkish Braille | 29 |
| English Braille | 26 |
| **Total** | **194** |

