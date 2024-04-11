
import fs from 'fs'
import { utilService } from './util.service.js'
import { loggerService } from './logger.service.js'

export const toyService = {
    query,
    getById,
    remove,
    save
}

const toys = utilService.readJsonFile('data/toy.json')

function query(filterBy, sortBy) {
    let toysToShow = toys
    if (!filterBy.txt) filterBy.txt = ''
    const regExp = new RegExp(filterBy.txt, 'i')

    toysToShow = toysToShow.filter(toy => {
        const nameMatches = regExp.test(toy.name)
        let inStockMatches = true
        if (filterBy.inStock === 'true') {
            inStockMatches = toy.inStock === true
        } else if (filterBy.inStock === 'false') {
            inStockMatches = toy.inStock === false
        }
        return nameMatches && inStockMatches
    })
    if (filterBy.labels && filterBy.labels.length) {
        const labelsToFilter = filterBy.labels.filter(l => l)
        toysToShow = toysToShow.filter(toy => labelsToFilter.every(label => toy.labels.includes(label)))
    }

    if (sortBy.type === 'createdAt') {
        toysToShow = toysToShow.sort((b1, b2) => (+sortBy.dir) * (b1.createdAt - b2.createdAt))
    } else if (sortBy.type === 'price') {
        toysToShow = toysToShow.sort((b1, b2) => (+sortBy.dir) * (b1.price - b2.price))
    } else if (sortBy.type === 'name') {
        toysToShow = toysToShow.sort((a, b) => sortBy.dir * a.name.localeCompare(b.name))
    }

    return Promise.resolve(toysToShow)
}

function getById(toyId) {
    const toy = toys.find(toy => toy._id === toyId)
    return Promise.resolve(toy)
}

function remove(_id) {
    const idx = toys.findIndex(toy => toy._id === _id)
    toys.splice(idx, 1)
    _saveToysToFile()
    return Promise.resolve()
}

function save(toy) {
    if (toy._id) {
        const idx = toys.findIndex(currToy => currToy._id === toy._id)
        toys[idx] = { ...toys[idx], ...toy }
    } else {
        toy.createdAt = new Date(Date.now())
        toy._id = utilService.makeId()
        toys.unshift(toy)
    }
    _saveToysToFile()
    return Promise.resolve(toy)
}


function _saveToysToFile() {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify(toys, null, 4)
        fs.writeFile('data/toy.json', data, (err) => {
            if (err) {
                loggerService.error('Cannot write to toys file', err)
                return reject(err)
            }
            resolve()
        })
    })
}
