import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface CottageTypeFormData {
  resort: string;
  name: string;
  amenities: string; 
  description: string;
  basePrice: string;
  maxGuests: string;
  bedrooms: string;
  bathrooms: string;
}



const AddCottageTypeForm = () => {
  const [formData, setFormData] = useState<CottageTypeFormData>({
    resort: "",
    name: "",
    amenities: "",
    description: "",
    basePrice: "",
    maxGuests: "",
    bedrooms: "",
    bathrooms: "",
  });
  const [images, setImages] = useState<File[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [resorts, setResorts] = useState<Array<{ id: string; resortName: string }>>([])
  const [resortsLoading, setResortsLoading] = useState(false)

  useEffect(() => {
    const load = async () => {
      setResortsLoading(true)
      try {
        const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:4000'
        const res = await fetch(apiBase + '/api/resorts')
        if (!res.ok) throw new Error('Failed to fetch resorts')
        const data = await res.json()
        // backend returns { resorts: [...] }
        const list = (data && data.resorts) || []
        // filter out unwanted test entry (e.g. 'test 1') then map
        const filtered = list.filter((r: any) => {
          const name = (r.resortName || r.name || '').toString().trim().toLowerCase()
          return name !== 'test 1' && name !== 'test1'
        })
        setResorts(filtered.map((r: any) => ({ id: r._id || r.id, resortName: r.resortName || r.name || r.resortName })))
      } catch (e) {
        console.warn('Could not load resorts', e)
      } finally {
        setResortsLoading(false)
      }
    }

    load()
  }, [])

  // Fallback options when backend hasn't provided resorts yet
  const fallbackResorts = [
    { id: 'legacy:vanavihari', resortName: 'Vanavihari' },
    { id: 'legacy:jungle', resortName: 'Jungle Star' },
  ]

  const mergedResorts = (() => {
    const map = new Map<string, { id: string; resortName: string }>()
    // insert fallbacks first
    for (const f of fallbackResorts) map.set(f.resortName.toLowerCase(), f)
    // then override/insert fetched resorts
    for (const r of resorts) map.set(r.resortName.toLowerCase(), { id: r.id, resortName: r.resortName })
    return Array.from(map.values())
  })()

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : []
    setImages(files)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true)
    setMessage(null)

    try {
      // resolve legacy selection to real resort id if possible
      let resortToSend = formData.resort
      if (resortToSend && resortToSend.startsWith('legacy:')) {
        // try to find matching resort in fetched list by name
        const name = resortToSend.replace('legacy:', '')
        const found = resorts.find(r => r.resortName.toLowerCase().includes(name))
        if (found) {
          resortToSend = found.id
        } else {
          setMessage('Cannot submit: backend resorts not loaded. Start backend or pick a real resort.')
          setLoading(false)
          return
        }
      }

      const fd = new FormData()
      fd.append('resort', resortToSend)
      fd.append('name', formData.name)
      fd.append('description', formData.description)
      if (formData.basePrice) fd.append('basePrice', formData.basePrice)
      if (formData.maxGuests) fd.append('maxGuests', formData.maxGuests)
      if (formData.bedrooms) fd.append('bedrooms', formData.bedrooms)
      if (formData.bathrooms) fd.append('bathrooms', formData.bathrooms)

      // amenities: split by comma and append each entry so backend receives array
      const amenities = formData.amenities
        .split(',')
        .map((a) => a.trim())
        .filter(Boolean)
      amenities.forEach((a) => fd.append('amenities', a))

      // images
      images.forEach((file) => fd.append('images', file))

      const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:4000'

      const res = await fetch(apiBase + '/api/cottage-types/add', {
        method: 'POST',
        body: fd,
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to add cottage type')

      setMessage('Cottage type added successfully')
      // reset form
      setFormData({ resort: '', name: '', amenities: '', description: '', basePrice: '', maxGuests: '', bedrooms: '', bathrooms: '' })
      setImages([])
    } catch (err: any) {
      setMessage(err.message || 'Request failed')
    } finally {
      setLoading(false)
    }
  };

  const handleReset = () => {
    setFormData({ resort: '', name: '', amenities: '', description: '', basePrice: '', maxGuests: '', bedrooms: '', bathrooms: '' })
    setImages([])
    setMessage(null)
  }

  return (
    <div className="min-h-screen p-8">
      <div className="w-full max-w-4xl">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-slate-800 mb-2">
            Add New Cottage Type
          </h1>
          <p className="text-slate-600">
            Select the resort and provide cottage details below
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Select Resort */}
          <div className="w-full max-w-md space-y-2">
            <Label htmlFor="resortId" className="text-sm font-medium text-slate-700">
              Select Resort *
            </Label>
            <select
              id="resort"
              name="resort"
              value={formData.resort}
              onChange={handleChange}
              required
              disabled={resortsLoading}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 bg-slate-50"
            >
              <option value="">-- Select Resort --</option>
              {mergedResorts.map((resort) => (
                <option key={resort.id} value={resort.id}>
                  {resort.resortName}
                </option>
              ))}
            </select>
          </div>

          {/* Cottage Name */}
          <div className="w-full max-w-md space-y-2">
            <Label htmlFor="name" className="text-sm font-medium text-slate-700">
              Cottage Name *
            </Label>
            <Input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="e.g., Deluxe Cottage"
              className="w-full px-4 py-3 border border-slate-300 rounded-lg bg-slate-50"
            />
          </div>

          {/* Base Price */}
          <div className="w-full max-w-md space-y-2">
            <Label htmlFor="basePrice" className="text-sm font-medium text-slate-700">
              Base Price (INR) *
            </Label>
            <Input
              id="basePrice"
              name="basePrice"
              type="number"
              value={formData.basePrice}
              onChange={handleChange}
              required
              placeholder="e.g., 3500"
              className="w-full px-4 py-3 border border-slate-300 rounded-lg bg-slate-50"
            />
          </div>

          {/* Guests / Bedrooms / Bathrooms */}
          <div className="grid grid-cols-3 gap-4 max-w-md">
            <div className="space-y-2">
              <Label htmlFor="maxGuests" className="text-sm font-medium text-slate-700">Max Guests</Label>
              <Input id="maxGuests" name="maxGuests" type="number" value={formData.maxGuests} onChange={handleChange} placeholder="2" className="w-full px-4 py-3 border border-slate-300 rounded-lg bg-slate-50" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bedrooms" className="text-sm font-medium text-slate-700">Bedrooms</Label>
              <Input id="bedrooms" name="bedrooms" type="number" value={formData.bedrooms} onChange={handleChange} placeholder="1" className="w-full px-4 py-3 border border-slate-300 rounded-lg bg-slate-50" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bathrooms" className="text-sm font-medium text-slate-700">Bathrooms</Label>
              <Input id="bathrooms" name="bathrooms" type="number" value={formData.bathrooms} onChange={handleChange} placeholder="1" className="w-full px-4 py-3 border border-slate-300 rounded-lg bg-slate-50" />
            </div>
          </div>

          {/* Amenities (comma separated) */}
          <div className="w-full max-w-md space-y-2">
            <Label htmlFor="amenities" className="text-sm font-medium text-slate-700">Amenities (comma separated)</Label>
            <Input id="amenities" name="amenities" type="text" value={formData.amenities} onChange={handleChange} placeholder="AC, TV, Wi-Fi" className="w-full px-4 py-3 border border-slate-300 rounded-lg bg-slate-50" />
          </div>

          {/* Description */}
          <div className="w-full max-w-md space-y-2">
            <Label htmlFor="description" className="text-sm font-medium text-slate-700">Description</Label>
            <Textarea id="description" name="description" value={formData.description} onChange={handleChange} placeholder="Describe the cottage type" className="w-full px-4 py-3 border border-slate-300 rounded-lg bg-slate-50" />
          </div>

          {/* Images */}
          <div className="w-full max-w-md space-y-2">
            <Label htmlFor="images" className="text-sm font-medium text-slate-700">Images</Label>
            <input id="images" name="images" type="file" multiple onChange={handleFilesChange} accept="image/*" className="w-full" />
            {images.length > 0 && <p className="text-sm text-slate-600">{images.length} file(s) selected</p>}
          </div>

          {/* Buttons */}
          <div className="flex gap-4 pt-4 max-w-md">
            <Button type="submit" className="bg-slate-800 hover:bg-slate-700 text-white font-medium py-3 px-6 rounded-lg shadow-md" disabled={loading}>
              {loading ? 'Saving…' : 'Submit'}
            </Button>
            <Button type="button" onClick={handleReset} className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-medium py-3 px-6 rounded-lg">
              Reset
            </Button>
          </div>

          {message && <p className="mt-4 text-sm text-slate-700">{message}</p>}
        </form>
      </div>
    </div>
  );
};

export default AddCottageTypeForm;
