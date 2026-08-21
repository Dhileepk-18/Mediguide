import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import { useAppStore } from '../../store/appStore.js';
import { Modal } from '../../components/common/Modal.jsx';
import { FileText, UploadCloud, Eye, Download, Trash2, ShieldCheck, ExternalLink, } from 'lucide-react';
const CATEGORIES = [
    'All',
    'Lab Report',
    'Prescription',
    'Imaging / X-Ray',
    'Vaccination',
    'Discharge Summary',
    'General',
];
export const HealthRecordsPage = () => {
    const { addToast } = useAppStore();
    const [records, setRecords] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('All');
    // Upload Modal State
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('Lab Report');
    const [recordDate, setRecordDate] = useState(new Date().toISOString().split('T')[0]);
    const [doctorName, setDoctorName] = useState('');
    const [facility, setFacility] = useState('');
    const [summary, setSummary] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    // View Record Modal
    const [viewingRecord, setViewingRecord] = useState(null);
    useEffect(() => {
        loadRecords();
    }, []);
    const loadRecords = async () => {
        try {
            const res = await api.getHealthRecords();
            if (res.success) {
                setRecords(res.records);
            }
        }
        catch (err) {
            console.error('Failed to load health records:', err);
        }
    };
    const handleUpload = async (e) => {
        e.preventDefault();
        if (!title.trim()) {
            addToast({
                type: 'warning',
                title: 'Missing title',
                message: 'Please provide a title for the health record.',
            });
            return;
        }
        setIsUploading(true);
        try {
            const res = await api.addHealthRecord({
                title,
                category,
                recordDate,
                doctorName: doctorName || 'Attending Physician',
                facility: facility || 'Metro Diagnostics Vault',
                summary: summary || 'Document uploaded by patient.',
                fileName: `${title.replace(/\s+/g, '_')}.pdf`,
                fileUrl: '#',
                fileSize: '1.2 MB',
                fileType: 'application/pdf',
                tags: [category, 'Encrypted'],
            });
            if (res.success) {
                addToast({
                    type: 'success',
                    title: 'Health Record Uploaded',
                    message: `${title} stored safely in your vault.`,
                });
                setIsUploadModalOpen(false);
                setTitle('');
                setDoctorName('');
                setFacility('');
                setSummary('');
                loadRecords();
            }
        }
        catch (err) {
            addToast({
                type: 'error',
                title: 'Upload failed',
                message: err.message || 'Could not upload record.',
            });
        }
        finally {
            setIsUploading(false);
        }
    };
    const handleDownloadRecord = (record) => {
        const content = `=====================================================
MEDIGUIDE DIGITAL HEALTH VAULT - CLINICAL REPORT
=====================================================
Document Title:    ${record.title}
Category:          ${record.category}
Record Date:       ${record.recordDate}
Attending Doctor:  ${record.doctorName || 'N/A'}
Facility:          ${record.facility || 'MediGuide Digital Vault'}
Record ID:         ${record.id}
File Name:         ${record.fileName}
=====================================================
DIAGNOSTIC SUMMARY & CLINICAL NOTES:
-----------------------------------------------------
${record.summary || 'No summary notes provided.'}
=====================================================
Verified & Stored in MediGuide Encrypted Vault
Timestamp: ${new Date().toISOString()}
=====================================================`;
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${record.fileName.replace(/\.pdf$/i, '')}_Record.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        addToast({
            type: 'success',
            title: 'File Downloaded',
            message: `${record.fileName} downloaded to your device.`,
        });
    };
    const handleDeleteRecord = async (id, recordTitle) => {
        if (!window.confirm(`Delete record: ${recordTitle}?`))
            return;
        try {
            const res = await api.deleteHealthRecord(id);
            if (res.success) {
                addToast({
                    type: 'info',
                    title: 'Record Deleted',
                    message: `${recordTitle} removed.`,
                });
                setRecords((prev) => prev.filter((r) => r.id !== id));
            }
        }
        catch {
            addToast({
                type: 'error',
                title: 'Delete failed',
                message: 'Could not delete record.',
            });
        }
    };
    const filteredRecords = records.filter((r) => selectedCategory === 'All' || r.category === selectedCategory);
    return (<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-ink-main">Digital Health Records Vault</h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-health-100 text-health-800 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-health-600"/>
              Encrypted
            </span>
          </div>
          <p className="text-xs sm:text-sm text-ink-muted">
            Organize lab tests, diagnostic scans, vaccination histories, and medical documents in one secure repository.
          </p>
        </div>

        <button onClick={() => setIsUploadModalOpen(true)} className="px-5 py-2.5 rounded-2xl bg-health-500 hover:bg-health-600 text-white font-bold text-xs shadow-soft transition-all flex items-center gap-2 self-start md:self-auto">
          <UploadCloud className="w-4 h-4"/>
          <span>Upload Medical Record</span>
        </button>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {CATEGORIES.map((cat) => (<button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap border transition-all ${selectedCategory === cat
                ? 'bg-health-500 text-white border-health-600 shadow-sm'
                : 'bg-surface text-ink-muted border-surface-border hover:bg-surface-muted'}`}>
            {cat}
          </button>))}
      </div>

      {/* Records Cards Grid */}
      {filteredRecords.length > 0 ? (<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecords.map((record) => (<div key={record.id} className="bg-surface rounded-3xl p-6 border border-surface-border shadow-soft hover:shadow-md hover:border-health-300 transition-all flex flex-col justify-between space-y-4 group">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-health-100 text-health-700 flex items-center justify-center shrink-0">
                    <FileText className="w-6 h-6"/>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-health-100 text-health-800">
                    {record.category}
                  </span>
                </div>

                <div>
                  <h3 className="font-extrabold text-sm text-ink-main line-clamp-1">{record.title}</h3>
                  <p className="text-xs text-ink-muted line-clamp-2 mt-1 leading-relaxed">
                    {record.summary || 'Clinical report record.'}
                  </p>
                </div>

                <div className="p-3 bg-surface-muted rounded-2xl space-y-1 text-[11px] text-ink-muted">
                  <div className="flex items-center justify-between">
                    <span>Date:</span>
                    <span className="font-semibold text-ink-main">{record.recordDate}</span>
                  </div>
                  {record.facility && (<div className="flex items-center justify-between">
                      <span>Facility:</span>
                      <span className="font-semibold text-ink-main truncate max-w-[150px]">
                        {record.facility}
                      </span>
                    </div>)}
                  <div className="flex items-center justify-between text-[10px] text-health-700 font-semibold pt-1">
                    <span>{record.fileName}</span>
                    <span>{record.fileSize}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2 border-t border-surface-border">
                <button onClick={() => setViewingRecord(record)} className="flex-1 py-2 rounded-xl bg-health-50 hover:bg-health-100 text-health-900 text-xs font-bold transition-colors flex items-center justify-center gap-1.5">
                  <Eye className="w-3.5 h-3.5"/>
                  <span>View Details</span>
                </button>
                <button onClick={() => handleDownloadRecord(record)} className="p-2 rounded-xl border border-surface-border text-ink-muted hover:text-health-700 hover:bg-health-50 transition-colors" title="Download Document Record">
                  <Download className="w-4 h-4"/>
                </button>
                <button onClick={() => handleDeleteRecord(record.id, record.title)} className="p-2 rounded-xl border border-surface-border text-ink-muted hover:text-status-danger hover:bg-red-50 transition-colors" title="Delete File">
                  <Trash2 className="w-4 h-4"/>
                </button>
              </div>
            </div>))}
        </div>) : (<div className="p-12 bg-surface rounded-3xl border border-surface-border text-center space-y-3">
          <FileText className="w-10 h-10 text-health-500 mx-auto"/>
          <h3 className="font-bold text-sm text-ink-main">No health records in this category</h3>
          <p className="text-xs text-ink-muted max-w-sm mx-auto">
            Upload your lab test reports, radiology imaging, or immunization cards for safekeeping.
          </p>
          <button onClick={() => setIsUploadModalOpen(true)} className="px-4 py-2 bg-health-500 text-white rounded-xl text-xs font-bold">
            Upload Record
          </button>
        </div>)}

      {/* Upload Record Modal */}
      <Modal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} title="Upload Medical Record" subtitle="Save lab reports, scans, or vaccination certificates.">
        <form onSubmit={handleUpload} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-ink-main mb-1.5">Document Title</label>
            <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Complete Blood Count (CBC) Panel" className="w-full px-4 py-2.5 text-xs bg-surface-muted rounded-xl border border-surface-border focus:outline-none focus:border-health-400"/>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-ink-main mb-1.5">Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-3 py-2.5 text-xs bg-surface-muted rounded-xl border border-surface-border focus:outline-none focus:border-health-400">
                <option value="Lab Report">Lab Report</option>
                <option value="Prescription">Prescription</option>
                <option value="Imaging / X-Ray">Imaging / X-Ray</option>
                <option value="Vaccination">Vaccination</option>
                <option value="Discharge Summary">Discharge Summary</option>
                <option value="General">General</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-ink-main mb-1.5">Date of Record</label>
              <input type="date" required value={recordDate} onChange={(e) => setRecordDate(e.target.value)} className="w-full px-4 py-2.5 text-xs bg-surface-muted rounded-xl border border-surface-border focus:outline-none focus:border-health-400"/>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-ink-main mb-1.5">Doctor / Physician Name</label>
              <input type="text" value={doctorName} onChange={(e) => setDoctorName(e.target.value)} placeholder="e.g. Dr. John Smith" className="w-full px-4 py-2.5 text-xs bg-surface-muted rounded-xl border border-surface-border focus:outline-none focus:border-health-400"/>
            </div>

            <div>
              <label className="block text-xs font-bold text-ink-main mb-1.5">Medical Facility / Lab</label>
              <input type="text" value={facility} onChange={(e) => setFacility(e.target.value)} placeholder="e.g. Metropolitan Diagnostics" className="w-full px-4 py-2.5 text-xs bg-surface-muted rounded-xl border border-surface-border focus:outline-none focus:border-health-400"/>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-ink-main mb-1.5">Clinical Summary / Key Findings</label>
            <textarea rows={3} value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="e.g. Total cholesterol 172 mg/dL, HDL 58 mg/dL. All metabolic parameters within normal reference ranges..." className="w-full px-4 py-2.5 text-xs bg-surface-muted rounded-xl border border-surface-border focus:outline-none focus:border-health-400"/>
          </div>

          {/* Simulated File Drag Drop Area */}
          <div className="p-4 rounded-2xl border-2 border-dashed border-health-300 bg-health-50/50 text-center space-y-1">
            <UploadCloud className="w-6 h-6 text-health-600 mx-auto"/>
            <p className="text-xs font-bold text-health-900">Document Upload Attached (PDF/Image)</p>
            <p className="text-[10px] text-ink-muted">Encrypted on upload • Max 25 MB</p>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setIsUploadModalOpen(false)} className="flex-1 py-2.5 rounded-xl border border-surface-border text-xs font-bold text-ink-muted hover:bg-surface-muted">
              Cancel
            </button>
            <button type="submit" disabled={isUploading} className="flex-1 py-2.5 rounded-xl bg-health-500 hover:bg-health-600 text-white text-xs font-bold shadow-soft flex items-center justify-center gap-1.5 disabled:opacity-50">
              <span>{isUploading ? 'Uploading...' : 'Save Document to Vault'}</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* View Record Details Modal */}
      {viewingRecord && (<Modal isOpen={Boolean(viewingRecord)} onClose={() => setViewingRecord(null)} title={viewingRecord.title} subtitle={`${viewingRecord.category} • Recorded: ${viewingRecord.recordDate}`}>
          <div className="space-y-4">
            <div className="p-4 bg-health-50 rounded-2xl border border-health-200 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-health-900">Clinical Facility:</span>
                <span className="text-ink-main">{viewingRecord.facility || 'Not specified'}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-health-900">Physician:</span>
                <span className="text-ink-main">{viewingRecord.doctorName || 'Not specified'}</span>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-ink-main mb-1">Diagnostic Summary:</h4>
              <p className="text-xs text-ink-muted leading-relaxed p-3.5 bg-surface-muted rounded-2xl border border-surface-border">
                {viewingRecord.summary}
              </p>
            </div>

            <div className="flex gap-2">
              <button onClick={() => handleDownloadRecord(viewingRecord)} className="flex-1 py-2.5 bg-health-500 hover:bg-health-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors">
                <Download className="w-4 h-4"/>
                <span>Download Clinical File</span>
              </button>
            </div>
          </div>
        </Modal>)}
    </div>);
};
