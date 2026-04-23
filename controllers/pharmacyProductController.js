const Medicine = require('../models/medicine');
const Pharmacy = require('../models/pharmacy');

exports.createMedicine = async (req, res) => {
  try {
    const userId = req.user._id;
    const pharmacy = await Pharmacy.findOne({ user: userId });
    if (!pharmacy) return res.status(403).json({ message: 'Pharmacy profile not found' });
    const body = req.body;
    const med = await Medicine.create({ ...body, pharmacy: pharmacy._id });
    res.status(201).json({ success: true, medicine: med });
  } catch (error) {
    console.error('Create Medicine Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

exports.updateMedicine = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;
    const pharmacy = await Pharmacy.findOne({ user: userId });
    if (!pharmacy) return res.status(403).json({ message: 'Pharmacy profile not found' });
    const med = await Medicine.findById(id);
    if (!med) return res.status(404).json({ message: 'Medicine not found' });
    if (med.pharmacy.toString() !== pharmacy._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to edit this medicine' });
    }
    const updated = await Medicine.findByIdAndUpdate(id, { $set: req.body }, { new: true });
    res.status(200).json({ success: true, medicine: updated });
  } catch (error) {
    console.error('Update Medicine Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

exports.deleteMedicine = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;
    const pharmacy = await Pharmacy.findOne({ user: userId });
    if (!pharmacy) return res.status(403).json({ message: 'Pharmacy profile not found' });
    const med = await Medicine.findById(id);
    if (!med) return res.status(404).json({ message: 'Medicine not found' });
    if (med.pharmacy.toString() !== pharmacy._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this medicine' });
    }
    await Medicine.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: 'Medicine deleted' });
  } catch (error) {
    console.error('Delete Medicine Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

exports.getMedicineById = async (req, res) => {
  try {
    const { id } = req.params;
    const med = await Medicine.findById(id).populate('pharmacy', 'ownerName address city');
    if (!med) return res.status(404).json({ message: 'Medicine not found' });
    res.status(200).json({ success: true, medicine: med });
  } catch (error) {
    console.error('Get Medicine Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

exports.listMedicines = async (req, res) => {
  try {
    const { pharmacyId, q, category, medicineType, brand, deliveryOption, lat, lng, radiusKm, sort } = req.query;
    const filter = {};
    if (pharmacyId) filter.pharmacy = pharmacyId;
    if (q) filter.productName = { $regex: q, $options: 'i' };
    if (category) filter.category = category;
    if (medicineType) filter.medicineType = medicineType;
    if (brand) filter.brand = brand;
    if (deliveryOption) filter.deliveryOption = deliveryOption;
    let meds = await Medicine.find(filter).populate('pharmacy', 'address city location deliveryAvailable');
    if (lat && lng) {
      const center = { lat: Number(lat), lng: Number(lng) };
      const rad = radiusKm ? Number(radiusKm) : 10;
      meds = meds.filter(m => {
        const loc = m.pharmacy?.location?.coordinates;
        if (!loc || loc.length < 2) return false;
        const [plng, plat] = loc;
        const toRad = v => (v * Math.PI) / 180;
        const R = 6371;
        const dLat = toRad(plat - center.lat);
        const dLon = toRad(plng - center.lng);
        const a = Math.sin(dLat/2)**2 + Math.cos(toRad(center.lat))*Math.cos(toRad(plat))*Math.sin(dLon/2)**2;
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const d = R * c;
        return d <= rad;
      });
      if (sort === 'distance') {
        meds.sort((a,b) => {
          const [alng, alat] = a.pharmacy.location.coordinates;
          const [blng, blat] = b.pharmacy.location.coordinates;
          const dx1 = (alat-center.lat)**2 + (alng-center.lng)**2;
          const dx2 = (blat-center.lat)**2 + (blng-center.lng)**2;
          return dx1 - dx2;
        })
      }
    } else if (sort === 'price_asc') {
      meds.sort((a,b) => (a.price||0)-(b.price||0));
    } else if (sort === 'price_desc') {
      meds.sort((a,b) => (b.price||0)-(a.price||0));
    }
    res.status(200).json({ success: true, count: meds.length, medicines: meds });
  } catch (error) {
    console.error('List Medicines Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
