import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';
import { toast } from '../../hooks/useToast';
import { CheckCircle, XCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { formatDate } from '../../lib/utils';
import Toaster from '../../components/ui/Toaster';

const tabs = [
  { value: 'pending', label: 'معلقة', color: 'text-orange-600 border-orange-400' },
  { value: 'approved', label: 'مقبولة', color: 'text-green-600 border-green-400' },
  { value: 'rejected', label: 'مرفوضة', color: 'text-red-600 border-red-400' },
  { value: '', label: 'الجميع', color: 'text-primary border-primary' },
];

export default function AdminApplications() {
  const [status, setStatus] = useState('pending');
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [expanded, setExpanded] = useState<string | null>(null);
  const qc = useQueryClient();

  const { data: applications, isLoading } = useQuery({
    queryKey: ['admin-applications', status],
    queryFn: () => api.get('/membership', { params: status ? { status } : {} }).then(r => r.data),
  });

  const update = useMutation({
    mutationFn: ({ id, newStatus }: { id: string; newStatus: string }) =>
      api.put(`/membership/${id}`, { status: newStatus, notes: notes[id] }),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['admin-applications'] });
      toast(vars.newStatus === 'approved' ? 'تم قبول الطلب وإنشاء الحساب' : 'تم رفض الطلب', vars.newStatus === 'approved' ? 'success' : 'info');
    },
    onError: () => toast('حدث خطأ', 'error'),
  });

  return (
    <div className="animate-fade-in">
      <Toaster />
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-1">طلبات العضوية</h2>
        <p className="text-muted-foreground text-sm">مراجعة وإدارة طلبات الانضمام</p>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {tabs.map(t => (
          <button key={t.value} onClick={() => setStatus(t.value)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all border-2 ${status === t.value ? t.color + ' bg-white shadow-sm' : 'border-transparent bg-white text-muted-foreground hover:border-border'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border p-5 animate-pulse">
              <div className="h-5 bg-gray-200 rounded mb-2 w-1/3" />
              <div className="h-4 bg-gray-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : applications?.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border">
          <p className="text-muted-foreground">لا توجد طلبات في هذا القسم</p>
        </div>
      ) : (
        <div className="space-y-4">
          {applications?.map((app: any) => (
            <div key={app.id} className="bg-white rounded-xl border shadow-sm overflow-hidden">
              <div className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-bold text-foreground">{app.fullName}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        app.status === 'pending' ? 'bg-orange-100 text-orange-700' :
                        app.status === 'approved' ? 'bg-green-100 text-green-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {app.status === 'pending' ? 'معلق' : app.status === 'approved' ? 'مقبول' : 'مرفوض'}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground">{app.email} · {app.city} · {app.specialization}</div>
                    <div className="text-xs text-muted-foreground mt-1">{formatDate(app.createdAt)}</div>
                  </div>
                  <button onClick={() => setExpanded(expanded === app.id ? null : app.id)}
                    className="text-muted-foreground hover:text-foreground transition-colors">
                    {expanded === app.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>

                {expanded === app.id && (
                  <div className="mt-4 pt-4 border-t space-y-3">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      {[
                        { label: 'الهاتف', value: app.phone },
                        { label: 'الشركة', value: app.company },
                        { label: 'الخبرة', value: app.experience },
                        { label: 'القطاع', value: app.industry },
                        { label: 'LinkedIn', value: app.linkedin },
                        { label: 'مصدر التعرف', value: app.source },
                      ].filter(({ value }) => value).map(({ label, value }) => (
                        <div key={label}>
                          <span className="text-xs text-muted-foreground">{label}: </span>
                          <span className="text-sm font-medium">{value}</span>
                        </div>
                      ))}
                    </div>
                    {app.contribution && (
                      <div className="bg-muted/30 rounded-lg p-3">
                        <div className="text-xs text-muted-foreground mb-1">المساهمة المتوقعة:</div>
                        <p className="text-sm">{app.contribution}</p>
                      </div>
                    )}

                    {app.status === 'pending' && (
                      <div className="pt-3">
                        <textarea
                          placeholder="ملاحظات (اختياري)..."
                          value={notes[app.id] || ''}
                          onChange={e => setNotes(p => ({ ...p, [app.id]: e.target.value }))}
                          rows={2}
                          className="w-full border border-input rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-primary mb-3"
                        />
                        <div className="flex gap-3">
                          <button
                            onClick={() => update.mutate({ id: app.id, newStatus: 'approved' })}
                            disabled={update.isPending}
                            className="flex items-center gap-2 bg-green-500 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-green-600 transition-colors disabled:opacity-60"
                          >
                            <CheckCircle className="w-4 h-4" /> قبول
                          </button>
                          <button
                            onClick={() => update.mutate({ id: app.id, newStatus: 'rejected' })}
                            disabled={update.isPending}
                            className="flex items-center gap-2 bg-red-500 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-red-600 transition-colors disabled:opacity-60"
                          >
                            <XCircle className="w-4 h-4" /> رفض
                          </button>
                        </div>
                      </div>
                    )}
                    {app.notes && (
                      <div className="text-sm text-muted-foreground mt-2">
                        <span className="font-medium">ملاحظات: </span>{app.notes}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
