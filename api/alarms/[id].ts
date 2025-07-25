import { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../_lib/storage';
import { insertAlarmSchema } from '../../shared/schema';
import { z } from 'zod';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Security-hardened CORS configuration
  const allowedOrigins = [
    'https://smart-alarm-timer-1.vercel.app',
    'http://localhost:3000',
    'http://localhost:5000',
    'http://127.0.0.1:5000'
  ];
  
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin || '')) {
    res.setHeader('Access-Control-Allow-Origin', origin || '');
  }
  
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST,PUT,PATCH,DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  
  // Security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Environment validation
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL environment variable is missing');
    return res.status(500).json({ 
      message: "Server configuration error", 
      requestId: `env_${Date.now()}` 
    });
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
    // Generate request ID for tracking
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Log error with request context (sanitized)
    console.error(`[${requestId}] API Error:`, {
      method: req.method,
      url: req.url,
      alarmId,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: "Invalid request data", 
        requestId,
        errors: error.errors.map(e => ({
          field: e.path.join('.'),
          message: e.message
        }))
      });
    }
    
    // Don't expose internal error details in production
    return res.status(500).json({ 
      message: "An internal error occurred", 
      requestId 
    });
  }
}