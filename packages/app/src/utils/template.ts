/**
 * 生成导入数据模板并下载
 * 模板包含完整的 JSON 结构和示例数据，方便用户了解导入格式
 */
export function downloadImportTemplate(): void {
  const now = Date.now()

  const template = {
    version: 1,
    exportedAt: new Date().toISOString(),
    data: {
      // ========== 基金持仓 ==========
      // fundType 可选值: stock(股票型) / mix(混合型) / bond(债券型) / monetary(货币型) / index(指数型) / qdii(QDII) / other(其他)
      // holdingMode 可选值: amount(按金额) / shares(按份额)
      // costNav: 买入时的净值，用于计算累计收益，可填 null
      // groupId: 所属分组的 id，不需要分组可填 null
      portfolioFunds: [
        {
          id: '基金1的唯一ID（可用任意不重复的字符串）',
          fundCode: '110011',
          fundName: '易方达中小盘混合',
          fundType: 'mix',
          holdingMode: 'amount',
          holdingAmount: 10000,
          holdingShares: 0,
          costNav: 3.5,
          groupId: null,
          remark: '我的第一只基金',
          sortOrder: 0,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: '基金2的唯一ID',
          fundCode: '000001',
          fundName: '华夏成长混合',
          fundType: 'mix',
          holdingMode: 'shares',
          holdingAmount: 0,
          holdingShares: 5000,
          costNav: 1.2,
          groupId: null,
          remark: '',
          sortOrder: 1,
          createdAt: now,
          updatedAt: now,
        },
      ],

      // ========== 基金分组 ==========
      // 用于将基金归类，如"稳健型"、"激进型"等
      fundGroups: [
        {
          id: '分组1的唯一ID',
          name: '稳健型',
          sortOrder: 0,
          createdAt: now,
        },
        {
          id: '分组2的唯一ID',
          name: '激进型',
          sortOrder: 1,
          createdAt: now,
        },
      ],

      // ========== 价格预警 ==========
      // assetType 可选值: metal(贵金属) / fund(基金)
      // status 可选值: active(生效中) / triggered(已触发)
      // 贵金属代码: XAU(黄金) / XAG(白银) / XPT(铂金)
      // 基金代码: 直接填写基金代码，如 110011
      priceAlerts: [
        {
          id: '预警1的唯一ID',
          assetType: 'metal',
          assetCode: 'XAU',
          assetName: '黄金',
          targetPrice: 2500,
          priceUnit: 'USD/oz',
          status: 'active',
          triggeredAt: null,
          createdAt: now,
        },
        {
          id: '预警2的唯一ID',
          assetType: 'fund',
          assetCode: '110011',
          assetName: '易方达中小盘混合',
          targetPrice: 3.8,
          priceUnit: '元',
          status: 'active',
          triggeredAt: null,
          createdAt: now,
        },
      ],

      // ========== 用户设置 ==========
      // key-value 结构，一般不需要手动修改
      userSettings: [
        {
          key: 'theme',
          value: 'dark',
        },
      ],
    },
  }

  const json = JSON.stringify(template, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)

  const a = document.createElement('a')
  a.href = url
  a.download = 'luminary-import-template.json'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
