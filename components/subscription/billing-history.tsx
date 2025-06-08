"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Download, ExternalLink } from "lucide-react"
import { formatCurrency } from "@/lib/payment"
import type { Database } from "@/lib/supabase/database.types"

type Invoice = Database["public"]["Tables"]["invoices"]["Row"]

interface BillingHistoryProps {
  invoices: Invoice[]
}

export function BillingHistory({ invoices }: BillingHistoryProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800"
      case "open":
        return "bg-yellow-100 text-yellow-800"
      case "void":
      case "uncollectible":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Billing History</CardTitle>
      </CardHeader>
      <CardContent>
        {invoices.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No billing history available</p>
          </div>
        ) : (
          <div className="space-y-4">
            {invoices.map((invoice) => (
              <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <div>
                      <p className="font-medium">
                        Invoice #{invoice.invoice_number || invoice.stripe_invoice_id.slice(-8)}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatDate(invoice.created_at)}
                        {invoice.period_start && invoice.period_end && (
                          <span className="ml-2">
                            • {formatDate(invoice.period_start)} - {formatDate(invoice.period_end)}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="font-medium">{formatCurrency(invoice.amount_paid, invoice.currency)}</p>
                    <Badge className={getStatusColor(invoice.status)}>
                      {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                    </Badge>
                  </div>
                  <div className="flex space-x-2">
                    {invoice.invoice_pdf && (
                      <Button variant="outline" size="sm" onClick={() => window.open(invoice.invoice_pdf!, "_blank")}>
                        <Download className="h-4 w-4" />
                      </Button>
                    )}
                    {invoice.hosted_invoice_url && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(invoice.hosted_invoice_url!, "_blank")}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
