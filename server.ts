import express from 'express';
import http from 'http';
import path from 'path';
import { WebSocketServer, WebSocket } from 'ws';
import { demoTripTemplate } from './src/initialData';
import { Trip } from './src/types';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '20mb' }));

// In-memory store
const tripsStore = new Map<string, Trip>();
if (demoTripTemplate) {
  tripsStore.set(demoTripTemplate.id, demoTripTemplate);
  if (demoTripTemplate.inviteCode) {
    tripsStore.set(demoTripTemplate.inviteCode.toUpperCase(), demoTripTemplate);
  }
}

// REST API Endpoints
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Private trip access by specific ID or Invite Code only (No public directory)
app.get('/api/trips/:id', (req, res) => {
  const idOrCode = req.params.id;
  const trip =
    tripsStore.get(idOrCode) ||
    tripsStore.get(idOrCode.toUpperCase()) ||
    Array.from(tripsStore.values()).find(
      t => t.id === idOrCode || (t.inviteCode && t.inviteCode.toUpperCase() === idOrCode.toUpperCase())
    );

  if (!trip) {
    res.status(404).json({ error: 'Trip not found or invalid code' });
    return;
  }
  res.json(trip);
});

app.post('/api/trips', (req, res) => {
  const tripData: Trip = req.body;
  if (!tripData.id) {
    tripData.id = 'trip-' + Date.now().toString(36);
  }
  if (!tripData.inviteCode) {
    tripData.inviteCode = 'TRIP-' + Math.floor(1000 + Math.random() * 9000);
  }
  tripData.lastSyncedAt = new Date().toISOString();

  tripsStore.set(tripData.id, tripData);
  tripsStore.set(tripData.inviteCode.toUpperCase(), tripData);

  broadcastToRoom(tripData.id, {
    type: 'trip:updated',
    trip: tripData,
    senderId: req.headers['x-partner-id'] || 'system',
  });

  res.json(tripData);
});

app.put('/api/trips/:id', (req, res) => {
  const tripId = req.params.id;
  const updatedTrip: Trip = req.body;
  updatedTrip.lastSyncedAt = new Date().toISOString();

  tripsStore.set(tripId, updatedTrip);
  if (updatedTrip.inviteCode) {
    tripsStore.set(updatedTrip.inviteCode.toUpperCase(), updatedTrip);
  }

  broadcastToRoom(tripId, {
    type: 'trip:updated',
    trip: updatedTrip,
    senderId: req.headers['x-partner-id'] || 'system',
  });

  res.json(updatedTrip);
});

// Create HTTP server
const server = http.createServer(app);

// WebSocket real-time synchronization
const wss = new WebSocketServer({ server, path: '/ws' });

interface ClientInfo {
  ws: WebSocket;
  tripId: string;
  partnerId: string;
  name: string;
}

const clients = new Set<ClientInfo>();

function broadcastToRoom(tripId: string, payload: unknown, excludeWs?: WebSocket) {
  const data = JSON.stringify(payload);
  clients.forEach(client => {
    if (client.tripId === tripId && client.ws.readyState === WebSocket.OPEN) {
      if (!excludeWs || client.ws !== excludeWs) {
        client.ws.send(data);
      }
    }
  });
}

function broadcastPresence(tripId: string) {
  const activePartners = Array.from(clients)
    .filter(c => c.tripId === tripId && c.ws.readyState === WebSocket.OPEN)
    .map(c => ({ partnerId: c.partnerId, name: c.name }));

  broadcastToRoom(tripId, {
    type: 'presence:update',
    activePartners,
  });
}

wss.on('connection', (ws, req) => {
  const url = new URL(req.url || '', `http://${req.headers.host}`);
  const tripId = url.searchParams.get('tripId') || demoTripTemplate.id;
  const partnerId = url.searchParams.get('partnerId') || 'p1';
  const name = url.searchParams.get('name') || 'Viajero';

  const clientInfo: ClientInfo = { ws, tripId, partnerId, name };
  clients.add(clientInfo);

  // Send current trip state on join
  const currentTrip =
    tripsStore.get(tripId) ||
    tripsStore.get(tripId.toUpperCase()) ||
    demoTripTemplate;

  ws.send(
    JSON.stringify({
      type: 'init:state',
      trip: currentTrip,
    })
  );

  broadcastPresence(tripId);

  ws.on('message', message => {
    try {
      const parsed = JSON.parse(message.toString());

      if (parsed.type === 'sync:trip') {
        const trip: Trip = parsed.trip;
        trip.lastSyncedAt = new Date().toISOString();
        tripsStore.set(trip.id, trip);
        if (trip.inviteCode) {
          tripsStore.set(trip.inviteCode.toUpperCase(), trip);
        }
        broadcastToRoom(
          trip.id,
          {
            type: 'trip:updated',
            trip,
            senderId: parsed.partnerId || partnerId,
          },
          ws
        );
      } else if (parsed.type === 'ping') {
        ws.send(JSON.stringify({ type: 'pong', time: Date.now() }));
      } else if (parsed.type === 'join:room') {
        clientInfo.tripId = parsed.tripId;
        clientInfo.partnerId = parsed.partnerId || 'p1';
        clientInfo.name = parsed.name || 'Viajero';
        broadcastPresence(parsed.tripId);
      }
    } catch (err) {
      console.error('Error parsing WS message:', err);
    }
  });

  ws.on('close', () => {
    clients.delete(clientInfo);
    broadcastPresence(tripId);
  });

  ws.on('error', err => {
    console.error('WS Error:', err);
    clients.delete(clientInfo);
  });
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Parejas en Ruta server running on http://localhost:${PORT}`);
  });
}

startServer();
