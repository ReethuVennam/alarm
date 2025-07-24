import { useEffect, useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, Smartphone, Globe, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export default function QRCode() {
  const [appUrl, setAppUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Get the current URL
    const url = window.location.origin;
    setAppUrl(url);
  }, []);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(appUrl);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "URL copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy URL",
        variant: "destructive",
      });
    }
  };

  // Generate QR code URL using qr-server.com API
  const qrCodeUrl = appUrl ? `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(appUrl)}` : "";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-4xl mx-auto">
        <Link href="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to App
          </Button>
        </Link>

        <div className="grid md:grid-cols-2 gap-6">
          {/* QR Code Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Smartphone className="w-5 h-5 mr-2" />
                QR Code Access
              </CardTitle>
              <CardDescription>
                Scan this QR code with your mobile device to open the app
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              {qrCodeUrl && (
                <div className="bg-white p-4 rounded-lg shadow-lg">
                  <img 
                    src={qrCodeUrl} 
                    alt="QR Code" 
                    className="w-[300px] h-[300px]"
                  />
                </div>
              )}
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-4 text-center">
                Open your phone's camera and point it at this QR code
              </p>
            </CardContent>
          </Card>

          {/* Instructions Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Globe className="w-5 h-5 mr-2" />
                Mobile Access Instructions
              </CardTitle>
              <CardDescription>
                Follow these steps to access the app on your mobile device
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Option 1: QR Code</h3>
                <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400">
                  <li>Open your phone's camera app</li>
                  <li>Point it at the QR code on the left</li>
                  <li>Tap the notification that appears</li>
                  <li>The app will open in your browser</li>
                </ol>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Option 2: Direct URL</h3>
                <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg flex items-center justify-between">
                  <code className="text-sm break-all">{appUrl}</code>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={copyToClipboard}
                    className="ml-2"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  Copy and paste this URL into your mobile browser
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Mobile Features</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400">
                  <li>Voice recognition for natural language input</li>
                  <li>Push notifications for alarms</li>
                  <li>Responsive design optimized for mobile</li>
                  <li>Works offline once loaded</li>
                </ul>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  <strong>Tip:</strong> For the best experience, add this app to your home screen. 
                  In your mobile browser, tap the share button and select "Add to Home Screen".
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}