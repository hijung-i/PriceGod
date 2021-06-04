$(function() {
    getFaqList();
})

function getFaqList(){
    var params = {};
    ajaxCall(API_SERVER + '/board/getAllFaq', params, 'POST'
    , function(data) {
        console.log(data);;
        var result = data.result;
        $('.faq').html('');

        for(var i = 0; i <result.length; i++){
            var faq = result[i];
            var faqTitleHtml = `
            <div class="faqBox">
                <div class="Faq01">
                    <div class="innerbox">
                        <div class="faq_title">
                            <p><span>${faq.key}</span></p>
                        </div>`;
            for(var j = 0; j < faq.value.length; j++){
                var faqContent = faq.value[j];
                var faqHtml = `<table>
                    <tbody>
                        <tr class="faq_q">
                            <td class="title">
                            ${faqContent.title}
                            <img class="downArrow" src="/images/downarrow_ico_main.png" alt="화살표"></td>
                            <img class="upArrow" src="/images/uparrow_icon.png" alt="화살표">
                            </tr>
                        <tr class="faq_a faq_a01">
                            <td>
                                <div class="faq_a_box"> 
                                    <p>${faqContent.content}</p><p></p>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>`;
                faqTitleHtml += faqHtml;
            }
            faqTitleHtml +='</div></div></div>';
            
            $('.faq').append(faqTitleHtml);
        }
        jQuery(document).ready(function(){
            $("tr.faq_q").click(function() {
                if($(this).next('tr').css("display") != "none") {
                    $(this).next('tr').hide();
                    $(this).removeClass("current");
                } else {
                    $("tr.faq_a").css('display','none');
                    $("tr.faq_q").removeClass("current");
                    $(this).next('tr').show();
                    $(this).addClass("current");
                }
            });
            $(".downArrow").show();
            $(".upArrow").hide();
 
            /*img1을 클릭했을 때 img2를 보여줌*/
            $("tr.faq_q").click(function(){
                $(".downArrow").hide();
                $(".upArrow").show();
            });
 
            /*img2를 클릭했을 때 img1을 보여줌*/
            $("tr.faq_q").click(function(){
                $(".downArrow").show();
                $(".upArrow").hide();
            });
            
        });
        jQuery('tr.faq_q').click(function () {  
            if($(".downArrow").css("display") == "none"){   
                jQuery('.upArrow').css("display", "block");   
            } else {  
                jQuery('.downArrow').css("display", "none");   
            }  
        }); 

        const modal = document.getElementById('modal')

        //Show modal
        open.addEventListener('click', () => {
          modal.classList.add('modal')
        })
        
        //Hide modal
        close.addEventListener('click', () => {
          modal.classList.remove('modal')
        })    

    }, function(err) {
        console.log(err);
    })

}