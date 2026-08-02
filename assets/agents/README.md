# Agent 图标

用于**相机选择镜头的圆形按钮**（及首页视角圆、详情头像）。  
风格对齐 Chance：**彩色圆盘底 + 中间 3D 物体**。

将 GPT / 设计生成的 PNG 放在本目录，文件名与 `src/constants/agentAssets.ts` 中的 `fileName` 一致。

建议规格：

- 尺寸：512×512
- 格式：PNG；**圆内实色底**，圆外透明
- 圆底色用 `agentAssets` 里的 `circleBg`（马卡龙色）
- 物体用自然色，不要染成圆底色（手保持肤色）
- 不要文字 / Logo 字标

启用方式：在 `agentAssets.ts` 的 `AGENT_ICON_SOURCES` 中取消对应 `require` 注释。

完整生成提示词见：`docs/agent-icon-prompts.md`
