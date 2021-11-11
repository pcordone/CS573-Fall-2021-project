export var BrowserText = (function () {
  var canvas = document.createElement('canvas'),
    context = canvas.getContext('2d');

  /**
   * Measures the rendered width of arbitrary text given the font size and font face
   **/
  function getWidth(text, selector) {
    const element = document.querySelector(selector);
    const style = getComputedStyle(element);
    context.font = style.fontSize + ' ' + style.fontFamily;
    return context.measureText(text).width;
  }

  /**
   * Measures the rendered width of arbitrary text given the font size and font face
   **/
  function getHeight(selector) {
    console.log(selector);
    const element = document.querySelector(selector);
console.log(document);
console.log(element);
    const style = getComputedStyle(element);
    return Number(style.fontSize.replace(/px$/, ''));
  }

  return {
    getWidth: getWidth,
    getHeight: getHeight,
  };
})();