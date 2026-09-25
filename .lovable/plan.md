# Arthashastra Cipher Workbench

## What I’ll build
- Replace the blank homepage with a desktop-first, responsive cryptography workbench inspired by the supplied dark dashboard reference.
- Keep all encryption, decryption, analysis, and tests in the browser—no account, database, or server setup.
- Create an Arthashastra-inspired symmetric cipher with a clear formal rule set, deterministic key stream, reversible transform, and educational mapping to modern CS concepts.
- Add usable controls for plaintext/ciphertext, key and seed, encrypt/decrypt, swap, clear, copy, sample loading, and downloadable results.
- Include a live transformation trace, character distribution chart, key-strength/readiness indicators, and a ten-case automated test suite with visible pass/fail details.
- Add dedicated panels for concept mapping, pseudocode, complexity, correctness, limitations, and conclusion so the implementation fulfills the assignment checklist.

## Visual direction
- High-contrast black console with acid-lime and saffron accents, condensed display typography, precise grid lines, and restrained micro-motion.
- Use the uploaded dashboard only as visual reference; do not embed it.
- Prioritize dense, scannable information, strong hierarchy, and responsive layouts without generic marketing sections.

## Technical details
- Implement the cipher and tests as pure TypeScript utilities alongside the page.
- Use the existing TanStack route, semantic color tokens, and accessible native controls.
- Add page-specific metadata and validate the central encrypt/decrypt/test flows in the live preview at desktop and mobile widths.
