# Game Life Log / 游戏人生护照

中文 | [English](#english)

一个面向个人玩家的本地游戏通关年鉴工具。它不是待玩清单，也不是数据库后台，而是把每一次通关、云完、AFK、补课、重玩，整理成时间轴、通关护照、封面博物馆、掌机柜和年度记录。

## 特点

- 本地优先：记录保存在浏览器 `localStorage`，公开网页不会暴露编辑能力。
- 快速记录：游戏名、平台、设备、日期、状态、备注，几十秒就能记完。
- 封面匹配：本地编辑时可以搜索 Steam 候选封面，也可以粘贴 URL 或上传本地图片。
- 年度九宫格：每年挑 9 个代表作，支持自动推荐、手动排序和分享图导出。
- 剧透备注：重要反转可以单独写，公开页默认折叠，需要确认后展开。
- 纪念感展示：时间轴、通关护照、游戏封面墙、掌机柜、自动徽章。
- 掌机友好：可以记录 RG、AYANEO、Switch、3DS、PSP、PSV、奥丁等不同设备。
- 掌机值班室：按主力机 / 随身机双轨轮换设备，安排 12 周值班、抽签、计时、实测、保养和成就。
- 一键发布：本地版可以把记录写回 `data.json` / `data.js`，自动提交并推送到 GitHub Pages。
- 无后端账号系统：公开页面只是展示；只有你的本地电脑可以编辑和发布。

## 文件说明

- `index.html`：主页面，公开展示和本地编辑都在这里。
- `duty-room.js`：掌机值班室的数据、轮换规则、计时、统计和导入导出逻辑。
- `duty-room.css`：掌机值班室的桌面、平板和手机响应式样式。
- `data.js` / `data.json`：正式发布数据。
- `local-server.js`：本地编辑与一键发布助手。
- `start-local.bat`：Windows 一键启动本地编辑器。
- `start-local.ps1`：PowerShell 启动脚本。
- `publish.ps1`：备用命令行发布脚本。

## 如何使用

### 公开浏览

如果部署到 GitHub Pages，朋友只需要打开网页即可浏览。公开网页会自动隐藏：

- 快速记录表单
- 编辑 / 删除按钮
- 备份导入
- 一键发布
- 待补资料

也就是说，别人看得到你的展示页，但不能改你的记录。

### 本地编辑

在 Windows 上，双击：

```bat
start-local.bat
```

或在项目目录运行：

```bat
start-local.bat
```

它会打开：

```text
http://127.0.0.1:4188/
```

保持黑色命令窗口不要关，然后在网页里编辑记录。

### 补封面

在本地编辑页面里：

1. 输入游戏名。
2. 点击 `匹配封面`。
3. 从 Steam 候选图里选一张。
4. 如果搜不到，直接粘贴封面 URL，或者点击 `上传图片`。
5. 点击 `记一笔` 或 `保存修改`。

公开网页只展示已经保存的封面，不会显示匹配、上传、编辑和发布工具。

### 掌机值班室

掌机值班室只在本地编辑模式显示，公开 GitHub Pages 不会暴露设备轮换和游玩日志。打开本地页面后进入 `掌机值班室`：

1. 在总览查看本周主力机、随身机和 12 周排班。
2. 在设备页补充状态、系统环境、图片和偏好；未到手设备不会参与推荐。
3. 用随机抽签或排班建议选择下一台设备和游戏，确认后写入值班计划。
4. 用快速记录或计时器保存实际游玩时长；刷新页面后计时仍可恢复。
5. 在实测、维护、统计和成就页持续沉淀设备体验。
6. 在设置页导出完整 JSON 备份、导入合并数据、导出日历或年度 Markdown 报告。

游戏候选会复用现有生涯记录，不会额外伪造游戏库。设备照片可使用图片 URL 或上传到当前浏览器；建议定期导出完整备份，因为这些私人数据默认保存在浏览器 `localStorage` 中。

### 年度九宫格和分享图

1. 打开 `年度九宫格`。
2. 选择年份。
3. 点击 `自动推荐`，或从候选作品里手动加入。
4. 用 `上移` / `下移` 调整顺序。
5. 点击 `导出分享图`，生成一张年度纪念 PNG。

手动选择会跟随一键发布写进 `data.js`，公开网页也能看到同一套年度九宫格。

### 一键发布到网页

本地编辑完成后：

1. 打开本地页面的 `备份导入`。
2. 找到 `一键保存并发布`。
3. 填写发布说明，比如 `Update game records`。
4. 点击 `保存并发布到网页`。

工具会自动完成：

- 写入 `data.json`
- 生成 `data.js`
- `git commit`
- `git push`
- 等待 GitHub Pages 自动刷新

### 备用发布方式

如果你想用命令行发布：

```powershell
.\publish.ps1 -Message "Update game records"
```

如果你只有导出的 JSON：

```powershell
.\publish.ps1 -DataJsonPath "C:\path\to\data.json" -Message "Update game records"
```

## 部署到 GitHub Pages

1. 把项目推送到 GitHub 公开仓库。
2. 进入仓库 Settings。
3. 打开 Pages。
4. Source 选择 `Deploy from a branch`。
5. Branch 选择 `master` 或 `main`，目录选择 `/root`。
6. 保存后等待几分钟。

之后网页地址通常是：

```text
https://你的用户名.github.io/仓库名/
```

## 隐私说明

- 公开仓库里的 `data.js` / `data.json` 是公开数据。
- 浏览器本地编辑数据只存在你自己的电脑。
- 公开网页不会读取公开访客的本地编辑数据。
- 一键发布助手只监听 `127.0.0.1`，只适合在你自己的电脑上运行。

## English

A local-first game completion journal for personal players. Game Life Log is not a backlog tracker or a database dashboard. It turns your cleared games, watched endings, pauses, replays, and retro catch-ups into a timeline, passport cards, a cover museum, a handheld cabinet, and yearly summaries.

## Features

- Local-first editing: records are stored in browser `localStorage`; the public page has no editing tools.
- Fast entry: title, platform, device, date, status, notes, and memories.
- Cover matching: search Steam cover candidates locally, paste an image URL, or upload a local image.
- Yearly nine-grid: pick 9 representative games per year, reorder them, and export a share image.
- Spoiler notes: keep spoiler-heavy thoughts collapsed on the public page until confirmed.
- Personal archive views: timeline, passport cards, cover museum, handheld cabinet, and badges.
- Handheld-friendly: track different devices such as RG handhelds, AYANEO, Switch, 3DS, PSP, PSV, Odin, and more.
- Handheld Duty Room: rotate primary and portable devices, plan 12-week duty cycles, draw picks, time sessions, record benchmarks, maintenance, and achievements.
- One-click publish: the local editor can write `data.json` / `data.js`, commit, and push to GitHub Pages.
- No user account system: the public page is display-only; editing and publishing happen only on your own machine.

## Files

- `index.html`: main app, used for both public display and local editing.
- `duty-room.js`: Handheld Duty Room data, rotation rules, timer, statistics, and import/export logic.
- `duty-room.css`: responsive Handheld Duty Room styles.
- `data.js` / `data.json`: published records.
- `local-server.js`: local editing and publishing helper.
- `start-local.bat`: Windows launcher for the local editor.
- `start-local.ps1`: PowerShell launcher.
- `publish.ps1`: fallback command-line publishing script.

## Usage

### Public Viewing

When deployed to GitHub Pages, visitors can browse the archive. The public site automatically hides:

- Quick entry form
- Edit / delete buttons
- Backup and import tools
- One-click publishing
- Missing-info checklist

Visitors can view your archive, but they cannot modify your records.

### Local Editing

On Windows, double-click:

```bat
start-local.bat
```

Or run it from the project folder:

```bat
start-local.bat
```

It opens:

```text
http://127.0.0.1:4188/
```

Keep the command window open while editing.

### Adding Covers

In the local editor:

1. Enter a game title.
2. Click `Match cover`.
3. Pick a Steam candidate.
4. If nothing good appears, paste a cover URL or click `Upload image`.
5. Click `Add record` or `Save changes`.

The public page only displays saved covers. It does not show cover matching, upload, editing, or publishing tools.

### Yearly Nine-Grid And Share Image

1. Open `Yearly nine-grid`.
2. Select a year.
3. Click `Auto-pick`, or add games manually from the candidate list.
4. Reorder with `Move up` / `Move down`.
5. Click `Export share image` to generate a PNG poster.

Manual yearly picks are written into `data.js` during one-click publishing, so the public page shows the same nine-grid.

### One-Click Publishing

After editing locally:

1. Open `Backup / Import`.
2. Find `One-click save and publish`.
3. Enter a commit message, such as `Update game records`.
4. Click `Save and publish to website`.

The helper will:

- write `data.json`
- generate `data.js`
- run `git commit`
- run `git push`
- let GitHub Pages refresh the public site

### GitHub Pages Deployment

1. Push the project to a public GitHub repository.
2. Open repository Settings.
3. Open Pages.
4. Choose `Deploy from a branch`.
5. Select `master` or `main`, folder `/root`.
6. Save and wait a few minutes.

The site URL is usually:

```text
https://your-username.github.io/repository-name/
```

## Privacy

- `data.js` and `data.json` in the public repository are public.
- Local editing data stays in your own browser.
- The public page does not read visitor editing data.
- The one-click publishing helper only listens on `127.0.0.1`, so it is meant for your own machine only.
