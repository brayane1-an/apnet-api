
import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import axios from 'axios';
import crypto from 'crypto';
import admin from 'firebase-admin';
import { rateLimit } from 'express-rate-limit';
import firebaseConfig from './firebase-applet-config.json' assert { type: 'json' };

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: firebaseConfig.projectId,
  });
}
const db = admin.firestore();
if (firebaseConfig.firestoreDatabaseId) {
  // @ts-ignore - databaseId is supported in newer versions of firebase-admin
  db.settings({ databaseId: firebaseConfig.firestoreDatabaseId });
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // --- CYBERSECURITY: RATE LIMITING CONFIG ---
  
  // Global Limiter: 100 requests per 15 minutes for general consultation
  const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 100,
    standardHeaders: 'draft-7', // Use standard headers
    legacyHeaders: false, // Disable X-RateLimit-* headers
    message: {
      status: 429,
      error: 'Trop de requêtes détectées. Pour la sécurité d\'APNET, veuillez réessayer dans 15 minutes.'
    }
  });

  // Strict Limiter: 5 attempts per 15 minutes for sensitive routes (Auth, Payment)
  const strictLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 5,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: {
      status: 429,
      error: 'Trop de requêtes détectées. Pour la sécurité d\'APNET, veuillez réessayer dans 15 minutes.'
    }
  });

  // Apply global limiter to all API routes by default
  app.use('/api/', globalLimiter);

  // Apply strict limiter to sensitive routes
  app.use(['/api/login', '/api/register', '/api/payments/init', '/api/payments/payout', '/api/landlords/register'], strictLimiter);

  // --- CINETPAY CONFIG (SANDBOX MODE) ---
  const CINETPAY_SITE_ID = process.env.CINETPAY_SITE_ID || '443750';
  const CINETPAY_API_KEY = process.env.CINETPAY_API_KEY || '462758687627506324d5460.43739216';
  const CINETPAY_SECRET_KEY = process.env.CINETPAY_SECRET_KEY || 'YOUR_SECRET_KEY';
  const APP_URL = process.env.APP_URL || 'http://localhost:3000';

  // --- API ROUTES ---

  /**
   * INITIALIZE PAYMENT
   * Called by frontend when user clicks "Pay"
   */
  app.post('/api/payments/init', async (req, res) => {
    try {
      const { amount, currency, description, customer_name, customer_surname, customer_email, customer_phone_number, transaction_id, userId, providerId, isSimulation } = req.body;

      const transId = transaction_id || `APNET_${Date.now()}`;

      // 1. Create a pending transaction in Firestore
      await db.collection('transactions').doc(transId).set({
        clientId: userId,
        prestataireId: providerId,
        amount: amount,
        currency: currency || 'XOF',
        status: 'PENDING',
        description: description || 'Paiement de service APNET',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        method: 'MOBILE_MONEY',
        isSimulation: !!isSimulation
      });

      // If simulation, we don't call CinetPay, we just return a fake success
      if (isSimulation) {
        // Simulate a delayed webhook call
        setTimeout(async () => {
          console.log(`[SIMULATION] Automatically confirming transaction ${transId}`);
          await db.collection('transactions').doc(transId).update({
            status: 'PAID',
            paidAt: admin.firestore.FieldValue.serverTimestamp(),
            cinetpay_data: { status: 'ACCEPTED', amount: amount, currency: currency || 'XOF', simulation: true }
          });
        }, 2000);

        return res.json({
          success: true,
          payment_url: '#simulation',
          payment_token: 'sim_token_' + Date.now(),
          isSimulation: true
        });
      }

      const payload = {
        apikey: CINETPAY_API_KEY,
        site_id: CINETPAY_SITE_ID,
        transaction_id: transId,
        amount: amount,
        currency: currency || 'XOF',
        description: description || 'Paiement de service APNET',
        notify_url: `${APP_URL}/api/payments/webhook`,
        return_url: `${APP_URL}/payment-success`,
        channels: 'ALL',
        customer_name: customer_name || 'Client',
        customer_surname: customer_surname || 'APNET',
        customer_email: customer_email || 'client@apnet.ci',
        customer_phone_number: customer_phone_number || '',
      };

      const response = await axios.post('https://api-checkout.cinetpay.com/api/v2/payment', payload);
      
      if (response.data.code === '201') {
        res.json({
          success: true,
          payment_url: response.data.data.payment_url,
          payment_token: response.data.data.payment_token
        });
      } else {
        res.status(400).json({ success: false, message: response.data.message });
      }
    } catch (error: any) {
      console.error('CinetPay Init Error:', error.response?.data || error.message);
      res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
  });

  /**
   * LANDLORD REGISTRATION (Sourcetable Integration)
   */
  app.post('/api/landlords/register', async (req, res) => {
    try {
      const { name, phone, location } = req.body;
      
      // Save in Firestore
      await db.collection('landlords').add({
        name,
        phone,
        location,
        status: 'PENDING',
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });

      // Simulation of Sourcetable API call
      console.log(`[SOURCETABLE] Saving landlord: ${name} (${phone}) at ${location}`);
      
      res.json({ success: true, message: 'Candidature enregistrée avec succès. Notre équipe vous contactera.' });
    } catch (error: any) {
      console.error('Landlord Registration Error:', error);
      res.status(500).json({ success: false, error: 'Une erreur est survenue lors de l\'enregistrement.' });
    }
  });

  /**
   * WEBHOOK (NOTIFICATION URL)
   * Called by CinetPay when payment status changes
   */
  app.post('/api/payments/webhook', async (req, res) => {
    try {
      const { cpm_site_id, cpm_trans_id, cpm_trans_status, cpm_payment_config } = req.body;

      console.log(`Webhook received for transaction ${cpm_trans_id}: ${cpm_trans_status}`);

      // 1. Verify the transaction status with CinetPay API
      const verifyPayload = {
        apikey: CINETPAY_API_KEY,
        site_id: CINETPAY_SITE_ID,
        transaction_id: cpm_trans_id
      };

      const verifyResponse = await axios.post('https://api-checkout.cinetpay.com/api/v2/payment/check', verifyPayload);
      const data = verifyResponse.data;

      if (data.code === '00' && data.data.status === 'ACCEPTED') {
        // PAYMENT SUCCESSFUL
        console.log(`Payment confirmed for ${cpm_trans_id}`);
        
        // 2. Update Firestore to mark transaction as PAID
        await db.collection('transactions').doc(cpm_trans_id).update({
          status: 'PAID',
          paidAt: admin.firestore.FieldValue.serverTimestamp(),
          cinetpay_data: data.data
        });
        
        return res.status(200).send('OK');
      }

      res.status(200).send('Payment not accepted yet');
    } catch (error: any) {
      console.error('Webhook Error:', error.message);
      res.status(500).send('Error');
    }
  });

  /**
   * PAYOUT (TRANSFER)
   * Triggered when a service is validated by the client
   */
  app.post('/api/payments/payout', async (req, res) => {
    try {
      const { amount, prefix, phone, notify_url, client_transaction_id } = req.body;

      // CinetPay Transfer API requires a specific token
      // First, get the transfer token
      const tokenResponse = await axios.post('https://api-checkout.cinetpay.com/api/v1/transfer/spec/get/token', {
        apikey: CINETPAY_API_KEY,
        password: 'YOUR_TRANSFER_PASSWORD' // This is usually a separate password set in CinetPay dashboard
      });

      if (tokenResponse.data.code !== '00') {
        return res.status(400).json({ success: false, message: 'Could not get transfer token' });
      }

      const token = tokenResponse.data.data.token;

      // Execute transfer
      const transferPayload = {
        token: token,
        data: [{
          amount: amount,
          prefix: prefix || '225',
          phone: phone,
          notify_url: notify_url || `${APP_URL}/api/payments/payout-webhook`,
          client_transaction_id: client_transaction_id || `PAYOUT_${Date.now()}`
        }]
      };

      const transferResponse = await axios.post('https://api-checkout.cinetpay.com/api/v1/transfer/money', transferPayload);

      res.json({
        success: transferResponse.data.code === '00',
        data: transferResponse.data
      });
    } catch (error: any) {
      console.error('Payout Error:', error.response?.data || error.message);
      res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
  });

  /**
   * SOURCETABLE API ENDPOINT
   * Returns providers and revenue data for dashboarding
   */
  app.get('/api/sourcetable/data', async (req, res) => {
    const apiKey = req.headers['x-api-key'];
    const EXPECTED_API_KEY = process.env.SOURCETABLE_API_KEY || 'apnet_sec_9823_dash_771';

    if (!apiKey || apiKey !== EXPECTED_API_KEY) {
      return res.status(401).json({ error: 'Unauthorized: Invalid or missing API Key' });
    }

    try {
      // STATIC TEST DATA FOR DASHBOARDING
      const testProviders = [
        { name: "Samba Diallo", email: "samba@example.com", job: "Plombier", verified: true, balance: 45000 },
        { name: "Awa Koné", email: "awa@example.com", job: "Électricienne", verified: true, balance: 120000 },
        { name: "Koffi Yao", email: "koffi@example.com", job: "Menuisier", verified: false, balance: 0 },
        { name: "Fatou Traoré", email: "fatou@example.com", job: "Peintre", verified: true, balance: 75200 },
        { name: "Moussa Diakité", email: "moussa@example.com", job: "Ménage", verified: true, balance: 30000 }
      ];

      const testTransactions = [
        { date: new Date().toISOString(), amount: 15000, status: "PAID", description: "Réparation fuite évier" },
        { date: new Date(Date.now() - 86400000).toISOString(), amount: 50000, status: "PAID", description: "Installation tableau électrique" },
        { date: new Date(Date.now() - 172800000).toISOString(), amount: 25000, status: "PAID", description: "Peinture chambre" },
        { date: new Date(Date.now() - 259200000).toISOString(), amount: 12500, status: "PAID", description: "Nettoyage salon" },
        { date: new Date(Date.now() - 345600000).toISOString(), amount: 30000, status: "PAID", description: "Fabrication étagère" }
      ];

      const testOrders = [
        { 
          id: "ORD_001",
          date: new Date().toISOString(), 
          amount: 250000, 
          status: "PAID", 
          order_type: "TEAM_PROJECT",
          project_status: "Chantier démarré",
          description: "Rénovation complète appartement",
          check_in_at: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
          check_out_at: null,
          team_details: {
            leader_id: "Samba Diallo",
            members: ["Awa Koné", "Moussa Diakité", "Koffi Yao"],
            attendance: {
              "Awa Koné": true,
              "Moussa Diakité": true,
              "Koffi Yao": true
            }
          }
        },
        { 
          id: "ORD_002",
          date: new Date(Date.now() - 43200000).toISOString(), 
          amount: 15000, 
          status: "PAID", 
          order_type: "INDIVIDUAL",
          project_status: "Terminé",
          description: "Dépannage plomberie",
          team_details: null
        }
      ];

      // FINANCIAL CALCULATIONS LOGIC
      const COMMISSION_RATE = 0.20; // APNET 20%
      const LEADER_BONUS_RATE = 0.05; // 5% of Team Pool

      const earningsBreakdown: any[] = [];

      testOrders.forEach(order => {
        const apnetComm = order.amount * COMMISSION_RATE;
        const teamPool = order.amount - apnetComm;
        
        if (order.order_type === 'TEAM_PROJECT' && order.team_details) {
          const leaderBonus = teamPool * LEADER_BONUS_RATE;
          const remainingPool = teamPool - leaderBonus;
          
          // All members + leader take an equal share of the remaining pool
          // Adding 1 for the leader if he is not in the members list, 
          // but usually he IS working too. Let's assume leader + members = total workers.
          const totalWorkers = order.team_details.members.length + 1; 
          const sharePerWorker = remainingPool / totalWorkers;

          // Add earnings for Leader
          earningsBreakdown.push({
            orderId: order.id,
            providerName: order.team_details.leader_id,
            role: 'LEADER',
            baseShare: sharePerWorker,
            bonus: leaderBonus,
            total: sharePerWorker + leaderBonus
          });

          // Add earnings for Members
          order.team_details.members.forEach((m: string) => {
            earningsBreakdown.push({
              orderId: order.id,
              providerName: m,
              role: 'MEMBER',
              baseShare: sharePerWorker,
              bonus: 0,
              total: sharePerWorker
            });
          });
        } else {
          // Individual order: Provider gets the whole team pool
          earningsBreakdown.push({
            orderId: order.id,
            providerName: "Samba Diallo", // Simulated provider for INDIVIDUAL
            role: 'INDIVIDUAL',
            baseShare: teamPool,
            bonus: 0,
            total: teamPool
          });
        }
      });

      const totalRevenue = testTransactions.reduce((sum, t) => sum + t.amount, 0) + testOrders.reduce((sum, o) => sum + o.amount, 0);

      res.json({
        summary: {
          totalProviders: testProviders.length,
          totalRevenue: totalRevenue,
          totalOrders: testOrders.length,
          apnetCommissionTotal: testOrders.reduce((sum, o) => sum + (o.amount * COMMISSION_RATE), 0),
          currency: 'XOF',
          isTestData: true
        },
        providers: testProviders,
        recentTransactions: testTransactions,
        recentOrders: testOrders.map(o => ({
          id: o.id,
          date: o.date,
          amount: o.amount,
          type: o.order_type,
          projectStatus: o.project_status,
          checkIn: o.check_in_at || "Non démarré",
          checkOut: o.check_out_at || "En cours",
          leader: o.team_details?.leader_id || "N/A",
          teamMembers: o.team_details ? o.team_details.members.join(", ") : "N/A",
          attendanceRate: o.team_details?.attendance ? 
            `${Object.values(o.team_details.attendance).filter(v => v).length}/${o.team_details.members.length}` : "N/A"
        })),
        earningsDetails: earningsBreakdown.map(e => ({
          orderId: e.orderId,
          artisan: e.providerName,
          role: e.role,
          partTravail: Math.round(e.baseShare),
          bonusGestion: Math.round(e.bonus),
          gainNet: Math.round(e.total)
        }))
      });
    } catch (error: any) {
      console.error('Sourcetable API Error:', error.message);
      res.status(500).json({ error: 'Failed to fetch dashboard data' });
    }
  });

  /**
   * WORKER PROFILE (QR CODE PRIVACY FIREWALL)
   * Applies visibility rules based on active missions
   */
  app.get('/api/worker/:id', async (req, res) => {
    const workerId = req.params.id;
    const viewerId = req.query.viewerId as string; // Ideally extracted from Auth token in real app

    try {
      // 1. Fetch Worker Data
      const workerDoc = await db.collection('users').doc(workerId).get();
      if (!workerDoc.exists) {
        return res.status(404).json({ error: 'Worker not found' });
      }
      const workerData = workerDoc.data() as any;

      // 2. Check for "Active Mission" link
      let hasLink = false;
      if (viewerId) {
        const activeOrdersSnapshot = await db.collection('orders')
          .where('clientId', '==', viewerId)
          .where('status', 'in', ['PENDING', 'ACCEPTED', 'IN_PROGRESS']) // Expanded status for "active"
          .get();

        hasLink = activeOrdersSnapshot.docs.some(doc => {
          const order = doc.data();
          return order.providerId === workerId || 
                 (order.team_details && order.team_details.leader_id === workerId) ||
                 (order.team_details && order.team_details.members.includes(workerId));
        });
      }

      // 3. Apply Visibility Logic
      if (hasLink) {
        // RULE: "Client Actif" -> Full Profile
        return res.json({
          visibility: 'FULL',
          profile: {
            uid: workerData.uid,
            firstName: workerData.firstName,
            lastName: workerData.lastName || '',
            photoUrl: workerData.photoUrl || 'https://picsum.photos/seed/security/200',
            jobTitle: workerData.jobTitle,
            rating: 4.8, // Simulation
            isVerified: workerData.isVerified,
            canValidateMission: true
          }
        });
      } else {
        // RULE: "Inconnu/Public" -> No Personal Data
        return res.json({
          visibility: 'PUBLIC_LOCKED',
          redirect: '/',
          message: 'Expert certifié APNET en mission. Scannez pour commander nos services.',
          profile: {
            jobTitle: workerData.jobTitle,
            isVerified: workerData.isVerified,
            canValidateMission: false
          }
        });
      }
    } catch (error: any) {
      console.error('Worker Profile Error:', error.message);
      res.status(500).json({ error: 'Failed to apply privacy firewall' });
    }
  });

  /**
   * MISSION MANAGEMENT (LEADER ONLY)
   * Check-in/Pointage and Validation
   */
  app.post('/api/orders/:id/action', async (req, res) => {
    const orderId = req.params.id;
    const { action, memberId, leaderId } = req.body;

    try {
      const orderRef = db.collection('orders').doc(orderId);
      const orderDoc = await orderRef.get();
      
      if (!orderDoc.exists) return res.status(404).json({ error: 'Mission introuvable' });
      const order = orderDoc.data() as any;

      if (order.team_details?.leader_id !== leaderId) {
        return res.status(403).json({ error: 'Action réservée au Chef d\'Équipe' });
      }

      if (action === 'POINTAGE') {
        const attendance = order.team_details.attendance || {};
        attendance[memberId] = true;
        await orderRef.update({ 
          'team_details.attendance': attendance,
          project_status: 'Mobilisation'
        });
        return res.json({ success: true, message: `Présence de ${memberId} validée` });
      }

      if (action === 'START') {
        const members = order.team_details.members;
        const attended = Object.keys(order.team_details.attendance || {}).filter(k => order.team_details.attendance[k]);
        
        if (attended.length < members.length) {
          return res.status(400).json({ error: 'Tous les membres ne sont pas encore pointés' });
        }

        await orderRef.update({
          project_status: 'Chantier démarré',
          check_in_at: admin.firestore.FieldValue.serverTimestamp()
        });
        return res.json({ success: true, message: 'Chantier officiellement démarré' });
      }

      if (action === 'CLOSE') {
        await orderRef.update({
          project_status: 'Terminé',
          check_out_at: admin.firestore.FieldValue.serverTimestamp(),
          status: 'PAID' // Triggers distribution
        });
        return res.json({ 
          success: true, 
          message: 'Chantier clôturé. QR Code de paiement généré.',
          qrCodeData: `PAYMENT_CONFIRM_${orderId}`
        });
      }

      res.status(400).json({ error: 'Action inconnue' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // --- VITE MIDDLEWARE ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
