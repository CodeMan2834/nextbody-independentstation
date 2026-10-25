# Cloudflare 流量与网站健康

入口：`/admin/analytics.html?view=health`。演示：`/admin/analytics.html?view=health&demo=1`。

## 配置

1. Cloudflare 创建 Token：Zone → Analytics → Read，仅授权 nexbodyfit.com。
2. 在域名概览复制 Zone ID，不能用 Account ID 代替。
3. Vercel Production 环境配置 `CLOUDFLARE_ANALYTICS_TOKEN`（Secret）及 `CLOUDFLARE_ZONE_ID`。
4. 重新部署；使用现有 GitHub 管理员账号登录看板，选择“流量与网站健康”。
5. 先验收最近24小时，再核对7天及30天是否在套餐范围内。密钥不进入 Git 或前端。

## 使用

- 选择最近24小时、7天或30天；点击刷新重新读取。页面可见时每5分钟读取，服务端成功结果缓存5分钟。缓存命中不会强制再次查询Cloudflare。
- 指标窗口为滚动时间范围，显示北京时间起止；24小时趋势标签为北京时间，7天/30天按UTC日汇总。
- HTTP请求包含HTML、图片、视频、脚本及接口，不代表人数。只汇总主域名和www域名经过Cloudflare的终端请求（eyeball），排除内部子请求；仍可能包含机器人、管理员和失败请求。
- 缓存HIT占比 = 状态为hit的请求 / 全部请求。不是“可缓存资源命中率”。
- 5xx响应占比 = 边缘5xx响应 / 全部请求，不代表可用率，也不能单独认定源站故障。
- 自适应数据集可能返回采样估算，不再次乘采样倍数。无请求时比例为“—”。
- 地区仅展示前10项，占比的分母是全部请求。明细达到返回上限时不展示相关比例。
- 与Turso的网站浏览、模块点击、渠道和询盘独立展示，不相加。未存入Turso，也不改变现有采集规则。

## 异常

- 等待授权：补充环境变量并重新部署。
- 需要登录：使用有仓库写权限的GitHub账号登录。
- 授权需要检查：核对Token有效期、Analytics Read权限、域名资源和Zone ID。
- 范围暂不可用：缩短查询范围；数据集最大时长、历史保留与字段可用性由当前套餐决定。
- 暂时无法读取：等待并重试，不能按零请求解读。Cloudflare部分GraphQL错误会随HTTP200返回，本实现仍作为错误处理。
- 授权变更时清除服务端缓存；Token到期前由技术负责人轮换。此模块没有主动健康探测、告警或历史归档。

## 技术验收

- 独立受保护接口 `/api/analytics/cloudflare?range=24h`，沿用现有管理员权限，不依赖Turso是否已接入。
- 查询数据集 `httpRequestsAdaptiveGroups`；先读取settings核对可用性与时间范围。
- 检查Cloudflare控制台同域名、同窗口、同过滤条件的汇总。采样、时区、数据处理延迟可能产生差异，不要求与浏览器埋点一致。
- 测试覆盖权限、配置缺失、空结果、采样分母、缓存/并发、套餐限制、GraphQL错误和凭据轮换；演示模式不调用Cloudflare、不写统计库。

官方参考：
- https://developers.cloudflare.com/analytics/graphql-api/features/discovery/settings/
- https://developers.cloudflare.com/analytics/graphql-api/tutorials/end-customer-analytics/
- https://developers.cloudflare.com/analytics/graphql-api/limits/
