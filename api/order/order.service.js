import { dbService } from '../../services/db.service.js'
import { loggerService } from '../../services/logger.service.js'
import { asyncLocalStorage } from '../../services/als.service.js'
import mongodb from 'mongodb'
const { ObjectId } = mongodb
async function query(filterBy = {}) {

    try {

        // const criteria = _buildCriteria(filterBy)
        const collection = await dbService.getCollection('order')
        // const orders = await collection.find(criteria).toArray()

        // var orders = await collection.aggregate([
        //     {
        //         $match: criteria
        //     },
        //     {
        //         $lookup:
        //         {
        //             localField: 'buyer',
        //             from: 'user',
        //             foreignField: '_id',
        //             as: 'byUser'
        //         }
        //     },
        //     {
        //         $unwind: '$byUser'
        //     },
        //     {
        //         $lookup:
        //         {
        //             localField: 'hostId',
        //             from: 'toy',
        //             foreignField: '_id',
        //             as: 'toy'
        //         }
        //     },
        //     {
        //         $unwind: '$toy'
        //     },
        //     {
        //         $project: {
        //             _id: true,
        //             txt: 1,
        //             byUser: { _id: 1, fullname: 1 },
        //             toy: { _id: 1, name: 1, price: 1 },
        //         },
        //     },
        // ]).toArray()

        // orders = orders.map(order => {
        //     order.byUser = { _id: order.byUser._id, fullname: order.byUser.fullname }
        //     order.toy = { _id: order.toy._id, name: order.toy.name, price: order.toy.price }
        //     delete order.buyer
        //     delete order.hostId

        //     return order
        // })

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


async function add(order) {
    try {
        const orderToAdd = {
            buyer: new ObjectId(order.buyer),
            hostId: new ObjectId(order.hostId),
            // txt: order.txt
        }
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
    add
}


