<script>
/**
 * 不確定使用場景
 */
export default {
  props: {
    tHeight: {
      type: String,
      default: '70'
    },
    tWidth: {
      type: String,
      default: '70'
    }
  }
}
</script>
<template>
  <svg
    id="successAnimation"
    class="animated"
    :height="tHeight"
    viewBox="0 0 70 70"
    :width="tWidth"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      id="successAnimationResult"
      d="M35,60 C21.1928813,60 10,48.8071187 10,35 C10,21.1928813 21.1928813,10 35,10 C48.8071187,10 60,21.1928813 60,35 C60,48.8071187 48.8071187,60 35,60 Z M23.6332378,33.2260427 L22.3667622,34.7739573 L34.1433655,44.40936 L47.776114,27.6305926 L46.223886,26.3694074 L33.8566345,41.59064 L23.6332378,33.2260427 Z"
      fill="#D8D8D8"
    />
    <circle
      id="successAnimationCircle"
      cx="35"
      cy="35"
      fill="transparent"
      r="24"
      stroke="#979797"
      stroke-linecap="round"
      stroke-width="2"
    />
    <polyline
      id="successAnimationCheck"
      fill="transparent"
      points="23 34 34 43 47 27"
      stroke="#979797"
      stroke-width="2"
    />
  </svg>
</template>

<style lang="scss" scoped>
$circle-length: 151px;
$check-length: 36px;
$success-color: #00aaba;

html ,
body {
  height: 100%;
}

body {
  display: flex;
  align-items: center;
  justify-content: center;

  background-color: #fff;
}

@keyframes scaleAnimation {
  0% {
    transform: scale(1.5);

    opacity: 0;
  }
  100% {
    transform: scale(1);

    opacity: 1;
  }
}

@keyframes drawCircle {
  0% {
    stroke-dashoffset: $circle-length;
  }
  100% {
    stroke-dashoffset: 0;
  }
}

@keyframes drawCheck {
  0% {
    stroke-dashoffset: $check-length;
  }
  100% {
    stroke-dashoffset: 0;
  }
}

@keyframes fadeOut {
  0% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}

@keyframes fadeIn {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}

#successAnimationCircle {
  stroke-dasharray: $circle-length $circle-length;
  stroke: $success-color;
}

#successAnimationCheck {
  stroke-dasharray: $check-length $check-length;
  stroke: $success-color;
}

#successAnimationResult {
  opacity: 0;

  fill: $success-color;
}

#successAnimation.animated {
  animation: 2s ease-out 0s 1 both scaleAnimation;

  #successAnimationCircle {
    animation: 1s cubic-bezier(.77, 0, .175, 1) 0s 1 both drawCircle,
    .3s linear .9s 1 both fadeOut;
  }

  #successAnimationCheck {
    animation: 1s cubic-bezier(.77, 0, .175, 1) 0s 1 both drawCheck,
    .3s linear .9s 1 both fadeOut;
  }

  #successAnimationResult {
    animation: .3s linear .9s both fadeIn;
  }
}
</style>
