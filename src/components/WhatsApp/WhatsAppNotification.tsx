import React, { useState } from 'react';
import { MessageCircle, Send, X } from 'lucide-react';

interface WhatsAppNotificationProps {
  recipient: string;
  message: string;
  onSend: () => void;
  onClose: () => void;
}

const WhatsAppNotification: React.FC<WhatsAppNotificationProps> = ({
  recipient,
  message,
  onSend,
  onClose
}) => {
  const [customMessage, setCustomMessage] = useState(message);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 modal-backdrop">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 animate-slide-in">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <MessageCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Send WhatsApp Update</h3>
              <p className="text-sm text-gray-600">To: {recipient}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message Preview
            </label>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">NF</span>
                </div>
                <div className="flex-1">
                  <div className="bg-white rounded-lg p-3 shadow-sm">
                    <textarea
                      value={customMessage}
                      onChange={(e) => setCustomMessage(e.target.value)}
                      className="w-full text-sm text-gray-900 resize-none border-none focus:outline-none"
                      rows={4}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date().toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onSend();
                onClose();
              }}
              className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors btn-interactive"
            >
              <Send className="w-4 h-4" />
              <span>Send via WhatsApp</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhatsAppNotification;