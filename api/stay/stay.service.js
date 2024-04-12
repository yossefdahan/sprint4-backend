import mongodb from 'mongodb'
const { ObjectId } = mongodb

import { dbService } from '../../services/db.service.js'
import { loggerService } from '../../services/logger.service.js'
import { utilService } from '../../services/util.service.js'

// const PAGE_SIZE = 1000

async function query(filterBy = {}) {

    try {

        const criteria = _buildCriteria(filterBy);
        const collection = await dbService.getCollection('stay');
        let options = {
            limit: parseInt(filterBy.limit) || 1000,
            skip: parseInt(filterBy.offset) || 0
        }
        // if (filterBy.txt) {
        //     criteria.name = { $regex: filterBy.txt, $options: 'i' }
        // }

        // if (filterBy.inStock) {
        //     criteria.inStock = (filterBy.inStock === 'true')
        // }

        // if (filterBy.labels && filterBy.labels.length) {
        //     criteria.labels = { $all: filterBy.labels.filter(l => l) }
        // }

        // const collection = await dbService.getCollection('stay')

        // let options = {}

        // if (sortBy.type) {
        //     options.sort = { [sortBy.type]: parseInt(sortBy.dir, 10) }
        // }
        var stays = await collection.find(criteria, options).toArray()
        // if (filterBy.pageIdx !== undefined) {
        //     carCursor.skip(filterBy.pageIdx * PAGE_SIZE).limit(PAGE_SIZE)     
        // }

        return stays
    } catch (err) {
        loggerService.error('cannot find stays', err)
        throw err
    }
}

async function getById(stayId) {
    try {
        const collection = await dbService.getCollection('stay')
        var stay = collection.findOne({ _id: new ObjectId(stayId) })
        return stay
    } catch (err) {
        loggerService.error(`while finding stay ${stayId}`, err)
        throw err
    }
}

async function remove(stayId) {
    try {
        const collection = await dbService.getCollection('stay')
        await collection.deleteOne({ _id: new ObjectId(stayId) })
    } catch (err) {
        loggerService.error(`cannot remove stay ${stayId}`, err)
        throw err
    }
}

async function add(stay) {
    try {
        const collection = await dbService.getCollection('stay')
        await collection.insertOne(stay)
        return stay
    } catch (err) {
        loggerService.error('cannot insert stay', err)
        throw err
    }
}

async function update(stay) {
    try {
        const stayToSave = {
            name: stay.name,
            // importance: stay.importance
            price: stay.price
        }
        const collection = await dbService.getCollection('stay')
        await collection.updateOne({ _id: new ObjectId(stay._id) }, { $set: stayToSave })
        return stay
    } catch (err) {
        loggerService.error(`cannot update stay ${stay._id}`, err)
        throw err
    }
}

async function addStayMsg(stayId, msg) {
    try {
        msg.id = utilService.makeId()
        const collection = await dbService.getCollection('stay')
        await collection.updateOne({ _id: new ObjectId(stayId) }, { $push: { msgs: msg } })
        return msg
    } catch (err) {
        loggerService.error(`cannot add stay msg ${stayId}`, err)
        throw err
    }
}

async function removeStayMsg(stayId, msgId) {
    try {
        const collection = await dbService.getCollection('stay')
        await collection.updateOne({ _id: new ObjectId(stayId) }, { $pull: { msgs: { id: msgId } } })
        return msgId
    } catch (err) {
        loggerService.error(`cannot add stay msg ${stayId}`, err)
        throw err
    }
}

function _buildCriteria(filterBy) {
    // const { labels, region, available_dates, capacity, bathrooms, bedrooms, roomType, price, } = filterBy

    const criteria = {}

    // if (txt) {
    //     criteria.name = { $regex: txt, $options: 'i' }
    // }

    if (filterBy.labels) {
        // Ensure labels is always treated as an array
        const labelsArray = Array.isArray(filterBy.labels) ? filterBy.labels : [filterBy.labels];
        criteria.labels = { $in: labelsArray };
    }

    // if (status) {
    // criteria.inStock = status === 'true' ? true : false
    // }
    // if (status) {
    // criteria.inStock = status === 'true' ? true : false
    // }


    return criteria
}

export const stayService = {
    remove,
    query,
    getById,
    add,
    update,
    addStayMsg: addStayMsg,
    removeStayMsg: removeStayMsg
}
