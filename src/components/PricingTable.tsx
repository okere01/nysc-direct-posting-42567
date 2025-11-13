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
  },
  {
    name: "Normal Relocation",
    lagosAbuja: "₦130,000",
    otherStates: "₦120,000",
    description: "This will be approved when the next batch stream is about leaving Camp"
  },
  {
    name: "Express Relocation",
    lagosAbuja: "₦230,000",
    otherStates: "₦210,000",
    description: "This usually takes 2-5 (working days)"
  }
];

export const PricingTable = () => {
  return (
    <Card className="w-full mx-auto shadow-xl border-border/50 bg-card/80 backdrop-blur-sm hover:shadow-2xl transition-shadow">
      <CardHeader className="space-y-2 pb-6">
        <CardTitle className="text-2xl md:text-3xl font-bold text-foreground">Service Pricing</CardTitle>
        <CardDescription className="text-sm md:text-base text-muted-foreground">
          Choose the service that best fits your needs
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto -mx-2 px-2">
          <table className="w-full border-collapse min-w-[600px]">
            <thead>
              <tr className="border-b-2 border-border">
                <th className="text-left py-4 px-3 md:px-4 font-semibold text-sm md:text-base text-foreground">Service Type</th>
                <th className="text-center py-4 px-3 md:px-4 font-semibold text-sm md:text-base text-foreground">Lagos/Abuja</th>
                <th className="text-center py-4 px-3 md:px-4 font-semibold text-sm md:text-base text-foreground">Other States</th>
                <th className="text-left py-4 px-3 md:px-4 font-semibold text-sm md:text-base text-foreground">Description</th>
              </tr>
            </thead>
            <tbody>
              {pricingData.map((service, index) => (
                <tr key={index} className="border-b border-border/40 hover:bg-primary/5 transition-colors group">
                  <td className="py-4 px-3 md:px-4 font-medium text-sm md:text-base text-foreground">
                    {service.name}
                    {service.note && (
                      <span className="block text-xs text-muted-foreground italic mt-1">
                        *{service.note}
                      </span>
                    )}
                  </td>
                  <td className="text-center py-4 px-3 md:px-4 text-sm md:text-base text-primary font-bold">
                    {service.lagosAbuja || service.price || "-"}
                  </td>
                  <td className="text-center py-4 px-3 md:px-4 text-sm md:text-base text-primary font-bold">
                    {service.otherStates || "-"}
                  </td>
                  <td className="py-4 px-3 md:px-4 text-xs md:text-sm text-muted-foreground">
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