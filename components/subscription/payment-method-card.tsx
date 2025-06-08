"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CreditCard, Plus } from "lucide-react"
import type { Database } from "@/lib/supabase/database.types"

type PaymentMethod = Database["public"]["Tables"]["payment_methods"]["Row"]

interface PaymentMethodCardProps {
  paymentMethods: PaymentMethod[]
  onAddPaymentMethod: () => void
  onSetDefault: (id: string) => void
  onRemove: (id: string) => void
}

export function PaymentMethodCard({
  paymentMethods,
  onAddPaymentMethod,
  onSetDefault,
  onRemove,
}: PaymentMethodCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Payment Methods</span>
          <Button onClick={onAddPaymentMethod} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Payment Method
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {paymentMethods.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No payment methods added</p>
            <p className="text-sm">Add a payment method to manage your subscription</p>
          </div>
        ) : (
          paymentMethods.map((method) => (
            <div key={method.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <CreditCard className="h-5 w-5 text-gray-400" />
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">
                      {method.brand?.toUpperCase()} •••• {method.last4}
                    </span>
                    {method.is_default && <Badge variant="secondary">Default</Badge>}
                  </div>
                  <p className="text-sm text-gray-500">
                    Expires {method.exp_month}/{method.exp_year}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {!method.is_default && (
                  <Button variant="outline" size="sm" onClick={() => onSetDefault(method.id)}>
                    Set Default
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onRemove(method.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  Remove
                </Button>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
