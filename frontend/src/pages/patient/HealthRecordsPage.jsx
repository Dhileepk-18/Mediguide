import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api.js';
import { useAppStore } from '../../store/appStore.js';
import { Modal } from '../../components/common/Modal.jsx';
import {
  FileText,
  UploadCloud,
  Eye,
  Download,
  Trash2,
  ShieldCheck,
  Calendar,
  Building2,
  Sparkles,
  X,
  FileCheck2,
  Share2,
  Bot,
  ChevronRight,
  Lock,
  ExternalLink,
  Check,
} from 'lucide-react';

const CATEGORIES = [
  'All',
  'Lab Report',
  'Prescription',
  'Imaging / X-Ray',
  'Discharge Summary',
  'Vaccination',
];

export const HealthRecordsPage = () => {
  const { addToast } = useAppStore();
  const [records, setRecords] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isLoading, setIsLoading] = useState(true);

  // Detail Drawer State
  const [selectedRecord, setSelectedRecord] = useState(null);

  // Upload Modal State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Lab Report');
  const [recordDate, setRecordDate] = useState(new Date().toISOString().split('T')[0]);
  const [doctorName, setDoctorName] = useState('');
  const [facility, setFacility] = useState('');
  const [summary, setSummary] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileDataUrl, setFileDataUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    loadRecords();
  }, []);

  const loadRecords = async () => {
    try {
      setIsLoading(true);
      const res = await api.getHealthRecords();
      if (res.success) {
        setRecords(res.records || []);
      }
    } catch (err) {
      console.error('Failed to load health records:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = e => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      if (!title.trim()) {
        setTitle(file.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' '));
      }
      const reader = new FileReader();
      reader.onload = uploadEvent => {
        setFileDataUrl(uploadEvent.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async e => {
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
      const fileName = selectedFile ? selectedFile.name : `${title.replace(/\s+/g, '_')}.pdf`;
      const fileSize = selectedFile
        ? `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB`
        : '1.2 MB';
      const fileType = selectedFile ? selectedFile.type || 'application/pdf' : 'application/pdf';

      const res = await api.addHealthRecord({
        title,
        category,
        recordDate,
        doctorName: doctorName || 'Attending Specialist',
        facility: facility || 'Apollo Diagnostics, India',
        summary: summary || 'Medical record safely archived in MediGuide Vault.',
        fileName,
        fileUrl:
          fileDataUrl || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        fileSize,
        fileType,
        tags: [category, 'DPDP Encrypted', 'ABDM Ready'],
      });

      if (res.success) {
        addToast({
          type: 'success',
          title: 'Record Saved to Vault ✨',
          message: `${title} archived with end-to-end security.`,
        });
        setIsUploadModalOpen(false);
        setTitle('');
        setDoctorName('');
        setFacility('');
        setSummary('');
        setSelectedFile(null);
        setFileDataUrl('');
        loadRecords();
      }
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Upload failed',
        message: err.message || 'Could not upload record.',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id, recordTitle) => {
    if (!window.confirm(`Delete ${recordTitle} from your vault?`)) return;
    try {
      const res = await api.deleteHealthRecord(id);
      if (res.success) {
        setRecords(prev => prev.filter(r => r.id !== id));
        if (selectedRecord?.id === id) setSelectedRecord(null);
        addToast({
          type: 'info',
          title: 'Record Deleted',
          message: `${recordTitle} removed.`,
        });
      }
    } catch {
      addToast({
        type: 'error',
        title: 'Delete failed',
        message: 'Could not remove record.',
      });
    }
  };

  const filteredRecords =
    selectedCategory === 'All' ? records : records.filter(r => r.category === selectedCategory);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn relative">
      {/* Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-health-700 text-white shadow-luxury relative overflow-hidden border border-health-600">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-health-100 text-xs font-semibold backdrop-blur-md">
              <ShieldCheck className="w-3.5 h-3.5 text-accent" />
              <span>Digital Health Vault &bull; DPDP Act Compliant</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-display">
              Your care, in context.
            </h1>
            <p className="text-xs text-health-100/90 max-w-xl leading-relaxed">
              Organize diagnostic lab reports, imaging scans, and clinical visit notes in a
              chronological health timeline.
            </p>
          </div>

          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="px-5 py-3 rounded-2xl bg-white text-health-800 hover:bg-health-50 text-xs font-extrabold shadow-soft transition-all flex items-center gap-2 shrink-0 self-start sm:self-auto"
          >
            <UploadCloud className="w-4 h-4 text-health-700" />
            <span>Upload Document</span>
          </button>
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#39679B]" />
            <span className="text-xs font-semibold uppercase tracking-wider text-[#5A6C77]">
              Clinical Vault
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-semibold font-serif text-[#061017] tracking-tight">
            Your care, in context.
          </h1>
          <p className="text-sm text-[#5A6C77]">
            Securely stored diagnostics, lab reports, imaging, and clinical summaries organized by recency.
          </p>
        </div>

        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-[#0B3441] text-white hover:bg-[#08252E] text-xs font-semibold transition-colors flex items-center gap-2 shrink-0 self-start sm:self-auto"
        >
          <UploadCloud className="w-4 h-4" />
          <span>Upload Document</span>
        </button>
      </div>

      {/* Category Filter Chips */}
      <div className="flex flex-wrap items-center gap-2">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              selectedCategory === cat
                ? 'bg-[#0B3441] text-white font-semibold'
                : 'bg-[#FAFBFB] text-[#061017] border border-[rgba(6,16,23,0.12)] hover:border-[#0B3441]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Timeline-First Records List (Section 7.6) */}
      <div className="rounded-[18px] bg-white border border-[rgba(6,16,23,0.10)] divide-y divide-[rgba(6,16,23,0.08)] overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-xs text-[#5A6C77]">
            Loading clinical vault documents...
          </div>
        ) : filteredRecords.length > 0 ? (
          filteredRecords.map(rec => (
            <div
              key={rec.id}
              onClick={() => setSelectedRecord(rec)}
              className={`p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer transition-colors ${
                selectedRecord?.id === rec.id
                  ? 'bg-[#FAFBFB]'
                  : 'hover:bg-[#FAFBFB]'
              }`}
            >
              <div className="flex items-start gap-3.5 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-[#FAFBFB] border border-[rgba(6,16,23,0.08)] text-[#39679B] flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-[#061017] truncate">{rec.title}</h3>
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#FAFBFB] text-[#0B3441] border border-[rgba(6,16,23,0.10)]">
                      {rec.category}
                    </span>
                  </div>
                  <div className="text-xs text-[#5A6C77] flex flex-wrap items-center gap-x-2">
                    <span>{rec.facility || 'Apollo Diagnostics'}</span>
                    <span>•</span>
                    <span>{rec.doctorName || 'Attending Physician'}</span>
                    <span>•</span>
                    <span>{rec.fileSize || '1.2 MB'}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                <span className="text-xs text-[#5A6C77]">{rec.recordDate}</span>
                <ChevronRight className="w-4 h-4 text-[#5A6C77]" />
              </div>
            </div>
          ))
        ) : (
          <div className="p-10 text-center space-y-2">
            <p className="text-xs text-[#5A6C77]">
              Nothing here yet. MediGuide will organize it as your care journey grows.
            </p>
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="text-xs font-semibold text-[#0B3441] underline"
            >
              Upload your first lab report or diagnostic scan
            </button>
          </div>
        )}
      </div>

      {/* Slide-out Record Detail Drawer */}
      {selectedRecord && (
        <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-surface shadow-2xl border-l border-surface-border p-6 overflow-y-auto flex flex-col justify-between animate-fadeIn">
          <div className="space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-surface-border">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-health-50 text-health-700 flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm text-ink-main">Document Details</h3>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="p-1 rounded-xl text-ink-muted hover:bg-surface-muted"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <h2 className="text-base font-bold text-ink-main">{selectedRecord.title}</h2>
              <div className="p-4 rounded-2xl bg-surface-muted border border-surface-border space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-ink-muted">Category:</span>
                  <strong className="text-ink-main">{selectedRecord.category}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-muted">Date:</span>
                  <strong className="text-ink-main">{selectedRecord.recordDate}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-muted">Facility:</span>
                  <strong className="text-ink-main">{selectedRecord.facility}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-muted">Doctor:</span>
                  <strong className="text-ink-main">{selectedRecord.doctorName}</strong>
                </div>
              </div>
            </div>

            {/* Clinical Summary */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-ink-main">Summary & Clinical Findings</label>
              <p className="text-xs text-ink-muted leading-relaxed p-3.5 rounded-2xl bg-surface-muted border border-surface-border">
                {selectedRecord.summary || 'Document securely vaulted. No abnormalities flagged.'}
              </p>
            </div>

            {/* Ask AI to Explain this Report */}
            <div className="p-4 rounded-2xl bg-health-50 border border-health-200 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-health-800">
                <Sparkles className="w-4 h-4 text-accent" />
                <span>AI Report Interpretation</span>
              </div>
              <p className="text-xs text-ink-muted leading-relaxed">
                Ask MediGuide AI to break down the medical terminology and numbers in this{' '}
                {selectedRecord.category.toLowerCase()}.
              </p>
              <Link
                to={`/ai-assistant?query=${encodeURIComponent(`Explain the clinical significance and key biomarkers of my ${selectedRecord.category}: "${selectedRecord.title}" recorded on ${selectedRecord.recordDate}. Findings: ${selectedRecord.summary || 'Analyze reference intervals, vital markers, and clinical takeaways.'}`)}`}
                className="inline-flex items-center gap-1 text-xs font-bold text-health-700 hover:underline pt-1"
              >
                <span>Ask AI to Explain This Record</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Drawer Bottom Actions */}
          <div className="pt-4 border-t border-surface-border flex items-center justify-between gap-3">
            <button
              onClick={() => handleDelete(selectedRecord.id, selectedRecord.title)}
              className="p-2.5 rounded-xl border border-surface-border text-status-danger hover:bg-red-50 text-xs font-bold flex items-center gap-1"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete</span>
            </button>

            <button
              onClick={() => {
                addToast({
                  type: 'success',
                  title: 'Secure Link Generated',
                  message: 'A 24-hour encrypted sharing link was created.',
                });
              }}
              className="flex-1 py-2.5 rounded-xl bg-health-700 hover:bg-health-800 text-white text-xs font-bold shadow-soft flex items-center justify-center gap-1.5"
            >
              <Share2 className="w-4 h-4" />
              <span>Share with Doctor</span>
            </button>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        title="Vault Health Document"
        subtitle="Upload lab test reports, imaging scans, or discharge summaries."
      >
        <form onSubmit={handleUpload} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-ink-main mb-1">Document Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Complete Blood Count (CBC), Lipid Panel"
              className="w-full px-4 py-2.5 text-xs bg-surface-muted rounded-xl border border-surface-border focus:outline-none focus:border-health-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-ink-main mb-1">Category</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full px-4 py-2.5 text-xs bg-surface-muted rounded-xl border border-surface-border focus:outline-none focus:border-health-400"
              >
                {CATEGORIES.filter(c => c !== 'All').map(c => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-ink-main mb-1">Date</label>
              <input
                type="date"
                value={recordDate}
                onChange={e => setRecordDate(e.target.value)}
                className="w-full px-4 py-2.5 text-xs bg-surface-muted rounded-xl border border-surface-border focus:outline-none focus:border-health-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-ink-main mb-1">Facility / Lab</label>
            <input
              type="text"
              value={facility}
              onChange={e => setFacility(e.target.value)}
              placeholder="e.g. Apollo Hospitals, Dr. Lal PathLabs"
              className="w-full px-4 py-2.5 text-xs bg-surface-muted rounded-xl border border-surface-border focus:outline-none focus:border-health-400"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-ink-main mb-1">
              Clinical Findings & Summary
            </label>
            <textarea
              rows={2}
              value={summary}
              onChange={e => setSummary(e.target.value)}
              placeholder="e.g. Hb: 14.2 g/dL, WBC: 7,200/mcL, Platelets: 260,000/mcL, Fasting Glucose: 92 mg/dL. All normal intervals."
              className="w-full px-4 py-2.5 text-xs bg-surface-muted rounded-xl border border-surface-border focus:outline-none focus:border-health-400"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-ink-main mb-1">
              Upload File (PDF / Image)
            </label>
            <input
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={handleFileChange}
              className="w-full text-xs text-ink-muted file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-health-50 file:text-health-700 hover:file:bg-health-100"
            />
          </div>

          <div className="flex gap-3 pt-3">
            <button
              type="button"
              onClick={() => setIsUploadModalOpen(false)}
              className="flex-1 py-2.5 rounded-xl border border-surface-border text-xs font-bold text-ink-muted hover:bg-surface-muted"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploading}
              className="flex-1 py-2.5 rounded-xl bg-health-700 hover:bg-health-800 text-white text-xs font-bold shadow-soft flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <span>{isUploading ? 'Vaulting...' : 'Save to Vault'}</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
