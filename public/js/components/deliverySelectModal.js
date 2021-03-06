var deliveryInfoModalTemplate = '';

deliveryInfoModalTemplate += '<div class="i_modal" id="iModal">';
deliveryInfoModalTemplate += '    <div class="modal-content">';
deliveryInfoModalTemplate += '        <div class="modal_ctn">';
deliveryInfoModalTemplate += '            <div class="modalTop_ctn">';
deliveryInfoModalTemplate += '                <div class="modalTop_tit">';
deliveryInfoModalTemplate += '                    <h3>배송지 관리</h3>';
deliveryInfoModalTemplate += '                    <span class="close" @click="closeInfoModal()">&times;</span>';
deliveryInfoModalTemplate += '                </div>';
deliveryInfoModalTemplate += '                <h3 class="order_delMag">배송지 변경</h3>';
deliveryInfoModalTemplate += '            </div>';
deliveryInfoModalTemplate += '            <div class="slim_line_del_switch_modal"></div>';
deliveryInfoModalTemplate += '            <div class="order_list_ctn">';
deliveryInfoModalTemplate += '                <template v-for="(item, i) in deliveryList">';
deliveryInfoModalTemplate += '                    <section class="web_delivery_manage_list">';
deliveryInfoModalTemplate += '                        <div class="del_mng_list_top">';
deliveryInfoModalTemplate += '                            <ul class="del_mng_type">';
deliveryInfoModalTemplate += '                                <li class="type_first">{{ item.addressName }}</li>';
deliveryInfoModalTemplate += '                                <li class="type_second" v-if="item.mainAddressYn == \'Y\'">';
deliveryInfoModalTemplate += '                                    <span class="tema">기본배송지</span>';
deliveryInfoModalTemplate += '                                </li>';
deliveryInfoModalTemplate += '                            </ul>';
deliveryInfoModalTemplate += '                            <ul class="edit_remove">';
deliveryInfoModalTemplate += '                                <template v-if="item.mainAddressYn == \'N\'">';
deliveryInfoModalTemplate += '                                    <li class="basic" v-on:click="changeMainAddress(i)">';
deliveryInfoModalTemplate += '                                        <a>기본배송지로 설정</a>';
deliveryInfoModalTemplate += '                                    </li>';
deliveryInfoModalTemplate += '                                    <li class="small_line"><img src="/images/l_icon_category.png"></li>';
deliveryInfoModalTemplate += '                                </template>';
deliveryInfoModalTemplate += '                                <li class="edit_first">';
deliveryInfoModalTemplate += '                                    <a>수정</a>';
deliveryInfoModalTemplate += '                                </li>';
deliveryInfoModalTemplate += '                                <li class="small_line"><img src="/images/l_icon_category.png"></li>';
deliveryInfoModalTemplate += '                                <li class="edit_second">';
deliveryInfoModalTemplate += '                                    <a v-on:click="deleteDelivery(i)">삭제</a>';
deliveryInfoModalTemplate += '                                </li>';
deliveryInfoModalTemplate += '                            </ul>';
deliveryInfoModalTemplate += '                        </div>';
deliveryInfoModalTemplate += '                        <div class="web_del_mag_list_info">';
deliveryInfoModalTemplate += '                            <div class="top_checkBox_piece">';
deliveryInfoModalTemplate += '                                <input type="radio" name="list" v-on: v-bind:id="\' option1 \' + (i + 2)"';
deliveryInfoModalTemplate += '                                    v-on:change="onDeliveryInfoSelected()" v-bind:value="i"';
deliveryInfoModalTemplate += '                                    v-bind:checked="orderDto.delivery != undefined && item.address == orderDto.delivery.address">';
deliveryInfoModalTemplate += '                                <label v-bind:for="\' option1 \' + (i + 2) "><span></span></label>';
deliveryInfoModalTemplate += '                            </div>';
deliveryInfoModalTemplate += '                            <ul>';
deliveryInfoModalTemplate += '                                <li class="order_info_modal_address">';
deliveryInfoModalTemplate += '                                    <p class="address">{{ item.address }}</p>';
deliveryInfoModalTemplate += '                                </li>';
deliveryInfoModalTemplate += '                                <li>';
deliveryInfoModalTemplate += '                                    <p class="customer_info">{{ item.userName }}';
deliveryInfoModalTemplate += '                                        <span class="small_line"><img';
deliveryInfoModalTemplate += '                                                src="/images/l_icon_category.png"></span>{{';
deliveryInfoModalTemplate += '                                        item.userCellNo }}';
deliveryInfoModalTemplate += '                                    </p>';
deliveryInfoModalTemplate += '                                </li>';
deliveryInfoModalTemplate += '                            </ul>';
deliveryInfoModalTemplate += '                        </div>';
deliveryInfoModalTemplate += '                    </section>';
deliveryInfoModalTemplate += '                </template>';
deliveryInfoModalTemplate += '            </div>';
deliveryInfoModalTemplate += '        </div>';
deliveryInfoModalTemplate += '    </div>';
deliveryInfoModalTemplate += '</div>';

var deliverySelectModal = {
    template: deliveryInfoModalTemplate,
    props: ["orderDto"],
    data: function() {
        return {
            deliveryList: [],
            selectedDeliveryInfo: {}
        }
    },
    methods: {
        openDeliverySelectModal,
        getDeliveryInfoList: function() {
            var component = this;
            ajaxCallWithLogin(API_SERVER + '/user/getDeliveryInfoByUserId', {}, 'POST',
            function(data) {
                component.deliveryList = data.result;
                console.log("deliveryInfoList", data);
            }, function(err) {
                console.log("err", err);
            }, {
                isRequired: true,
                userId: true
            });

        },
        onDeliveryInfoSelected: function() {
            var checked = $('input[type=radio][name=list]:checked');
            this.selectedDeliveryInfo = this.deliveryList[checked.val()];

            this.$emit('delivery-selected', this.selectedDeliveryInfo);
            this.closeInfoModal();
        },
        closeInfoModal: function () {
            app.deliverySelectModalShow = false
            scrollAllow();
        }
        
    }, mounted: function() {
        console.log("mounted", this.orderDto.userId != undefined && this.orderDto.userId != '비회원주문')
        if(this.orderDto.userId === '비회원주문') {
            return
        }
        this.getDeliveryInfoList();
    }
}

function openDeliverySelectModal() {
    app.deliverySelectModalShow = true
    scrollBlock();
}
