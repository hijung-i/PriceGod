/*****************************
 * 상품 Slider
 * Author: jgpark
 * 
 * option : {
 *  delay: default 0 
 *  count: default 0 shown product count on wrapper 
 *  swipeMode: 
 * }
 */
function ProductSlider(items, options) {
    this.items = items || new Array();

    this._displayWidth = 0;
    this._itemWidth = 0;
    // 상품 item 최소 크기
    this._minWidth = 211;

    this.swipeMode = options.swipeMode || 0;
    this.delay = options.delay || 0;
    this.count = options.count || 0;
    this.margin = options.margin || 0;
}

ProductSlider.prototype.setItems = function (items) {
    this.items = items;

    this._refresh();
}

ProductSlider.prototype.addItem = function (item) {
    this.items.push(item);

    this._refresh();
}

ProductSlider.prototype._refresh = async function() {
    if(this.element == undefined || this.count == 0 || this.items.length == 0) {
        return;
    }

    this.element.classList.add('df-slider')
    
    this._displayWidth = this.element.offsetWidth;

    var wrapper = document.createElement('ul')
    wrapper.classList.add('df-slider-wrapper');
    
    var html = generateHtmlForProductList(this.items);
    this.productElements = document.createRange().createContextualFragment(html).childNodes;
    
    // container 너비 - 한 번에 보이는 공백 / 한 번에 보이는 아이템 개수
    this._itemWidth = Math.floor((this._displayWidth - (this.margin * (this.count -1))) / this.count)
    if( this._itemWidth < this._minWidth) this._itemWidth = this._minWidth
    wrapper.style.width = (((this._itemWidth + this.margin) * this.items.length ) - this.margin) + 'px'

    Array.from(this.productElements).forEach((item, index) => {
        item.style.width = this._itemWidth + 'px';
        item.querySelector('.thum img').style.height = this._itemWidth + 'px';
        
        item.style.display = 'inline-block';
        wrapper.append(item);

        if(index == this.items.length -1) {
            this.element.innerHTML = '';
            this.element.append(wrapper);
        } else {
            // 마지막이 아닐때만 margin-right
            item.style.marginRight = this.margin + 'px';             
        }
    })
}

ProductSlider.prototype._next = function() {
    
}

ProductSlider.prototype._setSliderStyle = function() {
    
}

ProductSlider.prototype.setElement = function(elementId) {
    this.element = document.querySelector(elementId);
    
    this._refresh();
}