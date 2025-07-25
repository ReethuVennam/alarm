import { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../../server/storage';
import { insertAlarmSchema } from '../../shared/schema';
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

  const { id } = req.query;
  const alarmId = parseInt(id as string);

  if (isNaN(alarmId)) {
    return res.status(400).json({ message: "Invalid alarm ID" });
  }

  try {
    switch (req.method) {
      case 'GET':
        // Get specific alarm
        const alarm = await storage.getAlarmById(alarmId);
        
        if (!alarm) {
          return res.status(404).json({ message: "Alarm not found" });
        }
        
        return res.json(alarm);

      case 'PATCH':
        // Update alarm
        const updateData = {
          ...req.body,
          triggerTime: req.body.triggerTime ? new Date(req.body.triggerTime) : undefined
        };
        
        const validatedUpdateData = insertAlarmSchema.partial().parse(updateData);
        const updatedAlarm = await storage.updateAlarm(alarmId, validatedUpdateData);
        
        if (!updatedAlarm) {
          return res.status(404).json({ message: "Alarm not found" });
        }
        
        return res.json(updatedAlarm);

      case 'DELETE':
        // Delete alarm
        const success = await storage.deleteAlarm(alarmId);
        
        if (!success) {
          return res.status(404).json({ message: "Alarm not found" });
        }
        
        return res.status(204).end();

      default:
        res.setHeader('Allow', ['GET', 'PATCH', 'DELETE']);
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