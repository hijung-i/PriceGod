var postCode = false;


var app = new Vue({
    el: 'main',
    components: {
        'delivery-select-modal': deliverySelectModal
    },
    data: {
        RESOURCE_SERVER,
        deliveryGroupList: '',
        paymentNo: 0,
        usablePoint: 0,
        orderDTO: new OrderDTO(),
        requestDeliveryGroupList: [],
        deliveryGroupList,
        deliveryDescType: 0,
        deliveryList: [],
        couponList: [],
        coupon: {},
        deliverySelectModalShow: false
    }, methods: {
        
        numberFormat,
        paymentAction, 
        descTypeChange: function() {
            var type = $("#selectDeliveryDesc")[0].options.selectedIndex;
            var value = $("#selectDeliveryDesc").val();
            
            if(type == 1) {
                $("#deliveryDesc").removeAttr("disabled");
                $("#deliveryDesc").removeAttr("readonly");
            } else if( type > 1){
                $("#deliveryDesc").removeAttr("disabled");
                $("#deliveryDesc").attr("readonly", "");
            } else if( type == 0) {
                $("#deliveryDesc").attr("disabled", "");
            }
            $('#deliveryDesc').val(value);
        },
        useAllPoint: function() {
            if(this.usablePoint <= ( this.orderDTO.paymentTotalAmount + this.orderDTO.totalDeliveryCost)) {
                this.orderDTO.paidPointAmount = this.usablePoint;
                this.remainingPoint = 0;
            } else if (this.usablePoint > ( this.orderDTO.paymentTotalAmount + this.orderDTO.totalDeliveryCost)) {
                this.orderDTO.paidPointAmount = ( this.orderDTO.paymentTotalAmount + this.orderDTO.totalDeliveryCost);
            }

        },
        pointChange: function() {
            var pointStr = new String(this.orderDTO.paidPointAmount).replace(/[^0-9]/gi, '');
            console.log(pointStr)
            var point = parseInt((pointStr == "")?'0':pointStr);
            this.orderDTO.paidPointAmount = point;
            
        },
        selectPayment: function() {
            $('.order_payment li').removeClass('border-orange')
            $('.order_payment li:nth-child('+ app.paymentNo +')').addClass('border-orange')
        },
        formatDate,
        applyCoupon,
        onDeliveryInfoSelected: function(data) {
            var selectedDelivery = Object.assign({}, data);this.orderDTO.delivery = selectedDelivery;
            
            checkDeliveryAddress(this);
        }
        ,openZipSearch
    },
    computed: {
        remainingPoint: {
            get: function() {
                var beforePointAmount = this.orderDTO.paymentTotalAmount + this.orderDTO.totalDeliveryCost - this.orderDTO.paidCouponAmount
                var remainingPoint = this.usablePoint - this.orderDTO.paidPointAmount;
                
                console.log(beforePointAmount, this.orderDTO.paidPointAmount, remainingPoint)
                if (beforePointAmount < this.orderDTO.paidPointAmount) {
                    this.orderDTO.paidPointAmount = (this.orderDTO.paymentTotalAmount + this.orderDTO.totalDeliveryCost);
                    remainingPoint = this.usablePoint - this.orderDTO.paidPointAmount;
                }
                if(remainingPoint < 0) {
                    this.orderDTO.paidPointAmount = this.usablePoint;
                    remainingPoint = 0;
                }
                
                var paymentAmount = this.orderDTO.paymentTotalAmount + this.orderDTO.totalDeliveryCost
                var discountAmount = this.orderDTO.paidCouponAmount + this.orderDTO.paidPointAmount

                this.orderDTO.paidRealAmount = paymentAmount - discountAmount;
                var withoutDeliveryCost = this.orderDTO.paidRealAmount - this.orderDTO.totalDeliveryCost

                this.orderDTO.accumulatePoint = 0;
                
                Array.from(this.deliveryGroupList).forEach(dGroup => { 
                    Array.from(dGroup.products).forEach(product => {
                        // ????????????, ???????????? ????????? 10,000?????????
                        var totalCount = 0
                        var optionTotalPrice = 0
                        
                        for(var k = 0; k < product.options.length; k++){
                            var option = product.options[k];
                            
                            totalCount += option.optionCount;
                            optionTotalPrice += option.optionTotalPrice;
                        }

                        if (product.productCode == "P00879" || product.productCode == "P00982") {
                            product.accumulatePoint 
                                = Math.round(((totalCount * 10000) / this.orderDTO.paymentTotalAmount) * (withoutDeliveryCost))
                        } else {
                            product.accumulatePoint 
                                = Math.round((optionTotalPrice / this.orderDTO.paymentTotalAmount) * (withoutDeliveryCost) * 0.03)
                        }
                        if(withoutDeliveryCost <= 0) {
                            product.accumulatePoint = 0
                        }
                    
                        this.orderDTO.accumulatePoint += product.accumulatePoint;
                    })
                })

                return remainingPoint;
            },
            set: function(x) {
                return x;
            }
        },
        usableCouponCount: function() {
            var count = 0;
            for(var i = 0; i < this.couponList.length; i++) {
                var coupon = this.couponList[i];

                if(checkCouponUsable(coupon, false)) count++;
            }
            return count;
        }
    },
    created: function() {
        var deliveryGroupList = $('#deliveryGroupList').val();
    
        this.deliveryGroupList = JSON.parse(deliveryGroupList);
        this.orderDTO = JSON.parse((($('#orderDTO').val() != undefined)?$('#orderDTO').val():'{}'));

        
        // ????????? ?????? ?????? ??????
        var userCellNo = this.orderDTO.userCellNo
        if(/^[0-9]{2,3}[0-9]{3,4}[0-9]{4}/.test(userCellNo)) {
            console.log('valid');
        } else {
            console.log('invalid')
            // ????????? ?????????????????? ??????????????? ???
            this.orderDTO.userCellNo = undefined
        }
        
        this.orderDTO.products = new Array();
        
        if(this.deliveryGroupList.length == 0) {
            alert('????????? ?????? ???????????????.');
            history.back();
            return;
        }

        for(var i = 0; i < this.deliveryGroupList.length; i++) {

            var dGroup = Object.assign(new DeliveryGroupDTO(), this.deliveryGroupList[i]);
            this.deliveryGroupList[i] = dGroup
            for(var j = 0; j < dGroup.products.length; j++) {
                this.orderDTO.products.push(dGroup.products[j]);
            }
        }
        
        getLogin();
    }
})

