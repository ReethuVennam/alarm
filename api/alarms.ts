import { VercelRequest, VercelResponse } from '@vercel/node';
import { insertAlarmSchema } from '../shared/schema';
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

  try {
    switch (req.method) {
      case 'GET':
        // For localStorage mode, return empty array
        // Client will handle data loading from localStorage
        return res.json([]);

      case 'POST':
        // Validate the alarm data
        const requestData = {
          ...req.body,
          triggerTime: req.body.triggerTime ? new Date(req.body.triggerTime) : undefined
        };
        
        const validatedData = insertAlarmSchema.parse(requestData);
        
        // Return the validated data with a generated ID
        // Client will handle actual storage in localStorage
        const mockAlarm = {
          ...validatedData,
          id: Date.now(), // Simple ID generation
          description: validatedData.description || null,
          repeatType: validatedData.repeatType || "none",
          repeatValue: validatedData.repeatValue || null,
          soundEnabled: validatedData.soundEnabled ?? true,
          isActive: validatedData.isActive ?? true,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        console.log('Mock alarm response:', mockAlarm);
        return res.status(201).json(mockAlarm);

      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
    }
  } catch (error) {
    // Generate request ID for tracking
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Log error with request context (sanitized)
    console.error(`[${requestId}] API Error:`, {
      method: req.method,
      url: req.url,
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