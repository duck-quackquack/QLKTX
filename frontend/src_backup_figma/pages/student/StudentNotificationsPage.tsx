import React, { useState, useEffect } from 'react';
import { Header } from '../../components/layout/Header';
import { Button } from '../../components/common/Button';
import { notificationApi } from '../../api';
import { NotificationItem } from '../../types';
import { Bell, CheckCheck, Clock } from 'lucide-react';

export const StudentNotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await notificationApi.getMy();
      if (res.success) setNotifications(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await notificationApi.markAllRead();
      fetchNotifications();
    } catch (err) {
      // ignore
    }
  };

  return (
    <div className="flex-1 pb-12">
      <Header
        title="Thông Báo Của Bạn"
        subtitle="Thông báo hóa đơn tiền phòng, duyệt hồ sơ và các thông tin từ ban quản lý"
      />

      <div className="max-w-4xl mx-auto px-6 mt-6 space-y-4">
        <div className="flex justify-end bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <Button variant="secondary" size="sm" onClick={handleMarkAllRead} icon={<CheckCheck className="w-4 h-4" />}>
            Đánh dấu đã đọc tất cả
          </Button>
        </div>

        <div className="space-y-3">
          {notifications.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
              Bạn chưa có thông báo nào.
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className={`p-4 rounded-2xl border transition-all ${
                  n.isRead
                    ? 'bg-white border-slate-200'
                    : 'bg-indigo-50/50 border-indigo-200 shadow-sm'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-indigo-100 text-indigo-600 mt-0.5">
                    <Bell className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-slate-900">{n.title}</h4>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">{n.content}</p>
                    <div className="mt-2 flex items-center gap-3 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(n.createdAt).toLocaleString('vi-VN')}
                      </span>
                      {!n.isRead && (
                        <span className="text-indigo-600 font-bold">&bull; Chưa đọc</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