function getLogin() {
    ajaxCall('/user/login', '', 'GET', function(data){
        var isLoggedIn = data.result.isLoggedIn;

        if(isLoggedIn) {
            if(app.orderDTO.delivery.address == '') getDefaultDeliveryInfo(app);
            getUsablePointAmount();
            getUsableCouponList();
        }
    }, function(err){
        console.log("err", err);
    })
}

function getUsablePointAmount() {
    var params = {};
    ajaxCallWithLogin(API_SERVER + '/point/getUsablePointByUserId', params, 'POST',
    function(data) {
        app.usablePoint = data.result;

        console.log("success usablePoint", data);
    }, function(err) {
        console.log("error", err)
    },
    {
        isRequired: true,
        userId: true
    })
}

function paymentAction() {   
    var agreementPay = $('#agreementPay')[0].checked;

    if(agreementPay != true) {
        alert('?????? ?????? ??? ?????? ????????? ?????????????????????.')
        return;
    }

    var orderTitle = orderTitle = app.deliveryGroupList[0].products[0].options[0].optionDesc;
 
    var requestOrderDTO = {};

    requestOrderDTO.paymentNo = app.paymentNo;

    requestOrderDTO.userId = app.orderDTO.userId;
    requestOrderDTO.userName = app.orderDTO.userName;
    requestOrderDTO.userEmail = app.orderDTO.userEmail;
    requestOrderDTO.userCellNo = app.orderDTO.userCellNo;

    
    if(app.orderDTO.userId == '???????????????') {
        requestOrderDTO.userName = $('#unName').val();
        requestOrderDTO.userCellNo = $('#unCellNo').val();
        requestOrderDTO.userEmail = $('#unEmail').val();
    }
    
    requestOrderDTO.delivery = app.orderDTO.delivery

    if(requestOrderDTO.delivery == undefined 
        || requestOrderDTO.delivery.deliveryNo == undefined 
        || requestOrderDTO.delivery.deliveryNo == 0) {
        var delivery = {
            userName: $('#unReceiverName').val(),
            address: $('#unAddr').val() + $('#unAddr2').val(),
            userCellNo: $('#unDeliveryUserCellNo').val()
        }
        requestOrderDTO.delivery = delivery;
    }

    requestOrderDTO.deliveryDesc = $("#selectDeliveryDesc").val();

    if($("#selectDeliveryDesc").val() == "") {
        requestOrderDTO.deliveryDesc = $('#deliveryDesc').val()
    }
    if(requestOrderDTO.userName == '' || requestOrderDTO.userName == undefined) {
        alert('????????? ????????? ??????????????????');
        return;
    }
    if(requestOrderDTO.userCellNo == '' || requestOrderDTO.userCellNo == undefined) {
        alert('????????? ??????????????? ??????????????????');
        return;
    }
    if(requestOrderDTO.userEmail == '' || requestOrderDTO.userEmail == undefined) {
        alert('????????? ????????? ????????? ??????????????????');
        return;
    }

    if(requestOrderDTO.delivery.address == '' || requestOrderDTO.delivery.address == undefined) {
        alert('????????? ????????? ????????????.')
        return;
    }
    
    if(requestOrderDTO.delivery.userName == '' || requestOrderDTO.delivery.userName == undefined) {
        alert('????????? ????????? ????????????.')
        return;
    }
    
    if(requestOrderDTO.delivery.userCellNo == '' || requestOrderDTO.delivery.userCellNo == undefined) {
        alert('????????? ??????????????? ??????????????????.')
        return;
    }
    
 
    var items = new Array();
    var count = 0;

    for(var i = 0; i < this.deliveryGroupList.length; i++) {
        var dGroup = this.deliveryGroupList[i];
        for(var j = 0; j < dGroup.products.length; j++) {
            var product = dGroup.products[j];
            for(var k = 0; k < product.options.length; k++) {
                var option = product.options[k];

                var item = {
                    item_name: option.optionDesc,
                    qty: option.optionCount,
                    unique: option.optionCode,
                    price: option.optionTotalPrice
                }
                count++;
                items.push(item);
            }
        }
    }
    if(count > 1){
        orderTitle += ' ??? '+ count + '???';
    }
    requestOrderDTO.orderTitle = orderTitle;
    requestOrderDTO.items = items;

    


    requestOrderDTO.paidRealAmount = app.orderDTO.paidRealAmount;

    requestOrderDTO.products = app.orderDTO.products;
    requestOrderDTO.paymentTotalAmount = app.orderDTO.paymentTotalAmount;
    requestOrderDTO.couponNo = app.orderDTO.couponNo;
    
    
    requestOrderDTO.paidRealAmount = app.orderDTO.paidRealAmount;
    requestOrderDTO.paidCouponAmount = app.orderDTO.paidCouponAmount;
    requestOrderDTO.paidPointAmount = app.orderDTO.paidPointAmount;
    requestOrderDTO.accumulatePoint = app.orderDTO.accumulatePoint;

    var mobile = /iphone|ipod|ipad|android/;
    var userAgent = window.navigator.userAgent.toLowerCase();
    requestOrderDTO.accessPoint = 'P';
    
    if(mobile.test(userAgent)) {
        requestOrderDTO.accessPoint = 'M';
    }

    if(requestOrderDTO.products == undefined || requestOrderDTO.products.length < 1) {
        return;
    }

    if(app.orderDTO.paidRealAmount == 0) {
        requestOrderDTO.paymentName = '?????????????????????'
        requestOrderDTO.confirm = 'Y'

        addOrder(requestOrderDTO);
    } else {
        if(app.paymentNo == undefined || app.paymentNo == 0) {
            alert('?????? ????????? ??????????????????');
            return;
        }

        // addOrder ?????? ??????
        requestOrderDTO.confirm = 'N'
        addOrder(requestOrderDTO);

    }

}

