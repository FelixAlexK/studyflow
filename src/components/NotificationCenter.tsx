import { AlertCircle, CheckCircle2, Info, X, XCircle } from 'lucide-react';
import { useNotification } from './NotificationProvider';

export default function NotificationCenter() {
  const { notifications, removeNotification } = useNotification();

  if (notifications.length === 0) return null;

  return (
    <div className="fixed right-4 top-4 z-50 flex flex-col gap-2 max-w-sm">
      {notifications.map((notification) => {
        const iconMap = {
          info: <Info className="h-5 w-5 text-blue-600" />,
          success: <CheckCircle2 className="h-5 w-5 text-green-600" />,
          warning: <AlertCircle className="h-5 w-5 text-yellow-600" />,
          error: <XCircle className="h-5 w-5 text-red-600" />,
        };

        const bgMap = {
          info: 'bg-blue-50 border-blue-200',
          success: 'bg-green-50 border-green-200',
          warning: 'bg-yellow-50 border-yellow-200',
          error: 'bg-red-50 border-red-200',
        };

        const textMap = {
          info: 'text-blue-900',
          success: 'text-green-900',
          warning: 'text-yellow-900',
          error: 'text-red-900',
        };

        return (
          <div
            key={notification.id}
            className={`flex items-start gap-3 rounded-md border p-4 ${bgMap[notification.type]}`}
          >
            <div className="shrink-0">{iconMap[notification.type]}</div>
            <div className="flex-1">
              <h3 className={`font-medium ${textMap[notification.type]}`}>
                {notification.title}
              </h3>
              <p className={`text-sm mt-1 ${textMap[notification.type]}`}>
                {notification.message}
              </p>
            </div>
            <button
            type='button'
              onClick={() => removeNotification(notification.id)}
              className={`shrink-0 ${textMap[notification.type]} hover:opacity-70`}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
