import { loggerService } from '../../services/logger.service.js'
import { socketService } from '../../services/socket.service.js'
import { userService } from '../user/user.service.js'
import { authService } from '../auth/auth.service.js'
import { orderService } from './order.service.js'
export async function getOrders(req, res) {
    try {
        const orders = await orderService.query(req.query)

        res.send(orders)
    } catch (err) {
        loggerService.error('Cannot get orders', err)
        res.status(400).send({ err: 'Failed to get orders' })
    }
}



export async function updateOrder(req, res) {
    try {
        const order = req.body
        console.log(order)
        const updatedOrder = await orderService.update(order)
        socketService.emitToUser({ type: 'order-status', data: order, userId: order.buyer._id })
        res.json(updatedOrder)
    } catch (err) {
        loggerService.error('Failed to update order', err)
        res.status(500).send({ err: 'Failed to update order' })
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
    try {
        var order = req.body
        order.buyer = loggedinUser
        console.log(order.buyer)
        order = await orderService.add(order)

        res.send(order)

    } catch (err) {
        loggerService.error('Failed to add order', err)
        res.status(400).send({ err: 'Failed to add order' })
    }
}

