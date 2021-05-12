function DeliveryGroupDTO() {
    this.loadingPlace = "";
    this.brandCode = "";
    this.products = new Array();
    this.deliveryCost = 0
    this.deliveryCost2 = 0
    this.deliveryCost3 = 0
    this.totalDeliveryCost = 0
    this.isSelected = false
    this.deliveryCostBasis = 0
    this.deliveryCostProduct = ""
    this.groupPrice = 0
    this.companyName = ""
    this.brandName = ""
    this.optionTotalCount = 0

    this.bundleDeliveryCost = function(countPerDelivery) {
        this.optionTotalCount = 0;
        for (var i = 0; i < this.products.length; i++) {
            var product = this.products[i];
            for (var j = 0; j < product.options.length; j++) {
                var option = product.options[j];
                if(option.isSelected != undefined && option.isSelected) {
                    this.optionTotalCount += option.optionCount;
                } else {
                    option.isSelected = false;
                }
            }
        }
        return this.optionTotalCount / this.countPerDelivery + ((this.optionTotalCount % countPerDelivery > 0)?1:0);
    
    }

    
    this.setDeliveryCost = function (isJeju, isExtra) {
        this.groupPrice = 0;
        for(var i = 0; i < this.products.length; i++) {
            var product = this.products[i];
            
            var isSelect = false;
            for(var j = 0; j < product.options.length; j ++) {
                var option = product.options[j];

                if(option.isSelected) {
                    option.optionTotalPrice = option.optionDiscountPrice * option.optionCount
                    this.groupPrice += option.optionTotalPrice
                    isSelect = true;
                }
            }

            if (isSelect) {
                var boxCount = 1;

                if (product.countPerDelivery != 0 ){
                    boxCount = this.bundleDeliveryCost(product.countPerDelivery);
                }

                if (this.deliveryCost < product.deliveryCost * boxCount) {
                    this.deliveryCost = product.deliveryCost * boxCount;
                    this.deliveryCostProduct = product.productCode
                }

                if (this.deliveryCost2 < product.deliveryCost2 * boxCount) {
                    this.deliveryCost2 = product.deliveryCost2 * boxCount;
                }

                if (this.deliveryCostBasis < product.deliveryCostBasis) {
                    this.deliveryCostBasis = product.deliveryCostBasis;
                }

                if (this.deliveryCost3 < product.deliveryCost3 * boxCount) {
                    this.deliveryCost3 = product.deliveryCost3 * boxCount;
                }

                if (this.deliveryCostBasis != 999999 && this.deliveryCostBasis < this.groupPrice) {
                    this.deliveryCost = 0;
                }
            }
            
            this.setTotalDeliveryCost(isJeju, isExtra);
        }
    }

    
    this.setTotalDeliveryCost = function(isJeju, isExtra) {
        this.totalDeliveryCost = this.deliveryCost;
        this.totalDeliveryCost += (isJeju) ? deliveryCost2 : 0;
        this.totalDeliveryCost += (isExtra) ? deliveryCost3 : 0;
    }

    this.deleteNoneSelectedProduct = function() {
        var selectedProducts = new Array();
        
        for(var i = 0; i < this.products.length; i++) {
            var product = this.products[i];
            var selectedOptions = new Array();
        
            for(var j = 0; j < product.options.length; j++){
                var option = product.options[j];
                if(option.isSelected) {
                    selectedOptions.push(option);
                }
            }
            
            if(selectedOptions.length > 0) {
                product.options = selectedOptions;
                selectedProducts.push(product);

            }
            
        }
        this.products = selectedProducts;
    }

    this.cloneObject = function () {
        var clone = new DeliveryGroupDTO();
        clone.loadingPlace = this.loadingPlace;
        clone.groupPrice = this.groupPrice;
        clone.optionTotalCount = this.optionTotalCount;
        clone.products = JSON.parse(JSON.stringify(this.products));
        clone.deliveryCost = this.deliveryCost;
        clone.deliveryCost2 = this.deliveryCost2;
        clone.deliveryCost3 = this.deliveryCost3;
        clone.isSelected = this.isSelected;
        clone.companyName = this.companyName;
        clone.brandName = this.brandName;
        clone.totalDeliveryCost = this.totalDeliveryCost;

        return clone;
    }

}