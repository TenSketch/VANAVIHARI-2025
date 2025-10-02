import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// select components removed because this form no longer uses location dropdown

const AddTentTypes = () => {
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

  // Add current form to the local list
  const handleAdd = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setAdded((s) => [
      ...s,
      {
        tentType: form.tentType,
        dimensions: form.dimensions,
        brand: form.brand,
        features: form.features,
        pricePerDay: `${form.price}/day`,
        amenities: form.amenities,
      },
    ]);
    // reset to defaults after add
    setForm({
      tentType: "2 person tent",
      dimensions: "approx. 205 cm × 145 cm, height 110 cm",
      brand: "Decathlon",
      features: `- Waterproof and dustproof\n- Raised concrete base for added comfort and safety`,
      price: "1500",
      amenities: "Common toilet, Bed, bedsheets, blankets, and pillows provided",
    });
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
              className="bg-slate-800 hover:bg-slate-700 text-white font-medium py-3 px-6 rounded-lg transition-colors shadow-md hover:shadow-lg"
            >
              Add Tent Type
            </Button>
            <Button
              type="button"
              onClick={handleReset}
              className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-medium py-3 px-6 rounded-lg transition-colors"
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
