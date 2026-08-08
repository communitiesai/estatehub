import { useState, useRef, useEffect, type FormEvent } from 'react';
import { MessageSquare, X, Send, Bot, User as UserIcon, Sparkles } from 'lucide-react';

interface Message {
  id: string;
  role: 'bot' | 'user';
  text: string;
  quickReplies?: string[];
}

const WELCOME: Message = {
  id: 'welcome',
  role: 'bot',
  text: "Hi! I'm Hubot, your EstateHub assistant. I can help with property searches, pricing, scheduling viewings, and answering questions about our CRM. How can I help you today?",
  quickReplies: ['Browse properties', 'Pricing plans', 'Schedule a viewing', 'Book a demo'],
};

const QUICK_REPLIES = [
  'Browse properties', 'Pricing plans', 'Schedule a viewing', 'Book a demo',
  'Contact support', 'How does it work?',
];

function botReply(input: string): Message {
  const q = input.toLowerCase();
  let text = '';
  let quickReplies: string[] | undefined;

  if (/price|pricing|plan|cost|subscription/.test(q)) {
    text = "We offer three plans:\n\n• Starter — ₹1,499/mo: Up to 3 agents, 500 leads, core CRM\n• Growth — ₹3,999/mo: Up to 15 agents, unlimited leads, campaigns & analytics\n• Enterprise — Custom: Unlimited everything, priority support, custom integrations\n\nWould you like to see a detailed comparison?";
    quickReplies = ['Book a demo', 'Compare features', 'Start free trial'];
  } else if (/viewing|appointment|schedule|tour|visit/.test(q)) {
    text = "I can help you schedule a property viewing! Once you're signed in, go to Appointments and click 'Schedule Appointment'. You can pick the property, date, and time, and we'll notify the assigned agent. Would you like to browse available properties first?";
    quickReplies = ['Browse properties', 'Book a demo'];
  } else if (/propert|browse|search|listing|home|house|apartment/.test(q)) {
    text = "We have a wide range of properties — apartments, houses, villas, commercial spaces, and land. You can filter by type, price range, location, bedrooms, and more. Once you sign in, head to the Properties page to search and filter. Looking for something specific?";
    quickReplies = ['Schedule a viewing', 'Pricing plans'];
  } else if (/demo/.test(q)) {
    text = "I'd love to set up a demo for you! Our team will walk you through the entire CRM — lead management, pipeline tracking, property listings, and analytics. Just click 'Get started free' at the top of the page and we'll reach out within 24 hours.";
    quickReplies = ['Pricing plans', 'How does it work?'];
  } else if (/how|work|feature|what can/.test(q)) {
    text = "EstateHub is an all-in-one CRM for real estate teams. Here's what you can do:\n\n• Capture & track leads from multiple sources\n• Manage your property listings\n• Track deals through a visual pipeline\n• Schedule appointments & viewings\n• Assign tasks to team members\n• Run email/SMS campaigns\n• View analytics & reports\n\nWant to explore a specific feature?";
    quickReplies = ['Browse properties', 'Pricing plans', 'Book a demo'];
  } else if (/contact|support|help|email|phone/.test(q)) {
    text = "You can reach us at:\n\n📧 hello@estatehub.com\n📞 +91 80 4567 8900\n📍 Bangalore, India\n\nOur support team is available Mon–Fri, 9 AM – 7 PM IST. We typically respond within 2 hours!";
  } else if (/lead/.test(q)) {
    text = "Our CRM captures leads from 9 sources: property portals, social media, web forms, chatbots, WhatsApp, referrals, CSV imports, your website, and other channels. Each lead gets a score (hot/warm/cold), and you can assign them to agents, add tags, and track them through your sales pipeline.";
    quickReplies = ['How does it work?', 'Book a demo'];
  } else if (/deal|pipeline|kanban/.test(q)) {
    text = "Your deals flow through 6 stages: Inquiry → Viewing → Negotiation → Offer → Closed (or Lost). You can see all deals on the Deals page as a visual kanban board, track deal values, set close dates, and move deals between stages with a single click.";
    quickReplies = ['Browse properties', 'Pricing plans'];
  } else if (/hi|hello|hey|greetings/.test(q)) {
    text = "Hello! Welcome to EstateHub. How can I assist you today?";
    quickReplies = QUICK_REPLIES.slice(0, 4);
  } else if (/thank/.test(q)) {
    text = "You're very welcome! Is there anything else I can help you with?";
    quickReplies = ['Browse properties', 'Pricing plans'];
  } else if (/bye|goodbye|see you/.test(q)) {
    text = "Goodbye! Feel free to reach out anytime. Have a great day!";
  } else {
    text = "That's a great question! I can help with property searches, pricing plans, scheduling viewings, booking demos, and explaining how EstateHub works. Could you try one of these options, or rephrase your question?";
    quickReplies = QUICK_REPLIES;
  }

  return { id: crypto.randomUUID(), role: 'bot', text, quickReplies };
}

