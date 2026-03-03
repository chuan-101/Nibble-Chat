项目简介
Nibble-Chat 是一个自托管的聊天小工具。前端部署在 GitHub Pages；数据存储与多端同步由用户自行创建的 Supabase 项目提供。本项目不提供中心化服务器，你的数据只在你自己的 Supabase 里。

> 本项目不提供公共后端。请先创建你自己的 Supabase 项目，并在应用内 Setup 页面填写 URL/anon key。

快速开始（Supabase-only）

创建 Supabase 项目

登录 Supabase，新建一个 Project。

Region 选离你近的即可。

建议勾选 Enable Data API、Enable automatic RLS。

配置邮箱登录为“验证码 OTP”（强烈推荐）
为避免 GitHub Pages 回跳导致的魔法链接 404，建议使用“邮箱验证码 OTP”登录：

Supabase Dashboard → Authentication → Providers → Email

关闭 Enable Magic Link

设置 Email OTP Length（建议 6 位，适配输入框）

Supabase Dashboard → Authentication → Email Templates → Magic Link

将模板内容改为“只发送验证码”，不要包含登录链接

正文示例：
你的登录验证码是：{{ .Token }}
请回到页面在验证码输入框中填写完成登录。

在 Supabase 执行建表 SQL
在 Supabase Dashboard → SQL Editor 执行本仓库提供的 SQL：supabase/init.sql

执行完成后，你应该能在 Table Editor（public）里看到对应表。

获取 Supabase 连接信息
Supabase Dashboard → Settings → API：

Project URL（形如 https://xxxx.supabase.co）

anon public key（注意：不要使用 service_role）

部署前端
本项目可直接部署到 GitHub Pages。默认不依赖仓库 Secrets，终端用户首次打开页面会进入 Setup 页面并填写自己的 Supabase URL/anon key。

可选：开发调试时也支持 VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY 作为回退配置。

打开页面并登录
打开 Pages 地址，先在 Setup 页面输入你自己的 Supabase URL + anon key，保存后输入邮箱 → 获取验证码 → 输入验证码登录。
登录后即可开始使用，多端同步数据会保存在你自己的 Supabase。

常见问题

看到 404（rest/v1/xxx）：通常是没跑 SQL 或跑错顺序，回到 SQL Editor 重新执行。

收不到验证码：检查 Providers → Email 是否启用、Email Templates 是否被改坏、邮箱垃圾箱。

不要把 service_role key 放进前端或公开环境变量。
