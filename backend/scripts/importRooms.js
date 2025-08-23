import 'dotenv/config'
import fs from 'fs/promises'
import path from 'path'
import connectDB from '../config/mongodb.js'
import Room from '../models/roomModel.js'
import Resort from '../models/resortModel.js'
import CottageType from '../models/cottageTypeModel.js'

const filePath = path.resolve(process.cwd(), '..', 'admin', 'src', 'components', 'rooms', 'allrooms.json')

async function importRooms() {
  await connectDB()

  let raw
  try {
    raw = await fs.readFile(filePath, 'utf8')
  } catch (err) {
    console.error('Failed to read JSON file at', filePath)
    throw err
  }

  let items
  try {
    items = JSON.parse(raw)
  } catch (err) {
    console.error('Failed to parse JSON file', err.message)
    throw err
  }

  let created = 0
  for (const it of items) {
    try {
      const resortDoc = it.resort ? await Resort.findOne({ resortName: it.resort }) : null
      const ctDoc = it.cottageType ? await CottageType.findOne({ name: it.cottageType }) : null

      const roomNumber = it.roomId || it.id || it.roomName || `r-${Date.now()}`
      const price = it.weekdayRate ? Number(it.weekdayRate) : (it.weekendRate ? Number(it.weekendRate) : undefined)

      const roomData = {
        roomNumber,
        roomId: it.roomId,
        price,
        images: it.roomImage ? [{ url: it.roomImage }] : [],
        notes: `roomName:${it.roomName || ''}; guests:${it.guests || ''}; extraGuests:${it.extraGuests || ''}; bedChargeWeekday:${it.bedChargeWeekday || ''}; bedChargeWeekend:${it.bedChargeWeekend || ''}; sourceId:${it.id || ''}`,
      }

      if (resortDoc) roomData.resort = resortDoc._id
      else roomData.notes += `; resortName:${it.resort || ''}`

      if (ctDoc) roomData.cottageType = ctDoc._id
      else roomData.notes += `; cottageTypeName:${it.cottageType || ''}`

      // Skip duplicates by roomId if present
      if (it.roomId) {
        const exists = await Room.findOne({ roomId: it.roomId })
        if (exists) {
          console.log(`Skipping existing room with roomId=${it.roomId}`)
          continue
        }
      }

      const room = new Room(roomData)
      await room.save()
      created++
      console.log(`Created room ${room.roomId || room.roomNumber}`)
    } catch (err) {
      console.error('Failed to import item', it && (it.roomId || it.id || it.roomName), err.message || err)
    }
  }

  console.log(`Import finished. Created ${created} rooms.`)
}

import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)

if (process.argv[1] === __filename) {
  importRooms()
    .then(() => process.exit(0))
    .catch((err) => { console.error(err); process.exit(1) })
}

export default importRooms
