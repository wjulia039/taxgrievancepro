'use client';

import { useEffect, useState } from 'react';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { PageBody, PageHeader } from '@kit/ui/page';
import { useSupabase } from '@kit/supabase/hooks/use-supabase';

type RecentOrder = {
  id: string;
  status: string;
  created_at: string;
  prechecks: {
    decision: string;
    properties: {
      formatted_address: string;
    };
  };
};

export default function HomePage() {
  const supabase = useSupabase();
  const router = useRouter();

  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [precheckCount, setPrecheckCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) return;

        // Get recent orders with precheck + property info
        const { data: orders } = await (supabase as any)
          .from('orders')
          .select(
            'id, status, created_at, prechecks(decision, properties(formatted_address))',
          )
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5);

        if (orders) setRecentOrders(orders);

        // Get total prechecks count
        const { count } = await (supabase as any)
          .from('prechecks')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id);

        if (count !== null) setPrecheckCount(count);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [supabase]);

  const statusLabel: Record<string, { text: string; color: string }> = {
    COMPLETED: { text: 'Completed', color: 'bg-green-100 text-green-800' },
    PROCESSING: { text: 'Processing', color: 'bg-blue-100 text-blue-800' },
    PAID: { text: 'Paid', color: 'bg-yellow-100 text-yellow-800' },
    FAILED: { text: 'Failed', color: 'bg-red-100 text-red-800' },
    CREATED: { text: 'Created', color: 'bg-gray-100 text-gray-600' },
    PAYMENT_PENDING: {
      text: 'Pending',
      color: 'bg-gray-100 text-gray-600',
    },
    CANCELED: { text: 'Canceled', color: 'bg-gray-100 text-gray-400' },
  };

  return (
    <>
      <PageHeader
        title="Welcome to TaxGrievancePro"
        description="Check your property tax grievance eligibility and generate professional reports."
      />

      <PageBody>
        <div className="grid gap-6 md:grid-cols-3">
          {/* Start Check Card */}
          <Link
            href="/home/check"
            className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 p-8 transition hover:border-primary/60 hover:bg-primary/10"
          >
            <div className="mb-3 text-4xl">🏠</div>
            <h3 className="text-lg font-semibold text-primary">
              Start New Check
            </h3>
            <p className="mt-1 text-center text-sm text-muted-foreground">
              Enter your property address to check eligibility
            </p>
          </Link>

          {/* Stats Card */}
          <div className="rounded-xl border bg-card p-6">
            <h3 className="text-sm font-medium text-muted-foreground">
              Total Checks
            </h3>
            <p className="mt-2 text-3xl font-bold">
              {loading ? '—' : precheckCount}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              properties analyzed
            </p>
          </div>

          {/* Reports Card */}
          <Link
            href="/home/reports"
            className="rounded-xl border bg-card p-6 transition hover:shadow-md"
          >
            <h3 className="text-sm font-medium text-muted-foreground">
              My Reports
            </h3>
            <p className="mt-2 text-3xl font-bold">
              {loading
                ? '—'
                : recentOrders.filter((o) => o.status === 'COMPLETED').length}
            </p>
            <p className="mt-1 text-xs text-primary">View all reports →</p>
          </Link>
        </div>

        {/* Recent Activity */}
        {!loading && recentOrders.length > 0 && (
          <div className="mt-8">
            <h2 className="mb-4 text-lg font-semibold">Recent Activity</h2>
            <div className="overflow-hidden rounded-lg border">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium">
                      Property
                    </th>
                    <th className="px-4 py-3 text-left font-medium">
                      Decision
                    </th>
                    <th className="px-4 py-3 text-left font-medium">Status</th>
                    <th className="px-4 py-3 text-left font-medium">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {recentOrders.map((order) => {
                    const precheck = order.prechecks as any;
                    const address =
                      precheck?.properties?.formatted_address ?? '—';
                    const decision = precheck?.decision ?? '—';
                    const st = statusLabel[order.status] ?? {
                      text: order.status,
                      color: 'bg-gray-100 text-gray-600',
                    };
                    return (
                      <tr
                        key={order.id}
                        className="cursor-pointer hover:bg-muted/30"
                        onClick={() =>
                          router.push(`/home/reports?highlight=${order.id}`)
                        }
                      >
                        <td className="max-w-[240px] truncate px-4 py-3">
                          {address}
                        </td>
                        <td className="px-4 py-3 capitalize">
                          {decision.toLowerCase()}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${st.color}`}
                          >
                            {st.text}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {new Date(order.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && recentOrders.length === 0 && (
          <div className="mt-12 text-center">
            <p className="text-muted-foreground">
              No activity yet. Start by checking a property!
            </p>
            <Link
              href="/home/check"
              className="mt-4 inline-block rounded-lg bg-primary px-6 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
            >
              Check Eligibility
            </Link>
          </div>
        )}
      </PageBody>
    </>
  );
}
