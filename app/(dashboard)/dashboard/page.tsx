"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import API from "@/services/api";
import { normalizeProductsResponse } from "@/services/productService";
import { useLocalizedCopy } from "@/services/useLocalizedCopy";

type AuthUser = {
  _id: string;
  name: string;
  email: string;
  role: "farmer" | "buyer" | "admin";
};

type Product = {
  _id: string;
  name: string;
  price: number;
  quantity: number;
  category?: string;
  location?: string;
  approved?: boolean;
  farmer?: string;
};

type OrderLineItem = {
  productId?: { _id?: string; name?: string; price?: number };
  quantity: number;
};

type Order = {
  _id: string;
  products?: OrderLineItem[];
  productId?: { _id?: string; name?: string; price?: number };
  quantity?: number;
  totalAmount?: number;
  totalPrice?: number;
  status: string;
  paymentStatus?: string;
  createdAt?: string;
};

type CommunityPost = {
  id: string;
  message: string;
  createdAt: string;
  comments: Array<{
    id: string;
    message: string;
    createdAt: string;
  }>;
};

function FarmerDashboard({ user }: { user: AuthUser }) {
  const { copy } = useLocalizedCopy();
  const [products, setProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>([]);
  const [communityDraft, setCommunityDraft] = useState("");
  const [commentDraftByPostId, setCommentDraftByPostId] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  const communityStorageKey = `agrolink-community-posts-${user._id}`;

  useEffect(() => {
    API.get("/api/products", { params: { farmer: user._id } })
      .then((res) => {
        const all = normalizeProductsResponse(res.data as unknown);
        setAllProducts(all);
        setProducts(all.filter((p: Product) => p.farmer === user._id));
      })
      .catch(() => {
        setAllProducts([]);
        setProducts([]);
      })
      .finally(() => setLoading(false));
  }, [user._id]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(communityStorageKey);
      if (!raw) {
        return;
      }

      const parsed = JSON.parse(raw) as CommunityPost[];
      if (Array.isArray(parsed)) {
        setCommunityPosts(parsed);
      }
    } catch {
      setCommunityPosts([]);
    }
  }, [communityStorageKey]);

  const handleShareCommunityPost = () => {
    const message = communityDraft.trim();
    if (!message) {
      return;
    }

    const next: CommunityPost[] = [
      {
        id: `${Date.now()}`,
        message,
        createdAt: new Date().toISOString(),
        comments: [],
      },
      ...communityPosts,
    ].slice(0, 8);

    setCommunityPosts(next);
    setCommunityDraft("");
    localStorage.setItem(communityStorageKey, JSON.stringify(next));
  };

  const handleAddComment = (postId: string) => {
    const draft = (commentDraftByPostId[postId] || "").trim();
    if (!draft) {
      return;
    }

    const nextPosts = communityPosts.map((post) => {
      if (post.id !== postId) {
        return post;
      }

      const nextComments = [
        {
          id: `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
          message: draft,
          createdAt: new Date().toISOString(),
        },
        ...(post.comments || []),
      ].slice(0, 6);

      return {
        ...post,
        comments: nextComments,
      };
    });

    setCommunityPosts(nextPosts);
    setCommentDraftByPostId((prev) => ({ ...prev, [postId]: "" }));
    localStorage.setItem(communityStorageKey, JSON.stringify(nextPosts));
  };

  const primaryLocation =
    products.find((product) => (product.location || "").trim())?.location?.trim().toLowerCase() || "";

  const nearbyProducts = primaryLocation
    ? allProducts
        .filter((product) => (product.farmer || "") !== user._id)
        .filter((product) => (product.location || "").trim().toLowerCase().includes(primaryLocation))
        .slice(0, 5)
    : [];

  return (
    <main className="mx-auto grid max-w-5xl gap-4">
      <section className="rounded-2xl border border-green-900/25 bg-linear-to-br from-green-950 via-green-900 to-green-700 p-5 text-green-50 shadow-xl shadow-green-900/25">
        <p className="m-0 text-xs uppercase tracking-[0.16em] text-green-100">{copy.myFarm}</p>
        <h1 className="m-0 mt-1 text-3xl font-bold">{copy.welcome}, {user.name}</h1>
        <p className="mb-0 mt-2 text-sm text-green-100">Track crop listings and sync updates even with weak network.</p>
      </section>

      <section className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="m-0 text-xl font-bold text-green-950">{copy.myProducts}</h2>
        <Link href="/farmer/upload" className="btn-primary touch-target inline-flex items-center justify-center px-4 no-underline">
          + {copy.uploadNewProduct}
        </Link>
      </section>

      {loading ? <p className="m-0 text-sm text-slate-600">{copy.loadingProducts}</p> : null}

      {!loading && products.length === 0 ? (
        <section className="card border-dashed p-5 text-center">
          <p className="m-0 text-slate-600">{copy.noProductsYet}</p>
          <Link href="/farmer/upload" className="mt-3 inline-block font-bold text-green-700 no-underline">{copy.uploadFirstProduct}</Link>
        </section>
      ) : null}

      <section className="grid gap-3">
        {products.map((product) => (
          <article key={product._id} className={`card p-4 ${product.approved ? "border-emerald-200 bg-emerald-50/60" : "border-amber-200 bg-amber-50/60"}`}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="m-0 text-lg font-bold text-green-950">{product.name}</h3>
                <p className="m-0 mt-1 text-sm text-slate-600">NGN {Number(product.price).toLocaleString()} · Qty {product.quantity}</p>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-bold ${product.approved ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                {product.approved ? copy.approved : copy.pending}
              </span>
            </div>
          </article>
        ))}
      </section>

      <section className="card p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="m-0 text-xl font-bold text-green-950">Farmer Community Hub</h2>
          <p className="m-0 text-xs font-semibold uppercase tracking-[0.08em] text-green-700">Share • Learn • Collaborate</p>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="grid gap-2">
            <label htmlFor="communityPost" className="text-sm font-semibold text-green-950">Post an update to your community wall</label>
            <textarea
              id="communityPost"
              value={communityDraft}
              onChange={(e) => setCommunityDraft(e.target.value)}
              rows={3}
              placeholder="Share market updates, crop tips, or transport needs with fellow farmers."
              className="rounded-lg border border-green-200 px-3 py-2 outline-none ring-green-200 focus:ring"
            />
            <button
              type="button"
              onClick={handleShareCommunityPost}
              className="btn-primary touch-target w-fit px-4"
            >
              Share Update
            </button>

            <div className="mt-2 grid gap-2">
              {communityPosts.length === 0 ? (
                <p className="m-0 rounded-lg border border-dashed border-slate-300 px-3 py-2 text-sm text-slate-600">
                  No posts yet. Start your first community update.
                </p>
              ) : (
                communityPosts.map((post) => (
                  <article key={post.id} className="rounded-lg border border-emerald-100 bg-emerald-50/50 px-3 py-2">
                    <p className="m-0 text-sm text-slate-800">{post.message}</p>
                    <p className="m-0 mt-1 text-xs text-slate-500">{new Date(post.createdAt).toLocaleString()}</p>

                    <div className="mt-2 grid gap-2 rounded-md bg-white/70 p-2">
                      <label className="text-xs font-semibold text-emerald-900">Reply to this update</label>
                      <div className="flex gap-2">
                        <input
                          value={commentDraftByPostId[post.id] || ""}
                          onChange={(e) =>
                            setCommentDraftByPostId((prev) => ({
                              ...prev,
                              [post.id]: e.target.value,
                            }))
                          }
                          placeholder="Write a reply..."
                          className="min-h-10 flex-1 rounded-md border border-emerald-200 px-2 py-1 text-sm outline-none ring-emerald-200 focus:ring"
                        />
                        <button
                          type="button"
                          onClick={() => handleAddComment(post.id)}
                          className="rounded-md border border-emerald-300 bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-900 hover:bg-emerald-200"
                        >
                          Reply
                        </button>
                      </div>

                      {(post.comments || []).length > 0 ? (
                        <div className="grid gap-1">
                          {(post.comments || []).map((comment) => (
                            <div key={comment.id} className="rounded-md border border-emerald-100 bg-white px-2 py-1">
                              <p className="m-0 text-xs text-slate-700">{comment.message}</p>
                              <p className="m-0 mt-0.5 text-[11px] text-slate-500">{new Date(comment.createdAt).toLocaleString()}</p>
                            </div>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </article>
                ))
              )}
            </div>
          </div>

          <aside className="grid gap-2">
            <h3 className="m-0 text-sm font-bold uppercase tracking-[0.08em] text-green-800">Community Channels</h3>
            <Link href="/marketplace" className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm font-semibold text-green-900 no-underline hover:bg-green-100">
              Market Price Watch
            </Link>
            <Link href="/logistics" className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm font-semibold text-green-900 no-underline hover:bg-green-100">
              Logistics & Transport Coordination
            </Link>
            <Link href="/loan-application" className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm font-semibold text-green-900 no-underline hover:bg-green-100">
              Cooperative Finance Support
            </Link>
            <Link href="/vision" className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm font-semibold text-green-900 no-underline hover:bg-green-100">
              Advisory & Knowledge Hub
            </Link>

            <div className="mt-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
              <h4 className="m-0 text-xs font-bold uppercase tracking-[0.08em] text-slate-700">Nearby Farmers</h4>
              <p className="m-0 mt-1 text-xs text-slate-600">
                {primaryLocation
                  ? `Based on your current listing area: ${primaryLocation}`
                  : "Add a product location to discover nearby farmers."}
              </p>

              <div className="mt-2 grid gap-1">
                {nearbyProducts.length === 0 ? (
                  <p className="m-0 text-xs text-slate-500">No nearby farmer listings found yet.</p>
                ) : (
                  nearbyProducts.map((item) => (
                    <div key={item._id} className="rounded-md border border-slate-200 bg-white px-2 py-1">
                      <p className="m-0 text-xs font-semibold text-slate-800">{item.name}</p>
                      <p className="m-0 text-[11px] text-slate-500">{item.location || "Unknown location"}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}

function BuyerDashboard({ user }: { user: AuthUser }) {
  const { copy } = useLocalizedCopy();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    API.get<Order[]>("/api/orders")
      .then((res) => setOrders(Array.isArray(res.data) ? res.data : []))
      .catch((err) => setError(err?.response?.data?.message || "Failed to load orders."))
      .finally(() => setLoading(false));
  }, []);

  const getItems = (order: Order): OrderLineItem[] => {
    if (Array.isArray(order.products) && order.products.length) return order.products;
    if (order.productId) return [{ productId: order.productId, quantity: order.quantity ?? 0 }];
    return [];
  };

  return (
    <main className="mx-auto grid max-w-5xl gap-4">
      <section className="rounded-2xl border border-green-900/25 bg-linear-to-br from-green-950 via-green-900 to-green-700 p-5 text-green-50 shadow-xl shadow-green-900/25">
        <p className="m-0 text-xs uppercase tracking-[0.16em] text-green-100">{copy.marketHub}</p>
        <h1 className="m-0 mt-1 text-3xl font-bold">{copy.welcome}, {user.name}</h1>
        <p className="mb-0 mt-2 text-sm text-green-100">Check order status and negotiate with trusted farmers.</p>
      </section>

      <section className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="m-0 text-xl font-bold text-green-950">{copy.myOrders}</h2>
        <Link href="/marketplace" className="btn-primary touch-target inline-flex items-center justify-center px-4 no-underline">
          {copy.marketHub}
        </Link>
      </section>

      {loading ? <p className="m-0 text-sm text-slate-600">{copy.loadingOrders}</p> : null}
      {error ? <p className="m-0 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p> : null}

      {!loading && !error && orders.length === 0 ? (
        <section className="card border-dashed p-5 text-center">
          <p className="m-0 text-slate-600">{copy.noOrdersYet}</p>
          <Link href="/marketplace" className="mt-3 inline-block font-bold text-green-700 no-underline">{copy.browseMarketplace}</Link>
        </section>
      ) : null}

      <section className="grid gap-3">
        {orders.map((order) => {
          const items = getItems(order);
          const total = Number(order.totalAmount ?? order.totalPrice ?? 0);
          return (
            <article key={order._id} className="card p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="m-0 text-base font-bold text-green-950">
                  {items.length > 1 ? `${items.length} items` : items[0]?.productId?.name || "Order"}
                </h3>
                <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">{order.status}</span>
              </div>
              <p className="m-0 mt-2 text-sm text-slate-700">Total: NGN {total.toLocaleString()}</p>
              {order.createdAt ? <p className="m-0 mt-1 text-xs text-slate-500">{new Date(order.createdAt).toLocaleDateString()}</p> : null}
            </article>
          );
        })}
      </section>
    </main>
  );
}

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const raw = localStorage.getItem("user");

    if (!token || !raw) {
      router.replace("/login");
      return;
    }

    try {
      const parsed = JSON.parse(raw) as AuthUser;
      if (parsed.role === "admin") {
        router.replace("/admin");
        return;
      }
      setUser(parsed);
    } catch {
      router.replace("/login");
    }
  }, [router]);

  if (!user) {
    return <main className="p-8 text-center text-slate-600">Loading...</main>;
  }

  if (user.role === "farmer") return <FarmerDashboard user={user} />;
  if (user.role === "buyer") return <BuyerDashboard user={user} />;

  return null;
}