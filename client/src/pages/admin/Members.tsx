import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';
import { toast } from '../../hooks/useToast';
import { Trash2, Edit, Check, X } from 'lucide-react';
import { formatDate } from '../../lib/utils';
import Toaster from '../../components/ui/Toaster';

export default function AdminMembers() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<string | null>(null);
  const [editData, setEditData] = useState({ status: '', role: '' });

  const { data: members, isLoading } = useQuery({
    queryKey: ['admin-members'],
    queryFn: () => api.get('/members/admin/all').then(r => r.data),
  });

  const update = useMutation({
    mutationFn: ({ id, ...data }: any) => api.put(`/members/admin/${id}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-members'] });
      setEditing(null);
      toast('تم تحديث العضو بنجاح', 'success');
    },
    onError: () => toast('حدث خطأ', 'error'),
  });

  const remove = useMutation({
    mutationFn: (id: string) => api.delete(`/members/admin/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-members'] });
      toast('تم حذف العضو', 'success');
    },
    onError: () => toast('حدث خطأ', 'error'),
  });

  const startEdit = (m: any) => {
    setEditing(m.id);
    setEditData({ status: m.status, role: m.role });
  };

  return (
    <div className="animate-fade-in">
      <Toaster />
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">إدارة الأعضاء</h2>
          <p className="text-muted-foreground text-sm mt-1">{members?.length || 0} عضو في المنصة</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50 border-b">
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">العضو</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">البريد</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">المدينة</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">الدور</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">الحالة</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">تاريخ الانضمام</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {isLoading ? Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 7 }).map((_, j) => (
                    <td key={j} className="px-4 py-3"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td>
                  ))}
                </tr>
              )) : members?.map((m: any) => (
                <tr key={m.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">
                        {m.name?.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium text-foreground">{m.name}</div>
                        {m.specialization && <div className="text-xs text-muted-foreground">{m.specialization}</div>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{m.email}</td>
                  <td className="px-4 py-3 text-muted-foreground">{m.city || '-'}</td>
                  <td className="px-4 py-3">
                    {editing === m.id ? (
                      <select value={editData.role} onChange={e => setEditData(p => ({ ...p, role: e.target.value }))}
                        className="border rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-primary">
                        <option value="member">عضو</option>
                        <option value="moderator">مشرف</option>
                        <option value="admin">مدير</option>
                      </select>
                    ) : (
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        m.role === 'admin' ? 'bg-red-100 text-red-700' :
                        m.role === 'moderator' ? 'bg-orange-100 text-orange-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {m.role === 'admin' ? 'مدير' : m.role === 'moderator' ? 'مشرف' : 'عضو'}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {editing === m.id ? (
                      <select value={editData.status} onChange={e => setEditData(p => ({ ...p, status: e.target.value }))}
                        className="border rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-primary">
                        <option value="active">نشط</option>
                        <option value="suspended">موقوف</option>
                        <option value="inactive">غير نشط</option>
                      </select>
                    ) : (
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        m.status === 'active' ? 'bg-green-100 text-green-700' :
                        m.status === 'suspended' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {m.status === 'active' ? 'نشط' : m.status === 'suspended' ? 'موقوف' : 'غير نشط'}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDate(m.created_at)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {editing === m.id ? (
                        <>
                          <button onClick={() => update.mutate({ id: m.id, ...editData })}
                            className="w-7 h-7 rounded bg-green-100 text-green-700 flex items-center justify-center hover:bg-green-200 transition-colors">
                            <Check className="w-4 h-4" />
                          </button>
                          <button onClick={() => setEditing(null)}
                            className="w-7 h-7 rounded bg-gray-100 text-gray-600 flex items-center justify-center hover:bg-gray-200 transition-colors">
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => startEdit(m)}
                            className="w-7 h-7 rounded bg-blue-100 text-blue-700 flex items-center justify-center hover:bg-blue-200 transition-colors">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button onClick={() => { if (confirm('هل تريد حذف هذا العضو؟')) remove.mutate(m.id); }}
                            className="w-7 h-7 rounded bg-red-100 text-red-700 flex items-center justify-center hover:bg-red-200 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
