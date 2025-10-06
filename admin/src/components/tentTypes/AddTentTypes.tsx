import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// select components removed because this form no longer uses location dropdown

const AddTentTypes = () => {
  const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  
  // Single-item add form (admin can add multiple tent types one by one)
  const [form, setForm] = useState({
    tentType: "2 person tent",
    dimensions: "approx. 205 cm × 145 cm, height 110 cm",
    brand: "Decathlon",
    features: `- Waterproof and dustproof\n- Raised concrete base for added comfort and safety`,
    price: "1500",
    amenities: "Common toilet, Bed, bedsheets, blankets, and pillows provided",
  });

  const [added, setAdded] = useState<Array<any>>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Add current form to the database and local list
  const handleAdd = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      // Prepare the data for submission
      const tentData = {
        tentType: form.tentType,
        dimensions: form.dimensions,
        brand: form.brand,
        features: form.features,
        price: Number(form.price),
        amenities: form.amenities.split(',').map(a => a.trim()).filter(Boolean),
      };

      const response = await fetch(`${apiBase}/api/tent-types/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tentData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save tent type');
      }

      const result = await response.json();
      const savedTent = result.tentType;

      // Add to local preview list
      setAdded((s) => [
        ...s,
        {
          _id: savedTent._id,
          tentType: savedTent.tentType,
          dimensions: savedTent.dimensions,
          brand: savedTent.brand,
          features: savedTent.features,
          pricePerDay: `${savedTent.pricePerDay}/day`,
          amenities: Array.isArray(savedTent.amenities) 
            ? savedTent.amenities.join(', ') 
            : savedTent.amenities,
        },
      ]);

      setSuccess('Tent type added successfully!');

      // Reset form to defaults after add
      setForm({
        tentType: "2 person tent",
        dimensions: "approx. 205 cm × 145 cm, height 110 cm",
        brand: "Decathlon",
        features: `- Waterproof and dustproof\n- Raised concrete base for added comfort and safety`,
        price: "1500",
        amenities: "Common toilet, Bed, bedsheets, blankets, and pillows provided",
      });
    } catch (err: any) {
      setError(err.message || 'Failed to add tent type');
      console.error('Error adding tent type:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setForm({
      tentType: "2 person tent",
      dimensions: "approx. 205 cm × 145 cm, height 110 cm",
      brand: "Decathlon",
      features: `- Waterproof and dustproof\n- Raised concrete base for added comfort and safety`,
      price: "1500",
      amenities: "Common toilet, Bed, bedsheets, blankets, and pillows provided",
    });
    setAdded([]);
  };

  return (
    <div className="min-h-screen p-8">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-slate-800 mb-2">
            Add Tent Type
          </h1>
          <p className="text-slate-600">
            Select location, tent type, and set price
          </p>

          {/* Success/Error Messages */}
          {success && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-800">
              {success}
            </div>
          )}
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800">
              {error}
            </div>
          )}
        </div>

        {/* Form */}
  <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
            {/* Single tent-type add form */}
            <div className="w-full max-w-3xl">
            <div className="p-4 bg-transparent">
              <div className="space-y-3">
                <div>
                  <Label className="text-sm font-medium">Tent type</Label>
                  <Input
                    value={form.tentType}
                    onChange={(e) => setForm((s) => ({ ...s, tentType: e.target.value }))}
                    className="w-full"
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium">Dimensions</Label>
                  <Input
                    value={form.dimensions}
                    onChange={(e) => setForm((s) => ({ ...s, dimensions: e.target.value }))}
                    className="w-full"
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium">Brand name</Label>
                  <Input
                    value={form.brand}
                    onChange={(e) => setForm((s) => ({ ...s, brand: e.target.value }))}
                    className="w-full"
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium">Features</Label>
                  <textarea
                    value={form.features}
                    onChange={(e) => setForm((s) => ({ ...s, features: e.target.value }))}
                    rows={4}
                    className="w-full px-3 py-2 border rounded-md bg-slate-50"
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium">Price (per day)</Label>
                  <Input
                    type="number"
                    value={form.price}
                    onChange={(e) => setForm((s) => ({ ...s, price: e.target.value }))}
                    className="w-full"
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium">Amenities</Label>
                  <textarea
                    value={form.amenities}
                    onChange={(e) => setForm((s) => ({ ...s, amenities: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border rounded-md bg-slate-50"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-4 pt-4 max-w-md">
            <Button
              type="button"
              onClick={handleAdd}
              disabled={isSaving}
              className="bg-slate-800 hover:bg-slate-700 text-white font-medium py-3 px-6 rounded-lg transition-colors shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? 'Saving...' : 'Add Tent Type'}
            </Button>
            <Button
              type="button"
              onClick={handleReset}
              disabled={isSaving}
              className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-medium py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Reset
            </Button>
          </div>

          {/* Preview of added tent types */}
          {added.length > 0 && (
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4">Added Tent Types</h2>
              <div className="space-y-3">
                {added.map((t, i) => (
                  <div key={i} className="p-3 border rounded bg-white">
                    <div className="font-medium">{t.tentType} — ₹{t.pricePerDay}</div>
                    <div className="text-sm text-slate-600">{t.dimensions}</div>
                    <div className="text-sm">Brand: {t.brand}</div>
                    <div className="whitespace-pre-wrap text-sm">Features: {t.features}</div>
                    <div className="text-sm">Amenities: {t.amenities}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default AddTentTypes;
