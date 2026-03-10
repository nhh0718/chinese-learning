import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Bell, Clock, Check, Zap, Flame, ExternalLink } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { useTelegramStore } from '../stores/telegramStore';
import './TelegramPage.css';

export default function TelegramPage() {
  const { user, isAuthenticated } = useAuthStore();
  const {
    progress,
    subscription,
    fetchProgress,
    fetchSubscription,
    updateSubscription
  } = useTelegramStore();

  const [reminderTime, setReminderTime] = useState('20:00');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      fetchProgress(user.id);
      fetchSubscription(user.id);
    }
  }, [isAuthenticated, user?.id, fetchProgress, fetchSubscription]);

  useEffect(() => {
    if (subscription?.reminderTime) {
      setReminderTime(subscription.reminderTime);
    }
  }, [subscription]);

  const handleUpdateReminder = async () => {
    if (!user?.id) return;
    setIsUpdating(true);
    try {
      await updateSubscription(user.id, reminderTime);
    } finally {
      setIsUpdating(false);
    }
  };

  const getTelegramBotLink = () => {
    return 'https://t.me/learningchineseebot';
  };

  if (!isAuthenticated) {
    return (
      <div className="page telegram-page">
        <div className="container container--narrow">
          <div className="telegram-page__unauthorized">
            <MessageCircle size={64} className="telegram-page__icon" />
            <h2>Vui lòng đăng nhập</h2>
            <p>Bạn cần đăng nhập để sử dụng tính năng Telegram</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page telegram-page">
      <div className="container container--narrow">
        <div className="telegram-page__header">
          <h1 className="telegram-page__title">
            Telegram Daily Learning
            <span className="telegram-page__title-cn chinese-text">每日學習</span>
          </h1>
          <p className="telegram-page__subtitle">
            Nhận từ vựng hàng ngày qua Telegram và hoàn thành bài kiểm tra để tích điểm
          </p>
        </div>

        {/* Points Display */}
        <motion.div
          className="telegram-points-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="telegram-points-card__header">
            <Zap size={24} className="telegram-points-card__icon" />
            <h3>Điểm tích cực</h3>
          </div>
          <div className="telegram-points-card__body">
            <div className="telegram-points-card__stat">
              <span className="telegram-points-card__value">{progress?.points || 0}</span>
              <span className="telegram-points-card__label">Điểm</span>
            </div>
            <div className="telegram-points-card__divider" />
            <div className="telegram-points-card__stat">
              <span className="telegram-points-card__value">
                {progress?.streak || 0}
                <Flame size={20} className="telegram-points-card__streak-icon" />
              </span>
              <span className="telegram-points-card__label">Ngày streak</span>
            </div>
          </div>
          <div className="telegram-points-card__status">
            {progress?.todayCompleted ? (
              <span className="telegram-points-card__badge telegram-points-card__badge--success">
                <Check size={16} /> Đã hoàn thành hôm nay
              </span>
            ) : (
              <span className="telegram-points-card__badge telegram-points-card__badge--warning">
                Chưa hoàn thành hôm nay
              </span>
            )}
          </div>
        </motion.div>

        {/* Telegram Connection */}
        <motion.section
          className="telegram-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="telegram-section__header">
            <MessageCircle size={20} />
            <h3>Kết nối Telegram</h3>
          </div>

          {subscription?.isSubscribed ? (
            <div className="telegram-section__connected">
              <div className="telegram-section__status">
                <Check size={20} className="telegram-section__status-icon telegram-section__status-icon--success" />
                <span>Đã kết nối Telegram</span>
              </div>
              <p className="telegram-section__info">
                Bạn đã đăng ký nhận từ vựng hàng ngày. Sử dụng bot Telegram để nhận bài học và làm bài kiểm tra.
              </p>
              <a
                href={getTelegramBotLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="telegram-section__link"
              >
                <MessageCircle size={18} />
                Mở Telegram Bot
                <ExternalLink size={14} />
              </a>
            </div>
          ) : (
            <div className="telegram-section__not-connected">
              <p className="telegram-section__info">
                Kết nối Telegram để nhận từ vựng hàng ngày và tích điểm thưởng!
              </p>
              <ol className="telegram-section__steps">
                <li>Mở Telegram và tìm bot của chúng tôi</li>
                <li>Gửi lệnh /subscribe your@email.com</li>
                <li>Hoàn thành bài kiểm tra hàng ngày để tích điểm</li>
              </ol>
              <a
                href={getTelegramBotLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="telegram-section__link telegram-section__link--primary"
              >
                <MessageCircle size={18} />
                Mở Telegram Bot
                <ExternalLink size={14} />
              </a>
            </div>
          )}
        </motion.section>

        {/* Reminder Settings */}
        {subscription?.isSubscribed && (
          <motion.section
            className="telegram-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="telegram-section__header">
              <Bell size={20} />
              <h3>Cài đặt nhắc nhở</h3>
            </div>

            <div className="telegram-section__settings">
              <div className="telegram-setting">
                <div className="telegram-setting__label">
                  <Clock size={18} />
                  <span>Giờ nhắc nhở</span>
                </div>
                <div className="telegram-setting__control">
                  <input
                    type="time"
                    value={reminderTime}
                    onChange={(e) => setReminderTime(e.target.value)}
                    className="telegram-setting__time-input"
                  />
                  <button
                    onClick={handleUpdateReminder}
                    disabled={isUpdating}
                    className="telegram-setting__save-btn"
                  >
                    {isUpdating ? 'Đang lưu...' : 'Lưu'}
                  </button>
                </div>
              </div>
              <p className="telegram-setting__description">
                Bạn sẽ nhận được nhắc nhở qua Telegram nếu chưa hoàn thành bài kiểm tra vào giờ này.
              </p>
            </div>
          </motion.section>
        )}

        {/* How it works */}
        <motion.section
          className="telegram-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="telegram-section__header">
            <h3>Cách thức hoạt động</h3>
          </div>

          <div className="telegram-how-it-works">
            <div className="telegram-how-item">
              <div className="telegram-how-item__number">1</div>
              <div className="telegram-how-item__content">
                <h4>Đăng ký qua Telegram</h4>
                <p>Gửi /subscribe email cho bot để liên kết tài khoản</p>
              </div>
            </div>
            <div className="telegram-how-item">
              <div className="telegram-how-item__number">2</div>
              <div className="telegram-how-item__content">
                <h4>Nhận từ vựng hàng ngày</h4>
                <p>7h sáng mỗi ngày bạn sẽ nhận được 10-15 từ vựng theo chủ đề</p>
              </div>
            </div>
            <div className="telegram-how-item">
              <div className="telegram-how-item__number">3</div>
              <div className="telegram-how-item__content">
                <h4>Làm bài kiểm tra</h4>
                <p>Trả lời câu hỏi để kiểm tra kiến thức và tích điểm</p>
              </div>
            </div>
            <div className="telegram-how-item">
              <div className="telegram-how-item__number">4</div>
              <div className="telegram-how-item__content">
                <h4>Tích điểm & Streak</h4>
                <p>+10 điểm khi hoàn thành, +1 mỗi câu đúng, -5 nếu bỏ qua</p>
              </div>
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  );
}
