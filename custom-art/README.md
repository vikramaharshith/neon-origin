# Your character artwork

Put your own transparent PNG sprite sheets in this folder. The game loads entries from `manifest.json`; built-in art remains the fallback until a matching entry is ready. The reference JPGs are in `/characters` and are not used as playable sprites.

## Sheet layout

- **1024 × 512 pixels**, transparent background; 8 columns × 4 rows.
- Each frame is **128 × 128 pixels**. Keep the head, wings, tail and weapon inside the frame.
- Rows: **front/down**, **left**, **right**, **back/up**, in that order.
- Columns: **0 = idle / passing pose**, then **1–7 = walking cycle**. Frame 4 is the opposite passing pose. The game cycles 0–7 while walking.
- Feet stay at **y = 120**, centered at **x = 64**, in every frame. Keep the whole body the same scale in all directions.
- Use hard-edged pixels with no blur, smoothing or background. Follow your supplied reference for clothing, proportions, muscles and feminine/masculine body shape.
- `template.svg` shows the exact grid and foot anchors. It is a guide only: remove every grid line, label and guide before exporting a PNG.

## Filenames and registration

Suggested files: `human/male-swept-tactical.png`, `human/female-long-tactical.png`, `angel/female-armor.png`. Create subfolders as needed.

Copy an entry from `manifest.example.json` into `manifest.json`, changing the filename and choices. The example file is documentation only; it is never loaded.

An entry matches **species, gender, hairstyle, outfit type, and optional helmet setting**. Make another sheet/entry for each additional hairstyle or clothing silhouette you draw. If that combination has no custom sheet, the game uses its editable built-in character. All normal save files keep the selections.

## Editable colors

Keep hair, eyes, and clothing in distinct color palettes. In `palette`, list each exact original color plus its brightness `offset` from the player's chosen color. Offset 0 is the base; negative offsets are shadows; positive offsets are highlights. Alpha is preserved. Skin, metal, and accessories keep their original colors unless you deliberately list them.

Without palette entries your artwork keeps its painted colors. Do not reuse a listed palette color on unrelated regions. Hairstyle and clothing shape changes require another sheet; palette recoloring cannot invent a new hairstyle.

## Species IDs

0 Human; 1 Vampire; 2 Cyborg; 3 Elf; 4 Demon; 5 Angel; 6 Dwarf; 7 Orc; 8 Werewolf; 9 Gorynych; 10 Gnome; 11 Fairy; 12 Dragonkin; 13 Ghost/Wraith; 14 Succubus/Incubus; 15 Merfolk; 16 Siren; 17 Centaur; 18 Minotaur; 19 Gargoyle; 20 Sphinx; 21 Lich; 22 Phoenix; 23 Wendigo; 24 Dryad; 25 Kitsune; 26 Cyclops; 27 Satyr; 28 Valkyrie; 29 Gorgon.

Gender keys: `M` and `F`. Hairstyle keys: `short`, `long`, `swept`, `none`, `braids`. Outfit keys: `tactical`, `coat`, `armor`, `tunic`, `dress`.
