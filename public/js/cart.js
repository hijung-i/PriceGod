var isJeju = false, isExtra = false;

var deliveryGroupList = new Array();
var cartList = new Array();


var app = new Vue({
    el: 'main',
    components: {
        'delivery-select-modal': deliverySelectModal
    },
    data: {
        RESOURCE_SERVER,
        API_SERVER,
        checkAll: true,
        orderDTO: new OrderDTO(),
        requestDeliveryGroupList: [],
        cartList,
        deliveryGroupList,
        deliverySelectModalShow: false
    },
    methods: {
        numberFormat,
        onCheckAllChange: function() {
            checkAll = $('#checkAll')[0].checked;
            for(var i = 0; i < this.deliveryGroupList.length; i++) {
                for(var j = 0; j < this.deliveryGroupList[i].products.length; j++) {
                    var product = this.deliveryGroupList[i].products[j];
                    for(var k = 0; k < product.options.length; k++) {
                        product.options[k].isSelected = $('#checkAll')[0].checked;
                    }
                }
            }
            this.updateOrderInfo();
        },
        updateOrderInfo: function (option) {
            if(option != undefined && !option.isSelected) {
                // TODO: 전체 선택 해제
                $('#checkAll')[0].checked = false;
            }

            console.log(isJeju, isExtra);

            // TODO: 상품 묶음 배송(DeliveryGroup) 정보에 따라
            this.deliveryGroupList = [];
        
            for(var i = 0; i < cartList.length; i++) {
                var product = cartList[i];
                var isSameGroup = false;
                for(var j = 0; j < this.deliveryGroupList.length; j++) {
                    var deliveryGroup = this.deliveryGroupList[j];
                    if(product.loadingPlace == deliveryGroup.loadingPlace && product.brandCode == deliveryGroup.brandCode) {
                        deliveryGroup.products.push(product);
                        deliveryGroup.setDeliveryCost(isJeju, isExtra);
                        isSameGroup = true
                        break
                    }
                }
                
                if(!isSameGroup) {
                    var deliveryGroup = new DeliveryGroupDTO();
                    deliveryGroup.products.push(product);
                    deliveryGroup.loadingPlace = product.loadingPlace;
                    deliveryGroup.brandCode = product.brandCode;
                    deliveryGroup.companyName = product.companyName;
                    deliveryGroup.brandName = product.brandName;
                    deliveryGroup.setDeliveryCost(isJeju, isExtra);
                    this.deliveryGroupList.push(deliveryGroup);
                }
            }
        
            this.orderDTO.paymentTotalAmount = 0;
            this.orderDTO.deliveryCost = 0;
            for (var i = 0; i < this.deliveryGroupList.length; i++) {
                var it = this.deliveryGroupList[i];
                this.orderDTO.paymentTotalAmount += it.groupPrice;
                this.orderDTO.deliveryCost += it.deliveryCost;
                if (isJeju) {
                    this.orderDTO.deliveryCost2 += it.deliveryCost2;
                }
                if (isExtra) {
                    this.orderDTO.deliveryCost3 += it.deliveryCost3;
                }
                this.orderDTO.totalDeliveryCost = this.orderDTO.deliveryCost + this.orderDTO.deliveryCost2 + this.orderDTO.deliveryCost3;
            }
        },
        changeOptionCount: function (plus, gIdx, pIdx, oIdx) {
            var cartItem = this.deliveryGroupList[gIdx].products[pIdx].options[oIdx]
            if(plus) {
                cartItem.optionCount += 1
            } else {
                if(cartItem.optionCount <= 1) {
                    alert('최소 수량은 1개입니다.');
                    return;
                }
                cartItem.optionCount -= 1;   
            }
            // 옵션 수량 변경사항 저장
            var requestCartList = { 
                options: [cartItem]
            }

            ajaxCall(API_SERVER + '/order/onChangeOptionCount', requestCartList, 'POST',
            function(data) {
                console.log('on change option count', data);
            }, function(err) {
                console.log(err);
            })
            
            app.updateOrderInfo();
        },
        getCartItemList: function () {
            var params = {};
            ajaxCallWithLogin(API_SERVER + '/order/getCartInfoByUserID', params, 'POST',
            function(data) {
                cartList = data.result;
                for(var j = 0; j < cartList.length; j++) {
                    var product = cartList[j];
                    for(var k = 0; k < product.options.length; k++) {
                        product.options[k].isSelected = app.checkAll;
                    }
                }
                                
                app.updateOrderInfo();
        
            }, function(err) {
                console.log("error while get cartinfo", err);
            }, {
                isRequired: true,
                userId: true
            })
        },
        onSubmit: function() {
            var requestDeliveryGroupList = new Array();
            for(var i = 0; i < this.deliveryGroupList.length; i++) {
                var deliveryGroup = this.deliveryGroupList[i];
                var requestDeliveryGroup = deliveryGroup.cloneObject();
                requestDeliveryGroup.deleteNoneSelectedProduct();

                if(requestDeliveryGroup.products.length > 0) {
                    requestDeliveryGroupList.push(requestDeliveryGroup);  
                }
            }

            if(requestDeliveryGroupList.length < 1) {
                alert('상품을 선택해주세요.')
                return false;
            }

            for(var i = 0; i < requestDeliveryGroupList.length; i++) {
                
                var group = requestDeliveryGroupList[i];
                for(var j = 0; j < group.products.length; j++) {
                    var product = group.products[j];
                    if(product.productCode == group.deliveryCostProduct) {
                        product.isDelivery = true
                        product.deliveryCost = group.deliveryCost
                        product.deliveryCost2 = group.deliveryCost2
                        product.deliveryCost3 = group.deliveryCost3
                    } else {
                        product.deliveryCost = 0
                        product.deliveryCost2 = 0
                        product.deliveryCost3 = 0
                    }
                }
            }

            location.href="/order?deliveryGroupList=" + JSON.stringify(requestDeliveryGroupList)+'&orderDTO='+ JSON.stringify(this.orderDTO);
        },
        deleteSelectedItems: function() {
            var products = new Array();
            for(var i = 0; i < this.deliveryGroupList.length; i++) {
                var deliveryGroup = this.deliveryGroupList[i];
                var requestDeliveryGroup = deliveryGroup.cloneObject();
                requestDeliveryGroup.deleteNoneSelectedProduct();

                for(var j = 0; j < requestDeliveryGroup.products.length; j++){
                    products.push(requestDeliveryGroup.products[j]);
                }

            }
            
            var params = {
                products
            }

            ajaxCallWithLogin(API_SERVER + '/order/deleteCart', params, 'POST', 
            function(data) {
                console.log('success', data);
                app.checkAll = false;
                app.getCartItemList();
            }, function (err){
                console.log("err", err);
            }, {
                isRequired: true,
                userId: true
            })
        }, deleteItem: function(dIdx, pIdx, oIdx) {
            var products = new Array();
            var requestDeliveryGroup = this.deliveryGroupList[dIdx].cloneObject();

            var currentProduct = requestDeliveryGroup.products[pIdx];

            for(var i = 0; i < currentProduct.options.length; i++) {
                if(i == oIdx) {
                    continue;
                }
                currentProduct.options[i].isSelected = false;
            }
            requestDeliveryGroup.deleteNoneSelectedProduct();
            products = requestDeliveryGroup.products;
            
            var params = {
                products
            }
            ajaxCallWithLogin(API_SERVER + '/order/deleteCart', params, 'POST', 
            function(data) {
                console.log('success', data);
                app.checkAll = false;
                app.getCartItemList();
            }, function (err){
                console.log("err", err);
            }, {
                isRequired: true,
                userId: true
            })
        },
        onDeliveryInfoSelected: function(data) {
            console.log("event 발생", data);
            var selectedDelivery = Object.assign({}, data);
            this.orderDTO.delivery = selectedDelivery;

            checkDeliveryAddress(this);
        }
        
    }, created: function() {

        this.getCartItemList()
        getDefaultDeliveryInfo(this)
    }
});

function getSelectedOptionIndexes(ele) {
    var id = $(ele).attr("id").split("-");

    var prd = id[0].substring('prd_'.length);
    var opt = id[1].substring('opt_'.length);
    
    return [prd, opt];
}