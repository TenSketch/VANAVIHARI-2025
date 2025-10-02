import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const AddTentSpots = () => {
  const defaultForm = {
    spotName: "Vanavihari",
    location: "Maredumilli",
    contactPerson: "Mrs. Anusha",
    contactNo: "",
    email: "",
    rules:
      "Smoking & consumption of alcohol is strictly prohibited in and around accommodation.\nPlease carry valid identity proof of all members.\nTent damage will be fined\n* No extra persons allowed",
    accommodation: "Only men",
    foodAvailable: "No",
    kidsStay: "No",
    womenStay: "No",
    checkIn: "10:00 AM",
    checkOut: "9:00 AM",
  };

  const [form, setForm] = useState(defaultForm);
  const [added, setAdded] = useState<Array<any>>([]);

  const handleAdd = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setAdded((s) => [...s, { ...form }]);
    setForm(defaultForm);
  };

  const handleReset = () => {
    setForm(defaultForm);
    setAdded([]);
  };

  return (
    <div className="min-h-screen p-8">
      <div className="w-full max-w-4xl">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-slate-800 mb-2">Add Tent Spot</h1>
          <p className="text-slate-600">Add tent spot details</p>
        </div>

        <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label>Tent Spot name</Label>
              <Input value={form.spotName} onChange={(e) => setForm((s) => ({ ...s, spotName: e.target.value }))} />
            </div>

            <div>
              <Label>Location</Label>
              <Input value={form.location} onChange={(e) => setForm((s) => ({ ...s, location: e.target.value }))} />
            </div>

            <div>
              <Label>Contact person name</Label>
              <Input value={form.contactPerson} onChange={(e) => setForm((s) => ({ ...s, contactPerson: e.target.value }))} />
            </div>

            <div>
              <Label>Contact no.</Label>
              <Input value={form.contactNo} onChange={(e) => setForm((s) => ({ ...s, contactNo: e.target.value }))} />
            </div>

            <div>
              <Label>Email</Label>
              <Input type="email" value={form.email} onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))} />
            </div>

            <div>
              <Label>Accommodation for</Label>
              <div className="flex gap-4 items-center mt-2">
                <label className="inline-flex items-center">
                  <input type="radio" name="accom" checked={form.accommodation === "Only men"} onChange={() => setForm((s) => ({ ...s, accommodation: "Only men" }))} />
                  <span className="ml-2">Only men</span>
                </label>
                <label className="inline-flex items-center">
                  <input type="radio" name="accom" checked={form.accommodation === "Both men and women"} onChange={() => setForm((s) => ({ ...s, accommodation: "Both men and women" }))} />
                  <span className="ml-2">Both men and women</span>
                </label>
              </div>
            </div>

            <div>
              <Label>Food availability</Label>
              <Input value={form.foodAvailable} onChange={(e) => setForm((s) => ({ ...s, foodAvailable: e.target.value }))} />
            </div>

            <div>
              <Label>Kids stay</Label>
              <Input value={form.kidsStay} onChange={(e) => setForm((s) => ({ ...s, kidsStay: e.target.value }))} />
            </div>

            <div>
              <Label>Women stay</Label>
              <Input value={form.womenStay} onChange={(e) => setForm((s) => ({ ...s, womenStay: e.target.value }))} />
            </div>

            <div>
              <Label>Checkin time</Label>
              <Input value={form.checkIn} onChange={(e) => setForm((s) => ({ ...s, checkIn: e.target.value }))} />
            </div>

            <div>
              <Label>Check-out time</Label>
              <Input value={form.checkOut} onChange={(e) => setForm((s) => ({ ...s, checkOut: e.target.value }))} />
            </div>
          </div>

          <div>
            <Label>Rules</Label>
            <textarea rows={4} value={form.rules} onChange={(e) => setForm((s) => ({ ...s, rules: e.target.value }))} className="w-full px-3 py-2 border rounded-md bg-slate-50" />
          </div>

          <div className="flex gap-4 pt-4 max-w-md">
            <Button type="button" onClick={handleAdd} className="bg-slate-800 hover:bg-slate-700 text-white font-medium py-3 px-6 rounded-lg">Add Tent Spot</Button>
            <Button type="button" onClick={handleReset} className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-medium py-3 px-6 rounded-lg">Reset</Button>
          </div>

          {added.length > 0 && (
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4">Added Tent Spots</h2>
              <div className="space-y-3">
                {added.map((s, i) => (
                  <div key={i} className="p-3 border rounded bg-white">
                    <div className="font-medium">{s.spotName} — {s.location}</div>
                    <div className="text-sm">Contact: {s.contactPerson} | {s.contactNo} | {s.email}</div>
                    <div className="whitespace-pre-wrap text-sm">Rules: {s.rules}</div>
                    <div className="text-sm">Accommodation: {s.accommodation}</div>
                    <div className="text-sm">Food: {s.foodAvailable} • Kids: {s.kidsStay} • Women stay: {s.womenStay}</div>
                    <div className="text-sm">Check-in: {s.checkIn} • Check-out: {s.checkOut}</div>
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

export default AddTentSpots;
