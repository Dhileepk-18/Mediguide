import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import { useAppStore } from '../../store/appStore.js';
import {
    Layers,
    Plus,
    Edit2,
    Trash2,
    Stethoscope,
    Building2,
    CheckCircle2,
    X,
    Search,
} from 'lucide-react';

export const AdminDepartmentsPage = () => {
    const { addToast } = useAppStore();
    const [departments, setDepartments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    // Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingDeptId, setEditingDeptId] = useState(null);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [icon, setIcon] = useState('Stethoscope');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        loadDepartments();
    }, []);

    const loadDepartments = async () => {
        try {
            setIsLoading(true);
            const res = await api.getDepartments();
            if (res.success) {
                setDepartments(res.departments || []);
            }
        } catch (err) {
            console.error('Failed to load departments:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenAdd = () => {
        setEditingDeptId(null);
        setName('');
        setDescription('');
        setIcon('Stethoscope');
        setIsModalOpen(true);
    };

    const handleOpenEdit = (dept) => {
        setEditingDeptId(dept.id);
        setName(dept.name);
        setDescription(dept.description || '');
        setIcon(dept.icon || 'Stethoscope');
        setIsModalOpen(true);
    };

    const handleSaveDepartment = async (e) => {
        e.preventDefault();
        if (!name.trim()) {
            addToast({
                type: 'warning',
                title: 'Missing Name',
                message: 'Please enter department name.',
            });
            return;
        }

        setIsSaving(true);
        try {
            if (editingDeptId) {
                const res = await api.updateDepartment(editingDeptId, { name, description, icon });
                if (res.success) {
                    addToast({
                        type: 'success',
                        title: 'Department Updated',
                        message: `${name} updated successfully.`,
                    });
                }
            } else {
                const res = await api.createDepartment({ name, description, icon });
                if (res.success) {
                    addToast({
                        type: 'success',
                        title: 'Department Created',
                        message: `${name} added to hospital specialties.`,
                    });
                }
            }
            setIsModalOpen(false);
            loadDepartments();
        } catch (err) {
            addToast({
                type: 'error',
                title: 'Save Failed',
                message: err.message || 'Could not save department.',
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteDepartment = async (id, deptName) => {
        if (!window.confirm(`Delete department: ${deptName}?`)) return;
        try {
            const res = await api.deleteDepartment(id);
            if (res.success) {
                addToast({
                    type: 'info',
                    title: 'Department Deleted',
                    message: `${deptName} has been removed.`,
                });
                loadDepartments();
            }
        } catch {
            addToast({
                type: 'error',
                title: 'Delete Failed',
                message: 'Could not delete department.',
            });
        }
    };

    const filteredDepartments = departments.filter(d =>
        d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-health-100 text-health-800 text-xs font-semibold mb-2">
                        <Layers className="w-3.5 h-3.5 text-health-600" />
                        <span>Medical Specialties & Clinical Services</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-ink-main">Medical Departments</h1>
                    <p className="text-xs sm:text-sm text-ink-muted">
                        Configure clinical departments, routing rules for AI symptom checker triage, and specialty doctors.
                    </p>
                </div>

                <button
                    onClick={handleOpenAdd}
                    className="px-5 py-3 rounded-2xl bg-health-500 hover:bg-health-600 text-white font-bold text-xs sm:text-sm shadow-soft transition-all flex items-center gap-2 self-start md:self-auto"
                >
                    <Plus className="w-4 h-4" />
                    <span>Add Department</span>
                </button>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                    type="text"
                    placeholder="Search medical departments..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-surface border border-surface-border text-xs font-medium focus:outline-none focus:ring-1 focus:ring-health-500 shadow-sm"
                />
            </div>

            {/* Departments Grid */}
            {isLoading ? (
                <div className="py-16 text-center">
                    <div className="w-10 h-10 border-4 border-health-200 border-t-health-600 rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-xs text-ink-muted">Loading departments...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredDepartments.map((dept) => (
                        <div
                            key={dept.id}
                            className="bg-surface rounded-3xl border border-surface-border p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                        >
                            <div className="space-y-3">
                                <div className="flex items-start justify-between">
                                    <div className="w-12 h-12 rounded-2xl bg-health-100 text-health-700 flex items-center justify-center font-bold">
                                        <Stethoscope className="w-6 h-6" />
                                    </div>
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-surface-muted text-ink-muted">
                                        {dept.doctorCount || 1} Specialists
                                    </span>
                                </div>

                                <div>
                                    <h3 className="text-base font-bold text-ink-main">{dept.name}</h3>
                                    <p className="text-xs text-ink-muted mt-1 leading-relaxed">
                                        {dept.description}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-5 pt-4 border-t border-surface-border flex items-center justify-end gap-2">
                                <button
                                    onClick={() => handleOpenEdit(dept)}
                                    className="p-2 rounded-xl text-ink-muted hover:text-health-700 hover:bg-health-50 transition-colors"
                                    title="Edit Department"
                                >
                                    <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleDeleteDepartment(dept.id, dept.name)}
                                    className="p-2 rounded-xl text-ink-muted hover:text-red-600 hover:bg-red-50 transition-colors"
                                    title="Delete Department"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Department Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-surface rounded-3xl shadow-2xl border border-surface-border max-w-md w-full overflow-hidden">
                        <div className="p-6 bg-gradient-to-r from-health-700 to-health-600 text-white flex items-start justify-between">
                            <div>
                                <h3 className="text-base font-bold">{editingDeptId ? 'Edit Medical Department' : 'Create Department'}</h3>
                                <p className="text-xs text-health-100">Configures AI triage and doctor taxonomy</p>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSaveDepartment} className="p-6 space-y-4 text-xs font-medium">
                            <div>
                                <label className="block text-[11px] font-bold text-ink-muted mb-1">Department Name</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Cardiology, Dermatology, Orthopedics"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full p-2.5 rounded-xl border border-surface-border bg-surface text-ink-main font-semibold focus:outline-none focus:ring-1 focus:ring-health-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold text-ink-muted mb-1">Description / Clinical Scope</label>
                                <textarea
                                    rows="3"
                                    placeholder="e.g. Cardiovascular care, hypertension management, ECG, and echocardiograms..."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="w-full p-2.5 rounded-xl border border-surface-border bg-surface text-ink-main"
                                    required
                                />
                            </div>

                            <div className="pt-2 flex items-center justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 rounded-xl border border-surface-border text-ink-muted font-bold hover:bg-surface-muted"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="px-6 py-2 bg-health-500 hover:bg-health-600 text-white rounded-xl font-bold shadow-soft transition-all"
                                >
                                    {isSaving ? 'Saving...' : editingDeptId ? 'Update Department' : 'Create Department'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
