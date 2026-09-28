import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class TelegramService {
  private readonly logger = new Logger(TelegramService.name);

  async sendOrderNotification(order: {
    orderNumber: string;
    gameName: string;
    productName: string;
    totalAmount: string | number;
    playerData: Record<string, string>;
  }) {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    // ពិនិត្យមើលថាតើមាន Bot Token និង Chat ID ក្នុង .env ដែរឬទេ
    if (!botToken || !chatId) {
      this.logger.warn('⚠️ TELEGRAM_BOT_TOKEN ឬ TELEGRAM_CHAT_ID មិនទាន់មានកំណត់ក្នុង .env នៅឡើយទេ!');
      return;
    }

    const playerDetails = Object.entries(order.playerData || {})
      .map(([k, v]) => `• <b>${k}</b>: <code>${v}</code>`)
      .join('\n');

    const message = `
🎉 <b>ការទូទាត់ជោគជ័យថ្មី (New Paid Order)!</b>
--------------------------------------
🧾 <b>វិក្កយបត្រ:</b> <code>${order.orderNumber}</code>
🎮 <b>ហ្គេម:</b> ${order.gameName}
💎 <b>កញ្ចប់:</b> ${order.productName}
💵 <b>តម្លៃសរុប:</b> <b>$${Number(order.totalAmount).toFixed(2)} USD</b>

👤 <b>ព័ត៌មានគណនីអតិថិជន:</b>
${playerDetails}

⏰ <i>${new Date().toLocaleString()}</i>
    `.trim();

    try {
      const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: 'HTML',
        }),
      });

      const resData = await res.json();
      if (!resData.ok) {
        this.logger.error(`❌ Telegram API Error: ${resData.description} (Error Code: ${resData.error_code})`);
      } else {
        this.logger.log(`✅ ផ្ញើសារចូល Telegram បានជោគជ័យសម្រាប់ Order ${order.orderNumber}`);
      }
    } catch (err: any) {
      this.logger.error(`❌ បរាជ័យក្នុងការតភ្ជាប់ទៅកាន់ Telegram Server: ${err.message}`);
    }
  }
}