# Optional examples and capability limits

The installed skill supports native shapes, text, tables, PNG/JPEG pictures, attached connectors, groups and editable PPTX export. It retains C01–C39 and 244 variants.

General equation input, data-chart compilation, click-step input and a general Morph recipe compiler are not public authoring APIs. Do not pass experimental fields to `create-deck.mjs` or claim that the installed generator implements them.

## Retrieve examples only when needed

The [source repository](https://github.com/pandacremosachan/blue-white-ppt) contains the larger examples and reference decks below. They are outside the installed skill. For a task that needs their code, obtain a source checkout in the user's project and run its example entrypoint. Core PPT generation remains offline and self-contained. If the repository is unavailable, explain that the optional example has not been retrieved.

| Material | Repository location | Scope |
|---|---|---|
| Trapezoid compositions | [source](https://github.com/pandacremosachan/blue-white-ppt/tree/main/assets/examples/trapezoid), [PPTX](https://github.com/pandacremosachan/blue-white-ppt/blob/main/assets/showcases/trapezoid-creativity.pptx) | 32 compositions in 13 pages, including one paired Morph state |
| Morph examples | [source](https://github.com/pandacremosachan/blue-white-ppt/tree/main/assets/examples/morph), [PPTX](https://github.com/pandacremosachan/blue-white-ppt/blob/main/assets/showcases/morph-effects.pptx) | Ten effect families in 14 pages with six transitions |
| Content and playback | [PPTX](https://github.com/pandacremosachan/blue-white-ppt/blob/main/assets/showcases/content-and-playback.pptx) | Six pages containing native Office Math, a chart, click sequences and internal links |

From the source checkout:

```sh
node assets/examples/trapezoid/build-deck.mjs --output /path/to/new/trapezoid.pptx
node assets/examples/morph/build-compact.mjs --output /path/to/new/morph.pptx
```

Keep outputs outside the source and retain any modified example code with the delivered PPTX. The example-local Morph serializers are specialized implementations. They do not extend the installed JSON API.

## Review advanced behavior

Inspect the exact generated file in the target player. Structural validation and static rendering do not establish formula editing, chart-data editing or live-click behavior. For Morph, preserve stable object identities and readable stopping states. Word and character matching may cross during motion; exact trajectories can require separate objects or intermediate states.

Use the [style guide](style-and-layout.md) for the common frame, typography and chapter/page distinction. A comparison gallery normally groups related cases together, while a formal talk follows its argument and audience.

## Chapter mapping in the repository references

| Showcase | Physical pages | Header chapter number |
|---|---|---|
| Trapezoid | 1 | 1 |
| Trapezoid | 2–9 | 2.1–2.8 respectively |
| Trapezoid | 10–11 | 3 on both states |
| Trapezoid | 12–13 | 4.1, 4.2 |
| Morph | 1 | 1 |
| Morph | 2–3, 4–5, 6–7, 8–9 | 2.1, 2.2, 2.3, 2.4 respectively; both states share the number |
| Morph | 10–11, 12–13 | 3.1, 3.2 respectively; both states share the number |
| Morph | 14 | 4 |
| Content and playback | 1–6 | 1, 2.1, 2.2, 3, 4, 5 |
