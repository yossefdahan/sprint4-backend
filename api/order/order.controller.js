import { loggerService } from '../../services/logger.service.js'
import { socketService } from '../../services/socket.service.js'
import { userService } from '../user/user.service.js'
import { authService } from '../auth/auth.service.js'
import { orderService } from './order.service.js'
import { stayService } from '../stay/stay.service.js'
export async function getOrders(req, res) {
    try {
        const orders = await orderService.query(req.query)

        res.send(orders)
    } catch (err) {
        loggerService.error('Cannot get orders', err)
        res.status(400).send({ err: 'Failed to get orders' })
    }
}

export async function deleteOrder(req, res) {
    try {
        const deletedCount = await orderService.remove(req.params.id)

        if (deletedCount === 1) {
            res.send({ msg: 'Deleted successfully' })
        } else {
            res.status(400).send({ err: 'Cannot remove order' })
        }
    } catch (err) {
        loggerService.error('Failed to delete order', err)
        res.status(400).send({ err: 'Failed to delete order' })
    }
}


export async function addOrder(req, res) {
    const loggedinUser = authService.validateToken(req.cookies.loginToken)
    // var { loggedinUser } = req

    try {
        var order = req.body
        order.buyer = loggedinUser
        order = await orderService.add(order)
        // order.stay = await stayService.getById(order.stayId)

        // console.log(loggedinUser);
        // loggedinUser = await userService.getById(loggedinUser)
        order.hostId = order.stay.host._id
        // console.log(loggedinUser);
        // User info is saved also in the login-token, update it
        // const loginToken = authService.getLoginToken(loggedinUser)
        // res.cookie('loginToken', loginToken)

        delete order.stayId
        delete order.buyer

        // socketService.broadcast({ type: 'order-added', data: order, buyer: loggedinUser._id })
        // socketService.emitToUser({ type: 'order-about-you', data: order, buyer: order.stay._id })

        // const fullUser = await userService.getById(loggedinUser._id)
        // socketService.emitTo({ type: 'user-updated', data: fullUser, label: fullUser._id })

        res.send(order)

    } catch (err) {
        loggerService.error('Failed to add order', err)
        res.status(400).send({ err: 'Failed to add order' })
    }
}

