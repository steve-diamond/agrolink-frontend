

export default function AdminProtectedPage() {

// --- Move all logic, hooks, and variables that were after the closing brace back inside the function ---

// (BEGIN MOVED CODE)
  // The real main content (sidebar, header, module blocks, etc.) should be here. Remove any duplicate or placeholder fragments.
              Last {value} days
            </button>
          ))}
          <button
            type="button"
            onClick={handleLogout}
            className="ml-auto rounded-md border border-rose-300 bg-rose-100 px-3 py-1.5 text-xs font-semibold text-rose-700"
          >
            Logout
          </button>
        </div>

            {loading ? <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">Loading admin dashboard...</div> : null}
            {!loading && error ? <div className="rounded-xl border border-rose-300 bg-rose-100 px-4 py-3 text-rose-700">{error}</div> : null}

            <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 w-full">
                          {/* Advanced Analytics: Role Distribution & Approval Rate */}
                          {activeModule === "dashboard" && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 w-full">
                              {/* Role Distribution Pie Chart */}
                              <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                                <h3 className="m-0 text-base font-semibold mb-2">User Role Distribution</h3>
                                <div className="h-64">
                                  <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                      <Pie
                                        data={[
                                          { name: "Farmers", value: users.filter((u) => u.role === "farmer").length },
                                          { name: "Admins", value: users.filter((u) => u.role === "admin").length },
                                          { name: "Buyers", value: users.filter((u) => u.role === "buyer").length },
                                        ]}
                                        dataKey="value"
                                        nameKey="name"
                                        outerRadius={80}
                                        fill="#16a34a"
                                        label
                                      >
                                        {[
                                          { name: "Farmers", value: users.filter((u) => u.role === "farmer").length },
                                          { name: "Admins", value: users.filter((u) => u.role === "admin").length },
                                          { name: "Buyers", value: users.filter((u) => u.role === "buyer").length },
                                        ].map((entry, idx) => (
                                          <Cell key={entry.name} fill={["#16a34a", "#0ea5e9", "#f59e0b"][idx]} />
                                        ))}
                                      </Pie>
                                      <Tooltip contentStyle={chartTooltipStyle} />
                                      <Legend />
                                    </PieChart>
                                  </ResponsiveContainer>
                                </div>
                              </article>
                              {/* Farmer Approval Rate Bar Chart */}
                              <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                                <h3 className="m-0 text-base font-semibold mb-2">Farmer Approval Rate</h3>
                                <div className="h-64">
                                  <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={[
                                      { name: "Approved", value: verifiedFarmers },
                                      { name: "Pending", value: totalFarmers - verifiedFarmers },
                                    ]}>
                                      <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                                      <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                                      <Tooltip contentStyle={chartTooltipStyle} />
                                      <Bar dataKey="value" fill="#0ea5e9" radius={[6, 6, 0, 0]} />
                                    </BarChart>
                                  </ResponsiveContainer>
                                </div>
                              </article>
                            </div>
                          )}
                        {/* End dashboard module block */}
                        {/* The following articles should be inside the dashboard block or moved to the correct module block as needed. If they are dashboard stats, keep them inside the dashboard conditional. */}

            {activeModule === "notifications" ? (
              <div className="max-w-2xl mx-auto">
                <h3 className="text-lg font-bold mb-4">Notifications Center</h3>
                <ul className="space-y-2">
                  {notifications.length === 0 && <li className="text-slate-500">No notifications.</li>}
                  {notifications.map((notif) => (
                    <li key={notif.id} className="rounded-lg bg-white shadow px-4 py-3 flex items-center gap-3 border-l-4 border-green-600/60">
                      <span className="inline-block w-2 h-2 rounded-full bg-green-600/60"></span>
                      <span className="flex-1">
                        <span className="font-semibold">{NOTIF_TYPES[notif.type] || notif.type}:</span> {notif.message}
                      </span>
                      <span className="text-xs text-slate-400">{new Date(notif.createdAt).toLocaleTimeString()}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {activeModule === "auditlog" ? (
              <div className="max-w-3xl mx-auto">
                <h3 className="text-lg font-bold mb-4">Audit Log</h3>
                <table className="w-full bg-white rounded-lg shadow">
                  <thead>
                    <tr className="bg-green-50 text-green-900">
                      <th className="py-2 px-3 text-left">Action</th>
                      <th className="py-2 px-3 text-left">User</th>
                      <th className="py-2 px-3 text-left">Target</th>
                      <th className="py-2 px-3 text-left">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditLog.length === 0
                      ? <tr><td colSpan={4} className="text-slate-500 py-4 text-center">No audit log entries.</td></tr>
                      : auditLog.map((entry) => (
                          <tr key={entry.id} className="border-b last:border-b-0">
                            <td className="py-2 px-3">{entry.action}</td>
                            <td className="py-2 px-3">{entry.user}</td>
                            <td className="py-2 px-3">{entry.target}</td>
                            <td className="py-2 px-3 text-xs text-slate-400">{new Date(entry.timestamp).toLocaleString()}</td>
                          </tr>
                        ))
                    }
                  </tbody>


            {activeModule === "farmers" ? (
              <section className="space-y-4">
                {FARMER_CATEGORIES.map((category) => {
                  const categoryFarmers = farmerProfiles.filter((profile) => profile.category === category);
                  if (categoryFarmers.length === 0) return null;

                  return (
                    <article key={category} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                      <h3 className="m-0 text-lg font-semibold">{category} Farmers</h3>
                      <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                        {categoryFarmers.map((farmer) => (
                          <div key={farmer.id} className="rounded-xl border border-slate-200 p-3">
                            <div className="flex items-center justify-between">
                              <h4 className="m-0 text-base font-semibold">{farmer.name}</h4>
                              <span className={`rounded-full px-2 py-1 text-xs font-semibold ${farmer.approved ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                                {farmer.approved ? "Verified" : "Pending"}
                              </span>
                            </div>
                            <p className="m-0 mt-1 text-xs text-slate-500">{farmer.email}</p>
                            <p className="m-0 mt-3 text-sm"><strong>Farm Size:</strong> {farmer.farmSize}</p>
                            <p className="m-0 mt-1 text-sm"><strong>Capacity:</strong> {farmer.capacity}</p>
                            <div className="mt-3 flex flex-wrap gap-2">
                              <button
                                type="button"
                                onClick={() => approveFarmer(farmer.id)}
                                className="rounded-md bg-green-600 px-3 py-1.5 text-xs font-semibold text-white"
                              >
                                Approve
                              </button>
                              <button
                                type="button"
                                onClick={() => approveFarmer(farmer.id)}
                                className="rounded-md bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white"
                              >
                                Verify
                              </button>
                              <button
                                type="button"
                                className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700"
                              >
                                View Profile
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </article>
                  );
                })}
              </section>
            ) : null}

            {activeModule === "products" ? (
              <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <h3 className="m-0 text-lg font-semibold">Pending Products Queue</h3>
                <p className="mt-1 text-xs text-slate-500">Approved products are immediately available to marketplace consumers.</p>
                <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {pendingProducts.map((product) => (
                    <article key={product._id} className="rounded-xl border border-slate-200 p-3">
                      {product.image || product.imageUrl ? (
                        <div className="relative h-36 w-full overflow-hidden rounded-lg">
                          <Image
                            src={product.image || product.imageUrl || ""}
                            alt={product.name}
                            fill
                            unoptimized
                            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="flex h-36 items-center justify-center rounded-lg bg-slate-100 text-xs text-slate-500">No image</div>
                      )}
                      <h4 className="m-0 mt-3 text-base font-semibold">{product.name}</h4>
                      <p className="m-0 mt-1 text-sm text-slate-500">{product.description || "No description"}</p>
                      <p className="m-0 mt-2 text-lg font-bold text-green-700">{currencyFormatter.format(product.price || 0)}</p>

                      <div className="flex-1 space-y-6 p-3 sm:p-4 md:p-6 w-full">
                        <div className="flex flex-wrap items-center gap-2">
                          {[30, 90, 365].map((value) => (
                            <button
                              key={value}
                              onClick={() => setRangeDays(value as DateRange)}
                              className={`rounded-md border px-3 py-1.5 text-xs font-semibold ${
                                rangeDays === value ? "border-green-700 bg-green-700 text-white" : "border-slate-300 bg-white text-slate-700"
                              }`}
                            >
                              Last {value} days
                            </button>
                          ))}
                          <button
                            type="button"
                            onClick={handleLogout}
                            className="ml-auto rounded-md border border-rose-300 bg-rose-100 px-3 py-1.5 text-xs font-semibold text-rose-700"
                          >
                            Logout
                          </button>
                        </div>

                        {loading ? <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">Loading admin dashboard...</div> : null}
                        {!loading && error ? <div className="rounded-xl border border-rose-300 bg-rose-100 px-4 py-3 text-rose-700">{error}</div> : null}
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ) : null}
          {/* End main content */}
        </div>
      </main>
    );
}