function paymentConfirm(requestOrderDTO) {
    var params = {
        applicationId: '5feae25e2fa5c2001d0391bc',
        privateKey: 'x1fCHsPFCxsLjJSsNpN7YPnyMF0mk6NCh0kVMub2sHg=',
        receiptId: requestOrderDTO.receiptId,
        paidRealAmount: requestOrderDTO.paidRealAmount,
        orderNumber: requestOrderDTO.orderNumber,
        paymentName: requestOrderDTO.paymentName
    }

    ajaxCall(API_SERVER + '/order/paymentConfirm', params, 'POST',
    function(data) {
        console.log("success", data);
        switch(data.message) {
            case 'SUCCESS':
                // addOrder(requestOrderDTO);
                // TODO: update receiptId and orderStatus = P 
                alert('?????? ????????? ??????????????????.')
                location.href=("/order-comp?requestOrderDTO="+JSON.stringify(requestOrderDTO)).trim();
                break;
            case 'NOT_MATCHED':
                paymentCancel('paymentConfirm ??????', requestOrderDTO);
                break;
        }
    }, function(err){
        console.log("error", err);
    })
}

function paymentCancel(reason, requestOrderDTO) {
    var params = {
        applicationId: '5feae25e2fa5c2001d0391bc',
        privateKey: 'x1fCHsPFCxsLjJSsNpN7YPnyMF0mk6NCh0kVMub2sHg=',
        receiptId: requestOrderDTO.receiptId,
        paidRealAmount: requestOrderDTO.paidRealAmount,
        name: requestOrderDTO.userName,
        reason: reason,
        cancel_id: Math.floor(new Date().getTime() + (Math.random() * 1000 + 1))
    }
    ajaxCall('https://api.bootpay.co.kr/cancel', params, 'POST', 
    function(data){
        console.log("payment canceled", data, 'params => ', params);
    }, function( err) {
        console.log("error while payment canceling", err, 'params = > ', params);
    })
}

