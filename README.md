# Vision Agent Mobile

类似 Chance AI 的视觉智能体移动端 App（Expo + React Native）。

## 功能

- 相机优先：拍照即分析，零输入
- 多 Agent 路由：自动选择或手动切换专项智能体
- 结构化洞察卡片：线索、文化背景、风格词汇、搜索建议
- Visual Memory：历史分析画廊
- 图像追问 + SSE 流式分析
- 语音播报（expo-speech）与分享海报

## 快速开始

```bash
# 1. 启动后端（另开终端）
cd ../vision-agent-api
npm install
npm run dev

# 2. 启动 App
cd vision-agent-mobile
npm start
```

### API 地址配置

正式包默认：`https://vision-agent-api.onrender.com`（见 `.env` / `eas.json`）

本地调试可改 `.env`：

```bash
EXPO_PUBLIC_API_URL=http://192.168.x.x:8000
```

未设置时开发模式会尽量自动探测：
- Android 模拟器：`http://10.0.2.2:8000`
- iOS 模拟器：`http://localhost:8000`

### PostHog 埋点

在 [PostHog](https://posthog.com) 创建项目后，把 **Project API Key** 写入 `.env`（或 EAS `env`）：

```bash
EXPO_PUBLIC_POSTHOG_API_KEY=phc_xxxxxxxx
# 可选，默认美区
EXPO_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
```

未配置 key 时 SDK 自动禁用，不会上报。主要事件：`app_open`、屏幕浏览、`camera_mode_select`、`analyze_*`、`insight_view`、`followup_ask`、`location_prompt`、`memory_open` / `memory_delete`、`share_poster`。

## 打包 APK

### 方式一：EAS 云构建

```bash
cd vision-agent-mobile
npm install
npx eas-cli login
npm run build:apk
```

构建完成后按终端提示下载 APK 安装到手机。

### 方式二：本地 Gradle（需 Android SDK）

环境要求：

- Node.js 18+
- JDK 17
- Android SDK（需配置 `ANDROID_HOME`）

```powershell
# 1. 安装依赖（首次或依赖变更后）
cd vision-agent-mobile
npm install

# 2. （可选）指定真机 API 地址后再打包
$env:EXPO_PUBLIC_API_URL="http://192.168.x.x:8000"

# 3. 构建 Release APK（推荐：仅 arm64，约 40 MB，适配现代真机）
cd android
.\gradlew.bat assembleRelease -PreactNativeArchitectures=arm64-v8a
```

构建完成后，安装包位于：

```
android/app/build/outputs/apk/release/app-release.apk
```

其他构建选项：

```powershell
# 兼容老 32 位设备（约 50–60 MB）
.\gradlew.bat assembleRelease -PreactNativeArchitectures=arm64-v8a,armeabi-v7a

# 包含模拟器架构（约 105 MB，仅开发调试用）
.\gradlew.bat assembleRelease
```

> 当前本地 Release 包若使用 debug 签名，只适合内测安装。上架应用商店需配置正式 keystore。

## 项目结构

```
src/
├── components/     # InsightCard, AgentPicker
├── constants/      # API 配置
├── screens/        # Camera, Insight, Memory
├── services/       # API 客户端
├── store/          # Zustand 状态
├── theme/          # 设计 token
└── types/          # TypeScript 类型
```
