<template>
  <div class="loading-mask is-fullscreen">
    <div class="loading-spinner">
      <svg viewBox="25 25 50 50" class="circular">
        <circle
          cx="50"
          cy="50"
          r="20"
          fill="none"
          class="path"
        />
      </svg>
      <p class="loading-text">
        正在加载...
      </p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Loading'
}
</script>

<style scoped>
.loading-mask {
  display: block;
  position: absolute;
  z-index: 2000;
  background-color: rgba(255, 255, 255, 0.9);
  margin: 0;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  -webkit-transition: opacity 0.3s;
  transition: opacity 0.3s;
}
.loading-mask.is-fullscreen {
  position: fixed;
}
.loading-mask.is-fullscreen .loading-spinner {
  margin-top: -100px;
}
.loading-mask.is-fullscreen .loading-spinner .circular {
  height: 50px;
  width: 50px;
}
.loading-spinner {
  top: 50%;
  width: 100%;
  text-align: center;
  position: absolute;
}
.loading-spinner .loading-text {
  color: #409eff;
  margin: 20px 0;
  font-size: 16px;
  font-weight: bold;
  letter-spacing: 2px;
  user-select: none;
}
.loading-spinner .circular {
  height: 42px;
  width: 42px;
  -webkit-animation: loading-rotate 2s linear infinite;
  animation: loading-rotate 2s linear infinite;
}
.loading-spinner .path {
  -webkit-animation: loading-dash 1.5s ease-in-out infinite;
  animation: loading-dash 1.5s ease-in-out infinite;
  stroke-dasharray: 90, 150;
  stroke-dashoffset: 0;
  stroke-width: 2;
  stroke: #409eff;
  stroke-linecap: round;
}

@keyframes loading-rotate {
  100% {
    -webkit-transform: rotate(360deg);
    transform: rotate(360deg);
  }
}

@keyframes loading-dash {
  0% {
    stroke-dasharray: 1, 200;
    stroke-dashoffset: 0;
  }
  50% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -40px;
  }
  100% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -120px;
  }
}
</style>
