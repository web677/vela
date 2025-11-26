<template>
  <div class="returns-policy legal-page">
    <div class="container">
      <h1 class="page-title font-heading">退换货政策</h1>
      <p class="page-subtitle">我们重视您的购物体验，提供灵活的退换货服务</p>

      <section class="legal-section">
        <h2>退换货条件</h2>
        <div class="content-block">
          <p>为了保障您的权益，我们提供以下退换货服务：</p>
          
          <div class="highlight-box">
            <h3>可以退换货的情况</h3>
            <ul>
              <li>商品存在质量问题或与描述不符</li>
              <li>收到的商品有破损、污渍或其他瑕疵</li>
              <li>发错货或漏发货</li>
              <li>在未拆封、未使用的情况下，7天内可无理由退货</li>
            </ul>
          </div>

          <div class="alert-box warning">
            <h3>⚠️ 重要提示</h3>
            <p><strong>出于卫生和安全考虑，以下情况不支持退换货：</strong></p>
            <ul>
              <li>已拆封、已使用的商品（质量问题除外）</li>
              <li>贴身用品、私密护理类商品（除非有质量问题）</li>
              <li>定制商品或特殊订制商品</li>
              <li>促销、清仓、特价商品（商品描述中会特别说明）</li>
            </ul>
          </div>
        </div>
      </section>

      <section class="legal-section">
        <h2>退换货流程</h2>
        <div class="content-block">
          <h3>第一步：申请退换货</h3>
          <ol>
            <li>登录您的账户，进入"我的订单"</li>
            <li>找到需要退换货的订单，点击"申请退换货"</li>
            <li>填写退换货原因并上传相关照片（如有破损或质量问题）</li>
            <li>提交申请，等待审核</li>
          </ol>

          <h3>第二步：等待审核</h3>
          <p>我们会在1个工作日内审核您的申请。审核通过后，您会收到短信或邮件通知。</p>

          <h3>第三步：寄回商品</h3>
          <ul>
            <li><strong>质量问题：</strong>我们会安排快递上门取件，运费由我们承担</li>
            <li><strong>7天无理由退货：</strong>需要您自行寄回商品，运费由您承担</li>
            <li>请使用安全的包装，避免商品在运输过程中损坏</li>
            <li>建议使用可追踪的快递服务</li>
          </ul>

          <h3>第四步：验收与退款</h3>
          <p>我们收到商品后会在2个工作日内完成验收：</p>
          <ul>
            <li>验收通过后，款项将在3-7个工作日内原路退回</li>
            <li>退款金额包含商品价格，不包含运费（质量问题除外）</li>
            <li>如选择换货，我们会在验收通过后立即为您发货</li>
          </ul>
        </div>
      </section>

      <section class="legal-section">
        <h2>退款方式与时间</h2>
        <div class="info-table">
          <div class="table-row">
            <div class="table-cell">支付方式</div>
            <div class="table-cell">退款到账时间</div>
          </div>
          <div class="table-row">
            <div class="table-cell">支付宝</div>
            <div class="table-cell">1-3 个工作日</div>
          </div>
          <div class="table-row">
            <div class="table-cell">微信支付</div>
            <div class="table-cell">1-3 个工作日</div>
          </div>
          <div class="table-row">
            <div class="table-cell">银行卡</div>
            <div class="table-cell">3-7 个工作日</div>
          </div>
        </div>
        <p class="note">注：退款时间从我们发起退款开始计算，具体到账时间以银行或支付平台为准。</p>
      </section>

      <section class="legal-section">
        <h2>特殊说明</h2>
        <div class="content-block">
          <div class="qa-item">
            <p class="question">Q: 收到商品后多久可以申请退换货？</p>
            <p class="answer">A: 签收后7天内可申请退换货。超过7天恕不受理（质量问题可适当延长）。</p>
          </div>

          <div class="qa-item">
            <p class="question">Q: 退货时需要退回赠品吗？</p>
            <p class="answer">A: 是的，如果订单中包含赠品，退货时需要一并退回，否则可能影响退款金额。</p>
          </div>

          <div class="qa-item">
            <p class="question">Q: 可以只退部分商品吗？</p>
            <p class="answer">A: 可以。如果订单中有多件商品，您可以选择退其中的部分商品。</p>
          </div>

          <div class="qa-item">
            <p class="question">Q: 换货需要补运费吗？</p>
            <p class="answer">A: 如果是质量问题换货，运费由我们承担；如果是个人原因换货，往返运费需要您承担。</p>
          </div>
        </div>
      </section>

      <section class="legal-section">
        <h2>联系客服</h2>
        <div class="content-block">
          <p>如您在退换货过程中遇到任何问题，请及时联系我们：</p>
          <ul class="contact-list">
            <li><strong>在线客服：</strong>工作日 9:00-18:00</li>
            <li><strong>客服邮箱：</strong>service@vela.com</li>
            <li><strong>客服热线：</strong>400-XXX-XXXX</li>
          </ul>
          <p>我们会尽快为您处理并解决问题。</p>
        </div>
      </section>

      <div class="back-link">
        <router-link to="/" class="btn btn-ghost">返回首页</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
// Static content page
</script>

<style scoped>
@import './legal-common.css';
</style>
