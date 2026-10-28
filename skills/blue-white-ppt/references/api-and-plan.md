# Drawing API and JSON plan

## Direct .mjs authoring

Import `scripts/api.mjs` using the actual skill directory. The starter `assets/templates/draw.mjs` accepts `--skill` or `BLUE_WHITE_PPT_SKILL`, and defaults to its bundled location. The scaffold copies it to the project and writes `skill-location.json`.

```js
import {createPresentation, addSlide, renderByCode, savePresentation}
  from '/path/to/blue-white-ppt/scripts/api.mjs';
const p = createPresentation({title:'A method and its evidence'});
const slide = addSlide(p, {number:'1', title:'Method overview',
  summary:'Explain the transformation, then show the evidence.'});
const a = renderByCode(slide, 'C15', [100,290,280,100],
  {label:'Input'}, 'method.input');
const b = renderByCode(slide, 'C15', [800,290,280,100],
  {label:'Output'}, 'method.output');
renderByCode(slide, 'C07', [380,340,420,1],
  {from:a.result, to:b.result, fromSide:'right', toSide:'left'}, 'method.edge');
await savePresentation(p, '/path/to/method.pptx');
```

On Windows use `await import(pathToFileURL(path.resolve(skillRoot,'scripts/api.mjs')).href)` rather than a bare drive-letter import. No npm packages or loader flags are needed.

## Public functions

| Function | Behavior |
|---|---|
| `createPresentation({title,brand})` | New 1280 × 720 deck. Brand is blank by default. |
| `addSlide(p,{number,title,summary,footer})` | Standard header and optional lead; footer label defaults to title. |
| `getComponent(codeOrId)` | Resolve `C05` or `arrow.block`; unknown values throw. |
| `renderByCode(slide,code,box,options,instanceId)` | Box `[x,y,w,h]` or `{x,y,w,h}`. Returns `{id,code,instanceId,objects,result}`. |
| `addText(slide,text,box,style)` | Native text; style includes `fontSize,color,bold,align,typeface,verticalAlignment,insets,wrap`. |
| `addTable(slide,{values,bounds,columnWidths,fontSize,headerRow})` | Native editable table. Values are a rectangular matrix. |
| `await addImage(slide,path,box,{name})` | Embed PNG/JPEG at original aspect ratio, centered inside the box. |
| `await savePresentation(p,path,{overwrite,footers})` | Export an independent snapshot with freshly computed page footers by default; the authoring model is unchanged. Existing file rejected unless overwrite is true. |
| `await buildFromPlan(plan,{baseDirectory})` | Returns `{presentation,manifest}`. Image paths resolve against baseDirectory. |

Also exports `C`, `FONT`, `STYLE`, `COMPONENTS` and `Presentation`. Obtain per-component options from the inspector. `result` varies: simple C15 returns a shape, complex components may return nodes, edges or regions. Inspect the renderer before accessing advanced values. `objects` always contains created shapes. Give each instance a unique ID within its slide. Components are grouped for selection; connectors reference native shape IDs and retain attachment when nodes move.

## JSON plan

```json
{
  "title":"Method overview",
  "slides":[{
    "number":"1", "title":"From input to result",
    "summary":"A short statement explains this slide.",
    "notes":"Optional presenter notes.",
    "elements":[
      {"code":"C15","key":"input","box":[100,290,280,100],"options":{"label":"Input"}},
      {"code":"C15","key":"output","box":[800,290,280,100],"options":{"label":"Result"}},
      {"code":"C07","box":[380,340,420,1],"from":"input","to":"output","options":{"fromSide":"right","toSide":"left"}},
      {"type":"text","text":"Evidence and interpretation","box":[100,490,1000,80],"style":{"fontSize":24}}
    ]
  }]
}
```

Elements draw in array order, back to front, including tables, images and shapes. Create endpoint nodes before connectors. Keys are unique per component instance within a slide; dotted keys such as `a` and `a.b` are separate instances and can coexist. Simple `from`/`to` strings choose the primary body or first node. Internal paths such as `{"ref":"diagram.result.nodesByKey.a"}` work only if that component returns the named structure. Numeric array indexes also work. Missing references throw rather than silently creating detached edges.

Repeated saves recalculate all page totals, so adding or removing slides between saves is supported. `footers:false` omits the reserved `footer.*` objects from that export only. XML 1.0 forbidden characters in labels or notes are rejected with a Unicode code-point error before a PPTX is written; clean external text explicitly rather than relying on silent character replacement.

Additional elements:

```json
{"type":"table","box":[70,240,1100,230],"values":[["Option","Effect"],["A","Example"]],"columnWidths":[300,800],"fontSize":22}
{"type":"image","path":"figures/measurement.png","box":[70,240,650,370]}
```

Layout is explicit. Mix text, tables, images and any Cxx component. Top-level `brand` is optional; `footers:false` disables standard footers. For computed placement use `.mjs` sources instead of executable text in JSON.

## Advanced shapes and limits

Use `slide.shapes.add({name,geometry,position,fill,line})` for a missing small primitive. Position uses `{left,top,width,height,rotation}`. Supported geometry includes Office presets and custom Bezier paths used by the bundled renderers. Assign `shape.text='Label'` and `shape.text.style={typeface:FONT,fontSize:22,color:C.ink,...}`. Existing renderers show precise path, gradient and attached-connector syntax.

The backend is scoped to this library and new slide authoring. It is not a general PowerPoint importer, arbitrary OOXML preservation engine, charting library, equation typesetter or animation engine. Use supplied figure assets or dedicated authoring tools when those features are required.
