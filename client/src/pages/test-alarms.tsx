import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TestAlarms() {
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [createResponse, setCreateResponse] = useState<any>(null);

  const testGetAlarms = async () => {
    try {
      const response = await fetch('/api/alarms');
      const data = await response.json();
      setApiResponse({ status: response.status, data });
    } catch (error) {
      setApiResponse({ error: error.message });
    }
  };

  const testCreateAlarm = async () => {
    try {
      const testAlarm = {
        title: "Test Alarm",
        description: "Created from test page",
        triggerTime: new Date(Date.now() + 60000), // 1 minute from now
        repeatType: "none",
        soundEnabled: true,
        isActive: true
      };
      
      const response = await fetch('/api/alarms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testAlarm)
      });
      
      const data = await response.json();
      setCreateResponse({ status: response.status, data });
      
      // Refresh the get alarms
      await testGetAlarms();
    } catch (error) {
      setCreateResponse({ error: error.message });
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">API Test Page</h1>
      
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Test API Endpoints</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Button onClick={testGetAlarms}>Test GET /api/alarms</Button>
              <Button onClick={testCreateAlarm} className="ml-2">Test CREATE Alarm</Button>
            </div>
            
            {apiResponse && (
              <div className="mt-4">
                <h3 className="font-semibold">GET Response:</h3>
                <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto">
                  {JSON.stringify(apiResponse, null, 2)}
                </pre>
              </div>
            )}
            
            {createResponse && (
              <div className="mt-4">
                <h3 className="font-semibold">CREATE Response:</h3>
                <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto">
                  {JSON.stringify(createResponse, null, 2)}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}