# Language Forge Phase 1 — e1 / d1

This private pure module is not wired to any public entry point. No route, UI,
storage, network, sentence renderer, share codec or import/export is included.
All inventories, weights, rules, labels and implementation are first-party.

## Recipe and version contract

`generateLanguage({ engineVersion: 'e1', datasetVersion: 'd1', seed,
config: { preset, wordLength, grammar?, rules? }, edits? })` returns the resolved
recipe and `language` with canonical/display name, phonology summary and the
ordered `{ semanticId, word }` lexicon. Callers must pass both versions. Unknown
versions reject. Presets and length profiles are explicit enums. Rules are fully
resolved into the returned recipe; supplied rules must match the frozen preset.
Presentation fields are ignored, never consumed as random input.

After publication, any change that alters outputs requires a new engine or
dataset version and separately retained replay implementation/fixtures. Do not
regenerate the current golden file just to make a changed algorithm pass.

Grammar is resolved to explicit SVO/SOV/VSO, before/after and particle/suffix
choices, with preset recommendations. It does not affect Phase 1 roots or name.
`edits: { version: 1, patches: [] }` reserves a future patch envelope. Nonempty
patches currently reject; they are never silently discarded. Verb records can
gain explicit valency data in a future dataset version. No grammar markers are
allocated now; `allocateLexicon` and name generation accept reserved roots for
future orchestration. Future edits/rerolls must define downstream collision
semantics before publication.

## Randomness ABI

Seed is exactly 32 ASCII hexadecimal characters (128 bits). Uppercase input is
accepted and normalized to lowercase; spaces, separators and non-hex reject.
The all-zero seed is valid. Four big-endian 8-character words enter a fixed
four-lane, non-cryptographic seed expansion. Length-framed engine/dataset/domain
strings prevent ambiguous concatenation. Multiplication uses `Math.imul`, with
explicit unsigned 32-bit shifts. Nonzero state guard avoids the RNG absorbing
state. This is not cryptography or a security token.

Each namespace owns a first-party xorshift128 stream. Domains include
`concept:<semanticId>`, `language-name`, `grammar`, and future
`reroll:<semanticId>:<counter>`. Grammar/reroll streams have no consumer yet.
There is no shared global stream. All selection weights are positive integers;
bounded rejection removes modulo bias. A hostile stream is stopped after 1024
rejected draws rather than looping forever.

## Phonology and allocation

Segment records separate stable ID, ASCII grapheme, class, onset/coda eligibility
and weight. Templates, onset-cluster allowlist, forbidden sequences, stress and
length weights are explicit. Flowing permits initial V and CV, Rhythmic only CV,
Crisp and Clustered CV/CVC/CCV/CCVC with their approved weights. Coda inventories
are authored here; no real-world phoneme frequency data is imported.

Short uses 1–2 syllables, balanced 2–3, long 3–4; preset integer biases select
within those ranges. A name uses balanced and at most 12 ASCII characters.
Stress is metadata, never an audio or IPA claim.

Generation chooses count, template and segments, then validates the whole word.
Three consecutive consonants, identical adjacent phonemes, identical adjacent
syllables, unsupported onsets/codas and configured forbidden sequences reject.
V can occur only initially. The cluster allowlist governs two-consonant
**onsets**; legal coda + single onset across a syllable boundary is separately
permitted, while coda + complex onset is rejected by the three-consonant guard.
The reusable validator searches deterministic template order and returns a
valid syllable parse or a reason. Its strict/advisory UI policy is not defined
here. Repeated generated syllables reject even if an alternative parse exists.

Each word/name slot has one shared budget of 64 candidates for validation,
length and collision rejection together. Exhaustion throws `GenerationError`
with code `WORD_EXHAUSTED`, slot ID and attempts. Rules never relax. Comparison
is ASCII lowercase; non-ASCII roots reject. d1 array order allocates all 64
concepts, preserving earlier roots. Collision draws advance only the current
concept stream. Changing an earlier root in a future edit may affect a later
collision; namespace isolation does not promise collision-independent allocation.

Names use the same phonology with an independent namespace and reject all
dictionary/reserved roots. Display casing uppercases only the first ASCII letter.
No external taboo list or global safety guarantee is provided. Short display ID
is optional and deferred to avoid an unused contract surface.

## Verification and later phases

`node --test tests/language-forge.test.mjs` checks contracts, all presets/lengths,
144 complete dictionaries, an independent BigInt RNG oracle, seed edge cases,
collision/rejection budgets, namespace isolation, locale processes and four
static whole-lexicon goldens. The golden cases deliberately cover zero-like and
all-one bit patterns. No browser UI integration is present in Phase 1.

Desktop <50 ms and midrange mobile <200 ms remain performance budgets. Local
Node measurements are not physical mobile measurements. Phase 2 must resolve
editing, reserved grammar marker allocation, safety UX, grammar/valency and
serialization before adding UI, persistence or sharing. Every phase still needs
explicit scope authorization.
