# Han-Analytics

· Han-Analytics 是一个简单的网络分析跟踪器和仪表板，托管在被称为赛博菩萨的 Cloudflare 上,无成本稳定运行,每天可达10万次免费统计。

· 域名、服务器、数据库 通通都不用! 托管在 Cloudflare Pages 上即可快速部署网站分析仪表板。

### 页面截图

![Han-Analytics](https://i0.wp.com/uxiaohan.github.io/v2/2024/09/1727007937.webp)
![Han-Analytics](https://i0.wp.com/uxiaohan.github.io/v2/2024/09/1726993735.webp)

### 新增功能

🌍 **交互式地图可视化**
- 基于 ECharts 的世界地图展示访客地理分布
- 支持地图拖拽、缩放、重置视图等交互操作  
- 提供深色/明亮主题切换
- 实时显示各国访客数量和分布热力图
- 响应式设计，适配各种屏幕尺寸

### 部署

- 登录到 [Cloudflare Login](https://dash.cloudflare.com/sign-up)，没有的注册一个 [Cloudflare SignUp](https://dash.cloudflare.com/sign-up)
- 点击 Workers 和 Pages 随便创建一个 workers 并开启 分析引擎，然后复制 workers ID 备用。[操作截图1](https://i0.wp.com/uxiaohan.github.io/v2/2024/09/1727001144.webp)，[操作截图2](https://i0.wp.com/uxiaohan.github.io/v2/2024/09/1727001550.webp)
- 创建一个 [Cloudflare API token](https://dash.cloudflare.com/profile/api-tokens) 备用。[操作截图1](https://i0.wp.com/uxiaohan.github.io/v2/2024/09/1727001058.webp)，[操作截图2](https://i0.wp.com/uxiaohan.github.io/v2/2024/09/1727001090.webp)，[操作截图3](https://i0.wp.com/uxiaohan.github.io/v2/2024/09/1727001118.webp)
- Fork 此仓库 或 [使用此模板生成新仓库](https://github.com/new?template_name=HanAnalytics&template_owner=uxiaohan)
- 登录 Cloudflare 并创建 Pages 项目 ，链接Github仓库，选择刚刚 Fork 的项目，架构选择Vue，填入环境变量（环境变量含义如下），部署即可。[操作截图1](https://i0.wp.com/uxiaohan.github.io/v2/2024/09/1727001163.webp)，[操作截图2](https://i0.wp.com/uxiaohan.github.io/v2/2024/09/1727001181.webp)，[操作截图3](https://i0.wp.com/uxiaohan.github.io/v2/2024/12/1734595834412.webp)
- cloudflare pages 部署完成后，在项目的`设置`中配置`绑定`，添加`Analytics Engine`，变量名称填写`AnalyticsBinding`，数据集填写`AnalyticsDataset`并保存，重新部署！[操作截图1](https://i0.wp.com/uxiaohan.github.io/v2/2024/12/1734596343524.webp)。
- 重新部署完成后，访问 `https://xxxxxx.pages.dev` 即可访问网站分析仪表板。（注意：首次部署生成的域名可能需要几分钟时间生效，请耐心等待）
- 部署成功后，首次打开页面没有数据，请尽快集成到自己的网站并出现有效访问后，再次打开页面即可看到数据！
- 新增 `密码访问` 及 `网站白名单`，开启密码后，输入密码可访问（默认无需密码），网站白名单功能，加白的网站才可计入统计（默认任意网站都可统计）

### 环境变量说明
```shell
# Cloudflare Workers ID
CLOUDFLARE_ACCOUNT_ID = 你的 Cloudflare Workers ID

# 你的 Cloudflare API token
CLOUDFLARE_API_TOKEN = 你的 Cloudflare API token

# 网站访问密码 (不设置即无需密码访问)
CLOUDFLARE_WEBSITE_PWD = 

# 可统计的白名单 格式：  域名,WebSite|域名,WebSite，多个站点使用|分隔 例如：api.vvhan.com,Hello-Han-Api|www.vvhan.com,Hello-HanHexoBlog  (不设置即允许任何统计)
CLOUDFLARE_WEBSITE_WHITELIST = 
```

### 绑定
```shell
# 变量名
AnalyticsBinding
# 数据集
AnalyticsDataset
```

### 集成使用

```js
// 在网站底部插入以下代码即可集成网站分析仪表板
<script defer src="https://xxxxxx.pages.dev/tracker.min.js" data-website-id="自定义网站唯一标识"></script>
```

### 数据问题

数据问题一般是由于 Cloudflare Analytics Engine 无法访问网站导致的，请确保网站可以正常访问，并且 Cloudflare Analytics Engine 已经开启。

使用 Cloudflare Analytics Engine 数据集，它完全通过 HTTP 使用 Cloudflare 的 API 进行通信，数据完全来源于 Cloudflare Analaytics Engine 数据集中读取
Cloudflare Analytics Engine 使用抽样技术，以可承受的规模化方式实现大量数据提取/查询（这类似于大多数其他分析工具，请参阅Google Analytics 上的抽样）。您可以在此处详细了解抽样技术如何与 CF AE 配合使用。

### 使用说明

https://www.vvhan.com/article/han-analytics


## Stargazers over time

![Stargazers over time](https://starchart.cc/uxiaohan/HanAnalytics.svg?variant=adaptive)