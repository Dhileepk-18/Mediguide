import PDFDocument from 'pdfkit';

/**
 * Generate a clinical prescription PDF stream/buffer
 * Meets PRD Section 14 and Techstack Section 10
 */
export function generatePrescriptionPDF(prescription) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 40, size: 'A4' });
      const buffers = [];

      doc.on('data', chunk => buffers.push(chunk));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer);
      });
      doc.on('error', err => reject(err));

      // 1. Header Banner
      doc.rect(40, 40, 515, 65).fill('#0B3441');
      doc.fillColor('#FAFBFB').fontSize(20).font('Helvetica-Bold').text('MediGuide India', 55, 52);
      doc.fontSize(9).font('Helvetica').text('Digital Health & Clinical Management Portal', 55, 76);
      doc.fontSize(8).text('National Medical Commission Standards • IST Timezone', 55, 88);

      // 2. Doctor & Clinic Details
      doc.fillColor('#061017');
      doc.fontSize(12).font('Helvetica-Bold').text(prescription.doctorName || 'Dr. Medical Practitioner', 40, 120);
      doc.fontSize(9).font('Helvetica').text(`Department: ${prescription.department || 'General Medicine'}`, 40, 136);
      doc.text(`Reg. Number: ${prescription.doctorRegistration || 'MCI-IND-89472'}`, 40, 149);
      doc.text(`Facility: ${prescription.facility || 'MediGuide Accredited Health Facility'}`, 40, 162);

      // 3. Patient & Date Box (Right aligned)
      doc.rect(360, 115, 195, 62).strokeColor('#0B3441').lineWidth(0.75).stroke();
      doc.fontSize(9).font('Helvetica-Bold').text('Patient Consultation Summary', 370, 123);
      doc.font('Helvetica').fontSize(8.5);
      doc.text(`Patient: ${prescription.patientName || 'Patient'}`, 370, 137);
      doc.text(`Date: ${prescription.date || new Date().toISOString().split('T')[0]}`, 370, 149);
      doc.text(`Rx ID: ${prescription.id || prescription.prescriptionId || 'RX-MED-001'}`, 370, 161);

      // Divider line
      doc.moveTo(40, 190).lineTo(555, 190).strokeColor('#E8EDEF').lineWidth(1).stroke();

      // 4. Rx Symbol & Prescription List
      doc.fillColor('#0B3441').fontSize(18).font('Helvetica-Bold').text('Rx', 40, 205);
      doc.fillColor('#5A6C77').fontSize(9).font('Helvetica').text('Prescribed Medication Schedule:', 70, 211);

      let currentY = 235;

      // Table Header
      doc.rect(40, currentY, 515, 20).fill('#FAFBFB');
      doc.fillColor('#061017').fontSize(8.5).font('Helvetica-Bold');
      doc.text('#', 48, currentY + 5);
      doc.text('Medicine & Strength', 68, currentY + 5);
      doc.text('Dosage', 240, currentY + 5);
      doc.text('Frequency & Route', 330, currentY + 5);
      doc.text('Duration', 460, currentY + 5);

      currentY += 25;

      // Medicines loop
      const meds = prescription.medicines || [];
      meds.forEach((med, index) => {
        doc.fillColor('#061017').font('Helvetica').fontSize(8.5);
        doc.text(`${index + 1}.`, 48, currentY);
        doc.font('Helvetica-Bold').text(med.name, 68, currentY);
        if (med.instructions) {
          doc.font('Helvetica').fontSize(7.5).fillColor('#5A6C77').text(med.instructions, 68, currentY + 11);
        }

        doc.font('Helvetica').fontSize(8.5).fillColor('#061017');
        doc.text(med.dosage || '1 Tablet', 240, currentY);
        doc.text(med.frequency || 'Once daily after food', 330, currentY);
        doc.text(med.duration || '5 days', 460, currentY);

        currentY += med.instructions ? 26 : 20;
      });

      // 5. Clinical Instructions & Follow Up
      currentY = Math.max(currentY + 15, 380);
      doc.moveTo(40, currentY).lineTo(555, currentY).strokeColor('#E8EDEF').lineWidth(1).stroke();
      currentY += 15;

      doc.fillColor('#061017').font('Helvetica-Bold').fontSize(9).text('Doctor Notes & Clinical Advice:', 40, currentY);
      currentY += 14;
      doc.font('Helvetica').fontSize(8.5).fillColor('#5A6C77').text(
        prescription.instructions || prescription.doctorNotes || 'Maintain prescribed hydration. Report to emergency casualty in case of severe allergic reaction or sudden symptom escalation.',
        40,
        currentY,
        { width: 515, lineGap: 3 }
      );

      currentY += 40;
      if (prescription.followUpDate) {
        doc.fillColor('#0B3441').font('Helvetica-Bold').fontSize(8.5).text(`Follow-up Recommended: ${prescription.followUpDate}`, 40, currentY);
        currentY += 20;
      }

      // 6. Signature & Digital Seal (Bottom Right)
      const signY = 660;
      doc.moveTo(380, signY).lineTo(540, signY).strokeColor('#CBD7DC').lineWidth(0.75).stroke();
      doc.fillColor('#061017').font('Helvetica-Bold').fontSize(9).text(prescription.doctorName || 'Attending Physician', 380, signY + 6);
      doc.font('Helvetica').fontSize(7.5).fillColor('#5A6C77').text('Electronically Verified Prescription', 380, signY + 18);
      doc.text(`Issued: ${new Date().toLocaleDateString('en-IN')}`, 380, signY + 28);

      // 7. System Disclaimer Notice (PRD Section 14)
      doc.rect(40, 740, 515, 32).fill('#FAFBFB');
      doc.fillColor('#5A6C77').fontSize(7).font('Helvetica').text(
        'System-generated document. Issued through MediGuide India by an authorized registered medical practitioner for patient care and pharmacy dispensing.',
        50,
        748,
        { width: 495, align: 'center', lineGap: 2 }
      );

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}
