import { NextFunction, Request, Response, Router } from 'express'
import { globalData } from '../app'

import * as axios from 'axios'
import { DeliveryInfo, SessionUser, User } from '../models/user'
import productService from '../services/productService'
const qs = require('querystring')

const router = Router()
router.get('/', (req: Request, res: Response, next: NextFunction) => {
    const isLoggedIn: boolean | undefined = req.session.isLoggedIn
    if (isLoggedIn === true) {
        console.log('session', req.session)
        console.log('sessionId', req.sessionID)
    }
    render(req, res, 'index', { currentPage: 'main' })
})

router.get('/logout', (req: Request, res: Response, next: NextFunction) => {
    req.session.isLoggedIn = false
    req.session.user = undefined
    req.session.destroy(function() {
        res.redirect('/')
    })
})

router.get('/login-form', (req: Request, res: Response, next: NextFunction) => {
    const isLoggedIn: boolean | undefined = req.session.isLoggedIn
    console.log(isLoggedIn)
    if (isLoggedIn === true) {
        res.redirect('/')
        return
    }
    render(req, res, 'login_new', {})
})
router.get('/sign-up-form', (req: Request, res: Response, next: NextFunction) => {
    const isLoggedIn: boolean | undefined = req.session.isLoggedIn
    console.log(isLoggedIn)
    if (isLoggedIn === true) {
        res.redirect('/')
        return
    }

    const userData: User = req.query

    render(req, res, 'sign_up', { userData })
})

router.get('/product/:productCode', async (req: Request, res: Response, next: NextFunction) => {
    const productCode = req.params.productCode

    const product = await productService.getProductDetail(req.params)

    render(req, res, 'product', { productCode: productCode, product: product })
})

router.get('/products/:companyCode/brand', (req: Request, res: Response, next: NextFunction) => {
    const companyCode = req.params.companyCode

    // brand와 company가 모두 있을 경우 brandCode가 쿼리스트링으로 넘어옴
    const brandCode = req.query.brandCode || ''
    const brandName = req.query.brandName

    render(req, res, 'products', {
        companyCode: companyCode,
        brandCode: brandCode,
        brandName: brandName,
        listType: 'BRAND',
        currentPage: 'brand'
    })
})

router.get('', (req: Request, res: Response, next: NextFunction) => {
    const courierName = req.params.courierName
    const courierNo = req.params.courierNo

    render(req, res, 'product', {
        courierName: courierName,
        courierNo: courierNo,
        listType: 'Delivery',
        currentPage: 'delivery'
    })
})

router.get('/products/:salesStandCode/event', (req: Request, res: Response, next: NextFunction) => {
    const standCode = req.params.salesStandCode

    render(req, res, 'products', {
        standCode: standCode,
        listType: 'EVENT',
        currentPage: 'products'
    })
})
router.get('/products/:category1Code/category/:category2Code', (req: Request, res: Response, next: NextFunction) => {
    const category1Code = req.params.category1Code
    const category2Code = req.params.category2Code

    render(req, res, 'products', {
        category1Code: category1Code,
        category2Code: category2Code,
        listType: 'CATEGORY',
        currentPage: 'category'
    })
})
router.get('/search-form', (req: Request, res: Response, next: NextFunction) => {
    render(req, res, 'search', { currentPage: '검색' })
})
router.get('/search-list', (req: Request, res: Response, next: NextFunction) => {
    const keyword = req.query.keyword

    render(req, res, 'products', {
        keyword: keyword,
        listType: 'SEARCH',
        currentPage: 'search'
    })
})
router.get('/mypage', (req: Request, res: Response, next: NextFunction) => {
    const isLoggedIn = req.session.isLoggedIn || false
    const sessionUser = req.session.user || {}
    console.log('isLoggedIn ->> ', isLoggedIn, sessionUser)

    render(req, res, 'my_page', { isLoggedIn: isLoggedIn, sessionUser, currentPage: '내정보' })
})
router.get('/faq', (req: Request, res: Response, next: NextFunction) => {
    render(req, res, 'faq', {})
})
router.get('/notice', (req: Request, res: Response, next: NextFunction) => {
    render(req, res, 'notice', {})
})
router.get('/pros', (req: Request, res: Response, next: NextFunction) => {
    render(req, res, 'pros', {})
})
router.get('/notice/:boardNo', (req: Request, res: Response, next: NextFunction) => {
    const boardNo = req.params.boardNo
    render(req, res, 'notice_detail', { boardNo: boardNo })
})
router.get('/cs-center', (req: Request, res: Response, next: NextFunction) => {
    render(req, res, 'cs_center', {})
})
router.get('/privacypolicy', (req: Request, res: Response, next: NextFunction) => {
    render(req, res, 'privacy_policy', {})
})
router.get('/invite', (req: Request, res: Response, next: NextFunction) => {
    render(req, res, 'invite', {})
})
router.get('/delivery-info', (req: Request, res: Response, next: NextFunction) => {
    render(req, res, 'delivery_info', {})
})

router.get('/pwdReset', (req: Request, res: Response, next: NextFunction) => {
    render(req, res, 'pwdReset', {})
})
router.get('/order-comp', (req: Request, res: Response, next: NextFunction) => {
    const orderDTO = req.query.requestOrderDTO as string
    res.locals.orderDTO = JSON.parse(qs.unescape(orderDTO))

    render(req, res, 'order/order_complete', {})
})

