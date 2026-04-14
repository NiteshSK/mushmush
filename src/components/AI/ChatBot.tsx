"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { MessageCircle, X, Send, User, Bot, Loader2, ShoppingBag, MessageSquare, Search, Heart } from "lucide-react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useSession } from "next-auth/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import ChatProductCard, { type ChatProduct } from "./ChatProductCard";
import ChatCheckout from "./ChatCheckout";
import ChatPayment from "./ChatPayment";
import { useWishlist } from "@/app/context/WishlistContext";

// ─── Types ───────────────────────────────────────────
type ChatView = "chat" | "shop" | "wishlist" | "checkout" | "payment";

interface OrderData {
  orderNumber: string;
  orderId: string;
  total: number;
  customerName: string;
  email: string;
}

// ─── Main Component ──────────────────────────────────
const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [view, setView] = useState<ChatView>("chat");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { data: session, update: updateSession } = useSession();
  const router = useRouter();
  const { items: wishlistItems, loading: wishlistLoading } = useWishlist();

  // Shop state
  const [products, setProducts] = useState<ChatProduct[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<ChatProduct | null>(null);

  // Payment state
  const [orderData, setOrderData] = useState<OrderData | null>(null);

  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({ api: "/api/ai-chat" }),
  });

  const isLoading = status === "submitted" || status === "streaming";

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen && view === "chat") scrollToBottom();
  }, [messages, isOpen, view]);

  // Fetch products when shop tab opens
  const fetchProducts = useCallback(async (query?: string) => {
    setLoadingProducts(true);
    try {
      let url: string;
      if (query?.trim()) {
        const params = new URLSearchParams({ q: query, limit: "20" });
        url = `/api/products/search?${params}`;
      } else {
        const params = new URLSearchParams({ limit: "20", inStock: "true" });
        url = `/api/products?${params}`;
      }
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || []);
      }
    } catch {
      // silently fail
    } finally {
      setLoadingProducts(false);
    }
  }, []);

  useEffect(() => {
    if (view === "shop" && products.length === 0) fetchProducts();
  }, [view, products.length, fetchProducts]);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    const content = input;
    setInput("");
    await sendMessage({ text: content });
  };

  // On mount: check if user returned from sign-in with a pending product
  useEffect(() => {
    if (!session?.user) return;
    const pending = localStorage.getItem("chatbot_pending_product");
    if (!pending) return;
    try {
      const product = JSON.parse(pending) as ChatProduct;
      localStorage.removeItem("chatbot_pending_product");
      setSelectedProduct(product);
      setIsOpen(true);
      setView("checkout");
      toast.success("Welcome back! Continue your purchase.");
    } catch {
      localStorage.removeItem("chatbot_pending_product");
    }
  }, [session]);

  const handleBuy = (product: ChatProduct) => {
    setSelectedProduct(product);
    if (session?.user) {
      setView("checkout");
    } else {
      // Save product so we can restore checkout after sign-in
      localStorage.setItem("chatbot_pending_product", JSON.stringify(product));
      // Close chatbox first so the redirect looks clean
      setIsOpen(false);
      toast("Please sign in to complete your purchase. Redirecting...", {
        icon: "🔒",
        duration: 2500,
      });
      // Brief delay so user reads the toast before navigating
      setTimeout(() => {
        router.push(`/auth/signin?callbackUrl=${encodeURIComponent(window.location.href)}`);
      }, 800);
    }
  };

  const handleProceedToPayment = (data: OrderData) => {
    setOrderData(data);
    setView("payment");
  };

  const handlePaymentComplete = () => {
    setSelectedProduct(null);
    setOrderData(null);
    setView("chat");
  };

  const handleSearchProducts = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProducts(searchQuery);
  };

  const switchView = (newView: ChatView) => {
    if (newView === "chat" || newView === "shop" || newView === "wishlist") {
      setView(newView);
    }
  };

  // ─── Link renderer shared by all markdown ──────────
  const markdownComponents = {
    a: ({ node, ...props }: any) => {
      const href = props.href || "";
      const isWhatsApp = href.includes("wa.me");
      const isEmail = href.startsWith("mailto:");
      const isPhone = href.startsWith("tel:");

      if (isWhatsApp) {
        return (
          <a {...props} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#25D366] text-white hover:bg-[#1da851] transition-all mx-0.5 align-middle" title="Chat on WhatsApp">
            <svg className="fill-current" width="14" height="14" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" fillRule="evenodd" />
            </svg>
          </a>
        );
      }
      if (isEmail) {
        return (
          <a {...props} className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-forest text-white hover:bg-green-700 transition-all mx-0.5 align-middle" title="Send Email">
            <svg className="fill-current" width="14" height="14" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
            </svg>
          </a>
        );
      }
      if (isPhone) {
        return (
          <a {...props} className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-forest text-white hover:bg-green-700 transition-all mx-0.5 align-middle" title="Call Phone">
            <svg className="fill-current" width="14" height="14" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
            </svg>
          </a>
        );
      }
      return <a {...props} target="_blank" rel="noopener noreferrer" className="text-forest underline underline-offset-2 hover:text-green-700 break-all" />;
    },
  };

  // ─── Render message parts (text + tool results) ────
  const renderMessageParts = (parts: any[], role: string) => {
    return parts.map((part: any, i: number) => {
      if (part.type === "text" && part.text) {
        return (
          <ReactMarkdown key={i} remarkPlugins={[remarkGfm]} components={markdownComponents}>
            {part.text}
          </ReactMarkdown>
        );
      }
      // AI SDK v5: tool parts have type "tool-{toolName}" and state "output-available"
      if (part.type === "tool-searchProducts" && part.state === "output-available") {
        const toolProducts: ChatProduct[] = part.output || [];
        if (toolProducts.length === 0) return null;
        return (
          <div key={i} className="mt-2 space-y-2">
            {toolProducts.map((product) => (
              <ChatProductCard key={product.id} product={product} onBuy={handleBuy} />
            ))}
            <button
              onClick={() => switchView("shop")}
              className="w-full text-center text-[11px] text-forest font-medium py-1.5 border border-forest/20 rounded-full hover:bg-forest/5 transition-colors"
            >
              Browse all products in Shop →
            </button>
          </div>
        );
      }
      // Fallback: handle tool parts in loading/streaming state
      if (typeof part.type === "string" && part.type.startsWith("tool-") && part.state !== "output-available") {
        return (
          <div key={i} className="flex items-center gap-2 mt-1 text-xs text-gray-400">
            <Loader2 size={12} className="animate-spin text-forest" />
            <span>Searching products...</span>
          </div>
        );
      }
      return null;
    });
  };

  // ─── Render ────────────────────────────────────────
  return (
    <div className={`fixed bottom-6 right-6 ${isOpen ? 'z-[100000]' : 'z-[9999]'}`}>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-forest text-white p-4 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center relative animate-bounce-gentle"
        >
          <span className="absolute inset-0 rounded-full bg-forest/40 animate-ping-slow pointer-events-none" />
          <div className="absolute -top-1 -right-1 z-20 bg-dark text-white text-[9px] rounded-full w-5 h-5 flex items-center justify-center font-semibold shadow-md">
            1
          </div>
          <MessageCircle size={26} className="relative z-10" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="bg-white border border-gray-200 shadow-2xl flex flex-col overflow-hidden transition-all duration-300 fixed inset-0 w-full h-full rounded-none z-[100000] sm:static sm:w-[400px] sm:h-[620px] sm:rounded-2xl">
          {/* Header */}
          <div className="bg-forest px-4 py-3 flex justify-between items-center text-white flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-white/15 rounded-full flex items-center justify-center">
                <Bot size={16} />
              </div>
              <div>
                <h3 className="font-medium text-sm leading-tight">Kosvana</h3>
                <span className="text-[10px] text-white/60">Shop & Chat</span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          {/* Tab Bar — show for chat/shop/wishlist views */}
          {(view === "chat" || view === "shop" || view === "wishlist") && (
            <div className="flex border-b border-gray-100 bg-white flex-shrink-0">
              <button
                onClick={() => switchView("chat")}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-colors ${
                  view === "chat"
                    ? "text-forest border-b-2 border-forest"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                <MessageSquare size={13} /> Chat
              </button>
              <button
                onClick={() => switchView("shop")}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-colors ${
                  view === "shop"
                    ? "text-forest border-b-2 border-forest"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                <ShoppingBag size={13} /> Shop
              </button>
              <button
                onClick={() => switchView("wishlist")}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-colors relative ${
                  view === "wishlist"
                    ? "text-forest border-b-2 border-forest"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                <Heart size={13} /> Wishlist
                {wishlistItems.length > 0 && (
                  <span className="absolute top-1.5 right-[calc(50%-28px)] min-w-[14px] h-[14px] bg-red-500 text-white text-[8px] rounded-full flex items-center justify-center font-bold px-0.5">
                    {wishlistItems.length}
                  </span>
                )}
              </button>
            </div>
          )}

          {/* ─── Chat View ─── */}
          {view === "chat" && (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-sand min-h-0">
                {messages.length === 0 && (
                  <>
                    <div className="flex justify-start">
                      <div className="max-w-[90%] p-3.5 rounded-2xl rounded-tl-sm bg-white border border-gray-200">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-5 h-5 bg-forest/10 rounded-full flex items-center justify-center text-forest">
                            <Bot size={11} />
                          </div>
                          <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">Kosvana</span>
                        </div>
                        <div className="leading-relaxed text-gray-600 text-xs markdown-content">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {"Hello! I'm your Kosvana guide.\n\nI can help you with:\n- **Browse & Buy Products** right here\n- **Premium Mushrooms & Dry Fruits**\n- **Seeds, Spices & Superfoods**\n- **Mushroom Cultivation Training**\n\nAsk me about any product or tap **Shop** above to browse!"}
                          </ReactMarkdown>
                        </div>
                      </div>
                    </div>

                    {/* Quick-action chips */}
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        { label: "🍄 Show Mushrooms", prompt: "Show me your mushroom products" },
                        { label: "🥜 Dry Fruits", prompt: "What dry fruits do you have?" },
                        { label: "🌱 Seeds & Spices", prompt: "Show me seeds and spices" },
                        { label: "🎓 Training Programs", prompt: "Tell me about mushroom cultivation training" },
                        { label: "🔥 Best Sellers", prompt: "What are your best selling products?" },
                        { label: "📍 Contact & Location", prompt: "Where are you located and how can I contact you?" },
                      ].map((chip) => (
                        <button
                          key={chip.label}
                          onClick={() => sendMessage({ text: chip.prompt })}
                          className="bg-white border border-gray-200 text-gray-600 text-[11px] px-3 py-1.5 rounded-full hover:bg-forest/5 hover:border-forest/20 hover:text-forest transition-colors"
                        >
                          {chip.label}
                        </button>
                      ))}
                    </div>
                  </>
                )}

                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[90%] p-3.5 rounded-2xl ${
                        msg.role === "user"
                          ? "bg-dark text-white rounded-tr-sm"
                          : "bg-white border border-gray-200 rounded-tl-sm"
                      }`}
                    >
                      {/* Message header */}
                      <div className="flex items-center gap-2 mb-1.5">
                        {msg.role === "assistant" ? (
                          <div className="w-5 h-5 bg-forest/10 rounded-full flex items-center justify-center text-forest">
                            <Bot size={11} />
                          </div>
                        ) : (
                          <div className="w-5 h-5 bg-white/15 rounded-full flex items-center justify-center ml-auto">
                            <User size={11} />
                          </div>
                        )}
                        <span className={`text-[10px] font-medium uppercase tracking-wider ${msg.role === "user" ? "text-white/50" : "text-gray-400"}`}>
                          {msg.role === "user" ? "You" : "Kosvana"}
                        </span>
                      </div>

                      {/* Message body */}
                      <div className={`leading-relaxed markdown-content text-xs ${msg.role === "user" ? "text-white" : "text-gray-600"}`}>
                        {renderMessageParts(msg.parts, msg.role)}
                      </div>
                    </div>
                  </div>
                ))}

                {isLoading && messages[messages.length - 1]?.role === "user" && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm p-3.5 max-w-[85%] flex items-center gap-2">
                      <Loader2 className="animate-spin text-forest" size={14} />
                      <span className="text-xs text-gray-400">Thinking...</span>
                    </div>
                  </div>
                )}
                {error && (
                  <div className="p-3 bg-red-50 text-red-600 text-xs rounded-xl border border-red-200 flex items-center gap-2">
                    <span>Something went wrong. Please try again.</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input */}
              <form onSubmit={handleFormSubmit} className="px-4 py-3 bg-white border-t border-gray-100 flex gap-2 items-center flex-shrink-0">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Search products or ask anything..."
                  className="flex-1 text-xs border-none focus:ring-0 focus:outline-none placeholder:text-gray-400 text-dark"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className={`w-8 h-8 flex items-center justify-center rounded-full transition-all duration-200 ${
                    input.trim() && !isLoading ? "bg-forest text-white hover:bg-green-700" : "bg-gray-100 text-gray-400"
                  }`}
                >
                  <Send size={14} />
                </button>
              </form>
            </>
          )}

          {/* ─── Shop View ─── */}
          {view === "shop" && (
            <div className="flex-1 overflow-y-auto min-h-0">
              {/* Search */}
              <form onSubmit={handleSearchProducts} className="p-3 border-b border-gray-100 flex-shrink-0">
                <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
                  <Search size={14} className="text-gray-400 flex-shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search products..."
                    className="flex-1 text-xs bg-transparent border-none focus:ring-0 focus:outline-none placeholder:text-gray-400 text-dark"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => { setSearchQuery(""); fetchProducts(); }}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>
              </form>

              {/* Product list */}
              <div className="p-3 space-y-2">
                {loadingProducts ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Loader2 size={20} className="animate-spin text-forest mb-2" />
                    <span className="text-xs text-gray-400">Loading products...</span>
                  </div>
                ) : products.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingBag size={24} className="mx-auto text-gray-300 mb-2" />
                    <p className="text-xs text-gray-400">No products found</p>
                  </div>
                ) : (
                  products.map((product) => (
                    <ChatProductCard key={product.id} product={product} onBuy={handleBuy} />
                  ))
                )}
              </div>
            </div>
          )}

          {/* ─── Wishlist View ─── */}
          {view === "wishlist" && (
            <div className="flex-1 overflow-y-auto min-h-0">
              <div className="p-3 space-y-2">
                {!session?.user ? (
                  <div className="text-center py-12">
                    <Heart size={24} className="mx-auto text-gray-300 mb-2" />
                    <p className="text-xs text-gray-500 mb-3">Sign in to view your wishlist</p>
                    <button
                      onClick={() => {
                        setIsOpen(false);
                        router.push(`/auth/signin?callbackUrl=${encodeURIComponent(window.location.href)}`);
                      }}
                      className="text-xs text-forest font-semibold hover:text-green-700"
                    >
                      Sign In
                    </button>
                  </div>
                ) : wishlistLoading ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Loader2 size={20} className="animate-spin text-forest mb-2" />
                    <span className="text-xs text-gray-400">Loading wishlist...</span>
                  </div>
                ) : wishlistItems.length === 0 ? (
                  <div className="text-center py-12">
                    <Heart size={24} className="mx-auto text-gray-300 mb-2" />
                    <p className="text-xs text-gray-500 mb-1">Your wishlist is empty</p>
                    <p className="text-[10px] text-gray-400 mb-3">Tap the heart icon on products to save them here</p>
                    <button
                      onClick={() => switchView("shop")}
                      className="text-xs text-forest font-semibold hover:text-green-700"
                    >
                      Browse Shop
                    </button>
                  </div>
                ) : (
                  wishlistItems.map((item: any) => {
                    const p = item.product;
                    if (!p) return null;
                    const chatProduct: ChatProduct = {
                      id: p.id,
                      title: p.title,
                      slug: p.slug,
                      price: p.price,
                      discountedPrice: p.discountedPrice || null,
                      discountPercentage: p.discountedPrice ? Math.round(((p.price - p.discountedPrice) / p.price) * 100) : 0,
                      hasDiscount: !!p.discountedPrice && p.discountedPrice < p.price,
                      inStock: p.inStock,
                      imgs: p.imgs || { thumbnails: [], previews: [] },
                      averageRating: p.averageRating || 0,
                      reviewCount: p.reviewCount || 0,
                      measurementValue: p.measurementValue,
                      measurementType: p.measurementType,
                      stockQuantity: p.stockQuantity,
                    };
                    return <ChatProductCard key={p.id} product={chatProduct} onBuy={handleBuy} />;
                  })
                )}
              </div>
            </div>
          )}

          {/* ─── Checkout View ─── */}
          {view === "checkout" && selectedProduct && (
            <ChatCheckout
              product={selectedProduct}
              onBack={() => setView("shop")}
              onProceedToPayment={handleProceedToPayment}
              userInfo={session?.user ? { name: session.user.name, email: session.user.email } : undefined}
            />
          )}

          {/* ─── Payment View ─── */}
          {view === "payment" && orderData && (
            <ChatPayment
              orderNumber={orderData.orderNumber}
              total={orderData.total}
              customerName={orderData.customerName}
              email={orderData.email}
              onBack={() => setView("checkout")}
              onPaymentComplete={handlePaymentComplete}
            />
          )}

          {/* Footer */}
          <div className="px-4 py-1.5 bg-gray-50 text-[10px] text-center text-gray-400 tracking-wide border-t border-gray-100 flex-shrink-0">
            Powered by Kosvana AI
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatBot;
