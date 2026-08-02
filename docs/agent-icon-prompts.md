# Agent 图标生成提示词（给 GPT / 图像模型）

配套代码：`src/constants/agentAssets.ts`  
落盘目录：`assets/agents/{id}.png`  
使用场景：**相机「选择镜头」圆形按钮**（也用于首页视角圆、详情头像）

参考风格：Chance 式 —— **柔和彩色圆盘底 + 中间 3D 粘土物体**（物体用自然色，圆底单独一色）。

你已有的翻译师参考图：三折菜单 + 双语气泡是对的；缺的是**背后那一整块圆形底色**，请按下方补上。

## 配色原则

| 层级 | 规则 |
|------|------|
| **圆底 `circleBg`** | 柔和马卡龙色，铺满圆形（Chance 圆钮感觉） |
| **物体** | 自然真实色（肤色手、瓷盘、纸菜单…） |
| **洞察页主题色** | 不要用来染物体（手不要紫） |

---

## 统一风格（每次生成都先贴这段）

```text
App icon for Vision Agent camera mode picker, Chance-app style.
Composition (must follow):
1) A flat soft-matte CIRCULAR colored disc fills most of the square canvas (edge-to-edge circle, ~5% outer transparent margin only).
2) A premium soft 3D / claymorphism object sits centered ON TOP of that circle, with a soft contact shadow on the disc.
Style: rounded friendly forms, soft studio lighting, high clarity at 58–72px.
Canvas: square 1:1 PNG. Outside the circle = transparent. Inside the circle = solid soft pastel fill (see circle color below).
Constraints: NO text, NO letters, NO watermarks, NO photoreal full humans, NO checkerboard visible, NO square card background — the background shape MUST be a circle.
Color rule: object uses NATURAL real-world colors; do NOT dye the object the same as the circle. The circle color is background only.
Output: single icon, Chance-like circular button look.
```

中文简述：

> Chance 风格：先画**一整块柔和彩色圆盘**作底，再在圆上放 3D 粘土物体；圆外透明。  
> 物体用自然色，**不要把物体染成圆底色**（手保持肤色）。

---

## 逐个 Agent 提示词

生成时：**统一风格块 + 对应条目**（含 `circleBg`）。

### 1. `auto.png` — 自动 · circleBg `#E8EEF5`

```text
Circular disc color: soft cool gray-blue #E8EEF5 filling the circle.
Motif on disc: a soft glowing multi-facet crystal prism or spark burst with three tiny beams (smart auto-routing). Object colors: silver-white + soft sky highlights. Do not purple-tint the crystal.
File hint: auto.png
```

### 2. `food_scan.png` — 食识拍 · circleBg `#FFE8DE`

```text
Circular disc color: soft peach #FFE8DE filling the circle.
Motif on disc: white ceramic dinner plate + small metal magnifying glass on the rim; optional tiny natural food morsel. Object stays dishware-white / metal — not coral-washed.
File hint: food_scan.png
```

### 3. `palm_reader.png` — 看手相师 · circleBg `#EDE6F2`

```text
Circular disc color: soft lilac mist #EDE6F2 filling the circle ONLY (background).
Motif on disc: open human palm in NATURAL warm skin tone (beige / light brown). Crease lines soft gold or soft gray. CRITICAL: the hand itself must NOT be purple — only the circular background is lilac.
File hint: palm_reader.png
```

### 4. `food_explorer.png` — 零食分析 · circleBg `#FFF0D6`

```text
Circular disc color: soft butter yellow #FFF0D6 filling the circle.
Motif on disc: a standing overseas supermarket snack BAG / pouch (think chips, crisps, or candy bag — foil or matte retail packaging), slightly crinkled, upright 3/4 view, like something you'd grab in a US/EU convenience store. Abstract brand panel + colorful flavor stripes only — NO readable brand names, NO real logos, NO letters. Optional tiny chip or candy piece peeking near the bag base. Natural retail packaging colors (red/yellow/blue accents on cream or silver foil). Not popcorn kernels as the main subject; not a Chinese snack box; not a plate of food.
File hint: food_explorer.png
```

### 5. `menu_translator.png` — 翻译师 · circleBg `#D9F3EF`

```text
Circular disc color: soft mint teal #D9F3EF filling the circle.
Motif on disc: standing tri-fold cream menu with abstract dark gray text bars (NO readable letters), tiny teal corner accent on the menu, two soft speech bubbles behind/beside. Same clay style as the reference menu icon — but ADD the mint circular disc behind it (no checkerboard).
File hint: menu_translator.png
```

### 6. `stylist.png` — 穿搭检查师 · circleBg `#FCE4EC`

```text
Circular disc color: soft blush pink #FCE4EC filling the circle.
Motif on disc: silver hanger + shirt/dress in navy, cream, or camel. Garment is NOT all-pink; pink is only the circular background.
File hint: stylist.png
```

### 7. `local_guide.png` — 本地向导 · circleBg `#DFF5E8`

> 与 `sight_route` 强区分：**禁止折地图 / 路线虚线 / 多站点图钉**。本图标讲「这是哪儿」的地标故事，不是「怎么走」。

