window.HELP_IMPROVE_VIDEOJS = false;

var INTERP_BASE = "./static/interpolation/stacked";
var NUM_INTERP_FRAMES = 240;

var interp_images = [];
function preloadInterpolationImages() {
  for (var i = 0; i < NUM_INTERP_FRAMES; i++) {
    var path = INTERP_BASE + '/' + String(i).padStart(6, '0') + '.jpg';
    interp_images[i] = new Image();
    interp_images[i].src = path;
  }
}

function setInterpolationImage(i) {
  var image = interp_images[i];
  image.ondragstart = function() { return false; };
  image.oncontextmenu = function() { return false; };
  $('#interpolation-image-wrapper').empty().append(image);
}


$(document).ready(function() {
    // Check for click events on the navbar burger icon
    $(".navbar-burger").click(function() {
      // Toggle the "is-active" class on both the "navbar-burger" and the "navbar-menu"
      $(".navbar-burger").toggleClass("is-active");
      $(".navbar-menu").toggleClass("is-active");

    });

    // ========== 第一步：修改全局选项，关闭默认自动播放 ==========
    // 这个选项将应用于所有 .carousel，但我们会覆盖特定实例
    var globalCarouselOptions = {
        autoplay: false,   // ⚠️ 重要：这里设为 false，关闭全局自动播放
        slidesToScroll: 1,
        slidesToShow: 1,
        loop: true,
        infinite: true,
        autoplaySpeed: 5000,
    };

    // ========== 第二步：初始化所有普通轮播（不自动播放）==========
    // 这会初始化所有具有 .carousel 类但 NOT #results-carousel 的元素
    // 我们使用一个过滤选择器来排除特定ID
    var allCarouselsExceptSpecial = bulmaCarousel.attach('.carousel:not(#results-carousel)', globalCarouselOptions);

    // ========== 第三步：单独初始化您想自动播放的特定轮播 ==========
    // 为 #results-carousel 创建独立的、开启自动播放的选项
    var specialCarouselOptions = {
        autoplay: true,    // ✅ 专门为这个轮播开启自动播放
        slidesToScroll: 1,
        slidesToShow: 1,
        loop: true,
        infinite: true,
        autoplaySpeed: 5000, // 轮播间隔5秒
    };
    // 单独初始化特定轮播
    var specialCarousels = bulmaCarousel.attach('#results-carousel', specialCarouselOptions);

    // ========== 第四步：合并两个轮播数组，方便统一管理事件（可选） ==========
    // 将所有轮播实例合并到一个数组，以便后续统一添加事件监听
    var allCarousels = [...allCarouselsExceptSpecial, ...specialCarousels];

    // 为所有轮播添加事件监听（保持您原有的日志功能）
    for(var i = 0; i < allCarousels.length; i++) {
        allCarousels[i].on('before:show', state => {
            console.log(state);
        });
    }

    /*var player = document.getElementById('interpolation-video');
    player.addEventListener('loadedmetadata', function() {
      $('#interpolation-slider').on('input', function(event) {
        console.log(this.value, player.duration);
        player.currentTime = player.duration / 100 * this.value;
      })
    }, false);*/
    preloadInterpolationImages();

    $('#interpolation-slider').on('input', function(event) {
      setInterpolationImage(this.value);
    });
    setInterpolationImage(0);
    $('#interpolation-slider').prop('max', NUM_INTERP_FRAMES - 1);

    bulmaSlider.attach();

})


function restartGif(imgElement) {
  const gifSrc = imgElement.src;
  imgElement.src = ''; // 清空src
  imgElement.src = gifSrc; // 重新设置src，从而重启GIF
}

// 应用到所有GIF
const allGifs = document.querySelectorAll('img[src$=".gif"]');
allGifs.forEach(gif => restartGif(gif));
