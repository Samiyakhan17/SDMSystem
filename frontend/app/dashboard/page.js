'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/AuthContext';
import api from '../../lib/api';
import ThreeLogo from '../../components/ThreeLogo';
import {
  FileText,
  Image as ImageIcon,
  File as FileIcon,
  Upload,
  Download,
  Pencil,
  Trash2,
  Search,
  LogOut,
  FolderClosed,
  Users,
  Loader2,
} from 'lucide-react';

function fileIconFor(mimeType) {
  if (mimeType?.startsWith('image/')) return ImageIcon;
  if (mimeType === 'application/pdf') return FileText;
  return FileIcon;
}

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function DashboardPage() {
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef(null);

  const [documents, setDocuments] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [actionId, setActionId] = useState(null);

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
  }, [authLoading, user, router]);

  useEffect(() => {
    if (user) fetchDocuments();
  }, [user]);

  async function fetchDocuments(searchTerm = '') {
    try {
      setLoadingDocs(true);
      const { data } = await api.get('/documents', {
        params: searchTerm ? { search: searchTerm } : {},
      });
      setDocuments(data.documents);
      setError('');
    } catch (err) {
      setError('Failed to load documents');
    } finally {
      setLoadingDocs(false);
    }
  }

  function handleSearchChange(e) {
    const value = e.target.value;
    setSearch(value);
    fetchDocuments(value);
  }

  async function handleFileSelected(e) {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      setUploading(true);
      setError('');
      await api.post('/documents', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      await fetchDocuments(search);
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  async function handleDownload(doc) {
    try {
      setActionId(doc._id);
      const { data } = await api.get(`/documents/${doc._id}/download`);
      window.open(data.downloadUrl, '_blank');
    } catch (err) {
      setError(err.response?.data?.message || 'Download failed');
    } finally {
      setActionId(null);
    }
  }

  async function handleRename(doc) {
    const newName = window.prompt('Rename document:', doc.name);
    if (!newName || newName === doc.name) return;

    try {
      setActionId(doc._id);
      await api.put(`/documents/${doc._id}`, { name: newName });
      await fetchDocuments(search);
    } catch (err) {
      setError(err.response?.data?.message || 'Rename failed');
    } finally {
      setActionId(null);
    }
  }

  async function handleDelete(doc) {
    if (!window.confirm(`Move "${doc.name}" to trash?`)) return;

    try {
      setActionId(doc._id);
      await api.delete(`/documents/${doc._id}`);
      await fetchDocuments(search);
    } catch (err) {
      setError(err.response?.data?.message || 'Delete failed');
    } finally {
      setActionId(null);
    }
  }

  if (authLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#373F47]">
        <Loader2 className="h-6 w-6 animate-spin text-[#8fa3bd]" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#373F47]">
      {/* Sidebar */}
      <aside className="hidden w-56 flex-col border-r border-white/10 bg-[#1a1e23] sm:flex">
        <div className="flex items-center gap-2 border-b border-white/10 bg-[#1a1e23] px-5 py-5">
          <ThreeLogo size={36} />
          <span className="font-semibold text-white">SDMS</span>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          <button className="flex w-full items-center gap-3 rounded-lg bg-[#526885] px-3 py-2 text-sm font-medium text-white shadow-lg shadow-[#373F47]/50 transition-all duration-200">
            <FileText size={18} />
            My Documents
          </button>
          <button
            disabled
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-white/70 transition-colors duration-200 hover:bg-white/5"
          >
            <FolderClosed size={18} />
            Folders
          </button>
          <button
            disabled
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-white/70 transition-colors duration-200 hover:bg-white/5"
          >
            <Users size={18} />
            Shared with me
          </button>
        </nav>

        <div className="border-t border-white/10 p-3">
          <div className="mb-2 px-2 text-xs text-white/50">Signed in as</div>
          <div className="mb-3 truncate px-2 text-sm font-medium text-white">{user.name}</div>
          <button
            onClick={logout}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-400 transition-all duration-200 hover:scale-[1.02] hover:bg-red-500/10 hover:text-red-400"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1">
        <header className="flex items-center justify-between gap-4 border-b border-white/10 bg-[#1a1e23] px-6 py-4">
          <div className="relative w-full max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search documents..."
              value={search}
              onChange={handleSearchChange}
              className="w-full rounded-lg border border-white/10 bg-white/5 py-2 pl-9 pr-3 text-sm text-white placeholder-white/50 transition-all duration-200 focus:border-[#526885] focus:outline-none focus:ring-2 focus:ring-[#526885]/30"
            />
          </div>

          <div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelected}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-2 rounded-lg bg-[#526885] px-4 py-2 text-sm font-medium text-white shadow-lg shadow-[#373F47]/50 transition-all duration-200 hover:scale-105 hover:bg-[#617999] disabled:opacity-50 disabled:hover:scale-100"
            >
              {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
              {uploading ? 'Uploading...' : 'Upload'}
            </button>
          </div>
        </header>

        <main className="mx-auto max-w-6xl p-6">
          <h2 className="mb-4 text-lg font-semibold text-white">My Documents</h2>

          {error && (
            <div className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
              {error}
            </div>
          )}

          {loadingDocs ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-[#8fa3bd]" />
            </div>
          ) : documents.length === 0 ? (
            <div className="rounded-xl border-2 border-dashed border-white/10 bg-[#2c333a] py-16 text-center">
              <Upload className="mx-auto mb-3 h-8 w-8 text-gray-600" />
              <p className="text-gray-400">No documents yet.</p>
              <p className="text-sm text-gray-600">Click Upload to add your first file.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {documents.map((doc) => {
                const Icon = fileIconFor(doc.mimeType);
                const isBusy = actionId === doc._id;
                return (
                  <div
                    key={doc._id}
                    className="group rounded-xl border border-white/10 bg-[#3d4551] p-4 shadow-lg shadow-black/20 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#526885]/40 hover:shadow-[#373F47]/50"
                  >
                    <div className="mb-3 flex items-start justify-between">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#526885]/20 text-[#8fa3bd]">
                        <Icon size={20} />
                      </div>
                      <div className="flex gap-1 opacity-0 transition group-hover:opacity-100">
                        <button
                          onClick={() => handleDownload(doc)}
                          disabled={isBusy}
                          title="Download"
                          className="rounded p-1.5 text-gray-400 hover:bg-white/10 hover:text-white"
                        >
                          <Download size={15} />
                        </button>
                        <button
                          onClick={() => handleRename(doc)}
                          disabled={isBusy}
                          title="Rename"
                          className="rounded p-1.5 text-gray-400 hover:bg-white/10 hover:text-white"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(doc)}
                          disabled={isBusy}
                          title="Delete"
                          className="rounded p-1.5 text-gray-400 hover:bg-red-500/10 hover:text-red-400"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                    <p className="truncate font-medium text-gray-100">{doc.name}</p>
                    <p className="mt-1 text-xs text-gray-500">
                      {formatSize(doc.size)} · v{doc.currentVersion}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}