import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fileApi } from '../api/fileApi';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { SearchInput, Select } from '../../../components/ui/Input';
import { Table } from '../../../components/ui/Table';
import { ConfirmDialog } from '../../../components/ui/Modal';
import { EmptyState, ErrorState, Skeleton } from '../../../components/feedback/Feedback';
import { formatBytes, formatDate } from '../../../lib/format';
import { usePermissions } from '../../../hooks/usePermissions';
import { useUiStore } from '../../../store/uiStore';

export function ProjectFilesPage() {
  const { project } = useOutletContext();
  return <FilesManager projectId={project._id} />;
}

export function GlobalFilesPage() {
  return <FilesManager />;
}

function FilesManager({ projectId }) {
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [deleting, setDeleting] = useState(null);
  const [progress, setProgress] = useState(0);
  const queryClient = useQueryClient();
  const addToast = useUiStore((s) => s.addToast);
  const { hasPermission } = usePermissions();
  const queryKey = projectId ? ['files', projectId, search, type] : ['files', search];

  const { data = [], isLoading, isError, refetch } = useQuery({
    queryKey,
    queryFn: () => (projectId ? fileApi.listByProject(projectId, { search, type }) : fileApi.listAll()),
  });

  const upload = useMutation({
    mutationFn: (file) => {
      const form = new FormData();
      form.append('file', file);
      return fileApi.upload(projectId, form, (event) => {
        if (event.total) setProgress(Math.round((event.loaded / event.total) * 100));
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] });
      addToast({ title: 'File uploaded successfully.' });
      setProgress(0);
    },
    onError: (error) => addToast({ title: 'Upload failed', message: error.message }),
  });

  const remove = useMutation({
    mutationFn: fileApi.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] });
      setDeleting(null);
    },
  });

  if (isLoading) return <Skeleton height={280} />;
  if (isError) return <ErrorState onRetry={refetch} />;

  return (
    <div>
      {!projectId ? <h1 style={{ marginBottom: 16 }}>Files</h1> : null}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
        <SearchInput value={search} onChange={setSearch} placeholder="Search files" />
        <Select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="">All types</option>
          <option value="pdf">PDF</option>
          <option value="image">Images</option>
          <option value="csv">CSV</option>
        </Select>
        {projectId && hasPermission('file:upload') ? (
          <label>
            <input type="file" hidden onChange={(e) => e.target.files?.[0] && upload.mutate(e.target.files[0])} />
            <Button type="button" onClick={(e) => e.currentTarget.previousSibling.click()}>Upload</Button>
          </label>
        ) : null}
      </div>
      {progress > 0 && progress < 100 ? <p>Uploading {progress}%</p> : null}
      <Card>
        {!data.length ? (
          <EmptyState title="No files yet" message="Upload a document to keep project assets in one place." />
        ) : (
          <Table
            rows={data}
            columns={[
              { key: 'originalName', header: 'Name' },
              { key: 'type', header: 'Type' },
              { key: 'size', header: 'Size', render: (row) => formatBytes(row.size) },
              { key: 'uploadedBy', header: 'Uploaded by', render: (row) => row.uploadedBy?.name },
              { key: 'createdAt', header: 'Date', render: (row) => formatDate(row.createdAt) },
              {
                key: 'actions',
                header: '',
                render: (row) => (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <Button
                      size="sm"
                      variant="secondary"
                      type="button"
                      onClick={async () => {
                        try {
                          await fileApi.download(row._id, row.originalName);
                        } catch (error) {
                          addToast({ title: 'Unable to download the file.', message: error.message });
                        }
                      }}
                    >
                      Download
                    </Button>
                    {hasPermission('file:delete') ? <Button size="sm" variant="danger" onClick={() => setDeleting(row)}>Delete</Button> : null}
                  </div>
                ),
              },
            ]}
          />
        )}
      </Card>
      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete file?"
        message="This action cannot be undone."
        onClose={() => setDeleting(null)}
        onConfirm={() => remove.mutate(deleting._id)}
      />
    </div>
  );
}
