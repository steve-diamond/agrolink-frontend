
import { sendTextMessage, sendInteractiveList } from './api';
import { WELCOME_MENU } from './menus';
import { dbConnect } from '../mongoose';
import WhatsAppSession from '../../models/whatsappSession';

// Stateless handler for WhatsApp webhook events
export async function handleConversation(payload: Record<string, unknown>) {
  await dbConnect();
  // Extract phone number and message
  const entry = payload.entry?.[0];
  const changes = entry?.changes?.[0];
  const message = changes?.value?.messages?.[0];
  if (!message) return;
  const from = message.from;
  const text = message.text?.body?.trim();

  // Load or create session
  const session = await WhatsAppSession.findOne({ phone_number: from });
  const now = new Date();
  if (!session || (session.last_active && (now.getTime() - session.last_active.getTime()) > 30 * 60 * 1000)) {
    // New or timed-out session: show welcome
    await WhatsAppSession.findOneAndUpdate(
      { phone_number: from },
      { phone_number: from, current_menu: 'WELCOME', context: {}, last_active: now },
      { upsert: true, new: true }
    );
    await sendTextMessage(from, WELCOME_MENU.text);
    return;
  }

  // State machine: menu routing
  switch (session.current_menu) {
    case 'WELCOME':
      if (text === '1') {
        await WhatsAppSession.updateOne({ phone_number: from }, { current_menu: 'PRICES', last_active: now });
        // TODO: send commodity list
        await sendInteractiveList(from, 'Commodities', 'Select a commodity:', [
          { title: 'Maize', id: 'maize' },
          { title: 'Rice', id: 'rice' },
          { title: 'Soybean', id: 'soybean' },
        ]);
      } else if (text === '2') {
        await WhatsAppSession.updateOne({ phone_number: from }, { current_menu: 'POST_PRODUCE_CROP', last_active: now, context: {} });
        await sendTextMessage(from, 'What crop do you want to list?');
      } else if (text === '3') {
        await WhatsAppSession.updateOne({ phone_number: from }, { current_menu: 'LOAN', last_active: now });
        // TODO: check user registration
        await sendTextMessage(from, 'Checking eligibility...');
      } else if (text === '4') {
        await WhatsAppSession.updateOne({ phone_number: from }, { current_menu: 'ORDERS', last_active: now });
        await sendTextMessage(from, 'Order checking coming soon.');
      } else if (text === '5') {
        await WhatsAppSession.updateOne({ phone_number: from }, { current_menu: 'SUPPORT', last_active: now });
        await sendTextMessage(from, 'Connecting you to support...');
      } else {
        await sendTextMessage(from, WELCOME_MENU.text);
      }
      break;
    // ...implement other menu states (PRICES, POST_PRODUCE, LOAN, etc.)
    default:
      await sendTextMessage(from, WELCOME_MENU.text);
  }
}

// Menu tree and state machine logic should be expanded for each menu state.
// See detailed comments in the menu tree above for each branch.

// Removed unused getMenuTree function
