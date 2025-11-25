<template>
  <footer class="footer">
    <div class="footer-container">
      <div class="footer-section">
        <h3>关于 VELA</h3>
        <p>专注于为您提供高品质的成人用品</p>
      </div>
      <div class="footer-section">
        <h3>客户服务</h3>
        <ul>
          <li><a href="#">配送说明</a></li>
          <li><a href="#">退换货政策</a></li>
          <li><a href="#">隐私保护</a></li>
        </ul>
      </div>
      <div class="footer-section">
        <h3>联系我们</h3>
        <p>客服邮箱：support@vela.com</p>
      </div>
    </div>
    <div class="footer-bottom">
      <p>&copy; 2024 Vela. All rights reserved.</p>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  background: var(--color-surface);
  border-top: 1px solid var(--color-border);
  margin-top: auto;
}

.footer-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 3rem 1.5rem;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
}

.footer-section h3 {
  color: var(--color-text-primary);
  margin-bottom: 1rem;
  font-size: 1.125rem;
}

.footer-section p,
.footer-section li {
  color: var(--color-text-secondary);
  font-size: 0.875rem;
  line-height: 2;
}

.footer-section ul {
  list-style: none;
}

.footer-section a {
  color: var(--color-text-secondary);
  text-decoration: none;
  transition: color var(--transition-base);
}

.footer-section a:hover {
  color: var(--color-primary);
}

.footer-bottom {
  border-top: 1px solid var(--color-border);
  padding: 1.5rem;
  text-align: center;
}

.footer-bottom p {
  color: var(--color-text-muted);
  font-size: 0.875rem;
}
</style>
