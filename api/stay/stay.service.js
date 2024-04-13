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
        console.log('critiria', criteria)
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
            likedByUsers: stay.likedByUsers
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
    // console.log('Filtering by:', filterBy)

    // if (txt) {
    //     criteria.name = { $regex: txt, $options: 'i' }
    // }
    console.log(filterBy)


    if (filterBy.country) {
        criteria['loc.country'] = { $regex: new RegExp(filterBy.country, "i") }
    }

    if (filterBy.region) {
        criteria['loc.region'] = { $regex: new RegExp(filterBy.region, "i") };
    }

    if (filterBy.city) {
        criteria['loc.city'] = { $regex: new RegExp(filterBy.city, "i") }
    }

    if (filterBy.roomType && filterBy.roomType !== 'Any type') {
        criteria.roomType = filterBy.roomType;
    }

    const excludeDate = '2000-01-01';
    if (filterBy.checkIn && filterBy.checkIn !== '0') {
        criteria['dates.checkIn'] = { $lte: utilService.formatDate(filterBy.checkIn), $ne: excludeDate }
    }
    if (filterBy.checkOut && filterBy.checkOut !== '0') {
        criteria['dates.checkOut'] = { $gte: utilService.formatDate(filterBy.checkOut), $ne: excludeDate }
    }
    const totalGuests = parseInt(filterBy.adults) + parseInt(filterBy.children) + parseInt(filterBy.infants) + parseInt(filterBy.pets)
    if (!isNaN(totalGuests)) {
        criteria.capacity = { $gte: totalGuests }
    }
    if (filterBy.minPrice) {
        criteria.price = criteria.price || {}
        criteria.price.$gte = parseFloat(filterBy.minPrice)
    }
    if (filterBy.maxPrice) {
        criteria.price = criteria.price || {}
        criteria.price.$lte = parseFloat(filterBy.maxPrice)
    }
    if (filterBy.bedrooms && parseInt(filterBy.bedrooms) > 0) {
        criteria.bedrooms = { $gte: parseInt(filterBy.bedrooms) }
    }
    if (filterBy.beds && parseInt(filterBy.beds) > 0) {
        criteria.beds = { $gte: parseInt(filterBy.beds) }
    }

    if (filterBy.bathrooms && parseInt(filterBy.bathrooms) > 0) {
        criteria.bathrooms = { $gte: parseInt(filterBy.bathrooms) }
    }



    if (filterBy.labels) {
        const labelsArray = Array.isArray(filterBy.labels) ? filterBy.labels : [filterBy.labels]
        criteria.labels = { $in: labelsArray };
    }
    if (filterBy.amenities) {
        const amenitiesArray = Array.isArray(filterBy.amenities) ? filterBy.amenities : [filterBy.amenities]
        criteria.amenities = { $in: amenitiesArray }
    }




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