router.get('/ol_detail/:orderNumber', (req: Request, res: Response, next: NextFunction) => {
    const orderNumber: string = req.params.orderNumber

    if (orderNumber.length > 15 || orderNumber.length < 14) {
        res.send('<script>alert("올바르지 않은 주문번호입니다.");location.href = "/orderlist";</script>')
    } else {
        render(req, res, 'mypage/mypage_orderList_detail', { orderNumber })
    }
})

router.get('/terms', (req: Request, res: Response, next: NextFunction) => {
    render(req, res, 'terms_of_service', {})
})

router.get('/product', (req: Request, res: Response, next: NextFunction) => {
    render(req, res, 'product', {})
})
router.get('/membership', (req: Request, res: Response, next: NextFunction) => {
    render(req, res, 'events/membership', {})
})
router.get('/n_member', (req: Request, res: Response, next: NextFunction) => {
    render(req, res, 'events/new_membership', {})
})
router.get('/f_invite', (req: Request, res: Response, next: NextFunction) => {
    render(req, res, 'events/friend_invite', {})
})
router.get('/f_purchase', (req: Request, res: Response, next: NextFunction) => {
    render(req, res, 'events/first_purchase', {})
})
router.get('/m_save', (req: Request, res: Response, next: NextFunction) => {
    render(req, res, 'events/money_save', {})
})
router.get('/k_friend', (req: Request, res: Response, next: NextFunction) => {
    render(req, res, 'events/kakao_friend', {})
})
router.get('/b_event', (req: Request, res: Response, next: NextFunction) => {
    render(req, res, 'events/birthday_event', {})
})
router.get('/r_event', (req: Request, res: Response, next: NextFunction) => {
    render(req, res, 'events/review_event', {})
})
router.get('/order', (req: Request, res: Response, next: NextFunction) => {
    const sessionUser: SessionUser | undefined = req.session.user

    const deliveryGroupListStr = req.query.deliveryGroupList as string
    const orderDTOStr = req.query.orderDTO as string

    let orderDTO
    let deliveryGroupList
    const deliveryInfo: DeliveryInfo = {
        userId: '',
        userName: '',
        userCellNo: '',
        addressName: '',
        address: '',
        mainAddressYn: ''
    }

    try {
        deliveryGroupList = JSON.parse(qs.unescape(deliveryGroupListStr.replace(/;amp;/gi, '&')))
        orderDTO = JSON.parse(qs.unescape(orderDTOStr.replace(/;amp;/gi, '&')))

        if (req.session.isLoggedIn === true) {
            orderDTO.userId = sessionUser!.userId
            orderDTO.userName = sessionUser!.userName
            orderDTO.userEmail = sessionUser!.userEmail
            orderDTO.userCellNo = sessionUser!.userCellNo
        } else {
            orderDTO.userId = '비회원주문'
        }
    } catch (err) {
        deliveryGroupList = []
        orderDTO = {}
        console.log('GET /order >> error', err)
    }

    orderDTO.delivery = orderDTO.delivery || deliveryInfo
    orderDTO.deliveryDesc = ''
    orderDTO.paidPointAmount = 0
    orderDTO.paidCouponAmount = 0

    render(req, res, 'order/order_info', { deliveryGroupList: JSON.stringify(deliveryGroupList), orderDTO: JSON.stringify(orderDTO) })
})

router.get('/s_inquiry_more', (req: Request, res: Response, next: NextFunction) => {
    render(req, res, 'web_seller_inquiry', {})
})

router.get('/orderlist', (req: Request, res: Response, next: NextFunction) => {
    render(req, res, 'mypage/mypage_orderList', {})
})

router.get('/login-fail', (req: Request, res: Response, next: NextFunction) => {
    render(req, res, 'login_fail', {})
})
router.get('/order-details', (req: Request, res: Response, next: NextFunction) => {
    render(req, res, 'order_details', {})
})
router.get('/sitemap', (req: Request, res: Response, next: NextFunction) => {
    render(req, res, 'sitemap', {})
})
/* 새 화면 추가 보기용 (파일명 임시)*/
router.get('/login002', (req: Request, res: Response, next: NextFunction) => {
    render(req, res, 'login_tracking', {})
})
router.get('/order002', (req: Request, res: Response, next: NextFunction) => {
    render(req, res, 'order_info_point', {})
})
router.get('/kakao-event', (req: Request, res: Response, next: NextFunction) => {
    render(req, res, 'kakao_add', {})
})
router.get('/benefits', (req: Request, res: Response, next: NextFunction) => {
    render(req, res, 'benefits', {})
})
router.get('/intro', (req: Request, res: Response, next: NextFunction) => {
    render(req, res, 'dietfarm', {})
})

const render = (req: Request, res: Response, view: any, data: any | null) => {
    res.locals.isLoggedIn = req.session.isLoggedIn || false
    res.locals.user = req.session.user
    res.locals.webroot = globalData.getBaseDir()
    const defaultData: any = {
        currentPage: ''
    }
    data.currentPage = data.currentPage || ''
    res.render(view, data || defaultData)
}

export default router