# Grammar extension g1 — Phase 2

## Versions and entry points

`generateLanguagePackage({ ...e1Recipe, grammarVersion: 'g1' })` is an additive
entry point. It returns the unchanged Phase 1 base package plus `grammarVersion`
and `grammar`. Unknown or missing grammar versions reject, with no latest
fallback. `generateLanguage` remains unchanged. Existing d1 concept data and
all four e1/d1 golden files are unchanged. Grammar output changes after g1 is
published require a new grammar version with its own retained replay code.

Valency/person metadata is a first-party g1 overlay keyed by existing d1 IDs;
there is no second pronoun lexicon or changed lexical allocation order. Go,
come and speak use controlled intransitive senses. Remaining verbs use a
transitive sense. Give allows a theme object only; recipient/ditransitive
semantics are not implemented. This is a creative miniature grammar, not a
claim about necessary relationships between phonology and syntax.

## Grammar allocation and morphology

Config remains SVO/SOV/VSO × before/after × particle/suffix. Config does not
alter base lexical roots or names. Markers allocate only after the base
dictionary/name, in this stable order: plural, past, future, negation,
question, possession, copula, above. Each owns a `grammar:g1:grammar.<id>`
stream; the linker owns `grammar:g1:linking-vowel`. Both namespaces incorporate
the full root seed and e1/d1 versions through the existing stream factory.

Markers use short (1–2 syllable) candidates and the active phonology. Exact
collisions with lexical roots, name and allocated markers reject. Each slot
has at most 64 candidate attempts including phonology, collisions and suffix
compatibility together; there is no nested 64 × 64 retry. Exhaustion throws
`GRAMMAR_MARKER_EXHAUSTED` with marker ID and attempt count.

Particle plural appears immediately before its noun, and particle past/future
immediately before its verb. Suffix plural attaches to the noun, and tense
attaches to the verb. Present is unmarked. Every suffix candidate is tested
against all existing noun roots (plural) or verb roots (tense) before acceptance,
not just the examples. Thus strategy can change selected markers, but word
order and adjective position cannot. This does not shift any lexical stream.

One deterministic weighted vowel is chosen from the language inventory. For
each suffix combination try exactly (1) root + marker, (2) root + linker +
marker. Use the second only if the first is phonologically invalid or collides
with a reserved form. Both root and marker remain unchanged. If neither passes
the same `validateWord`, reject that marker candidate at allocation time. Later
direct realization throws `MORPHOLOGY_INVALID`; there is no relaxation. Literal
root/marker/linker pieces survive in token analysis even when syllabification
across the boundary changes.

Derived forms cannot equal any lexical root, name or grammar marker. Previously
allocated derived forms are also reserved for later marker allocation. Global
derived-versus-derived uniqueness within one inflection family is not claimed;
g1 does not implement a general anti-homophony system.

## AST, realization and explanation

The 12 controlled frames are frozen semantic ASTs, independent of translations.
Nominals reference existing noun/pronoun IDs, number and adjective IDs.
Possession wraps a possessor and possessed nominal. Predicates are either verbs
(tense, negated) or a present copula with a quality/above complement. Pronouns
use their existing lexical person/number; plural pronouns receive no noun plural
marker. No agreement, gender, cases, demonstratives or unrestricted relation
system is introduced.

Realization orders whole constituent blocks, preserving internal structure:

| Config | Blocks |
| --- | --- |
| SVO | subject, verbal block, object/complement |
| SOV | subject, object/complement, verbal block |
| VSO | verbal block, subject, object/complement |

Adjectives precede/follow the inflected noun within the nominal block. Negation
is always a particle before the entire verbal block (including tense).
Questions append a sentence-final particle; canonical surface has no question
punctuation. Possession is possessor + possession marker + possessed nominal.
Copula occupies the verbal block; above + nominal occupies the complement.
Their placement therefore follows the selected constituent order.

Output has space-joined `surface`, machine-readable `tokens`, and semantic
`explanation` facts. Tokens retain constituent role, meaning ID and root/marker/
linker analysis. Joining token surfaces reconstructs the sentence; joining
analysis surfaces reconstructs each token. Explanation facts include order,
adjective placement, person/number, tense, inflections, negation, question,
possession, copula and relation. TR/EN meaning strings and explanation labels
live in data/presentation only, never in generation or token ordering.

Malformed semantic AST/valency yields `SENTENCE_REALIZATION_FAILED`. Config,
seed and core version errors still use the established Phase 1 validation.

## Future patches and verification

`validateFinalLexicon(base)` and `generateGrammar(base, 'g1')` provide a pure
revalidation seam: generate base → future patch adapter → validate ordered
final lexicon → allocate markers/derive forms → realize examples. Patch UI,
patch application, reroll, persistence and share codecs remain unimplemented.
After edits, markers may deterministically reallocate to avoid new collisions;
other roots are never regenerated by this seam.

The original lexical fixture remains intact. A separate e1/d1/g1 fixture extends
all four recipes with marker values, config, linking vowel, all 12 surfaces,
semantic explanation facts and complete token/morphology analysis. Tests cover
all four presets × 12 grammar combinations (576 example realizations), explicit
linker/collision/error cases, valency, locale-only presentation and future final
lexicon validation. Phase 1 output equality is checked in full.

No public UI, route, CREATE card, storage, external resource, dependency,
sentence punctuation presentation, SEO integration or deployment is included.
Phase 3 still needs UI decisions for controlled errors, homophony, patch-induced
marker changes and presenting compositional rather than natural-language
translation claims.
