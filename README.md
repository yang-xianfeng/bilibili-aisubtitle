# Bilibili AI Subtitle Exporter Pro

功能：自动点击字幕按钮、XHR 拦截 AI 字幕数据、格式化时间轴并去重下载。支持多种导出格式（带时间轴的 TXT、SRT、纯文本）。

快速安装（两种方式）：
- 方式 A — 直接在 Tampermonkey 中粘贴（推荐，最快）
  1. 打开 Tampermonkey → 仪表盘 → 新建脚本。
  2. 删除模板内容，把 `dist/bilibili-ai-subtitle-exporter-pro.user.js` 中的全部内容粘贴进去。
  3. 保存并确保脚本已启用，刷新 B 站视频页面测试。

- 方式 B — 通过 GitHub raw URL 安装（需要将脚本放到仓库并使用 raw 链接）
  1. 将 `dist/bilibili-ai-subtitle-exporter-pro.user.js` 放到仓库 `dist/` 目录下。
  2. 在浏览器打开该文件的 raw 链接（示例）：
     `https://raw.githubusercontent.com/yang-xianfeng/bilibili-ai-subtitle-exporter-pro/main/dist/bilibili-ai-subtitle-exporter-pro.user.js`
  3. 在 Tampermonkey 中选择“安装脚本”并填写该 raw 链接，或直接在浏览器打开 raw 链接安装。

配置（脚本内 CONFIG）：
- keyword：用于拦截的 URL 关键词（默认 'aisubtitle'）
- autoClick：是否自动点击字幕按钮（true/false）
- downloadPrefix：下载文件名前缀
- format：导出格式（'txt_with_time' | 'srt' | 'pure_text'）

注意：
- 请仅用于个人学习/方便素材整理，遵守 B 站服务条款与版权法规。
- 若 B 站前端结构变动，脚本可能需要调整选择器或拦截关键词。

如果你想让我把文件直接推到 `yang-xianfeng` 下的仓库，请先在你的账号创建仓库并告诉我仓库名或 URL，我会在确认后把文件推上并设置好 raw 下载与更新 URL。
