import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { NeuralProcessor } from "./services/neural-processor";
import { insertSessionSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  const neuralProcessor = new NeuralProcessor();
  const activeClients = new Set<WebSocket>();
  
  // REST API Routes
  app.post('/api/sessions', async (req, res) => {
    try {
      const sessionData = insertSessionSchema.parse(req.body);
      const session = await storage.createSession(sessionData);
      res.json(session);
    } catch (error) {
      res.status(400).json({ error: 'Invalid session data' });
    }
  });

  app.get('/api/sessions/:id', async (req, res) => {
    try {
      const sessionId = parseInt(req.params.id);
      const session = await storage.getSession(sessionId);
      if (!session) {
        return res.status(404).json({ error: 'Session not found' });
      }
      res.json(session);
    } catch (error) {
      res.status(400).json({ error: 'Invalid session ID' });
    }
  });

  app.get('/api/sessions/:id/neural-signals', async (req, res) => {
    try {
      const sessionId = parseInt(req.params.id);
      const signals = await storage.getNeuralSignalsBySession(sessionId);
      res.json(signals);
    } catch (error) {
      res.status(400).json({ error: 'Invalid session ID' });
    }
  });

  app.get('/api/sessions/:id/cursor-positions', async (req, res) => {
    try {
      const sessionId = parseInt(req.params.id);
      const positions = await storage.getCursorPositionsBySession(sessionId);
      res.json(positions);
    } catch (error) {
      res.status(400).json({ error: 'Invalid session ID' });
    }
  });

  app.get('/api/sessions/:id/target-events', async (req, res) => {
    try {
      const sessionId = parseInt(req.params.id);
      const events = await storage.getTargetEventsBySession(sessionId);
      res.json(events);
    } catch (error) {
      res.status(400).json({ error: 'Invalid session ID' });
    }
  });

  app.post('/api/sessions/:id/update-settings', async (req, res) => {
    try {
      const { sensitivity, smoothing } = req.body;
      if (sensitivity !== undefined) {
        neuralProcessor.setSensitivity(sensitivity);
      }
      if (smoothing !== undefined) {
        neuralProcessor.setSmoothingFactor(smoothing);
      }
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: 'Invalid settings' });
    }
  });

  // WebSocket handling
  wss.on('connection', (ws) => {
    console.log('New WebSocket connection established');
    activeClients.add(ws);
    
    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message.toString());
        
        switch (data.type) {
          case 'start_session':
            // Handle session start
            ws.send(JSON.stringify({
              type: 'session_started',
              sessionId: data.sessionId || 1,
            }));
            break;
            
          case 'update_settings':
            neuralProcessor.setSensitivity(data.sensitivity || 1.0);
            neuralProcessor.setSmoothingFactor(data.smoothing || 5);
            break;
            
          case 'target_interaction':
            // Store target interaction event
            if (data.sessionId) {
              await storage.createTargetEvent({
                sessionId: data.sessionId,
                targetId: data.targetId,
                eventType: data.eventType,
                responseTime: data.responseTime,
                accuracy: data.accuracy,
              });
            }
            break;
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });
    
    ws.on('close', () => {
      activeClients.delete(ws);
      console.log('WebSocket connection closed');
    });
  });

  // Start neural signal processing loop
  const startNeuralProcessing = () => {
    const processData = async () => {
      try {
        // Generate neural data
        const neuralData = neuralProcessor.generateNeuralData();
        
        // Process cursor movement
        const cursorUpdate = neuralProcessor.processCursorMovement(neuralData);
        
        // Broadcast to all connected clients
        const message = JSON.stringify({
          type: 'neural_data',
          data: {
            neural: neuralData,
            cursor: cursorUpdate,
          },
        });
        
        activeClients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(message);
          }
        });
        
        // Store data in memory for analytics
        // Note: In production, you might want to throttle this to avoid memory issues
        
      } catch (error) {
        console.error('Neural processing error:', error);
      }
    };
    
    // Process at ~10Hz for smooth real-time updates
    setInterval(processData, 100);
  };
  
  startNeuralProcessing();

  return httpServer;
}
