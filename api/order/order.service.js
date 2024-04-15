import { dbService } from '../../services/db.service.js'
import { loggerService } from '../../services/logger.service.js'
import { asyncLocalStorage } from '../../services/als.service.js'
import mongodb from 'mongodb'
const { ObjectId } = mongodb
async function query(filterBy = {}) {

    try {

        const criteria = _buildCriteria(filterBy)
        const collection = await dbService.getCollection('order')
        const orders = await collection.find(criteria).toArray()

        return orders
    } catch (err) {
        loggerService.error('cannot find orders', err)
        throw err
    }

}

async function remove(orderId) {
    try {
        const store = asyncLocalStorage.getStore()
        const { loggedinUser } = store
        const collection = await dbService.getCollection('order')
        // remove only if user is owner/admin
        const criteria = { _id: new ObjectId(orderId) }
        if (!loggedinUser.isAdmin) criteria.buyer = new ObjectId(loggedinUser._id)
        const { deletedCount } = await collection.deleteOne(criteria)
        return deletedCount
    } catch (err) {
        loggerService.error(`cannot remove order ${orderId}`, err)
        throw err
    }
}

async function update(order) {
    try {
        const orderToSave = {
            status: order.status
        }
        const collection = await dbService.getCollection('order')
        await collection.updateOne({ _id: new ObjectId(order._id) }, { $set: orderToSave })
        return order
    } catch (err) {
        loggerService.error(`cannot update stay ${order._id}`, err)
        throw err
    }
}


async function add(order) {
    try {
        order.buyer._id = new ObjectId(order.buyer._id)
        order.stay._id = new ObjectId(order.stay._id)
        const orderToAdd = {
            ...order,
            hostId: new ObjectId(order.hostId)
        }
        console.log(orderToAdd)
        const collection = await dbService.getCollection('order')
        await collection.insertOne(orderToAdd)
        return orderToAdd
    } catch (err) {
        loggerService.error('cannot insert order', err)
        throw err
    }
}

function _buildCriteria(filterBy) {
    const criteria = {}
    if (filterBy.buyer) criteria.buyer = new ObjectId(filterBy.buyer)
    if (filterBy.hostId)
        criteria.hostId = new ObjectId(filterBy.hostId)
    return criteria
}

export const orderService = {
    query,
    remove,
    add,
    update,
}