function addOrder(requestOrderDTO) {
    ajaxCall(API_SERVER + '/order/addOrder', requestOrderDTO, 'POST',
    function(data) {
        console.log("success", data);
        switch(data.message) {
            case 'SUCCESS':
                requestOrderDTO.orderNumber = data.result;

                if(requestOrderDTO.paidRealAmount != undefined && requestOrderDTO.paidRealAmount > 0) {
                    bootpayModule(requestOrderDTO);
                } else {
                    alert('?????? ????????? ??????????????????.')
                    location.href=("/order-comp?requestOrderDTO="+JSON.stringify(requestOrderDTO)).trim();
                }
                break;
            case 'NOT_MATCHED':
                alert('?????? ??????, ?????? ??????')
                paymentCancel('addOrder ??????', requestOrderDTO);
                break;
        }
    }, function(err){
        alert('?????? ??????(err), ?????? ??????')
        paymentCancel('addOrder ??????', requestOrderDTO);
        console.log("error", err);
    })
}

function bootpayModule(requestOrderDTO){
    var methods = ['npay', 'bank', 'kakao', 'card', 'phone'];
    var method = methods[app.paymentNo -1];

    var nowDate = new Date();
    var expireDate = new Date(nowDate.getTime() + (60 * 60 * 24 * 1000 * 3));

    var month = ((((expireDate.getMonth() + 1) / 10) >= 1)?expireDate.getMonth() + 1: '0'+(expireDate.getMonth() +1));
    var date = (((expireDate.getDate()) / 10) > 0)?expireDate.getDate(): '0'+(expireDate.getDate())
    
    var accountExpireAt = expireDate.getFullYear() + '-' + month +'-' + date  

    var bootpayParams = {
        price: requestOrderDTO.paidRealAmount,
        application_id: "5feae25e2fa5c2001d0391b9",
        name: requestOrderDTO.orderTitle,
        pg: 'nicepay',
        method: method,
        show_agree_window: 0, // ???????????? ?????? ?????? ??? ????????? ??????
        items: requestOrderDTO.items,
        user_info: {
            username: requestOrderDTO.userId,
            email: requestOrderDTO.userEmail,
            addr: requestOrderDTO.address,
            phone: requestOrderDTO.userCellNo
        },
        order_id: 'ORDER_WEB', //?????? ???????????????, ???????????? ?????? ??????????????? ?????????.
        params: {

        },
        account_expire_at: accountExpireAt, // ???????????? ???????????? ?????? ( yyyy-mm-dd ???????????? ??????????????????. ??????????????? ???????????????. )
        extra: {
            vbank_result: 1, // ???????????? ????????? ??????, ???????????? ???????????? ??????(1), ??????(0), ???????????? ???(1)
            quota: [0,2,3], // ??????????????? 5?????? ????????? ???????????? ??????????????? ????????? ??? ??????, [0(?????????), 2??????, 3??????] ??????, ???????????? 12???????????? ??????,
            theme: 'purple', // [ red, purple(??????), custom ]
            custom_background: '#00a086', // [ theme??? custom ??? ??? background ?????? ?????? ?????? ]
            custom_font_color: '#ffffff' // [ theme??? custom ??? ??? font color ?????? ?????? ?????? ]
        }
    }
    
    BootPay.request(
        bootpayParams
    ).error(function (data) {
        //?????? ????????? ????????? ???????????? ???????????????.
        console.log(data);
        alert('????????? ??????????????????.');
        location.href="";
    }).cancel(function (data) {
        //????????? ???????????? ???????????????.
        alert('????????? ?????????????????????.');
        console.log(data);
    }).ready(function (data) {
        // ???????????? ?????? ??????????????? ???????????? ???????????? ???????????????.
        console.log(data);
    }).confirm(function (data) {
        console.log(data);
        var enable = true; // ?????? ?????? ?????? ?????? ?????? ?????? ??????
        if (enable) {
            BootPay.transactionConfirm(data); // ????????? ????????? ?????? ????????? ??????.
        } else {
            BootPay.removePaymentWindow(); // ????????? ?????? ????????? ?????? ?????? ?????? ????????? ???????????? ?????????.
        }
    }).close(function (data) {
        // ???????????? ????????? ???????????????. (??????,??????,????????? ???????????? ?????? ?????????)
        console.log(data);
    }).done(function (data) {
        //????????? ??????????????? ???????????? ???????????????
        //???????????? ????????? ???????????? ?????? ?????? ????????? ????????? ????????? ???????????????.
        console.log(data);

        requestOrderDTO.cashReceiptYn = 'N'
        if(data.cash_result != undefined && data.cash_result != '') {
            requestOrderDTO.cashReceiptYn = 'Y'
        }
        
        requestOrderDTO.paymentName = data.payment_name;
        requestOrderDTO.paymentDate = data.purchased_at;
        requestOrderDTO.cardName = (data.card_name == undefined)?'':data.card_name;
        requestOrderDTO.cardNo = (data.card_no == undefined)?'':data.card_no;
        requestOrderDTO.cardQuota = (data.card_quota == undefined)?0:data.card_quota;

        requestOrderDTO.receiptId = data.receipt_id;

        paymentConfirm(requestOrderDTO);
    });
}

