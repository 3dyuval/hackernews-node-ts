import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
import type { Root } from './api'



const keys = ['created_at', 'title', 'url',]

const add = (query, entry) => prisma.link.create({ data: {
    createdAt: entry[keys[0]],
    description: entry[keys[1]],
    url: entry[keys[2]],
    topic: query
}})

async function getData (query) {

    const data  = await fetch(`http://hn.algolia.com/api/v1/search?query=${query}&tags=story`)
    .then(response => response.json()).catch(console.error)

    const hits: Root[] = data.hits

    if (!hits) {
        console.error('hits not ok', {hits})
        return 
    }
    let result = new Array()
    for (let entry of hits) {
        if (keys.every(item => item in entry && !!entry[item])) {
            const response = await add(query, entry)
            result.push(response)
        } else {
            console.warn('not ok',{entry})
        }
    }

    console.log('ok', {result})

}

getData('chrome')
getData('development')
getData('fun')


