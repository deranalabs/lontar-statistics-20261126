[![make.fun · best-national-statistics-site-20261126-0539](https://make.fun/badge/best-national-statistics-site-20261126-0539.svg)](https://make.fun/bounty/best-national-statistics-site-20261126-0539?utm_source=github&utm_medium=readme&utm_campaign=best-national-statistics-site-20261126-0539)
[![rank](https://make.fun/badge/best-national-statistics-site-20261126-0539/deranalabs/lontar-statistics-20261126/rank.svg)](https://make.fun/bounty/best-national-statistics-site-20261126-0539/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-national-statistics-site-20261126-0539)
[![reward](https://make.fun/badge/best-national-statistics-site-20261126-0539/deranalabs/lontar-statistics-20261126/reward.svg)](https://make.fun/bounty/best-national-statistics-site-20261126-0539?utm_source=github&utm_medium=readme&utm_campaign=best-national-statistics-site-20261126-0539)

# Lontar · Indonesia in figures

Lontar is a national statistics site for Indonesia: all 38 provinces (tile map, ranking table, a page each, province compare), over a hundred national indicators in nine topics, ASEAN and G20 rankings, five computed findings, and a page per indicator with chart, table, CSV and citation.
It is static files under `app/` (ES modules, CSS and hand-drawn SVG charts), with no build step and no network request; run `node serve.ts` and open http://localhost:8080. Each page and each topic's data load on demand with `import()`.

Data:
- National series: World Bank, World Development Indicators (api.worldbank.org/v2) for Indonesia, the ASEAN members and the G20, retrieved 27 November 2026, CC BY 4.0. Every stored value was compared with the downloaded file (0 differences).
- Provinces: Statistics Indonesia (BPS) figures as tabulated on three English Wikipedia pages (CC BY-SA 4.0), retrieved 27 November 2026; revision ids are on the Sources page. Nothing is estimated.

Code: MIT, see LICENSE. Province data file: CC BY-SA 4.0 (`app/data/provinces.js`).