function openZipSearch(comp) {
    $('#unAddr').val('');
    if(postCode) return;

    postCode = true;
    var doubleClick = false;
    new daum.Postcode({
        oncomplete: function(data) {
            doubleClick = true
            if(!doubleClick) {
                return false;
            }

            var address = data.zonecode + ", " + data.roadAddress + " ("+ data.bname +") ";
            $('#unAddr').val(address);

            checkDeliveryAddressNoneMember();
            doubleClick = true
            postCode = false;
        },
        onclose: function() {
            postCode = false;
        }
    }).open();
}

function getUsableCouponList() {
    
    ajaxCallWithLogin(API_SERVER + '/product/getCouponList', {}, 'POST', 
    function(data) {
        var usableCoupon = new Array();
        for(var i = 0; i < data.result.length; i++) {
            var coupon = data.result[i];
            if(coupon.couponStatus == 'A') usableCoupon.push(data.result[i])
        }

        app.couponList = usableCoupon;
    }, function(err) {
        console.error("get usable coupon list ", err);
    }, {
        isRequired: true,
        userId: true
    })
}

function openCouponModal() {
    $('#c_Modal').show();
}

function closeCouponModal() {
    $('#c_Modal').hide();
}

function applyCoupon(idx) {
    selectedCoupon = app.couponList[idx]
    if(!checkCouponUsable(selectedCoupon)) {
        alert("????????? ????????? ??? ????????????.");
        return
    }
    
    app.coupon = selectedCoupon
    app.orderDTO.couponNo = selectedCoupon.couponNo
    switch (selectedCoupon.couponType) {
        case "P":
            app.orderDTO.paidCouponAmount = selectedCoupon.amount
            break;
        case "R":
            app.orderDTO.paidCouponAmount = app.orderDTO.paymentTotalAmount / 100 * selectedCoupon.rate
            if(app.orderDTO.paidCouponAmount > selectedCoupon.maxAmount) {
                app.orderDTO.paidCouponAmount = selectedCoupon.maxAmount;
            }
            break;
        case "D":
            app.orderDTO.paidCouponAmount = app.orderDTO.totalDeliveryCost
            break;
    }
    alert('????????? ?????????????????????.');
    closeCouponModal();
}

