import React, { useState, useEffect } from 'react';
import { Header } from '../../components/layout/Header';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { Badge } from '../../components/common/Badge';
import { notificationApi } from '../../api';
import { NotificationItem } from '../../types';
import { Bell, Plus, Send, CheckCheck, Clock } from 'lucide-react';

export const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const [form, setForm] = useState({
    title: '',
    content: '',
    type: 1, // 1: General
    actionUrl: '',
  });

  const [actionLoading, setActionLoading] = useState(false);
  const [formErr, setFormErr] = useState('');

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await notificationApi.getMy();
      if (res.success) {
        setNotifications(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErr('');
    setActionLoading(true);

    try {
      const res = await notificationApi.create(form);
      if (res.success) {
        setIsCreateOpen(false);
        setForm({ title: '', content: '', type: 1, actionUrl: '' });
        fetchNotifications();
      }
    } catch (err: any) {
      setFormErr(err.message || 'Gửi thông báo thất bại');
    } finally {
      setActionLoading(false);
    }
  };

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
        title="Quản Lý Thông Báo & Tin Tức"
        subtitle="Phát hành thông báo chung toàn KTX hoặc xem danh sách thông báo hệ thống"
      />

      <div className="max-w-4xl mx-auto px-6 mt-6 space-y-4">
        <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <Button variant="secondary" size="sm" onClick={handleMarkAllRead} icon={<CheckCheck className="w-4 h-4" />}>
            Đánh dấu đã đọc tất cả
          </Button>

          <Button onClick={() => setIsCreateOpen(true)} icon={<Send className="w-4 h-4" />}>
            Phát Thông Báo Mới
          </Button>
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {notifications.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
              Chưa có thông báo nào.
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
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-xl bg-indigo-100 text-indigo-600 mt-0.5">
                      <Bell className="w-4 h-4" />
                    </div>
                    <div>
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
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal Phát Thông Báo */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Phát Thông Báo Toàn KTX">
        {formErr && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700">
            {formErr}
          </div>
        )}
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <Input
            label="Tiêu đề thông báo"
            placeholder="VD: Lịch đóng tiền phòng tháng mới, Vệ sinh KTX định kỳ..."
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Loại thông báo</label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: Number(e.target.value) })}
              className="block w-full rounded-lg border border-slate-300 text-sm px-3.5 py-2 text-slate-900 bg-white"
            >
              <option value="1">Thông báo chung (General)</option>
              <option value="2">Hóa đơn tiền phòng</option>
              <option value="3">Hợp đồng lưu trú</option>
              <option value="4">Bảo trì / Sửa chữa</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nội dung chi tiết</label>
            <textarea
              rows={4}
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              className="block w-full rounded-lg border border-slate-300 text-sm p-3 text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
              placeholder="Nhập nội dung thông báo gửi đến toàn thể sinh viên..."
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button type="button" variant="secondary" onClick={() => setIsCreateOpen(false)}>
              Hủy bỏ
            </Button>
            <Button type="submit" loading={actionLoading} icon={<Send className="w-4 h-4" />}>
              Gửi thông báo
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

