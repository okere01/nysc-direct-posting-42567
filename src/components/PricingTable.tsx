import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const pricingData = [
  {
    name: "Normal Relocate",
    lagosAbuja: "₦130,000",
    otherStates: "₦120,000",
    description: "This will be approved when the next batch stream is about leaving Camp"
  },
  {
    name: "Express Relocate",
    lagosAbuja: "₦230,000",
    otherStates: "₦210,000",
    description: "This usually takes 2-5 (working days)"
  }
];

const paymentDetails = {
  accountNumber: "6111931518",
  bank: "Opay",
  accountName: "Olusegun Raphael"
};

export const PricingTable = () => {
  return (
    <Card className="w-full max-w-4xl mx-auto mb-8 shadow-lg border-border">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-foreground">Service Pricing</CardTitle>
        <CardDescription className="text-muted-foreground">
          Choose the service that best fits your needs
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-4 px-4 font-semibold text-foreground">Service Type</th>
                <th className="text-center py-4 px-4 font-semibold text-foreground">Lagos/Abuja</th>
                <th className="text-center py-4 px-4 font-semibold text-foreground">Other States</th>
                <th className="text-left py-4 px-4 font-semibold text-foreground">Description</th>
              </tr>
            </thead>
            <tbody>
              {pricingData.map((service, index) => (
                <tr key={index} className="border-b border-border/50 hover:bg-muted/50 transition-colors">
                  <td className="py-4 px-4 font-medium text-foreground">
                    {service.name}
                  </td>
                  <td className="text-center py-4 px-4 text-foreground font-semibold">
                    {service.lagosAbuja}
                  </td>
                  <td className="text-center py-4 px-4 text-foreground font-semibold">
                    {service.otherStates}
                  </td>
                  <td className="py-4 px-4 text-sm text-muted-foreground">
                    {service.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="mt-6 p-4 bg-muted/50 rounded-lg border border-border">
          <h3 className="font-semibold text-foreground mb-2">Payment Details</h3>
          <div className="space-y-1 text-sm">
            <p className="text-muted-foreground">
              <span className="font-medium text-foreground">Account Number:</span> {paymentDetails.accountNumber}
            </p>
            <p className="text-muted-foreground">
              <span className="font-medium text-foreground">Bank:</span> {paymentDetails.bank}
            </p>
            <p className="text-muted-foreground">
              <span className="font-medium text-foreground">Account Name:</span> {paymentDetails.accountName}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};