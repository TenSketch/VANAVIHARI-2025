import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Resort = "Vanavihari" | "Karthikavanam";

type FormState = {
    resort: Resort;
    tentSize: 2 | 4 | "";
    tentId: string;
    rate: number | "";
    image?: File | null;
};

// Generate tent id based on resort and tent size.
// Examples: Vanavihari + 4 => V-T4, Karthikavanam + 2 => K-T2
export const generateTentId = (resort: Resort, size: 2 | 4) => {
    const code = resort === "Vanavihari" ? "V" : "K";
    return `${code}-T${size}`;
};

const tentTypeRates: Record<number, number> = {
    2: 2000,
    4: 3500,
};

const AddTents: React.FC = () => {
    const [form, setForm] = useState<FormState>({
        resort: "Vanavihari",
        tentSize: "",
        tentId: "",
        rate: "",
        image: null,
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    // update tent id and rate when resort or tentSize change
    useEffect(() => {
        if (form.tentSize !== "") {
            const size = form.tentSize as 2 | 4;
            const id = generateTentId(form.resort, size);
            const rate = tentTypeRates[size] ?? "";
            setForm((s) => ({ ...s, tentId: id, rate }));
        } else {
            setForm((s) => ({ ...s, tentId: "", rate: "" }));
        }
    }, [form.resort, form.tentSize]);

    const handleChange = (key: keyof FormState, value: any) => {
        setForm((s) => ({ ...s, [key]: value }));
    };

    const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files && e.target.files[0];
        setForm((s) => ({ ...s, image: file ?? null }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Prevent double submission
        if (isSubmitting) return;

        // Simple validation
        if (form.tentSize === "") {
            alert("Please select Tent Type");
            return;
        }

        setIsSubmitting(true);

        // Auto-generate serial number based on existing records
        const existing = JSON.parse(localStorage.getItem('tentsDemo') || '[]');
        const nextSno = existing.length + 1;

        // Prepare payload - in future this can be sent to backend
        const payload = {
            id: `tent-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            sno: nextSno,
            resort: form.resort,
            tentSize: form.tentSize,
            tentId: form.tentId,
            rate: form.rate,
            imageName: form.image?.name ?? null,
            createdAt: new Date().toISOString(),
        };

        try {
            existing.push(payload);
            localStorage.setItem('tentsDemo', JSON.stringify(existing));
            console.log("Tent saved (frontend-only):", payload);
            alert("Tent created and saved locally (frontend-only).");
            handleReset();
        } catch (err) {
            console.error('Failed to save locally', err);
            alert('Failed to save locally: ' + String(err));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleReset = () => {
        setForm({
            resort: "Vanavihari",
            tentSize: "",
            tentId: "",
            rate: "",
            image: null,
        });
    };

    return (
        <div className="min-h-screen p-8">
            <div className="w-full max-w-6xl">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-semibold text-slate-800 mb-2">Add New Tent</h1>
                    <p className="text-slate-600">Fill in the details to add a tent to your inventory</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Information */}
                    <h3 className="text-xl font-semibold text-slate-800 border-b border-slate-200 pb-3 mb-6">Basic Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="resort" className="text-sm font-medium text-slate-700">Tent Spot <span className="text-red-500">*</span></Label>
                            <select
                                id="resort"
                                value={form.resort}
                                onChange={(e) => handleChange("resort", e.target.value as Resort)}
                                required
                                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors bg-slate-50"
                            >
                                <option value="Vanavihari">Vanavihari</option>
                                <option value="Karthikavanam">Karthikavanam</option>
                            </select>
                        </div>
                    </div>

                    {/* Tent Details */}
                    <h3 className="text-xl font-semibold text-slate-800 border-b border-slate-200 pb-3 mb-6">Tent Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="tentSize" className="text-sm font-medium text-slate-700">Tent Type (size) <span className="text-red-500">*</span></Label>
                            <select
                                id="tentSize"
                                value={form.tentSize}
                                onChange={(e) => handleChange("tentSize", e.target.value === "" ? "" : Number(e.target.value))}
                                required
                                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors bg-slate-50"
                            >
                                <option value="">-- Select Tent Size --</option>
                                <option value={2}>2 Person</option>
                                <option value={4}>4 Person</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="tentId" className="text-sm font-medium text-slate-700">Tent ID</Label>
                            <Input
                                id="tentId"
                                value={form.tentId}
                                readOnly
                                placeholder="Auto-generated"
                                className="w-full px-4 py-3 border border-slate-300 rounded-lg bg-gray-100 text-slate-600"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="rate" className="text-sm font-medium text-slate-700">Rate (₹)</Label>
                            <Input
                                id="rate"
                                value={form.rate ?? ""}
                                readOnly
                                placeholder="Auto-filled"
                                className="w-full px-4 py-3 border border-slate-300 rounded-lg bg-gray-100 text-slate-600"
                            />
                        </div>
                    </div>

                    {/* Image Upload */}
                    <h3 className="text-xl font-semibold text-slate-800 border-b border-slate-200 pb-3 mb-6">Tent Image</h3>
                    <div className="grid grid-cols-1 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="image" className="text-sm font-medium text-slate-700">Tent Image</Label>
                            <input
                                id="image"
                                type="file"
                                accept="image/*"
                                onChange={handleFile}
                                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors bg-slate-50"
                            />
                            <p className="text-xs text-slate-500">Upload an image of the tent (JPG, PNG, etc.)</p>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4 pt-6 border-t border-slate-200">
                        <Button 
                            type="submit" 
                            disabled={isSubmitting}
                            className="px-8 py-3 bg-slate-800 text-white hover:bg-slate-700 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? 'Creating...' : 'Add Tent'}
                        </Button>
                        <Button 
                            type="button" 
                            variant="outline" 
                            onClick={handleReset}
                            disabled={isSubmitting}
                            className="px-8 py-3 border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Reset
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddTents;