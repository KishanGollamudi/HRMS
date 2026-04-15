import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Building2, Lock, Save, Eye, EyeOff, CheckCircle, XCircle, Pencil } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';

const ROLE_GRADIENT = {
  manager: 'linear-gradient(135deg,#111827,#374151)',
  hr:      'linear-gradient(135deg,#a42e43,#D45769)',
  trainer: 'linear-gradient(135deg,#0d4f4a,#14b8a6)',
};

const Toast = ({ toast }) => {
  if (!toast) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
      className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium ${
        toast.type === 'success'
          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
          : 'bg-red-50 text-red-700 border border-red-200'
      }`}
    >
      {toast.type === 'success' ? <CheckCircle size={15} /> : <XCircle size={15} />}
      {toast.message}
    </motion.div>
  );
};

export default function ProfilePage() {
  const { user, login } = useAuth();
  const role     = user?.role ?? 'trainer';
  const gradient = ROLE_GRADIENT[role] ?? ROLE_GRADIENT.trainer;

  const [profile,   setProfile]   = useState(null);
  const [editMode,  setEditMode]  = useState(false);
  const [form,      setForm]      = useState({});
  const [saving,    setSaving]    = useState(false);
  const [toast,     setToast]     = useState(null);

  const [pwdForm,   setPwdForm]   = useState({ oldPassword: '', newPassword: '', confirm: '' });
  const [showOld,   setShowOld]   = useState(false);
  const [showNew,   setShowNew]   = useState(false);
  const [pwdSaving, setPwdSaving] = useState(false);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  // Load profile
  useEffect(() => {
    api.get('/auth/profile')
      .then((res) => {
        const data = res?.data ?? res;
        setProfile(data);
        setForm({
          name:       data.name       ?? '',
          email:      data.email      ?? '',
          phone:      data.phone      ?? '',
          department: data.department ?? '',
        });
      })
      .catch(() => showToast('error', 'Failed to load profile'));
  }, []);

  const handleSave = async () => {
    if (!form.name?.trim()) { showToast('error', 'Name is required'); return; }
    if (!form.email?.trim()) { showToast('error', 'Email is required'); return; }
    setSaving(true);
    try {
      const res  = await api.put('/auth/profile', form);
      const data = res?.data ?? res;
      setProfile(data);
      setEditMode(false);
      showToast('success', 'Profile updated successfully');
    } catch (err) {
      showToast('error', err.message ?? 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!pwdForm.oldPassword || !pwdForm.newPassword) { showToast('error', 'All fields required'); return; }
    if (pwdForm.newPassword.length < 6) { showToast('error', 'New password must be at least 6 characters'); return; }
    if (pwdForm.newPassword !== pwdForm.confirm) { showToast('error', 'Passwords do not match'); return; }
    setPwdSaving(true);
    try {
      await api.put('/auth/change-password', {
        oldPassword: pwdForm.oldPassword,
        newPassword: pwdForm.newPassword,
      });
      setPwdForm({ oldPassword: '', newPassword: '', confirm: '' });
      showToast('success', 'Password changed successfully');
    } catch (err) {
      showToast('error', err.message ?? 'Password change failed');
    } finally {
      setPwdSaving(false);
    }
  };

  if (!profile) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
    </div>
  );

  const initials = profile.name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() ?? '??';

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}
      className="max-w-2xl mx-auto px-4 py-8 space-y-6"
    >
      {/* Toast */}
      <Toast toast={toast} />

      {/* Profile card */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">

        {/* Banner */}
        <div className="h-24 w-full" style={{ background: gradient }} />

        {/* Avatar + name */}
        <div className="px-6 pb-6">
          <div className="flex items-end justify-between -mt-10 mb-4">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center text-white text-2xl font-bold border-4 border-white shadow-md"
              style={{ background: gradient }}
            >
              {initials}
            </div>
            <button
              onClick={() => setEditMode((v) => !v)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <Pencil size={12} /> {editMode ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>

          <h2 className="text-xl font-bold text-gray-900">{profile.name}</h2>
          <p className="text-sm text-gray-500 capitalize">{profile.role} · {profile.department ?? '—'}</p>
        </div>

        {/* Fields */}
        <div className="px-6 pb-6 space-y-4 border-t border-gray-100 pt-4">
          {[
            { key: 'name',       label: 'Full Name',   icon: User,     type: 'text'  },
            { key: 'email',      label: 'Email',       icon: Mail,     type: 'email' },
            { key: 'phone',      label: 'Phone',       icon: Phone,    type: 'tel'   },
            { key: 'department', label: 'Department',  icon: Building2,type: 'text'  },
          ].map(({ key, label, icon: Icon, type }) => (
            <div key={key}>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                {label}
              </label>
              <div className="relative">
                <Icon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  type={type}
                  value={editMode ? (form[key] ?? '') : (profile[key] ?? '—')}
                  onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
                  disabled={!editMode}
                  className={`w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border transition-all outline-none ${
                    editMode
                      ? 'border-gray-300 bg-white text-gray-900 focus:border-blue-400 focus:ring-2 focus:ring-blue-100'
                      : 'border-transparent bg-gray-50 text-gray-700 cursor-default'
                  }`}
                />
              </div>
            </div>
          ))}

          {editMode && (
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
              style={{ background: gradient, opacity: saving ? 0.7 : 1 }}
            >
              <Save size={14} />
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          )}
        </div>
      </div>

      {/* Change password card */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Lock size={16} className="text-gray-500" />
          <h3 className="text-base font-bold text-gray-900">Change Password</h3>
        </div>

        {[
          { key: 'oldPassword', label: 'Current Password', show: showOld, toggle: () => setShowOld((v) => !v) },
          { key: 'newPassword', label: 'New Password',     show: showNew, toggle: () => setShowNew((v) => !v) },
          { key: 'confirm',     label: 'Confirm New Password', show: showNew, toggle: () => setShowNew((v) => !v) },
        ].map(({ key, label, show, toggle }) => (
          <div key={key}>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
              {label}
            </label>
            <div className="relative">
              <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                type={show ? 'text' : 'password'}
                value={pwdForm[key]}
                onChange={(e) => setPwdForm((p) => ({ ...p, [key]: e.target.value }))}
                placeholder="••••••••"
                className="w-full pl-9 pr-10 py-2.5 text-sm rounded-xl border border-gray-300 bg-white text-gray-900 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
              />
              <button type="button" onClick={toggle}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {show ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>
        ))}

        <button
          onClick={handleChangePassword}
          disabled={pwdSaving}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
          style={{ background: gradient, opacity: pwdSaving ? 0.7 : 1 }}
        >
          <Lock size={14} />
          {pwdSaving ? 'Changing…' : 'Change Password'}
        </button>
      </div>
    </motion.div>
  );
}
