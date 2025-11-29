import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, BookOpen, Video, FileQuestion } from "lucide-react";

export default function HelpCenter() {
  const [searchTerm, setSearchTerm] = useState("");

  const faqs = [
    {
      category: "Getting Started",
      items: [
        {
          question: "How do I submit my NYSC application?",
          answer: "To submit your NYSC application, log in to your account, navigate to the 'New Submission' page, fill in all required information including your call-up number, course, state preferences, and upload your payment proof. Click 'Submit Application' when done."
        },
        {
          question: "What payment methods are accepted?",
          answer: "We accept bank transfers and online payments. After making payment, upload your payment proof (receipt or screenshot) in the submission form for verification by our admin team."
        },
        {
          question: "How long does payment verification take?",
          answer: "Payment verification typically takes 24-48 hours. You'll receive a notification once your payment has been verified. You can check the status anytime in your dashboard."
        }
      ]
    },
    {
      category: "Account & Profile",
      items: [
        {
          question: "How do I update my profile information?",
          answer: "Navigate to the Dashboard and look for profile settings. You can update your name, email, and other personal information there. Some changes may require re-verification."
        },
        {
          question: "I forgot my password. How do I reset it?",
          answer: "Click on 'Forgot Password' on the login page. Enter your email address, and we'll send you a password reset link. Follow the instructions in the email to create a new password."
        },
        {
          question: "Can I change my email address?",
          answer: "Yes, you can update your email in your profile settings. You'll need to verify the new email address before it takes effect."
        }
      ]
    },
    {
      category: "Submissions & Status",
      items: [
        {
          question: "How do I track my submission status?",
          answer: "Log in to your dashboard to see all your submissions and their current status. You'll see labels like 'Pending', 'Approved', or 'Rejected' along with any admin remarks."
        },
        {
          question: "What does 'Pending' status mean?",
          answer: "'Pending' means your submission is under review by our admin team. This includes verification of your payment and validation of submitted information."
        },
        {
          question: "Can I edit my submission after submitting?",
          answer: "Once submitted, you cannot directly edit your application. If you need to make changes, contact support through the Support page with your submission details."
        }
      ]
    },
    {
      category: "Notifications & Alerts",
      items: [
        {
          question: "How do I enable browser notifications?",
          answer: "When you visit the dashboard, you'll be prompted to allow notifications. Click 'Allow' in your browser. You can also enable them later in your browser settings or through the notification preferences page."
        },
        {
          question: "Can I customize what notifications I receive?",
          answer: "Yes! Visit the Notification Preferences page from your dashboard to customize which types of notifications you want to receive via email, browser push, or in-app alerts."
        },
        {
          question: "I'm not receiving notifications. What should I do?",
          answer: "Check your notification preferences and ensure notifications are enabled. Also verify that your browser allows notifications for this site. Check your email spam folder for email notifications."
        }
      ]
    }
  ];

  const tutorials = [
    {
      title: "Quick Start Guide",
      description: "Learn the basics of using the NYSC Management Portal",
      duration: "5 min read"
    },
    {
      title: "Submitting Your First Application",
      description: "Step-by-step guide to completing your NYSC submission",
      duration: "8 min read"
    },
    {
      title: "Understanding Payment Verification",
      description: "What happens after you upload your payment proof",
      duration: "4 min read"
    },
    {
      title: "Managing Notifications",
      description: "Customize your notification preferences",
      duration: "3 min read"
    }
  ];

  const filteredFaqs = faqs.map(category => ({
    ...category,
    items: category.items.filter(
      item =>
        item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.answer.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.items.length > 0);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4 max-w-5xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Help Center</h1>
          <p className="text-muted-foreground text-lg">
            Find answers to common questions and learn how to use the portal
          </p>
        </div>

        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search for help..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="faq" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="faq">
              <FileQuestion className="h-4 w-4 mr-2" />
              FAQs
            </TabsTrigger>
            <TabsTrigger value="guides">
              <BookOpen className="h-4 w-4 mr-2" />
              Guides
            </TabsTrigger>
          </TabsList>

          <TabsContent value="faq" className="space-y-6">
            {filteredFaqs.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  No results found for "{searchTerm}"
                </CardContent>
              </Card>
            ) : (
              filteredFaqs.map((category, idx) => (
                <Card key={idx}>
                  <CardHeader>
                    <CardTitle>{category.category}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                      {category.items.map((item, itemIdx) => (
                        <AccordionItem key={itemIdx} value={`item-${idx}-${itemIdx}`}>
                          <AccordionTrigger className="text-left">
                            {item.question}
                          </AccordionTrigger>
                          <AccordionContent className="text-muted-foreground">
                            {item.answer}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="guides" className="space-y-4">
            {tutorials.map((tutorial, idx) => (
              <Card key={idx} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl">{tutorial.title}</CardTitle>
                      <CardDescription className="mt-2">{tutorial.description}</CardDescription>
                    </div>
                    <BookOpen className="h-6 w-6 text-primary flex-shrink-0" />
                  </div>
                </CardHeader>
                <CardContent>
                  <span className="text-sm text-muted-foreground">{tutorial.duration}</span>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>

        <Card className="mt-8 bg-primary/5">
          <CardContent className="py-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Still need help?</h3>
              <p className="text-muted-foreground mb-4">
                Can't find what you're looking for? Our AI assistant is here to help!
              </p>
              <p className="text-sm text-muted-foreground">
                Click the chat button in the bottom right corner to get instant assistance.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