```text
Circular disc color: soft mint green #DFF5E8 filling the circle.
Motif on disc (storytelling landmark — NOT a map): a soft 3D clay historic landmark as the hero — e.g. stone clock tower, temple gate, or classic monument plinth (warm stone / cream / soft terracotta accents). Beside it: ONE small speech bubble OR open pocket guidebook with abstract gray text bars (NO letters). Optional tiny warm lamp glow. Natural stone/paper colors on the mint disc.
CRITICAL differentiators vs sight_route: NO folded tourist map, NO dashed route line, NO multi-color waypoint pins, NO trail arrows. One place + storytelling cue only.
File hint: local_guide.png
```

### 8. `general_curiosity.png` — 好奇心 · circleBg `#E6E0FF`

```text
Circular disc color: soft lavender #E6E0FF filling the circle.
Motif on disc: silver/gunmetal magnifying glass with a warm golden spark inside the lens. Metal stays metal — do not purple-dye the glass; purple is background only.
File hint: general_curiosity.png
```

### 9. `art_critic.png` — 艺术解读（备用）· circleBg `#EDE4FF`

```text
Circular disc color: soft violet mist #EDE4FF. Motif: wooden frame + cream canvas + restrained colorful strokes.
File hint: art_critic.png
```

### 10. `design_critic.png` — 设计灵感（备用）· circleBg `#E8ECF0`

```text
Circular disc color: soft slate #E8ECF0. Motif: wooden/silver ruler + white/gray geometric cube.
File hint: design_critic.png
```

### 11. `text_reader.png` — 文字解读（备用）· circleBg `#DCEBFF`

```text
Circular disc color: soft sky #DCEBFF. Motif: white document + abstract gray text bars + pale blue highlight — NO real letters.
File hint: text_reader.png
```

### 12. `med_label.png` — 药品说明 · circleBg `#FDE8EA`

```text
Circular disc color: soft blush #FDE8EA. Motif: small medicine bottle or blister pack with a readable label panel (NO real drug names/letters — abstract bars only). Natural white/amber bottle, not pink-washed.
File hint: med_label.png
```

### 13. `sight_route.png` — 景点路线 · circleBg `#DCECFF`

> 与 `local_guide` 强区分：**必须有「有序路线」**（虚线路径 + 多个站点），不要单独地标建筑、不要讲故事气泡。

```text
Circular disc color: soft sky blue #DCECFF filling the circle.
Motif on disc (ordered itinerary — NOT a landmark story): a soft 3D clay FOLDED tourist map or flat board with pale green land / light blue water patches, plus a CLEAR brown or charcoal DASHED route line connecting 3 waypoint markers in different colors (e.g. red → orange → blue) along the path. Optional tiny direction chevron on the dashed line. Natural paper map colors on the sky disc.
CRITICAL differentiators vs local_guide: MUST show path + multiple stops; NO clock tower / temple / monument as the main subject; NO speech bubble; NO guidebook as hero.
File hint: sight_route.png
```

### 14. `hotel_guide.png` — 酒店入住 · circleBg `#F5E6D8`

```text
Circular disc color: soft sand #F5E6D8 filling the circle.
Motif (CRITICAL — must look like a HOTEL, not a shop/cafe):
A miniature multi-story hotel building in soft clay 3D, clearly taller than wide (2–3 floors), with a hotel porte-cochère / entrance canopy (solid cream or soft taupe fabric — NOT red-white candy stripes, NOT bakery/cafe awning).
Lobby entrance with glass revolving door or tall double doors, warm lobby glow inside.
Hotel cues stacked for instant recognition: a small luggage cart (bellhop trolley) beside the door, a brass hotel bell on a stand, and a cream keycard with abstract crest in the foreground.
Facade: cream/stone walls, evenly spaced windows on upper floors (hotel room rhythm), subtle brass accents.
AVOID: single-story shopfront, candy-stripe awning, cafe tables, bakery look, generic house, bank columns, any readable letters including H/HOTEL.
Natural warm materials; circle background only is #F5E6D8 — do not wash the building pink/red.
File hint: hotel_guide.png
```

### 15. `flight_info.png` — 航班助手 · circleBg `#E4ECFF`

```text
Circular disc color: soft ice blue #E4ECFF. Motif: boarding-pass rectangle with abstract barcode strip + tiny airplane silhouette. Paper ticket look, NO readable letters.
File hint: flight_info.png
```

---

## 套图一致性加料

```text
Generate a consistent Chance-style icon family: each icon is a soft pastel CIRCULAR disc (different circle color per agent) with the same soft clay 3D lighting, then a natural-colored object centered on the disc with soft contact shadow. Do not dye objects to match their disc. Palm hand = natural skin on lilac disc only.
Agents + circle colors:
- auto #E8EEF5
- food_scan #FFE8DE
- palm_reader #EDE6F2
- food_explorer #FFF0D6
- menu_translator #D9F3EF
- med_label #FDE8EA
- sight_route #DCECFF
- hotel_guide #F5E6D8
- flight_info #E4ECFF
- stylist #FCE4EC
- local_guide #DFF5E8
- general_curiosity #E6E0FF
```

## 落地检查清单

1. 导出 512×512 PNG：**圆内有实色底**，圆外透明（不要棋盘格外透）  
2. 放入 `assets/agents/`  
3. `agentAssets.ts` → `AGENT_ICON_SOURCES` 取消对应注释  
4. 重启 Metro  
5. 相机底部确认：圆底色清晰、物体自然色、小尺寸可辨  

圆底色定义在 `agentAssets.ts` → `circleBg`；洞察页主题仍在 `agentThemes.ts`。
