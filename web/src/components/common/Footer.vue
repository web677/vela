<template>
  <footer class="footer">
    <div class="footer-container">
      <div class="footer-section">
        <h3 class="font-heading">Vela</h3>
        <p class="tagline">优雅品质，温柔陪伴</p>
        <p class="description">致力于为您提供高品质、优雅含蓄的成人用品，专注隐私保护与用户体验。</p>
      </div>

      <div class="footer-section">
        <h3>购物指南</h3>
        <ul>
          <li><router-link to="/products">浏览商品</router-link></li>
          <li><router-link to="/legal/shipping">配送说明</router-link></li>
          <li><router-link to="/legal/returns">退换货政策</router-link></li>
          <li><router-link to="/legal/after-sales">售后服务</router-link></li>
        </ul>
      </div>

      <div class="footer-section">
        <h3>法律信息</h3>
        <ul>
          <li><router-link to="/legal/privacy">隐私政策</router-link></li>
          <li><router-link to="/legal/terms">用户服务协议</router-link></li>
        </ul>
      </div>

      <div class="footer-section">
        <h3>联系我们</h3>
        <ul class="contact-list">
          <li>
            <span class="icon">📧</span>
            <span>service@vela.com</span>
          </li>
          <li>
            <span class="icon">📞</span>
            <span>400-XXX-XXXX</span>
          </li>
          <li>
            <span class="icon">🕐</span>
            <span>工作日 9:00-18:00</span>
          </li>
        </ul>
      </div>
    </div>

    <div class="footer-bottom">
      <p>&copy; 2024 Vela. All rights reserved. | 保护您的隐私是我们的承诺</p>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  background-color: var(--color-bg-secondary);
  border-top: 1px solid var(--color-border-light);
  margin-top: var(--spacing-4xl);
}

.footer-container {
  max-width: var(--container-max-width);
  margin: 0 auto;
  padding: var(--spacing-3xl) var(--container-padding);
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: var(--spacing-2xl);
}

.footer-section h3 {
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-lg);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
}

.tagline {
  color: var(--color-primary);
  font-size: var(--font-size-sm);
  font-style: italic;
  margin-bottom: var(--spacing-sm);
}

.description {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  line-height: var(--line-height-relaxed);
  margin: 0;
}

.footer-section ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer-section li {
  margin-bottom: var(--spacing-sm);
}

.footer-section a {
  color: var(--color-text-secondary);
  text-decoration: none;
  font-size: var(--font-size-sm);
  transition: color var(--duration-base) var(--ease-in-out);
  display: inline-block;
}

.footer-section a:hover {
  color: var(--color-primary);
  transform: translateX(2px);
}

.contact-list li {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.contact-list .icon {
  font-size: var(--font-size-base);
}

.footer-bottom {
  border-top: 1px solid var(--color-border-light);
  padding: var(--spacing-xl);
  text-align: center;
  background-color: var(--color-bg-tertiary);
}

.footer-bottom p {
  color: var(--color-text-muted);
  font-size: var(--font-size-xs);
  margin: 0;
}

/* 移动端优化 */
@media (max-width: 768px) {
  .footer-container {
    grid-template-columns: repeat(2, 1fr);
    padding: var(--spacing-2xl) var(--container-padding);
    gap: var(--spacing-xl);
  }

  .footer-section:first-child {
    grid-column: 1 / -1;
  }

  .footer-bottom {
    padding: var(--spacing-lg);
  }

  .footer-bottom p {
    font-size: 10px;
  }
}

@media (max-width: 480px) {
  .footer-container {
    grid-template-columns: 1fr;
  }
}
</style>