function formatDate(strDate) {
    if(strDate != undefined && typeof(strDate) == typeof('')) {
        return strDate.substr(0, 10);
    }
    return ''
}

function checkCouponUsable(coupon, alert) {
    if(coupon.couponName == undefined) {
        return;
    }

    if(coupon.conditionalAmount > app.orderDTO.paymentTotalAmount) {
        if(alert) alert("?????? ?????????" + numberFormat(selectedCoupon.conditionalAmount) + "??? ?????? ?????? ??? ?????? ???????????????.");

        return false;
    }

    if(coupon.couponType == 'D' && app.orderDTO.totalDeliveryCost == 0)  {
        if(alert) alert("????????? ???????????? ????????????.");
        return false;
    }

    return true;
}
// ??? ?????? 
$(function(){
    $('#goingTo_top').on('click',function(e){
        e.preventDefault();
        $('html,body').animate({scrollTop:0},600);
    });
    var navHeight = $("html,body").height(); 

    $("#goingTo_top").hide();

    $(window).scroll(function(){ 
        var rollIt = $(this).scrollTop() >= navHeight; 

        if(rollIt){ 
	        $("#goingTo_top").show().css({"position":"fixed"});
        }
        else{
            $("#goingTo_top").hide();
        }
    });
    
});

function checkDeliveryAddressNoneMember() {
    var address = $('#unAddr').val().trim();
    var params = {
        address: address
    };

    if(address == '') return;

    ajaxCall(API_SERVER + '/user/checkDeliveryAddressNoneMembership', params, 'POST',
    function(data) {
        var result = data.result;
        result.address = address;
    
        var totalDelivertCost = updateDeliveryCost(app.deliveryGroupList, result);

        app.orderDTO.totalDeliveryCost = totalDelivertCost
        
    }, function(err) {
        console.log("error", err);
    }, {
        isRequired: true,
        userId: true
    })

}
