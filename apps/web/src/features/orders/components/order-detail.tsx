'use client';

import { OrderStatus, type OrderDto } from '@rocket/shared';
import { Download, Loader2, Package, Printer } from 'lucide-react';
import { useState } from 'react';
import { UserAvatar } from '@/components/common/user-avatar';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { invoiceUrl } from '@/features/orders/api';
import { useOrder, useUpdateOrderStatus } from '@/features/orders/hooks';
import { OrderStatusBadge, paymentLabels } from '@/features/orders/order-meta';
import { cn, formatCurrency, formatDate } from '@/lib/utils';

const TABS = ['Order Details', 'Products', 'Invoice'] as const;
type Tab = (typeof TABS)[number];

const statusOptions = Object.values(OrderStatus);

export function OrderDetail({ id }: { id: string }) {
  const { data: order, isLoading, isError } = useOrder(id);
  const updateStatus = useUpdateOrderStatus();
  const [tab, setTab] = useState<Tab>('Order Details');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        <Loader2 className="size-6 animate-spin" />
      </div>
    );
  }
  if (isError || !order) {
    return (
      <div className="py-20 text-center text-sm text-danger">Order not found.</div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold tracking-tight">{order.orderNo}</h2>
          <OrderStatusBadge status={order.status} />
        </div>
        {order.createdAt && (
          <p className="text-sm text-muted-foreground">
            {formatDate(order.createdAt, {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              '-mb-px border-b-2 px-4 py-2.5 text-sm font-medium transition-colors',
              tab === t
                ? 'border-primary text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground',
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'Order Details' ? (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          {/* Left: customer, address, payment */}
          <div className="flex flex-col gap-5 lg:col-span-2">
            <Section title="Customer">
              <div className="flex items-center gap-3">
                <UserAvatar name={order.customerName} className="size-10" />
                <div>
                  <p className="text-sm font-medium">{order.customerName}</p>
                  <p className="text-xs text-muted-foreground">Customer</p>
                </div>
              </div>
            </Section>

            <Section title="Shipping Address">
              <p className="text-sm text-muted-foreground">
                Linked to the customer record (arrives with the Customers module).
              </p>
            </Section>

            <Section title="Payment">
              <div className="flex flex-col gap-2 text-sm">
                <Row label="Method" value={paymentLabels[order.paymentType]} />
                <Row label="Subtotal" value={formatCurrency(order.subtotal)} />
                <Row label="Tax" value={formatCurrency(order.tax)} />
                <div className="mt-1 flex items-center justify-between border-t border-border/60 pt-2 font-semibold">
                  <span>Total</span>
                  <span>{formatCurrency(order.total)}</span>
                </div>
              </div>
            </Section>
          </div>

          {/* Right: status + history */}
          <div className="flex flex-col gap-5">
            <Section title="Status">
              <Select
                value={order.status}
                onValueChange={(v) =>
                  updateStatus.mutate({ id: order.id, input: { status: v as OrderStatus } })
                }
                disabled={updateStatus.isPending}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((s) => (
                    <SelectItem key={s} value={s} className="capitalize">
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Section>

            <Section title="History">
              <ol className="flex flex-col gap-4">
                {order.history.map((entry, i) => (
                  <li key={i} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <span className="mt-1 size-2.5 rounded-full bg-primary" />
                      {i < order.history.length - 1 && (
                        <span className="w-px flex-1 bg-border" />
                      )}
                    </div>
                    <div className="pb-1">
                      <p className="text-sm font-medium capitalize">{entry.status}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(entry.at, {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                      {entry.note && (
                        <p className="mt-0.5 text-xs text-muted-foreground">{entry.note}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            </Section>
          </div>
        </div>
      ) : tab === 'Products' ? (
        <div className="flex flex-col gap-4">
          <div className="overflow-hidden rounded-xl border border-border/60">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/60 bg-muted/40 text-left text-xs text-muted-foreground">
                  <th className="px-4 py-2.5 font-medium">Product</th>
                  <th className="px-4 py-2.5 text-right font-medium">Price</th>
                  <th className="px-4 py-2.5 text-center font-medium">Qty</th>
                  <th className="px-4 py-2.5 text-right font-medium">Total</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item, i) => (
                  <tr key={i} className="border-b border-border/60 last:border-0">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                          <Package className="size-5" />
                        </span>
                        <span className="font-medium">{item.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right text-muted-foreground">
                      {formatCurrency(item.price)}
                    </td>
                    <td className="px-4 py-3 text-center text-muted-foreground">
                      ×{item.qty}
                    </td>
                    <td className="px-4 py-3 text-right font-medium">
                      {formatCurrency(item.price * item.qty)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="ml-auto flex w-full max-w-xs flex-col gap-2 text-sm">
            <Row label="Subtotal" value={formatCurrency(order.subtotal)} />
            <Row label="Tax" value={formatCurrency(order.tax)} />
            <div className="mt-1 flex items-center justify-between border-t border-border/60 pt-2 text-base font-semibold">
              <span>Total</span>
              <span>{formatCurrency(order.total)}</span>
            </div>
          </div>
        </div>
      ) : (
        <InvoicePanel order={order} />
      )}
    </div>
  );
}

function InvoicePanel({ order }: { order: OrderDto }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-end gap-2">
        <Button variant="outline" size="sm" className="gap-1.5" onClick={() => window.print()}>
          <Printer className="size-4" />
          Print
        </Button>
        <Button
          size="sm"
          className="gap-1.5"
          onClick={() => window.open(invoiceUrl(order.id), '_blank')}
        >
          <Download className="size-4" />
          Download PDF
        </Button>
      </div>

      {/* Invoice preview */}
      <div className="rounded-xl border border-border/60 bg-card p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-lg font-semibold text-primary">Rocket Inc.</p>
            <p className="text-xs text-muted-foreground">
              123 Market Street, San Francisco, CA
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-semibold tracking-tight">INVOICE</p>
            <p className="text-xs text-muted-foreground">{order.orderNo}</p>
            {order.createdAt && (
              <p className="text-xs text-muted-foreground">
                {formatDate(order.createdAt)}
              </p>
            )}
          </div>
        </div>

        <div className="mt-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Bill To
          </p>
          <p className="mt-1 text-sm font-medium">{order.customerName}</p>
          <p className="text-xs text-muted-foreground">
            {paymentLabels[order.paymentType]}
          </p>
        </div>

        <table className="mt-6 w-full text-sm">
          <thead>
            <tr className="border-b border-border/60 text-left text-xs text-muted-foreground">
              <th className="py-2 font-medium">Product</th>
              <th className="py-2 text-right font-medium">Price</th>
              <th className="py-2 text-center font-medium">Qty</th>
              <th className="py-2 text-right font-medium">Total</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item, i) => (
              <tr key={i} className="border-b border-border/60 last:border-0">
                <td className="py-2.5">{item.name}</td>
                <td className="py-2.5 text-right text-muted-foreground">
                  {formatCurrency(item.price)}
                </td>
                <td className="py-2.5 text-center text-muted-foreground">
                  {item.qty}
                </td>
                <td className="py-2.5 text-right font-medium">
                  {formatCurrency(item.price * item.qty)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="ml-auto mt-4 flex w-full max-w-xs flex-col gap-2 text-sm">
          <Row label="Subtotal" value={formatCurrency(order.subtotal)} />
          <Row label="Tax" value={formatCurrency(order.tax)} />
          <div className="mt-1 flex items-center justify-between border-t border-border/60 pt-2 text-base font-semibold">
            <span>Total</span>
            <span className="text-primary">{formatCurrency(order.total)}</span>
          </div>
        </div>

        <p className="mt-8 text-center text-xs text-muted-foreground">
          Thank you for your business.
        </p>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border/60 bg-card p-4">
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </h3>
      {children}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
