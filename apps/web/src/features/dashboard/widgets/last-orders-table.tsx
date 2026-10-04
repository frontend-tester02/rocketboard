import { Calendar } from 'lucide-react';
import { Card } from '@/components/common/card';
import { SelectChip } from '@/components/common/select-chip';
import { UserAvatar } from '@/components/common/user-avatar';
import { Badge } from '@/components/ui/badge';
import { lastOrders } from '@/features/dashboard/mock';

export function LastOrdersTable() {
  return (
    <Card
      title="Last Orders"
      action={<SelectChip label="19 Aug – 25 Aug" icon={Calendar} />}
      bodyClassName="-mx-2 overflow-x-auto"
    >
      <table className="w-full min-w-[460px] border-collapse text-sm">
        <thead>
          <tr className="text-left text-xs text-muted-foreground">
            <th className="px-2 pb-3 font-medium">Customer Name</th>
            <th className="px-2 pb-3 font-medium">Order No.</th>
            <th className="px-2 pb-3 font-medium">Amount</th>
            <th className="px-2 pb-3 font-medium">Payment Type</th>
            <th className="px-2 pb-3 font-medium">Date</th>
          </tr>
        </thead>
        <tbody>
          {lastOrders.map((order) => (
            <tr key={order.id} className="border-t border-border/60">
              <td className="px-2 py-3">
                <div className="flex items-center gap-2.5">
                  <UserAvatar name={order.customer} className="size-8" />
                  <span className="font-medium">{order.customer}</span>
                </div>
              </td>
              <td className="px-2 py-3 text-muted-foreground">{order.orderNo}</td>
              <td className="px-2 py-3 font-medium">{order.amount}</td>
              <td className="px-2 py-3">
                <Badge
                  variant={order.payment === 'Credit Card' ? 'secondary' : 'outline'}
                  className="font-medium"
                >
                  {order.payment}
                </Badge>
              </td>
              <td className="px-2 py-3 text-muted-foreground">{order.date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
