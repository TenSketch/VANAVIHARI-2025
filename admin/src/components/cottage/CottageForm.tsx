import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface CottageTypeFormData {
  resortId: string;
  cottageName: string;
  roomAmenities: string;
  description: string;
}

// Dummy resorts
const resorts = [
  { id: "resort1", name: "Jungle Star" },
  { id: "resort2", name: "Vanavihari" },
];

const AddCottageTypeForm = () => {
  const [formData, setFormData] = useState<CottageTypeFormData>({
    resortId: "",
    cottageName: "",
    roomAmenities: "",
    description: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Cottage Type Form Data:", formData);
    // Submit logic here
  };

  const handleReset = () => {
    setFormData({
      resortId: "",
      cottageName: "",
      roomAmenities: "",
      description: "",
    });
  };

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
              id="resortId"
              name="resortId"
              value={formData.resortId}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 bg-slate-50"
            >
              <option value="">-- Select Resort --</option>
              {resorts.map((resort) => (
                <option key={resort.id} value={resort.id}>
                  {resort.name}
                </option>
              ))}
            </select>
          </div>

          {/* Cottage Name */}
          <div className="w-full max-w-md space-y-2">
            <Label htmlFor="cottageName" className="text-sm font-medium text-slate-700">
              Cottage Name *
            </Label>
            <Input
              id="cottageName"
              name="cottageName"
              type="text"
              value={formData.cottageName}
              onChange={handleChange}
              required
              placeholder="e.g., Deluxe Cottage"
              className="w-full px-4 py-3 border border-slate-300 rounded-lg bg-slate-50"
            />
          </div>

          {/* Room Amenities */}
          <div className="w-full max-w-md space-y-2">
            <Label htmlFor="roomAmenities" className="text-sm font-medium text-slate-700">
              Room Amenities
            </Label>
            <Input
              id="roomAmenities"
              name="roomAmenities"
              type="text"
              value={formData.roomAmenities}
              onChange={handleChange}
              placeholder="e.g., AC, TV, Wi-Fi"
              className="w-full px-4 py-3 border border-slate-300 rounded-lg bg-slate-50"
            />
          </div>

          {/* Description */}
          <div className="w-full max-w-md space-y-2">
            <Label htmlFor="description" className="text-sm font-medium text-slate-700">
              Description
            </Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe the cottage type"
              className="w-full px-4 py-3 border border-slate-300 rounded-lg bg-slate-50"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-4 pt-4 max-w-md">
            <Button
              type="submit"
              className="bg-slate-800 hover:bg-slate-700 text-white font-medium py-3 px-6 rounded-lg shadow-md"
            >
              Submit
            </Button>
            <Button
              type="button"
              onClick={handleReset}
              className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-medium py-3 px-6 rounded-lg"
            >
              Reset
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCottageTypeForm;