export function ChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [unread, setUnread] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, typing, open]);

  useEffect(() => {
    if (open) {
      setUnread(false);
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [open]);

  function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;

    const userMsg: Message = { id: crypto.randomUUID(), role: 'user', text: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setTyping(true);

    setTimeout(() => {
      const reply = botReply(trimmed);
      setTyping(false);
      setMessages((prev) => [...prev, reply]);
      if (!open) setUnread(true);
    }, 700 + Math.random() * 500);
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    send(input);
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className={`fixed bottom-5 right-5 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 ${
          open ? 'bg-slate-700 rotate-90 scale-90' : 'bg-slate-900 hover:bg-slate-800 hover:scale-105'
        }`}
        aria-label="Toggle chat"
      >
        {open ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <>
            <MessageSquare className="w-6 h-6 text-white" />
            {unread && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white" />
            )}
            {!unread && !open && (
              <span className="absolute inset-0 rounded-full bg-slate-400 opacity-40 animate-ping" style={{ animationDuration: '2.5s' }} />
            )}
          </>
        )}
      </button>

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-24 right-5 z-50 w-[calc(100vw-2.5rem)] sm:w-96 max-h-[70vh] flex flex-col card overflow-hidden animate-scaleIn shadow-2xl" style={{ transformOrigin: 'bottom right' }}>
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-4 py-3.5 flex items-center gap-3 flex-shrink-0">
            <div className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center flex-shrink-0">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-white text-sm flex items-center gap-1.5">
                Hubot <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <div className="text-xs text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" /> Online now
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-white p-1">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-slate-50/50 min-h-[200px]">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                  msg.role === 'bot' ? 'bg-slate-900' : 'bg-blue-500'
                }`}>
                  {msg.role === 'bot'
                    ? <Bot className="w-4 h-4 text-white" />
                    : <UserIcon className="w-4 h-4 text-white" />
                  }
                </div>
                <div className={`max-w-[78%] ${msg.role === 'user' ? 'items-end' : ''}`}>
                  <div className={`rounded-2xl px-3.5 py-2.5 text-sm whitespace-pre-line ${
                    msg.role === 'bot'
                      ? 'bg-white border border-slate-200 text-slate-700 rounded-tl-sm'
                      : 'bg-blue-600 text-white rounded-tr-sm'
                  }`}>
                    {msg.text}
                  </div>
                  {msg.quickReplies && msg.quickReplies.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {msg.quickReplies.map((qr) => (
                        <button
                          key={qr}
                          onClick={() => send(qr)}
                          className="text-xs px-2.5 py-1.5 rounded-full bg-white border border-slate-200 text-slate-600 hover:border-slate-900 hover:text-slate-900 transition-colors"
                        >
                          {qr}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {typing && (
              <div className="flex gap-2">
                <div className="w-7 h-7 rounded-full bg-slate-900 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="flex items-center gap-2 px-3 py-3 border-t border-slate-200 bg-white flex-shrink-0">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message…"
              className="flex-1 px-3.5 py-2.5 text-sm bg-slate-100 rounded-full border-0 focus:ring-2 focus:ring-slate-900/20 outline-none"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="w-9 h-9 rounded-full bg-slate-900 hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-all flex-shrink-0"
            >
              <Send className="w-4 h-4 text-white" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
