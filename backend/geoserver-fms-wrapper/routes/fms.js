const express = require('express');
const router = express.Router();
const FormSchema = require('../models/FormSchema');

// CREATE
router.post('/', async (req, res) => {
  const { featureID, formData } = req.body;
  try {
    const existing = await FormSchema.findOne({ featureID });
    if (existing) return res.status(409).json({ message: 'FeatureID exists' });

    const created = await FormSchema.create({ featureID, formData });
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// READ
router.get('/:featureID', async (req, res) => {
  try {
    const form = await FormSchema.findOne({ featureID: req.params.featureID });
    if (!form) return res.status(404).json({ message: 'Not found' });
    res.json(form);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE
router.put('/:featureID', async (req, res) => {
  try {
    const updated = await FormSchema.findOneAndUpdate(
      { featureID: req.params.featureID },
      { formData: req.body.formData, updatedAt: new Date() },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE
router.delete('/:featureID', async (req, res) => {
  try {
    const deleted = await FormSchema.findOneAndDelete({ featureID: req.params.featureID });
    if (!deleted) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
