import { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../server/storage';
import { insertAlarmSchema } from '../shared/schema';
import { z } from 'zod';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    switch (req.method) {
      case 'GET':
        if (req.query.id) {
          // Get specific alarm
          const id = parseInt(req.query.id as string);
          const alarm = await storage.getAlarmById(id);
          
          if (!alarm) {
            return res.status(404).json({ message: "Alarm not found" });
          }
          
          return res.json(alarm);
        } else {
          // Get all alarms
          const alarms = await storage.getAlarms();
          return res.json(alarms);
        }

      case 'POST':
        // Create new alarm
        const requestData = {
          ...req.body,
          triggerTime: req.body.triggerTime ? new Date(req.body.triggerTime) : undefined
        };
        
        const validatedData = insertAlarmSchema.parse(requestData);
        const alarm = await storage.createAlarm(validatedData);
        return res.status(201).json(alarm);

      case 'PATCH':
        // Update alarm - this should be handled by [id].ts for proper RESTful routing
        return res.status(405).json({ message: "Use PATCH /api/alarms/{id} for updates" });

      case 'DELETE':
        // Delete alarm - this should be handled by [id].ts for proper RESTful routing
        return res.status(405).json({ message: "Use DELETE /api/alarms/{id} for deletion" });

      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
    }
  } catch (error) {
    console.error('API Error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid data", errors: error.errors });
    }
    
    return res.status(500).json({ message: "Internal server error" });
  }
}