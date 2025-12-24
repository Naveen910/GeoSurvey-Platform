const express = require('express');
const ExcelJS = require('exceljs');
const archiver = require('archiver');
const { Parser } = require('json2csv');
const FormSchema = require('../models/FormSchema');

const router = express.Router();

/**
 * GET /api/fms/download?type=csv|xlsx
 */
router.get('/', async (req, res) => {
  try {
    const { type } = req.query;
    if (!['csv', 'xlsx'].includes(type)) {
      return res.status(400).json({ message: 'Invalid download type' });
    }

    const forms = await FormSchema.find(
      { 'formData.status': 'Completed' },
      { _id: 0 }
    ).lean();

    if (!forms.length) {
      return res.status(404).json({ message: 'No completed records found' });
    }

    if (type === 'csv') {
      return downloadCSV(forms, res);
    }

    if (type === 'xlsx') {
      return downloadXLSX(forms, res);
    }
  } catch (err) {
    console.error('❌ Download error:', err);
    res.status(500).json({ message: 'Download failed' });
  }
});

/* ---------------- CSV ---------------- */
function downloadCSV(data, res) {
  const rows = data.map((item, i) => ({
    '#': i + 1,
    Feature_ID: item.featureID || '',
    Agent_Name: item.formData?.agent || '',
    Status: item.formData?.status || '',
    New_Latitude: item.formData?.newLatitude || '',
    New_Longitude: item.formData?.newLongitude || '',
    New_Altitude: item.formData?.newAltitude || '',
    Secondary_Point: item.formData?.secondaryPoint || '',
    Corner_Point: item.formData?.cornerPoint || '',
    Remarks: item.formData?.remarks || '',
    CreatedAt: item.createdAt,
    UpdatedAt: item.updatedAt,
  }));

  const parser = new Parser();
  const csv = parser.parse(rows);

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader(
    'Content-Disposition',
    'attachment; filename="Completed_FMS_Data.csv"'
  );
  res.send(csv);
}

/* ---------------- XLSX ZIP ---------------- */
async function downloadXLSX(data, res) {
  res.setHeader('Content-Type', 'application/zip');
  res.setHeader(
    'Content-Disposition',
    'attachment; filename="Completed_FMS_Data.zip"'
  );

  const archive = archiver('zip', { zlib: { level: 9 } });
  archive.pipe(res);

  const chunkSize = 25;

  for (let start = 0; start < data.length; start += chunkSize) {
    const chunk = data.slice(start, start + chunkSize);
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet(`FMS_${start / chunkSize + 1}`);

    sheet.columns = [
      { header: '#', key: 'sno', width: 6 },
      { header: 'Feature ID', key: 'featureID', width: 15 },
      { header: 'Agent Name', key: 'agent', width: 20 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'New Latitude', key: 'lat', width: 20 },
      { header: 'New Longitude', key: 'lon', width: 20 },
      { header: 'New Altitude', key: 'alt', width: 20 },
      { header: 'Secondary Point', key: 'secondaryPoint', width: 20 },
      { header: 'Corner Point', key: 'cornerPoint', width: 12 },
      { header: 'Remarks', key: 'remarks', width: 30 },
      { header: 'Created At', key: 'createdAt', width: 25 },
      { header: 'Updated At', key: 'updatedAt', width: 25 },
      ...Array.from({ length: 5 }, (_, i) => ({
        header: `Image ${i + 1}`,
        key: `img${i + 1}`,
        width: 15,
      })),
    ];

    sheet.getRow(1).font = { bold: true };

    chunk.forEach((item, i) => {
      const row = sheet.addRow({
        sno: start + i + 1,
        featureID: item.featureID,
        agent: item.formData?.agent,
        status: item.formData?.status,
        lat: item.formData?.newLatitude,
        lon: item.formData?.newLongitude,
        alt: item.formData?.newAltitude,
        secondaryPoint: item.formData?.secondaryPoint,
        cornerPoint: item.formData?.cornerPoint,
        remarks: item.formData?.remarks,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      });

      row.height = 80;

      const images = item.formData?.images || [];
      images.slice(0, 5).forEach((img, idx) => {
        try {
          const base64 = img.includes(',') ? img.split(',')[1] : img;
          const buffer = Buffer.from(base64, 'base64');
          const imageId = workbook.addImage({
            buffer,
            extension: img.includes('png') ? 'png' : 'jpeg',
          });

          sheet.addImage(imageId, {
            tl: { col: 12 + idx, row: row.number - 1 },
            ext: { width: 80, height: 80 },
          });
        } catch (_) {}
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    archive.append(buffer, {
      name: `Completed_FMS_File_${start / chunkSize + 1}.xlsx`,
    });
  }

  await archive.finalize();
}

module.exports = router;
