# 积分购买流程 API 文档

## 流程概览

```
1. GET  /api/v1/public/tiers              获取套餐列表（无需登录）
2. POST /api/v1/client/orders             选择套餐下单（需登录）
3. 用户扫码支付（微信/支付宝）
4. GET  /api/v1/client/orders/{order_uid}  轮询订单状态（需登录）
```

## 认证方式

Step 2、4 需要在请求头带上 Clerk JWT：

```
Authorization: Bearer <clerk_jwt_token>
```

---

## Step 1: 获取积分套餐

**`GET /api/v1/public/tiers`** — 无需认证

### Request

无参数

### Response 200

```json
{
  "tiers": [
    {
      "id": 1,
      "uid": "1234567890123456789",
      "code": "TIER_A",
      "name": "入门版",
      "credits_amount": 20,
      "price": 2000,
      "currency": "CNY",
      "description": "入门套餐",
      "is_active": true,
      "sort_order": 0
    }
  ]
}
```

### 字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | int | 数据库自增 ID |
| `uid` | string | 套餐唯一标识，下单时传这个 |
| `code` | string | 套餐代码（TIER_A / TIER_B / TIER_C / TIER_D） |
| `name` | string | 套餐名称 |
| `credits_amount` | int | 包含积分数 |
| `price` | int | 价格，单位**分**（2000 = 20.00 元） |
| `currency` | string | 货币类型，固定 `CNY` |
| `description` | string / null | 套餐描述 |
| `is_active` | bool | 是否上架 |
| `sort_order` | int | 排序权重 |

### 套餐列表

| 代码 | 名称 | 积分 | 价格 (元) | 单价 |
|------|------|------|----------|------|
| TIER_A | 入门版 | 20 | 20.00 | 1.00/次 |
| TIER_B | 标准版 | 50 | 40.00 | 0.80/次 |
| TIER_C | 专业版 | 100 | 70.00 | 0.70/次 |
| TIER_D | 企业版 | 500 | 200.00 | 0.40/次 |

---

## Step 2: 选择套餐下单

**`POST /api/v1/client/orders`** — 需要认证

### Request Body

```json
{
  "tier_uid": "1234567890123456789",
  "payment_method": "wechat"
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `tier_uid` | string | 是 | 套餐 uid（从 Step 1 获取） |
| `payment_method` | string | 是 | `"wechat"` 或 `"alipay"` |

### Response 201

```json
{
  "uid": "1234567890123456790",
  "order_no": "ORD20260213123456",
  "total_amount": 2000,
  "payment_url": "https://api.xunhupay.com/payment/...",
  "qr_code": "data:image/png;base64,...",
  "expired_at": 1739440200
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| `uid` | string | 订单唯一标识，用于后续查询和取消 |
| `order_no` | string | 订单编号 |
| `total_amount` | int | 金额，单位**分** |
| `payment_url` | string | 支付链接 |
| `qr_code` | string | 二维码图片（base64），直接作为 `<img src>` 使用 |
| `expired_at` | int / null | 订单过期时间戳（下单后 30 分钟） |

### 前端使用示例

```html
<img :src="response.qr_code" alt="扫码支付" />
```

---

## Step 3: 用户扫码支付

用户使用微信/支付宝扫描二维码完成支付。

支付成功后，虎皮椒回调 `POST /api/v1/public/webhooks/hupijiao`，后端自动完成：

1. 验证 MD5 签名
2. 更新订单状态为 `paid`
3. 给用户充值对应积分
4. 记录积分流水

> 前端无需处理此步骤，只需轮询订单状态。

---

## Step 4: 轮询订单状态

**`GET /api/v1/client/orders/{order_uid}`** — 需要认证

### Path 参数

| 字段 | 类型 | 说明 |
|------|------|------|
| `order_uid` | string | Step 2 返回的 `uid` |

### Response 200

```json
{
  "id": 1,
  "uid": "1234567890123456790",
  "order_no": "ORD20260213123456",
  "user_id": 1,
  "tier_id": 1,
  "credits_amount": 20,
  "total_amount": 2000,
  "payment_method": "wechat",
  "payment_transaction_id": null,
  "status": "pending",
  "paid_at": null,
  "expired_at": 1739440200,
  "description": "购买入门版",
  "created_at": 1739438400
}
```

### 字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | int | 数据库自增 ID |
| `uid` | string | 订单唯一标识 |
| `order_no` | string | 订单编号 |
| `user_id` | int | 用户 ID |
| `tier_id` | int / null | 套餐 ID |
| `credits_amount` | int | 购买的积分数 |
| `total_amount` | int | 金额（分） |
| `payment_method` | string / null | 支付方式 |
| `payment_transaction_id` | string / null | 第三方支付流水号（支付成功后才有） |
| `status` | string | 订单状态，见下表 |
| `paid_at` | int / null | 支付时间戳 |
| `expired_at` | int / null | 过期时间戳 |
| `description` | string / null | 订单描述 |
| `created_at` | int | 创建时间戳 |

### 订单状态

| status | 说明 | 前端操作 |
|--------|------|---------|
| `pending` | 待支付 | 继续轮询（建议间隔 2-3 秒） |
| `paid` | 已支付 | 显示支付成功，停止轮询 |
| `cancelled` | 已取消 | 显示已取消，停止轮询 |
| `expired` | 已过期 | 显示已过期，停止轮询 |

### 前端轮询示例

```javascript
const pollOrder = async (orderUid) => {
  const interval = setInterval(async () => {
    const res = await fetch(`/api/v1/client/orders/${orderUid}`, {
      headers: { Authorization: `Bearer ${clerkToken}` }
    })
    const order = await res.json()

    if (order.status === 'paid') {
      clearInterval(interval)
      // 显示支付成功
    } else if (order.status !== 'pending') {
      clearInterval(interval)
      // 显示取消/过期
    }
  }, 3000)
}
```



## 补充：查询积分余额

**`GET /api/v1/client/credits`** — 需要认证

### Response 200

```json
{
  "credits": 45,
  "last_updated": 1739438400
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| `credits` | int | 当前积分余额 |
| `last_updated` | int | 最后更新时间戳 |

> 支付成功后可调用此接口刷新前端积分显示。
