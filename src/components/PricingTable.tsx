import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const pricingData = [
  {
    name: "Link One",
    lagosAbuja: "₦130,000",
    otherStates: "₦120,000",
    description: "Standard direct posting service"
  },
  {
    name: "Link Two",
    lagosAbuja: "₦100,000",
    otherStates: "₦90,000",
    description: "Alternative posting option"
  },
  {
    name: "Medical",
    price: "₦240,000",
    description: "Medical personnel posting"
  },
  {
    name: "Origin",
    price: "₦250,000",
    description: "State of origin posting",
    note: "Terms and conditions apply"
  }
];

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
                    {service.note && (
                      <span className="block text-xs text-muted-foreground italic mt-1">
                        *{service.note}
                      </span>
                    )}
                  </td>
                  <td className="text-center py-4 px-4 text-foreground font-semibold">
                    {service.lagosAbuja || service.price || "-"}
                  </td>
                  <td className="text-center py-4 px-4 text-foreground font-semibold">
                    {service.otherStates || "-"}
                  </td>
                  <td className="py-4 px-4 text-sm text-muted-foreground">
                    {service.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};