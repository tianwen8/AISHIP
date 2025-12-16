/**
 * Creem Payment Test Script
 * 测试 Creem 支付集成是否正常工作
 */

// Test cards for Creem
const TEST_CARDS = {
  SUCCESS: {
    number: '4242 4242 4242 4242',
    cvv: '123',
    expiry: '12/25',
    description: '✅ 支付成功卡'
  },
  DECLINED: {
    number: '4000 0000 0000 0002',
    cvv: '123',
    expiry: '12/25',
    description: '❌ 支付失败卡'
  }
};

console.log('🧪 Creem 支付测试指南\n');
console.log('═══════════════════════════════════════════════════\n');

console.log('📋 测试前检查清单：');
console.log('  ✓ [ ] CREEM_ENV = "test" (.env.local)');
console.log('  ✓ [ ] CREEM_API_KEY 已配置');
console.log('  ✓ [ ] CREEM_WEBHOOK_SECRET 已配置');
console.log('  ✓ [ ] CREEM_PRODUCTS 包含3个产品的 price_id\n');

console.log('═══════════════════════════════════════════════════\n');

console.log('🎯 测试步骤：\n');

console.log('Step 1: 启动开发服务器');
console.log('  $ npm run dev\n');

console.log('Step 2: 启动 ngrok 隧道（用于接收 webhook）');
console.log('  $ npx ngrok http 3000');
console.log('  → 复制 HTTPS URL (例如: https://abc123.ngrok.io)\n');

console.log('Step 3: 更新 Creem Webhook URL');
console.log('  Creem Dashboard → Webhooks → 编辑 webhook');
console.log('  URL: https://your-ngrok-url.ngrok.io/api/pay/notify/creem');
console.log('  Events: checkout.completed\n');

console.log('Step 4: 测试支付流程');
console.log('  1. 访问: http://localhost:3000/pricing');
console.log('  2. 点击任意套餐的 "Get Started"');
console.log('  3. 使用测试卡支付:\n');

console.log('     ✅ 成功支付测试:');
console.log(`        卡号: ${TEST_CARDS.SUCCESS.number}`);
console.log(`        CVV: ${TEST_CARDS.SUCCESS.cvv}`);
console.log(`        日期: ${TEST_CARDS.SUCCESS.expiry}\n`);

console.log('     ❌ 失败支付测试:');
console.log(`        卡号: ${TEST_CARDS.DECLINED.number}`);
console.log(`        CVV: ${TEST_CARDS.DECLINED.cvv}`);
console.log(`        日期: ${TEST_CARDS.DECLINED.expiry}\n`);

console.log('Step 5: 验证结果');
console.log('  ✓ [ ] 支付成功后跳转到 /dashboard');
console.log('  ✓ [ ] Webhook 收到 checkout.completed 事件');
console.log('  ✓ [ ] 控制台显示签名验证通过');
console.log('  ✓ [ ] 数据库 orders 表有新记录');
console.log('  ✓ [ ] 数据库 users 表的 credits 字段已增加');
console.log('  ✓ [ ] Creem Dashboard 显示测试交易记录\n');

console.log('═══════════════════════════════════════════════════\n');

console.log('📊 测试套餐配置：\n');
console.log('  1. Starter Monthly - $18.00 (2000 Power Units)');
console.log('  2. Pro Monthly - $30.00 (3330 Power Units)');
console.log('  3. Business Monthly - $88.00 (9800 Power Units)\n');

console.log('💡 提示：');
console.log('  - 测试环境不会产生真实费用');
console.log('  - 每个套餐都要测试一次');
console.log('  - 记得测试支付失败的场景');
console.log('  - Webhook 签名验证失败会记录错误日志\n');

console.log('═══════════════════════════════════════════════════\n');

console.log('🔗 相关链接：');
console.log('  - Creem Dashboard: https://dashboard.creem.io');
console.log('  - Ngrok Dashboard: https://dashboard.ngrok.com');
console.log('  - Webhook 测试工具: https://webhook.site\n');

console.log('准备好开始测试了吗？ 🚀');
console.log('运行: npm run dev\n');
