import 'dotenv/config'
import fs from 'fs/promises'
import path from 'path'
import connectDB from '../config/mongodb.js'
import TentType from '../models/tentTypeModel.js'
import Resort from '../models/resortModel.js'
import { fileURLToPath } from 'url'

// We'll resolve the JSON path using a couple of strategies and pick the first that exists.
// This avoids depending on the caller's current working directory.
let resolvedJsonPath // will be chosen at runtime inside importTents()

// Simple CLI args parsing: support --uri or -u to provide MONGODB_URI and --dry-run to prevent DB writes
const argv = process.argv.slice(2)
let dryRun = false
for (const a of argv) {
  if (a === '--dry-run') dryRun = true
  if (a.startsWith('--uri=')) process.env.MONGODB_URI = a.split('=')[1]
  if (a.startsWith('-u=')) process.env.MONGODB_URI = a.split('=')[1]
}

// also support -u <uri> or --uri <uri>
for (let i = 0; i < argv.length; i++) {
  if ((argv[i] === '--uri' || argv[i] === '-u') && argv[i+1]) {
    process.env.MONGODB_URI = argv[i+1]
  }
}

function titleCase(s) {
  return String(s || '')
    .replace(/[-_]/g, ' ')
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

async function importTents() {
  if (!dryRun) {
    await connectDB()
  } else {
    console.log('Running in dry-run mode: will not connect to MongoDB or write data')
  }

  let raw
  // Resolve the JSON file path from several likely locations so the script works
  // whether run from repo root, from the backend folder, or from elsewhere.
  const candidates = []
  // common: repo root (process.cwd()) + frontend path
  candidates.push(path.resolve(process.cwd(), 'frontend', 'src', 'assets', 'json', 'tents.json'))
  // relative to this script file (backend/scripts) -> repo root
  candidates.push(path.resolve(path.dirname(__filename), '..', '..', 'frontend', 'src', 'assets', 'json', 'tents.json'))
  // a couple of reasonable alternates
  candidates.push(path.resolve(process.cwd(), 'frontend', 'src', 'assets', 'tents.json'))
  candidates.push(path.resolve(process.cwd(), 'frontend', 'src', 'assets', 'json', 'tents.json'))

  let lastErr
  for (const p of candidates) {
    try {
      raw = await fs.readFile(p, 'utf8')
      resolvedJsonPath = p
      console.log('Using tents JSON file at', p)
      break
    } catch (err) {
      lastErr = err
      // continue to next candidate
    }
  }

  if (!raw) {
    console.error('Failed to read JSON file. Tried the following paths:')
    for (const p of candidates) console.error('  -', p)
    // throw the last error for debugging
    throw lastErr || new Error('tents.json not found')
  }

  let obj
  try {
    obj = JSON.parse(raw)
  } catch (err) {
    console.error('Failed to parse JSON file', err.message)
    throw err
  }

  let created = 0
  let updated = 0

  // top-level keys are resort slugs (e.g. "vanavihari", "karthikavanm")
  for (const [resortKey, tents] of Object.entries(obj)) {
    try {
      // find resort by name (case-insensitive) or create a minimal resort record
      let resortDoc = null
      if (!dryRun) {
        resortDoc = await Resort.findOne({ resortName: { $regex: `^${resortKey}$`, $options: 'i' } })
        if (!resortDoc) {
          // try partial match
          resortDoc = await Resort.findOne({ resortName: { $regex: resortKey, $options: 'i' } })
        }

        if (!resortDoc) {
          const name = titleCase(resortKey)
          resortDoc = new Resort({ resortName: name })
          await resortDoc.save()
          console.log(`Created resort record for "${name}"`)
        }
      } else {
        // dry-run: fake a resortDoc with minimal info so we can log actions
        resortDoc = { _id: `dryrun-${resortKey}`, resortName: titleCase(resortKey) }
      }

      if (!Array.isArray(tents)) continue

      for (const it of tents) {
        try {
          const tentTypeName = it.name || it.id || `tent-${Date.now()}`
          const price = it.price !== undefined ? Number(it.price) : 0

          const tentData = {
            tentType: tentTypeName,
            dimensions: it.capacity !== undefined ? `capacity:${it.capacity}` : (it.dimensions || undefined),
            brand: it.subtitle || it.brand || undefined,
            features: it.description || undefined,
            pricePerDay: Number.isNaN(price) ? 0 : price,
            amenities: Array.isArray(it.amenities) ? it.amenities.map(a => String(a).trim()).filter(Boolean) : [],
            resort: resortDoc._id,
          }

          // upsert by tentType + resort
          if (!dryRun) {
            const exists = await TentType.findOne({ tentType: tentData.tentType, resort: resortDoc._id })
            if (exists) {
              // update allowed fields
              exists.dimensions = tentData.dimensions || exists.dimensions
              exists.brand = tentData.brand || exists.brand
              exists.features = tentData.features || exists.features
              exists.pricePerDay = (tentData.pricePerDay !== undefined ? tentData.pricePerDay : exists.pricePerDay)
              if (Array.isArray(tentData.amenities) && tentData.amenities.length) exists.amenities = tentData.amenities
              await exists.save()
              updated++
              console.log(`Updated tentType: ${tentData.tentType} (resort ${resortDoc.resortName})`)
              continue
            }

            const doc = new TentType(tentData)
            await doc.save()
            created++
            console.log(`Created tentType: ${tentData.tentType} (resort ${resortDoc.resortName})`)
            } else {
            // dry run: just log what would be done and avoid any DB calls
            const amenCount = Array.isArray(tentData.amenities) ? tentData.amenities.length : 0
            console.log(`[dry-run] Would upsert tentType=${tentData.tentType} resort=${resortDoc.resortName} price=${tentData.pricePerDay} amenities=${amenCount}`)
            // best-effort counts for dry-run
            created++
          }
        } catch (err) {
          console.error('Failed to import tent', it && (it.name || it.id), err.message || err)
        }
      }
    } catch (err) {
      console.error('Failed to process resortKey', resortKey, err.message || err)
    }
  }

  console.log(`Import finished. Created ${created} tent types, updated ${updated} tent types.`)
}

const __filename = fileURLToPath(import.meta.url)

if (process.argv[1] === __filename) {
  importTents()
    .then(() => process.exit(0))
    .catch((err) => { console.error(err); process.exit(1) })
}

export default importTents
