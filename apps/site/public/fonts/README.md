# Fonts

The three typefaces both Sneakers-PAM sites use, self-hosted so the website
and the docs load the same files the same way. Each is the Latin and Latin
Extended subset as Google Fonts serves it, in WOFF2.

| Files | Typeface | License |
| --- | --- | --- |
| `bricolage-grotesque-*.woff2` | Bricolage Grotesque (variable, weights 500 to 800) | SIL Open Font License 1.1, `OFL-bricolage-grotesque.txt` |
| `atkinson-hyperlegible-*.woff2` | Atkinson Hyperlegible (400, 700, 400 italic) | SIL Open Font License 1.1, `OFL-atkinson-hyperlegible.txt` |
| `jetbrains-mono-*.woff2` | JetBrains Mono (variable, weights 400 to 700) | SIL Open Font License 1.1, `OFL-jetbrains-mono.txt` |

The `@font-face` rules are in `site-frame.css`, which the website and the docs
share byte for byte. Keep this folder the same on both sites.
