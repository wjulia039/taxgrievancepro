'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { FileText, Download, RefreshCw, Clock, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useSupabase } from '@kit/supabase/hooks/use-supabase';
import { toast } from 'sonner';

interface OrderWithReport {
  id: string;
  status: string;
  created_at: string;
  precheck: {
    decision: string;
    property: {
      formatted_address: string;
    };
  };
  report: {
    id: string;
    pdf_url: string | null;
    attempt_count: number;
    last_error: string | null;
    generated_at: string | null;
  } | null;
}

export default function ReportsPage() {
  const supabase = useSupabase();
  const searchParams = useSearchParams();
  const highlightOrderId = searchParams.get('highlight');
  const [orders, setOrders] = useState<OrderWithReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [retrying, setRetrying] = useState<string | null>(null);
  const [downloading, setDownloading] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const getToken = useCallback(async (): Promise<string | null> => {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token ?? null;
  }, [supabase]);

  // Fetch all orders with their prechecks and reports
  const fetchOrders = useCallback(async () => {
    // Cast needed: database types not yet regenerated for custom tables
    const client = supabase as any;
    const { data, error } = await client
      .from('orders')
      .select(`
        id, status, created_at,
        prechecks!inner ( decision, properties!inner ( formatted_address ) ),
        reports ( id, pdf_url, attempt_count, last_error, generated_at )
      `)
      .order('created_at', { ascending: false }) as { data: any[] | null; error: any };

    if (error) {
      console.error('[reports] Fetch error:', error.message);
      return;
    }

    const mapped: OrderWithReport[] = (data ?? []).map((o: any) => ({
      id: o.id,
      status: o.status,
      created_at: o.created_at,
      precheck: {
        decision: o.prechecks.decision,
        property: {
          formatted_address: o.prechecks.properties.formatted_address,
        },
      },
      report: o.reports?.[0] ?? null,
    }));

    setOrders(mapped);
    setLoading(false);
  }, [supabase]);

  // Initial load
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // PRD §17: Poll every 2s while any order is PROCESSING
  useEffect(() => {
    const hasProcessing = orders.some((o) => o.status === 'PROCESSING' || o.status === 'PAID');

    if (hasProcessing) {
      pollRef.current = setInterval(async () => {
        await fetchOrders();
      }, 2000);
    } else {
      if (pollRef.current) clearInterval(pollRef.current);
    }

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [orders, fetchOrders]);

  // PRD §17: Toast when highlighted order completes
  useEffect(() => {
    if (!highlightOrderId) return;
    const order = orders.find((o) => o.id === highlightOrderId);
    if (order?.status === 'COMPLETED') {
      toast.success('Your report is ready.');
    }
  }, [orders, highlightOrderId]);

  // PRD §13: Manual retry
  const handleRetry = async (reportId: string) => {
    setRetrying(reportId);
    try {
      const token = await getToken();
      if (!token) return;

      const response = await fetch('/api/report/retry', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ report_id: reportId }),
      });

      if (response.ok) {
        toast.info('Retrying report generation...');
        await fetchOrders();
      } else {
        const data = await response.json();
        toast.error(data.error ?? 'Retry failed.');
      }
    } catch {
      toast.error('Network error.');
    } finally {
      setRetrying(null);
    }
  };

  // Download PDF via signed URL
  const handleDownload = async (reportId: string, pdfUrl: string) => {
    setDownloading(reportId);
    try {
      // pdfUrl is storage path like "reports/{id}.pdf"
      const { data, error } = await supabase.storage
        .from('reports')
        .createSignedUrl(pdfUrl.replace('reports/', ''), 60);

      if (error || !data?.signedUrl) {
        toast.error('Failed to generate download link.');
        return;
      }

      window.open(data.signedUrl, '_blank');
    } catch {
      toast.error('Download failed.');
    } finally {
      setDownloading(null);
    }
  };

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return iso;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Reports</h1>
          <p className="text-sm text-muted-foreground">View and download your tax grievance reports.</p>
        </div>
        <a
          href="/home/check"
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
        >
          New Check
        </a>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-lg border bg-card p-12 text-center">
          <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No reports yet</h3>
          <p className="mt-2 text-sm text-muted-foreground">Check your first property to get started.</p>
          <a
            href="/home/check"
            className="mt-4 inline-block rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
          >
            Check My Property
          </a>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const isHighlighted = order.id === highlightOrderId;

            return (
              <div
                key={order.id}
                className={`flex items-center justify-between rounded-lg border bg-card p-4 transition-colors ${
                  isHighlighted ? 'ring-2 ring-primary ring-offset-2' : ''
                }`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`rounded-full p-2 ${
                      order.precheck.decision === 'ELIGIBLE' ? 'bg-green-100' : 'bg-gray-100'
                    }`}
                  >
                    {order.precheck.decision === 'ELIGIBLE' ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-gray-500" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{order.precheck.property.formatted_address}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(order.created_at)} · {order.precheck.decision} · {order.status}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* COMPLETED: Download button */}
                  {order.status === 'COMPLETED' && order.report?.pdf_url && (
                    <button
                      onClick={() => handleDownload(order.report!.id, order.report!.pdf_url!)}
                      disabled={downloading === order.report.id}
                      className="flex items-center gap-1 rounded-md border px-3 py-1.5 text-sm hover:bg-gray-50 disabled:opacity-50"
                    >
                      {downloading === order.report.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Download className="h-4 w-4" />
                      )}
                      PDF
                    </button>
                  )}

                  {/* PROCESSING / PAID: Spinner */}
                  {(order.status === 'PROCESSING' || order.status === 'PAID') && (
                    <span className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" /> Generating...
                    </span>
                  )}

                  {/* FAILED: Retry button (PRD §13: up to 5 total attempts) */}
                  {order.status === 'FAILED' && order.report && order.report.attempt_count < 5 && (
                    <button
                      onClick={() => handleRetry(order.report!.id)}
                      disabled={retrying === order.report.id}
                      className="flex items-center gap-1 rounded-md border border-red-200 bg-red-50 px-3 py-1.5 text-sm text-red-600 hover:bg-red-100 disabled:opacity-50"
                    >
                      {retrying === order.report.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <RefreshCw className="h-4 w-4" />
                      )}
                      Retry
                    </button>
                  )}

                  {/* FAILED with max retries */}
                  {order.status === 'FAILED' && order.report && order.report.attempt_count >= 5 && (
                    <span className="text-xs text-red-500">Max retries reached</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* PRD §17: Processing info box */}
      {orders.some((o) => o.status === 'PROCESSING' || o.status === 'PAID') && (
        <div className="rounded-lg bg-blue-50 border border-blue-200 p-4 text-sm text-blue-800">
          <Clock className="inline h-4 w-4 mr-1" /> Generating your PDF report... Estimated time:
          typically 60–120 seconds.
        </div>
      )}

      {/* PRD §16, §19, §22: Compliance notices on report page (small print) */}
      {orders.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-[11px] text-muted-foreground space-y-0.5">
          <p>RP-524 filing is free through your local assessor or Board of Assessment Review (BAR). You are purchasing report preparation and analysis only.</p>
          <p>We are not affiliated with any government agency. You may be required to attend a hearing.</p>
          <p>This report is an estimate based on public/third-party data and does not guarantee a tax reduction.</p>
        </div>
      )}
    </div>
  );
}
