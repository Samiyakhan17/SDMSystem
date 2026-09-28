'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/AuthContext';
import api from '../../lib/api';

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
  FolderPlus,
  Users,
  Loader2,
  ChevronLeft,
  FolderInput,
  Share2,
  MoreVertical,
  LayoutDashboard,
  Settings,
  Activity,
  RotateCcw,
} from 'lucide-react';

function fileIconFor(m) {
  if (m?.startsWith('image/')) return ImageIcon;
  if (m === 'application/pdf') return FileText;
  return FileIcon;
}

function formatSize(b) {
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / (1024 * 1024)).toFixed(1)} MB`;
}

export default function DashboardPage() {
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();

  const fileInputRef = useRef(null);

  const [documents, setDocuments] = useState([]);
  const [folders, setFolders] = useState([]);
  const [currentFolder, setCurrentFolder] = useState(null);

  const [loadingDocs, setLoadingDocs] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [actionId, setActionId] = useState(null);
  const [isTrash, setIsTrash] = useState(false);
  const [isActivity, setIsActivity] = useState(false);
  const [activities, setActivities] = useState([]);

  /* =========================
     AUTH
  ========================= */

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [authLoading, user, router]);

  /* =========================
     FETCH DATA
  ========================= */

  useEffect(() => {
    if (user) {
      fetchFolders();
      fetchDocuments();
    }
  }, [user, currentFolder]);

  async function fetchFolders() {
    try {
      const { data } = await api.get('/folders', {
        params: {
          parentFolderId: currentFolder?._id || 'null',
        },
      });

      setFolders(data.folders);
    } catch (err) {
      // silent
    }
  }

  async function fetchDocuments(searchTerm = '') {
    try {
      setLoadingDocs(true);

      const params = {
        folderId: currentFolder?._id || 'null',
      };

      if (searchTerm) {
        params.search = searchTerm;
      }

      const { data } = await api.get('/documents', {
        params,
      });

      setDocuments(data.documents);
      setError('');
    } catch (err) {
      setError('Failed to load documents');
    } finally {
      setLoadingDocs(false);
    }
  }

  async function fetchSharedDocuments() {
  try {
    setLoadingDocs(true);
    setError('');

    const { data } = await api.get('/documents/shared-with-me');

    setSharedDocuments(data.documents || []);
  } catch (err) {
    setError(
      err.response?.data?.message || 'Failed to load shared documents'
    );
  } finally {
    setLoadingDocs(false);
  }
}

  /* =========================
     SEARCH
  ========================= */

  function handleSearchChange(e) {
    const value = e.target.value;

    setSearch(value);
    fetchDocuments(value);
  }

  /* =========================
     UPLOAD
  ========================= */

  async function handleFileSelected(e) {
    const file = e.target.files[0];

    if (!file) return;

    const formData = new FormData();

    formData.append('file', file);

    if (currentFolder) {
      formData.append('folderId', currentFolder._id);
    }

    try {
      setUploading(true);
      setError('');

      await api.post('/documents', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      await fetchDocuments(search);
    } catch (err) {
      setError(
        err.response?.data?.message || 'Upload failed'
      );
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  /* =========================
     DOCUMENT ACTIONS
  ========================= */

  async function handleDownload(doc) {
    try {
      setActionId(doc._id);

      const { data } = await api.get(
        `/documents/${doc._id}/download`
      );

      window.open(data.downloadUrl, '_blank');
    } catch (err) {
      setError(
        err.response?.data?.message || 'Download failed'
      );
    } finally {
      setActionId(null);
    }
  }

  async function handleRename(doc) {
    const newName = window.prompt(
      'Rename document:',
      doc.name
    );

    if (!newName || newName === doc.name) return;

    try {
      setActionId(doc._id);

      await api.put(`/documents/${doc._id}`, {
        name: newName,
      });

      await fetchDocuments(search);
    } catch (err) {
      setError(
        err.response?.data?.message || 'Rename failed'
      );
    } finally {
      setActionId(null);
    }
  }

  async function handleDelete(doc) {
    if (
      !window.confirm(
        `Move "${doc.name}" to trash?`
      )
    ) {
      return;
    }

    try {
      setActionId(doc._id);

      await api.delete(`/documents/${doc._id}`);

      await fetchDocuments(search);
    } catch (err) {
      setError(
        err.response?.data?.message || 'Delete failed'
      );
    } finally {
      setActionId(null);
    }
  }

async function handleMove(doc) {
  const folderOptions = [
    { id: null, name: 'My Documents' },
    ...folders.map((folder) => ({
      id: folder._id,
      name: folder.name,
    })),
  ];

  const message =
    'Move "' +
    doc.name +
    '" to:\n\n' +
    folderOptions
      .map((folder, index) => `${index + 1}. ${folder.name}`)
      .join('\n') +
    '\n\nEnter the folder number:';

  const answer = window.prompt(message);

  if (!answer) return;

  const index = parseInt(answer, 10) - 1;

  if (
    Number.isNaN(index) ||
    index < 0 ||
    index >= folderOptions.length
  ) {
    alert('Invalid folder selection.');
    return;
  }

  const targetFolder = folderOptions[index];

  try {
    setActionId(doc._id);

    await api.put(`/documents/${doc._id}`, {
      folderId: targetFolder.id,
    });

    await fetchDocuments(search);

    alert(`"${doc.name}" moved to ${targetFolder.name}.`);
  } catch (err) {
    setError(
      err.response?.data?.message || 'Move failed'
    );
  } finally {
    setActionId(null);
  }
}

async function handleRestore(doc) {
  try {
    setActionId(doc._id);
    setError(null);

    await api.put(`/documents/${doc._id}/restore`);

    // Refresh Trash
    const { data } = await api.get('/documents/trash');
    setDocuments(data.documents || []);

    alert(`"${doc.name}" restored successfully.`);
  } catch (err) {
    setError(
      err.response?.data?.message || 'Failed to restore document'
    );
  } finally {
    setActionId(null);
  }
}

async function handlePermanentDelete(doc) {
  const confirmed = window.confirm(
    `Permanently delete "${doc.name}"?\n\nThis cannot be undone.`
  );

  if (!confirmed) return;

  try {
    setActionId(doc._id);
    setError(null);

    await api.delete(`/documents/${doc._id}/permanent`);

    // Refresh Trash
    const { data } = await api.get('/documents/trash');
    setDocuments(data.documents || []);

    alert(`"${doc.name}" permanently deleted.`);
  } catch (err) {
    setError(
      err.response?.data?.message ||
        'Failed to permanently delete document'
    );
  } finally {
    setActionId(null);
  }
}

async function fetchActivities() {
  try {
    setError(null);

    const { data } = await api.get('/audit-logs');
 console.log('AUDIT LOGS:', data);
    setActivities(data.logs || data.auditLogs || []);
  } catch (err) {
    setError(
      err.response?.data?.message ||
        'Failed to load activity'
    );
  }
}

  async function handleShare(doc) {
    const email = window.prompt(
      'Share with (email):'
    );

    if (!email) return;

    const permission = window.prompt(
      'Permission - type: view, download, or edit',
      'download'
    );

    if (
      !permission ||
      !['view', 'download', 'edit'].includes(permission)
    ) {
      alert(
        'Invalid permission. Must be view, download, or edit.'
      );

      return;
    }

    try {
      setActionId(doc._id);

      await api.post(
        `/documents/${doc._id}/share`,
        {
          email,
          permission,
        }
      );

      alert(
        `Shared with ${email} (${permission} access)`
      );
    } catch (err) {
      setError(
        err.response?.data?.message || 'Share failed'
      );
    } finally {
      setActionId(null);
    }
  }

  /* =========================
     FOLDER ACTIONS
  ========================= */

  async function handleCreateFolder() {
    const name = window.prompt(
      'New folder name:'
    );

    if (!name) return;

    try {
      const body = {
        name,
      };

      if (currentFolder) {
        body.parentFolderId = currentFolder._id;
      }

      await api.post('/folders', body);

      await fetchFolders();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Could not create folder'
      );
    }
  }

  async function handleRenameFolder(folder) {
    const name = window.prompt(
      'Rename folder:',
      folder.name
    );

    if (!name || name === folder.name) return;

    try {
      await api.put(
        `/folders/${folder._id}`,
        {
          name,
        }
      );

      await fetchFolders();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Rename failed'
      );
    }
  }

  async function handleDeleteFolder(folder) {
    if (
      !window.confirm(
        `Delete folder "${folder.name}"? It must be empty.`
      )
    ) {
      return;
    }

    try {
      await api.delete(
        `/folders/${folder._id}`
      );

      await fetchFolders();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Folder must be empty first'
      );
    }
  }

  /* =========================
     LOADING
  ========================= */

  if (authLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FFF3D8]">
        <Loader2
          className="h-7 w-7 animate-spin text-[#A67917]"
        />
      </div>
    );
  }

  /* =========================
     DASHBOARD
  ========================= */

  return (
    <div className="flex min-h-screen bg-[#FFF8E8] text-[#5A4A0D]">

      {/* =========================
          SIDEBAR
      ========================= */}

      <aside className="hidden w-[225px] flex-shrink-0 flex-col border-r border-[#E8B84A]/30 bg-[#FFF3D8] lg:flex">

        {/* Logo */}

        <div className="flex h-[70px] items-center gap-3 border-b border-[#E8B84A]/30 px-5">

          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#5A4A0D] text-[#F3D789] shadow-sm">
            <FileText size={19} />
          </div>

          <div>
            <h1 className="text-[17px] font-bold tracking-tight text-[#5A4A0D]">
              SDMS
            </h1>

            <p className="text-[10px] text-[#A67917]">
              Document Management
            </p>
          </div>

        </div>

        {/* Navigation */}

        <nav className="flex-1 px-3 py-5">

          <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-wider text-[#A67917]/70">
            Workspace
          </p>

          <button
             onClick={() => {
             setCurrentFolder(null);
              setIsTrash(false);
              setIsActivity(false);
                 fetchDocuments(search);
                 }}
              className={`mb-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
              !currentFolder
                ? 'bg-[#5A4A0D] text-white shadow-md'
                : 'text-[#7A5E12] hover:bg-[#F3D789]/40'
              }`}
              >
            <LayoutDashboard size={17} />
            Dashboard
          </button>

          <button
            type="button"
              onClick={() => {
                setCurrentFolder(null);
                setIsTrash(false);
                setIsActivity(false);
               fetchDocuments(search);
              }}
              className="mb-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-[#7A5E12] transition hover:bg-[#F3D789]/40"
              >
          <FileText size={17} />
          My Documents
          </button>

          <button
               type="button"
                onClick={async () => {
               try {
                 setCurrentFolder(null);
                setIsTrash(true);
                setIsActivity(false);
                setError(null);

                const { data } = await api.get('/documents/trash');

                  setDocuments(data.documents || []);
                   } catch (err) {
                  setError(
                  err.response?.data?.message || 'Failed to load trash'
                  );
                  }
                 }}
                 className="mb-3 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-[#7A5E12] transition hover:bg-[#F3D789]/40"
                 >
                 <Trash2 size={17} />
                   Trash
                </button>

                <button
                  type="button"
                    onClick={async () => {
                    setCurrentFolder(null);
                       setIsTrash(false);
                     setIsActivity(true);

                 await fetchActivities();
                         }}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-[#5F6B55] transition hover:bg-[#EAF2E2] hover:text-[#3F542F]"
                    >
                    <Activity size={17} />
                         Activity
                      </button>
 
          {/* Folders */}

          <div className="mb-2 flex items-center justify-between px-3">

            <p className="text-[10px] font-bold uppercase tracking-wider text-[#A67917]/70">
              Folders
            </p>

            <button
              onClick={handleCreateFolder}
              title="New folder"
              className="rounded-md p-1 text-[#A67917] transition hover:bg-[#F3D789]/50 hover:text-[#5A4A0D]"
            >
              <FolderPlus size={15} />
            </button>

          </div>

          <div className="space-y-1">

            {folders.map((folder) => (
              <div
                key={folder._id}
                className="group flex items-center"
              >

                <button
                  onClick={() => {
                        setIsTrash(false);
                            setIsActivity(false);
                             setCurrentFolder(folder);
                        }}
                  className={`flex min-w-0 flex-1 items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
                    currentFolder?._id === folder._id
                      ? 'bg-[#F3D789]/60 font-semibold text-[#5A4A0D]'
                      : 'text-[#7A5E12] hover:bg-[#F3D789]/35'
                  }`}
                >

                  <FolderClosed
                    size={16}
                    className="flex-shrink-0"
                  />

                  <span className="truncate">
                    {folder.name}
                  </span>

                </button>

                <div className="hidden gap-0.5 pr-1 group-hover:flex">

                  <button
                    onClick={() =>
                      handleRenameFolder(folder)
                    }
                    className="rounded p-1 text-[#A67917] hover:bg-[#F3D789]"
                  >
                    <Pencil size={12} />
                  </button>

                  <button
                    onClick={() =>
                      handleDeleteFolder(folder)
                    }
                    className="rounded p-1 text-[#A67917] hover:bg-red-100 hover:text-red-600"
                  >
                    <Trash2 size={12} />
                  </button>

                </div>

              </div>
            ))}

          </div>

        </nav>

        {/* User */}

        <div className="border-t border-[#E8B84A]/30 p-4">

          <div className="mb-3 flex items-center gap-3">

            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[#E8B84A] text-sm font-bold text-[#5A4A0D]">
              {user.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-[#5A4A0D]">
                {user.name}
              </p>

              <p className="truncate text-[10px] text-[#A67917]">
                Account
              </p>
            </div>

          </div>

          <button
            onClick={logout}
            className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-xs font-medium text-[#7A5E12] transition hover:bg-red-50 hover:text-red-600"
          >
            <LogOut size={15} />
            Logout
          </button>

        </div>

      </aside>

      {/* =========================
          MAIN AREA
      ========================= */}

      <div className="flex min-w-0 flex-1 flex-col">

        {/* TOPBAR */}

        <header className="flex h-[70px] flex-shrink-0 items-center justify-between gap-4 border-b border-[#E8B84A]/25 bg-white/70 px-5 backdrop-blur">

          {/* Mobile Logo */}

          <div className="flex items-center gap-2 lg:hidden">

            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#5A4A0D] text-[#F3D789]">
              <FileText size={16} />
            </div>

            <span className="font-bold text-[#5A4A0D]">
              SDMS
            </span>

          </div>

          {/* Search */}

          <div className="relative w-full max-w-[380px]">

            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A67917]"
            />

            <input
              type="text"
              placeholder="Search documents..."
              value={search}
              onChange={handleSearchChange}
              className="w-full rounded-xl border border-[#E8B84A]/40 bg-[#FFF8E8] py-2.5 pl-9 pr-3 text-sm text-[#5A4A0D] outline-none transition placeholder:text-[#A67917]/60 focus:border-[#CC961F] focus:ring-2 focus:ring-[#E8B84A]/25"
            />

          </div>

          {/* Right */}

          <div className="flex items-center gap-3">

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelected}
              className="hidden"
            />

            <button
              onClick={() =>
                fileInputRef.current?.click()
              }
              disabled={uploading}
              className="flex items-center gap-2 rounded-xl bg-[#A67917] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#7A5E12] disabled:cursor-not-allowed disabled:opacity-60"
            >

              {uploading ? (
                <Loader2
                  size={16}
                  className="animate-spin"
                />
              ) : (
                <Upload size={16} />
              )}

              <span className="hidden sm:inline">
                {uploading
                  ? 'Uploading...'
                  : 'Upload'}
              </span>

            </button>

          </div>

        </header>

        {/* =========================
            CONTENT
        ========================= */}

        <main className="mx-auto w-full max-w-[1280px] flex-1 px-5 py-5">

          {/* Welcome */}

          <section className="mb-5 flex items-end justify-between">

            <div>

              <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-[#CC961F]">
                Your workspace
              </p>

              <h2 className="text-2xl font-bold tracking-tight text-[#5A4A0D]">
                Good morning, {user.name?.split(' ')[0] || 'there'} 👋
              </h2>

              <p className="mt-1 text-sm text-[#7A5E12]/70">
                Manage and organize your documents easily.
              </p>

            </div>

            {currentFolder && (
              <button
                onClick={() => setCurrentFolder(null)}
                className="flex items-center gap-1.5 rounded-lg border border-[#E8B84A]/40 bg-white px-3 py-2 text-xs font-medium text-[#7A5E12] transition hover:bg-[#FFF3D8]"
              >
                <ChevronLeft size={14} />
                All Documents
              </button>
            )}

          </section>

          {/* =========================
              STATS
          ========================= */}

          <section className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">

            <div className="rounded-2xl border border-[#E8B84A]/30 bg-white p-4 shadow-sm">

              <div className="flex items-center justify-between">

                <div>
                  <p className="text-xs font-medium text-[#A67917]">
                    Documents
                  </p>

                  <p className="mt-1 text-2xl font-bold text-[#5A4A0D]">
                    {documents.length}
                  </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFF3D8] text-[#A67917]">
                  <FileText size={19} />
                </div>

              </div>

            </div>

            <div className="rounded-2xl border border-[#E8B84A]/30 bg-white p-4 shadow-sm">

              <div className="flex items-center justify-between">

                <div>
                  <p className="text-xs font-medium text-[#A67917]">
                    Folders
                  </p>

                  <p className="mt-1 text-2xl font-bold text-[#5A4A0D]">
                    {folders.length}
                  </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F3D789]/40 text-[#A67917]">
                  <FolderClosed size={19} />
                </div>

              </div>

            </div>
 
          </section>

          {/* =========================
              CURRENT LOCATION
          ========================= */}

          <div className="mb-3 flex items-center justify-between">

            <div className="flex items-center gap-2">

              {currentFolder && (
                <ChevronLeft
                  size={16}
                  className="text-[#A67917]"
                />
              )}

              <h3 className="text-base font-bold text-[#5A4A0D]">
                {currentFolder
                  ? currentFolder.name
                  : 'Recent Documents'}
              </h3>

            </div>

            <button
              onClick={handleCreateFolder}
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-[#A67917] transition hover:bg-[#F3D789]/40"
            >
              <FolderPlus size={14} />
              New Folder
            </button>

          </div>

          {/* Error */}

          {error && (
            <div className="mb-4 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
               <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-500">
                   !
            </div>

        <div>
           <p className="text-xs font-semibold text-red-700">
            Something went wrong
           </p>

           <p className="mt-0.5 text-xs text-red-600">
            {error}
            </p>
           </div>
           </div>
          )}

          {/* =========================
              FOLDERS
          ========================= */}

          {folders.length > 0 && (

            <section className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">

              {folders.map((folder) => (

                <div
                  key={folder._id}
                  onClick={() =>
                    setCurrentFolder(folder)
                  }
                  className="group flex cursor-pointer items-center justify-between rounded-xl border border-[#E8B84A]/30 bg-white px-4 py-3 transition hover:-translate-y-0.5 hover:border-[#CC961F]/50 hover:shadow-md"
                >

                  <div className="flex min-w-0 items-center gap-3">

                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-[#FFF3D8] text-[#A67917]">
                      <FolderClosed size={17} />
                    </div>

                    <div className="min-w-0">

                      <p className="truncate text-sm font-semibold text-[#5A4A0D]">
                        {folder.name}
                      </p>

                      <p className="text-[10px] text-[#A67917]/70">
                        Folder
                      </p>

                    </div>

                  </div>

                  <div
                    className="flex gap-1 opacity-0 transition group-hover:opacity-100"
                    onClick={(e) =>
                      e.stopPropagation()
                    }
                  >

                    <button
                      onClick={() =>
                        handleRenameFolder(folder)
                      }
                      className="rounded-md p-1.5 text-[#A67917] hover:bg-[#F3D789]/40"
                    >
                      <Pencil size={13} />
                    </button>

                    <button
                      onClick={() =>
                        handleDeleteFolder(folder)
                      }
                      className="rounded-md p-1.5 text-[#A67917] hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 size={13} />
                    </button>

                  </div>

                </div>

              ))}

            </section>

          )}

          {/* Activity */}
{isActivity && (
  <section className="overflow-hidden rounded-2xl border border-[#E8B84A]/30 bg-white shadow-sm">
    <div className="border-b border-[#E8B84A]/20 px-5 py-4">
      <h2 className="text-base font-semibold text-[#5A4A0D]">
        Activity
      </h2>

      <p className="mt-1 text-xs text-[#A67917]/70">
        Recent activity on your documents and account
      </p>
    </div>

    {activities.length === 0 ? (
      <div className="px-5 py-10 text-center text-sm text-[#8A7A52]">
        No activity found.
      </div>
    ) : (
      <div className="divide-y divide-[#E8B84A]/20">
        {activities.map((activity) => {
          let icon = '•';
          let label = activity.action;

          switch (activity.action) {
            case 'login':
              icon = '🔐';
              label = 'Logged in';
              break;

            case 'login_failed':
              icon = '⚠️';
              label = 'Failed login attempt';
              break;

            case 'upload':
              icon = '📤';
              label = 'Document uploaded';
              break;

            case 'download':
              icon = '📥';
              label = 'Document downloaded';
              break;

            case 'rename':
              icon = '✏️';
              label = 'Document renamed';
              break;

            case 'delete':
              icon = '🗑️';
              label = 'Document deleted';
              break;

            case 'restore':
              icon = '♻️';
              label = 'Document restored';
              break;

            case 'share':
              icon = '🔗';
              label = 'Document shared';
              break;

            case 'revoke_share':
              icon = '🔒';
              label = 'Document sharing revoked';
              break;

            default:
              label = activity.action;
          }

          return (
            <div
              key={activity._id}
              className="flex items-center gap-4 px-5 py-4 transition hover:bg-[#FFF8E8]"
            >
              {/* Activity icon */}
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[#FFF3D8] text-lg">
                {icon}
              </div>

              {/* Activity details */}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-[#5A4A0D]">
                  {label}
                </p>

                <p className="mt-1 text-xs text-[#A67917]/70">
                  {new Date(activity.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    )}
  </section>
)}

{/* Documents */}
{!isActivity && (
  <section className="overflow-hidden rounded-2xl border border-[#E8B84A]/30 bg-white shadow-sm">
    {documents.map((doc, index) => {
      const Icon = fileIconFor(doc.mimeType);
      const isBusy = actionId === doc._id;

      return (
        <div
          key={doc._id}
          className={`group flex items-center gap-4 px-4 py-3 transition hover:bg-[#FFF8E8] ${
            index !== documents.length - 1
              ? 'border-b border-[#E8B84A]/20'
              : ''
          }`}
        >
          {/* File icon */}
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[#FFF3D8] text-[#A67917]">
            <Icon size={19} />
          </div>

          {/* Document information */}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-[#5A4A0D]">
              {doc.name}
            </p>

            <div className="mt-1 flex items-center gap-2 text-[10px] text-[#A67917]/70">
              <span>{formatSize(doc.size)}</span>
              <span>•</span>
              <span>Version {doc.currentVersion}</span>
            </div>
          </div>

          {/* File type */}
          <div className="hidden text-[10px] font-medium uppercase tracking-wide text-[#A67917]/60 sm:block">
            {doc.mimeType?.split('/')[1] || 'FILE'}
          </div>

          {/* Move */}
          <button
            onClick={() => handleMove(doc)}
            disabled={isBusy}
            title="Move to folder"
            className="rounded-lg p-2 text-[#7E8F6A] transition hover:bg-[#EAF2E2] hover:text-[#4F633D] disabled:opacity-50"
          >
            <FolderInput size={14} />
          </button>

         {/* Actions */}
<div className="flex items-center gap-1">
  {isTrash ? (
    <>
      {/* Restore */}
      <button
        onClick={() => handleRestore(doc)}
        disabled={isBusy}
        title="Restore"
        className="rounded-lg p-2 text-[#5F7A45] transition hover:bg-[#EAF2E2] hover:text-[#3F542F] disabled:opacity-50"
      >
        <RotateCcw size={14} />
      </button>

      {/* Delete permanently */}
      <button
        onClick={() => handlePermanentDelete(doc)}
        disabled={isBusy}
        title="Delete permanently"
        className="rounded-lg p-2 text-[#A67917] transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
      >
        <Trash2 size={14} />
      </button>
    </>
  ) : (
    <>
      {/* Share */}
      <button
        onClick={() => handleShare(doc)}
        disabled={isBusy}
        title="Share"
        className="rounded-lg p-2 text-[#A67917] transition hover:bg-[#FFF3D8] hover:text-[#5A4A0D] disabled:opacity-50"
      >
        <Share2 size={14} />
      </button>

      {/* Download */}
      <button
        onClick={() => handleDownload(doc)}
        disabled={isBusy}
        title="Download"
        className="rounded-lg p-2 text-[#A67917] transition hover:bg-[#FFF3D8] hover:text-[#5A4A0D] disabled:opacity-50"
      >
        <Download size={14} />
      </button>

      {/* Rename */}
      <button
        onClick={() => handleRename(doc)}
        disabled={isBusy}
        title="Rename"
        className="rounded-lg p-2 text-[#A67917] transition hover:bg-[#FFF3D8] hover:text-[#5A4A0D] disabled:opacity-50"
      >
        <Pencil size={14} />
      </button>

      {/* Move to trash */}
      <button
        onClick={() => handleDelete(doc)}
        disabled={isBusy}
        title="Delete"
        className="rounded-lg p-2 text-[#A67917] transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
      >
        <Trash2 size={14} />
      </button>
    </>
  )}
</div>
        </div>
      );
    })}
  </section>
)}
        </main>

      </div>

    </div>
  );
}