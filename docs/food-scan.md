# 食识拍（food_scan）

> 拍照估营养 · 非医疗/过敏诊断 · 需在相机里**手动选「食识拍」**（自动模式默认走美食探索）

## 流程

```text
选食识拍 → 拍照/相册 → 分析中（思考步骤）→ 洞察页（营养报告）→ 追问（结构化回答）
```

与「美食探索」区别：食识拍看**热量/营养素/过敏原**；美食探索看**风味/文化/周边**。

## 洞察页有什么

大图 → 标题/叙事 → 热量 + 碳水/脂肪/蛋白质 → 饮食建议/过敏原 → 追问芯片 → 对话区

追问默认芯片示例：「适合减脂吗？」「怎么加纤维？」「蛋白质够不够？」

## 关键接口

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/v1/analyze` 或 `/stream` | `agent_override=food_scan`；stream 可有 `thinking` |
| POST | `/v1/followup` | 返回 `structured_answer`（仅食识拍） |

服务端对专项镜头走**完整质量链路**（不全砍字段换速度）。

## 前端组件（速查）

| 组件 | 作用 |
|------|------|
| `AnalysisThinkingOverlay` | 分析中遮罩 |
| `FoodScanInsightSections` / `NutritionRing` | 营养报告 |
| `FoodScanFollowUpAnswer` | 结构化追问 |
| `FoodScanThinkingSheet` | 回顾思考步骤 |

模式配置：`cameraModes.ts` · 常量：`foodScanThinking.ts`

## 限制

- 营养为视觉估算，不是实验室精度  
- 历史入口进洞察页一般没有实时思考步骤  
- 视觉超时会导致质量下降 → 见 API [dev-pitfalls](../../vision-agent-api/docs/dev-pitfalls.md)

## 代码位置

```text
vision-agent-api/src/agents/prompts.ts、schemas/insight.ts、routes/analyze.ts、services/vlm.ts
vision-agent-mobile/src/screens/{Camera,Insight}Screen.tsx、components/FoodScan*
```
